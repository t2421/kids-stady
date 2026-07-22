/* 6年生: 分数の乗除、文字と式、比、速さ、円。 */

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

function formatDecimal(value: number): string {
  return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function stringChoices(answer: string, candidates: string[]): [string, string, string] {
  const wrong = [...new Set(candidates)].filter((choice) => choice !== answer).slice(0, 2);
  if (wrong.length !== 2) throw new Error("not enough unique choices");
  const choices = shuffle([answer, wrong[0], wrong[1]]);
  return [choices[0], choices[1], choices[2]];
}

function reducedProperFraction(): [number, number] {
  for (;;) {
    const denominator = randInt(2, 9);
    const numerator = randInt(1, denominator - 1);
    if (gcd(numerator, denominator) === 1) return [numerator, denominator];
  }
}

function fractionChoices(answer: string, numerator: number, denominator: number): [string, string, string] {
  return stringChoices(answer, [
    formatFraction(numerator + 1, denominator),
    formatFraction(Math.max(1, numerator - 1), denominator),
    formatFraction(numerator, denominator + 1),
    formatFraction(denominator, numerator),
  ]);
}

function genBunsuMul(): Problem {
  const [a, denominatorA] = reducedProperFraction();
  const [b, denominatorB] = reducedProperFraction();
  const resultNumerator = a * b;
  const resultDenominator = denominatorA * denominatorB;
  const answer = formatFraction(resultNumerator, resultDenominator);
  return {
    skillId: "g6_bunsu_mul",
    text: `${a}/${denominatorA} × ${b}/${denominatorB} = ?`,
    a: null,
    b: null,
    op: null,
    answer,
    choices: fractionChoices(answer, resultNumerator, resultDenominator),
    hint: null,
    explain: [`分子どうし、分母どうしを かける`, `${a * b}/${denominatorA * denominatorB}を やくぶんして ${answer}`],
  };
}

function genBunsuDiv(): Problem {
  const [a, denominatorA] = reducedProperFraction();
  const [b, denominatorB] = reducedProperFraction();
  const resultNumerator = a * denominatorB;
  const resultDenominator = denominatorA * b;
  const answer = formatFraction(resultNumerator, resultDenominator);
  return {
    skillId: "g6_bunsu_div",
    text: `${a}/${denominatorA} ÷ ${b}/${denominatorB} = ?`,
    a: null,
    b: null,
    op: null,
    answer,
    choices: stringChoices(answer, [
      formatFraction(a * b, denominatorA * denominatorB),
      formatFraction(denominatorA * b, a * denominatorB),
      formatFraction(resultNumerator + 1, resultDenominator),
      formatFraction(resultNumerator, resultDenominator + 1),
    ]),
    hint: null,
    explain: [`わる数 ${b}/${denominatorB}を ${denominatorB}/${b}に して かける`, `${a}/${denominatorA} × ${denominatorB}/${b} = ${answer}`],
  };
}

function genMoji(): Problem {
  const x = randInt(1, 12);
  const a = randInt(2, 9);
  const multiply = Math.random() < 0.5;
  const b = multiply ? x * a : x + a;
  return {
    skillId: "g6_moji",
    text: `x ${multiply ? "×" : "+"} ${a} = ${b} のとき x は?`,
    a: null,
    b: null,
    op: null,
    answer: String(x),
    choices: uniqueChoices(x, [multiply ? b - a : b * a, x - 1, x + 1, a], 0, 120),
    hint: null,
    explain: multiply
      ? [`x = ${b} ÷ ${a}`, `${b} ÷ ${a} = ${x}`]
      : [`x = ${b} - ${a}`, `${b} - ${a} = ${x}`],
  };
}

function genHi(): Problem {
  const a = randInt(1, 9);
  const b = randInt(1, 9);
  if (Math.random() < 0.5) {
    const multiplier = randInt(2, 5);
    const c = a * multiplier;
    const answer = b * multiplier;
    return {
      skillId: "g6_hi",
      text: `${a}:${b} = ${c}:□`,
      a: null,
      b: null,
      op: null,
      answer: String(answer),
      choices: uniqueChoices(answer, [b + multiplier, b * (multiplier - 1), answer - 1, answer + 1], 0, 50),
      hint: null,
      explain: [`${a}から ${c}は ${multiplier}ばい`, `${b}も ${multiplier}ばいして ${answer}`],
    };
  }
  const answer = formatFraction(a, b);
  return {
    skillId: "g6_hi",
    text: `${a}:${b}の 比のあたいは?`,
    a: null,
    b: null,
    op: null,
    answer,
    choices: stringChoices(answer, [
      formatFraction(b, a),
      formatFraction(a + 1, b),
      formatFraction(a, b + 1),
      String(a - b),
    ]),
    hint: null,
    explain: [`比のあたいは ${a} ÷ ${b}`, `やくぶんすると ${answer}`],
  };
}

function genHayasa(): Problem {
  const speed = randInt(2, 9) * 10;
  const hours = randInt(1, 5);
  const distance = speed * hours;
  const findSpeed = Math.random() < 0.5;
  const answer = findSpeed ? speed : distance;
  return {
    skillId: "g6_hayasa",
    text: findSpeed
      ? `${distance}kmを ${hours}時間で すすむと 時速は?`
      : `時速 ${speed}kmで ${hours}時間 すすむと きょりは?`,
    a: null,
    b: null,
    op: null,
    answer: String(answer),
    choices: uniqueChoices(answer, findSpeed
      ? [distance * hours, distance - hours, speed + 10, speed - 10]
      : [speed + hours, distance + speed, distance - speed, distance + 10], 0, 500),
    hint: null,
    explain: findSpeed
      ? [`時速 = きょり ÷ 時間`, `${distance} ÷ ${hours} = ${speed}`]
      : [`きょり = 時速 × 時間`, `${speed} × ${hours} = ${distance}`],
  };
}

function genEn(): Problem {
  const values = [5, 10, 20, 50] as const;
  const value = values[randInt(0, values.length - 1)];
  const area = Math.random() < 0.5;
  const result = area ? 3.14 * value * value : 3.14 * value;
  const answer = formatDecimal(result);
  return {
    skillId: "g6_en",
    text: area
      ? `はんけい ${value}cmの 円の めんせきは?`
      : `直径 ${value}cmの 円しゅうは?`,
    a: null,
    b: null,
    op: null,
    answer,
    choices: stringChoices(answer, area
      ? [formatDecimal(3.14 * value * 2), formatDecimal(3.14 * value), formatDecimal(value * value)]
      : [formatDecimal(3.14 * value * 2), formatDecimal(3.14 * (value / 2) ** 2), formatDecimal(value * 2)]),
    hint: null,
    explain: area
      ? [`円のめんせき = はんけい × はんけい × 3.14`, `${value} × ${value} × 3.14 = ${answer}`]
      : [`円しゅう = 直径 × 3.14`, `${value} × 3.14 = ${answer}`],
  };
}

export const GRADE6_SKILLS: SkillDef[] = [
  { id: "g6_bunsu_mul", grade: 6, label: "分数×分数", generate: genBunsuMul },
  { id: "g6_bunsu_div", grade: 6, label: "分数÷分数", generate: genBunsuDiv },
  { id: "g6_moji", grade: 6, label: "文字と式", generate: genMoji },
  { id: "g6_hi", grade: 6, label: "比", generate: genHi },
  { id: "g6_hayasa", grade: 6, label: "速さ", generate: genHayasa },
  { id: "g6_en", grade: 6, label: "円", generate: genEn },
];
