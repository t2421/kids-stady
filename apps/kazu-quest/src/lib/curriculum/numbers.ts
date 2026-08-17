/*
 * 小3以降で必要になる数の表記ヘルパー。
 * 答えは Problem.answer (文字列) と3択の照合に使われるため、
 * 「同じ数はいつも同じ文字列」になることが絶対条件
 * (0.30 と 0.3 が混ざると正解を選んでも不正解になる)。
 */

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
