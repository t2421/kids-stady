/*
 * g4_fraction_same (同分母の 分数) のレッスン本文 (LP-15)。
 * workedExample/faded の問題は generate("g4_fraction_same", mulberry32(seed), { level })
 * の実出力をそのまま貼っている (tests/_scratch_grade4.test.ts で確認・転記)。
 * 本文は §1.7 の規約どおり、小4でもひらがな + わかちがき
 * (LessonPageBody が ｜漢字《ルビ》 を描画しないための当面の回避)。
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";

const workedProblem: Problem = {
  skillId: "g4_fraction_same",
  text: "4/7 + 6/7 = ?",
  a: 4,
  b: 6,
  op: "+",
  answer: "10/7",
  choices: ["10/7", "10/14", "24/7"],
  hint: null,
  explain: ["分母は そのまま、分子だけ たす", "4 + 6 = 10", "こたえは 10/7"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "分母は そのまま、分子だけ たす",
    "分母は そのまま、分子だけ たす 4 + 6 = 10 こたえは 10/7",
  ],
};

const fadedProblem1: Problem = {
  skillId: "g4_fraction_same",
  text: "6/8 + 3/8 = ?",
  a: 6,
  b: 3,
  op: "+",
  answer: "9/8",
  choices: ["10/8", "9/8", "9/16"],
  hint: null,
  explain: ["分母は そのまま、分子だけ たす", "6 + 3 = 9", "こたえは 9/8"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "分母は そのまま、分子だけ たす",
    "分母は そのまま、分子だけ たす 6 + 3 = 9 こたえは 9/8",
  ],
};

const fadedProblem2: Problem = {
  skillId: "g4_fraction_same",
  text: "4/8 - 2/8 = ?",
  a: 4,
  b: 2,
  op: "-",
  answer: "1/4",
  choices: ["6/8", "1/4", "3/8"],
  hint: null,
  explain: ["分母は そのまま、分子だけ ひく", "4 - 2 = 2", "こたえは 1/4"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "分母は そのまま、分子だけ ひく",
    "分母は そのまま、分子だけ ひく 4 - 2 = 2 こたえは 1/4",
  ],
};

export const G4_FRACTION_SAME: LessonDef = {
  skillId: "g4_fraction_same",
  title: "同分母の 分数",
  prerequisites: ["g3_fraction"],
  story: {
    pages: [
      "おんせんの おゆを おなじ ぶんぼの ぶんすうで わけたいけど、たしひきが できずに こまっているよ。",
      "ぶんぼが おなじ ときの けいさんを おぼえよう。",
    ],
  },
  concept: [
    { text: "ぶんぼが おなじ ときは、ぶんしだけ たしたり ひいたり すればいいよ。" },
    {
      text: "4/7と 6/7を くらべてみよう。",
      figure: { kind: "fractionBar", parts: 7, filled: 4, second: { parts: 7, filled: 6 } },
    },
    {
      text: "ぶんしが ぶんぼより おおきいと 1より おおきい かずに なるよ。",
      figure: { kind: "fractionBar", parts: 5, filled: 5 },
    },
    { text: "ぶんぼは そのまま かえないのが ポイントだよ。" },
  ],
  workedExample: {
    problem: workedProblem,
    steps: [
      {
        text: "4/7と 6/7を あわせるよ。",
        figure: { kind: "fractionBar", parts: 7, filled: 4, second: { parts: 7, filled: 6 } },
      },
      { text: "ぶんしだけ たして 4 + 6 = 10。" },
      { text: "こたえは 10/7だよ。ぶんぼは 7の ままだよ。" },
    ],
  },
  faded: [
    { problem: fadedProblem1, blanks: 1 },
    { problem: fadedProblem2, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "ぶんぼが 5までの ぶんすう" },
    { level: 2, label: "ぶんぼが 9までの ぶんすう" },
    { level: 3, label: "ぶんぼが 12までの ぶんすう" },
  ],
  altExplain: [
    { text: "べつの せつめい: ピザを おなじ かずに きった ひときれを かぞえる イメージだよ。" },
    { text: "ぶんぼを たすのは まちがい。ぶんぼは きった かずだから かわらないよ。" },
  ],
  mistakes: [
    { pattern: "addedDenominators", feedback: "ぶんぼまで たしてしまったかも。ぶんぼは そのままだよ。" },
    { pattern: "echoOperand", feedback: "ぶんしを かけざんしたかも。たしざん・ひきざんの ままで いいよ。" },
    { pattern: "other", feedback: "ぶんしの けいさんが ちがうかも。もういちど たしかめよう。" },
  ],
};
