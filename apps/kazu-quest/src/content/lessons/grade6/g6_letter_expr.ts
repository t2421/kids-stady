/*
 * g6_letter_expr (文字と 式) — 章6「ゼロのあなと 下の世界ネガリア」(LP-17)。
 * ホシオキの遺跡に刻まれた 古いしきの なぞ、というフック。workedExample/faded の
 * problem は generate("g6_letter_expr", mulberry32(seed), {level:2}) の実際の
 * 出力をそのまま貼っている。
 */

import type { LessonDef } from "../types";
import { defaultPrerequisites } from "../prereqs";

export const G6_LETTER_EXPR: LessonDef = {
  skillId: "g6_letter_expr",
  title: "文字と 式",
  prerequisites: defaultPrerequisites("g6_letter_expr"),
  story: {
    pages: [
      "ホシオキの いせきに ふるい しきが きざまれているよ。",
      "xを つかった しきの なぞを といて とびらを あけよう。",
    ],
  },
  concept: [
    { text: "わからない かずを xと おいて しきを つくるよ。" },
    {
      text: "x + 3 = 8の xを もとめよう。",
      figure: { kind: "letterBox", expr: "x + 3 = 8" },
    },
    {
      text: "8 - 3 = 5。x = 5と わかるよ。",
      figure: { kind: "letterBox", expr: "x + 3 = 8", value: 5 },
    },
  ],
  workedExample: {
    problem: {
      skillId: "g6_letter_expr",
      text: "x = 5 のとき 3 × x + 11 は いくつ?",
      a: 5,
      b: 11,
      op: null,
      answer: "26",
      choices: ["15", "26", "48"],
      hint: null,
      explain: ["3 × 5 = 15", "15 + 11 = 26"],
      hints: ["じゅんばんに かんがえてみよう", "3 × 5 = 15", "3 × 5 = 15 15 + 11 = 26"],
    },
    steps: [
      {
        text: "x = 5を しきに あてはめるよ。",
        figure: { kind: "letterBox", expr: "3 × x + 11" },
      },
      { text: "3 × 5 = 15。" },
      { text: "15 + 11 = 26。こたえは 26だよ。" },
    ],
  },
  faded: [
    {
      problem: {
        skillId: "g6_letter_expr",
        text: "6 × x = 12 のとき x は いくつ?",
        a: 12,
        b: 6,
        op: "÷",
        answer: "2",
        choices: ["12", "2", "6"],
        hint: null,
        explain: ["x = 12 ÷ 6", "x = 2"],
        hints: ["じゅんばんに かんがえてみよう", "x = 12 ÷ 6", "x = 12 ÷ 6 x = 2"],
      },
      blanks: 1,
    },
    {
      problem: {
        skillId: "g6_letter_expr",
        text: "x + 30 = 33 のとき x は いくつ?",
        a: 33,
        b: 30,
        op: "-",
        answer: "3",
        choices: ["63", "3", "33"],
        hint: null,
        explain: ["x = 33 - 30", "x = 3"],
        hints: ["じゅんばんに かんがえてみよう", "x = 33 - 30", "x = 33 - 30 x = 3"],
      },
      blanks: 1,
    },
  ],
  levels: [
    { level: 1, label: "ちいさい かずで xを もとめる" },
    { level: 2, label: "すこし おおきい かずで" },
    { level: 3, label: "おおきい かずや ふくざつな しき" },
  ],
  altExplain: [
    { text: "べつの せつめい: xは てんびんの りょうがわが つりあう かずだよ。" },
  ],
  mistakes: [
    { pattern: "reversedDivision", feedback: "かけ算の ぎゃくは わり算だよ。むきを たしかめよう" },
    { pattern: "echoOperand", feedback: "しきの中の かずを そのまま こたえに しないように しよう" },
    { pattern: "other", feedback: "xに こたえを あてはめて けんざんしてみよう" },
  ],
};
