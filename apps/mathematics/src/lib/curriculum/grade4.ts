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
    hint: { type: "text", lines: ["わる数の ばい数で、わられる数に なるものを さがそう"] },
    explain: [`${dividend} ÷ ${divisor}は、${divisor} × □ = ${dividend}と かんがえる`, `${divisor} × ${quotient} = ${dividend}なので、商は ${quotient}`, `たしかめると ${quotient} × ${divisor} = ${dividend}。こたえは ${quotient}`],
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
    hint: { type: "text", lines: ["のこす くらいの 一つ右を 見て、切り上げるか 切りすてるか きめよう"] },
    explain: [
      `${thousand ? "千" : "百"}のくらいまでにするので、${thousand ? "百" : "十"}のくらいの ${Math.floor(n / (unit / 10)) % 10}を 見る`,
      `${Math.floor(n / (unit / 10)) % 10}は ${Math.floor(n / (unit / 10)) % 10 >= 5 ? "5いじょうなので 切り上げる" : "4いかなので 切りすてる"}`,
      `${n}を ししゃごにゅうすると ${answer}。こたえは ${answer}`,
    ],
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
      hint: { type: "text", lines: ["小数点を いったん かくして かけ、もとの いちへ もどそう"] },
      explain: [`${decimal(value)}を 十分の一が ${value}こ と かんがえる`, `${value} × ${integer} = ${product}なので、十分の一が ${product}こ`, `小数点を もどすと ${decimal(value)} × ${integer} = ${answer}。こたえは ${answer}`],
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
    hint: { type: "text", lines: ["わる数を かけて、わられる小数に なる数を さがそう"] },
    explain: [`${decimal(dividend)} ÷ ${divisor}は、${divisor} × □ = ${decimal(dividend)}と かんがえる`, `${divisor} × ${answer} = ${decimal(dividend)}`, `だから ${decimal(dividend)} ÷ ${divisor} = ${answer}。こたえは ${answer}`],
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
    hint: { type: "text", lines: ["かっこの中を さきに、つぎに かけ算、さいごに たし算をしよう"] },
    explain: parentheses
      ? [`かっこの中を さきに けいさんする`, `${a} + ${b} = ${a + b}、つぎに ${a + b} × ${c} = ${answer}`, `たしかめると (${a} + ${b}) × ${c} = ${answer}。こたえは ${answer}`]
      : [`たし算より かけ算を さきに けいさんする`, `${b} × ${c} = ${b * c}、つぎに ${a} + ${b * c} = ${answer}`, `たしかめると ${a} + ${b} × ${c} = ${answer}。こたえは ${answer}`],
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
      hint: { type: "text", lines: ["整数を 分母と おなじ数の 分数に なおし、分子を たそう"] },
      explain: [`整数 ${whole}を 分母 ${denominator}の 分数にすると ${whole * denominator}/${denominator}`, `分子を たして ${whole * denominator} + ${numerator} = ${improperNumerator}`, `${whole}と${numerator}/${denominator} = ${improperNumerator}/${denominator}。こたえは ${answer}`],
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
    hint: { type: "text", lines: ["分子を 分母で わり、商を 整数、あまりを 分子にしよう"] },
    explain: [`分子 ${improperNumerator}を 分母 ${denominator}で わる`, `${improperNumerator} ÷ ${denominator} = ${whole} あまり ${numerator}`, `整数は ${whole}、分数は ${numerator}/${denominator}。こたえは ${answer}`],
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
    hint: { type: "text", lines: ["たてと よこの 長さを かけて、正方形が いくつ入るか もとめよう"] },
    explain: [`長方形の めんせきは たて × よこで もとめる`, `たて ${height}cm × よこ ${width}cm = ${answer}cm²`, `たしかめると ${height} × ${width} = ${answer}。こたえは ${answer}cm²`],
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
