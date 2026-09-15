/*
 * g2_kuku (九九) のレッスン (LP-13)。
 * workedExample / faded の problem は generate("g2_kuku", mulberry32(seed), { level })
 * の実際の出力をそのまま貼っている (手書きしない — §5 波4の共通仕様)。
 * 「九九」の表記は src/lib/curriculum/grade2.ts の explain/hints でも
 * ひらがな文中にそのまま使われている既存表記に合わせている。
 */

import type { LessonDef } from "../types";

/* prereqs.ts の DEFAULT_PREREQUISITES["g2_kuku"] と同じ値をハードコード。
 * defaultPrerequisites() を単元ファイルのモジュール直下で呼ぶと、prereqs.ts が
 * import グラフの起点になったとき (例: tests/prereqs.test.ts) に
 * prereqs.ts → index.ts → (この単元) → prereqs.ts の循環で
 * DEFAULT_PREREQUISITES への TDZ 参照エラーが起きるため、値を直接埋め込む */
export const G2_KUKU: LessonDef = {
  skillId: "g2_kuku",
  title: "九九",
  prerequisites: ["g1_add_nc"],
  story: {
    pages: [
      "みなとまち ミナトスの いちばで、さかなを はこに つめるのに てまどっている。",
      "九九の とうの けんじゃが「九九を おぼえれば はやく わかるよ」と おしえてくれた。",
    ],
  },
  concept: [
    { text: "九九ひょうを つかうと、かけざんが ひとめで わかるよ。" },
    {
      text: "5のだんを みてみよう。したに いくほど かずが ふえるね。",
      figure: { kind: "kukuTable", highlightRow: 5 },
    },
    {
      text: "5のだんの 3ばんめは 5×3=15だよ。",
      figure: { kind: "kukuTable", highlightRow: 5, highlightCol: 3 },
    },
    { text: "九九ひょうの たてとよこが こたえを おしえてくれるよ。" },
  ],
  workedExample: {
    problem: {
      skillId: "g2_kuku",
      text: "7 × 3 = ?",
      a: 7,
      b: 3,
      op: "×",
      answer: "21",
      choices: ["21", "28", "22"],
      choiceTags: ["other", "neighborRow", "offByOne"],
      hint: null,
      explain: ["7のだんの 九九だよ", "7 × 3 = 21", "「7を 3かい たす」のと おなじだね"],
      hints: [
        "7の だんを おもいだしてみよう",
        "7 を 3かい たすと どうなるかな",
        "7 × 3 を けいさんすると…",
      ],
    },
    steps: [
      {
        text: "7のだんの 3ばんめを 九九ひょうで さがそう。",
        figure: { kind: "kukuTable", highlightRow: 7, highlightCol: 3 },
      },
      {
        text: "7こずつ 3れつで ぜんぶ 21こ。",
        figure: { kind: "array", rows: 7, cols: 3, groupBy: "row" },
      },
      { text: "だから 7 × 3 = 21だよ。" },
    ],
  },
  faded: [
    {
      problem: {
        skillId: "g2_kuku",
        text: "5 × 3 = ?",
        a: 5,
        b: 3,
        op: "×",
        answer: "15",
        choices: ["15", "20", "16"],
        choiceTags: ["other", "neighborRow", "offByOne"],
        hint: null,
        explain: ["5のだんの 九九だよ", "5 × 3 = 15", "「5を 3かい たす」のと おなじだね"],
        hints: [
          "5の だんを おもいだしてみよう",
          "5 を 3かい たすと どうなるかな",
          "5 × 3 を けいさんすると…",
        ],
      },
      blanks: 1,
    },
    {
      problem: {
        skillId: "g2_kuku",
        text: "2 × 8 = ?",
        a: 2,
        b: 8,
        op: "×",
        answer: "16",
        choices: ["14", "16", "15"],
        choiceTags: ["neighborRow", "other", "offByOne"],
        hint: null,
        explain: ["2のだんの 九九だよ", "2 × 8 = 16", "「2を 8かい たす」のと おなじだね"],
        hints: [
          "2の だんを おもいだしてみよう",
          "2 を 8かい たすと どうなるかな",
          "2 × 8 を けいさんすると…",
        ],
      },
      blanks: 1,
    },
  ],
  levels: [
    { level: 1, label: "2・5の だん" },
    { level: 2, label: "1から9の だん ぜんぶ" },
    { level: 3, label: "7・8・9の だん" },
  ],
  altExplain: [
    { text: "べつの みかた: 7×3は 7を 3かい たすのと おなじだよ。" },
    { text: "7 + 7 + 7 を けいさんしても 21に なるよ。" },
  ],
  mistakes: [
    { pattern: "neighborRow", feedback: "となりの だんと まちがえていないか たしかめよう" },
    { pattern: "echoOperand", feedback: "こたえは 九九の こたえだよ。かけられる かずを そのまま こたえに しない" },
    { pattern: "offByOne", feedback: "1つ おおいか すくないよ。もういちど 九九ひょうを みてみよう" },
  ],
  coreOfChapter: true,
};
