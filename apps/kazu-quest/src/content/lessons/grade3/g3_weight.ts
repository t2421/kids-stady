/*
 * g3_weight (重さ kg/g) — ワケーラの いちばで こうりょうの おもさを はかる 物語フック。
 * (ひらがな分かち書き。§1.7 逸脱の理由は g3_div.ts コメント参照)
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";

const WORKED_PROBLEM: Problem = {
  skillId: "g3_weight",
  text: "5kg800g は なんg?",
  a: 5,
  b: 800,
  op: null,
  answer: "5800",
  choices: ["1300", "5800", "5000"],
  hint: null,
  explain: ["5kg = 5000g", "5000g + 800g = 5800g"],
  hints: ["じゅんばんに かんがえてみよう", "5kg = 5000g", "5kg = 5000g 5000g + 800g = 5800g"],
};

const FADED_1: Problem = {
  skillId: "g3_weight",
  text: "2kg は なんg?",
  a: 2,
  b: null,
  op: null,
  answer: "2000",
  choices: ["20000", "2000", "200"],
  hint: null,
  explain: ["1kg = 1000g だから", "2kg = 2000g"],
  hints: ["じゅんばんに かんがえてみよう", "1kg = 1000g だから", "1kg = 1000g だから 2kg = 2000g"],
};

const FADED_2: Problem = {
  skillId: "g3_weight",
  text: "8kg は なんg?",
  a: 8,
  b: null,
  op: null,
  answer: "8000",
  choices: ["9000", "800", "8000"],
  hint: null,
  explain: ["1kg = 1000g だから", "8kg = 8000g"],
  hints: ["じゅんばんに かんがえてみよう", "1kg = 1000g だから", "1kg = 1000g だから 8kg = 8000g"],
};

export const G3_WEIGHT: LessonDef = {
  skillId: "g3_weight",
  title: "重さ (kg/g)",
  prerequisites: [],
  story: {
    pages: [
      "いちばで こうりょうの ふくろの おもさを はかりたいよ。",
      "kgと gの かんけいが わからず、いくらぶんか こまったよ。",
    ],
  },
  concept: [
    {
      text: "1kgと 1000gは おなじ おもさだよ",
      figure: {
        kind: "balance",
        left: [{ label: "1kg", weight: 1 }],
        right: [{ label: "1000g", weight: 1 }],
      },
    },
    {
      text: "1000gずつ めもりが すすむよ",
      figure: { kind: "numberLine", from: 0, to: 5000, step: 1000, marks: [3000] },
    },
    { text: "1kg = 1000g だから kgを gに なおせるよ" },
  ],
  workedExample: {
    problem: WORKED_PROBLEM,
    steps: [
      {
        text: "5kgは 5000gと おなじだよ",
        figure: {
          kind: "balance",
          left: [{ label: "5kg", weight: 5 }],
          right: [{ label: "5000g", weight: 5 }],
        },
      },
      { text: "5000gに 800gを たすよ" },
      { text: "5000 + 800 = 5800gだね" },
    ],
  },
  faded: [
    { problem: FADED_1, blanks: 1 },
    { problem: FADED_2, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "ちいさい かずの kgと g" },
    { level: 2, label: "kgを gに なおす けいさん" },
    { level: 3, label: "2けたの kgの けいさん" },
  ],
  altExplain: [
    { text: "べつの せつめい: 1000gを 1つの かたまりと かんがえよう" },
    { text: "かたまりの かずが kgの かずに なるよ" },
  ],
  mistakes: [
    { pattern: "unitConfusion", feedback: "kgと gを とりちがえていないか たしかめよう" },
    { pattern: "placeShift", feedback: "0の かずを まちがえていないか たしかめよう" },
    { pattern: "other", feedback: "kgの ぶんと gの ぶんを たしわすれていないか たしかめよう" },
  ],
};
