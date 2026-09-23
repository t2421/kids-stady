/*
 * 小3のスキルと問題ジェネレータ (第3章「砂漠の盗賊王と わけまえのピラミッド」)。
 * ここから答えは整数とはかぎらない — 小数は dec()、分数は frac() で
 * 表記を1本化し、3択は makeChoicesOf に「ありがちな間違い」を渡して作る。
 *
 * 出題の段階 (LP-02, docs/kazu-quest-levels.md): 各ジェネレータは
 * `(rng, level?)` を取り、level 省略時は 2 (= 従来どおりの出題) を使う。
 * level 2 の分岐は既存コードと完全に同じ値域・同じ乱数消費順にしてある
 * (シード固定のテストが壊れないため)。
 *
 * 段階ヒント (LP-03): g3_div・g3_fraction は手書きの3段ヒント、他は
 * genericHints() (explain から機械的に作る既定値)。
 */

import type { Problem, Rng } from "./types";
import { randInt } from "./types";
import { makeChoicesOf } from "./choices";
import { coprimeDiffSubtrahend, dec, frac, gcd } from "./numbers";
import { genericHints } from "./hints";
import { columnMulSteps } from "./columnSteps";

type Level = 1 | 2 | 3;

/* g3_div の手書き3段ヒント */
function divHints(divisor: number, dividend: number, answer: number): [string, string, string] {
  if (answer === 0) {
    return [
      `0 こを ${divisor}人で わけると どうなるかな`,
      `${divisor} × なにかで 0 に なるかな`,
      `0 は いくつに わけても…`,
    ];
  }
  if (answer >= 10) {
    const tens = Math.floor(answer / 10) * 10;
    const ones = answer % 10;
    return ones === 0
      ? [
          `${dividend} を 「10 が なんこ」と かんがえよう`,
          `10 が ${dividend / 10}こ を ${divisor}つに わけると…`,
          `10 の たばで かんがえると ${dividend / 10} ÷ ${divisor} = ${tens / 10}…`,
        ]
      : [
          `${dividend} を 九九で わりやすい 2つの 数に わけよう`,
          `${dividend} = ${divisor * tens} + ${divisor * ones}`,
          `${divisor * tens} ÷ ${divisor} と ${divisor * ones} ÷ ${divisor} を あわせると…`,
        ];
  }
  return [
    `${divisor}の だんの 九九を つかうよ`,
    `${divisor} × なにかで ${dividend} に なるかな`,
    `${divisor} × ${answer} = ${dividend} だから…`,
  ];
}

/* g3_fraction (同分母のたし算) の手書き3段ヒント */
function fractionAddHints(d: number, n1: number, n2: number): [string, string, string] {
  return [
    `分母が おなじ ぶんすうは 分子だけ たせば いいよ`,
    `${n1} + ${n2} を けいさんしてみよう`,
    `${n1} + ${n2} = ${n1 + n2}。分母は ${d} の ままだから…`,
  ];
}

/* g3_fraction (同分母のひき算) の手書き3段ヒント */
function fractionSubHints(d: number, n1: number, n2: number): [string, string, string] {
  return [
    `分母が おなじ ぶんすうは 分子だけ ひけば いいよ`,
    `${n1} - ${n2} を けいさんしてみよう`,
    `${n1} - ${n2} = ${n1 - n2}。分母は ${d} の ままだから…`,
  ];
}

/* g3_fraction (同分母の大小くらべ) の手書き3段ヒント */
function fractionCompareHints(n1: number, n2: number): [string, string, string] {
  return [
    `分母が おなじなら 分子で くらべられるよ`,
    `${n1} と ${n2}、分子が 大きいのは どっちかな`,
    `${Math.max(n1, n2)} は ${Math.min(n1, n2)} より 大きいから…`,
  ];
}

/* g3_fraction (単位分数の読み、Lv1) の手書き3段ヒント */
function fractionReadingHints(d: number, k: number): [string, string, string] {
  return [
    `1を おなじ 大きさに 分けた ときの いくつ分かを かんがえよう`,
    `1を ${d}つに 分けたよ。分母は ${d}`,
    `その うちの ${k}つ分だから 分子は…`,
  ];
}

/* わり算 (九九の逆算・わりきれる)。
 * Lv1 = だんを絞った やさしい九九の逆算、Lv2 = 現行 (2〜9)、
 * Lv3 = 0 わり を含み こたえの範囲を九九より広げる (わりきれる形はそのまま) */
function genDiv(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const divisor = randInt(rng, lv === 1 ? 2 : 2, 9);
  const answer =
    lv === 1 ? randInt(rng, 2, 5) : lv === 3 ? randInt(rng, 0, 15) : randInt(rng, 2, 9);
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
    explain: divExplain(divisor, dividend, answer),
    hints: divHints(divisor, dividend, answer),
  };
}

/*
 * Lv3 は 0 や 2けたの こたえ (60 ÷ 4 = 15) も出す (docs/kazu-quest-levels.md)。
 * そこに「4の だんの 九九を つかうよ」と出すと、九九に 4×15 は無いので
 * ヒントと問題が 食いちがう。こたえの形ごとに 説明を分ける。
 */
function divExplain(divisor: number, dividend: number, answer: number): string[] {
  if (answer === 0) {
    return [`0 は いくつに わけても 0`, `だから ${dividend} ÷ ${divisor} = 0`];
  }
  if (answer >= 10) {
    const tens = Math.floor(answer / 10) * 10;
    const ones = answer % 10;
    if (ones === 0) {
      return [
        `${dividend} は 10 が ${dividend / 10}こ`,
        `${dividend / 10} ÷ ${divisor} = ${tens / 10} だから 10 が ${tens / 10}こ`,
        `だから ${dividend} ÷ ${divisor} = ${answer}`,
      ];
    }
    return [
      `${dividend} を ${divisor * tens} と ${divisor * ones} に わける`,
      `${divisor * tens} ÷ ${divisor} = ${tens}、${divisor * ones} ÷ ${divisor} = ${ones}`,
      `あわせて ${dividend} ÷ ${divisor} = ${answer}`,
    ];
  }
  return [
    `${divisor}のだんの 九九で ${dividend}に なるのは?`,
    `${divisor} × ${answer} = ${dividend}`,
    `だから ${dividend} ÷ ${divisor} = ${answer}`,
  ];
}

/* あまりのある わり算 (あまりを答える)。
 * Lv1 = 小さいわる数・商、Lv2 = 現行、Lv3 = 商を大きく (わられる数が大きい形) */
function genDivRemainder(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const divisor = lv === 1 ? randInt(rng, 3, 5) : randInt(rng, 3, 9);
  const quotient = lv === 1 ? randInt(rng, 2, 5) : lv === 3 ? randInt(rng, 2, 20) : randInt(rng, 2, 9);
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
    hints: genericHints([
      `${divisor} × ${quotient} = ${divisor * quotient} まで いける`,
      `${dividend} - ${divisor * quotient} = ${remainder}`,
      `${dividend} ÷ ${divisor} = ${quotient} あまり ${remainder}`,
    ]),
  };
}

/* かけ算の ひっ算 (2桁 × 1桁)。Lv1 は小さい2桁、Lv3 は3桁×1桁に広げる */
function genMulColumn(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  /* 一のくらいが 0 だと くり上がりが おきず ひっ算の練習にならない */
  let a: number;
  if (lv === 1) {
    a = randInt(rng, 1, 4) * 10 + randInt(rng, 1, 4);
  } else if (lv === 3) {
    a = randInt(rng, 1, 9) * 100 + randInt(rng, 1, 9) * 10 + randInt(rng, 1, 9);
  } else {
    a = randInt(rng, 1, 9) * 10 + randInt(rng, 1, 9);
  }
  const b = lv === 1 ? randInt(rng, 2, 4) : randInt(rng, 2, 9);
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
    /* くらいごとの かけ算 (3けたの Lv3 でも 百のくらいまで 正しく書く) */
    explain: columnMulSteps(a, b),
    hints: genericHints(columnMulSteps(a, b)),
  };
}

/* 大きい数 (万)。Lv1 は小さいこ数、Lv3 は十万の位まで広げる */
function genBigNumber(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  if (rng() < 0.5) {
    const n = lv === 1 ? randInt(rng, 2, 5) : lv === 3 ? randInt(rng, 10, 99) : randInt(rng, 2, 9);
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
      hints: genericHints([`10000の ${n}こ分だから`, `10000 × ${n} = ${answer}`]),
    };
  }
  const thousands =
    lv === 1 ? randInt(rng, 11, 30) : lv === 3 ? randInt(rng, 100, 999) : randInt(rng, 11, 99);
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
    hints: genericHints([
      `1000が 10こで 10000`,
      `${value} は 1000が ${thousands}こ分`,
    ]),
  };
}

/* 小数入門 (0.1のくらいの たしひき)。Lv1 は小さい数、Lv3 は2桁の
 * 0.1きざみ (たとえば 12.3) まで広げる */
function genDecimal(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  if (rng() < 0.5) {
    const [lo, hi] = lv === 1 ? [1, 5] : lv === 3 ? [20, 120] : [2, 12];
    const a = randInt(rng, lo, hi);
    let b = randInt(rng, lo, hi);
    /* 両方 10の倍数だと "6 + 6" のように 小数が1つも出ないので引きなおす */
    while (a % 10 === 0 && b % 10 === 0) b = randInt(rng, lo, hi);
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
      hints: genericHints([
        `0.1が ${a}こと ${b}こ`,
        `あわせて 0.1が ${a + b}こ`,
        `だから ${answer}`,
      ]),
    };
  }
  const [lo, hi] = lv === 1 ? [3, 8] : lv === 3 ? [20, 120] : [6, 20];
  const a = randInt(rng, lo, hi);
  let b = randInt(rng, 1, a - 1);
  while (a % 10 === 0 && b % 10 === 0) b = randInt(rng, 1, a - 1);
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
    hints: genericHints([
      `0.1が ${a}こから ${b}こ ひく`,
      `のこりは 0.1が ${a - b}こ`,
      `だから ${answer}`,
    ]),
  };
}

/* 分数 (Lv1 = 単位分数の読み、Lv2 = 現行 (同分母のたし算/大小くらべ)、
 * Lv3 = 同分母の たしひき) */
function genFraction(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  if (lv === 1) return genFractionReading(rng);
  if (lv === 3) return genFractionAddSub(rng);

  const d = randInt(rng, 3, 9);
  if (rng() < 0.6) {
    /* 分母がそろった たし算 (答えが約分できない組だけを選ぶ) */
    let n1 = randInt(rng, 1, d - 1);
    let n2 = randInt(rng, 1, d - 1);
    for (let i = 0; n1 + n2 >= d || gcd(n1 + n2, d) !== 1; i++) {
      n1 = randInt(rng, 1, d - 1);
      n2 = randInt(rng, 1, d - 1);
      if (i > 20) {
        /* 1 + (d-2) = d-1 は 分母と たがいに素 (1/6 + 1/6 → 1/3 のような約分を出さない) */
        n1 = 1;
        n2 = d - 2;
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
      hints: fractionAddHints(d, n1, n2),
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
    hints: fractionCompareHints(n1, n2),
  };
}

/* Lv1: 単位分数 (1/2, 1/3) の読み */
/*
 * Lv1: 分数の よみとり。以前は「1を 2つ/3つに 分けた 1つ分」の 2問しか なく、
 * 毎回 おなじ問題だった。いまは 2〜6つに 分けた うちの 1〜(分母-1)つ分
 * (分数バーの図で 見ながら こたえる — lib/curriculum/figures.ts)
 */
function genFractionReading(rng: Rng): Problem {
  const d = randInt(rng, 2, 6);
  const k = randInt(rng, 1, d - 1);
  const answer = `${k}/${d}`;
  return {
    skillId: "g3_fraction",
    text: `1を ${d}つに 分けた うちの ${k}つ分は どれ?`,
    a: k,
    b: d,
    op: null,
    answer,
    choices: makeChoicesOf(rng, answer, [
      `${d}/${k}`,
      k + 1 < d ? `${k + 1}/${d}` : `${k - 1 || 1}/${d + 1}`,
      `${k}/${d + 1}`,
    ]),
    hint: null,
    explain: [
      `1を ${d}つに 同じ大きさに 分けたよ`,
      `そのうちの ${k}つ分だから ${answer}`,
    ],
    hints: fractionReadingHints(d, k),
  };
}

/* Lv3: 同分母の たしひき (たし算は くり上がって 1 になる形もあり) */
function genFractionAddSub(rng: Rng): Problem {
  const d = randInt(rng, 4, 9);
  if (rng() < 0.5) {
    let n1 = randInt(rng, 1, d - 1);
    let n2 = randInt(rng, 1, d - 1);
    for (let i = 0; n1 + n2 > d || gcd(n1 + n2, d) !== 1; i++) {
      n1 = randInt(rng, 1, d - 1);
      n2 = randInt(rng, 1, d - 1);
      if (i > 20) {
        /* 1 + (d-2) = d-1 は 分母と たがいに素 (1/6 + 1/6 → 1/3 のような約分を出さない) */
        n1 = 1;
        n2 = d - 2;
        break;
      }
    }
    const sum = n1 + n2;
    const answer = sum === d ? "1" : frac(sum, d);
    return {
      skillId: "g3_fraction",
      text: `${n1}/${d} + ${n2}/${d} = ?`,
      a: n1,
      b: n2,
      op: "+",
      answer,
      choices: makeChoicesOf(rng, answer, [
        `${sum}/${d + d}`,
        `${sum + 1}/${d}`,
        `${d}/${sum}`,
      ]),
      hint: null,
      explain: [
        `分母が おなじだから 分子だけ たす`,
        `${n1} + ${n2} = ${sum}`,
        `こたえは ${answer}`,
      ],
      hints: fractionAddHints(d, n1, n2),
    };
  }
  const n1 = randInt(rng, 2, d - 1);
  const n2 = coprimeDiffSubtrahend(rng, n1, d);
  const diff = n1 - n2;
  const answer = frac(diff, d);
  return {
    skillId: "g3_fraction",
    text: `${n1}/${d} - ${n2}/${d} = ?`,
    a: n1,
    b: n2,
    op: "-",
    answer,
    choices: makeChoicesOf(rng, answer, [
      `${diff}/${d + d}`,
      `${diff + 1}/${d}`,
      `${d}/${diff}`,
    ]),
    hint: null,
    explain: [
      `分母が おなじだから 分子だけ ひく`,
      `${n1} - ${n2} = ${diff}`,
      `こたえは ${answer}`,
    ],
    hints: fractionSubHints(d, n1, n2),
  };
}

/* 重さ (kg/g の換算)。Lv1 は小さい数、Lv3 は2桁kgまで広げる */
function genWeight(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  if (rng() < 0.5) {
    const kg = lv === 1 ? randInt(rng, 2, 4) : lv === 3 ? randInt(rng, 10, 90) : randInt(rng, 2, 9);
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
      hints: genericHints([`1kg = 1000g だから`, `${kg}kg = ${answer}g`]),
    };
  }
  const kg = lv === 1 ? randInt(rng, 1, 3) : lv === 3 ? randInt(rng, 10, 50) : randInt(rng, 1, 9);
  const g = (lv === 1 ? randInt(rng, 1, 4) : randInt(rng, 1, 9)) * 100;
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
    hints: genericHints([`${kg}kg = ${kg * 1000}g`, `${kg * 1000}g + ${g}g = ${answer}g`]),
  };
}

/* 円と球 (半径と直径)。Lv1 は小さい半径、Lv3 は半径30cmまで広げる */
function genCircle(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const [lo, hi] = lv === 1 ? [2, 6] : lv === 3 ? [2, 30] : [2, 12];
  if (rng() < 0.5) {
    const r = randInt(rng, lo, hi);
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
      hints: genericHints([`直けい = 半けい × 2`, `${r} × 2 = ${answer}cm`]),
    };
  }
  const answer = randInt(rng, lo, hi);
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
    hints: genericHints([`半けい = 直けい ÷ 2`, `${d} ÷ 2 = ${answer}cm`]),
  };
}

export const GRADE3_GENERATORS: Record<string, (rng: Rng, level?: Level) => Problem> = {
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
