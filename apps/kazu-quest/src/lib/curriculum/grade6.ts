/*
 * 小6のスキルと問題ジェネレータ (第6章「ゼロのあなと 下の世界ネガリア」)。
 * 分数の×÷・文字と式・比・速さ・円の面積・比例・拡大縮小・場合の数。
 */

import type { Problem, Rng } from "./types";
import { randInt } from "./types";
import { makeChoicesOf } from "./choices";
import { dec, frac, gcd } from "./numbers";

const PI = 3.14;

/* 分数の かけ算わり算 */
function genFractionMulDiv(rng: Rng): Problem {
  const kind = randInt(rng, 0, 2);
  const d = randInt(rng, 3, 9);
  const n = randInt(rng, 1, d - 1);
  if (kind === 0) {
    const m = randInt(rng, 2, 6);
    const answer = frac(n * m, d);
    return {
      skillId: "g6_fraction_muldiv",
      text: `${n}/${d} × ${m} = ?`,
      a: n,
      b: m,
      op: "×",
      answer,
      choices: makeChoicesOf(rng, answer, [
        `${n}/${d * m}`,
        `${n * m}/${d * m}`,
        `${n * m + 1}/${d}`,
      ]),
      hint: null,
      explain: [
        `整数を かけるときは 分子に かける`,
        `${n} × ${m} = ${n * m}`,
        `こたえは ${answer}`,
      ],
    };
  }
  if (kind === 1) {
    const m = randInt(rng, 2, 6);
    const answer = frac(n, d * m);
    return {
      skillId: "g6_fraction_muldiv",
      text: `${n}/${d} ÷ ${m} = ?`,
      a: n,
      b: m,
      op: "÷",
      answer,
      choices: makeChoicesOf(rng, answer, [
        `${n * m}/${d}`,
        `${n}/${d + m}`,
        `${d * m}/${n}`,
      ]),
      hint: null,
      explain: [
        `整数で わるときは 分母に かける`,
        `${d} × ${m} = ${d * m}`,
        `こたえは ${answer}`,
      ],
    };
  }
  const d2 = randInt(rng, 2, 7);
  const n2 = randInt(rng, 1, d2 - 1);
  const answer = frac(n * n2, d * d2);
  return {
    skillId: "g6_fraction_muldiv",
    text: `${n}/${d} × ${n2}/${d2} = ?`,
    a: n,
    b: n2,
    op: "×",
    answer,
    choices: makeChoicesOf(rng, answer, [
      `${n + n2}/${d + d2}`,
      `${n * d2}/${d * n2}`,
      `${n * n2 + 1}/${d * d2}`,
    ]),
    hint: null,
    explain: [
      `分数どうしは 分子は 分子、分母は 分母で かける`,
      `${n} × ${n2} = ${n * n2}、${d} × ${d2} = ${d * d2}`,
      `やくぶんして ${answer}`,
    ],
  };
}

/* 文字と式 (x をもとめる) */
function genLetterExpr(rng: Rng): Problem {
  const kind = randInt(rng, 0, 2);
  if (kind === 0) {
    const x = randInt(rng, 2, 30);
    const b = randInt(rng, 2, 30);
    return {
      skillId: "g6_letter_expr",
      text: `x + ${b} = ${x + b} のとき x は いくつ?`,
      a: x + b,
      b,
      op: "-",
      answer: String(x),
      choices: makeChoicesOf(rng, String(x), [
        String(x + b),
        String(x + b + b),
        String(b),
      ]),
      hint: null,
      explain: [`x = ${x + b} - ${b}`, `x = ${x}`],
    };
  }
  if (kind === 1) {
    const x = randInt(rng, 2, 12);
    const a = randInt(rng, 2, 9);
    return {
      skillId: "g6_letter_expr",
      text: `${a} × x = ${a * x} のとき x は いくつ?`,
      a: a * x,
      b: a,
      op: "÷",
      answer: String(x),
      choices: makeChoicesOf(rng, String(x), [
        String(a * x),
        String(a * x - a),
        String(a),
      ]),
      hint: null,
      explain: [`x = ${a * x} ÷ ${a}`, `x = ${x}`],
    };
  }
  const x = randInt(rng, 2, 12);
  const a = randInt(rng, 2, 6);
  const b = randInt(rng, 1, 20);
  return {
    skillId: "g6_letter_expr",
    text: `x = ${x} のとき ${a} × x + ${b} は いくつ?`,
    a: x,
    b,
    op: null,
    answer: String(a * x + b),
    choices: makeChoicesOf(rng, String(a * x + b), [
      String(a * (x + b)),
      String(a * x),
      String(x + b),
    ]),
    hint: null,
    explain: [
      `${a} × ${x} = ${a * x}`,
      `${a * x} + ${b} = ${a * x + b}`,
    ],
  };
}

/* 比 */
function genRatio(rng: Rng): Problem {
  const a = randInt(rng, 1, 9);
  let b = randInt(rng, 1, 9);
  /* a:a は 比のあたいが 1 になり 誤答が つくりにくいので ずらす */
  if (b === a) b = a === 9 ? 8 : a + 1;
  const k = randInt(rng, 2, 6);
  if (rng() < 0.5) {
    const answer = frac(a, b);
    return {
      skillId: "g6_ratio",
      text: `${a} : ${b} の 比の あたいは?`,
      a,
      b,
      op: null,
      answer,
      choices: makeChoicesOf(rng, answer, [
        frac(b, a),
        `${a + b}/${b}`,
        String(a * b),
      ]),
      hint: null,
      explain: [`比の あたい = ${a} ÷ ${b}`, `こたえは ${answer}`],
    };
  }
  const answer = b * k;
  return {
    skillId: "g6_ratio",
    text: `${a} : ${b} = ${a * k} : ? を うめよう`,
    a,
    b,
    op: null,
    answer: String(answer),
    choices: makeChoicesOf(rng, String(answer), [
      String(b + (a * k - a)),
      String(b),
      String(answer + k),
    ]),
    hint: null,
    explain: [
      `${a} が ${a * k} に なったので ${k}ばい`,
      `${b} × ${k} = ${answer}`,
    ],
  };
}

/* 速さ */
function genSpeed(rng: Rng): Problem {
  const speed = randInt(rng, 3, 12) * 10;
  const time = randInt(rng, 2, 9);
  const distance = speed * time;
  const kind = randInt(rng, 0, 2);
  if (kind === 0) {
    return {
      skillId: "g6_speed",
      text: `${time}時間で ${distance}km すすむ 車の 時そくは なんkm?`,
      a: distance,
      b: time,
      op: "÷",
      answer: String(speed),
      choices: makeChoicesOf(rng, String(speed), [
        String(distance),
        String(distance - time),
        String(speed + time),
      ]),
      hint: null,
      explain: [`速さ = 道のり ÷ 時間`, `${distance} ÷ ${time} = ${speed}km/時`],
    };
  }
  if (kind === 1) {
    return {
      skillId: "g6_speed",
      text: `時そく ${speed}km で ${time}時間 走ると 道のりは なんkm?`,
      a: speed,
      b: time,
      op: "×",
      answer: String(distance),
      choices: makeChoicesOf(rng, String(distance), [
        String(speed + time),
        String(speed * (time + 1)),
        String(speed),
      ]),
      hint: null,
      explain: [`道のり = 速さ × 時間`, `${speed} × ${time} = ${distance}km`],
    };
  }
  return {
    skillId: "g6_speed",
    text: `${distance}km を 時そく ${speed}km で 走ると なん時間?`,
    a: distance,
    b: speed,
    op: "÷",
    answer: String(time),
    choices: makeChoicesOf(rng, String(time), [
      String(distance),
      String(speed),
      String(time + 1),
    ]),
    hint: null,
    explain: [`時間 = 道のり ÷ 速さ`, `${distance} ÷ ${speed} = ${time}時間`],
  };
}

/* 円の 面積と 円周 (円周率 3.14) */
function genCircleArea(rng: Rng): Problem {
  const r = randInt(rng, 1, 10);
  if (rng() < 0.5) {
    const answer = dec(PI * r * r, 2);
    return {
      skillId: "g6_circle_area",
      text: `半けい ${r}cm の 円の 面せきは なんcm²? (円周りつ 3.14)`,
      a: r,
      b: null,
      op: null,
      answer,
      choices: makeChoicesOf(rng, answer, [
        dec(PI * r * 2, 2),
        dec(PI * r, 2),
        String(r * r),
      ]),
      hint: null,
      explain: [
        `円の 面せき = 半けい × 半けい × 3.14`,
        `${r} × ${r} = ${r * r}`,
        `${r * r} × 3.14 = ${answer}cm²`,
      ],
    };
  }
  const answer = dec(PI * r * 2, 2);
  return {
    skillId: "g6_circle_area",
    text: `半けい ${r}cm の 円の まわりの 長さは なんcm? (円周りつ 3.14)`,
    a: r,
    b: null,
    op: null,
    answer,
    choices: makeChoicesOf(rng, answer, [
      dec(PI * r, 2),
      dec(PI * r * r, 2),
      dec(PI * r * 2 + 1, 2),
    ]),
    hint: null,
    explain: [
      `円周 = 直けい × 3.14`,
      `直けい = ${r} × 2 = ${r * 2}`,
      `${r * 2} × 3.14 = ${answer}cm`,
    ],
  };
}

/* 比例 */
function genProportion(rng: Rng): Problem {
  const unit = randInt(rng, 2, 12);
  const x1 = randInt(rng, 2, 5);
  const k = randInt(rng, 2, 4);
  const x2 = x1 * k;
  const y1 = unit * x1;
  const answer = unit * x2;
  return {
    skillId: "g6_proportion",
    text: `y は x に 比れいする。x=${x1} のとき y=${y1}。x=${x2} のとき y は?`,
    a: x2,
    b: unit,
    op: "×",
    answer: String(answer),
    choices: makeChoicesOf(rng, String(answer), [
      String(y1 + (x2 - x1)),
      String(y1),
      String(answer + unit),
    ]),
    hint: null,
    explain: [
      `y ÷ x = ${unit} (きまった数)`,
      `x が ${k}ばい なら y も ${k}ばい`,
      `${y1} × ${k} = ${answer}`,
    ],
  };
}

/* 拡大図と 縮図 */
function genScale(rng: Rng): Problem {
  const side = randInt(rng, 3, 20);
  const k = randInt(rng, 2, 4);
  if (rng() < 0.5) {
    const answer = side * k;
    return {
      skillId: "g6_scale",
      text: `${side}cm の へんを ${k}ばいに かくだいすると なんcm?`,
      a: side,
      b: k,
      op: "×",
      answer: String(answer),
      choices: makeChoicesOf(rng, String(answer), [
        String(side + k),
        String(side),
        String(answer + side),
      ]),
      hint: null,
      explain: [`かくだい図は へんの 長さが ${k}ばい`, `${side} × ${k} = ${answer}cm`],
    };
  }
  const big = side * k;
  return {
    skillId: "g6_scale",
    text: `${big}cm の へんを 1/${k} に しゅくしょうすると なんcm?`,
    a: big,
    b: k,
    op: "÷",
    answer: String(side),
    choices: makeChoicesOf(rng, String(side), [
      String(big),
      String(big - k),
      String(side * k * k),
    ]),
    hint: null,
    explain: [`しゅくず は へんの 長さが 1/${k}`, `${big} ÷ ${k} = ${side}cm`],
  };
}

/* 場合の数 */
function genCombination(rng: Rng): Problem {
  if (rng() < 0.5) {
    const n = randInt(rng, 3, 5);
    const answer = [1, 1, 2, 6, 24, 120][n];
    return {
      skillId: "g6_combination",
      text: `${n}人が 1れつに ならぶ ならびかたは なんとおり?`,
      a: n,
      b: null,
      op: null,
      answer: String(answer),
      choices: makeChoicesOf(rng, String(answer), [
        String(n * n),
        String(n),
        String(answer / 2),
      ]),
      hint: null,
      explain: [
        `1人目は ${n}とおり、2人目は ${n - 1}とおり…`,
        `${Array.from({ length: n }, (_, i) => n - i).join(" × ")} = ${answer}`,
      ],
    };
  }
  const n = randInt(rng, 4, 6);
  const answer = (n * (n - 1)) / 2;
  return {
    skillId: "g6_combination",
    text: `${n}チームが 1回ずつ たいせんすると 試合は なん試合?`,
    a: n,
    b: null,
    op: null,
    answer: String(answer),
    choices: makeChoicesOf(rng, String(answer), [
      String(n * (n - 1)),
      String(n),
      String(answer + 1),
    ]),
    hint: null,
    explain: [
      `${n} × ${n - 1} = ${n * (n - 1)} (じゅんばんを 区べつした 数)`,
      `対せんは 入れかえても おなじなので ÷2`,
      `こたえは ${answer}試合`,
    ],
  };
}

export const GRADE6_GENERATORS: Record<string, (rng: Rng) => Problem> = {
  g6_fraction_muldiv: genFractionMulDiv,
  g6_letter_expr: genLetterExpr,
  g6_ratio: genRatio,
  g6_speed: genSpeed,
  g6_circle_area: genCircleArea,
  g6_proportion: genProportion,
  g6_scale: genScale,
  g6_combination: genCombination,
};

export const GRADE6_LABELS: Record<string, string> = {
  g6_fraction_muldiv: "分数の かけ算わり算",
  g6_letter_expr: "文字と 式",
  g6_ratio: "比",
  g6_speed: "速さ",
  g6_circle_area: "円の 面せき",
  g6_proportion: "比れい",
  g6_scale: "拡大図と 縮図",
  g6_combination: "場合の数",
};
