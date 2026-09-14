/*
 * g1_add_nc (たしざん・くりあがりなし) の本物のレッスン1件 (LP-08)。
 * LP-12 以降が学年ごとの本編を足すまでの先行分。文言・図の量は
 * docs/kazu-quest-learning-tasks.md §1.1/§1.7 の契約に沿う (絵文字なし、1ページ短め)。
 */

import type { LessonDef } from "./types";
import type { Problem } from "../../lib/curriculum/types";

/* このレッスン内で使う3問はすべて手書き (くりあがりが起きない一桁+一桁で答えは7に統一) */
function addProblem(a: number, b: number): Problem {
  const answer = String(a + b);
  return {
    skillId: "g1_add_nc",
    text: `${a} + ${b} = ?`,
    a,
    b,
    op: "+",
    answer,
    choices: [answer, String(a + b - 1), String(a + b + 1)],
    hint: null,
    explain: [`${a} に ${b} を たすと ${answer}`],
    hints: [
      "ゆびや ○を つかって ひとつずつ たしてみよう",
      `${a} に ${b} を たすと いくつに なるかな`,
      `${a} + ${b} を けいさんすると… ${answer}`,
    ],
  };
}

export const G1_ADD_NC: LessonDef = {
  skillId: "g1_add_nc",
  title: "たしざん (くりあがりなし)",
  prerequisites: [],
  story: {
    pages: ["むらの パンやさんが、ならべた パンの かずを かぞえられずに こまっているよ。"],
  },
  concept: [
    {
      text: "かずを 10の かたまりで かんがえよう。まず 3こ あるね。",
      figure: { kind: "tenFrame", count: 3 },
    },
    {
      text: "そこに 4こ たすと、あわせて 7こに なるよ。",
      figure: { kind: "tenFrame", count: 3, second: 4 },
    },
  ],
  workedExample: {
    problem: addProblem(3, 4),
    steps: [
      {
        text: "3と4を それぞれ かぞえよう。",
        figure: { kind: "cherry", total: 7, split: [3, 4] },
      },
      {
        text: "あわせると 7。これが こたえだよ。",
      },
    ],
  },
  faded: [
    { problem: addProblem(2, 5), blanks: 1 },
    { problem: addProblem(4, 3), blanks: 1 },
  ],
  levels: [
    { level: 1, label: "9までの たしざん" },
    { level: 2, label: "8・7までの たしざん" },
    { level: 3, label: "ぜんぶ" },
  ],
  altExplain: [
    { text: "べつの せつめい: ブロックを ひとつずつ ならべて かぞえよう。" },
  ],
  mistakes: [{ pattern: "offByOne", feedback: "1つ おおいか すくないよ。もういちど かぞえてみよう" }],
  coreOfChapter: true,
};
