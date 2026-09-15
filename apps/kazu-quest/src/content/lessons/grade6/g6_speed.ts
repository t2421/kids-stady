/*
 * g6_speed (速さ) — 章6「ゼロのあなと 下の世界ネガリア」の中核単元 (LP-17)。
 * はやさの回廊で 時間が止まる、というフックを使う (docs/kazu-quest-learning-tasks.md 波4)。
 * workedExample/faded の problem は generate("g6_speed", mulberry32(seed), {level:2}) の
 * 実際の出力をそのまま貼っている (手書きしない)。
 */

import type { LessonDef } from "../types";
import { defaultPrerequisites } from "../prereqs";

export const G6_SPEED: LessonDef = {
  skillId: "g6_speed",
  title: "速さ",
  prerequisites: defaultPrerequisites("g6_speed"),
  story: {
    pages: [
      "はやさの かいろうで はやさが わからず じかんが とまって しまったよ。",
      "みちのりと じかんから はやさを もとめて まえに すすもう。",
    ],
  },
  concept: [
    { text: "はやさ・みちのり・じかんの かんけいを かんがえよう。" },
    {
      text: "はやさ = みちのり ÷ じかんだよ。",
      figure: {
        kind: "tapeDiagram",
        segments: [
          { label: "みちのり", length: 100 },
          { label: "じかん", length: 2 },
        ],
        total: "はやさ",
      },
    },
    {
      text: "みちのり = はやさ × じかんだよ。",
      figure: {
        kind: "tapeDiagram",
        segments: [
          { label: "はやさ", length: 50 },
          { label: "じかん", length: 2 },
        ],
        total: "みちのり",
      },
    },
  ],
  workedExample: {
    problem: {
      skillId: "g6_speed",
      text: "4時間で 400km すすむ 車の 時そくは なんkm?",
      a: 400,
      b: 4,
      op: "÷",
      answer: "100",
      choices: ["104", "100", "400"],
      hint: null,
      explain: ["速さ = 道のり ÷ 時間", "400 ÷ 4 = 100km/時"],
      hints: [
        "速さ・道のり・時間の かんけいを おもいだそう",
        "速さ = 道のり ÷ 時間 だったね",
        "400 ÷ 4 を けいさんすると…",
      ],
    },
    steps: [
      {
        text: "はやさ = みちのり ÷ じかんで もとめるよ。",
        figure: {
          kind: "tapeDiagram",
          segments: [
            { label: "400km", length: 400 },
            { label: "4じかん", length: 4 },
          ],
          total: "はやさ?",
        },
      },
      { text: "400 ÷ 4 = 100。" },
      { text: "じそく 100kmだよ。" },
    ],
  },
  faded: [
    {
      problem: {
        skillId: "g6_speed",
        text: "時そく 90km で 2時間 走ると 道のりは なんkm?",
        a: 90,
        b: 2,
        op: "×",
        answer: "180",
        choices: ["270", "92", "180"],
        hint: null,
        explain: ["道のり = 速さ × 時間", "90 × 2 = 180km"],
        hints: [
          "速さ・道のり・時間の かんけいを おもいだそう",
          "道のり = 速さ × 時間 だったね",
          "90 × 2 を けいさんすると…",
        ],
      },
      blanks: 1,
    },
    {
      problem: {
        skillId: "g6_speed",
        text: "60km を 時そく 30km で 走ると なん時間?",
        a: 60,
        b: 30,
        op: "÷",
        answer: "2",
        choices: ["30", "2", "60"],
        hint: null,
        explain: ["時間 = 道のり ÷ 速さ", "60 ÷ 30 = 2時間"],
        hints: [
          "速さ・道のり・時間の かんけいを おもいだそう",
          "時間 = 道のり ÷ 速さ だったね",
          "60 ÷ 30 を けいさんすると…",
        ],
      },
      blanks: 1,
    },
  ],
  levels: [
    { level: 1, label: "ちいさい はやさと じかん" },
    { level: 2, label: "すこし おおきい はやさと じかん" },
    { level: 3, label: "おおきい はやさと じかん" },
  ],
  altExplain: [{ text: "べつの せつめい: 1じかんに すすむ きょりが はやさだよ。" }],
  mistakes: [
    { pattern: "reversedDivision", feedback: "わりざんの むきが ぎゃくに なっていないか たしかめよう" },
    { pattern: "unitConfusion", feedback: "kmと じかんの たんいを まちがえないように しよう" },
    { pattern: "other", feedback: "はやさ・みちのり・じかんの かんけいを もういちど かくにんしよう" },
  ],
  coreOfChapter: true,
};
