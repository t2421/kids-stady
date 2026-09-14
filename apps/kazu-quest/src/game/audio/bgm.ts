/*
 * チップチューン BGM シーケンサ (音源ファイル 0 — KQ-21)。
 * mathematics の bgm.ts (2 チャンネル・ステップシーケンサ) の考え方をコピーして独立させ、
 * 曲データは src/content/music.ts の記法 (src/lib/music/notation.ts で解析) に置き換えた。
 *
 * - 先読みスケジューリング: setInterval 100ms のたびに AudioContext.currentTime から
 *   300ms 先までの音符を予約する (JS タイマーの揺れを WebAudio の時計で吸収)
 * - playBgm(同じ曲) は何もしない。違う曲なら 300ms クロスフェード (レイヤーごとの GainNode)
 * - おん/オフは sfx.ts の isSoundEnabled() を tick で見る: オフでフェードアウト、
 *   オンに戻れば要求中の曲を再開する (StatusPanelOverlay 側は setSoundEnabled を呼ぶだけ)
 * - AudioContext が無い / suspended (iOS の最初のタップ前) でも決して throw しない。
 *   running になった tick から鳴り始める
 * - window.__KAZUQUEST_BGM__ = { current } を E2E 用に公開 (要求中の曲 ID。無害)
 */

import { SONGS, type SongId } from "../../content/music";
import { compileSong, type CompiledEvent, type CompiledSong } from "../../lib/music/notation";
import { getAudioContext, getNoiseBuffer, installSfxUnlock, isSoundEnabled } from "./sfx";

export type { SongId } from "../../content/music";

const TICK_MS = 100;
const LOOKAHEAD_S = 0.3;
const CROSSFADE_MS = 300;
const LEAD_GAIN = 0.05;
const BASS_GAIN = 0.08;
const DRUM_GAIN = 0.03;
/* ドラムはステップ長に関係なく短く切る */
const DRUM_MAX_S = 0.07;

interface Layer {
  songId: SongId;
  song: CompiledSong;
  master: GainNode;
  /* ループ 0 の開始時刻 (AudioContext 時計) */
  startTime: number;
  loopIndex: number;
  eventIndex: number;
}

const compiled = new Map<SongId, CompiledSong>();
let requested: SongId | null = null;
let layer: Layer | null = null;
let timer: ReturnType<typeof setInterval> | null = null;

/* ---------- 公開 API ---------- */

export function currentBgm(): SongId | null {
  return requested;
}

/* 曲を要求する。同じ曲なら継続、違えば次の tick でクロスフェード */
export function playBgm(songId: SongId): void {
  try {
    if (!SONGS[songId]) return;
    requested = songId;
    installSfxUnlock();
    ensureTimer();
  } catch {
    /* noop */
  }
}

export function stopBgm(fadeMs = CROSSFADE_MS): void {
  try {
    requested = null;
    if (layer) fadeOutLayer(layer, fadeMs);
    layer = null;
  } catch {
    /* noop */
  }
}

/* ---------- スケジューラ ---------- */

function ensureTimer(): void {
  if (timer !== null || typeof window === "undefined") return;
  timer = setInterval(tick, TICK_MS);
}

function clearTimer(): void {
  if (timer === null) return;
  clearInterval(timer);
  timer = null;
}

function tick(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (requested === null || !isSoundEnabled()) {
      if (layer) fadeOutLayer(layer, CROSSFADE_MS);
      layer = null;
      if (requested === null) clearTimer();
      return;
    }
    /* iOS: 最初のタップで unlock されるまで待つ (時計が進まないので予約しない) */
    if (ctx.state !== "running") return;
    if (!layer || layer.songId !== requested) {
      const previous = layer;
      layer = startLayer(ctx, requested);
      if (previous) fadeOutLayer(previous, CROSSFADE_MS);
      if (!layer) return;
    }
    scheduleAhead(ctx, layer);
  } catch {
    /* noop: 音は演出 */
  }
}

function getCompiled(songId: SongId): CompiledSong | null {
  const cached = compiled.get(songId);
  if (cached) return cached;
  try {
    const song = compileSong(SONGS[songId]);
    compiled.set(songId, song);
    return song;
  } catch {
    return null;
  }
}

function startLayer(ctx: AudioContext, songId: SongId): Layer | null {
  const song = getCompiled(songId);
  if (!song) return null;
  const master = ctx.createGain();
  const now = ctx.currentTime;
  master.gain.setValueAtTime(0.001, now);
  master.gain.linearRampToValueAtTime(1, now + CROSSFADE_MS / 1000);
  master.connect(ctx.destination);
  return { songId, song, master, startTime: now + 0.05, loopIndex: 0, eventIndex: 0 };
}

function fadeOutLayer(target: Layer, fadeMs: number): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const seconds = Math.max(0.02, fadeMs / 1000);
  target.master.gain.cancelScheduledValues(now);
  target.master.gain.setValueAtTime(target.master.gain.value, now);
  target.master.gain.linearRampToValueAtTime(0.001, now + seconds);
  setTimeout(() => {
    try {
      target.master.disconnect();
    } catch {
      /* noop */
    }
  }, fadeMs + 50);
}

function eventTime(active: Layer, ev: CompiledEvent): number {
  const secPerBeat = 60 / active.song.tempo;
  return active.startTime + (active.loopIndex * active.song.loopBeats + ev.startBeat) * secPerBeat;
}

/* currentTime + LOOKAHEAD までの音符を予約する。ループ末尾で先頭に戻る */
function scheduleAhead(ctx: AudioContext, active: Layer): void {
  const { events } = active.song;
  if (events.length === 0) return;
  const horizon = ctx.currentTime + LOOKAHEAD_S;
  /* タブが眠っていた等で大きく遅れていたら、過去の音符は捨てて今から続ける */
  let guard = 0;
  while (guard++ < 512) {
    const ev = events[active.eventIndex];
    const at = eventTime(active, ev);
    if (at >= horizon) return;
    if (at >= ctx.currentTime) scheduleEvent(ctx, active, ev, at);
    active.eventIndex += 1;
    if (active.eventIndex >= events.length) {
      active.eventIndex = 0;
      active.loopIndex += 1;
    }
  }
}

function scheduleEvent(ctx: AudioContext, active: Layer, ev: CompiledEvent, at: number): void {
  const secPerBeat = 60 / active.song.tempo;
  const dur = ev.durBeats * secPerBeat;
  if (ev.voice === "drum") scheduleDrum(ctx, active.master, ev.freq, at, Math.min(dur, DRUM_MAX_S));
  else scheduleTone(ctx, active.master, ev, at, dur);
}

function scheduleTone(
  ctx: AudioContext,
  out: GainNode,
  ev: CompiledEvent,
  at: number,
  dur: number,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const vol = ev.voice === "lead" ? LEAD_GAIN : BASS_GAIN;
  osc.type = ev.voice === "lead" ? "square" : "triangle";
  osc.frequency.setValueAtTime(ev.freq, at);
  /* 音符の後ろ 3 割で減衰させ、次の音とのつなぎ目に隙間を作る */
  const release = at + dur * 0.7;
  gain.gain.setValueAtTime(vol, at);
  gain.gain.setValueAtTime(vol, release);
  gain.gain.exponentialRampToValueAtTime(0.001, at + dur);
  osc.connect(gain).connect(out);
  osc.start(at);
  osc.stop(at + dur);
}

function scheduleDrum(ctx: AudioContext, out: GainNode, cutoff: number, at: number, dur: number): void {
  const source = ctx.createBufferSource();
  source.buffer = getNoiseBuffer(ctx);
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 0.8;
  filter.frequency.setValueAtTime(cutoff, at);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(DRUM_GAIN, at);
  gain.gain.exponentialRampToValueAtTime(0.001, at + dur);
  source.connect(filter).connect(gain).connect(out);
  source.start(at);
  source.stop(at + dur);
}

/* ---------- E2E フック ---------- */

if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__KAZUQUEST_BGM__ = { current: currentBgm };
}
