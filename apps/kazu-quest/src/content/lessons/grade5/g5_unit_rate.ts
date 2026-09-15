/*
 * g5_unit_rate (単位量あたり) の本物のレッスン (LP-16)。
 * 文言はすべて ひらがな + わかちがき (LP-16 の指示による暫定)。
 * workedExample.problem / faded[].problem は generate("g5_unit_rate", mulberry32(seed), { level })
 * の実際の出力をそのまま書き写した。
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";
import { defaultPrerequisites } from "../prereqs";

/* generate("g5_unit_rate", mulberry32(1006), { level: 2 }) */
const WORKED_PROBLEM: Problem = {
  skillId: "g5_unit_rate",
  text: "1こ 66円の しなもの 4こ分は なん円?",
  a: 66,
  b: 4,
  op: "×",
  answer: "264",
  choices: ["264", "70", "330"],
  hint: null,
  explain: ["合計 = 1こ分 × こ数", "66 × 4 = 264円"],
  hints: ["じゅんばんに かんがえてみよう", "合計 = 1こ分 × こ数", "合計 = 1こ分 × こ数 66 × 4 = 264円"],
};

/* generate("g5_unit_rate", mulberry32(2006), { level: 1 }) */
const FADED_1: Problem = {
  skillId: "g5_unit_rate",
  text: "4こで 48円。1こ なん円?",
  a: 48,
  b: 4,
  op: "÷",
  answer: "12",
  choices: ["12", "22", "52"],
  hint: null,
  explain: ["1こ分 = 合計 ÷ こ数", "48 ÷ 4 = 12円"],
  hints: ["じゅんばんに かんがえてみよう", "1こ分 = 合計 ÷ こ数", "1こ分 = 合計 ÷ こ数 48 ÷ 4 = 12円"],
};

/* generate("g5_unit_rate", mulberry32(3006), { level: 1 }) */
const FADED_2: Problem = {
  skillId: "g5_unit_rate",
  text: "5こで 180円。1こ なん円?",
  a: 180,
  b: 5,
  op: "÷",
  answer: "36",
  choices: ["36", "180", "185"],
  hint: null,
  explain: ["1こ分 = 合計 ÷ こ数", "180 ÷ 5 = 36円"],
  hints: ["じゅんばんに かんがえてみよう", "1こ分 = 合計 ÷ こ数", "1こ分 = 合計 ÷ こ数 180 ÷ 5 = 36円"],
};

/* generate("g5_unit_rate", mulberry32(4006), { level: 1 }) */
const FADED_3: Problem = {
  skillId: "g5_unit_rate",
  text: "4こで 60円。1こ なん円?",
  a: 60,
  b: 4,
  op: "÷",
  answer: "15",
  choices: ["60", "25", "15"],
  hint: null,
  explain: ["1こ分 = 合計 ÷ こ数", "60 ÷ 4 = 15円"],
  hints: ["じゅんばんに かんがえてみよう", "1こ分 = 合計 ÷ こ数", "1こ分 = 合計 ÷ こ数 60 ÷ 4 = 15円"],
};

export const G5_UNIT_RATE: LessonDef = {
  skillId: "g5_unit_rate",
  title: "単位量あたり",
  prerequisites: defaultPrerequisites("g5_unit_rate"),
  story: {
    pages: [
      "みなとの ふねに、にもつを どれだけ つめるか きめたいんだ。",
      "1つあたりの りょうを くらべないと、どちらが おおいか わからないよ。",
    ],
  },
  concept: [
    {
      text: "12を 3つに わけると、1つぶんは 4だよ。",
      figure: {
        kind: "tapeDiagram",
        segments: [
          { label: "4", length: 4 },
          { label: "4", length: 4 },
          { label: "4", length: 4 },
        ],
        total: "12",
      },
    },
    {
      text: "1つぶんが わかれば、なんこぶんでも けいさんできるよ。",
      figure: {
        kind: "tapeDiagram",
        segments: [
          { label: "4", length: 4 },
          { label: "4", length: 4 },
        ],
      },
    },
    { text: "これを たんいりょうあたりの おおきさと いうよ。" },
  ],
  workedExample: {
    problem: WORKED_PROBLEM,
    steps: [
      {
        text: "1こぶんが 66えんだと たしかめよう。",
        figure: { kind: "tapeDiagram", segments: [{ label: "66えん", length: 66 }], total: "1こ" },
      },
      { text: "1こぶん × こすうで ぜんぶの りょうが でるよ。" },
      { text: "66 × 4 = 264。こたえは 264えんだよ。" },
    ],
  },
  faded: [
    { problem: FADED_1, blanks: 1 },
    { problem: FADED_2, blanks: 1 },
    { problem: FADED_3, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "ちいさい かずで れんしゅう" },
    { level: 2, label: "ふつうの おおきさ" },
    { level: 3, label: "おおきい かずに ちょうせん" },
  ],
  altExplain: [
    { text: "べつの かんがえかた: 1つぶんを そろえて ならべると くらべやすいよ。" },
    { text: "テープずのように ながさで くらべると わかりやすいよ。" },
  ],
  mistakes: [
    { pattern: "unitConfusion", feedback: "なにの 1つぶんかを たしかめよう" },
    { pattern: "reversedDivision", feedback: "わりざんの じゅんばんが ぎゃくかも。たしかめよう" },
    { pattern: "other", feedback: "こすうと ぜんたいの りょうを とりちがえていないか たしかめよう" },
  ],
};
