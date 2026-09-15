/*
 * g3_mul_column (かけ算の ひっ算) — ワケーラの すなれんが こうぼうを 舞台にした単元。
 * (ひらがな分かち書き。§1.7 逸脱の理由は g3_div.ts コメント参照)
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";

const WORKED_PROBLEM: Problem = {
  skillId: "g3_mul_column",
  text: "ひっさんで けいさんしよう\n65 × 8 = ?",
  a: 65,
  b: 8,
  op: "×",
  answer: "520",
  choices: ["530", "521", "520"],
  hint: null,
  explain: ["一のくらい: 5 × 8 = 40", "十のくらい: 6 × 8 = 48 (480)", "480 + 40 = 520"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "一のくらい: 5 × 8 = 40",
    "一のくらい: 5 × 8 = 40 十のくらい: 6 × 8 = 48 (480) 480 + 40 = 520",
  ],
};

const FADED_1: Problem = {
  skillId: "g3_mul_column",
  text: "ひっさんで けいさんしよう\n11 × 9 = ?",
  a: 11,
  b: 9,
  op: "×",
  answer: "99",
  choices: ["89", "99", "109"],
  hint: null,
  explain: ["一のくらい: 1 × 9 = 9", "十のくらい: 1 × 9 = 9 (90)", "90 + 9 = 99"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "一のくらい: 1 × 9 = 9",
    "一のくらい: 1 × 9 = 9 十のくらい: 1 × 9 = 9 (90) 90 + 9 = 99",
  ],
};

const FADED_2: Problem = {
  skillId: "g3_mul_column",
  text: "ひっさんで けいさんしよう\n38 × 6 = ?",
  a: 38,
  b: 6,
  op: "×",
  answer: "228",
  choices: ["229", "238", "228"],
  hint: null,
  explain: ["一のくらい: 8 × 6 = 48", "十のくらい: 3 × 6 = 18 (180)", "180 + 48 = 228"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "一のくらい: 8 × 6 = 48",
    "一のくらい: 8 × 6 = 48 十のくらい: 3 × 6 = 18 (180) 180 + 48 = 228",
  ],
};

export const G3_MUL_COLUMN: LessonDef = {
  skillId: "g3_mul_column",
  title: "かけ算の ひっ算",
  prerequisites: ["g2_kuku"],
  story: {
    pages: [
      "すなの れんがを つくる こうぼうで、れんがの かずを かぞえたいよ。",
      "1れつずつ かぞえるのは たいへん。はやく かぞえる ほうほうは ないかな。",
    ],
  },
  concept: [
    {
      text: "ひっさんで かければ はやく かぞえられるよ",
      figure: { kind: "columnCalc", op: "×", a: 23, b: 4, showCarry: true },
    },
    {
      text: "4れつ 3こずつで 12こ ぶんだよ",
      figure: { kind: "array", rows: 4, cols: 3, groupBy: "row" },
    },
    { text: "いちのくらいから じゅんばんに かけていくよ" },
  ],
  workedExample: {
    problem: WORKED_PROBLEM,
    steps: [
      {
        text: "いちのくらい 5 × 8 = 40",
        figure: { kind: "columnCalc", op: "×", a: 65, b: 8, showCarry: true, revealSteps: 1 },
      },
      {
        text: "じゅうのくらい 6 × 8 = 48",
        figure: { kind: "columnCalc", op: "×", a: 65, b: 8, showCarry: true, revealSteps: 2 },
      },
      { text: "480 + 40 = 520 が こたえだよ" },
    ],
  },
  faded: [
    { problem: FADED_1, blanks: 1 },
    { problem: FADED_2, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "ちいさい 2けた × ひとけた" },
    { level: 2, label: "2けた × ひとけたの ひっさん" },
    { level: 3, label: "3けた × ひとけたの ひっさん" },
  ],
  altExplain: [
    { text: "べつの せつめい: くらいごとに わけて かけてから たそう" },
    { text: "じゅうのくらいと いちのくらいを べつべつに けいさんするよ" },
  ],
  mistakes: [
    { pattern: "forgotCarry", feedback: "くりあがりを たしわすれて いないか たしかめよう" },
    { pattern: "offByOne", feedback: "10 おおいか すくないよ。もういちど けいさんしよう" },
    { pattern: "echoOperand", feedback: "かける かずを そのまま こたえに していないか たしかめよう" },
  ],
};
