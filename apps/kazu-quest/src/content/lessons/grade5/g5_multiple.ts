/*
 * g5_multiple (倍数と 約数) の本物のレッスン (LP-16)。
 * 文言はすべて ひらがな + わかちがき (LP-16 の指示による暫定)。
 * workedExample.problem / faded[].problem は generate("g5_multiple", mulberry32(seed), { level })
 * の実際の出力をそのまま書き写した。
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";
import { defaultPrerequisites } from "../prereqs";

/* generate("g5_multiple", mulberry32(1004), { level: 2 }) */
const WORKED_PROBLEM: Problem = {
  skillId: "g5_multiple",
  text: "3 と 5 の 最小公倍数は?",
  a: 3,
  b: 5,
  op: null,
  answer: "15",
  choices: ["8", "15", "1"],
  hint: null,
  explain: ["3の 倍数: 3, 6, 9…", "5の 倍数: 5, 10, 15…", "はじめて そろうのは 15"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "3の 倍数: 3, 6, 9…",
    "3の 倍数: 3, 6, 9… 5の 倍数: 5, 10, 15… はじめて そろうのは 15",
  ],
};

/* generate("g5_multiple", mulberry32(2004), { level: 1 }) */
const FADED_1: Problem = {
  skillId: "g5_multiple",
  text: "3 と 5 の 最大公約数は?",
  a: 3,
  b: 5,
  op: null,
  answer: "1",
  choices: ["15", "1", "3"],
  hint: null,
  explain: ["3 も 5 も わりきれる 数を さがす", "いちばん 大きいのは 1"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "3 も 5 も わりきれる 数を さがす",
    "3 も 5 も わりきれる 数を さがす いちばん 大きいのは 1",
  ],
};

/* generate("g5_multiple", mulberry32(3004), { level: 1 }) */
const FADED_2: Problem = {
  skillId: "g5_multiple",
  text: "5 と 4 の 最小公倍数は?",
  a: 5,
  b: 4,
  op: null,
  answer: "20",
  choices: ["20", "9", "1"],
  hint: null,
  explain: ["5の 倍数: 5, 10, 15…", "4の 倍数: 4, 8, 12…", "はじめて そろうのは 20"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "5の 倍数: 5, 10, 15…",
    "5の 倍数: 5, 10, 15… 4の 倍数: 4, 8, 12… はじめて そろうのは 20",
  ],
};

/* generate("g5_multiple", mulberry32(4004), { level: 1 }) */
const FADED_3: Problem = {
  skillId: "g5_multiple",
  text: "6 と 4 の 最小公倍数は?",
  a: 6,
  b: 4,
  op: null,
  answer: "12",
  choices: ["10", "12", "2"],
  hint: null,
  explain: ["6の 倍数: 6, 12, 18…", "4の 倍数: 4, 8, 12…", "はじめて そろうのは 12"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "6の 倍数: 6, 12, 18…",
    "6の 倍数: 6, 12, 18… 4の 倍数: 4, 8, 12… はじめて そろうのは 12",
  ],
};

export const G5_MULTIPLE: LessonDef = {
  skillId: "g5_multiple",
  title: "倍数と 約数",
  prerequisites: defaultPrerequisites("g5_multiple"),
  story: {
    pages: [
      "しまに すむ ひとの かずを、おなじ にんずうの チームに わけたいんだ。",
      "でも どんな わけかたが できるか わからなくて こまっているよ。",
    ],
  },
  concept: [
    {
      text: "3の ばいすうを かぞえよう。3,6,9,12…",
      figure: { kind: "numberLine", from: 0, to: 15, step: 1, marks: [3, 6, 9, 12, 15] },
    },
    {
      text: "5の ばいすうも かぞえよう。5,10,15,20…",
      figure: { kind: "numberLine", from: 0, to: 20, step: 1, marks: [5, 10, 15, 20] },
    },
    { text: "りょうほうに でてくる かずが こうばいすうだよ。" },
  ],
  workedExample: {
    problem: WORKED_PROBLEM,
    steps: [
      {
        text: "3と5の ばいすうを ならべて くらべよう。",
        figure: { kind: "numberLine", from: 0, to: 15, step: 1, marks: [3, 5, 6, 9, 10, 12, 15] },
      },
      { text: "はじめて そろうのは 15だよ。" },
      { text: "こたえは 15。さいしょうこうばいすうは 15だよ。" },
    ],
  },
  faded: [
    { problem: FADED_1, blanks: 1 },
    { problem: FADED_2, blanks: 1 },
    { problem: FADED_3, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "2から6までの かずで れんしゅう" },
    { level: 2, label: "2から12までの かずで ふつう" },
    { level: 3, label: "2から24までの かずで むずかしい" },
  ],
  altExplain: [
    { text: "べつの かんがえかた: わりざんで わりきれるか ためしてみよう。" },
    { text: "1,2,3…と じゅんばんに わってみると、やくすうが みつかるよ。" },
  ],
  mistakes: [
    {
      pattern: "other",
      feedback: "さいしょうこうばいすうと さいだいこうやくすうを まちがえていないか たしかめよう",
    },
    { pattern: "doubleCounted", feedback: "おなじ ばいすうを 2かい かぞえていないか たしかめよう" },
    { pattern: "offByOne", feedback: "かぞえる かずが 1つ ずれていないか もういちど みてみよう" },
  ],
};
