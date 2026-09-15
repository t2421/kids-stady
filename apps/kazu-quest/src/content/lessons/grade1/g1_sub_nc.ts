/*
 * g1_sub_nc (ひきざん・くりさがりなし) のレッスン (LP-12)。
 * workedExample/faded の Problem は generate("g1_sub_nc", mulberry32(seed), { level: 2 })
 * の出力をそのまま貼っている (手書きしない)。
 */

import type { LessonDef } from "../types";
import { defaultPrerequisites } from "../prereqs";
import { generate } from "../../../lib/curriculum";
import { mulberry32 } from "../../../lib/curriculum/types";

export const G1_SUB_NC: LessonDef = {
  skillId: "g1_sub_nc",
  title: "ひきざん (くりさがりなし)",
  prerequisites: defaultPrerequisites("g1_sub_nc"),
  story: {
    pages: [
      "はじまりむらの こやに どうぶつが いたけど、なんびきか いなくなったよ。",
    ],
  },
  concept: [
    {
      text: "まず 8ひき いたね",
      figure: { kind: "tenFrame", count: 8 },
    },
    {
      text: "3びき かえると のこりは 5ひきに なるよ",
      figure: { kind: "tenFrame", count: 5 },
    },
  ],
  workedExample: {
    problem: generate("g1_sub_nc", mulberry32(2), { level: 2 }),
    steps: [
      {
        text: "8ひきから 3びき かえるよ",
        figure: { kind: "tenFrame", count: 8 },
      },
      {
        text: "のこりは 5ひき これが こたえだよ",
        figure: { kind: "tenFrame", count: 5 },
      },
    ],
  },
  faded: [
    { problem: generate("g1_sub_nc", mulberry32(5), { level: 2 }), blanks: 1 },
    { problem: generate("g1_sub_nc", mulberry32(8), { level: 2 }), blanks: 1 },
  ],
  levels: [
    { level: 1, label: "5までの かずから ひく" },
    { level: 2, label: "9までの かずから ひく" },
    { level: 3, label: "10より おおきい かずから ひく" },
  ],
  altExplain: [
    { text: "べつの かんがえかた: おおきい かずから 1こずつ もどって かぞえよう" },
  ],
  mistakes: [
    {
      pattern: "offByOne",
      feedback: "1つ おおいか すくないよ。もういちど かぞえてみよう",
    },
    {
      pattern: "echoOperand",
      feedback: "ひく かずを そのまま こたえに していないかな",
    },
    {
      pattern: "other",
      feedback: "ひとつずつ ゆっくり かぞえながら たしかめよう",
    },
  ],
};
