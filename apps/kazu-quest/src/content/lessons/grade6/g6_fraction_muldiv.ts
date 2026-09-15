/*
 * g6_fraction_muldiv (分数の かけ算わり算) — 章6の中核単元 (LP-17)。
 * ノコリビの村の くすりやが 分量を分数で分けられず困る、というフック。
 * workedExample/faded の problem は generate("g6_fraction_muldiv", mulberry32(seed),
 * {level:2}) の実際の出力をそのまま貼っている。
 */

import type { LessonDef } from "../types";
import { defaultPrerequisites } from "../prereqs";

export const G6_FRACTION_MULDIV: LessonDef = {
  skillId: "g6_fraction_muldiv",
  title: "分数の かけ算わり算",
  prerequisites: defaultPrerequisites("g6_fraction_muldiv"),
  story: {
    pages: [
      "ノコリビの むらの くすりやが こまっているよ。",
      "くすりの ざいりょうを ぶんすうで わけなければ ならないんだ。",
    ],
  },
  concept: [
    { text: "ぶんすうに せいすうを かけたり わったり してみよう。" },
    {
      text: "これは 2/3だよ。3つに わけた 2つぶんだよ。",
      figure: { kind: "fractionBar", parts: 3, filled: 2 },
    },
    {
      text: "ぶんぼが おおきいほど 1つぶんが ちいさく なるよ。",
      figure: { kind: "fractionBar", parts: 6, filled: 2 },
    },
  ],
  workedExample: {
    problem: {
      skillId: "g6_fraction_muldiv",
      text: "2/5 × 4/5 = ?",
      a: 2,
      b: 4,
      op: "×",
      answer: "8/25",
      choices: ["8/25", "6/10", "9/25"],
      hint: null,
      explain: [
        "分数どうしは 分子は 分子、分母は 分母で かける",
        "2 × 4 = 8、5 × 5 = 25",
        "やくぶんして 8/25",
      ],
      hints: [
        "じゅんばんに かんがえてみよう",
        "分数どうしは 分子は 分子、分母は 分母で かける",
        "分数どうしは 分子は 分子、分母は 分母で かける 2 × 4 = 8、5 × 5 = 25 やくぶんして 8/25",
      ],
    },
    steps: [
      {
        text: "ぶんし どうし、ぶんぼ どうしを かけるよ。",
        figure: { kind: "fractionBar", parts: 5, filled: 2 },
      },
      { text: "2 × 4 = 8。これが あたらしい ぶんしだよ。" },
      { text: "5 × 5 = 25。8/25が こたえだよ。" },
    ],
  },
  faded: [
    {
      problem: {
        skillId: "g6_fraction_muldiv",
        text: "2/3 ÷ 6 = ?",
        a: 2,
        b: 6,
        op: "÷",
        answer: "1/9",
        choices: ["1/9", "12/3", "2/9"],
        hint: null,
        explain: ["整数で わるときは 分母に かける", "3 × 6 = 18", "こたえは 1/9"],
        hints: [
          "じゅんばんに かんがえてみよう",
          "整数で わるときは 分母に かける",
          "整数で わるときは 分母に かける 3 × 6 = 18 こたえは 1/9",
        ],
      },
      blanks: 1,
    },
    {
      problem: {
        skillId: "g6_fraction_muldiv",
        text: "2/3 × 5 = ?",
        a: 2,
        b: 5,
        op: "×",
        answer: "10/3",
        choices: ["2/15", "10/3", "11/3"],
        hint: null,
        explain: ["整数を かけるときは 分子に かける", "2 × 5 = 10", "こたえは 10/3"],
        hints: [
          "じゅんばんに かんがえてみよう",
          "整数を かけるときは 分子に かける",
          "整数を かけるときは 分子に かける 2 × 5 = 10 こたえは 10/3",
        ],
      },
      blanks: 1,
    },
  ],
  levels: [
    { level: 1, label: "ぶんぼが ちいさい もんだい" },
    { level: 2, label: "ぶんぼが すこし おおきい もんだい" },
    { level: 3, label: "ぶんぼも せいすうも おおきい もんだい" },
  ],
  altExplain: [
    { text: "べつの せつめい: ぶんすうの わりざんは ぎゃくすうを かけるのと おなじだよ。" },
  ],
  mistakes: [
    { pattern: "reversedDivision", feedback: "わりざんの むきが ぎゃくに なっていないか たしかめよう" },
    { pattern: "addedDenominators", feedback: "ぶんぼどうしは たすのでは なく かけるよ" },
    { pattern: "other", feedback: "さいごに やくぶん できないか かくにんしよう" },
  ],
  coreOfChapter: true,
};
