/*
 * g6_proportion (比れい) — 章6「ゼロのあなと 下の世界ネガリア」(LP-17)。
 * エンの神殿の 光の柱が 時間に比例して伸びる仕掛け、というフック。workedExample/faded の
 * problem は generate("g6_proportion", mulberry32(seed), {level:2}) の実際の出力を
 * そのまま貼っている。
 */

import type { LessonDef } from "../types";
import { defaultPrerequisites } from "../prereqs";

export const G6_PROPORTION: LessonDef = {
  skillId: "g6_proportion",
  title: "比れい",
  prerequisites: defaultPrerequisites("g6_proportion"),
  story: {
    pages: [
      "エンの しんでんの ひかりの はしらが ふしぎな うごきを しているよ。",
      "はしらの たかさは じかんに ひれいして のびているみたい。",
    ],
  },
  concept: [
    { text: "xが ふえると yも きまった わりあいで ふえるのが ひれいだよ。" },
    {
      text: "x=2のとき y=16。y÷x=8(きまった かず)だよ。",
      figure: {
        kind: "tapeDiagram",
        segments: [
          { label: "x=2", length: 2 },
          { label: "y=16", length: 16 },
        ],
      },
    },
    {
      text: "xが 3ばいなら yも 3ばいに なるよ。",
      figure: {
        kind: "tapeDiagram",
        segments: [
          { label: "x=6", length: 6 },
          { label: "y=48", length: 48 },
        ],
      },
    },
  ],
  workedExample: {
    problem: {
      skillId: "g6_proportion",
      text: "y は x に 比れいする。x=2 のとき y=16。x=6 のとき y は?",
      a: 6,
      b: 8,
      op: "×",
      answer: "48",
      choices: ["16", "20", "48"],
      hint: null,
      explain: ["y ÷ x = 8 (きまった数)", "x が 3ばい なら y も 3ばい", "16 × 3 = 48"],
      hints: [
        "じゅんばんに かんがえてみよう",
        "y ÷ x = 8 (きまった数)",
        "y ÷ x = 8 (きまった数) x が 3ばい なら y も 3ばい 16 × 3 = 48",
      ],
    },
    steps: [
      {
        text: "y ÷ x = 8。これが きまった かずだよ。",
        figure: {
          kind: "tapeDiagram",
          segments: [
            { label: "x=2", length: 2 },
            { label: "y=16", length: 16 },
          ],
        },
      },
      { text: "xが 2から6で 3ばいに なったよ。" },
      { text: "16 × 3 = 48。y = 48だよ。" },
    ],
  },
  faded: [
    {
      problem: {
        skillId: "g6_proportion",
        text: "y は x に 比れいする。x=3 のとき y=30。x=6 のとき y は?",
        a: 6,
        b: 10,
        op: "×",
        answer: "60",
        choices: ["70", "60", "33"],
        hint: null,
        explain: ["y ÷ x = 10 (きまった数)", "x が 2ばい なら y も 2ばい", "30 × 2 = 60"],
        hints: [
          "じゅんばんに かんがえてみよう",
          "y ÷ x = 10 (きまった数)",
          "y ÷ x = 10 (きまった数) x が 2ばい なら y も 2ばい 30 × 2 = 60",
        ],
      },
      blanks: 1,
    },
    {
      problem: {
        skillId: "g6_proportion",
        text: "y は x に 比れいする。x=2 のとき y=4。x=8 のとき y は?",
        a: 8,
        b: 2,
        op: "×",
        answer: "16",
        choices: ["4", "16", "10"],
        hint: null,
        explain: ["y ÷ x = 2 (きまった数)", "x が 4ばい なら y も 4ばい", "4 × 4 = 16"],
        hints: [
          "じゅんばんに かんがえてみよう",
          "y ÷ x = 2 (きまった数)",
          "y ÷ x = 2 (きまった数) x が 4ばい なら y も 4ばい 4 × 4 = 16",
        ],
      },
      blanks: 1,
    },
  ],
  levels: [
    { level: 1, label: "ちいさい きまった かず" },
    { level: 2, label: "すこし おおきい きまった かず" },
    { level: 3, label: "おおきい きまった かずと ばい" },
  ],
  altExplain: [
    { text: "べつの せつめい: y÷xは いつも おなじ かずに なるよ。それが きまりだよ。" },
  ],
  mistakes: [
    { pattern: "swappedBase", feedback: "xと yを ぎゃくに しないように きをつけよう" },
    { pattern: "reversedDivision", feedback: "y÷xの むきを まちがえていないか たしかめよう" },
    { pattern: "other", feedback: "きまった かずを さきに もとめてから けいさんしよう" },
  ],
};
