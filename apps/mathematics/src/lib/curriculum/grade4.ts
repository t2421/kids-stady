/* 4年生: わり算、がい数、小数、計算のきまり、分数、面積。 */

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

function decimal(tenths: number): string {
  return (tenths / 10).toFixed(1);
}

function stringChoices(answer: string, candidates: string[]): [string, string, string] {
  const wrong = [...new Set(candidates)].filter((choice) => choice !== answer).slice(0, 2);
  if (wrong.length !== 2) throw new Error("not enough unique choices");
  const choices = shuffle([answer, wrong[0], wrong[1]]);
  return [choices[0], choices[1], choices[2]];
}

function genDiv2(): Problem {
  let divisor: number;
  let quotient: number;
  if (Math.random() < 0.7) {
    divisor = randInt(2, 9);
    do quotient = randInt(10, 99); while (divisor * quotient > 999);
  } else {
    divisor = randInt(10, 29);
    quotient = randInt(2, 9);
  }
  const dividend = divisor * quotient;
  return {
    skillId: "g4_div2",
    text: `${dividend} ÷ ${divisor} = ?`,
    a: null,
    b: null,
    op: null,
    answer: String(quotient),
    choices: uniqueChoices(quotient, [quotient - 1, quotient + 1, quotient - 10, quotient + 10], 1, 110),
    hint: null,
    explain: [`${divisor} × □ = ${dividend}と かんがえる`, `${divisor} × ${quotient} = ${dividend}`],
  };
}

function genGaisu(): Problem {
  const n = randInt(1000, 9999);
  const thousand = Math.random() < 0.5;
  const unit = thousand ? 1000 : 100;
  const answer = Math.round(n / unit) * unit;
  const truncated = Math.floor(n / unit) * unit;
  return {
    skillId: "g4_gaisu",
    text: `${n}を ししゃごにゅうで ${thousand ? "千" : "百"}のくらいまで`,
    a: null,
    b: null,
    op: null,
    answer: String(answer),
    choices: uniqueChoices(answer, [truncated, truncated + unit, answer - unit, answer + unit], 0, 11000),
    hint: null,
    explain: [`${thousand ? "百" : "十"}のくらいを 見る`, `${n}を ししゃごにゅうすると ${answer}`],
  };
}

function genShosuMul(): Problem {
  const multiply = Math.random() < 0.5;
  if (multiply) {
    let value: number;
    let integer: number;
    let product: number;
    do {
      value = randInt(2, 99);
      integer = randInt(2, 9);
      product = value * integer;
    } while (product % 10 === 0);
    const answer = decimal(product);
    return {
      skillId: "g4_shosu_mul",
      text: `${decimal(value)} × ${integer} = ?`,
      a: null,
      b: null,
      op: null,
      answer,
      choices: stringChoices(answer, [decimal(product - 1), decimal(product + 1), String(product), decimal(value + integer)]),
      hint: null,
      explain: [`小数点を いったんかくして ${value} × ${integer}`, `小数点を もどして ${answer}`],
    };
  }
  let quotient: number;
  let divisor: number;
  do {
    quotient = randInt(1, 49);
    divisor = randInt(2, 9);
  } while (quotient % 10 === 0 || quotient * divisor < 2 || quotient * divisor > 99);
  const dividend = quotient * divisor;
  const answer = decimal(quotient);
  return {
    skillId: "g4_shosu_mul",
    text: `${decimal(dividend)} ÷ ${divisor} = ?`,
    a: null,
    b: null,
    op: null,
    answer,
    choices: stringChoices(answer, [decimal(quotient - 1), decimal(quotient + 1), String(quotient), decimal(dividend - divisor)]),
    hint: null,
    explain: [`${divisor} × ${answer} = ${decimal(dividend)}`, `だから ${decimal(dividend)} ÷ ${divisor} = ${answer}`],
  };
}

function genKimari(): Problem {
  const a = randInt(2, 9);
  const b = randInt(2, 9);
  const c = randInt(2, 9);
  const parentheses = Math.random() < 0.5;
  const answer = parentheses ? (a + b) * c : a + b * c;
  return {
    skillId: "g4_kimari",
    text: parentheses ? `(${a} + ${b}) × ${c} = ?` : `${a} + ${b} × ${c} = ?`,
    a: null,
    b: null,
    op: null,
    answer: String(answer),
    choices: uniqueChoices(answer, [parentheses ? a + b * c : (a + b) * c, answer - c, answer + c], 0, 170),
    hint: null,
    explain: parentheses
      ? [`かっこの中を さきに: ${a} + ${b} = ${a + b}`, `${a + b} × ${c} = ${answer}`]
      : [`かけ算を さきに: ${b} × ${c} = ${b * c}`, `${a} + ${b * c} = ${answer}`],
  };
}

function genBunsu(): Problem {
  let denominator: number;
  let numerator: number;
  do {
    denominator = randInt(2, 9);
    numerator = randInt(1, denominator - 1);
  } while (gcd(numerator, denominator) !== 1);
  const whole = randInt(1, 3);
  const improperNumerator = whole * denominator + numerator;
  if (Math.random() < 0.5) {
    const answer = `${improperNumerator}/${denominator}`;
    return {
      skillId: "g4_bunsu",
      text: `${whole} と ${numerator}/${denominator} は かぶんすうで?`,
      a: null,
      b: null,
      op: null,
      answer,
      choices: stringChoices(answer, [
        formatFraction(whole + numerator, denominator),
        String(whole),
        formatFraction(improperNumerator + 1, denominator),
      ]),
      hint: null,
      explain: [`${whole}は ${whole * denominator}/${denominator}`, `${whole * denominator + numerator}/${denominator} = ${answer}`],
    };
  }
  const answer = `${whole}と${numerator}/${denominator}`;
  return {
    skillId: "g4_bunsu",
    text: `${improperNumerator}/${denominator}を たいぶんすうにすると?`,
    a: null,
    b: null,
    op: null,
    answer,
    choices: stringChoices(answer, [
      `${whole + 1}と${numerator}/${denominator}`,
      `${whole + 2}と${numerator}/${denominator}`,
    ]),
    hint: null,
    explain: [`${improperNumerator} ÷ ${denominator} = ${whole} あまり ${numerator}`, `こたえは ${answer}`],
  };
}

function genMenseki(): Problem {
  const height = randInt(2, 12);
  const width = randInt(2, 12);
  const answer = height * width;
  return {
    skillId: "g4_menseki",
    text: `たて ${height}cm、よこ ${width}cmの 長方形の めんせきは なんcm²?`,
    a: null,
    b: null,
    op: null,
    answer: `${answer}cm²`,
    choices: stringChoices(`${answer}cm²`, [`${height + width}cm²`, `${answer - 1}cm²`, `${answer + 1}cm²`]),
    hint: null,
    explain: [`長方形の めんせきは たて × よこ`, `${height} × ${width} = ${answer}cm²`],
  };
}

export const GRADE4_SKILLS: SkillDef[] = [
  { id: "g4_div2", grade: 4, label: "わり算のひっさん", generate: genDiv2 },
  { id: "g4_gaisu", grade: 4, label: "がい数", generate: genGaisu },
  { id: "g4_shosu_mul", grade: 4, label: "小数×÷整数", generate: genShosuMul },
  { id: "g4_kimari", grade: 4, label: "計算のきまり", generate: genKimari },
  { id: "g4_bunsu", grade: 4, label: "帯分数と仮分数", generate: genBunsu },
  { id: "g4_menseki", grade: 4, label: "面積", generate: genMenseki },
];
