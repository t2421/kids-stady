/*
 * g5_average (平きん) の本物のレッスン (LP-16)。
 * 文言はすべて ひらがな + わかちがき (LP-16 の指示による暫定)。
 * workedExample.problem / faded[].problem は generate("g5_average", mulberry32(seed), { level })
 * の実際の出力をそのまま書き写したもの。
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";
import { defaultPrerequisites } from "../prereqs";

/* generate("g5_average", mulberry32(1001), { level: 2 }) */
const WORKED_PROBLEM: Problem = {
  skillId: "g5_average",
  text: "8 , 10 , 15 の 平きんは いくつ?",
  a: null,
  b: 3,
  op: null,
  answer: "11",
  choices: ["11", "12", "33"],
  hint: null,
  explain: ["ぜんぶ たすと 33", "平きん = 合計 ÷ こ数", "33 ÷ 3 = 11"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "ぜんぶ たすと 33",
    "ぜんぶ たすと 33 平きん = 合計 ÷ こ数 33 ÷ 3 = 11",
  ],
};

/* generate("g5_average", mulberry32(2001), { level: 1 }) */
const FADED_1: Problem = {
  skillId: "g5_average",
  text: "9 , 9 の 平きんは いくつ?",
  a: null,
  b: 2,
  op: null,
  answer: "9",
  choices: ["18", "10", "9"],
  hint: null,
  explain: ["ぜんぶ たすと 18", "平きん = 合計 ÷ こ数", "18 ÷ 2 = 9"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "ぜんぶ たすと 18",
    "ぜんぶ たすと 18 平きん = 合計 ÷ こ数 18 ÷ 2 = 9",
  ],
};

/* generate("g5_average", mulberry32(3001), { level: 1 }) */
const FADED_2: Problem = {
  skillId: "g5_average",
  text: "8 , 8 , 14 の 平きんは いくつ?",
  a: null,
  b: 3,
  op: null,
  answer: "10",
  choices: ["14", "10", "11"],
  hint: null,
  explain: ["ぜんぶ たすと 30", "平きん = 合計 ÷ こ数", "30 ÷ 3 = 10"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "ぜんぶ たすと 30",
    "ぜんぶ たすと 30 平きん = 合計 ÷ こ数 30 ÷ 3 = 10",
  ],
};

/* generate("g5_average", mulberry32(4001), { level: 1 }) */
const FADED_3: Problem = {
  skillId: "g5_average",
  text: "7 , 8 , 3 の 平きんは いくつ?",
  a: null,
  b: 3,
  op: null,
  answer: "6",
  choices: ["18", "6", "7"],
  hint: null,
  explain: ["ぜんぶ たすと 18", "平きん = 合計 ÷ こ数", "18 ÷ 3 = 6"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "ぜんぶ たすと 18",
    "ぜんぶ たすと 18 平きん = 合計 ÷ こ数 18 ÷ 3 = 6",
  ],
};

export const G5_AVERAGE: LessonDef = {
  skillId: "g5_average",
  title: "平きん",
  prerequisites: defaultPrerequisites("g5_average"),
  story: {
    pages: [
      "パーセンの たいいくさいで、チームごとの とくてんが ばらばらだよ。",
      "どのチームが いちばん がんばったか、へいきんで くらべたいんだ。",
    ],
  },
  concept: [
    {
      text: "かずを ならして そろえると くらべやすいよ。",
      figure: {
        kind: "balance",
        left: [{ label: "8", weight: 8 }],
        right: [{ label: "10", weight: 10 }],
      },
    },
    {
      text: "ぜんぶ たして、こすうで わると へいきんに なるよ。",
      figure: {
        kind: "tapeDiagram",
        segments: [
          { label: "8", length: 8 },
          { label: "10", length: 10 },
          { label: "15", length: 15 },
        ],
        total: "33",
      },
    },
    { text: "へいきんは、ちらばった かずを ひとつに まとめる ほうほうだよ。" },
  ],
  workedExample: {
    problem: WORKED_PROBLEM,
    steps: [
      {
        text: "ぜんぶ たすと 33に なるよ。",
        figure: {
          kind: "tapeDiagram",
          segments: [
            { label: "8", length: 8 },
            { label: "10", length: 10 },
            { label: "15", length: 15 },
          ],
          total: "33",
        },
      },
      { text: "こすうは 3こだよ。" },
      { text: "33 ÷ 3 = 11。こたえは 11だよ。" },
    ],
  },
  faded: [
    { problem: FADED_1, blanks: 1 },
    { problem: FADED_2, blanks: 1 },
    { problem: FADED_3, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "2から3この かずで れんしゅう" },
    { level: 2, label: "3から4この かずで ふつうの おおきさ" },
    { level: 3, label: "4から5この かずで おおきい あたい" },
  ],
  altExplain: [
    { text: "べつの かんがえかた: おおい ところから すくない ところへ わけると そろうよ。" },
    { text: "コップの みずを ならすのと おなじ かんがえかただよ。" },
  ],
  mistakes: [
    { pattern: "doubleCounted", feedback: "おなじ かずを 2かい たしていないか たしかめよう" },
    { pattern: "other", feedback: "こすうを まちがえていないか、もういちど かぞえよう" },
  ],
};
