/*
 * g5_area (めんせき: さんかくけい・へいこうしへんけい) の本物のレッスン (LP-16)。
 * 文言はすべて ひらがな + わかちがき (レビュー未対応の間の暫定 — LP-16 の指示による)。
 * workedExample.problem / faded[].problem は generate("g5_area", mulberry32(seed), { level })
 * の実際の出力をそのまま書き写したもの (手書きしていない)。
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";
import { defaultPrerequisites } from "../prereqs";

/* generate("g5_area", mulberry32(1000), { level: 2 }) */
const WORKED_PROBLEM: Problem = {
  skillId: "g5_area",
  text: "ていへん 12cm 高さ 11cm の 平行四辺形の 面せきは なんcm²?",
  a: 12,
  b: 11,
  op: "×",
  answer: "132",
  choices: ["66", "132", "23"],
  hint: null,
  explain: ["平行四辺形の 面せき = ていへん × 高さ", "12 × 11 = 132cm²"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "平行四辺形の 面せき = ていへん × 高さ",
    "平行四辺形の 面せき = ていへん × 高さ 12 × 11 = 132cm²",
  ],
};

/* generate("g5_area", mulberry32(2000), { level: 1 }) */
const FADED_1: Problem = {
  skillId: "g5_area",
  text: "ていへん 4cm 高さ 6cm の 平行四辺形の 面せきは なんcm²?",
  a: 4,
  b: 6,
  op: "×",
  answer: "24",
  choices: ["24", "20", "10"],
  hint: null,
  explain: ["平行四辺形の 面せき = ていへん × 高さ", "4 × 6 = 24cm²"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "平行四辺形の 面せき = ていへん × 高さ",
    "平行四辺形の 面せき = ていへん × 高さ 4 × 6 = 24cm²",
  ],
};

/* generate("g5_area", mulberry32(3000), { level: 1 }) */
const FADED_2: Problem = {
  skillId: "g5_area",
  text: "ていへん 5cm 高さ 4cm の 平行四辺形の 面せきは なんcm²?",
  a: 5,
  b: 4,
  op: "×",
  answer: "20",
  choices: ["18", "20", "9"],
  hint: null,
  explain: ["平行四辺形の 面せき = ていへん × 高さ", "5 × 4 = 20cm²"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "平行四辺形の 面せき = ていへん × 高さ",
    "平行四辺形の 面せき = ていへん × 高さ 5 × 4 = 20cm²",
  ],
};

/* generate("g5_area", mulberry32(4000), { level: 1 }) */
const FADED_3: Problem = {
  skillId: "g5_area",
  text: "ていへん 12cm 高さ 8cm の 三角形の 面せきは なんcm²?",
  a: 12,
  b: 8,
  op: "×",
  answer: "48",
  choices: ["96", "60", "48"],
  hint: null,
  explain: ["三角形の 面せき = ていへん × 高さ ÷ 2", "12 × 8 = 96", "96 ÷ 2 = 48cm²"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "三角形の 面せき = ていへん × 高さ ÷ 2",
    "三角形の 面せき = ていへん × 高さ ÷ 2 12 × 8 = 96 96 ÷ 2 = 48cm²",
  ],
};

export const G5_AREA: LessonDef = {
  skillId: "g5_area",
  title: "面せき (三角形・平行四辺形)",
  prerequisites: defaultPrerequisites("g5_area"),
  story: {
    pages: [
      "パーセンの みなとに あたらしい たてものを たてたいんだ。",
      "でも どれだけの ひろさが いるか わからなくて こまっているよ。",
    ],
  },
  concept: [
    {
      text: "1センチの ますが いくつ ならぶかで めんせきが きまるよ。",
      figure: { kind: "areaGrid", w: 4, h: 3, shape: "rect" },
    },
    {
      text: "さんかくけいは おなじ たてよこの しかくの はんぶんだよ。",
      figure: { kind: "areaGrid", w: 4, h: 3, shape: "triangle" },
    },
    {
      text: "へいこうしへんけいは かたちを ずらしても めんせきは かわらないよ。",
      figure: { kind: "areaGrid", w: 4, h: 3, shape: "parallelogram" },
    },
  ],
  workedExample: {
    problem: WORKED_PROBLEM,
    steps: [
      {
        text: "ていへんと たかさを たしかめよう。",
        figure: { kind: "areaGrid", w: 12, h: 11, unit: "cm", shape: "parallelogram" },
      },
      { text: "ていへん12 × たかさ11を けいさんするよ。" },
      { text: "こたえは 132cm² だよ。" },
    ],
  },
  faded: [
    { problem: FADED_1, blanks: 1 },
    { problem: FADED_2, blanks: 1 },
    { problem: FADED_3, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "ちいさい かずの さんかくけい しかっけい" },
    { level: 2, label: "ふつうの おおきさの めんせき" },
    { level: 3, label: "おおきい かずの めんせき" },
  ],
  altExplain: [
    { text: "べつの かんがえかた: さんかくけいを 2つ あわせると しかくが できるよ。" },
    { text: "だから めんせきは しかくの めんせきを 2で わったものだよ。" },
  ],
  mistakes: [
    { pattern: "unitConfusion", feedback: "たんいに きを つけよう。cmと cm²は ちがうよ" },
    { pattern: "other", feedback: "さんかくけいは ÷2を わすれずに" },
  ],
};
