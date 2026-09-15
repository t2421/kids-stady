/*
 * g1_compare (どっちが おおきい) のレッスン (LP-12)。
 * workedExample/faded の Problem は generate("g1_compare", mulberry32(seed), { level: 2 })
 * の出力をそのまま貼っている (手書きしない)。
 */

import type { LessonDef } from "../types";
import { defaultPrerequisites } from "../prereqs";
import { generate } from "../../../lib/curriculum";
import { mulberry32 } from "../../../lib/curriculum/types";

export const G1_COMPARE: LessonDef = {
  skillId: "g1_compare",
  title: "どっちが おおきい",
  prerequisites: defaultPrerequisites("g1_compare"),
  story: {
    pages: [
      "もりかげむらで、はしを つくる きが たりるか わからず こまっているよ。",
      "きの やまが ふたつ あるよ。どちらが おおいか くらべよう。",
    ],
  },
  concept: [
    {
      text: "かずのせんに 2つの かずを おいてみよう",
      figure: { kind: "numberLine", from: 0, to: 20, marks: [7, 15] },
    },
    {
      text: "うしろに ある ほうが おおきい かずだよ",
      figure: { kind: "numberLine", from: 0, to: 20, marks: [7, 15], highlight: [7, 15] },
    },
  ],
  workedExample: {
    problem: generate("g1_compare", mulberry32(2), { level: 2 }),
    steps: [
      {
        text: "15と7を かずのせんに おいてみよう",
        figure: { kind: "numberLine", from: 0, to: 20, marks: [7, 15] },
      },
      {
        text: "うしろに ある 15のほうが おおきい これが こたえだよ",
      },
    ],
  },
  faded: [
    { problem: generate("g1_compare", mulberry32(7), { level: 2 }), blanks: 1 },
    { problem: generate("g1_compare", mulberry32(8), { level: 2 }), blanks: 1 },
  ],
  levels: [
    { level: 1, label: "10までの かずで くらべる" },
    { level: 2, label: "20までの かずで くらべる" },
    { level: 3, label: "50までの かずで くらべる" },
  ],
  altExplain: [
    { text: "べつの かんがえかた: ひとつずつ ペアに して くらべよう" },
    { text: "あまった ほうが おおい かずだよ" },
  ],
  mistakes: [
    {
      pattern: "echoOperand",
      feedback: "ちいさい ほうを えらんでしまったかな。もういちど みてみよう",
    },
    {
      pattern: "offByOne",
      feedback: "おしい。かずのせんで となりと まちがえたかな",
    },
    {
      pattern: "other",
      feedback: "2つの かずを もういちど よく みくらべてみよう",
    },
  ],
};
