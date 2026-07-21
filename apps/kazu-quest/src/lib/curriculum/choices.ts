/*
 * 3択の誤答 (ディストラクタ) 生成。
 * よくある間違いを優先する: ±1 / くりあがり忘れ (±10) / オペランドエコー。
 */

import type { Rng } from "./types";
import { shuffle } from "./types";

export type ChoiceKind = "count" | "add" | "sub" | "compare";

export function makeChoices(
  rng: Rng,
  answer: number,
  kind: ChoiceKind,
  operands: number[] = [],
): [string, string, string] {
  const candidates: number[] = [];
  const push = (n: number) => {
    if (
      Number.isInteger(n) &&
      n >= 0 &&
      n !== answer &&
      !candidates.includes(n)
    ) {
      candidates.push(n);
    }
  };

  /* よくある間違いから順に */
  push(answer + 1);
  push(answer - 1);
  if (kind === "add" || kind === "sub") {
    push(answer + 10);
    push(answer - 10);
    for (const o of operands) push(o); /* 式の数をそのまま答えてしまう */
  }
  push(answer + 2);
  push(answer - 2);
  /* 予備 (まだ2個に満たない場合の埋め) */
  for (let d = 3; candidates.length < 2 && d < 10; d++) {
    push(answer + d);
    push(answer - d);
  }

  const wrong = shuffle(rng, candidates).slice(0, 2);
  const all = shuffle(rng, [answer, ...wrong]);
  return [String(all[0]), String(all[1]), String(all[2])];
}
