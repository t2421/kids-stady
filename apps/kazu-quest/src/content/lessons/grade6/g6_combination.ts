/*
 * g6_combination (場合の数) — 章6「ゼロのあなと 下の世界ネガリア」(LP-17)。
 * ゼロムの城の 印の並べ方の なぞ、というフック。workedExample/faded の problem は
 * generate("g6_combination", mulberry32(seed), {level:2}) の実際の出力をそのまま貼っている。
 */

import type { LessonDef } from "../types";
import { defaultPrerequisites } from "../prereqs";

export const G6_COMBINATION: LessonDef = {
  skillId: "g6_combination",
  title: "場合の数",
  prerequisites: defaultPrerequisites("g6_combination"),
  story: {
    pages: [
      "ゼロムの しろの とびらには いんの ならべかたの なぞが あるよ。",
      "ならべかたが なんとおり あるか かぞえて とびらを あけよう。",
    ],
  },
  concept: [
    { text: "じゅんばんに かんがえると もれなく かぞえられるよ。" },
    {
      text: "1にんめが 3とおり、2にんめが 2とおり あるよ。",
      figure: { kind: "treeDiagram", levels: [["1にんめ"], ["A", "B", "C"]] },
    },
    {
      text: "のこりも じゅんに えらんで きめていくよ。",
      figure: { kind: "treeDiagram", levels: [["A"], ["B", "C"], ["C", "B"]] },
    },
  ],
  workedExample: {
    problem: {
      skillId: "g6_combination",
      text: "4人が 1れつに ならぶ ならびかたは なんとおり?",
      a: 4,
      b: null,
      op: null,
      answer: "24",
      choices: ["4", "24", "12"],
      hint: null,
      explain: ["1人目は 4とおり、2人目は 3とおり…", "4 × 3 × 2 × 1 = 24"],
      hints: [
        "じゅんばんに かんがえてみよう",
        "1人目は 4とおり、2人目は 3とおり…",
        "1人目は 4とおり、2人目は 3とおり… 4 × 3 × 2 × 1 = 24",
      ],
    },
    steps: [
      {
        text: "1にんめは 4とおり えらべるよ。",
        figure: { kind: "treeDiagram", levels: [["1にんめ"], ["A", "B", "C", "D"]] },
      },
      { text: "2にんめは のこり3にんから えらぶので 3とおり。" },
      { text: "4 × 3 × 2 × 1 = 24。ぜんぶで 24とおりだよ。" },
    ],
  },
  faded: [
    {
      problem: {
        skillId: "g6_combination",
        text: "4チームが 1回ずつ たいせんすると 試合は なん試合?",
        a: 4,
        b: null,
        op: null,
        answer: "6",
        choices: ["12", "6", "7"],
        hint: null,
        explain: [
          "4 × 3 = 12 (じゅんばんを 区べつした 数)",
          "対せんは 入れかえても おなじなので ÷2",
          "こたえは 6試合",
        ],
        hints: [
          "じゅんばんに かんがえてみよう",
          "4 × 3 = 12 (じゅんばんを 区べつした 数)",
          "4 × 3 = 12 (じゅんばんを 区べつした 数) 対せんは 入れかえても おなじなので ÷2 こたえは 6試合",
        ],
      },
      blanks: 1,
    },
    {
      problem: {
        skillId: "g6_combination",
        text: "3人が 1れつに ならぶ ならびかたは なんとおり?",
        a: 3,
        b: null,
        op: null,
        answer: "6",
        choices: ["6", "9", "3"],
        hint: null,
        explain: ["1人目は 3とおり、2人目は 2とおり…", "3 × 2 × 1 = 6"],
        hints: [
          "じゅんばんに かんがえてみよう",
          "1人目は 3とおり、2人目は 2とおり…",
          "1人目は 3とおり、2人目は 2とおり… 3 × 2 × 1 = 6",
        ],
      },
      blanks: 1,
    },
  ],
  levels: [
    { level: 1, label: "すくない にんずうの ならびかた" },
    { level: 2, label: "すこし おおい にんずうの ならびかた" },
    { level: 3, label: "おおい にんずうや チームの かぞえかた" },
  ],
  altExplain: [
    { text: "べつの せつめい: たいせんは じゅんばんを きめたあと 2ばいで わって かぞえるよ。" },
  ],
  mistakes: [
    { pattern: "doubleCounted", feedback: "おなじ くみあわせを 2かい かぞえていないか たしかめよう" },
    { pattern: "offByOne", feedback: "かける かずが 1つ たりないか おおいかもしれないよ" },
    { pattern: "other", feedback: "たいせんの もんだいは ÷2を わすれずに しよう" },
  ],
};
