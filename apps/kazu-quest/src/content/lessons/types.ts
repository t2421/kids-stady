/*
 * レッスン (学びの設計) のスキーマ。docs/kazu-quest-learning-tasks.md §1.1 の正典。
 * 章データと同じく参照整合性は tests/lessons.test.ts / tests/content.test.ts が守る。
 * 画面 (LP-08〜) や生成器 (LP-02) はここを import するだけで、この型は変えない。
 */

import type { Problem } from "../../lib/curriculum/types";

/* 図の指定 — 視覚モデル部品 (LP-05〜07) が kind で描き分ける */
export type FigureSpec =
  | { kind: "tenFrame"; count: number; second?: number }
  | { kind: "numberLine"; from: number; to: number; step?: number; marks?: number[]; highlight?: [number, number] }
  | { kind: "cherry"; total: number; split: [number, number] } // 既存 CherryDiagram を包む
  | { kind: "columnCalc"; op: "+" | "-" | "×" | "÷"; a: number; b: number; showCarry?: boolean; revealSteps?: number }
  | { kind: "array"; rows: number; cols: number; groupBy?: "row" | "col"; remainder?: number }
  | { kind: "kukuTable"; highlightRow?: number; highlightCol?: number }
  | { kind: "fractionBar"; parts: number; filled: number; second?: { parts: number; filled: number } }
  | { kind: "placeValue"; value: string; highlightDigit?: number } // "3.25" "12000000"
  | { kind: "areaGrid"; w: number; h: number; unit?: string; shape?: "rect" | "triangle" | "parallelogram" }
  | { kind: "protractor"; angle: number; showReading?: boolean }
  | { kind: "clock"; hour: number; minute: number; second?: { hour: number; minute: number } }
  | { kind: "percentBar"; base: number; part: number; label?: string }
  | { kind: "tapeDiagram"; segments: { label: string; length: number }[]; total?: string }
  | { kind: "treeDiagram"; levels: string[][] }
  | { kind: "letterBox"; expr: string; value?: number } // "□ + 3 = 8"
  | { kind: "balance"; left: { label: string; weight: number }[]; right: { label: string; weight: number }[] }
  | { kind: "measureCup"; capacityDl: number; filledDl: number };

/* FigureSpec の kind をすべて集めた集合。バリデーションで使う */
export const FIGURE_KINDS: readonly FigureSpec["kind"][] = [
  "tenFrame",
  "numberLine",
  "cherry",
  "columnCalc",
  "array",
  "kukuTable",
  "fractionBar",
  "placeValue",
  "areaGrid",
  "protractor",
  "clock",
  "percentBar",
  "tapeDiagram",
  "treeDiagram",
  "letterBox",
  "balance",
  "measureCup",
];

/* 誤答の型。choices の各誤答に付け、選ばれた誤答から一言を出す */
export type MistakePattern =
  | "offByOne"
  | "forgotCarry"
  | "forgotBorrow"
  | "echoOperand"
  | "neighborRow"
  | "placeShift"
  | "addedDenominators"
  | "noCommonDenominator"
  | "swappedBase"
  | "reversedDivision"
  | "doubleCounted"
  | "unitConfusion"
  | "other";

export const MISTAKE_PATTERNS: readonly MistakePattern[] = [
  "offByOne",
  "forgotCarry",
  "forgotBorrow",
  "echoOperand",
  "neighborRow",
  "placeShift",
  "addedDenominators",
  "noCommonDenominator",
  "swappedBase",
  "reversedDivision",
  "doubleCounted",
  "unitConfusion",
  "other",
];

export interface LevelSpec {
  level: 1 | 2 | 3;
  label: string; // 「九九の はんい」など
}

export interface LessonPage {
  text: string;
  figure?: FigureSpec;
}

export interface LessonDef {
  skillId: string;
  title: string;
  prerequisites: string[]; // skillId。空でよい
  story: { pages: string[] }; // 町の困りごと (1〜3)
  concept: LessonPage[]; // 2〜4
  workedExample: { problem: Problem; steps: LessonPage[] }; // 2〜5 ステップ
  faded: { problem: Problem; blanks: number }[]; // 2〜3
  levels: [LevelSpec, LevelSpec, LevelSpec];
  altExplain: LessonPage[]; // 2回目の説明 (1〜3)
  mistakes: { pattern: MistakePattern; feedback: string }[];
  /* 章の中核3単元なら true (救済3段の対象になる) */
  coreOfChapter?: boolean;
  /* 単元マップ・レッスン画面でのなかまの一言。memberId → 台詞 (未使用単元は省略可) */
  companionLines?: Record<string, string>;
}

/*
 * 単元の習熟状態。§1.2 (save.mastery) の正典は LP-04 が src/lib/save.ts に置く。
 * LP-04 がブロックされないよう、ここで構造的に同一の型を先に定義しておく。
 * LP-04 は自身の型をこれと構造的に一致させるか、ここから re-export すること。
 */
export type MasteryState = "none" | "practicing" | "can" | "mastered";
