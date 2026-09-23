/*
 * g1_add_carry (たしざん・くりあがりあり) のレッスン (LP-12)。章1の中核3単元のひとつ。
 * workedExample/faded の Problem は generate("g1_add_carry", mulberry32(seed), { level: 2 })
 * の出力をそのまま貼っている (手書きしない)。
 */

import type { LessonDef } from "../types";
import { defaultPrerequisites } from "../prereqs";
import { generate } from "../../../lib/curriculum";
import { mulberry32 } from "../../../lib/curriculum/types";

export const G1_ADD_CARRY: LessonDef = {
  skillId: "g1_add_carry",
  title: "たしざん (くりあがりあり)",
  prerequisites: defaultPrerequisites("g1_add_carry"),
  story: {
    pages: [
      "おうと カズールの ほうこには、コインを 10こずつ はこに いれる きまりが あるよ。",
      "はこに おさまりきらない コインを どう すればいいか こまっているよ。",
    ],
  },
  concept: [
    {
      text: "7に 4を たすよ。4を 3と 1に わけよう",
      figure: { kind: "cherry", total: 4, split: [3, 1] },
    },
    {
      text: "7と3で 10。10に のこりの 1を たすと 11",
      figure: { kind: "tenFrame", count: 10, second: 1 },
    },
  ],
  workedExample: {
    problem: generate("g1_add_carry", mulberry32(2), { level: 2 }),
    steps: [
      {
        text: "4を 3と 1に わけよう",
        figure: { kind: "cherry", total: 4, split: [3, 1] },
      },
      {
        text: "7と 3を たすと 10",
      },
      {
        text: "10と のこりの 1で 11 これが こたえだよ",
      },
    ],
  },
  faded: [
    { problem: generate("g1_add_carry", mulberry32(1), { level: 2 }), blanks: 1 },
    { problem: generate("g1_add_carry", mulberry32(7), { level: 2 }), blanks: 1 },
  ],
  levels: [
    { level: 1, label: "9との たしざん" },
    { level: 2, label: "くりあがりの ある たしざん ぜんぶ" },
    { level: 3, label: "おおきい かずに たす (47 + 5 など)" },
  ],
  altExplain: [
    { text: "べつの せつめい: さきに 10の かたまりを つくろう" },
    { text: "はこが 10で いっぱいに なったら、のこりは つぎの かずに たすよ" },
  ],
  mistakes: [
    {
      pattern: "forgotCarry",
      feedback: "10を こえた ぶんを わすれていないかな。10と のこりを たしてね",
    },
    {
      pattern: "offByOne",
      feedback: "おしい。もういちど 10の なかまと のこりを かぞえてみよう",
    },
    {
      pattern: "echoOperand",
      feedback: "かたほうの かずだけに なっているよ。もう1つの かずも たしてね",
    },
  ],
  coreOfChapter: true,
};
