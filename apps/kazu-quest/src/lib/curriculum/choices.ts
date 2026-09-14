/*
 * 3択の誤答 (ディストラクタ) 生成。
 * よくある間違いを優先する: ±1 / くりあがり忘れ (±10) / オペランドエコー。
 */

import type { MistakePattern, Rng } from "./types";
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

/*
 * makeChoices と同じ候補生成ロジックを使いつつ、どの「よくある間違い」の
 * ルールが その候補を作ったかを覚えておき、MistakePattern として一緒に返す
 * (LP-03)。makeChoices 自体は変えない — 既存の呼び出し元はそのまま動く。
 * 乱数消費の順番・回数は makeChoices と完全に同じにしてあるので、
 * 同じ (rng, answer, kind, operands) からは同じ choices が出る。
 */
export function makeChoicesTagged(
  rng: Rng,
  answer: number,
  kind: ChoiceKind,
  operands: number[] = [],
): { choices: [string, string, string]; tags: [MistakePattern, MistakePattern, MistakePattern] } {
  const candidates: { value: number; tag: MistakePattern }[] = [];
  const push = (n: number, tag: MistakePattern) => {
    if (
      Number.isInteger(n) &&
      n >= 0 &&
      n !== answer &&
      !candidates.some((c) => c.value === n)
    ) {
      candidates.push({ value: n, tag });
    }
  };

  if (kind === "mul") {
    /* 九九: となりの段・となりのかず (a×(b±1), (a±1)×b) */
    const [a, b] = operands;
    if (a && b) {
      push(a * (b + 1), "neighborRow");
      push(a * (b - 1), "neighborRow");
      push((a + 1) * b, "neighborRow");
      push((a - 1) * b, "neighborRow");
    }
    push(answer + 1, "offByOne");
    push(answer - 1, "offByOne");
  } else if (kind === "convert") {
    /* 単位換算: 桁の間違い (×10/÷10)、たし忘れ */
    push(answer * 10, "placeShift");
    push(Math.round(answer / 10), "placeShift");
    push(answer + 10, "other");
    push(answer - 10, "other");
    for (const o of operands) push(o, "echoOperand");
    push(answer + 1, "offByOne");
    push(answer - 1, "offByOne");
  } else {
    push(answer + 1, "offByOne");
    push(answer - 1, "offByOne");
    if (kind === "add" || kind === "sub") {
      push(answer + 10, "forgotCarry");
      push(answer - 10, "forgotBorrow");
      for (const o of operands) push(o, "echoOperand"); /* 式の数をそのまま答えてしまう */
    }
    if (kind === "time") {
      push(answer + 30, "other");
      push(answer - 30, "other");
    }
    push(answer + 2, "other");
    push(answer - 2, "other");
  }
  /* 予備 (まだ2個に満たない場合の埋め) */
  for (let d = 3; candidates.length < 2 && d < 10; d++) {
    push(answer + d, "other");
    push(answer - d, "other");
  }

  const wrong = shuffle(rng, candidates).slice(0, 2);
  const all = shuffle(rng, [{ value: answer, tag: "other" as MistakePattern }, ...wrong]);
  return {
    choices: [String(all[0].value), String(all[1].value), String(all[2].value)],
    tags: [all[0].tag, all[1].tag, all[2].tag],
  };
}

/*
 * 文字列解答 (小数 "1.5" / 分数 "3/4" / 単位つき) 用の3択。
 * 小3以降は答えが整数とはかぎらないため、呼び出し側が「ありがちな間違い」を
 * 順に渡す。足りない分は答えの形から機械的に作った近い値で埋める
 * (3択が2択に縮まると当てずっぽうで正解できてしまうため)。
 */
export function makeChoicesOf(
  rng: Rng,
  answer: string,
  wrongs: readonly string[],
): [string, string, string] {
  const candidates: string[] = [];
  /*
   * 重複判定は「文字列」ではなく「値」で行う。2/4 と 1/2 が並ぶと
   * 正しい値を選んでも不正解にされてしまうため
   */
  const taken = new Set([choiceValue(answer)]);
  const push = (s: string) => {
    if (s.length === 0) return;
    const v = choiceValue(s);
    if (!Number.isFinite(v) || v < 0 || taken.has(v)) return;
    taken.add(v);
    candidates.push(s);
  };
  for (const w of wrongs) push(w);
  for (const filler of fillers(answer)) {
    if (candidates.length >= 2) break;
    push(filler);
  }

  const wrong = shuffle(rng, candidates).slice(0, 2);
  const all = shuffle(rng, [answer, ...wrong]);
  return [all[0], all[1], all[2]];
}

/* 選択肢の値 ("3/4" → 0.75)。数として読めないものは NaN */
function choiceValue(choice: string): number {
  const fraction = /^(\d+)\/(\d+)$/.exec(choice);
  if (fraction) return Number(fraction[1]) / Number(fraction[2]);
  return Number(choice);
}

/* 答えの形 (分数 / 小数 / 整数) から近い誤答を機械的に作る */
function fillers(answer: string): string[] {
  const fraction = /^(\d+)\/(\d+)$/.exec(answer);
  if (fraction) {
    const n = Number(fraction[1]);
    const d = Number(fraction[2]);
    return [`${n + 1}/${d}`, `${n}/${d + 1}`, `${n + 2}/${d}`, `${d}/${n}`];
  }
  const num = Number(answer);
  if (Number.isFinite(num)) {
    const decimals = answer.includes(".") ? answer.split(".")[1].length : 0;
    const step = 10 ** -decimals;
    return [num + step, num - step, num + 2 * step, num * 10, num / 10]
      .filter((n) => n > 0)
      .map((n) => n.toFixed(decimals));
  }
  return [answer + "?"];
}
