/*
 * 小3以降で必要になる数の表記ヘルパー。
 * 答えは Problem.answer (文字列) と3択の照合に使われるため、
 * 「同じ数はいつも同じ文字列」になることが絶対条件
 * (0.30 と 0.3 が混ざると正解を選んでも不正解になる)。
 */

import type { Rng } from "./types";
import { randInt } from "./types";

/* 小数の表示: 浮動小数の誤差を丸め、末尾の 0 を落とす (1.50 → "1.5"、2.0 → "2") */
export function dec(value: number, digits = 2): string {
  const fixed = value.toFixed(digits);
  if (!fixed.includes(".")) return fixed;
  return fixed.replace(/0+$/, "").replace(/\.$/, "");
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x === 0 ? 1 : x;
}

export function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

/* 分数の表示: 約分し、整数になるときは分母を落とす (4/2 → "2") */
export function frac(numerator: number, denominator: number): string {
  const g = gcd(numerator, denominator);
  const n = numerator / g;
  const d = denominator / g;
  return d === 1 ? String(n) : `${n}/${d}`;
}

/*
 * 分母がおなじ ひき算の ひく数。約分は 小5 で習うので、小3・小4 では
 * こたえが 約分できない組 (分子の差と分母が たがいに素) だけを出す
 * (たし算の側は 前から そうしている)。n1-1 なら差は 1 で必ず約分できない
 */
export function coprimeDiffSubtrahend(rng: Rng, n1: number, d: number): number {
  for (let i = 0; i < 20; i++) {
    const n2 = randInt(rng, 1, n1 - 1);
    if (gcd(n1 - n2, d) === 1) return n2;
  }
  return n1 - 1;
}

/* 1〜d-1 のうち d と たがいに素な 分子 (約分できない分数にする) */
export function randCoprimeNumerator(rng: Rng, d: number): number {
  let n = randInt(rng, 1, d - 1);
  while (gcd(n, d) !== 1) n = randInt(rng, 1, d - 1);
  return n;
}

/*
 * 分数の計算の さいごの行。約分が要るときは 「21/9 を やくぶんして 7/3」と
 * 途中の分数を見せる (以前は「こたえは 7/3」だけで 約分の一歩が抜けていた)
 */
export function fractionResultLine(numerator: number, denominator: number, answer: string): string {
  const raw = `${numerator}/${denominator}`;
  return raw === answer ? `こたえは ${answer}` : `${raw} を やくぶんして ${answer}`;
}
