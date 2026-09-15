/*
 * g2_add_column (たしざんの ひっさん) のレッスン (LP-13)。
 * workedExample / faded の problem は generate("g2_add_column", mulberry32(seed), { level })
 * の実際の出力をそのまま貼っている (手書きしない — §5 波4の共通仕様)。
 */

import type { LessonDef } from "../types";

/* prereqs.ts の DEFAULT_PREREQUISITES["g2_add_column"] と同じ値をハードコード。
 * defaultPrerequisites() を単元ファイルのモジュール直下で呼ぶと、prereqs.ts が
 * import グラフの起点になったとき (例: tests/prereqs.test.ts) に
 * prereqs.ts → index.ts → (この単元) → prereqs.ts の循環で
 * DEFAULT_PREREQUISITES への TDZ 参照エラーが起きるため、値を直接埋め込む */
export const G2_ADD_COLUMN: LessonDef = {
  skillId: "g2_add_column",
  title: "たしざんの ひっさん",
  prerequisites: ["g1_add_carry"],
  story: {
    pages: [
      "ミナトスの さかなやが、うりあげを ひっさんで たしざんできず こまっている。",
      "くらいを そろえて けいさんすれば、おおきな かずも たしざんできるよ。",
    ],
  },
  concept: [
    { text: "くらいを そろえて、いちのくらいから じゅんに たすよ。" },
    {
      text: "35+10。いちのくらいは 5+0=5。",
      figure: { kind: "columnCalc", op: "+", a: 35, b: 10, showCarry: false },
    },
    {
      text: "39+22。9+2=11。1 くりあげるよ。",
      figure: { kind: "columnCalc", op: "+", a: 39, b: 22, showCarry: true },
    },
    { text: "くりあがりは じゅうのくらいに 1を たすよ。" },
  ],
  workedExample: {
    problem: {
      skillId: "g2_add_column",
      text: "ひっさんで けいさんしよう\n68 + 35 = ?",
      a: 68,
      b: 35,
      op: "+",
      answer: "103",
      choices: ["101", "104", "103"],
      choiceTags: ["other", "offByOne", "other"],
      hint: null,
      explain: [
        "一のくらい: 8 + 5 = 13 → 3 をかいて 1くり上げる",
        "十のくらい: 6 + 3 + 1 = 10",
        "こたえは 103",
      ],
      hints: [
        "位を そろえて、一のくらいから じゅんに たしざんしよう",
        "一のくらい: 8 + 5 を けいさんしてみよう",
        "くり上がりに 気をつけて 十のくらいまで けいさんすると…",
      ],
    },
    steps: [
      {
        text: "くらいを そろえて かこう。",
        figure: { kind: "columnCalc", op: "+", a: 68, b: 35, showCarry: true, revealSteps: 0 },
      },
      {
        text: "8+5=13。3をかいて 1くりあげる。",
        figure: { kind: "columnCalc", op: "+", a: 68, b: 35, showCarry: true, revealSteps: 1 },
      },
      {
        text: "6+3+1=10。じゅうのくらいは 10。",
        figure: { kind: "columnCalc", op: "+", a: 68, b: 35, showCarry: true, revealSteps: 2 },
      },
      { text: "こたえは 103だよ。" },
    ],
  },
  faded: [
    {
      problem: {
        skillId: "g2_add_column",
        text: "ひっさんで けいさんしよう\n35 + 10 = ?",
        a: 35,
        b: 10,
        op: "+",
        answer: "45",
        choices: ["45", "55", "46"],
        choiceTags: ["other", "forgotCarry", "offByOne"],
        hint: null,
        explain: ["一のくらい: 5 + 0 = 5", "十のくらい: 3 + 1 = 4", "こたえは 45"],
        hints: [
          "位を そろえて、一のくらいから じゅんに たしざんしよう",
          "一のくらい: 5 + 0 を けいさんしてみよう",
          "くり上がりに 気をつけて 十のくらいまで けいさんすると…",
        ],
      },
      blanks: 1,
    },
    {
      problem: {
        skillId: "g2_add_column",
        text: "ひっさんで けいさんしよう\n39 + 22 = ?",
        a: 39,
        b: 22,
        op: "+",
        answer: "61",
        choices: ["59", "62", "61"],
        choiceTags: ["other", "offByOne", "other"],
        hint: null,
        explain: [
          "一のくらい: 9 + 2 = 11 → 1 をかいて 1くり上げる",
          "十のくらい: 3 + 2 + 1 = 6",
          "こたえは 61",
        ],
        hints: [
          "位を そろえて、一のくらいから じゅんに たしざんしよう",
          "一のくらい: 9 + 2 を けいさんしてみよう",
          "くり上がりに 気をつけて 十のくらいまで けいさんすると…",
        ],
      },
      blanks: 1,
    },
  ],
  levels: [
    { level: 1, label: "10から49までの たしざん" },
    { level: 2, label: "10から89までの たしざん" },
    { level: 3, label: "100から899までの たしざん (3けた)" },
  ],
  altExplain: [
    { text: "べつの みかた: 1のくらいが 10こ あつまったら、10のたばに かえよう。" },
    { text: "10のたばが ひとつ ふえると、じゅうのくらいが 1 ふえるよ。" },
  ],
  mistakes: [
    { pattern: "forgotCarry", feedback: "くりあがりを わすれていないか たしかめよう。1を じゅうのくらいに たしてね" },
    { pattern: "echoOperand", feedback: "こたえは たしざんの けっかだよ。もとの かずを そのまま こたえに しない" },
    { pattern: "placeShift", feedback: "くらいが ずれていないか たしかめよう。いちのくらいは いちのくらいどうし" },
  ],
  coreOfChapter: true,
  /* なかまが教える場面 (LP-19)。タスクは「たしざんの いのり」の使い手 */
  companionLines: {
    tasuku: "くらいを そろえて たすのは、たしざんの いのりと おなじ かんじだよ!",
  },
};
