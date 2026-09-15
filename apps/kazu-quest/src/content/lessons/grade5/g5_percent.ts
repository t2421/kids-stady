/*
 * g5_percent (割合と 百分率) の本物のレッスン (LP-16)。
 * 章5の中核3単元のひとつ (coreOfChapter: true)。文言はすべて ひらがな +
 * わかちがき (LP-16 の指示による暫定)。workedExample.problem / faded[].problem は
 * generate("g5_percent", mulberry32(seed), { level }) の実際の出力を書き写した。
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";
import { defaultPrerequisites } from "../prereqs";

/* generate("g5_percent", mulberry32(1005), { level: 2 }) */
const WORKED_PROBLEM: Problem = {
  skillId: "g5_percent",
  text: "90この 50% は なんこ?",
  a: 90,
  b: 50,
  op: null,
  answer: "45",
  choices: ["50", "45", "450"],
  hint: null,
  explain: ["50% = 0.5", "90 × 0.5 = 45こ"],
  hints: ["%を 小数に なおしてから かけ算しよう", "50% は 小数で 0.5", "90 × 0.5 を けいさんすると…"],
};

/* generate("g5_percent", mulberry32(2005), { level: 1 }) */
const FADED_1: Problem = {
  skillId: "g5_percent",
  text: "120この うち 12こ は なん%?",
  a: 12,
  b: 120,
  op: null,
  answer: "10",
  choices: ["10", "90", "20"],
  hint: null,
  explain: ["12 ÷ 120 = 0.1", "100を かけて 10%"],
  hints: ["わり算してから 100を かけると 百分率に なるよ", "12 ÷ 120 を けいさんしてみよう", "0.1 に 100を かけると…"],
};

/* generate("g5_percent", mulberry32(3005), { level: 1 }) */
const FADED_2: Problem = {
  skillId: "g5_percent",
  text: "60この うち 30こ は なん%?",
  a: 30,
  b: 60,
  op: null,
  answer: "50",
  choices: ["30", "100", "50"],
  hint: null,
  explain: ["30 ÷ 60 = 0.5", "100を かけて 50%"],
  hints: ["わり算してから 100を かけると 百分率に なるよ", "30 ÷ 60 を けいさんしてみよう", "0.5 に 100を かけると…"],
};

/* generate("g5_percent", mulberry32(4005), { level: 1 }) */
const FADED_3: Problem = {
  skillId: "g5_percent",
  text: "80この 10% は なんこ?",
  a: 80,
  b: 10,
  op: null,
  answer: "8",
  choices: ["72", "10", "8"],
  hint: null,
  explain: ["10% = 0.1", "80 × 0.1 = 8こ"],
  hints: ["%を 小数に なおしてから かけ算しよう", "10% は 小数で 0.1", "80 × 0.1 を けいさんすると…"],
};

export const G5_PERCENT: LessonDef = {
  skillId: "g5_percent",
  title: "割合と 百分率",
  prerequisites: defaultPrerequisites("g5_percent"),
  story: {
    pages: [
      "バーゲンの まちの ねふだが きえて しまったよ。",
      "なんパーセント びきか よめなくて、ねだんが わからないんだ。",
    ],
  },
  concept: [
    {
      text: "100を ぜんぶとして かんがえよう。",
      figure: { kind: "percentBar", base: 100, part: 40 },
    },
    {
      text: "50%は はんぶん、100%は ぜんぶだよ。",
      figure: { kind: "percentBar", base: 100, part: 50, label: "50%" },
    },
    { text: "パーセントを しょうすうに なおすと けいさんしやすいよ。" },
  ],
  workedExample: {
    problem: WORKED_PROBLEM,
    steps: [
      {
        text: "50%を しょうすうに なおすと 0.5だよ。",
        figure: { kind: "percentBar", base: 90, part: 45, label: "50%" },
      },
      { text: "90 × 0.5を けいさんするよ。" },
      { text: "こたえは 45こだよ。" },
    ],
  },
  faded: [
    { problem: FADED_1, blanks: 1 },
    { problem: FADED_2, blanks: 1 },
    { problem: FADED_3, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "きりのいい 10・20・50パーセント" },
    { level: 2, label: "いろいろな パーセント" },
    { level: 3, label: "こまかい パーセントと おおきい かず" },
  ],
  altExplain: [
    { text: "べつの かんがえかた: ○%は 100こちゅうの ○こと おなじだよ。" },
    { text: "わりあいは ぶんすうで かんがえてもいいよ。50%は 1/2だよ。" },
  ],
  mistakes: [
    { pattern: "swappedBase", feedback: "どちらが もとにする りょうか たしかめよう" },
    { pattern: "reversedDivision", feedback: "わりざんの じゅんばんが ぎゃくかも。わられるかずを さきに かこう" },
    { pattern: "other", feedback: "100を かけるのを わすれていないかな" },
  ],
  coreOfChapter: true,
};
