/*
 * g4_area (面せき) のレッスン本文 (LP-15)。
 * workedExample/faded の問題は generate("g4_area", mulberry32(seed), { level })
 * の実出力をそのまま貼っている (tests/_scratch_grade4.test.ts で確認・転記)。
 * 本文は §1.7 の規約どおり、小4でもひらがな + わかちがき
 * (LessonPageBody が ｜漢字《ルビ》 を描画しないための当面の回避)。
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";

const workedProblem: Problem = {
  skillId: "g4_area",
  text: "1ぺんが 3cm の 正方形の 面せきは なんcm²?",
  a: 3,
  b: 3,
  op: "×",
  answer: "9",
  choices: ["9", "12", "6"],
  hint: null,
  explain: ["正方形の 面せき = 1ぺん × 1ぺん", "3 × 3 = 9cm²"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "正方形の 面せき = 1ぺん × 1ぺん",
    "正方形の 面せき = 1ぺん × 1ぺん 3 × 3 = 9cm²",
  ],
};

const fadedProblem1: Problem = {
  skillId: "g4_area",
  text: "1ぺんが 7cm の 正方形の 面せきは なんcm²?",
  a: 7,
  b: 7,
  op: "×",
  answer: "49",
  choices: ["49", "56", "14"],
  hint: null,
  explain: ["正方形の 面せき = 1ぺん × 1ぺん", "7 × 7 = 49cm²"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "正方形の 面せき = 1ぺん × 1ぺん",
    "正方形の 面せき = 1ぺん × 1ぺん 7 × 7 = 49cm²",
  ],
};

const fadedProblem2: Problem = {
  skillId: "g4_area",
  text: "1ぺんが 13cm の 正方形の 面せきは なんcm²?",
  a: 13,
  b: 13,
  op: "×",
  answer: "169",
  choices: ["26", "182", "169"],
  hint: null,
  explain: ["正方形の 面せき = 1ぺん × 1ぺん", "13 × 13 = 169cm²"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "正方形の 面せき = 1ぺん × 1ぺん",
    "正方形の 面せき = 1ぺん × 1ぺん 13 × 13 = 169cm²",
  ],
};

export const G4_AREA: LessonDef = {
  skillId: "g4_area",
  title: "面せき",
  prerequisites: [],
  story: {
    pages: [
      "こおりの いえを つくる だいくが、ゆかの めんせきが わからず こまっているよ。",
      "めんせきの もとめかたを おしえて あげよう。",
    ],
  },
  concept: [
    { text: "めんせきは、ひろさを ますの かずで あらわした もの。たんいは cm²だよ。" },
    {
      text: "たてと よこの ながさを かけると めんせきに なるよ。",
      figure: { kind: "areaGrid", w: 4, h: 3, unit: "cm" },
    },
    {
      text: "たてと よこが おなじ ながさでも おなじ かけざんで もとまるよ。",
      figure: { kind: "areaGrid", w: 3, h: 3, unit: "cm" },
    },
    { text: "こたえの たんいは わすれずに「cm²」を つけようね。" },
  ],
  workedExample: {
    problem: workedProblem,
    steps: [
      {
        text: "1ぺんが 3cmの ましかくの かたちだよ。",
        figure: { kind: "areaGrid", w: 3, h: 3, unit: "cm" },
      },
      { text: "3 × 3 = 9。ますが ぜんぶで 9こ あるね。" },
      { text: "こたえは 9cm²だよ。" },
    ],
  },
  faded: [
    { problem: fadedProblem1, blanks: 1 },
    { problem: fadedProblem2, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "ちいさい かずの めんせき" },
    { level: 2, label: "10だいの めんせき" },
    { level: 3, label: "おおきい かずの めんせき" },
  ],
  altExplain: [
    { text: "べつの せつめい: ようしを ますの かたちに おって、いくつ かさなるか かぞえてみよう。" },
    { text: "たてが よこより ながくても、かけざんの じゅんばんを かえても おなじ こたえだよ。" },
  ],
  mistakes: [
    { pattern: "echoOperand", feedback: "かけずに たしてしまったかも。たてと よこを かけざんしよう。" },
    { pattern: "unitConfusion", feedback: "たんいが cmの ままかも。めんせきは cm²だよ。" },
    { pattern: "other", feedback: "ますの かずを かぞえまちがえたかも。もういちど たしかめよう。" },
  ],
};
