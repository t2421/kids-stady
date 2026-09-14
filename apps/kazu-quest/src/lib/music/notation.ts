/*
 * BGM の音符記法 (KQ-21)。純ロジック — WebAudio にも Phaser にも依存しない。
 *
 * 1 声部 = 文字列。小節は `|` で区切り、小節内は空白区切りのステップ列
 * (既定は 1 小節 8 ステップ = 8分音符)。
 *   c4 f#4 bb3   音名 (a〜g, # / b, オクターブ 0〜8)
 *   -            休符
 *   ~            直前の音を 1 ステップ伸ばす (タイ)
 * ドラム声部は記号表 (DRUM_SYMBOLS) で `x` = ハイハット / `o` = キック。
 *
 * parseVoice は { freq, startBeat, durBeats } の列に変換する (1 拍 = 4分音符)。
 * 文法エラーは NotationError で投げ、validateSong が文字列に変換して返す。
 */

export interface NoteEvent {
  freq: number;
  startBeat: number;
  durBeats: number;
}

export type VoiceName = "lead" | "bass" | "drum";

export interface CompiledEvent extends NoteEvent {
  voice: VoiceName;
}

export interface SongDef {
  /* 表示用の曲名 (日本語) */
  title: string;
  /* BPM (4分音符) */
  tempo: number;
  /* 1 小節あたりのステップ数 (既定 8 = 8分音符刻み) */
  stepsPerBar?: number;
  lead: string;
  bass: string;
  drum?: string;
}

export interface CompiledSong {
  tempo: number;
  bars: number;
  /* 1 ループの長さ (拍) */
  loopBeats: number;
  /* startBeat 昇順 */
  events: CompiledEvent[];
}

export interface ParsedVoice {
  events: NoteEvent[];
  bars: number;
}

export interface ParseOptions {
  stepsPerBar?: number;
  /* 音名の代わりに使う記号表 (ドラム用)。値はノイズのカットオフ周波数 */
  symbols?: Record<string, number>;
}

export class NotationError extends Error {}

export const DEFAULT_STEPS_PER_BAR = 8;
export const BEATS_PER_BAR = 4;
export const MIN_TEMPO = 60;
export const MAX_TEMPO = 220;
export const MIN_BARS = 8;
export const MAX_BARS = 16;

/* ハイハット = 高いカットオフ / キック = 低いカットオフ (bgm.ts のローパスに渡す) */
export const DRUM_SYMBOLS: Record<string, number> = { x: 7000, o: 320 };

const SEMITONE: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const NOTE_RE = /^([a-g])(#|b)?([0-8])$/;

/* 音名 → 周波数 (a4 = 440Hz)。音名でなければ null */
export function noteToFreq(name: string): number | null {
  const m = NOTE_RE.exec(name);
  if (!m) return null;
  const accidental = m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0;
  const midi = (Number(m[3]) + 1) * 12 + SEMITONE[m[1]] + accidental;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function splitBars(text: string): string[][] {
  const bars = text
    .split("|")
    .map((bar) => bar.trim())
    .map((bar) => (bar === "" ? [] : bar.split(/\s+/)));
  /* 末尾の `|` は許す (最後の空小節を捨てる) */
  if (bars.length > 1 && bars[bars.length - 1].length === 0) bars.pop();
  return bars;
}

function tokenFreq(token: string, symbols: Record<string, number> | undefined): number | null {
  if (symbols) return Object.prototype.hasOwnProperty.call(symbols, token) ? symbols[token] : null;
  return noteToFreq(token);
}

/* 1 声部を解析する。文法エラーは NotationError */
export function parseVoice(text: string, opts: ParseOptions = {}): ParsedVoice {
  const stepsPerBar = opts.stepsPerBar ?? DEFAULT_STEPS_PER_BAR;
  const stepBeats = BEATS_PER_BAR / stepsPerBar;
  const bars = splitBars(text);
  const events: NoteEvent[] = [];
  let last: NoteEvent | null = null;

  bars.forEach((tokens, barIndex) => {
    const barNo = barIndex + 1;
    if (tokens.length !== stepsPerBar) {
      throw new NotationError(
        `bar ${barNo} has ${tokens.length} steps (expected ${stepsPerBar})`,
      );
    }
    tokens.forEach((token, stepIndex) => {
      const startBeat = (barIndex * stepsPerBar + stepIndex) * stepBeats;
      if (token === "-") {
        last = null;
        return;
      }
      if (token === "~") {
        if (!last) throw new NotationError(`bar ${barNo}: tie "~" without a note before it`);
        last.durBeats += stepBeats;
        return;
      }
      const freq = tokenFreq(token, opts.symbols);
      if (freq === null) throw new NotationError(`bar ${barNo}: unknown token "${token}"`);
      last = { freq, startBeat, durBeats: stepBeats };
      events.push(last);
    });
  });

  return { events, bars: bars.length };
}

/* 曲を声部ごとに解析して 1 本の時系列にまとめる。文法・整合エラーは NotationError */
export function compileSong(song: SongDef): CompiledSong {
  if (!Number.isFinite(song.tempo) || song.tempo < MIN_TEMPO || song.tempo > MAX_TEMPO) {
    throw new NotationError(`tempo ${song.tempo} out of range ${MIN_TEMPO}-${MAX_TEMPO}`);
  }
  const stepsPerBar = song.stepsPerBar ?? DEFAULT_STEPS_PER_BAR;
  if (!Number.isInteger(stepsPerBar) || stepsPerBar < 1 || stepsPerBar > 32) {
    throw new NotationError(`stepsPerBar ${stepsPerBar} out of range 1-32`);
  }

  const voices: [VoiceName, string, ParseOptions][] = [
    ["lead", song.lead, { stepsPerBar }],
    ["bass", song.bass, { stepsPerBar }],
  ];
  if (song.drum !== undefined) voices.push(["drum", song.drum, { stepsPerBar, symbols: DRUM_SYMBOLS }]);

  let bars: number | null = null;
  const events: CompiledEvent[] = [];
  for (const [voice, text, opts] of voices) {
    let parsed: ParsedVoice;
    try {
      parsed = parseVoice(text, opts);
    } catch (e) {
      throw new NotationError(`${voice}: ${e instanceof Error ? e.message : String(e)}`);
    }
    if (bars === null) bars = parsed.bars;
    else if (parsed.bars !== bars) {
      throw new NotationError(`${voice} has ${parsed.bars} bars but lead has ${bars}`);
    }
    for (const ev of parsed.events) events.push({ ...ev, voice });
  }
  const barCount = bars ?? 0;
  if (barCount < MIN_BARS || barCount > MAX_BARS) {
    throw new NotationError(`${barCount} bars (expected ${MIN_BARS}-${MAX_BARS})`);
  }

  return {
    tempo: song.tempo,
    bars: barCount,
    loopBeats: barCount * BEATS_PER_BAR,
    events: [...events].sort((a, b) => a.startBeat - b.startBeat),
  };
}

/* テストと起動時チェック用: 問題なければ null、あればメッセージ */
export function validateSong(song: SongDef): string | null {
  try {
    compileSong(song);
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}
