/*
 * カリキュラムモデル (マスマティクス設計 Part 3 と同型 — docs/kazu-quest-design-plan.md B6)。
 * React / Phaser / DOM に依存しない純関数群。将来 mathematics へコピー可能に保つ。
 */

export type Op = "+" | "-" | "×" | "÷" | null;

export interface CherryHint {
  type: "cherry";
  split: { first: number; second: number };
}

export type Hint = CherryHint;

export interface Problem {
  skillId: string;
  text: string;
  /* さくらんぼ図・ひっ算図用の構造 (該当しない問題は null) */
  a: number | null;
  b: number | null;
  op: Op;
  /* 文字列統一 — 将来 "1/2" "0.6" に対応するため */
  answer: string;
  choices: [string, string, string];
  hint: Hint | null;
  explain: string[];
}

/* 疑似乱数 (seed 注入でテスト再現可能) */
export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface SkillInfo {
  id: string;
  grade: number;
  label: string;
  /* 問題ジェネレータ実装済みか (未実装スキルは出題候補にしない) */
  implemented: boolean;
}
