/*
 * 小4のスキルと問題ジェネレータ (第4章「氷の国の はかりごと」)。
 * 億兆・÷2桁・がい数・小数・同分母分数・角度・面積・表とグラフ。
 */

import type { Problem, Rng } from "./types";
import { randInt } from "./types";
import { makeChoicesOf } from "./choices";
import { dec, frac, gcd } from "./numbers";

/* 億・兆 (くらいの しくみ) */
function genBigNumber(rng: Rng): Problem {
  const kind = randInt(rng, 0, 2);
  if (kind === 0) {
    const n = randInt(rng, 2, 9);
    const answer = n * 10000;
    return {
      skillId: "g4_big_number",
      text: `${n}億 は 1万の なんこ分?`,
      a: n,
      b: null,
      op: null,
      answer: String(answer),
      choices: makeChoicesOf(rng, String(answer), [
        String(n * 10),
        String(n * 1000),
        String(n * 100000),
      ]),
      hint: null,
      explain: [
        `1億 = 1万 が 10000こ分`,
        `${n}億 = 1万 × ${answer}`,
      ],
    };
  }
  if (kind === 1) {
    const n = randInt(rng, 2, 9);
    return {
      skillId: "g4_big_number",
      text: `${n}億 は 1000万の なんこ分?`,
      a: n,
      b: null,
      op: null,
      answer: String(n * 10),
      choices: makeChoicesOf(rng, String(n * 10), [
        String(n),
        String(n * 100),
        String(n * 10 + 1),
      ]),
      hint: null,
      explain: [`1億 = 1000万 × 10`, `${n}億 = 1000万 × ${n * 10}`],
    };
  }
  const n = randInt(rng, 2, 9);
  return {
    skillId: "g4_big_number",
    text: `${n}兆 は ${n}億の なんばい?`,
    a: n,
    b: null,
    op: null,
    answer: "10000",
    choices: makeChoicesOf(rng, "10000", ["1000", "100000", "100"]),
    hint: null,
    explain: [
      `億 → 兆 は くらいが 4つ上がる`,
      `10 × 10 × 10 × 10 = 10000ばい`,
    ],
  };
}

/* ÷2桁 (わりきれる) */
function genDiv2Digit(rng: Rng): Problem {
  const divisor = randInt(rng, 12, 39);
  const answer = randInt(rng, 3, 24);
  const dividend = divisor * answer;
  return {
    skillId: "g4_div_2digit",
    text: `${dividend} ÷ ${divisor} = ?`,
    a: dividend,
    b: divisor,
    op: "÷",
    answer: String(answer),
    choices: makeChoicesOf(rng, String(answer), [
      String(answer + 1),
      String(answer - 1),
      String(answer * 10),
      String(divisor),
    ]),
    hint: null,
    explain: [
      `${divisor} を 何こ あつめると ${dividend} に なる?`,
      `${divisor} × ${answer} = ${dividend}`,
      `だから こたえは ${answer}`,
    ],
  };
}

/* がい数 (四捨五入) */
function genRound(rng: Rng): Problem {
  const toHundred = rng() < 0.5;
  const unit = toHundred ? 100 : 1000;
  const value = randInt(rng, unit * 3, unit * 90);
  const answer = Math.round(value / unit) * unit;
  const cut = Math.floor(value / unit) * unit;
  return {
    skillId: "g4_round",
    text: `${value} を 四捨五入して ${toHundred ? "百" : "千"}のくらいまでの がい数に すると?`,
    a: value,
    b: unit,
    op: null,
    answer: String(answer),
    choices: makeChoicesOf(rng, String(answer), [
      String(cut === answer ? cut + unit : cut),
      String(answer + unit),
      String(answer - unit),
    ]),
    hint: null,
    explain: [
      `${toHundred ? "十" : "百"}のくらいの ${Math.floor((value % unit) / (unit / 10))} を 見る`,
      `${Math.floor((value % unit) / (unit / 10)) >= 5 ? "5いじょう だから くり上げる" : "4いか だから きりすてる"}`,
      `こたえは ${answer}`,
    ],
  };
}

/* 小数の たしひき (0.01のくらい) */
function genDecimal(rng: Rng): Problem {
  const add = rng() < 0.5;
  if (add) {
    const a = randInt(rng, 15, 240);
    const b = randInt(rng, 15, 240);
    const answer = dec((a + b) / 100, 2);
    return {
      skillId: "g4_decimal",
      text: `${dec(a / 100, 2)} + ${dec(b / 100, 2)} = ?`,
      a,
      b,
      op: "+",
      answer,
      choices: makeChoicesOf(rng, answer, [
        dec((a + b) / 10, 2),
        dec((a + b + 10) / 100, 2),
        dec((a + b - 10) / 100, 2),
      ]),
      hint: null,
      explain: [
        `0.01が ${a}こと ${b}こ`,
        `あわせて 0.01が ${a + b}こ`,
        `くらいを そろえて ${answer}`,
      ],
    };
  }
  const a = randInt(rng, 60, 320);
  const b = randInt(rng, 15, a - 5);
  const answer = dec((a - b) / 100, 2);
  return {
    skillId: "g4_decimal",
    text: `${dec(a / 100, 2)} - ${dec(b / 100, 2)} = ?`,
    a,
    b,
    op: "-",
    answer,
    choices: makeChoicesOf(rng, answer, [
      dec((a - b) / 10, 2),
      dec((a - b + 10) / 100, 2),
      dec((a - b + 1) / 100, 2),
    ]),
    hint: null,
    explain: [
      `くらいを そろえて ひっさんする`,
      `0.01が ${a}こ - ${b}こ = ${a - b}こ`,
      `こたえは ${answer}`,
    ],
  };
}

/* 同分母の分数 (たしひき・仮分数まで) */
function genFractionSame(rng: Rng): Problem {
  const d = randInt(rng, 4, 9);
  if (rng() < 0.5) {
    /* 1をこえる たし算 (仮分数のまま答える) */
    let n1 = randInt(rng, 2, d - 1);
    let n2 = randInt(rng, 2, d - 1);
    for (let i = 0; gcd(n1 + n2, d) !== 1; i++) {
      n1 = randInt(rng, 2, d - 1);
      n2 = randInt(rng, 2, d - 1);
      if (i > 20) break;
    }
    const answer = frac(n1 + n2, d);
    return {
      skillId: "g4_fraction_same",
      text: `${n1}/${d} + ${n2}/${d} = ?`,
      a: n1,
      b: n2,
      op: "+",
      answer,
      choices: makeChoicesOf(rng, answer, [
        `${n1 + n2}/${d + d}`,
        `${n1 * n2}/${d}`,
        `${n1 + n2 + 1}/${d}`,
      ]),
      hint: null,
      explain: [
        `分母は そのまま、分子だけ たす`,
        `${n1} + ${n2} = ${n1 + n2}`,
        `こたえは ${answer}`,
      ],
    };
  }
  const n1 = randInt(rng, 3, d);
  const n2 = randInt(rng, 1, n1 - 1);
  const answer = frac(n1 - n2, d);
  return {
    skillId: "g4_fraction_same",
    text: `${n1}/${d} - ${n2}/${d} = ?`,
    a: n1,
    b: n2,
    op: "-",
    answer,
    choices: makeChoicesOf(rng, answer, [
      `${n1 - n2}/${d - 1}`,
      `${n1 - n2 + 1}/${d}`,
      `${n1 + n2}/${d}`,
    ]),
    hint: null,
    explain: [
      `分母は そのまま、分子だけ ひく`,
      `${n1} - ${n2} = ${n1 - n2}`,
      `こたえは ${answer}`,
    ],
  };
}

/* 角度 (直線・三角形・一しゅう) */
function genAngle(rng: Rng): Problem {
  const kind = randInt(rng, 0, 2);
  if (kind === 0) {
    const a = randInt(rng, 2, 17) * 10;
    const answer = 180 - a;
    return {
      skillId: "g4_angle",
      text: `一ちょくせんの 角は 180°。${a}° の となりの 角は なん度?`,
      a,
      b: 180,
      op: null,
      answer: String(answer),
      choices: makeChoicesOf(rng, String(answer), [
        String(360 - a),
        String(90 - a > 0 ? 90 - a : a),
        String(answer + 10),
      ]),
      hint: null,
      explain: [`一ちょくせん = 180°`, `180 - ${a} = ${answer}°`],
    };
  }
  if (kind === 1) {
    const a = randInt(rng, 3, 12) * 10;
    const b = randInt(rng, 3, 14) * 10;
    const answer = 180 - a - b;
    if (answer <= 0) {
      /* 角の和が こえたら 直角三角形の のこりの角に きりかえる */
      const c = randInt(rng, 2, 8) * 10;
      return {
        skillId: "g4_angle",
        text: `直角三角形の のこりの 角。90° と ${c}° の ほかの 角は なん度?`,
        a: c,
        b: 90,
        op: null,
        answer: String(90 - c),
        choices: makeChoicesOf(rng, String(90 - c), [
          String(180 - c),
          String(c),
          String(90 + c),
        ]),
        hint: null,
        explain: [`三角形の 角の和は 180°`, `180 - 90 - ${c} = ${90 - c}°`],
      };
    }
    return {
      skillId: "g4_angle",
      text: `三角形の 角の和は 180°。${a}° と ${b}° の ほかの 角は なん度?`,
      a,
      b,
      op: null,
      answer: String(answer),
      choices: makeChoicesOf(rng, String(answer), [
        String(360 - a - b),
        String(a + b),
        String(answer + 10),
      ]),
      hint: null,
      explain: [`三角形の 角の和は 180°`, `180 - ${a} - ${b} = ${answer}°`],
    };
  }
  const a = randInt(rng, 5, 33) * 10;
  const answer = 360 - a;
  return {
    skillId: "g4_angle",
    text: `一まわりは 360°。${a}° の のこりは なん度?`,
    a,
    b: 360,
    op: null,
    answer: String(answer),
    choices: makeChoicesOf(rng, String(answer), [
      String(180 - a > 0 ? 180 - a : a),
      String(answer + 10),
      String(answer - 10),
    ]),
    hint: null,
    explain: [`一まわり = 360°`, `360 - ${a} = ${answer}°`],
  };
}

/* 面積 (長方形・正方形) */
function genArea(rng: Rng): Problem {
  if (rng() < 0.6) {
    const w = randInt(rng, 3, 15);
    const h = randInt(rng, 3, 15);
    const answer = w * h;
    return {
      skillId: "g4_area",
      text: `たて ${h}cm よこ ${w}cm の 長方形の 面せきは なんcm²?`,
      a: w,
      b: h,
      op: "×",
      answer: String(answer),
      choices: makeChoicesOf(rng, String(answer), [
        String((w + h) * 2),
        String(w + h),
        String(answer + w),
      ]),
      hint: null,
      explain: [`長方形の 面せき = たて × よこ`, `${h} × ${w} = ${answer}cm²`],
    };
  }
  const s = randInt(rng, 3, 15);
  const answer = s * s;
  return {
    skillId: "g4_area",
    text: `1ぺんが ${s}cm の 正方形の 面せきは なんcm²?`,
    a: s,
    b: s,
    op: "×",
    answer: String(answer),
    choices: makeChoicesOf(rng, String(answer), [
      String(s * 4),
      String(s * 2),
      String(answer + s),
    ]),
    hint: null,
    explain: [`正方形の 面せき = 1ぺん × 1ぺん`, `${s} × ${s} = ${answer}cm²`],
  };
}

/* 表とグラフ (小さな表を読みとる) */
const GRAPH_LABELS = ["月", "火", "水"] as const;

function genGraph(rng: Rng): Problem {
  const values = [randInt(rng, 3, 20), randInt(rng, 3, 20), randInt(rng, 3, 20)];
  const table = GRAPH_LABELS.map((d, i) => `${d}よう日 ${values[i]}こ`).join(" / ");
  if (rng() < 0.5) {
    const answer = values[0] + values[1] + values[2];
    return {
      skillId: "g4_graph",
      text: `ひろった どんぐりの ひょう\n${table}\nぜんぶで なんこ?`,
      a: null,
      b: null,
      op: null,
      answer: String(answer),
      choices: makeChoicesOf(rng, String(answer), [
        String(Math.max(...values)),
        String(answer - Math.min(...values)),
        String(answer + 1),
      ]),
      hint: null,
      explain: [
        `${values[0]} + ${values[1]} + ${values[2]} = ${answer}`,
        `ひょうの 数を ぜんぶ たす`,
      ],
    };
  }
  const max = Math.max(...values);
  const min = Math.min(...values);
  const answer = max - min;
  return {
    skillId: "g4_graph",
    text: `ひろった どんぐりの ひょう\n${table}\nいちばん多い日と 少ない日の さは なんこ?`,
    a: max,
    b: min,
    op: "-",
    answer: String(answer),
    choices: makeChoicesOf(rng, String(answer), [
      String(max),
      String(min),
      String(max + min),
    ]),
    hint: null,
    explain: [
      `いちばん多いのは ${max}こ、少ないのは ${min}こ`,
      `${max} - ${min} = ${answer}こ`,
    ],
  };
}

export const GRADE4_GENERATORS: Record<string, (rng: Rng) => Problem> = {
  g4_big_number: genBigNumber,
  g4_div_2digit: genDiv2Digit,
  g4_round: genRound,
  g4_decimal: genDecimal,
  g4_fraction_same: genFractionSame,
  g4_angle: genAngle,
  g4_area: genArea,
  g4_graph: genGraph,
};

export const GRADE4_LABELS: Record<string, string> = {
  g4_big_number: "億と 兆",
  g4_div_2digit: "2けたで わる わり算",
  g4_round: "がい数 (四捨五入)",
  g4_decimal: "小数の 計算",
  g4_fraction_same: "同分母の 分数",
  g4_angle: "角度",
  g4_area: "面せき",
  g4_graph: "ひょうと グラフ",
};
