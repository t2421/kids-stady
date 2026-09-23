/*
 * g2_sub_column (ひきざんの ひっさん) のレッスン (LP-13)。
 * workedExample / faded の problem は generate("g2_sub_column", mulberry32(seed), { level })
 * の実際の出力をそのまま貼っている (手書きしない — §5 波4の共通仕様)。
 */

import type { LessonDef } from "../types";

/* prereqs.ts の DEFAULT_PREREQUISITES["g2_sub_column"] と同じ値をハードコード。
 * defaultPrerequisites() を単元ファイルのモジュール直下で呼ぶと、prereqs.ts が
 * import グラフの起点になったとき (例: tests/prereqs.test.ts) に
 * prereqs.ts → index.ts → (この単元) → prereqs.ts の循環で
 * DEFAULT_PREREQUISITES への TDZ 参照エラーが起きるため、値を直接埋め込む */
export const G2_SUB_COLUMN: LessonDef = {
  skillId: "g2_sub_column",
  title: "ひきざんの ひっさん",
  prerequisites: ["g1_sub_borrow"],
  story: {
    pages: [
      "ククリむらの こめぐらで、のこりの かずを ひっさんで だせずに こまっている。",
      "くらいを そろえて、かりることを おぼえれば ひけるように なるよ。",
    ],
  },
  concept: [
    { text: "いちのくらいから じゅんに ひくよ。ひけないときは かりるよ。" },
    {
      text: "38-10。8-0=8。かんたんだね。",
      figure: { kind: "columnCalc", op: "-", a: 38, b: 10, showCarry: false },
    },
    {
      text: "40-33。0から3は ひけない。1かりるよ。",
      figure: { kind: "columnCalc", op: "-", a: 40, b: 33, showCarry: true },
    },
    { text: "じゅうのくらいから 1かりて、10にして ひくよ。" },
  ],
  workedExample: {
    problem: {
      skillId: "g2_sub_column",
      text: "ひっさんで けいさんしよう\n32 - 23 = ?",
      a: 32,
      b: 23,
      op: "-",
      answer: "9",
      choices: ["10", "9", "32"],
      choiceTags: ["offByOne", "other", "echoOperand"],
      hint: null,
      explain: [
        "一のくらい: 2 から 3 は ひけない → 十のくらいから 1かりる",
        "12 - 3 = 9",
        "十のくらい: 2 - 2 = 0",
        "こたえは 9",
      ],
      hints: [
        "くらいを そろえて、一のくらいから じゅんに ひきざんしよう",
        "一のくらい: 2 から 3 を ひけるかな",
        "くり下がりに 気をつけて 十のくらいまで けいさんすると…",
      ],
    },
    steps: [
      {
        text: "くらいを そろえて かこう。",
        figure: { kind: "columnCalc", op: "-", a: 32, b: 23, showCarry: true, revealSteps: 0 },
      },
      {
        text: "2から3は ひけない。10かりて 12-3=9。",
        figure: { kind: "columnCalc", op: "-", a: 32, b: 23, showCarry: true, revealSteps: 1 },
      },
      {
        text: "じゅうのくらいは 1かりたので 2。2-2=0。",
        figure: { kind: "columnCalc", op: "-", a: 32, b: 23, showCarry: true, revealSteps: 2 },
      },
      { text: "こたえは 9だよ。" },
    ],
  },
  faded: [
    {
      problem: {
        skillId: "g2_sub_column",
        text: "ひっさんで けいさんしよう\n38 - 10 = ?",
        a: 38,
        b: 10,
        op: "-",
        answer: "28",
        choices: ["28", "38", "29"],
        choiceTags: ["other", "forgotCarry", "offByOne"],
        hint: null,
        explain: ["一のくらい: 8 - 0 = 8", "十のくらい: 3 - 1 = 2", "こたえは 28"],
        hints: [
          "くらいを そろえて、一のくらいから じゅんに ひきざんしよう",
          "一のくらい: 8 から 0 を ひけるかな",
          "くり下がりに 気をつけて 十のくらいまで けいさんすると…",
        ],
      },
      blanks: 1,
    },
    {
      problem: {
        skillId: "g2_sub_column",
        text: "ひっさんで けいさんしよう\n40 - 33 = ?",
        a: 40,
        b: 33,
        op: "-",
        answer: "7",
        choices: ["5", "7", "33"],
        choiceTags: ["other", "other", "echoOperand"],
        hint: null,
        explain: [
          "一のくらい: 0 から 3 は ひけない → 十のくらいから 1かりる",
          "10 - 3 = 7",
          "十のくらい: 3 - 3 = 0",
          "こたえは 7",
        ],
        hints: [
          "くらいを そろえて、一のくらいから じゅんに ひきざんしよう",
          "一のくらい: 0 から 3 を ひけるかな",
          "くり下がりに 気をつけて 十のくらいまで けいさんすると…",
        ],
      },
      blanks: 1,
    },
  ],
  levels: [
    { level: 1, label: "20から49までの ひきざん" },
    { level: 2, label: "20から99までの ひきざん" },
    { level: 3, label: "200から999までの ひきざん (3けた)" },
  ],
  altExplain: [
    { text: "べつの みかた: ひけないときは、10のたばを ひとつ くずすよ。" },
    { text: "くずした 10と いちのくらいを あわせて、おおきい かずから ひくよ。" },
  ],
  mistakes: [
    { pattern: "forgotBorrow", feedback: "かりるのを わすれていないか たしかめよう。じゅうのくらいが 1へるよ" },
    { pattern: "echoOperand", feedback: "こたえは ひきざんの けっかだよ。ひかれる かずを そのまま こたえに しない" },
    { pattern: "placeShift", feedback: "くらいが ずれていないか たしかめよう。いちのくらいは いちのくらいどうし" },
  ],
};
