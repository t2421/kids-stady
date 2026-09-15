/*
 * g1_sub_borrow (ひきざん・くりさがりあり) のレッスン (LP-12)。章1の中核3単元のひとつ。
 * workedExample/faded の Problem は generate("g1_sub_borrow", mulberry32(seed), { level: 2 })
 * の出力をそのまま貼っている (手書きしない)。
 */

import type { LessonDef } from "../types";
import { defaultPrerequisites } from "../prereqs";
import { generate } from "../../../lib/curriculum";
import { mulberry32 } from "../../../lib/curriculum/types";

export const G1_SUB_BORROW: LessonDef = {
  skillId: "g1_sub_borrow",
  title: "ひきざん (くりさがりあり)",
  prerequisites: defaultPrerequisites("g1_sub_borrow"),
  story: {
    pages: [
      "もりかげむらの くすりやに、13こ ある くすりを 6こ もっていく ひとが きたよ。",
      "1の くらいだけでは たりなくて、どう ひけば いいか こまっているよ。",
    ],
  },
  concept: [
    {
      text: "13は 10と 3に わけられるね",
      figure: { kind: "cherry", total: 13, split: [10, 3] },
    },
    {
      text: "10から 6を ひくと 4。4と 3で 7",
      figure: { kind: "tenFrame", count: 4 },
    },
  ],
  workedExample: {
    problem: generate("g1_sub_borrow", mulberry32(2), { level: 2 }),
    steps: [
      {
        text: "13を 10と 3に わけよう",
        figure: { kind: "cherry", total: 13, split: [10, 3] },
      },
      {
        text: "10から 6を ひくと 4",
      },
      {
        text: "4と のこりの 3で 7 これが こたえだよ",
      },
    ],
  },
  faded: [
    { problem: generate("g1_sub_borrow", mulberry32(1), { level: 2 }), blanks: 1 },
    { problem: generate("g1_sub_borrow", mulberry32(5), { level: 2 }), blanks: 1 },
  ],
  levels: [
    { level: 1, label: "11〜13から ひく" },
    { level: 2, label: "11〜18から ひく" },
    { level: 3, label: "おおきい かずから ひく" },
  ],
  altExplain: [
    { text: "べつの せつめい: 10の たばを 1こ くずして かぞえよう" },
    { text: "くずした 10から さきに ひいて、のこりを たすよ" },
  ],
  mistakes: [
    {
      pattern: "forgotBorrow",
      feedback: "10の たばを くずすのを わすれていないかな",
    },
    {
      pattern: "offByOne",
      feedback: "おしい。もういちど 10から ひいた かずを かぞえてみよう",
    },
    {
      pattern: "echoOperand",
      feedback: "ひく かずを そのまま こたえに していないかな",
    },
  ],
  coreOfChapter: true,
};
