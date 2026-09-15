/*
 * g4_angle (角度) のレッスン本文 (LP-15)。
 * 第4章「氷の国の はかりごと」の中核単元。workedExample/faded の問題は
 * generate("g4_angle", mulberry32(seed), { level }) の実出力をそのまま貼っている
 * (tests/_scratch_grade4.test.ts で確認・転記。スクラッチは作業後に削除)。
 * 本文は §1.7 の規約どおり、小4でもひらがな + わかちがき (LessonPageBody が
 * ｜漢字《ルビ》 を描画しないための当面の回避 — 最終報告で明記)。
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";

const workedProblem: Problem = {
  skillId: "g4_angle",
  text: "三角形の 角の和は 180°。30° と 90° の ほかの 角は なん度?",
  a: 30,
  b: 90,
  op: null,
  answer: "60",
  choices: ["120", "240", "60"],
  hint: null,
  explain: ["三角形の 角の和は 180°", "180 - 30 - 90 = 60°"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "三角形の 角の和は 180°",
    "三角形の 角の和は 180° 180 - 30 - 90 = 60°",
  ],
};

const fadedProblem1: Problem = {
  skillId: "g4_angle",
  text: "一まわりは 360°。60° の のこりは なん度?",
  a: 60,
  b: 360,
  op: null,
  answer: "300",
  choices: ["290", "300", "120"],
  hint: null,
  explain: ["一まわり = 360°", "360 - 60 = 300°"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "一まわり = 360°",
    "一まわり = 360° 360 - 60 = 300°",
  ],
};

const fadedProblem2: Problem = {
  skillId: "g4_angle",
  text: "一まわりは 360°。270° の のこりは なん度?",
  a: 270,
  b: 360,
  op: null,
  answer: "90",
  choices: ["100", "80", "90"],
  hint: null,
  explain: ["一まわり = 360°", "360 - 270 = 90°"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "一まわり = 360°",
    "一まわり = 360° 360 - 270 = 90°",
  ],
};

export const G4_ANGLE: LessonDef = {
  skillId: "g4_angle",
  title: "角度",
  prerequisites: [],
  story: {
    pages: [
      "こおりの くにの とうだいが、かくどを うしなって ひかりが とどかない。",
      "とうだいちょうに たのまれて、かくどの けいさんを ならうことに した。",
    ],
  },
  concept: [
    { text: "かくどは、ひらいた ひろさを すうじで あらわす もの。たんいは「°」だよ。" },
    {
      text: "ぶんどきで はかると、かくどが すうじで よめるよ。",
      figure: { kind: "protractor", angle: 90, showReading: true },
    },
    {
      text: "まっすぐな せんは 180°。さんかくの なかの かくどを たすと 180°に なるよ。",
      figure: { kind: "protractor", angle: 60, showReading: true },
    },
    { text: "いちまわりは 360°。のこりの かくどは ひいて もとめるよ。" },
  ],
  workedExample: {
    problem: workedProblem,
    steps: [
      {
        text: "さんかくの かどは ぜんぶで 180°ぶん。ひとつは 90°だよ。",
        figure: { kind: "protractor", angle: 90, showReading: true },
      },
      {
        text: "180 - 30 - 90 = 60。のこりの かどは 60°。",
        figure: { kind: "protractor", angle: 60, showReading: true },
      },
      { text: "こたえは 60°だよ。" },
    ],
  },
  faded: [
    { problem: fadedProblem1, blanks: 1 },
    { problem: fadedProblem2, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "ちょくせんと さんかくの かくど" },
    { level: 2, label: "いちまわりも くわえて" },
    { level: 3, label: "5°きざみの こまかい かくど" },
  ],
  altExplain: [
    { text: "べつの せつめい: とけいの はりを おもいうかべよう。ぐるっと まわると 360°だよ。" },
    { text: "みじかい はりが すこし うごく ぶんが、かくどの おおきさだよ。" },
  ],
  mistakes: [
    { pattern: "offByOne", feedback: "すうじが 1つ ちがうよ。もういちど ひきざんを たしかめよう。" },
    {
      pattern: "swappedBase",
      feedback: "180°と 360°を まちがえて つかっているかも。もとの かくどを みなおそう。",
    },
    { pattern: "other", feedback: "ひく じゅんばんが ぎゃくかも。180から かくどを ひいてみよう。" },
  ],
  coreOfChapter: true,
};
