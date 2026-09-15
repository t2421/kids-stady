/*
 * g3_decimal (小数の たしひき) — さばくを わたる みずの りょうを はかる 物語フック。
 * (ひらがな分かち書き。§1.7 逸脱の理由は g3_div.ts コメント参照)
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";

const WORKED_PROBLEM: Problem = {
  skillId: "g3_decimal",
  text: "1.2 - 1 = ?",
  a: 12,
  b: 10,
  op: "-",
  answer: "0.2",
  choices: ["0.02", "0.2", "2"],
  hint: null,
  explain: ["0.1が 12こから 10こ ひく", "のこりは 0.1が 2こ", "だから 0.2"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "0.1が 12こから 10こ ひく",
    "0.1が 12こから 10こ ひく のこりは 0.1が 2こ だから 0.2",
  ],
};

const FADED_1: Problem = {
  skillId: "g3_decimal",
  text: "0.2 + 1.2 = ?",
  a: 2,
  b: 12,
  op: "+",
  answer: "1.4",
  choices: ["14", "1.4", "0.14"],
  hint: null,
  explain: ["0.1が 2こと 12こ", "あわせて 0.1が 14こ", "だから 1.4"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "0.1が 2こと 12こ",
    "0.1が 2こと 12こ あわせて 0.1が 14こ だから 1.4",
  ],
};

const FADED_2: Problem = {
  skillId: "g3_decimal",
  text: "1 + 0.7 = ?",
  a: 10,
  b: 7,
  op: "+",
  answer: "1.7",
  choices: ["17", "1.7", "0.17"],
  hint: null,
  explain: ["0.1が 10こと 7こ", "あわせて 0.1が 17こ", "だから 1.7"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "0.1が 10こと 7こ",
    "0.1が 10こと 7こ あわせて 0.1が 17こ だから 1.7",
  ],
};

export const G3_DECIMAL: LessonDef = {
  skillId: "g3_decimal",
  title: "小数の たしひき",
  prerequisites: ["g2_add_column"],
  story: {
    pages: [
      "さばくを わたる みずの りょうを はかったよ。",
      "1リットルに たりない はんぱな りょうが でて、どう かぞえるか こまったよ。",
    ],
  },
  concept: [
    {
      text: "0.1ずつ めもりを すすめると 1.2に なるよ",
      figure: { kind: "numberLine", from: 0, to: 2, step: 0.1, highlight: [1, 1.2] },
    },
    {
      text: "1.2の 0.1の くらいを みてみよう",
      figure: { kind: "placeValue", value: "1.2", highlightDigit: 2 },
    },
    { text: "0.1が なんこ あるかで かんがえよう" },
  ],
  workedExample: {
    problem: WORKED_PROBLEM,
    steps: [
      {
        text: "1.2から 1 ひくと どこに なるかな",
        figure: { kind: "numberLine", from: 0, to: 2, step: 0.1, highlight: [0.2, 1.2] },
      },
      { text: "0.1が 12こから 10こ ひくよ" },
      { text: "のこりは 0.1が 2こ だから 0.2だよ" },
    ],
  },
  faded: [
    { problem: FADED_1, blanks: 1 },
    { problem: FADED_2, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "ちいさい 0.1の かずの けいさん" },
    { level: 2, label: "0.1の くらいの たしひき" },
    { level: 3, label: "2けたの 0.1の かずの けいさん" },
  ],
  altExplain: [
    { text: "べつの せつめい: 0.1を 1こと かんがえよう" },
    { text: "1.2は 0.1が 12こ あつまった かずだよ" },
  ],
  mistakes: [
    { pattern: "placeShift", feedback: "しょうすうてんの いちが ずれていないか たしかめよう" },
    { pattern: "offByOne", feedback: "0.1こ おおいか すくないよ。もういちど かぞえてみよう" },
    { pattern: "other", feedback: "0.1と 1を とりちがえていないか たしかめよう" },
  ],
};
