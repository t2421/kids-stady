/*
 * g6_circle_area (円の 面せき) — 章6「ゼロのあなと 下の世界ネガリア」(LP-17)。
 * エンの神殿の まるい 建物の広さを 求める フック。workedExample/faded の problem は
 * generate("g6_circle_area", mulberry32(seed), {level:2}) の実際の出力をそのまま貼っている。
 */

import type { LessonDef } from "../types";
import { defaultPrerequisites } from "../prereqs";

export const G6_CIRCLE_AREA: LessonDef = {
  skillId: "g6_circle_area",
  title: "円の 面せき",
  prerequisites: defaultPrerequisites("g6_circle_area"),
  story: {
    pages: [
      "エンの しんでんの まるい ゆかの ひろさが わからず こまっているよ。",
      "はんけいから 円の めんせきを もとめて しんでんを なおそう。",
    ],
  },
  concept: [
    { text: "円の めんせきは はんけい×はんけい×3.14で もとめるよ。" },
    {
      text: "はんけい 4cmなら 4×4の しかくを かんがえるよ。",
      figure: { kind: "areaGrid", w: 4, h: 4, unit: "cm" },
    },
    {
      text: "はんけいが おおきいほど しかくも おおきく なるよ。",
      figure: { kind: "areaGrid", w: 6, h: 6, unit: "cm" },
    },
  ],
  workedExample: {
    problem: {
      skillId: "g6_circle_area",
      text: "半けい 7cm の 円の 面せきは なんcm²? (円周りつ 3.14)",
      a: 7,
      b: null,
      op: null,
      answer: "153.86",
      choices: ["43.96", "153.86", "49"],
      hint: null,
      explain: [
        "円の 面せき = 半けい × 半けい × 3.14",
        "7 × 7 = 49",
        "49 × 3.14 = 153.86cm²",
      ],
      hints: [
        "じゅんばんに かんがえてみよう",
        "円の 面せき = 半けい × 半けい × 3.14",
        "円の 面せき = 半けい × 半けい × 3.14 7 × 7 = 49 49 × 3.14 = 153.86cm²",
      ],
    },
    steps: [
      {
        text: "はんけい×はんけいの しかくを つくって かんがえるよ。",
        figure: { kind: "areaGrid", w: 7, h: 7, unit: "cm" },
      },
      { text: "7 × 7 = 49。これが しかくの めんせきだよ。" },
      { text: "49 × 3.14 = 153.86。まるい かたちの めんせきは 153.86cm²だよ。" },
    ],
  },
  faded: [
    {
      problem: {
        skillId: "g6_circle_area",
        text: "半けい 8cm の 円の 面せきは なんcm²? (円周りつ 3.14)",
        a: 8,
        b: null,
        op: null,
        answer: "200.96",
        choices: ["200.96", "64", "25.12"],
        hint: null,
        explain: [
          "円の 面せき = 半けい × 半けい × 3.14",
          "8 × 8 = 64",
          "64 × 3.14 = 200.96cm²",
        ],
        hints: [
          "じゅんばんに かんがえてみよう",
          "円の 面せき = 半けい × 半けい × 3.14",
          "円の 面せき = 半けい × 半けい × 3.14 8 × 8 = 64 64 × 3.14 = 200.96cm²",
        ],
      },
      blanks: 1,
    },
    {
      problem: {
        skillId: "g6_circle_area",
        text: "半けい 7cm の 円の まわりの 長さは なんcm? (円周りつ 3.14)",
        a: 7,
        b: null,
        op: null,
        answer: "43.96",
        choices: ["153.86", "44.96", "43.96"],
        hint: null,
        explain: ["円周 = 直けい × 3.14", "直けい = 7 × 2 = 14", "14 × 3.14 = 43.96cm"],
        hints: [
          "じゅんばんに かんがえてみよう",
          "円周 = 直けい × 3.14",
          "円周 = 直けい × 3.14 直けい = 7 × 2 = 14 14 × 3.14 = 43.96cm",
        ],
      },
      blanks: 1,
    },
  ],
  levels: [
    { level: 1, label: "はんけいが ちいさい とき" },
    { level: 2, label: "はんけいが すこし おおきい とき" },
    { level: 3, label: "はんけいが おおきい とき" },
  ],
  altExplain: [
    { text: "べつの せつめい: はんけい×はんけいの しかくの 3.14こぶんが まるい かたちの ひろさだよ。" },
  ],
  mistakes: [
    { pattern: "echoOperand", feedback: "3.14を かけるのを わすれていないかな。もういちど けいさんしよう" },
    { pattern: "unitConfusion", feedback: "めんせきの たんいは cm²だよ。cmと まちがえないでね" },
    { pattern: "other", feedback: "はんけいと ちょっけいを まちがえていないか たしかめよう" },
  ],
};
