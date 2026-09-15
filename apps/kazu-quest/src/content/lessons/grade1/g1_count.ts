/*
 * g1_count (かずを かぞえる) のレッスン (LP-12)。章1の中核3単元のひとつ。
 * workedExample/faded の Problem は generate("g1_count", mulberry32(seed), { level: 2 })
 * の出力をそのまま貼っている (手書きしない — docs/kazu-quest-learning-tasks.md §5)。
 */

import type { LessonDef } from "../types";
import { defaultPrerequisites } from "../prereqs";
import { generate } from "../../../lib/curriculum";
import { mulberry32 } from "../../../lib/curriculum/types";

export const G1_COUNT: LessonDef = {
  skillId: "g1_count",
  title: "かずを かぞえる",
  prerequisites: defaultPrerequisites("g1_count"),
  story: {
    pages: [
      "はじまりむらの やおやさんが、りんごの かずが わからず こまっているよ。",
    ],
  },
  concept: [
    {
      text: "ひとつずつ ゆびで さして かぞえよう",
      figure: { kind: "tenFrame", count: 5 },
    },
    {
      text: "10の わくに いれると かぞえやすいね",
      figure: { kind: "tenFrame", count: 8 },
    },
    {
      text: "たてよこに ならべても かぞえられるよ",
      figure: { kind: "array", rows: 2, cols: 4 },
    },
  ],
  workedExample: {
    problem: generate("g1_count", mulberry32(1), { level: 2 }),
    steps: [
      {
        text: "1こずつ わくに いれて かぞえよう",
        figure: { kind: "tenFrame", count: 7 },
      },
      {
        text: "さいごまで かぞえると 7こ これが こたえだよ",
      },
    ],
  },
  faded: [
    { problem: generate("g1_count", mulberry32(5), { level: 2 }), blanks: 1 },
    { problem: generate("g1_count", mulberry32(8), { level: 2 }), blanks: 1 },
  ],
  levels: [
    { level: 1, label: "すくない かず (3〜5こ)" },
    { level: 2, label: "ふつうの かず (3〜9こ)" },
    { level: 3, label: "おおい かず (6〜15こ)" },
  ],
  altExplain: [
    { text: "べつの かぞえかたを しょうかいするね" },
    { text: "2こずつ くみに して かぞえても おなじ かずに なるよ" },
  ],
  mistakes: [
    {
      pattern: "doubleCounted",
      feedback: "おなじ ものを 2かい かぞえたかな。ゆっくり かぞえてみよう",
    },
    {
      pattern: "offByOne",
      feedback: "1つ おおいか すくないよ。さいごの かずを たしかめよう",
    },
    {
      pattern: "other",
      feedback: "かぞえる じゅんばんが とんでいないか かくにんしよう",
    },
  ],
  coreOfChapter: true,
};
