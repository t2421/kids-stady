/*
 * g3_fraction (分数) — 第3章の中核単元 (coreOfChapter)。物語フック
 * (docs/kazu-quest-learning-plan.md 波4 の指定): 「ピラミッドの わけまえを
 * 1/3ずつに 切れない」を、ひらがな分かち書きで書く (§1.7 逸脱の理由は
 * g3_div.ts コメント参照)。
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";

const WORKED_PROBLEM: Problem = {
  skillId: "g3_fraction",
  text: "2/7 + 4/7 = ?",
  a: 2,
  b: 4,
  op: "+",
  answer: "6/7",
  choices: ["7/6", "6/7", "7/7"],
  hint: null,
  explain: ["分母が おなじだから 分子だけ たす", "2 + 4 = 6", "こたえは 6/7"],
  hints: [
    "分母が おなじ ぶんすうは 分子だけ たせば いいよ",
    "2 + 4 を けいさんしてみよう",
    "2 + 4 = 6。分母は 7 の ままだから…",
  ],
};

const FADED_1: Problem = {
  skillId: "g3_fraction",
  text: "1/3 + 1/3 = ?",
  a: 1,
  b: 1,
  op: "+",
  answer: "2/3",
  choices: ["2/6", "3/2", "2/3"],
  hint: null,
  explain: ["分母が おなじだから 分子だけ たす", "1 + 1 = 2", "こたえは 2/3"],
  hints: [
    "分母が おなじ ぶんすうは 分子だけ たせば いいよ",
    "1 + 1 を けいさんしてみよう",
    "1 + 1 = 2。分母は 3 の ままだから…",
  ],
};

const FADED_2: Problem = {
  skillId: "g3_fraction",
  text: "2/4 と 3/4、大きいのは?",
  a: 2,
  b: 3,
  op: null,
  answer: "3/4",
  choices: ["3/5", "4/4", "3/4"],
  hint: null,
  explain: ["分母が おなじなら 分子が 大きいほうが 大きい", "3 > 2 だから 3/4"],
  hints: [
    "分母が おなじなら 分子で くらべられるよ",
    "2 と 3、分子が 大きいのは どっちかな",
    "3 は 2 より 大きいから…",
  ],
};

export const G3_FRACTION: LessonDef = {
  skillId: "g3_fraction",
  title: "分数",
  prerequisites: [],
  story: {
    pages: [
      "ピラミッドで みつけた たからを 3にんで わけまえに したいよ。",
      "おなじ おおきさに 3つに きりたいのに、きりかたが わからないよ。",
    ],
  },
  concept: [
    {
      text: "1を 3つに わけた 1つ分が 1/3だよ",
      figure: { kind: "fractionBar", parts: 3, filled: 1 },
    },
    {
      text: "ぶんぼが おなじなら ぶんしで くらべられる",
      figure: { kind: "fractionBar", parts: 4, filled: 2, second: { parts: 4, filled: 3 } },
    },
    { text: "ぶんぼが おなじ ときは ぶんしだけ けいさんするよ" },
  ],
  workedExample: {
    problem: WORKED_PROBLEM,
    steps: [
      {
        text: "2/7と 4/7を あわせてみよう",
        figure: { kind: "fractionBar", parts: 7, filled: 2, second: { parts: 7, filled: 4 } },
      },
      { text: "ぶんしだけ たすと 2 + 4 = 6だね" },
      { text: "ぶんぼは 7の ままだから 6/7だよ" },
    ],
  },
  faded: [
    { problem: FADED_1, blanks: 1 },
    { problem: FADED_2, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "たんいぶんすうを よむ (1/2、1/3)" },
    { level: 2, label: "ぶんぼが おなじ ものを くらべる" },
    { level: 3, label: "ぶんぼが おなじ たしひき" },
  ],
  altExplain: [
    { text: "べつの せつめい: まるい パンを 3つに きって かんがえよう" },
    { text: "1きれぶんが 1/3、2きれぶんが 2/3だよ" },
  ],
  mistakes: [
    { pattern: "addedDenominators", feedback: "ぶんぼも たしてしまっていないか たしかめよう" },
    { pattern: "swappedBase", feedback: "ぶんしと ぶんぼが ぎゃくに なっていないか たしかめよう" },
    { pattern: "noCommonDenominator", feedback: "ぶんぼが おなじ かどうか さきに たしかめよう" },
  ],
  coreOfChapter: true,
};
