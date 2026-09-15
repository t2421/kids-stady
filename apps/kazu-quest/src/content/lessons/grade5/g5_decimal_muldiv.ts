/*
 * g5_decimal_muldiv (小数の かけ算わり算) の本物のレッスン (LP-16)。
 * 章5の中核3単元のひとつ (coreOfChapter: true)。文言はすべて ひらがな +
 * わかちがき (LP-16 の指示による暫定)。workedExample.problem / faded[].problem は
 * generate("g5_decimal_muldiv", mulberry32(seed), { level }) の実際の出力を書き写した。
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";
import { defaultPrerequisites } from "../prereqs";

/* generate("g5_decimal_muldiv", mulberry32(1002), { level: 2 }) */
const WORKED_PROBLEM: Problem = {
  skillId: "g5_decimal_muldiv",
  text: "5.6 × 5 = ?",
  a: 56,
  b: 5,
  op: "×",
  answer: "28",
  choices: ["280", "28", "29"],
  hint: null,
  explain: [
    "まず 小数点を わすれて 56 × 5 = 280",
    "かけられる数に 小数点が 1つ あるので 1けた もどす",
    "こたえは 28",
  ],
  hints: [
    "じゅんばんに かんがえてみよう",
    "まず 小数点を わすれて 56 × 5 = 280",
    "まず 小数点を わすれて 56 × 5 = 280 かけられる数に 小数点が 1つ あるので 1けた もどす こたえは 28",
  ],
};

/* generate("g5_decimal_muldiv", mulberry32(5002), { level: 1 }) */
const FADED_1: Problem = {
  skillId: "g5_decimal_muldiv",
  text: "3.2 ÷ 2 = ?",
  a: 32,
  b: 2,
  op: "÷",
  answer: "1.6",
  choices: ["1.6", "2.6", "16"],
  hint: null,
  explain: ["32 ÷ 2 = 16 と かんがえる", "小数点の いちを そろえて もどす", "こたえは 1.6"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "32 ÷ 2 = 16 と かんがえる",
    "32 ÷ 2 = 16 と かんがえる 小数点の いちを そろえて もどす こたえは 1.6",
  ],
};

/* generate("g5_decimal_muldiv", mulberry32(6002), { level: 1 }) */
const FADED_2: Problem = {
  skillId: "g5_decimal_muldiv",
  text: "2.8 × 3 = ?",
  a: 28,
  b: 3,
  op: "×",
  answer: "8.4",
  choices: ["8.4", "9.4", "0.84"],
  hint: null,
  explain: [
    "まず 小数点を わすれて 28 × 3 = 84",
    "かけられる数に 小数点が 1つ あるので 1けた もどす",
    "こたえは 8.4",
  ],
  hints: [
    "じゅんばんに かんがえてみよう",
    "まず 小数点を わすれて 28 × 3 = 84",
    "まず 小数点を わすれて 28 × 3 = 84 かけられる数に 小数点が 1つ あるので 1けた もどす こたえは 8.4",
  ],
};

/* generate("g5_decimal_muldiv", mulberry32(9002), { level: 1 }) */
const FADED_3: Problem = {
  skillId: "g5_decimal_muldiv",
  text: "11.6 ÷ 4 = ?",
  a: 116,
  b: 4,
  op: "÷",
  answer: "2.9",
  choices: ["2.9", "3.9", "29"],
  hint: null,
  explain: ["116 ÷ 4 = 29 と かんがえる", "小数点の いちを そろえて もどす", "こたえは 2.9"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "116 ÷ 4 = 29 と かんがえる",
    "116 ÷ 4 = 29 と かんがえる 小数点の いちを そろえて もどす こたえは 2.9",
  ],
};

export const G5_DECIMAL_MULDIV: LessonDef = {
  skillId: "g5_decimal_muldiv",
  title: "小数の かけ算わり算",
  prerequisites: defaultPrerequisites("g5_decimal_muldiv"),
  story: {
    pages: [
      "パーセンの いちばで、ねだんの けいさんが ぐちゃぐちゃに なっちゃった。",
      "しょうすうの かけざん わりざんが できないと、ただしい ねだんが だせないんだ。",
    ],
  },
  concept: [
    {
      text: "しょうすうは くらいを そろえて かんがえるよ。",
      figure: { kind: "placeValue", value: "5.6", highlightDigit: 0 },
    },
    {
      text: "しょうすうてんを わすれて せいすうとして けいさんしよう。",
      figure: { kind: "columnCalc", op: "×", a: 56, b: 5, showCarry: true },
    },
    { text: "さいごに しょうすうてんを もとの いちに もどすよ。" },
  ],
  workedExample: {
    problem: WORKED_PROBLEM,
    steps: [
      {
        text: "しょうすうてんを わすれて 56 × 5を けいさんしよう。",
        figure: { kind: "columnCalc", op: "×", a: 56, b: 5 },
      },
      { text: "56 × 5 = 280に なるよ。" },
      { text: "5.6は しょうすうてんが 1つぶんだから、1けた もどすよ。" },
      { text: "こたえは 28だよ。" },
    ],
  },
  faded: [
    { problem: FADED_1, blanks: 1 },
    { problem: FADED_2, blanks: 1 },
    { problem: FADED_3, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "しょうすう 1.1から3.0と 2から4" },
    { level: 2, label: "しょうすう 1.2から9.5と 2から9" },
    { level: 3, label: "しょうすう 10.0から99.9と 2から12" },
  ],
  altExplain: [
    { text: "べつの かんがえかた: 5.6は 56/10と おなじだよ。" },
    { text: "ぶんすうの まま けいさんして、さいごに しょうすうに もどそう。" },
  ],
  mistakes: [
    { pattern: "placeShift", feedback: "しょうすうてんの いちが ずれてるよ。もういちど かぞえよう" },
    {
      pattern: "reversedDivision",
      feedback: "わるかずと わられるかずが ぎゃくかも。もういちど よみなおそう",
    },
    { pattern: "other", feedback: "けたを ひとつ おおく うごかしていないか たしかめよう" },
  ],
  coreOfChapter: true,
};
