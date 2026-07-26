/*
 * 3択の誤答 (ディストラクタ) 生成。
 * よくある間違いを優先する: ±1 / くりあがり忘れ (±10) / オペランドエコー。
 */

import type { Rng } from "./types";
import { shuffle } from "./types";

export type ChoiceKind = "count" | "add" | "sub" | "compare" | "mul" | "convert" | "time";

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
  if (kind === "mul") {
    /* 九九: となりの段・となりのかず (a×(b±1), (a±1)×b) */
    const [a, b] = operands;
    if (a && b) {
      push(a * (b + 1));
      push(a * (b - 1));
      push((a + 1) * b);
      push((a - 1) * b);
    }
    push(answer + 1);
    push(answer - 1);
  } else if (kind === "convert") {
    /* 単位換算: 桁の間違い (×10/÷10)、たし忘れ */
    push(answer * 10);
    push(Math.round(answer / 10));
    push(answer + 10);
    push(answer - 10);
    for (const o of operands) push(o);
    push(answer + 1);
    push(answer - 1);
  } else {
    push(answer + 1);
    push(answer - 1);
    if (kind === "add" || kind === "sub") {
      push(answer + 10);
      push(answer - 10);
      for (const o of operands) push(o); /* 式の数をそのまま答えてしまう */
    }
    if (kind === "time") {
      push(answer + 30);
      push(answer - 30);
    }
    push(answer + 2);
    push(answer - 2);
  }
  /* 予備 (まだ2個に満たない場合の埋め) */
  for (let d = 3; candidates.length < 2 && d < 10; d++) {
    push(answer + d);
    push(answer - d);
  }

  const wrong = shuffle(rng, candidates).slice(0, 2);
  const all = shuffle(rng, [answer, ...wrong]);
  return [String(all[0]), String(all[1]), String(all[2])];
}
