/*
 * g6_ratio (比) — 章6の中核単元 (LP-17)。ホシオキの料理人が やくそうを 混ぜる比を
 * 忘れてしまった、というフック (地図の縮尺フックは g6_scale へ — 学びの設計 波4)。
 * workedExample/faded の problem は generate("g6_ratio", mulberry32(seed),
 * {level:2}) の実際の出力をそのまま貼っている。
 */

import type { LessonDef } from "../types";
import { defaultPrerequisites } from "../prereqs";

export const G6_RATIO: LessonDef = {
  skillId: "g6_ratio",
  title: "比",
  prerequisites: defaultPrerequisites("g6_ratio"),
  story: {
    pages: [
      "ホシオキの りょうりにんが やくそうを まぜる わりあいを わすれてしまったよ。",
      "ただしい ひで まぜないと くすりが きかないんだって。",
    ],
  },
  concept: [
    { text: "ひは 2つの りょうの わりあいを あらわすよ。" },
    {
      text: "7:3は 7と3の わりあいだよ。",
      figure: {
        kind: "tapeDiagram",
        segments: [
          { label: "7", length: 7 },
          { label: "3", length: 3 },
        ],
      },
    },
    {
      text: "りょうほうを おなじ かずで かけても ひは かわらないよ。",
      figure: {
        kind: "tapeDiagram",
        segments: [
          { label: "21", length: 21 },
          { label: "9", length: 9 },
        ],
      },
    },
  ],
  workedExample: {
    problem: {
      skillId: "g6_ratio",
      text: "7 : 3 = 21 : ? を うめよう",
      a: 7,
      b: 3,
      op: null,
      answer: "9",
      choices: ["3", "9", "17"],
      hint: null,
      explain: ["7 が 21 に なったので 3ばい", "3 × 3 = 9"],
      hints: [
        "じゅんばんに かんがえてみよう",
        "7 が 21 に なったので 3ばい",
        "7 が 21 に なったので 3ばい 3 × 3 = 9",
      ],
    },
    steps: [
      {
        text: "7が 21に なったのは 3ばいだからだよ。",
        figure: {
          kind: "tapeDiagram",
          segments: [
            { label: "7→21", length: 21 },
            { label: "3→?", length: 9 },
          ],
        },
      },
      { text: "3 × 3 = 9。" },
      { text: "7:3 = 21:9だよ。" },
    ],
  },
  faded: [
    {
      problem: {
        skillId: "g6_ratio",
        text: "7 : 1 の 比の あたいは?",
        a: 7,
        b: 1,
        op: null,
        answer: "7",
        choices: ["8/1", "7", "1/7"],
        hint: null,
        explain: ["比の あたい = 7 ÷ 1", "こたえは 7"],
        hints: [
          "じゅんばんに かんがえてみよう",
          "比の あたい = 7 ÷ 1",
          "比の あたい = 7 ÷ 1 こたえは 7",
        ],
      },
      blanks: 1,
    },
    {
      problem: {
        skillId: "g6_ratio",
        text: "6 : 1 = 24 : ? を うめよう",
        a: 6,
        b: 1,
        op: null,
        answer: "4",
        choices: ["4", "19", "1"],
        hint: null,
        explain: ["6 が 24 に なったので 4ばい", "1 × 4 = 4"],
        hints: [
          "じゅんばんに かんがえてみよう",
          "6 が 24 に なったので 4ばい",
          "6 が 24 に なったので 4ばい 1 × 4 = 4",
        ],
      },
      blanks: 1,
    },
  ],
  levels: [
    { level: 1, label: "ちいさい かずの ひ" },
    { level: 2, label: "すこし おおきい ひ" },
    { level: 3, label: "おおきい かずの ひ" },
  ],
  altExplain: [
    { text: "べつの せつめい: ひの あたいは わりざんの こたえと おなじだよ。" },
  ],
  mistakes: [
    { pattern: "swappedBase", feedback: "どちらの かずが ふえたか じゅんばんを たしかめよう" },
    { pattern: "reversedDivision", feedback: "わりざんの むきが ぎゃくに なっていないか みなおそう" },
    { pattern: "other", feedback: "りょうほうに おなじ かずを かけているか かくにんしよう" },
  ],
  coreOfChapter: true,
};
