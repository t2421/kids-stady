/*
 * g5_volume (体せき) の本物のレッスン (LP-16)。
 * 文言はすべて ひらがな + わかちがき (LP-16 の指示による暫定)。
 * workedExample.problem / faded[].problem は generate("g5_volume", mulberry32(seed), { level })
 * の実際の出力をそのまま書き写した。
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";
import { defaultPrerequisites } from "../prereqs";

/* generate("g5_volume", mulberry32(1007), { level: 2 }) */
const WORKED_PROBLEM: Problem = {
  skillId: "g5_volume",
  text: "1ぺんが 3cm の 立方体の 体せきは なんcm³?",
  a: 3,
  b: 3,
  op: "×",
  answer: "27",
  choices: ["18", "30", "27"],
  hint: null,
  explain: ["立方体の 体せき = 1ぺん × 1ぺん × 1ぺん", "3×3×3 = 27cm³"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "立方体の 体せき = 1ぺん × 1ぺん × 1ぺん",
    "立方体の 体せき = 1ぺん × 1ぺん × 1ぺん 3×3×3 = 27cm³",
  ],
};

/* generate("g5_volume", mulberry32(2007), { level: 1 }) */
const FADED_1: Problem = {
  skillId: "g5_volume",
  text: "たて 4cm よこ 3cm 高さ 2cm の 直方体の 体せきは なんcm³?",
  a: 4,
  b: 3,
  op: "×",
  answer: "24",
  choices: ["24", "9", "52"],
  hint: null,
  explain: ["体せき = たて × よこ × 高さ", "4 × 3 × 2 = 24cm³"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "体せき = たて × よこ × 高さ",
    "体せき = たて × よこ × 高さ 4 × 3 × 2 = 24cm³",
  ],
};

/* generate("g5_volume", mulberry32(3007), { level: 1 }) */
const FADED_2: Problem = {
  skillId: "g5_volume",
  text: "たて 2cm よこ 2cm 高さ 5cm の 直方体の 体せきは なんcm³?",
  a: 2,
  b: 2,
  op: "×",
  answer: "20",
  choices: ["4", "20", "48"],
  hint: null,
  explain: ["体せき = たて × よこ × 高さ", "2 × 2 × 5 = 20cm³"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "体せき = たて × よこ × 高さ",
    "体せき = たて × よこ × 高さ 2 × 2 × 5 = 20cm³",
  ],
};

/* generate("g5_volume", mulberry32(4007), { level: 1 }) */
const FADED_3: Problem = {
  skillId: "g5_volume",
  text: "1ぺんが 2cm の 立方体の 体せきは なんcm³?",
  a: 2,
  b: 2,
  op: "×",
  answer: "8",
  choices: ["4", "12", "8"],
  hint: null,
  explain: ["立方体の 体せき = 1ぺん × 1ぺん × 1ぺん", "2×2×2 = 8cm³"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "立方体の 体せき = 1ぺん × 1ぺん × 1ぺん",
    "立方体の 体せき = 1ぺん × 1ぺん × 1ぺん 2×2×2 = 8cm³",
  ],
};

export const G5_VOLUME: LessonDef = {
  skillId: "g5_volume",
  title: "体せき",
  prerequisites: defaultPrerequisites("g5_volume"),
  story: {
    pages: [
      "みなとで ふねに つむ みずそうに、みずを どれだけ ためられるか しりたいんだ。",
      "たて よこ たかさを かけないと、はいる りょうが わからないよ。",
    ],
  },
  concept: [
    {
      text: "たてよこの めんせきに、たかさを かけると たいせきに なるよ。",
      figure: { kind: "areaGrid", w: 4, h: 3, shape: "rect" },
    },
    {
      text: "みずそうに どれだけ みずが はいるかも たいせきで あらわすよ。",
      figure: { kind: "measureCup", capacityDl: 10, filledDl: 6 },
    },
    { text: "たいせきの たんいは cm³ (りっぽうセンチメートル)だよ。" },
  ],
  workedExample: {
    problem: WORKED_PROBLEM,
    steps: [
      {
        text: "1だんぶんの めんせきは 3 × 3 = 9だよ。",
        figure: { kind: "areaGrid", w: 3, h: 3, shape: "rect" },
      },
      { text: "それが 3だん あるから 9 × 3を けいさんするよ。" },
      { text: "こたえは 27cm³だよ。" },
    ],
  },
  faded: [
    { problem: FADED_1, blanks: 1 },
    { problem: FADED_2, blanks: 1 },
    { problem: FADED_3, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "ちいさい ちょくほうたいと りっぽうたい" },
    { level: 2, label: "ふつうの おおきさ" },
    { level: 3, label: "おおきい ちょくほうたい" },
  ],
  altExplain: [
    { text: "べつの かんがえかた: 1だんの めんせきに、だんの かずを かけよう。" },
    { text: "めんせき × たかさでも たいせきが もとめられるよ。" },
  ],
  mistakes: [
    { pattern: "unitConfusion", feedback: "たんいに きを つけよう。cmと cm³は ちがうよ" },
    { pattern: "echoOperand", feedback: "おなじ かずを 2かいだけ かけていないか たしかめよう" },
    { pattern: "other", feedback: "たて よこ たかさの 3つとも かけたか たしかめよう" },
  ],
};
