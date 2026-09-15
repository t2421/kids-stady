/*
 * g1_add_nc (たしざん・くりあがりなし) のレッスン (LP-12)。
 * LP-08 の先行分 (旧 src/content/lessons/g1_add_nc.ts) をこのフォルダへ移し、
 * coreOfChapter を false に直した (章1の中核3単元は g1_count/g1_add_carry/g1_sub_borrow —
 * docs/kazu-quest-learning-tasks.md §5)。story 1ページ / concept 2ページ / workedExample
 * 2ステップ / faded 2問 の件数は e2e/lesson.spec.ts が固定で検証しているため変えていない。
 * workedExample/faded の Problem は generate("g1_add_nc", mulberry32(seed), { level: 2 })
 * の出力をそのまま貼っている (手書きしない)。
 */

import type { LessonDef } from "../types";
import { defaultPrerequisites } from "../prereqs";
import { generate } from "../../../lib/curriculum";
import { mulberry32 } from "../../../lib/curriculum/types";

export const G1_ADD_NC: LessonDef = {
  skillId: "g1_add_nc",
  title: "たしざん (くりあがりなし)",
  prerequisites: defaultPrerequisites("g1_add_nc"),
  story: {
    pages: [
      "おうと カズールの パンやさんが、ならべた パンの かずを かぞえられず こまっているよ。",
    ],
  },
  concept: [
    {
      text: "まず 6こ あるね",
      figure: { kind: "tenFrame", count: 6 },
    },
    {
      text: "そこに 3こ たすと 9こに なるよ",
      figure: { kind: "tenFrame", count: 6, second: 3 },
    },
  ],
  workedExample: {
    problem: generate("g1_add_nc", mulberry32(2), { level: 2 }),
    steps: [
      {
        text: "6と3を それぞれ かぞえよう",
        figure: { kind: "cherry", total: 9, split: [6, 3] },
      },
      {
        text: "あわせると 9 これが こたえだよ",
      },
    ],
  },
  faded: [
    { problem: generate("g1_add_nc", mulberry32(4), { level: 2 }), blanks: 1 },
    { problem: generate("g1_add_nc", mulberry32(6), { level: 2 }), blanks: 1 },
  ],
  levels: [
    { level: 1, label: "こたえが 5までの たしざん" },
    { level: 2, label: "こたえが 9までの たしざん" },
    { level: 3, label: "おおきい かずどうしの たしざん" },
  ],
  altExplain: [
    { text: "べつの せつめい: ブロックを ひとつずつ ならべて かぞえよう" },
  ],
  mistakes: [
    {
      pattern: "offByOne",
      feedback: "1つ おおいか すくないよ。もういちど かぞえてみよう",
    },
    {
      pattern: "echoOperand",
      feedback: "かたほうの かずだけに なっているよ。もう1つの かずも たしてね",
    },
  ],
  coreOfChapter: false,
};
