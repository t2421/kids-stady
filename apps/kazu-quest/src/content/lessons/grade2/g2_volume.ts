/*
 * g2_volume (かさ L/dL) のレッスン (LP-13)。
 * workedExample / faded の problem は generate("g2_volume", mulberry32(seed), { level })
 * の実際の出力をそのまま貼っている (手書きしない — §5 波4の共通仕様)。
 */

import type { LessonDef } from "../types";

/* prereqs.ts の DEFAULT_PREREQUISITES に "g2_volume" キーは無い (既定 []) ので
 * その値をハードコード。defaultPrerequisites() を単元ファイルのモジュール直下で
 * 呼ぶと、prereqs.ts が import グラフの起点になったとき (例: tests/prereqs.test.ts)
 * に prereqs.ts → index.ts → (この単元) → prereqs.ts の循環で
 * DEFAULT_PREREQUISITES への TDZ 参照エラーが起きるため、値を直接埋め込む */
export const G2_VOLUME: LessonDef = {
  skillId: "g2_volume",
  title: "かさ (L/dL)",
  prerequisites: [],
  story: {
    pages: [
      "ククリむらの ぼくじょうで、ミルクの かさを Lと dLで まちがえて こまっている。",
      "1Lは 10dLと おなじ かさだよ。たんいを そろえて かんがえよう。",
    ],
  },
  concept: [
    { text: "Lと dLの かんけいを かくにんしよう。1L=10dL。" },
    {
      text: "10dLの カップに 5dL はいっているよ。",
      figure: { kind: "measureCup", capacityDl: 10, filledDl: 5 },
    },
    {
      text: "10dLで ちょうど 1Lに なるよ。",
      figure: { kind: "measureCup", capacityDl: 10, filledDl: 10 },
    },
    { text: "はしたの dLは、Lの めもりの あいだを かぞえるよ。" },
  ],
  workedExample: {
    problem: {
      skillId: "g2_volume",
      text: "3L3dL は なんdL?",
      a: 3,
      b: 3,
      op: null,
      answer: "33",
      choices: ["32", "33", "330"],
      choiceTags: ["offByOne", "other", "placeShift"],
      hint: null,
      explain: ["3L = 30dL", "30dL + 3dL = 33dL"],
      hints: ["じゅんばんに かんがえてみよう", "3L = 30dL", "3L = 30dL 30dL + 3dL = 33dL"],
    },
    steps: [
      {
        text: "3Lは 30dLだよ。",
        figure: { kind: "measureCup", capacityDl: 40, filledDl: 30 },
      },
      { text: "3L=30dL。1L=10dLだから。" },
      {
        text: "30dLに のこりの 3dLを たすよ。",
        figure: { kind: "measureCup", capacityDl: 40, filledDl: 33 },
      },
      { text: "30+3=33。こたえは 33dL。" },
    ],
  },
  faded: [
    {
      problem: {
        skillId: "g2_volume",
        text: "2L は なんdL?",
        a: 2,
        b: null,
        op: null,
        answer: "20",
        choices: ["200", "21", "20"],
        choiceTags: ["placeShift", "offByOne", "other"],
        hint: null,
        explain: ["1L = 10dL だから", "2L = 20dL"],
        hints: ["じゅんばんに かんがえてみよう", "1L = 10dL だから", "1L = 10dL だから 2L = 20dL"],
      },
      blanks: 1,
    },
    {
      problem: {
        skillId: "g2_volume",
        text: "1L5dL は なんdL?",
        a: 1,
        b: 5,
        op: null,
        answer: "15",
        choices: ["1", "15", "150"],
        choiceTags: ["echoOperand", "other", "placeShift"],
        hint: null,
        explain: ["1L = 10dL", "10dL + 5dL = 15dL"],
        hints: ["じゅんばんに かんがえてみよう", "1L = 10dL", "1L = 10dL 10dL + 5dL = 15dL"],
      },
      blanks: 1,
    },
  ],
  levels: [
    { level: 1, label: "2から5Lの かさ" },
    { level: 2, label: "2から9Lと dLの かさ" },
    { level: 3, label: "10から20Lの かさ" },
  ],
  altExplain: [
    { text: "べつの みかた: Lを 10ばいすると dLに なるよ。" },
    { text: "3Lなら 3×10=30。だから 3L=30dLだよ。" },
  ],
  mistakes: [
    { pattern: "unitConfusion", feedback: "Lと dLを まちがえていないか たしかめよう" },
    { pattern: "placeShift", feedback: "10ばいすると くらいが ひとつ うごくよ。0を わすれずに" },
    { pattern: "echoOperand", feedback: "こたえは dLに かえたあとの かずだよ。Lの かずを そのまま こたえに しない" },
  ],
};
