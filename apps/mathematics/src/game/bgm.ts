/*
 * 8bit風BGMエンジン (音源ファイルなし、WebAudio合成)。
 * 矩形波メロディ + 三角波ベースの2チャンネル・ステップシーケンサ。
 * 使い方: bgm.play("flight") / bgm.stop()。AudioContext 解放前の呼び出しは
 * 記憶しておき、最初のユーザー操作 (initAudio) 後に自動で鳴り始める。
 */

import { getAudioContext, onAudioReady } from "./sfx";

type TrackName = "menu" | "flight" | "boss";

interface TrackDef {
  bpm: number; // 8分音符を1ステップとする
  melody: (string | null)[];
  bass: (string | null)[];
  melodyVol: number;
  bassVol: number;
}

const NOTE_OFFSET: Record<string, number> = {
  C: -9, "C#": -8, D: -7, "D#": -6, E: -5, F: -4,
  "F#": -3, G: -2, "G#": -1, A: 0, "A#": 1, B: 2,
};

function noteFreq(note: string): number {
  const m = note.match(/^([A-G]#?)(\d)$/);
  if (!m) return 440;
  const semitone = NOTE_OFFSET[m[1]] + (Number(m[2]) - 4) * 12;
  return 440 * Math.pow(2, semitone / 12);
}

const TRACKS: Record<TrackName, TrackDef> = {
  /* ほのぼの (タイトル・マップ・格納庫) */
  menu: {
    bpm: 104,
    melodyVol: 0.045,
    bassVol: 0.05,
    melody: [
      "C5", "E5", "G5", "C6", "B5", "G5", "E5", "G5",
      "A5", "F5", "C5", "F5", "G5", "E5", "C5", "E5",
      "C5", "E5", "G5", "C6", "B5", "G5", "E5", "G5",
      "A5", "B5", "C6", "B5", "G5", null, "E5", null,
    ],
    bass: [
      "C3", null, "G3", null, "E3", null, "G3", null,
      "F3", null, "C3", null, "G3", null, "C3", null,
      "C3", null, "G3", null, "E3", null, "G3", null,
      "F3", null, "G3", null, "C3", null, null, null,
    ],
  },
  /* 疾走 (飛行パート) */
  flight: {
    bpm: 148,
    melodyVol: 0.05,
    bassVol: 0.055,
    melody: [
      "A4", "C5", "E5", "A5", "G5", "E5", "C5", "E5",
      "F5", "A5", "C6", "A5", "G5", "E5", "D5", "E5",
      "A4", "C5", "E5", "A5", "B5", "A5", "G5", "E5",
      "F5", "G5", "A5", "B5", "C6", "B5", "A5", "G5",
    ],
    bass: [
      "A2", "A3", "A2", "A3", "A2", "A3", "A2", "A3",
      "F2", "F3", "F2", "F3", "F2", "F3", "F2", "F3",
      "C3", "C4", "C3", "C4", "C3", "C4", "C3", "C4",
      "G2", "G3", "G2", "G3", "G2", "G3", "G2", "G3",
    ],
  },
  /* 緊迫 (ボス戦) */
  boss: {
    bpm: 156,
    melodyVol: 0.05,
    bassVol: 0.06,
    melody: [
      "D5", "F5", "G#5", "F5", "D5", "F5", "A5", "G#5",
      "D5", "F5", "G#5", "F5", "C6", "B5", "A5", "G#5",
      "D5", "F5", "G#5", "F5", "D5", "F5", "A5", "G#5",
      "D6", "C6", "B5", "A5", "G#5", "F5", "E5", "D5",
    ],
    bass: [
      "D2", "D3", "D2", "D3", "D2", "D3", "D2", "D3",
      "F2", "F3", "F2", "F3", "E2", "E3", "E2", "E3",
      "D2", "D3", "D2", "D3", "D2", "D3", "D2", "D3",
      "A#2", "A#3", "A2", "A3", "G#2", "G#3", "A2", "A3",
    ],
  },
};

let current: TrackName | null = null;
let step = 0;
let nextTime = 0;
let timer: number | null = null;

function scheduleNote(
  ctx: AudioContext,
  freq: number,
  when: number,
  dur: number,
  type: OscillatorType,
  vol: number,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  gain.gain.setValueAtTime(vol, when);
  gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(when);
  osc.stop(when + dur);
}

/* 先読みスケジューラ: 250ms先まで予約しておく */
function tick() {
  const ctx = getAudioContext();
  if (!ctx || !current) return;
  const track = TRACKS[current];
  const stepDur = 60 / track.bpm / 2; // 8分音符
  if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05;
  while (nextTime < ctx.currentTime + 0.25) {
    const m = track.melody[step % track.melody.length];
    const b = track.bass[step % track.bass.length];
    if (m) scheduleNote(ctx, noteFreq(m), nextTime, stepDur * 0.9, "square", track.melodyVol);
    if (b) scheduleNote(ctx, noteFreq(b), nextTime, stepDur * 0.95, "triangle", track.bassVol);
    nextTime += stepDur;
    step++;
  }
}

function ensureTimer() {
  if (timer !== null) return;
  timer = window.setInterval(tick, 100);
}

export const bgm = {
  play(name: TrackName) {
    if (current === name) return;
    current = name;
    step = 0;
    nextTime = 0;
    ensureTimer();
    onAudioReady(() => ensureTimer());
  },
  stop() {
    current = null;
  },
};
