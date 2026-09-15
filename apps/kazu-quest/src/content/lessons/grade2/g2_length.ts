/*
 * g2_length (ながさ cm/mm) のレッスン (LP-13)。
 * workedExample / faded の problem は generate("g2_length", mulberry32(seed), { level })
 * の実際の出力をそのまま貼っている (手書きしない — §5 波4の共通仕様)。
 */

import type { LessonDef } from "../types";

/* prereqs.ts の DEFAULT_PREREQUISITES に "g2_length" キーは無い (既定 []) ので
 * その値をハードコード。defaultPrerequisites() を単元ファイルのモジュール直下で
 * 呼ぶと、prereqs.ts が import グラフの起点になったとき (例: tests/prereqs.test.ts)
 * に prereqs.ts → index.ts → (この単元) → prereqs.ts の循環で
 * DEFAULT_PREREQUISITES への TDZ 参照エラーが起きるため、値を直接埋め込む */
export const G2_LENGTH: LessonDef = {
  skillId: "g2_length",
  title: "ながさ (cm/mm)",
  prerequisites: [],
  story: {
    pages: [
      "ミナトスの だいくが、いたの ながさを cmと mmで まちがえて こまっている。",
      "1cmは 10mmと おなじ ながさだよ。たんいを そろえて かんがえよう。",
    ],
  },
  concept: [
    { text: "cmと mmの かんけいを かくにんしよう。1cm=10mm。" },
    {
      text: "0から5cmまでの めもりを みてみよう。",
      figure: { kind: "numberLine", from: 0, to: 5, step: 1 },
    },
    {
      text: "0から3cmの ところに いろを つけたよ。",
      figure: { kind: "numberLine", from: 0, to: 5, step: 1, highlight: [0, 3] },
    },
    { text: "はしたの mmは、cmの めもりの あいだを かぞえるよ。" },
  ],
  workedExample: {
    problem: {
      skillId: "g2_length",
      text: "3cm3mm は なんmm?",
      a: 3,
      b: 3,
      op: null,
      answer: "33",
      choices: ["32", "33", "330"],
      choiceTags: ["offByOne", "other", "placeShift"],
      hint: null,
      explain: ["3cm = 30mm", "30mm + 3mm = 33mm"],
      hints: ["じゅんばんに かんがえてみよう", "3cm = 30mm", "3cm = 30mm 30mm + 3mm = 33mm"],
    },
    steps: [
      {
        text: "3cmの ところまで すすもう。",
        figure: { kind: "numberLine", from: 0, to: 4, step: 1, highlight: [0, 3] },
      },
      { text: "3cm=30mm。1cm=10mmだから。" },
      { text: "30mmに のこりの 3mmを たすよ。" },
      { text: "30+3=33。こたえは 33mm。" },
    ],
  },
  faded: [
    {
      problem: {
        skillId: "g2_length",
        text: "2cm は なんmm?",
        a: 2,
        b: null,
        op: null,
        answer: "20",
        choices: ["200", "21", "20"],
        choiceTags: ["placeShift", "offByOne", "other"],
        hint: null,
        explain: ["1cm = 10mm だから", "2cm = 20mm"],
        hints: ["じゅんばんに かんがえてみよう", "1cm = 10mm だから", "1cm = 10mm だから 2cm = 20mm"],
      },
      blanks: 1,
    },
    {
      problem: {
        skillId: "g2_length",
        text: "1cm5mm は なんmm?",
        a: 1,
        b: 5,
        op: null,
        answer: "15",
        choices: ["1", "15", "150"],
        choiceTags: ["echoOperand", "other", "placeShift"],
        hint: null,
        explain: ["1cm = 10mm", "10mm + 5mm = 15mm"],
        hints: ["じゅんばんに かんがえてみよう", "1cm = 10mm", "1cm = 10mm 10mm + 5mm = 15mm"],
      },
      blanks: 1,
    },
  ],
  levels: [
    { level: 1, label: "2から5cmの ながさ" },
    { level: 2, label: "2から9cmと mmの ながさ" },
    { level: 3, label: "10から99cmの ながさ" },
  ],
  altExplain: [
    { text: "べつの みかた: cmを 10ばいすると mmに なるよ。" },
    { text: "3cmなら 3×10=30。だから 3cm=30mmだよ。" },
  ],
  mistakes: [
    { pattern: "unitConfusion", feedback: "cmと mmを まちがえていないか たしかめよう" },
    { pattern: "placeShift", feedback: "10ばいすると くらいが ひとつ うごくよ。0を わすれずに" },
    { pattern: "echoOperand", feedback: "こたえは mmに かえたあとの かずだよ。cmの かずを そのまま こたえに しない" },
  ],
};
