/*
 * WebAudio 合成の効果音 (音源ファイル 0 の方針 — KQ-20)。
 * mathematics の sfx.ts (OscillatorNode ベース) の考え方をコピーして独立させ、
 * 音色はファミコン風 (矩形波・三角波・LFSR ノイズ) に作り直した。定義は sfxTable.ts。
 *
 * - AudioContext は 1 つを遅延生成し、最初の pointerdown/touchend/keydown で resume する
 *   (iOS Safari はユーザー操作なしに音を出せない)。installSfxUnlock() は何度呼んでも 1 回
 *   だけ登録される (PhaserGame のマウント時と、このモジュールの最初の呼び出しから)
 * - playSfx は決して throw しない (AudioContext 不在・suspended・未知の名前は無音)
 * - おん/オフはセーブの settings.sound (既定 true)
 *
 * このモジュールは Phaser に依存しない純粋な音ユーティリティなので、React コンポーネントから
 * 直接 import してよい。EventBus 経由の間接化は React↔Phaser の「状態」のやり取りのための
 * 決まりで、副作用だけのこのモジュールには不要 (両側から呼べる共有ユーティリティ扱い)。
 */

import { autosave, getSave, updateSave } from "../session";
import { SFX_TABLE, type SfxName, type SfxVoice } from "./sfxTable";

export type { SfxName } from "./sfxTable";

const UNLOCK_EVENTS = ["pointerdown", "touchend", "keydown"] as const;

let ctx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;
let unlockInstalled = false;

/* ---------- おん/オフ (セーブ連動) ---------- */

export function isSoundEnabled(): boolean {
  try {
    return getSave().settings.sound;
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  updateSave((s) => ({ ...s, settings: { ...s.settings, sound: enabled } }));
  autosave();
  if (enabled) resumeContext();
}

/* ---------- AudioContext ---------- */

function audioContextCtor(): typeof AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  return (
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  );
}

function ensureContext(): AudioContext | null {
  if (ctx) return ctx;
  try {
    const AC = audioContextCtor();
    if (!AC) return null;
    ctx = new AC();
  } catch {
    ctx = null;
  }
  return ctx;
}

/* BGM (bgm.ts) と共有する AudioContext。生成できない環境では null */
export function getAudioContext(): AudioContext | null {
  return ensureContext();
}

function resumeContext(): void {
  const c = ensureContext();
  if (!c) return;
  try {
    if (c.state === "suspended") void c.resume().catch(() => {});
  } catch {
    /* noop */
  }
}

/* 最初のユーザー操作で AudioContext を起こすリスナー。running になったら外す */
export function installSfxUnlock(): void {
  if (unlockInstalled || typeof window === "undefined") return;
  unlockInstalled = true;
  const onGesture = () => {
    resumeContext();
    if (ctx && ctx.state === "running") {
      for (const ev of UNLOCK_EVENTS) window.removeEventListener(ev, onGesture);
    }
  };
  for (const ev of UNLOCK_EVENTS) {
    window.addEventListener(ev, onGesture, { passive: true });
  }
}

/* ---------- 合成 ---------- */

/* ファミコンの 15bit LFSR ノイズ (帰還 = bit0 xor bit1) を 1 秒ぶん焼いておく。BGM のドラムと共有 */
export function getNoiseBuffer(c: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const length = c.sampleRate;
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  let lfsr = 1;
  for (let i = 0; i < length; i++) {
    const feedback = (lfsr ^ (lfsr >> 1)) & 1;
    lfsr = (lfsr >> 1) | (feedback << 14);
    data[i] = lfsr & 1 ? 1 : -1;
  }
  noiseBuffer = buffer;
  return buffer;
}

function applyGainEnvelope(gain: GainNode, voice: SfxVoice, t0: number): void {
  const g = Math.max(0.001, voice.gain);
  const end = t0 + voice.duration;
  gain.gain.setValueAtTime(g, t0);
  if (voice.gate) {
    for (const step of voice.steps.slice(1)) {
      const at = t0 + step.at;
      gain.gain.setValueAtTime(0.001, Math.max(t0, at - 0.012));
      gain.gain.setValueAtTime(g, at);
    }
  }
  gain.gain.setValueAtTime(g, Math.max(t0, end - voice.duration * 0.4));
  gain.gain.exponentialRampToValueAtTime(0.001, end);
}

function playToneVoice(c: AudioContext, voice: SfxVoice, t0: number): void {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = voice.wave === "triangle" ? "triangle" : "square";
  for (const step of voice.steps) {
    osc.frequency.setValueAtTime(step.freq, t0 + step.at);
  }
  applyGainEnvelope(gain, voice, t0);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + voice.duration);
}

function playNoiseVoice(c: AudioContext, voice: SfxVoice, t0: number): void {
  const source = c.createBufferSource();
  source.buffer = getNoiseBuffer(c);
  source.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 1;
  for (const step of voice.steps) {
    filter.frequency.setValueAtTime(step.freq, t0 + step.at);
  }
  const gain = c.createGain();
  applyGainEnvelope(gain, voice, t0);
  source.connect(filter).connect(gain).connect(c.destination);
  source.start(t0);
  source.stop(t0 + voice.duration);
}

function playVoice(c: AudioContext, voice: SfxVoice): void {
  const t0 = c.currentTime + (voice.delay ?? 0);
  if (voice.wave === "noise") playNoiseVoice(c, voice, t0);
  else playToneVoice(c, voice, t0);
}

/* 効果音を鳴らす。失敗しても呼び出し側 (シーン・React) を巻き込まない */
export function playSfx(name: SfxName): void {
  try {
    const spec = SFX_TABLE[name];
    if (!spec || !isSoundEnabled()) return;
    installSfxUnlock();
    const c = ensureContext();
    if (!c) return;
    if (c.state !== "running") {
      resumeContext();
      return;
    }
    for (const voice of spec.voices) playVoice(c, voice);
  } catch {
    /* noop: 音は演出なので黙って捨てる */
  }
}
