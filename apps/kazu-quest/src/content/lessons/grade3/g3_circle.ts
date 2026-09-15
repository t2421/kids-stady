/*
 * g3_circle (円と 球) — さばくの いせきに ある まるい いどを 舞台にした物語フック。
 * 専用の円グラフ部品は無いので、はんけい・ちょっけいの関係は tapeDiagram
 * (2つぶんで ぜんたい、という構造が ぴったり合う) で表す。
 * (ひらがな分かち書き。§1.7 逸脱の理由は g3_div.ts コメント参照)
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";

const WORKED_PROBLEM: Problem = {
  skillId: "g3_circle",
  text: "直けい 12cm の 円の 半けいは なんcm?",
  a: 12,
  b: null,
  op: null,
  answer: "6",
  choices: ["24", "12", "6"],
  hint: null,
  explain: ["半けい = 直けい ÷ 2", "12 ÷ 2 = 6cm"],
  hints: ["じゅんばんに かんがえてみよう", "半けい = 直けい ÷ 2", "半けい = 直けい ÷ 2 12 ÷ 2 = 6cm"],
};

const FADED_1: Problem = {
  skillId: "g3_circle",
  text: "半けい 2cm の 円の 直けいは なんcm?",
  a: 2,
  b: null,
  op: null,
  answer: "4",
  choices: ["1", "4", "2"],
  hint: null,
  explain: ["直けい = 半けい × 2", "2 × 2 = 4cm"],
  hints: ["じゅんばんに かんがえてみよう", "直けい = 半けい × 2", "直けい = 半けい × 2 2 × 2 = 4cm"],
};

const FADED_2: Problem = {
  skillId: "g3_circle",
  text: "半けい 10cm の 円の 直けいは なんcm?",
  a: 10,
  b: null,
  op: null,
  answer: "20",
  choices: ["21", "10", "20"],
  hint: null,
  explain: ["直けい = 半けい × 2", "10 × 2 = 20cm"],
  hints: ["じゅんばんに かんがえてみよう", "直けい = 半けい × 2", "直けい = 半けい × 2 10 × 2 = 20cm"],
};

export const G3_CIRCLE: LessonDef = {
  skillId: "g3_circle",
  title: "円と 球",
  prerequisites: [],
  story: {
    pages: [
      "いせきの まるい いどに ロープを かけたいよ。",
      "はんけいは わかっても、ちょっけいが わからず こまったよ。",
    ],
  },
  concept: [
    {
      text: "はんけいが 2つぶんで ちょっけいに なるよ",
      figure: {
        kind: "tapeDiagram",
        segments: [
          { label: "はんけい", length: 3 },
          { label: "はんけい", length: 3 },
        ],
        total: "ちょっけい",
      },
    },
    {
      text: "はんけい 6cmの えんの ちょっけいは?",
      figure: { kind: "numberLine", from: 0, to: 12, step: 1, marks: [6] },
    },
    { text: "ちょっけいは はんけいの 2ばいの ながさだよ" },
  ],
  workedExample: {
    problem: WORKED_PROBLEM,
    steps: [
      {
        text: "ちょっけい 12cmを はんぶんずつに わけよう",
        figure: {
          kind: "tapeDiagram",
          segments: [
            { label: "はんけい", length: 6 },
            { label: "はんけい", length: 6 },
          ],
          total: "12cm",
        },
      },
      { text: "12 ÷ 2 = 6だね" },
      { text: "はんけいは 6cmだよ" },
    ],
  },
  faded: [
    { problem: FADED_1, blanks: 1 },
    { problem: FADED_2, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "ちいさい はんけい・ちょっけい" },
    { level: 2, label: "はんけいと ちょっけいの けいさん" },
    { level: 3, label: "おおきい はんけい・ちょっけいも" },
  ],
  altExplain: [
    { text: "べつの せつめい: まるい かたちを はんぶんに おってみよう" },
    { text: "おった せんの ながさが はんけい、ぜんたいが ちょっけいだよ" },
  ],
  mistakes: [
    { pattern: "swappedBase", feedback: "はんけいと ちょっけいを とりちがえていないか たしかめよう" },
    { pattern: "offByOne", feedback: "1cm おおいか すくないよ。もういちど けいさんしよう" },
    { pattern: "doubleCounted", feedback: "2ばいを 2かい してしまっていないか たしかめよう" },
  ],
};
