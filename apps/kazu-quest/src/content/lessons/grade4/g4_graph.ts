/*
 * g4_graph (ひょうと グラフ) のレッスン本文 (LP-15)。
 * workedExample/faded の問題は generate("g4_graph", mulberry32(seed), { level })
 * の実出力をそのまま貼っている (tests/_scratch_grade4.test.ts で確認・転記)。
 * 本文は §1.7 の規約どおり、小4でもひらがな + わかちがき
 * (LessonPageBody が ｜漢字《ルビ》 を描画しないための当面の回避)。
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";

const workedProblem: Problem = {
  skillId: "g4_graph",
  text: "ひろった どんぐりの ひょう\n月よう日 14こ / 火よう日 3こ / 水よう日 12こ\nいちばん多い日と 少ない日の さは なんこ?",
  a: 14,
  b: 3,
  op: "-",
  answer: "11",
  choices: ["11", "14", "3"],
  hint: null,
  explain: ["いちばん多いのは 14こ、少ないのは 3こ", "14 - 3 = 11こ"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "いちばん多いのは 14こ、少ないのは 3こ",
    "いちばん多いのは 14こ、少ないのは 3こ 14 - 3 = 11こ",
  ],
};

const fadedProblem1: Problem = {
  skillId: "g4_graph",
  text: "ひろった どんぐりの ひょう\n月よう日 15こ / 火よう日 3こ / 水よう日 11こ\nぜんぶで なんこ?",
  a: null,
  b: null,
  op: null,
  answer: "29",
  choices: ["15", "29", "26"],
  hint: null,
  explain: ["15 + 3 + 11 = 29", "ひょうの 数を ぜんぶ たす"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "15 + 3 + 11 = 29",
    "15 + 3 + 11 = 29 ひょうの 数を ぜんぶ たす",
  ],
};

const fadedProblem2: Problem = {
  skillId: "g4_graph",
  text: "ひろった どんぐりの ひょう\n月よう日 15こ / 火よう日 16こ / 水よう日 6こ\nいちばん多い日と 少ない日の さは なんこ?",
  a: 16,
  b: 6,
  op: "-",
  answer: "10",
  choices: ["22", "10", "6"],
  hint: null,
  explain: ["いちばん多いのは 16こ、少ないのは 6こ", "16 - 6 = 10こ"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "いちばん多いのは 16こ、少ないのは 6こ",
    "いちばん多いのは 16こ、少ないのは 6こ 16 - 6 = 10こ",
  ],
};

export const G4_GRAPH: LessonDef = {
  skillId: "g4_graph",
  title: "ひょうと グラフ",
  prerequisites: [],
  story: {
    pages: [
      "てんきを きろくする とうの ひとが、ひょうの よみとりかたが わからずに こまっているよ。",
      "ひょうから かずを よみとる れんしゅうを しよう。",
    ],
  },
  concept: [
    { text: "ひょうには、ひづけと かずが ならんで かいてあるよ。" },
    {
      text: "ひとつずつの かずを くらべてみよう。",
      figure: {
        kind: "tapeDiagram",
        segments: [
          { label: "月", length: 14 },
          { label: "火", length: 3 },
          { label: "水", length: 12 },
        ],
      },
    },
    {
      text: "ぜんぶ たすと ごうけいに なるよ。",
      figure: {
        kind: "tapeDiagram",
        segments: [
          { label: "月", length: 14 },
          { label: "火", length: 3 },
          { label: "水", length: 12 },
        ],
        total: "ごうけい",
      },
    },
    { text: "いちばん おおい ひと すくない ひが わかったら、ひきざんで さが わかるよ。" },
  ],
  workedExample: {
    problem: workedProblem,
    steps: [
      {
        text: "いちばん おおいのは 月の 14こだよ。",
        figure: {
          kind: "tapeDiagram",
          segments: [
            { label: "月", length: 14 },
            { label: "火", length: 3 },
            { label: "水", length: 12 },
          ],
        },
      },
      { text: "いちばん すくないのは 火の 3こだよ。" },
      { text: "14 − 3 = 11。こたえは 11こだよ。" },
    ],
  },
  faded: [
    { problem: fadedProblem1, blanks: 1 },
    { problem: fadedProblem2, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "10までの ひょう" },
    { level: 2, label: "20までの ひょう" },
    { level: 3, label: "60までの ひょう" },
  ],
  altExplain: [
    { text: "べつの せつめい: ぼうグラフに すると、たかさで おおきさが ひとめで わかるよ。" },
    { text: "ひょうの すうじを ゆびで さしながら くらべると まちがえにくいよ。" },
  ],
  mistakes: [
    { pattern: "doubleCounted", feedback: "おなじ ひを 2かい かぞえたかも。ひょうを ひとつずつ みなおそう。" },
    { pattern: "echoOperand", feedback: "ちがう ひの かずを つかったかも。もんだいの ひを たしかめよう。" },
    { pattern: "other", feedback: "たしざんと ひきざんを まちがえたかも。もんだいを よみなおそう。" },
  ],
};
