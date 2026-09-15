/*
 * g3_big_number (大きい数 万) — ワケーラの いちばで きんかを かぞえる 物語フック。
 * (ひらがな分かち書き。§1.7 逸脱の理由は g3_div.ts コメント参照)
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";

const WORKED_PROBLEM: Problem = {
  skillId: "g3_big_number",
  text: "50000 は 1000が いくつ分?",
  a: 50000,
  b: 1000,
  op: "÷",
  answer: "50",
  choices: ["5", "500", "50"],
  hint: null,
  explain: ["1000が 10こで 10000", "50000 は 1000が 50こ分"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "1000が 10こで 10000",
    "1000が 10こで 10000 50000 は 1000が 50こ分",
  ],
};

const FADED_1: Problem = {
  skillId: "g3_big_number",
  text: "10000が 2こで いくつ?",
  a: 2,
  b: 10000,
  op: "×",
  answer: "20000",
  choices: ["200000", "20000", "2000"],
  hint: null,
  explain: ["10000の 2こ分だから", "10000 × 2 = 20000"],
  hints: ["じゅんばんに かんがえてみよう", "10000の 2こ分だから", "10000の 2こ分だから 10000 × 2 = 20000"],
};

const FADED_2: Problem = {
  skillId: "g3_big_number",
  text: "10000が 8こで いくつ?",
  a: 8,
  b: 10000,
  op: "×",
  answer: "80000",
  choices: ["90000", "8000", "80000"],
  hint: null,
  explain: ["10000の 8こ分だから", "10000 × 8 = 80000"],
  hints: ["じゅんばんに かんがえてみよう", "10000の 8こ分だから", "10000の 8こ分だから 10000 × 8 = 80000"],
};

export const G3_BIG_NUMBER: LessonDef = {
  skillId: "g3_big_number",
  title: "大きい数 (万)",
  prerequisites: [],
  story: {
    pages: [
      "いちばで きんかを かぞえたら、1まんを こえる かずに なったよ。",
      "おおきすぎて、いままでの かぞえかたでは たいへんだよ。",
    ],
  },
  concept: [
    {
      text: "50000は 1000が 50こ分だよ",
      figure: { kind: "placeValue", value: "50000", highlightDigit: 1 },
    },
    {
      text: "1まんずつ めもりを すすめていくよ",
      figure: { kind: "numberLine", from: 0, to: 100000, step: 10000, highlight: [40000, 50000] },
    },
    { text: "10000が 10こで 10まん に なるよ" },
  ],
  workedExample: {
    problem: WORKED_PROBLEM,
    steps: [
      {
        text: "50000の かずを みてみよう",
        figure: { kind: "placeValue", value: "50000" },
      },
      { text: "1000が 10こで 10000だね" },
      { text: "50000は 1000が 50こ分だよ" },
    ],
  },
  faded: [
    { problem: FADED_1, blanks: 1 },
    { problem: FADED_2, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "ちいさい まんの かず" },
    { level: 2, label: "まんの くらいの けいさん" },
    { level: 3, label: "じゅうまんまでの おおきい かず" },
  ],
  altExplain: [
    { text: "べつの せつめい: 4けたごとに くらいを くぎって よもう" },
    { text: "いち・じゅう・ひゃく・せんの つぎは まんに なるよ" },
  ],
  mistakes: [
    { pattern: "placeShift", feedback: "くらいが 1つ ずれていないか たしかめよう" },
    { pattern: "offByOne", feedback: "10000の こすうを かぞえまちがえていないか たしかめよう" },
    { pattern: "other", feedback: "0の かずを かぞえまちがえていないか たしかめよう" },
  ],
};
