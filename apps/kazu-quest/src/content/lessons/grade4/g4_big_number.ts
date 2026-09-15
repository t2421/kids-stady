/*
 * g4_big_number (億と 兆) のレッスン本文 (LP-15)。
 * workedExample/faded の問題は generate("g4_big_number", mulberry32(seed), { level })
 * の実出力をそのまま貼っている (tests/_scratch_grade4.test.ts で確認・転記)。
 * 本文は §1.7 の規約どおり、小4でもひらがな + わかちがき
 * (LessonPageBody が ｜漢字《ルビ》 を描画しないための当面の回避)。
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";

const workedProblem: Problem = {
  skillId: "g4_big_number",
  text: "2億 は 1000万の なんこ分?",
  a: 2,
  b: null,
  op: null,
  answer: "20",
  choices: ["2", "20", "21"],
  hint: null,
  explain: ["1億 = 1000万 × 10", "2億 = 1000万 × 20"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "1億 = 1000万 × 10",
    "1億 = 1000万 × 10 2億 = 1000万 × 20",
  ],
};

const fadedProblem1: Problem = {
  skillId: "g4_big_number",
  text: "4兆 は 4億の なんばい?",
  a: 4,
  b: null,
  op: null,
  answer: "10000",
  choices: ["10000", "100", "100000"],
  hint: null,
  explain: ["億 → 兆 は くらいが 4つ上がる", "10 × 10 × 10 × 10 = 10000ばい"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "億 → 兆 は くらいが 4つ上がる",
    "億 → 兆 は くらいが 4つ上がる 10 × 10 × 10 × 10 = 10000ばい",
  ],
};

const fadedProblem2: Problem = {
  skillId: "g4_big_number",
  text: "2兆 は 2億の なんばい?",
  a: 2,
  b: null,
  op: null,
  answer: "10000",
  choices: ["100", "10000", "1000"],
  hint: null,
  explain: ["億 → 兆 は くらいが 4つ上がる", "10 × 10 × 10 × 10 = 10000ばい"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "億 → 兆 は くらいが 4つ上がる",
    "億 → 兆 は くらいが 4つ上がる 10 × 10 × 10 × 10 = 10000ばい",
  ],
};

export const G4_BIG_NUMBER: LessonDef = {
  skillId: "g4_big_number",
  title: "億と 兆",
  prerequisites: [],
  story: {
    pages: [
      "こおりの くにの ゆきの りょうを かぞえる がかりが、おおきな かずが よめずに こまっているよ。",
      "おくや ちょうの くらいを いっしょに べんきょうしよう。",
    ],
  },
  concept: [
    { text: "1おくは、1まんが 10000こ あつまった かずだよ。" },
    {
      text: "くらいが ひとつ あがるたびに、0が 4つ ふえていくよ。",
      figure: { kind: "placeValue", value: "200000000", highlightDigit: 0 },
    },
    {
      text: "1ちょうは 1おくの 10000ばいの おおきさだよ。",
      figure: { kind: "placeValue", value: "1000000000000", highlightDigit: 0 },
    },
    { text: "くらいどりの ひょうを つかうと、おおきな かずも よみやすく なるよ。" },
  ],
  workedExample: {
    problem: workedProblem,
    steps: [
      {
        text: "1おくは 1000まんが 10こ分だよ。",
        figure: { kind: "placeValue", value: "10000000", highlightDigit: 0 },
      },
      { text: "2おくは 1000まんの 10 × 2 = 20こ分だよ。" },
      { text: "こたえは 20こ分。" },
    ],
  },
  faded: [
    { problem: fadedProblem1, blanks: 1 },
    { problem: fadedProblem2, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "ちいさい かずで れんしゅう" },
    { level: 2, label: "9までの かずで れんしゅう" },
    { level: 3, label: "2けたの かずまで" },
  ],
  altExplain: [
    { text: "べつの せつめい: 0を 4こずつ まとめて かぞえると、くらいが わかりやすいよ。" },
    { text: "まん・おく・ちょうの じゅんに、0が 4つずつ ふえていくよ。" },
  ],
  mistakes: [
    { pattern: "placeShift", feedback: "0の かずが ずれているかも。くらいを ひとつずつ かぞえなおそう。" },
    { pattern: "offByOne", feedback: "こたえが すこし おおいか すくないよ。もういちど かぞえよう。" },
    { pattern: "other", feedback: "まんと おくを とりちがえたかも。くらいの ひょうを みなおそう。" },
  ],
};
