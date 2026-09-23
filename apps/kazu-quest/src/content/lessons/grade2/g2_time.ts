/*
 * g2_time (とけいと じかん) のレッスン (LP-13)。
 * workedExample / faded の problem は generate("g2_time", mulberry32(seed), { level })
 * の実際の出力をそのまま貼っている (手書きしない — §5 波4の共通仕様)。
 */

import type { LessonDef } from "../types";

/* prereqs.ts の DEFAULT_PREREQUISITES に "g2_time" キーは無い (既定 []) ので
 * その値をハードコード。defaultPrerequisites() を単元ファイルのモジュール直下で
 * 呼ぶと、prereqs.ts が import グラフの起点になったとき (例: tests/prereqs.test.ts)
 * に prereqs.ts → index.ts → (この単元) → prereqs.ts の循環で
 * DEFAULT_PREREQUISITES への TDZ 参照エラーが起きるため、値を直接埋め込む */
export const G2_TIME: LessonDef = {
  skillId: "g2_time",
  title: "とけいと じかん",
  prerequisites: [],
  story: {
    pages: [
      "みなとの とけいだいが こわれて、いま なんじか わからず こまっている。",
      "とけいの よみかたと じかんの けいさんを おぼえよう。",
    ],
  },
  concept: [
    { text: "とけいの ながいはりは ふん、みじかいはりは じを あらわすよ。" },
    {
      text: "みじかいはりが 6、ながいはりが 12で 6じだよ。",
      figure: { kind: "clock", hour: 6, minute: 0 },
    },
    {
      text: "6じから 3じかん たつと 9じに なるよ。",
      figure: { kind: "clock", hour: 6, minute: 0, second: { hour: 9, minute: 0 } },
    },
    { text: "1じかんは 60ぷんだよ。おぼえておこう。" },
  ],
  workedExample: {
    problem: {
      skillId: "g2_time",
      text: "6じから 2じかん たつと なんじ?",
      a: 6,
      b: 2,
      op: null,
      answer: "8",
      choices: ["9", "8", "6"],
      choiceTags: ["offByOne", "other", "echoOperand"],
      hint: null,
      explain: ["6じ + 2じかん = 8じ"],
      hints: ["じゅんばんに かんがえてみよう", "6じ + 2じかん = 8じ", "6じ + 2じかん = 8じ"],
    },
    steps: [
      { text: "いま 6じだよ。とけいを みてみよう。", figure: { kind: "clock", hour: 6, minute: 0 } },
      {
        text: "2じかん すすめると 8じに なるよ。",
        figure: { kind: "clock", hour: 6, minute: 0, second: { hour: 8, minute: 0 } },
      },
      { text: "6+2=8。こたえは 8じ。" },
    ],
  },
  faded: [
    {
      problem: {
        skillId: "g2_time",
        text: "1じかんは なんぷん?",
        a: 1,
        b: null,
        op: null,
        answer: "60",
        choices: ["90", "60", "59"],
        choiceTags: ["other", "other", "offByOne"],
        hint: null,
        explain: ["1じかん = 60ぷん だから", "1じかん = 60ぷん"],
        hints: [
          "じゅんばんに かんがえてみよう",
          "1じかん = 60ぷん だから",
          "1じかん = 60ぷん だから 1じかん = 60ぷん",
        ],
      },
      blanks: 1,
    },
    {
      problem: {
        skillId: "g2_time",
        text: "5じから 1じかん たつと なんじ?",
        a: 5,
        b: 1,
        op: null,
        answer: "6",
        choices: ["5", "4", "6"],
        choiceTags: ["offByOne", "other", "other"],
        hint: null,
        explain: ["5じ + 1じかん = 6じ"],
        hints: ["じゅんばんに かんがえてみよう", "5じ + 1じかん = 6じ", "5じ + 1じかん = 6じ"],
      },
      blanks: 1,
    },
  ],
  levels: [
    { level: 1, label: "5じまでの かんたんな とけい" },
    { level: 2, label: "9じまでの とけいと たんい" },
    { level: 3, label: "ごぜん・ごごを またぐ とけいと 5ふんたんい" },
  ],
  altExplain: [
    { text: "べつの みかた: とけいの はりを 1じかんずつ すすめて かぞえよう。" },
    { text: "6じ→7じ→8じ。ふたつ すすめたから こたえは 8じ。" },
  ],
  mistakes: [
    { pattern: "offByOne", feedback: "1つ おおいか すくないよ。とけいの はりを もういちど かぞえてみよう" },
    { pattern: "unitConfusion", feedback: "「じ」と「ふん」を まちがえていないか たしかめよう" },
    { pattern: "forgotCarry", feedback: "12じを こえたら、24じかんの あらわしかたに きをつけよう" },
  ],
  coreOfChapter: true,
};
