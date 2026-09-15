/*
 * g3_div_remainder (あまりの ある わり算) — 第3章の中核単元 (coreOfChapter)。
 * 「隊商の宿場」で、なつめやしを らくだに のせるときの あまりを 物語フックにした
 * (ひらがな分かち書き。§1.7 逸脱の理由は g3_div.ts コメント参照)。
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";

const WORKED_PROBLEM: Problem = {
  skillId: "g3_div_remainder",
  text: "41 ÷ 7 の あまりは いくつ?",
  a: 41,
  b: 7,
  op: "÷",
  answer: "6",
  choices: ["7", "0", "6"],
  hint: null,
  explain: ["7 × 5 = 35 まで いける", "41 - 35 = 6", "41 ÷ 7 = 5 あまり 6"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "7 × 5 = 35 まで いける",
    "7 × 5 = 35 まで いける 41 - 35 = 6 41 ÷ 7 = 5 あまり 6",
  ],
};

const FADED_1: Problem = {
  skillId: "g3_div_remainder",
  text: "8 ÷ 3 の あまりは いくつ?",
  a: 8,
  b: 3,
  op: "÷",
  answer: "2",
  choices: ["1", "2", "3"],
  hint: null,
  explain: ["3 × 2 = 6 まで いける", "8 - 6 = 2", "8 ÷ 3 = 2 あまり 2"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "3 × 2 = 6 まで いける",
    "3 × 2 = 6 まで いける 8 - 6 = 2 8 ÷ 3 = 2 あまり 2",
  ],
};

const FADED_2: Problem = {
  skillId: "g3_div_remainder",
  text: "34 ÷ 4 の あまりは いくつ?",
  a: 34,
  b: 4,
  op: "÷",
  answer: "2",
  choices: ["3", "2", "8"],
  hint: null,
  explain: ["4 × 8 = 32 まで いける", "34 - 32 = 2", "34 ÷ 4 = 8 あまり 2"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "4 × 8 = 32 まで いける",
    "4 × 8 = 32 まで いける 34 - 32 = 2 34 ÷ 4 = 8 あまり 2",
  ],
};

export const G3_DIV_REMAINDER: LessonDef = {
  skillId: "g3_div_remainder",
  title: "あまりの ある わり算",
  prerequisites: ["g2_kuku"],
  story: {
    pages: [
      "たいしょうの なつめやしを らくだに のせようとしたよ。",
      "おなじ かずずつ のせても、いくつか あまってしまって こまったよ。",
    ],
  },
  concept: [
    {
      text: "8こを 3こずつ わけると 2こ あまるよ",
      figure: { kind: "array", rows: 2, cols: 3, groupBy: "row", remainder: 2 },
    },
    {
      text: "3のだんの くくで ちかい かずを さがそう",
      figure: { kind: "kukuTable", highlightRow: 3 },
    },
    { text: "わりきれない ときは あまりが でるよ" },
  ],
  workedExample: {
    problem: WORKED_PROBLEM,
    steps: [
      {
        text: "7のだんの くくで 41に ちかい かずを さがそう",
        figure: { kind: "kukuTable", highlightRow: 7 },
      },
      { text: "7 × 5 = 35 まで いけるね" },
      { text: "41 - 35 = 6 だから あまりは 6だよ" },
    ],
  },
  faded: [
    { problem: FADED_1, blanks: 1 },
    { problem: FADED_2, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "ちいさい わる かずと こたえ" },
    { level: 2, label: "わる かずが 3から9までの もんだい" },
    { level: 3, label: "こたえが おおきい もんだい" },
  ],
  altExplain: [
    { text: "べつの せつめい: いくつ くばれるかを かんがえよう" },
    { text: "くばりきれずに のこった ぶんが あまりだよ" },
  ],
  mistakes: [
    { pattern: "other", feedback: "あまりではなく とちゅうの こたえを こたえていないか たしかめよう" },
    { pattern: "offByOne", feedback: "あまりが 1つ おおいか すくないよ。もういちど たしかめよう" },
    { pattern: "reversedDivision", feedback: "わる かずと わられる かずが ぎゃくに なっていないか たしかめよう" },
  ],
  coreOfChapter: true,
};
