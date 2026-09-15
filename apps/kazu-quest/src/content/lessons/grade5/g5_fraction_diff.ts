/*
 * g5_fraction_diff (異分母の 分数) の本物のレッスン (LP-16)。
 * 章5の中核3単元のひとつ (coreOfChapter: true)。文言はすべて ひらがな +
 * わかちがき (LP-16 の指示による暫定)。workedExample.problem / faded[].problem は
 * generate("g5_fraction_diff", mulberry32(seed), { level }) の実際の出力を書き写した。
 */

import type { LessonDef } from "../types";
import type { Problem } from "../../../lib/curriculum/types";
import { defaultPrerequisites } from "../prereqs";

/* generate("g5_fraction_diff", mulberry32(1003), { level: 2 }) */
const WORKED_PROBLEM: Problem = {
  skillId: "g5_fraction_diff",
  text: "3/4 - 2/3 = ?",
  a: 3,
  b: 2,
  op: "-",
  answer: "1/12",
  choices: ["1/12", "2/12", "1/1"],
  hint: null,
  explain: ["分母を 12 に そろえる (通分)", "9/12 - 8/12 = 1/12", "こたえは 1/12"],
  hints: [
    "分母が ちがう ぶんすうは まず 通分するよ",
    "分母を 12 に そろえると 9/12 と 8/12",
    "9 - 8 = 1。分母は 12 の ままだから…",
  ],
};

/* generate("g5_fraction_diff", mulberry32(2003), { level: 1 }) */
const FADED_1: Problem = {
  skillId: "g5_fraction_diff",
  text: "1/3 + 2/4 = ?",
  a: 1,
  b: 2,
  op: "+",
  answer: "5/6",
  choices: ["3/12", "5/6", "3/7"],
  hint: null,
  explain: ["分母を 12 に そろえる (通分)", "4/12 + 6/12 = 10/12", "こたえは 5/6"],
  hints: [
    "分母が ちがう ぶんすうは まず 通分するよ",
    "分母を 12 に そろえると 4/12 と 6/12",
    "4 + 6 = 10。分母は 12 の ままだから…",
  ],
};

/* generate("g5_fraction_diff", mulberry32(3003), { level: 1 }) */
const FADED_2: Problem = {
  skillId: "g5_fraction_diff",
  text: "2/3 + 1/2 = ?",
  a: 2,
  b: 1,
  op: "+",
  answer: "7/6",
  choices: ["8/6", "3/5", "7/6"],
  hint: null,
  explain: ["分母を 6 に そろえる (通分)", "4/6 + 3/6 = 7/6", "こたえは 7/6"],
  hints: [
    "分母が ちがう ぶんすうは まず 通分するよ",
    "分母を 6 に そろえると 4/6 と 3/6",
    "4 + 3 = 7。分母は 6 の ままだから…",
  ],
};

/* generate("g5_fraction_diff", mulberry32(4003), { level: 1 }) */
const FADED_3: Problem = {
  skillId: "g5_fraction_diff",
  text: "1/3 - 1/4 = ?",
  a: 1,
  b: 1,
  op: "-",
  answer: "1/12",
  choices: ["1/12", "7/12", "2/12"],
  hint: null,
  explain: ["分母を 12 に そろえる (通分)", "4/12 - 3/12 = 1/12", "こたえは 1/12"],
  hints: [
    "分母が ちがう ぶんすうは まず 通分するよ",
    "分母を 12 に そろえると 4/12 と 3/12",
    "4 - 3 = 1。分母は 12 の ままだから…",
  ],
};

export const G5_FRACTION_DIFF: LessonDef = {
  skillId: "g5_fraction_diff",
  title: "異分母の 分数",
  prerequisites: defaultPrerequisites("g5_fraction_diff"),
  story: {
    pages: [
      "ブンスウしょとうの はしが とちゅうで きれているよ。",
      "1/2の ながさと 1/3の ながさでは、そのままじゃ つながらないんだ。",
    ],
  },
  concept: [
    {
      text: "ぶんぼが ちがう ぶんすうは くらべにくいよ。",
      figure: { kind: "fractionBar", parts: 2, filled: 1, second: { parts: 3, filled: 1 } },
    },
    {
      text: "ぶんぼを そろえると おなじ ながさで くらべられるよ。",
      figure: { kind: "fractionBar", parts: 6, filled: 3, second: { parts: 6, filled: 2 } },
    },
    { text: "そろえた ぶんぼを つうぶんと いうよ。" },
  ],
  workedExample: {
    problem: WORKED_PROBLEM,
    steps: [
      {
        text: "ぶんぼを 12に そろえよう。これが つうぶんだよ。",
        figure: { kind: "fractionBar", parts: 4, filled: 3, second: { parts: 3, filled: 2 } },
      },
      { text: "9/12 - 8/12 = 1/12だよ。" },
      { text: "こたえは 1/12。" },
    ],
  },
  faded: [
    { problem: FADED_1, blanks: 1 },
    { problem: FADED_2, blanks: 1 },
    { problem: FADED_3, blanks: 1 },
  ],
  levels: [
    { level: 1, label: "ぶんぼが 2・3・4" },
    { level: 2, label: "ぶんぼが いろいろ" },
    { level: 3, label: "ぶんぼが おおい かず" },
  ],
  altExplain: [
    { text: "べつの かんがえかた: ぶんすうは おなじ おおきさの べつの なまえに かえられるよ。" },
    { text: "1/2は 3/6と おなじ おおきさ。だから なまえを そろえれば たしひきできるよ。" },
  ],
  mistakes: [
    {
      pattern: "noCommonDenominator",
      feedback: "ぶんぼが ちがう ままじゃ たしひきできないよ。つうぶんしよう",
    },
    { pattern: "addedDenominators", feedback: "ぶんぼどうしを たしちゃだめ。ぶんぼは そろえるだけだよ" },
    { pattern: "other", feedback: "つうぶんの あと、こたえが やくぶんできないか かくにんしよう" },
  ],
  coreOfChapter: true,
};
