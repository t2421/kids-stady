/*
 * g6_scale (拡大図と 縮図) — 章6「ゼロのあなと 下の世界ネガリア」(LP-17)。
 * ホシオキの地図の縮尺が壊れている、というフック (計画では g6_ratio 向けの案だったが
 * 内容的に縮図の単元と合うためこちらで採用 — docs/kazu-quest-learning-tasks.md 波4)。
 * workedExample/faded の problem は generate("g6_scale", mulberry32(seed),
 * {level:2}) の実際の出力をそのまま貼っている。
 */

import type { LessonDef } from "../types";
import { defaultPrerequisites } from "../prereqs";

export const G6_SCALE: LessonDef = {
  skillId: "g6_scale",
  title: "拡大図と 縮図",
  prerequisites: defaultPrerequisites("g6_scale"),
  story: {
    pages: [
      "ホシオキの ちずの しゅくしゃくが こわれて つかえないよ。",
      "ただしい ばいりつで ちずを かきなおそう。",
    ],
  },
  concept: [
    { text: "かくだいずは へんの ながさを おなじ ばいりつで のばすよ。" },
    {
      text: "3cmの へんを 2ばいに すると 6cmだよ。",
      figure: { kind: "areaGrid", w: 3, h: 2, unit: "cm" },
    },
    {
      text: "しゅくずは ぎゃくに ちいさく するよ。",
      figure: { kind: "areaGrid", w: 6, h: 2, unit: "cm" },
    },
  ],
  workedExample: {
    problem: {
      skillId: "g6_scale",
      text: "16cm の へんを 2ばいに かくだいすると なんcm?",
      a: 16,
      b: 2,
      op: "×",
      answer: "32",
      choices: ["48", "32", "18"],
      hint: null,
      explain: ["かくだい図は へんの 長さが 2ばい", "16 × 2 = 32cm"],
      hints: [
        "じゅんばんに かんがえてみよう",
        "かくだい図は へんの 長さが 2ばい",
        "かくだい図は へんの 長さが 2ばい 16 × 2 = 32cm",
      ],
    },
    steps: [
      {
        text: "かくだいずは へんが 2ばいに なるよ。",
        figure: { kind: "areaGrid", w: 4, h: 2, unit: "cm" },
      },
      { text: "16 × 2 = 32。" },
      { text: "こたえは 32cmだよ。" },
    ],
  },
  faded: [
    {
      problem: {
        skillId: "g6_scale",
        text: "28cm の へんを 1/2 に しゅくしょうすると なんcm?",
        a: 28,
        b: 2,
        op: "÷",
        answer: "14",
        choices: ["26", "28", "14"],
        hint: null,
        explain: ["しゅくず は へんの 長さが 1/2", "28 ÷ 2 = 14cm"],
        hints: [
          "じゅんばんに かんがえてみよう",
          "しゅくず は へんの 長さが 1/2",
          "しゅくず は へんの 長さが 1/2 28 ÷ 2 = 14cm",
        ],
      },
      blanks: 1,
    },
    {
      problem: {
        skillId: "g6_scale",
        text: "15cm の へんを 4ばいに かくだいすると なんcm?",
        a: 15,
        b: 4,
        op: "×",
        answer: "60",
        choices: ["60", "19", "75"],
        hint: null,
        explain: ["かくだい図は へんの 長さが 4ばい", "15 × 4 = 60cm"],
        hints: [
          "じゅんばんに かんがえてみよう",
          "かくだい図は へんの 長さが 4ばい",
          "かくだい図は へんの 長さが 4ばい 15 × 4 = 60cm",
        ],
      },
      blanks: 1,
    },
  ],
  levels: [
    { level: 1, label: "ちいさい へんと ばいりつ" },
    { level: 2, label: "すこし おおきい へんと ばいりつ" },
    { level: 3, label: "おおきい へんと ばいりつ" },
  ],
  altExplain: [
    { text: "べつの せつめい: ばいりつは もとの なんばいかを あらわす かずだよ。" },
  ],
  mistakes: [
    { pattern: "unitConfusion", feedback: "cmの たんいを わすれずに かこう" },
    { pattern: "reversedDivision", feedback: "かくだいと しゅくしょうの むきを まちがえていないか たしかめよう" },
    { pattern: "other", feedback: "ばいりつを かけるか わるか もういちど かんがえよう" },
  ],
};
