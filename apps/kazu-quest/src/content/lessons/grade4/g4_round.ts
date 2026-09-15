/*
 * g4_round (がい数 (四捨五入)) のレッスン本文 (LP-15)。
 * workedExample/faded の問題は generate("g4_round", mulberry32(seed), { level })
 * の実出力をそのまま貼っている (tests/_scratch_grade4.test.ts で確認・転記)。
 * 本文は §1.7 の規約どおり、小4でもひらがな + わかちがき
 * (LessonPageBody が ｜漢字《ルビ》 を描画しないための当面の回避)。
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";

const workedProblem: Problem = {
  skillId: "g4_round",
  text: "3238 を 四捨五入して 千のくらいまでの がい数に すると?",
  a: 3238,
  b: 1000,
  op: null,
  answer: "3000",
  choices: ["3000", "4000", "2000"],
  hint: null,
  explain: ["百のくらいの 2 を 見る", "4いか だから きりすてる", "こたえは 3000"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "百のくらいの 2 を 見る",
    "百のくらいの 2 を 見る 4いか だから きりすてる こたえは 3000",
  ],
};

const fadedProblem1: Problem = {
  skillId: "g4_round",
  text: "31275 を 四捨五入して 千のくらいまでの がい数に すると?",
  a: 31275,
  b: 1000,
  op: null,
  answer: "31000",
  choices: ["31000", "32000", "30000"],
  hint: null,
  explain: ["百のくらいの 2 を 見る", "4いか だから きりすてる", "こたえは 31000"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "百のくらいの 2 を 見る",
    "百のくらいの 2 を 見る 4いか だから きりすてる こたえは 31000",
  ],
};

const fadedProblem2: Problem = {
  skillId: "g4_round",
  text: "31975 を 四捨五入して 千のくらいまでの がい数に すると?",
  a: 31975,
  b: 1000,
  op: null,
  answer: "32000",
  choices: ["33000", "31000", "32000"],
  hint: null,
  explain: ["百のくらいの 9 を 見る", "5いじょう だから くり上げる", "こたえは 32000"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "百のくらいの 9 を 見る",
    "百のくらいの 9 を 見る 5いじょう だから くり上げる こたえは 32000",
  ],
};

export const G4_ROUND: LessonDef = {
  skillId: "g4_round",
  title: "がい数 (四捨五入)",
  prerequisites: [],
  story: {
    pages: [
      "こおりの くにの ひとかずを しらべる がかりが、ぴったりの かずが わからず こまっているよ。",
      "ししゃごにゅうで がいすうに して つたえる ほうほうを おぼえよう。",
    ],
  },
  concept: [
    { text: "がいすうは、だいたいの かずに して わかりやすく する ほうほうだよ。" },
    {
      text: "3238は 3000と 4000の どちらに ちかいかな。",
      figure: {
        kind: "numberLine",
        from: 3000,
        to: 4000,
        step: 100,
        marks: [3238],
        highlight: [3000, 3500],
      },
    },
    {
      text: "みる くらいの ひとつ したの すうじで きめるよ。",
      figure: { kind: "placeValue", value: "3238", highlightDigit: 2 },
    },
    { text: "5いじょうなら くり上げ、4いかなら きりすてるよ。" },
  ],
  workedExample: {
    problem: workedProblem,
    steps: [
      {
        text: "百のくらいの 2を みるよ。",
        figure: {
          kind: "numberLine",
          from: 3000,
          to: 4000,
          step: 100,
          marks: [3238],
          highlight: [3000, 3500],
        },
      },
      { text: "2は 4いかだから きりすてるよ。" },
      { text: "こたえは 3000だよ。" },
    ],
  },
  faded: [
    { problem: fadedProblem1, blanks: 1 },
    { problem: fadedProblem2, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "ちいさい かずで がいすうに" },
    { level: 2, label: "すこし おおきい かずで がいすうに" },
    { level: 3, label: "おおきい かずで がいすうに" },
  ],
  altExplain: [
    { text: "べつの せつめい: すうじの せんに おいて、どちらの めもりに ちかいかで きめよう。" },
    { text: "ぴったり まんなかの ときは、くり上げに するのが やくそくだよ。" },
  ],
  mistakes: [
    { pattern: "offByOne", feedback: "くり上げか きりすてかを まちがえたかも。みる すうじを たしかめよう。" },
    { pattern: "placeShift", feedback: "みる くらいが ずれているかも。もんだいの くらいを たしかめよう。" },
    { pattern: "other", feedback: "けたの かずが ちがうかも。もういちど かぞえなおそう。" },
  ],
};
