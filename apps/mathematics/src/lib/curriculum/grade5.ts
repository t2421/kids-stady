/* 5年生: 小数、異分母分数、約分、倍数・約数、割合、平均。 */

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

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

function formatFraction(numerator: number, denominator: number): string {
  const divisor = gcd(numerator, denominator);
  const n = numerator / divisor;
  const d = denominator / divisor;
  return d === 1 ? String(n) : `${n}/${d}`;
}

function formatDecimal(value: number, places = 2): string {
  return value.toFixed(places).replace(/0+$/, "").replace(/\.$/, "");
}

function stringChoices(answer: string, candidates: string[]): [string, string, string] {
  const wrong = [...new Set(candidates)].filter((choice) => choice !== answer).slice(0, 2);
  if (wrong.length !== 2) throw new Error("not enough unique choices");
  const choices = shuffle([answer, wrong[0], wrong[1]]);
  return [choices[0], choices[1], choices[2]];
}

function genShosuMul(): Problem {
  const small = Math.random() < 0.5;
  const leftTenths = small ? randInt(1, 9) : randInt(11, 99);
  const rightTenths = randInt(1, 9);
  const productHundredths = leftTenths * rightTenths;
  const answer = formatDecimal(productHundredths / 100);
  return {
    skillId: "g5_shosu_mul",
    text: `${(leftTenths / 10).toFixed(1)} × ${(rightTenths / 10).toFixed(1)} = ?`,
    a: null,
    b: null,
    op: null,
    answer,
    choices: stringChoices(answer, [
      formatDecimal(productHundredths / 10),
      formatDecimal(productHundredths / 1000),
      formatDecimal((productHundredths + 1) / 100),
    ]),
    hint: { type: "text", lines: ["小数点を いったん かくして かけ、二つの数の 小数けたぶん もどそう"] },
    explain: [`小数点を いったん かくして、${leftTenths} × ${rightTenths}を けいさんする`, `${leftTenths} × ${rightTenths} = ${productHundredths}。小数のけたは あわせて 2けた`, `小数点を 2けた もどすと ${(leftTenths / 10).toFixed(1)} × ${(rightTenths / 10).toFixed(1)} = ${answer}。こたえは ${answer}`],
  };
}

function genShosuDiv(): Problem {
  const divisorTenths = randInt(1, 9);
  const integerAnswer = Math.random() < 0.5;
  let quotientTenths: number;
  do {
    quotientTenths = integerAnswer ? randInt(1, 9) * 10 : randInt(1, 99);
  } while (
    (!integerAnswer && quotientTenths % 10 === 0)
    || (divisorTenths * quotientTenths) % 100 === 0
  );
  const dividend = (divisorTenths * quotientTenths) / 100;
  const answer = formatDecimal(quotientTenths / 10, 1);
  return {
    skillId: "g5_shosu_div",
    text: `${formatDecimal(dividend)} ÷ ${(divisorTenths / 10).toFixed(1)} = ?`,
    a: null,
    b: null,
    op: null,
    answer,
    choices: stringChoices(answer, [
      formatDecimal(quotientTenths / 100),
      formatDecimal(quotientTenths),
      formatDecimal((quotientTenths + 1) / 10),
    ]),
    hint: { type: "text", lines: ["わる数が 整数に なるまで、わられる数と いっしょに 小数点を 右へ うつそう"] },
    explain: [
      `わる数 ${(divisorTenths / 10).toFixed(1)}を 整数にするため、どちらも 10ばいする`,
      `${formatDecimal(dividend)} ÷ ${(divisorTenths / 10).toFixed(1)} = ${formatDecimal(dividend * 10)} ÷ ${divisorTenths}`,
      `${formatDecimal(dividend * 10)} ÷ ${divisorTenths} = ${answer}。こたえは ${answer}`,
    ],
  };
}

function genBunsuAdd(): Problem {
  for (;;) {
    const denominatorA = randInt(2, 6);
    let denominatorB = randInt(2, 6);
    if (denominatorB === denominatorA) continue;
    const numeratorA = randInt(1, denominatorA - 1);
    const numeratorB = randInt(1, denominatorB - 1);
    if (gcd(numeratorA, denominatorA) !== 1 || gcd(numeratorB, denominatorB) !== 1) continue;
    const addition = Math.random() < 0.5;
    const commonDenominator = lcm(denominatorA, denominatorB);
    const convertedA = numeratorA * (commonDenominator / denominatorA);
    const convertedB = numeratorB * (commonDenominator / denominatorB);
    const resultNumerator = addition ? convertedA + convertedB : convertedA - convertedB;
    if (resultNumerator <= 0) continue;
    const answer = formatFraction(resultNumerator, commonDenominator);
    return {
      skillId: "g5_bunsu_add",
      text: `${numeratorA}/${denominatorA} ${addition ? "+" : "-"} ${numeratorB}/${denominatorB} = ?`,
      a: null,
      b: null,
      op: null,
      answer,
      choices: stringChoices(answer, [
        formatFraction(addition ? numeratorA + numeratorB : Math.abs(numeratorA - numeratorB) || 1, denominatorA + denominatorB),
        formatFraction(resultNumerator + 1, commonDenominator),
        formatFraction(Math.max(1, resultNumerator - 1), commonDenominator),
        formatFraction(resultNumerator, commonDenominator + 1),
      ]),
      hint: { type: "text", lines: ["二つの分母の ばい数を さがし、分母を そろえてから けいさんしよう"] },
      explain: [
        `分母 ${denominatorA}と ${denominatorB}を ${commonDenominator}に そろえる（通分）`,
        `${numeratorA}/${denominatorA} = ${convertedA}/${commonDenominator}、${numeratorB}/${denominatorB} = ${convertedB}/${commonDenominator}`,
        `${convertedA}/${commonDenominator} ${addition ? "+" : "-"} ${convertedB}/${commonDenominator} = ${resultNumerator}/${commonDenominator}`,
        `${resultNumerator}/${commonDenominator}を 約分して、答えは ${answer}`,
      ],
    };
  }
}

function genYakubun(): Problem {
  for (;;) {
    const denominator = randInt(2, 10);
    const numerator = randInt(1, denominator - 1);
    if (gcd(numerator, denominator) !== 1) continue;
    const maxMultiplier = Math.floor(20 / denominator);
    if (maxMultiplier < 2) continue;
    const multiplier = randInt(2, maxMultiplier);
    const shownNumerator = numerator * multiplier;
    const shownDenominator = denominator * multiplier;
    const answer = formatFraction(numerator, denominator);
    return {
      skillId: "g5_yakubun",
      text: `${shownNumerator}/${shownDenominator}を やくぶんすると?`,
      a: null,
      b: null,
      op: null,
      answer,
      choices: stringChoices(answer, [
        formatFraction(shownNumerator - 1, shownDenominator - 1),
        formatFraction(shownNumerator, shownDenominator - multiplier),
        formatFraction(numerator, shownDenominator),
      ]),
      hint: { type: "text", lines: ["分子と分母を どちらも わり切れる おなじ数で わろう"] },
      explain: [`${shownNumerator}と ${shownDenominator}は どちらも ${multiplier}で わり切れる`, `分子は ${shownNumerator} ÷ ${multiplier} = ${numerator}、分母は ${shownDenominator} ÷ ${multiplier} = ${denominator}`, `${shownNumerator}/${shownDenominator} = ${answer}。これ以上 約分できないので、答えは ${answer}`],
    };
  }
}

function genBaisu(): Problem {
  const a = randInt(2, 12);
  const b = randInt(2, 12);
  const leastCommonMultiple = Math.random() < 0.5;
  const answer = leastCommonMultiple ? lcm(a, b) : gcd(a, b);
  return {
    skillId: "g5_baisu",
    text: `${a}と ${b}の ${leastCommonMultiple ? "さいしょうこうばいすう" : "さいだいこうやくすう"}は?`,
    a: null,
    b: null,
    op: null,
    answer: String(answer),
    choices: uniqueChoices(answer, leastCommonMultiple
      ? [a * b, Math.max(a, b), answer + Math.min(a, b)]
      : [Math.min(a, b), 1, answer + 1, answer - 1], 0, 150),
    hint: { type: "text", lines: [leastCommonMultiple ? "二つの数の ばい数を ならべ、はじめに そろう数を さがそう" : "二つの数を どちらも わり切れる数を ならべ、いちばん大きい数を さがそう"] },
    explain: leastCommonMultiple
      ? [`${a}の ばい数と ${b}の ばい数を 小さいじゅんに ならべる`, `${answer}は ${a}でも ${b}でも わり切れ、はじめて そろう`, `だから ${a}と ${b}の さいしょうこうばいすうは ${answer}`]
      : [`${a}と ${b}を どちらも わり切れる数を さがす`, `${a} ÷ ${answer} = ${a / answer}、${b} ÷ ${answer} = ${b / answer}で、どちらも あまりなし`, `その中で いちばん大きいので、さいだいこうやくすうは ${answer}`],
  };
}

function genWariai(): Problem {
  const kind = randInt(0, 2);
  const digit = randInt(1, 9);
  const percent = digit * 10;
  if (kind === 0) {
    const people = randInt(1, 9) * 10;
    const answer = (people * percent) / 100;
    return {
      skillId: "g5_wariai",
      text: `${people}人の ${percent}%は なん人?`,
      a: null,
      b: null,
      op: null,
      answer: String(answer),
      choices: uniqueChoices(answer, [people - answer, answer * 10, answer + digit, answer - digit], 0, 100),
      hint: { type: "text", lines: ["パーセントを 小数に なおし、『の』を かけ算に しよう"] },
      explain: [`${percent}%を 小数に なおすと ${percent} ÷ 100 = ${formatDecimal(percent / 100, 1)}`, `${people}人の ${percent}%は ${people} × ${formatDecimal(percent / 100, 1)} = ${answer}`, `単位を つけて、答えは ${answer}人`],
    };
  }
  if (kind === 1) {
    const answer = `${percent}%`;
    return {
      skillId: "g5_wariai",
      text: `0.${digit} = なん%?`,
      a: null,
      b: null,
      op: null,
      answer,
      choices: stringChoices(answer, [`${digit}%`, `${percent + 10}%`, `${percent * 10}%`]),
      hint: { type: "text", lines: ["小数を パーセントに なおすときは、小数点を 右へ 二けた うつそう"] },
      explain: [`小数を %に なおすには 100ばいする`, `0.${digit} × 100 = ${percent}`, `%を つけて、0.${digit} = ${answer}。答えは ${answer}`],
    };
  }
  const answer = `0.${digit}`;
  return {
    skillId: "g5_wariai",
    text: `${percent}% = 小数で?`,
    a: null,
    b: null,
    op: null,
    answer,
    choices: stringChoices(answer, [`${digit}`, `0.0${digit}`, String(percent)]),
    hint: { type: "text", lines: ["パーセントを 小数に なおすときは、小数点を 左へ 二けた うつそう"] },
    explain: [`%を 小数に なおすには 100で わる`, `${percent} ÷ 100 = ${answer}`, `${percent}% = ${answer}。答えは ${answer}`],
  };
}

function genHeikin(): Problem {
  let a: number;
  let b: number;
  let c: number;
  do {
    a = randInt(10, 90);
    b = randInt(10, 90);
    c = randInt(10, 90);
  } while ((a + b + c) % 3 !== 0);
  const total = a + b + c;
  const answer = total / 3;
  return {
    skillId: "g5_heikin",
    text: `${a}、${b}、${c}の へいきんは?`,
    a: null,
    b: null,
    op: null,
    answer: String(answer),
    choices: uniqueChoices(answer, [answer - 1, answer + 1, Math.floor(total / 2), total], 0, 270),
    hint: { type: "text", lines: ["すべての数を たしてから、数の こ数で わろう"] },
    explain: [`まず 三つの数を たすと ${a} + ${b} + ${c} = ${total}`, `合計 ${total}を 三つに ひとしく 分けて ${total} ÷ 3 = ${answer}`, `たしかめると ${answer} × 3 = ${total}。答えは ${answer}`],
  };
}

export const GRADE5_SKILLS: SkillDef[] = [
  { id: "g5_shosu_mul", grade: 5, label: "小数×小数", generate: genShosuMul },
  { id: "g5_shosu_div", grade: 5, label: "小数÷小数", generate: genShosuDiv },
  { id: "g5_bunsu_add", grade: 5, label: "異分母の分数", generate: genBunsuAdd },
  { id: "g5_yakubun", grade: 5, label: "約分", generate: genYakubun },
  { id: "g5_baisu", grade: 5, label: "倍数・約数", generate: genBaisu },
  { id: "g5_wariai", grade: 5, label: "割合", generate: genWariai },
  { id: "g5_heikin", grade: 5, label: "平均", generate: genHeikin },
];
