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
  const divisor = gcd(resultNumerator, resultDenominator);
  const answer = formatFraction(resultNumerator, resultDenominator);
  return {
    skillId: "g6_bunsu_mul",
    text: `${a}/${denominatorA} × ${b}/${denominatorB} = ?`,
    a: null,
    b: null,
    op: null,
    answer,
    choices: fractionChoices(answer, resultNumerator, resultDenominator),
    hint: { type: "text", lines: ["分子どうし、分母どうしを かけ、さいごに 約分しよう"] },
    explain: [
      `分子どうしは ${a} × ${b} = ${resultNumerator}、分母どうしは ${denominatorA} × ${denominatorB} = ${resultDenominator}`,
      divisor > 1
        ? `${resultNumerator}/${resultDenominator}の 分子と分母を ${divisor}で わって ${answer}`
        : `${resultNumerator}/${resultDenominator}は これ以上 約分できない`,
      `${a}/${denominatorA} × ${b}/${denominatorB} = ${answer}。答えは ${answer}`,
    ],
  };
}

function genBunsuDiv(): Problem {
  const [a, denominatorA] = reducedProperFraction();
  const [b, denominatorB] = reducedProperFraction();
  const resultNumerator = a * denominatorB;
  const resultDenominator = denominatorA * b;
  const divisor = gcd(resultNumerator, resultDenominator);
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
    hint: { type: "text", lines: ["わる数の 分子と分母を ひっくり返して、かけ算に なおそう"] },
    explain: [
      `わる数 ${b}/${denominatorB}を ${denominatorB}/${b}に ひっくり返す`,
      `${a}/${denominatorA} × ${denominatorB}/${b} = ${resultNumerator}/${resultDenominator}${divisor > 1 ? `、分子と分母を ${divisor}で わる` : "。これは これ以上 約分できない"}`,
      `${a}/${denominatorA} ÷ ${b}/${denominatorB} = ${answer}。答えは ${answer}`,
    ],
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
    hint: { type: "text", lines: [multiply ? "かけている数と 反対の けい算をして、文字だけに しよう" : "たしている数と 反対の けい算をして、文字だけに しよう"] },
    explain: multiply
      ? [`xに ${a}を かけて ${b}なので、反対の わり算をする`, `x = ${b} ÷ ${a} = ${x}`, `たしかめると ${x} × ${a} = ${b}。答えは ${x}`]
      : [`xに ${a}を たして ${b}なので、反対の ひき算をする`, `x = ${b} - ${a} = ${x}`, `たしかめると ${x} + ${a} = ${b}。答えは ${x}`],
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
      hint: { type: "text", lines: ["左の比が 何倍に なったかを しらべ、右の比も おなじだけ かけよう"] },
      explain: [`${a}から ${c}へは ${c} ÷ ${a} = ${multiplier}で、${multiplier}倍`, `右も おなじく ${b} × ${multiplier} = ${answer}`, `${a}:${b} = ${c}:${answer}。□に 入る 答えは ${answer}`],
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
    hint: { type: "text", lines: ["比の 前の数を 後ろの数で わり、分数に なおして 約分しよう"] },
    explain: [`${a}:${b}の 比の値は、前の数を 後ろの数で わる`, `${a} ÷ ${b} = ${a}/${b}`, `${a}/${b}を 約分すると ${answer}。答えは ${answer}`],
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
    hint: { type: "text", lines: [findSpeed ? "きょりを 時間で わって、一時間ぶんの きょりを もとめよう" : "一時間ぶんの きょりに 時間を かけよう"] },
    explain: findSpeed
      ? [`時速は きょり ÷ 時間で もとめる`, `${distance}km ÷ ${hours}時間 = ${speed}km`, `一時間に ${speed}km すすむので、答えは 時速 ${speed}km`]
      : [`きょりは 時速 × 時間で もとめる`, `時速 ${speed}km × ${hours}時間 = ${distance}km`, `${hours}時間ぶんの きょりは ${distance}km。答えは ${distance}km`],
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
    hint: { type: "text", lines: [area ? "半径を 二回 かけてから、円周率を かけよう" : "直径に 円周率を かけよう"] },
    explain: area
      ? [`円の めんせきは 半径 × 半径 × 3.14で もとめる`, `${value}cm × ${value}cm × 3.14 = ${answer}cm²`, `半径 ${value}cmの 円の めんせきは ${answer}cm²。答えは ${answer}cm²`]
      : [`円しゅうは 直径 × 3.14で もとめる`, `${value}cm × 3.14 = ${answer}cm`, `直径 ${value}cmの 円しゅうは ${answer}cm。答えは ${answer}cm`],
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
