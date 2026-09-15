/*
 * g4_div_2digit (2けたで わる わり算) のレッスン本文 (LP-15)。第4章の中核単元。
 * workedExample/faded の問題は generate("g4_div_2digit", mulberry32(seed), { level })
 * の実出力をそのまま貼っている (tests/_scratch_grade4.test.ts で確認・転記)。
 * 本文は §1.7 の規約どおり、小4でもひらがな + わかちがき
 * (LessonPageBody が ｜漢字《ルビ》 を描画しないための当面の回避)。
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";

const workedProblem: Problem = {
  skillId: "g4_div_2digit",
  text: "87 ÷ 29 = ?",
  a: 87,
  b: 29,
  op: "÷",
  answer: "3",
  choices: ["2", "4", "3"],
  hint: null,
  explain: ["29 を 何こ あつめると 87 に なる?", "29 × 3 = 87", "だから こたえは 3"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "29 を 何こ あつめると 87 に なる?",
    "29 を 何こ あつめると 87 に なる? 29 × 3 = 87 だから こたえは 3",
  ],
};

const fadedProblem1: Problem = {
  skillId: "g4_div_2digit",
  text: "320 ÷ 32 = ?",
  a: 320,
  b: 32,
  op: "÷",
  answer: "10",
  choices: ["100", "10", "11"],
  hint: null,
  explain: ["32 を 何こ あつめると 320 に なる?", "32 × 10 = 320", "だから こたえは 10"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "32 を 何こ あつめると 320 に なる?",
    "32 を 何こ あつめると 320 に なる? 32 × 10 = 320 だから こたえは 10",
  ],
};

const fadedProblem2: Problem = {
  skillId: "g4_div_2digit",
  text: "620 ÷ 31 = ?",
  a: 620,
  b: 31,
  op: "÷",
  answer: "20",
  choices: ["20", "31", "200"],
  hint: null,
  explain: ["31 を 何こ あつめると 620 に なる?", "31 × 20 = 620", "だから こたえは 20"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "31 を 何こ あつめると 620 に なる?",
    "31 を 何こ あつめると 620 に なる? 31 × 20 = 620 だから こたえは 20",
  ],
};

export const G4_DIV_2DIGIT: LessonDef = {
  skillId: "g4_div_2digit",
  title: "2けたで わる わり算",
  prerequisites: ["g3_div_remainder"],
  story: {
    pages: [
      "ゆきまつりの おかしを むらびと みんなに わけたいけど、わりざんが むずかしくて こまっているよ。",
      "2けたの かずで わる わりざんを おぼえて たすけよう。",
    ],
  },
  concept: [
    { text: "わる かずが 2けたに なっても、九九の かんがえかたは おなじだよ。" },
    {
      text: "わる かずを なんこ あつめると わられる かずに なるか かんがえよう。",
      figure: { kind: "columnCalc", op: "÷", a: 48, b: 12 },
    },
    {
      text: "ひとまとまりを つくって かぞえると わかりやすいよ。",
      figure: { kind: "array", rows: 4, cols: 12, groupBy: "row" },
    },
    { text: "こたえが あっているか、かけざんで たしかめよう。" },
  ],
  workedExample: {
    problem: workedProblem,
    steps: [
      {
        text: "29を なんこ あつめると 87に なるか かんがえるよ。",
        figure: { kind: "columnCalc", op: "÷", a: 87, b: 29 },
      },
      { text: "29 × 3 = 87。ぴったり あうね。" },
      { text: "こたえは 3だよ。" },
    ],
  },
  faded: [
    { problem: fadedProblem1, blanks: 1 },
    { problem: fadedProblem2, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "10だいの かずで わる" },
    { level: 2, label: "30までの かずで わる" },
    { level: 3, label: "おおきい かずで わる" },
  ],
  altExplain: [
    { text: "べつの せつめい: わる かずを 10ばい・20ばいと ふやして、ちかい かずを さがそう。" },
    { text: "かけざんの ひょうを つかって、こたえの あたりを つけても いいよ。" },
  ],
  mistakes: [
    { pattern: "reversedDivision", feedback: "わる かずと わられる かずが ぎゃくかも。もんだいを よみなおそう。" },
    { pattern: "offByOne", feedback: "こたえが 1つ おおいか すくないよ。かけざんで たしかめよう。" },
    { pattern: "other", feedback: "けたすうを まちがえたかも。もういちど けいさんしよう。" },
  ],
  coreOfChapter: true,
};
