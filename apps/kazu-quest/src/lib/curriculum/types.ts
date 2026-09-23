/*
 * カリキュラムモデル (マスマティクス設計 Part 3 と同型 — docs/kazu-quest-design-plan.md B6)。
 * React / Phaser / DOM に依存しない純関数群。将来 mathematics へコピー可能に保つ。
 */

/*
 * 誤答の型 (LP-03, docs/kazu-quest-learning-tasks.md §1.1)。正典は
 * src/content/lessons/types.ts (LP-01)。ここでは type-only import で
 * 循環参照を避けつつ再 export し、curriculum 配下から `./types` だけで済むようにする
 */
import type { FigureSpec, MistakePattern } from "../../content/lessons/types";
export type { FigureSpec, MistakePattern };

export type Op = "+" | "-" | "×" | "÷" | null;

export interface CherryHint {
  type: "cherry";
  split: { first: number; second: number };
}

export type Hint = CherryHint;

/* かぞえ問題の視覚表現。絵文字は使わず、UI側が自前アイコンで描画する */
export type CountIcon = "apple" | "acorn" | "star" | "fish" | "flower" | "candy";

export interface CountVisual {
  icon: CountIcon;
  count: number;
}

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
  /*
   * 段階ヒント (LP-03): [0]=考え方・[1]=途中まで・[2]=直前。既定値は
   * genericHints() (src/lib/curriculum/hints.ts) が explain から機械的に作り、
   * 手書きした単元だけ上書きする
   */
  hints: [string, string, string];
  /*
   * choices の各誤答が表す誤答パターン (任意)。makeChoicesTagged で作った
   * choices にだけ付く。無い問題は diagnose() が数値差分から推定する
   */
  choiceTags?: [MistakePattern, MistakePattern, MistakePattern];
  /* かぞえ問題のみ: 描画するアイコンと個数 */
  visual?: CountVisual;
  /*
   * 問題を「図」で見せるときの図の仕様 (レッスンと同じ FigureSpec)。
   * 省略した問題も lib/curriculum/figures.ts の figureForProblem() が
   * skillId と a/b から作れるものは作る — ジェネレータ側は「図が
   * a/b から導けない (三角形か平行四辺形か等)」ときだけ明示すればよい。
   * 図は「問題の じょうけん」だけを表し、こたえは見せない。
   */
  figure?: FigureSpec;
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
