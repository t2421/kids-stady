/*
 * g4_decimal (小数の 計算) のレッスン本文 (LP-15)。第4章の中核単元で、
 * ボスの小数の魔人デシマロンに直結する物語フック。workedExample/faded の
 * 問題は generate("g4_decimal", mulberry32(seed), { level }) の実出力を
 * そのまま貼っている (tests/_scratch_grade4.test.ts で確認・転記)。
 * 本文は §1.7 の規約どおり、小4でもひらがな + わかちがき
 * (LessonPageBody が ｜漢字《ルビ》 を描画しないための当面の回避)。
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";

const workedProblem: Problem = {
  skillId: "g4_decimal",
  text: "0.6 - 0.36 = ?",
  a: 60,
  b: 36,
  op: "-",
  answer: "0.24",
  choices: ["0.34", "2.4", "0.24"],
  hint: null,
  explain: ["くらいを そろえて ひっさんする", "0.01が 60こ - 36こ = 24こ", "こたえは 0.24"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "くらいを そろえて ひっさんする",
    "くらいを そろえて ひっさんする 0.01が 60こ - 36こ = 24こ こたえは 0.24",
  ],
};

const fadedProblem1: Problem = {
  skillId: "g4_decimal",
  text: "1.44 - 0.5 = ?",
  a: 144,
  b: 50,
  op: "-",
  answer: "0.94",
  choices: ["0.95", "0.94", "9.4"],
  hint: null,
  explain: ["くらいを そろえて ひっさんする", "0.01が 144こ - 50こ = 94こ", "こたえは 0.94"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "くらいを そろえて ひっさんする",
    "くらいを そろえて ひっさんする 0.01が 144こ - 50こ = 94こ こたえは 0.94",
  ],
};

const fadedProblem2: Problem = {
  skillId: "g4_decimal",
  text: "1.46 - 0.43 = ?",
  a: 146,
  b: 43,
  op: "-",
  answer: "1.03",
  choices: ["1.04", "1.03", "1.13"],
  hint: null,
  explain: ["くらいを そろえて ひっさんする", "0.01が 146こ - 43こ = 103こ", "こたえは 1.03"],
  hints: [
    "じゅんばんに かんがえてみよう",
    "くらいを そろえて ひっさんする",
    "くらいを そろえて ひっさんする 0.01が 146こ - 43こ = 103こ こたえは 1.03",
  ],
};

export const G4_DECIMAL: LessonDef = {
  skillId: "g4_decimal",
  title: "小数の 計算",
  prerequisites: ["g3_decimal"],
  story: {
    pages: [
      "こおりの くにに あらわれた まじん デシマロンが、みずの りょうを めちゃくちゃに してしまった。",
      "しょうすうで ただしく けいさんして、みずの りょうを とりもどそう。",
    ],
  },
  concept: [
    { text: "しょうすうは、くらいを そろえて たしざん・ひきざんを するよ。" },
    {
      text: "0.6の「6」は 0.1の くらいだよ。",
      figure: { kind: "placeValue", value: "0.60", highlightDigit: 1 },
    },
    {
      text: "0.6から 0.36までの きょりを かんがえよう。",
      figure: { kind: "numberLine", from: 0, to: 1, step: 0.1, highlight: [0.36, 0.6] },
    },
    { text: "くらいを そろえて ひっさんすると まちがえにくいよ。" },
  ],
  workedExample: {
    problem: workedProblem,
    steps: [
      {
        text: "0.6と 0.36の さを かんがえるよ。",
        figure: { kind: "numberLine", from: 0, to: 1, step: 0.1, highlight: [0.36, 0.6] },
      },
      { text: "0.01が 60こ − 36こ = 24こ。" },
      { text: "こたえは 0.24だよ。" },
    ],
  },
  faded: [
    { problem: fadedProblem1, blanks: 1 },
    { problem: fadedProblem2, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "ちいさい しょうすう" },
    { level: 2, label: "すこし おおきい しょうすう" },
    { level: 3, label: "おおきい しょうすう" },
  ],
  altExplain: [
    { text: "べつの せつめい: おかねに たとえると、1えんが 0.01と おなじ かんかくだよ。" },
    { text: "10こ あつまると くらいが ひとつ あがるのは、せいすうと おなじ しくみだよ。" },
  ],
  mistakes: [
    { pattern: "placeShift", feedback: "くらいが ずれているかも。てんの いちを そろえよう。" },
    { pattern: "forgotBorrow", feedback: "ひきざんで くり下がりを わすれたかも。もういちど ひっさんしよう。" },
    { pattern: "forgotCarry", feedback: "たしざんで くり上がりを わすれたかも。くらいを たしかめよう。" },
    { pattern: "other", feedback: "こたえの けたすうが ちがうかも。もういちど けいさんしよう。" },
  ],
  coreOfChapter: true,
  /* なかまが教える場面 (LP-19)。リトルは 小数・分数の まほうの つかいて */
  companionLines: {
    little: "0.1が 10こ あつまれば 1。くらいさえ そろえれば しょうすうも こわくないわ。",
  },
};
