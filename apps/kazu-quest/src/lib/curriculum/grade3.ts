/*
 * 小3のスキルと問題ジェネレータ (第3章「砂漠の盗賊王と わけまえのピラミッド」)。
 * ここから答えは整数とはかぎらない — 小数は dec()、分数は frac() で
 * 表記を1本化し、3択は makeChoicesOf に「ありがちな間違い」を渡して作る。
 */

import type { Problem, Rng } from "./types";
import { randInt } from "./types";
import { makeChoicesOf } from "./choices";
import { dec, frac, gcd } from "./numbers";

/* わり算 (九九の逆算・わりきれる) */
function genDiv(rng: Rng): Problem {
  const divisor = randInt(rng, 2, 9);
  const answer = randInt(rng, 2, 9);
  const dividend = divisor * answer;
  return {
    skillId: "g3_div",
    text: `${dividend} ÷ ${divisor} = ?`,
    a: dividend,
    b: divisor,
    op: "÷",
    answer: String(answer),
    choices: makeChoicesOf(rng, String(answer), [
      String(answer + 1),
      String(answer - 1),
      String(divisor),
      String(dividend - divisor),
    ]),
    hint: null,
    explain: [
      `${divisor}のだんの 九九で ${dividend}に なるのは?`,
      `${divisor} × ${answer} = ${dividend}`,
      `だから ${dividend} ÷ ${divisor} = ${answer}`,
    ],
  };
}

/* あまりのある わり算 (あまりを答える) */
function genDivRemainder(rng: Rng): Problem {
  const divisor = randInt(rng, 3, 9);
  const quotient = randInt(rng, 2, 9);
  const remainder = randInt(rng, 1, divisor - 1);
  const dividend = divisor * quotient + remainder;
  return {
    skillId: "g3_div_remainder",
    text: `${dividend} ÷ ${divisor} の あまりは いくつ?`,
    a: dividend,
    b: divisor,
    op: "÷",
    answer: String(remainder),
    choices: makeChoicesOf(rng, String(remainder), [
      String(quotient),
      String(remainder + 1),
      String(divisor - remainder),
      "0",
    ]),
    hint: null,
    explain: [
      `${divisor} × ${quotient} = ${divisor * quotient} まで いける`,
      `${dividend} - ${divisor * quotient} = ${remainder}`,
      `${dividend} ÷ ${divisor} = ${quotient} あまり ${remainder}`,
    ],
  };
}

/* かけ算の ひっ算 (2桁 × 1桁) */
function genMulColumn(rng: Rng): Problem {
  /* 一のくらいが 0 だと くり上がりが おきず ひっ算の練習にならない */
  const a = randInt(rng, 1, 9) * 10 + randInt(rng, 1, 9);
  const b = randInt(rng, 2, 9);
  const answer = a * b;
  const tens = Math.floor(a / 10);
  const ones = a % 10;
  /* くり上げ忘れ: 一の位の くり上がりを 十の位に たさない */
  const carryForget = tens * b * 10 + ((ones * b) % 10);
  return {
    skillId: "g3_mul_column",
    text: `ひっさんで けいさんしよう\n${a} × ${b} = ?`,
    a,
    b,
    op: "×",
    answer: String(answer),
    choices: makeChoicesOf(rng, String(answer), [
      String(carryForget),
      String(answer + 10),
      String(answer - 10),
      String(answer + 1),
    ]),
    hint: null,
    explain: [
      `一のくらい: ${ones} × ${b} = ${ones * b}`,
      `十のくらい: ${tens} × ${b} = ${tens * b} (${tens * b}0)`,
      `${tens * b * 10} + ${ones * b} = ${answer}`,
    ],
  };
}

/* 大きい数 (万) */
function genBigNumber(rng: Rng): Problem {
  if (rng() < 0.5) {
    const n = randInt(rng, 2, 9);
    const answer = n * 10000;
    return {
      skillId: "g3_big_number",
      text: `10000が ${n}こで いくつ?`,
      a: n,
      b: 10000,
      op: "×",
      answer: String(answer),
      choices: makeChoicesOf(rng, String(answer), [
        String(n * 1000),
        String(n * 100000),
        String(answer + 10000),
      ]),
      hint: null,
      explain: [`10000の ${n}こ分だから`, `10000 × ${n} = ${answer}`],
    };
  }
  const thousands = randInt(rng, 11, 99);
  const value = thousands * 1000;
  return {
    skillId: "g3_big_number",
    text: `${value} は 1000が いくつ分?`,
    a: value,
    b: 1000,
    op: "÷",
    answer: String(thousands),
    choices: makeChoicesOf(rng, String(thousands), [
      String(thousands * 10),
      String(Math.floor(thousands / 10)),
      String(thousands + 1),
    ]),
    hint: null,
    explain: [
      `1000が 10こで 10000`,
      `${value} は 1000が ${thousands}こ分`,
    ],
  };
}

/* 小数入門 (0.1のくらいの たしひき) */
function genDecimal(rng: Rng): Problem {
  /* 内部は 0.1 きざみの整数で計算し、最後に dec() で表記をそろえる */
  if (rng() < 0.5) {
    const a = randInt(rng, 2, 12);
    const b = randInt(rng, 2, 12);
    const answer = dec((a + b) / 10, 1);
    return {
      skillId: "g3_decimal",
      text: `${dec(a / 10, 1)} + ${dec(b / 10, 1)} = ?`,
      a,
      b,
      op: "+",
      answer,
      choices: makeChoicesOf(rng, answer, [
        dec((a + b) / 100, 2),
        String(a + b),
        dec((a + b + 1) / 10, 1),
      ]),
      hint: null,
      explain: [
        `0.1が ${a}こと ${b}こ`,
        `あわせて 0.1が ${a + b}こ`,
        `だから ${answer}`,
      ],
    };
  }
  const a = randInt(rng, 6, 20);
  const b = randInt(rng, 1, a - 1);
  const answer = dec((a - b) / 10, 1);
  return {
    skillId: "g3_decimal",
    text: `${dec(a / 10, 1)} - ${dec(b / 10, 1)} = ?`,
    a,
    b,
    op: "-",
    answer,
    choices: makeChoicesOf(rng, answer, [
      dec((a - b) / 100, 2),
      String(a - b),
      dec((a - b + 1) / 10, 1),
    ]),
    hint: null,
    explain: [
      `0.1が ${a}こから ${b}こ ひく`,
      `のこりは 0.1が ${a - b}こ`,
      `だから ${answer}`,
    ],
  };
}

/* 分数入門 (同じ分母の たしひき・大小くらべ) */
function genFraction(rng: Rng): Problem {
  const d = randInt(rng, 3, 9);
  if (rng() < 0.6) {
    /* 分母がそろった たし算 (答えが約分できない組だけを選ぶ) */
    let n1 = randInt(rng, 1, d - 1);
    let n2 = randInt(rng, 1, d - 1);
    for (let i = 0; n1 + n2 >= d || gcd(n1 + n2, d) !== 1; i++) {
      n1 = randInt(rng, 1, d - 1);
      n2 = randInt(rng, 1, d - 1);
      if (i > 20) {
        n1 = 1;
        n2 = 1;
        break;
      }
    }
    const answer = frac(n1 + n2, d);
    return {
      skillId: "g3_fraction",
      text: `${n1}/${d} + ${n2}/${d} = ?`,
      a: n1,
      b: n2,
      op: "+",
      answer,
      choices: makeChoicesOf(rng, answer, [
        `${n1 + n2}/${d + d}`,
        `${n1 + n2 + 1}/${d}`,
        `${d}/${n1 + n2}`,
      ]),
      hint: null,
      explain: [
        `分母が おなじだから 分子だけ たす`,
        `${n1} + ${n2} = ${n1 + n2}`,
        `こたえは ${answer}`,
      ],
    };
  }
  /* どちらが 大きい? (分母がおなじ) */
  const n1 = randInt(rng, 1, d - 1);
  let n2 = randInt(rng, 1, d - 1);
  if (n2 === n1) n2 = n1 === 1 ? n1 + 1 : n1 - 1;
  const answer = `${Math.max(n1, n2)}/${d}`;
  return {
    skillId: "g3_fraction",
    text: `${n1}/${d} と ${n2}/${d}、大きいのは?`,
    a: n1,
    b: n2,
    op: null,
    answer,
    choices: makeChoicesOf(rng, answer, [
      `${Math.min(n1, n2)}/${d}`,
      `${d}/${d}`,
      `${Math.max(n1, n2)}/${d + 1}`,
    ]),
    hint: null,
    explain: [
      `分母が おなじなら 分子が 大きいほうが 大きい`,
      `${Math.max(n1, n2)} > ${Math.min(n1, n2)} だから ${answer}`,
    ],
  };
}

/* 重さ (kg/g の換算) */
function genWeight(rng: Rng): Problem {
  if (rng() < 0.5) {
    const kg = randInt(rng, 2, 9);
    const answer = kg * 1000;
    return {
      skillId: "g3_weight",
      text: `${kg}kg は なんg?`,
      a: kg,
      b: null,
      op: null,
      answer: String(answer),
      choices: makeChoicesOf(rng, String(answer), [
        String(kg * 100),
        String(kg * 10000),
        String(answer + 1000),
      ]),
      hint: null,
      explain: [`1kg = 1000g だから`, `${kg}kg = ${answer}g`],
    };
  }
  const kg = randInt(rng, 1, 9);
  const g = randInt(rng, 1, 9) * 100;
  const answer = kg * 1000 + g;
  return {
    skillId: "g3_weight",
    text: `${kg}kg${g}g は なんg?`,
    a: kg,
    b: g,
    op: null,
    answer: String(answer),
    choices: makeChoicesOf(rng, String(answer), [
      String(kg * 100 + g),
      String(kg * 1000),
      String(answer + 100),
    ]),
    hint: null,
    explain: [`${kg}kg = ${kg * 1000}g`, `${kg * 1000}g + ${g}g = ${answer}g`],
  };
}

/* 円と球 (半径と直径) */
function genCircle(rng: Rng): Problem {
  if (rng() < 0.5) {
    const r = randInt(rng, 2, 12);
    const answer = r * 2;
    return {
      skillId: "g3_circle",
      text: `半けい ${r}cm の 円の 直けいは なんcm?`,
      a: r,
      b: null,
      op: null,
      answer: String(answer),
      choices: makeChoicesOf(rng, String(answer), [
        String(r),
        String(Math.round(r / 2)),
        String(answer + 1),
      ]),
      hint: null,
      explain: [`直けい = 半けい × 2`, `${r} × 2 = ${answer}cm`],
    };
  }
  const answer = randInt(rng, 2, 12);
  const d = answer * 2;
  return {
    skillId: "g3_circle",
    text: `直けい ${d}cm の 円の 半けいは なんcm?`,
    a: d,
    b: null,
    op: null,
    answer: String(answer),
    choices: makeChoicesOf(rng, String(answer), [
      String(d),
      String(d * 2),
      String(answer + 1),
    ]),
    hint: null,
    explain: [`半けい = 直けい ÷ 2`, `${d} ÷ 2 = ${answer}cm`],
  };
}

export const GRADE3_GENERATORS: Record<string, (rng: Rng) => Problem> = {
  g3_div: genDiv,
  g3_div_remainder: genDivRemainder,
  g3_mul_column: genMulColumn,
  g3_big_number: genBigNumber,
  g3_decimal: genDecimal,
  g3_fraction: genFraction,
  g3_weight: genWeight,
  g3_circle: genCircle,
};

export const GRADE3_LABELS: Record<string, string> = {
  g3_div: "わり算",
  g3_div_remainder: "あまりの ある わり算",
  g3_mul_column: "かけ算の ひっ算",
  g3_big_number: "大きい数 (万)",
  g3_decimal: "小数の たしひき",
  g3_fraction: "分数",
  g3_weight: "重さ (kg/g)",
  g3_circle: "円と 球",
};
