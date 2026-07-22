/* 3年生: わり算、3けた計算、小数、同分母分数、たんい。 */

import type { Problem, SkillDef } from "./types";
import { shuffle, uniqueChoices } from "./util";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

function formatFraction(numerator: number, denominator: number): string {
  const divisor = gcd(numerator, denominator);
  const n = numerator / divisor;
  const d = denominator / divisor;
  return d === 1 ? String(n) : `${n}/${d}`;
}

function formatTenths(tenths: number): string {
  return (tenths / 10).toFixed(1).replace(/\.0$/, "");
}

function stringChoices(answer: string, candidates: string[]): [string, string, string] {
  const wrong = [...new Set(candidates)].filter((choice) => choice !== answer).slice(0, 2);
  if (wrong.length !== 2) throw new Error("not enough unique choices");
  const choices = shuffle([answer, wrong[0], wrong[1]]);
  return [choices[0], choices[1], choices[2]];
}

function genDiv(): Problem {
  const divisor = randInt(2, 9);
  const quotient = randInt(2, 9);
  const dividend = divisor * quotient;
  return {
    skillId: "g3_div",
    text: `${dividend} ÷ ${divisor} = ?`,
    a: null,
    b: null,
    op: null,
    answer: String(quotient),
    choices: uniqueChoices(quotient, [quotient - 1, quotient + 1, divisor, quotient + 2], 1, 10),
    hint: null,
    explain: [`${divisor} × ${quotient} = ${dividend}`, `だから ${dividend} ÷ ${divisor} = ${quotient}`],
  };
}

function genDivAmari(): Problem {
  const divisor = randInt(2, 9);
  const quotient = randInt(2, 9);
  const remainder = randInt(1, divisor - 1);
  const dividend = divisor * quotient + remainder;
  const answer = `${quotient}あまり${remainder}`;
  return {
    skillId: "g3_div_amari",
    text: `${dividend} ÷ ${divisor} = ?`,
    a: null,
    b: null,
    op: null,
    answer,
    choices: stringChoices(answer, [
      `${quotient + 1}あまり${remainder}`,
      `${quotient - 1}あまり${remainder}`,
    ]),
    hint: null,
    explain: [`${divisor} × ${quotient} = ${divisor * quotient}`, `${dividend} - ${divisor * quotient} = ${remainder}、こたえは ${answer}`],
  };
}

function hasCarry(a: number, b: number): boolean {
  while (a > 0 || b > 0) {
    if (a % 10 + (b % 10) >= 10) return true;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return false;
}

function hasBorrow(a: number, b: number): boolean {
  while (a > 0 || b > 0) {
    if (a % 10 < b % 10) return true;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return false;
}

function genAdd3(): Problem {
  const addition = Math.random() < 0.5;
  for (;;) {
    const a = randInt(100, 899);
    const b = randInt(100, 899);
    if (addition) {
      const answer = a + b;
      if (answer >= 1000 || !hasCarry(a, b)) continue;
      return {
        skillId: "g3_add3",
        text: `${a} + ${b} = ?`,
        a,
        b,
        op: "+",
        answer: String(answer),
        choices: uniqueChoices(answer, [answer - 100, answer + 100, answer - 10, answer + 10], 0, 1100),
        hint: null,
        explain: ["1のくらいから じゅんに たして、10をこえたら くりあげる", `${a} + ${b} = ${answer}`],
      };
    }
    if (a <= b || !hasBorrow(a, b)) continue;
    const answer = a - b;
    return {
      skillId: "g3_add3",
      text: `${a} - ${b} = ?`,
      a,
      b,
      op: "-",
      answer: String(answer),
      choices: uniqueChoices(answer, [answer + 100, answer - 100, answer + 10, answer - 10], 0, 899),
      hint: null,
      explain: ["1のくらいから じゅんに ひいて、たりなければ 1つ上のくらいから かりる", `${a} - ${b} = ${answer}`],
    };
  }
}

function genMult2x1(): Problem {
  const a = randInt(11, 49);
  const b = randInt(2, 9);
  const answer = a * b;
  return {
    skillId: "g3_mult2x1",
    text: `${a} × ${b} = ?`,
    a: null,
    b: null,
    op: null,
    answer: String(answer),
    choices: uniqueChoices(answer, [(a - 1) * b, (a + 1) * b, answer - 10, answer + 10], 0, 500),
    hint: null,
    explain: [`${a}を 10のくらいと 1のくらいに わけて ${b}ばいする`, `${a} × ${b} = ${answer}`],
  };
}

function genShosu(): Problem {
  const addition = Math.random() < 0.5;
  let left: number;
  let right: number;
  let result: number;
  if (addition) {
    do {
      left = randInt(1, 9);
      right = randInt(1, 9);
      result = left + right;
    } while (result >= 20);
  } else {
    left = randInt(11, 19);
    right = randInt(1, 9);
    result = left - right;
  }
  const answer = formatTenths(result);
  return {
    skillId: "g3_shosu",
    text: `${(left / 10).toFixed(1)} ${addition ? "+" : "-"} ${(right / 10).toFixed(1)} = ?`,
    a: null,
    b: null,
    op: null,
    answer,
    choices: stringChoices(answer, [formatTenths(result - 1), formatTenths(result + 1), String(result), formatTenths(result + 10)]),
    hint: null,
    explain: [`0.1が いくつあるかで ${addition ? "たす" : "ひく"}`, `こたえは ${answer}`],
  };
}

function genBunsu(): Problem {
  const addition = Math.random() < 0.5;
  let denominator: number;
  let a: number;
  let b: number;
  let resultNumerator: number;
  for (;;) {
    denominator = randInt(addition ? 2 : 3, 9);
    a = randInt(1, denominator - 1);
    b = randInt(1, denominator - 1);
    if (gcd(a, denominator) !== 1 || gcd(b, denominator) !== 1) continue;
    resultNumerator = addition ? a + b : a - b;
    if (resultNumerator > 0 && resultNumerator <= denominator) break;
  }
  const answer = formatFraction(resultNumerator, denominator);
  return {
    skillId: "g3_bunsu",
    text: `${a}/${denominator} ${addition ? "+" : "-"} ${b}/${denominator} = ?`,
    a: null,
    b: null,
    op: null,
    answer,
    choices: stringChoices(answer, [
      formatFraction(resultNumerator - 1 || resultNumerator + 2, denominator),
      formatFraction(resultNumerator + 1, denominator),
      formatFraction(resultNumerator, denominator + 1),
      formatFraction(Math.abs(a - b) || 1, denominator),
    ]),
    hint: null,
    explain: [`分母は そのまま、分子を ${addition ? "たす" : "ひく"}`, `${a} ${addition ? "+" : "-"} ${b} = ${resultNumerator}、こたえは ${answer}`],
  };
}

function genTani(): Problem {
  const kind = randInt(0, 2);
  if (kind === 0 || kind === 1) {
    const source = kind === 0 ? "km" : "kg";
    const target = kind === 0 ? "m" : "g";
    const answer = `1000${target}`;
    return {
      skillId: "g3_tani",
      text: `1${source} = なん${target}?`,
      a: null,
      b: null,
      op: null,
      answer,
      choices: stringChoices(answer, [`100${target}`, `10${target}`, `10000${target}`]),
      hint: null,
      explain: [`1${source}は 1000${target}`],
    };
  }
  const km = randInt(1, 9);
  const m = randInt(1, 999);
  const answer = km * 1000 + m;
  return {
    skillId: "g3_tani",
    text: `${km}km ${m}m = なんm?`,
    a: null,
    b: null,
    op: null,
    answer: `${answer}m`,
    choices: stringChoices(`${answer}m`, [`${km * 100 + m}m`, `${km * 1000}m`, `${answer + 1000}m`]),
    hint: null,
    explain: [`${km}kmは ${km * 1000}m`, `${km * 1000}m + ${m}m = ${answer}m`],
  };
}

export const GRADE3_SKILLS: SkillDef[] = [
  { id: "g3_div", grade: 3, label: "わり算", generate: genDiv },
  { id: "g3_div_amari", grade: 3, label: "あまりのあるわり算", generate: genDivAmari },
  { id: "g3_add3", grade: 3, label: "3けたのたしひき", generate: genAdd3 },
  { id: "g3_mult2x1", grade: 3, label: "2けた×1けた", generate: genMult2x1 },
  { id: "g3_shosu", grade: 3, label: "小数のたしひき", generate: genShosu },
  { id: "g3_bunsu", grade: 3, label: "同分母の分数", generate: genBunsu },
  { id: "g3_tani", grade: 3, label: "たんい", generate: genTani },
];
