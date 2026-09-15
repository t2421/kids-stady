/*
 * g3_div (わり算) — 第3章「オアシスとし ワケーラ」の中核単元 (coreOfChapter)。
 * 物語フック (docs/kazu-quest-learning-plan.md 波4 の指定):
 * 「隊商の水を 人数で同じに分けられず けんかに」を、ひらがな分かち書きで書く
 * (§1.7 の逸脱: 小3以降のルビ記法は LessonPageBody が未対応のため使わない — LP-14 報告参照)。
 * workedExample/faded の problem は generate("g3_div", mulberry32(seed), {level}) の
 * 実データをそのまま貼っている (手書きしない)。
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";

const WORKED_PROBLEM: Problem = {
  skillId: "g3_div",
  text: "30 ÷ 6 = ?",
  a: 30,
  b: 6,
  op: "÷",
  answer: "5",
  choices: ["4", "6", "5"],
  hint: null,
  explain: ["6のだんの 九九で 30に なるのは?", "6 × 5 = 30", "だから 30 ÷ 6 = 5"],
  hints: ["6の だんの 九九を つかうよ", "6 × なにかで 30 に なるかな", "6 × 5 = 30 だから…"],
};

const FADED_1: Problem = {
  skillId: "g3_div",
  text: "4 ÷ 2 = ?",
  a: 4,
  b: 2,
  op: "÷",
  answer: "2",
  choices: ["2", "3", "1"],
  hint: null,
  explain: ["2のだんの 九九で 4に なるのは?", "2 × 2 = 4", "だから 4 ÷ 2 = 2"],
  hints: ["2の だんの 九九を つかうよ", "2 × なにかで 4 に なるかな", "2 × 2 = 4 だから…"],
};

const FADED_2: Problem = {
  skillId: "g3_div",
  text: "32 ÷ 4 = ?",
  a: 32,
  b: 4,
  op: "÷",
  answer: "8",
  choices: ["7", "8", "9"],
  hint: null,
  explain: ["4のだんの 九九で 32に なるのは?", "4 × 8 = 32", "だから 32 ÷ 4 = 8"],
  hints: ["4の だんの 九九を つかうよ", "4 × なにかで 32 に なるかな", "4 × 8 = 32 だから…"],
};

export const G3_DIV: LessonDef = {
  skillId: "g3_div",
  title: "わり算",
  prerequisites: ["g2_kuku"],
  story: {
    pages: [
      "たいしょうの みずがめが ひとつ とどいた。",
      "みんなで おなじ かずずつ わけたいのに、わけかたが わからず けんかに なってしまったよ。",
    ],
  },
  concept: [
    {
      text: "12こを 3れつに わけると 4こずつ に なるよ",
      figure: { kind: "array", rows: 3, cols: 4, groupBy: "row" },
    },
    {
      text: "3のだんの くくを つかって かんがえよう",
      figure: { kind: "kukuTable", highlightRow: 3 },
    },
    { text: "わりざんは おなじ かずずつ わけること だよ" },
  ],
  workedExample: {
    problem: WORKED_PROBLEM,
    steps: [
      {
        text: "6のだんの くくを さがそう",
        figure: { kind: "kukuTable", highlightRow: 6 },
      },
      { text: "6 × 5 = 30 だから 30 ÷ 6 = 5 だね" },
      { text: "こたえは 5だよ" },
    ],
  },
  faded: [
    { problem: FADED_1, blanks: 1 },
    { problem: FADED_2, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "こたえが 5までの やさしい もんだい" },
    { level: 2, label: "くくの はんい ぜんぶ (2から9)" },
    { level: 3, label: "0や 2けたの こたえも でてくる" },
  ],
  altExplain: [
    { text: "べつの せつめい: 1まいずつ じゅんばんに くばってみよう" },
    { text: "みんなに くばりおわったら、ひとりぶんの かずが こたえだよ" },
  ],
  mistakes: [
    { pattern: "reversedDivision", feedback: "わる かずと わられる かずが ぎゃくに なっていないか たしかめよう" },
    { pattern: "offByOne", feedback: "こたえが 1つ おおいか すくないよ。くくを もういちど かぞえてみよう" },
    { pattern: "echoOperand", feedback: "わる かずを そのまま こたえに していないか たしかめよう" },
  ],
  coreOfChapter: true,
};
