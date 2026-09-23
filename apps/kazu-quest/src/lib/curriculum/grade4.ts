/*
 * 小4のスキルと問題ジェネレータ (第4章「氷の国の はかりごと」)。
 * 億兆・÷2桁・がい数・小数・同分母分数・角度・面積・表とグラフ。
 *
 * 出題の段階 (LP-02b, docs/kazu-quest-levels.md): 各ジェネレータは
 * `(rng, level?)` を取り、level 省略時は 2 (= 従来どおりの出題) を使う。
 * level 2 の分岐は既存コードと完全に同じ値域・同じ乱数消費順にしてある
 * (シード固定のテストが壊れないため)。
 */

import type { Problem, Rng } from "./types";
import { randInt } from "./types";
import { makeChoicesOf } from "./choices";
import { coprimeDiffSubtrahend, dec, frac, gcd } from "./numbers";
import { genericHints } from "./hints";

type Level = 1 | 2 | 3;

/* 億・兆 (くらいの しくみ) */
function genBigNumber(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const [nLo, nHi] = lv === 1 ? [2, 5] : lv === 3 ? [10, 99] : [2, 9];
  const kind = randInt(rng, 0, 2);
  if (kind === 0) {
    const n = randInt(rng, nLo, nHi);
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
      hints: genericHints([
        `1億 = 1万 が 10000こ分`,
        `${n}億 = 1万 × ${answer}`,
      ]),
    };
  }
  if (kind === 1) {
    const n = randInt(rng, nLo, nHi);
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
      hints: genericHints([`1億 = 1000万 × 10`, `${n}億 = 1000万 × ${n * 10}`]),
    };
  }
  /*
   * 以前は「n兆 は n億の なんばい?」で こたえが いつも 10000 (出題の3割) —
   * 読まなくても あたった。n兆 を 1億の いくつ分かで きき、こたえを n で変える
   */
  const n = randInt(rng, nLo, nHi);
  const answer = n * 10000;
  return {
    skillId: "g4_big_number",
    text: `${n}兆 は 1億の なんこ分?`,
    a: n,
    b: null,
    op: null,
    answer: String(answer),
    choices: makeChoicesOf(rng, String(answer), [
      String(n * 1000),
      String(n * 100000),
      String(n * 10),
    ]),
    hint: null,
    explain: [
      `億 → 兆 は くらいが 4つ上がる (1兆 = 1億 が 10000こ分)`,
      `${n}兆 = 1億 × ${answer}`,
    ],
    hints: genericHints([
      `億 → 兆 は くらいが 4つ上がる (1兆 = 1億 が 10000こ分)`,
      `${n}兆 = 1億 × ${answer}`,
    ]),
  };
}

/* ÷2桁 (わりきれる) */
function genDiv2Digit(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const [divLo, divHi, ansLo, ansHi] =
    lv === 1 ? [11, 20, 2, 9] : lv === 3 ? [40, 99, 10, 50] : [12, 39, 3, 24];
  const divisor = randInt(rng, divLo, divHi);
  const answer = randInt(rng, ansLo, ansHi);
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
    hints: genericHints([
      `${divisor} を 何こ あつめると ${dividend} に なる?`,
      `${divisor} × ${answer} = ${dividend}`,
      `だから こたえは ${answer}`,
    ]),
  };
}

/* がい数 (四捨五入) */
function genRound(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const toHundred = rng() < 0.5;
  const unit = toHundred ? 100 : 1000;
  const [mulLo, mulHi] = lv === 1 ? [2, 20] : lv === 3 ? [50, 300] : [3, 90];
  const value = randInt(rng, unit * mulLo, unit * mulHi);
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
    hints: genericHints([
      `${toHundred ? "十" : "百"}のくらいの ${Math.floor((value % unit) / (unit / 10))} を 見る`,
      `${Math.floor((value % unit) / (unit / 10)) >= 5 ? "5いじょう だから くり上げる" : "4いか だから きりすてる"}`,
      `こたえは ${answer}`,
    ]),
  };
}

/* 小数の たしひき (0.01のくらい) */
function genDecimal(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const add = rng() < 0.5;
  if (add) {
    const [lo, hi] = lv === 1 ? [5, 50] : lv === 3 ? [300, 900] : [15, 240];
    const a = randInt(rng, lo, hi);
    const b = randInt(rng, lo, hi);
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
      hints: genericHints([
        `0.01が ${a}こと ${b}こ`,
        `あわせて 0.01が ${a + b}こ`,
        `くらいを そろえて ${answer}`,
      ]),
    };
  }
  const [aLo, aHi, bLo] =
    lv === 1 ? [20, 60, 5] : lv === 3 ? [400, 950, 300] : [60, 320, 15];
  const a = randInt(rng, aLo, aHi);
  const b = randInt(rng, bLo, a - 5);
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
    hints: genericHints([
      `くらいを そろえて ひっさんする`,
      `0.01が ${a}こ - ${b}こ = ${a - b}こ`,
      `こたえは ${answer}`,
    ]),
  };
}

/* 同分母の分数 (たしひき・仮分数まで) */
function genFractionSame(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const [dLo, dHi] = lv === 1 ? [3, 5] : lv === 3 ? [6, 12] : [4, 9];
  const d = randInt(rng, dLo, dHi);
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
      hints: genericHints([
        `分母は そのまま、分子だけ たす`,
        `${n1} + ${n2} = ${n1 + n2}`,
        `こたえは ${answer}`,
      ]),
    };
  }
  const n1 = randInt(rng, 3, d);
  /* 約分は 小5。こたえが 約分できない組だけにする (grade3 と同じ規則) */
  const n2 = coprimeDiffSubtrahend(rng, n1, d);
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
    hints: genericHints([
      `分母は そのまま、分子だけ ひく`,
      `${n1} - ${n2} = ${n1 - n2}`,
      `こたえは ${answer}`,
    ]),
  };
}

/* 角度 (直線・直角・一しゅう)。Lv1 は「一しゅう」を除いた やさしい2種、
 * Lv3 は 同じ3種だが 10°きざみでなく 5°きざみで こまかく出す */
function genAngle(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const step = lv === 3 ? 5 : 10;
  const kind = lv === 1 ? randInt(rng, 0, 1) : randInt(rng, 0, 2);
  if (kind === 0) {
    const [lo, hi] = lv === 1 ? [2, 8] : lv === 3 ? [4, 34] : [2, 17];
    const a = randInt(rng, lo, hi) * step;
    const answer = 180 - a;
    return {
      skillId: "g4_angle",
      text: `一ちょくせんの 角は 180°。${a}° の となりの 角は なん度?`,
      a,
      b: 180,
      op: null,
      /* あたえられた角を 分度器で見せる (よみは出さない)。一まわり 360° の形は
         180° をこえて 半円の分度器に のらないので 図なし */
      figure: { kind: "protractor", angle: a },
      answer: String(answer),
      choices: makeChoicesOf(rng, String(answer), [
        String(360 - a),
        String(90 - a > 0 ? 90 - a : a),
        String(answer + 10),
      ]),
      hint: null,
      explain: [`一ちょくせん = 180°`, `180 - ${a} = ${answer}°`],
      hints: genericHints([`一ちょくせん = 180°`, `180 - ${a} = ${answer}°`]),
    };
  }
  if (kind === 1) {
    /*
     * 直角 (90°) の のこり。以前は ここで「三角形の 角の和は 180°」を出していたが、
     * 三角形の内角の和は 小5 で習う (小4 の単元には入れない)
     */
    const [lo, hi] = lv === 1 ? [1, 8] : lv === 3 ? [2, 17] : [1, 8];
    const a = randInt(rng, lo, hi) * step;
    const answer = 90 - a;
    return {
      skillId: "g4_angle",
      text: `直角は 90°。${a}° の のこりは なん度?`,
      a,
      b: 90,
      op: null,
      figure: { kind: "protractor", angle: a },
      answer: String(answer),
      choices: makeChoicesOf(rng, String(answer), [
        String(180 - a),
        String(a),
        String(answer + 10),
      ]),
      hint: null,
      explain: [`直角 = 90°`, `90 - ${a} = ${answer}°`],
      hints: genericHints([`直角 = 90°`, `90 - ${a} = ${answer}°`]),
    };
  }
  const [lo, hi] = lv === 3 ? [10, 70] : [5, 33];
  const a = randInt(rng, lo, hi) * step;
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
    hints: genericHints([`一まわり = 360°`, `360 - ${a} = ${answer}°`]),
  };
}

/* 面積 (長方形・正方形) */
function genArea(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const [lo, hi] = lv === 1 ? [2, 8] : lv === 3 ? [10, 40] : [3, 15];
  if (rng() < 0.6) {
    const w = randInt(rng, lo, hi);
    const h = randInt(rng, lo, hi);
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
      hints: genericHints([`長方形の 面せき = たて × よこ`, `${h} × ${w} = ${answer}cm²`]),
    };
  }
  const s = randInt(rng, lo, hi);
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
    hints: genericHints([`正方形の 面せき = 1ぺん × 1ぺん`, `${s} × ${s} = ${answer}cm²`]),
  };
}

/* 表とグラフ (小さな表を読みとる) */
const GRAPH_LABELS = ["月", "火", "水"] as const;

function genGraph(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const [lo, hi] = lv === 1 ? [2, 10] : lv === 3 ? [15, 60] : [3, 20];
  const values = [randInt(rng, lo, hi), randInt(rng, lo, hi), randInt(rng, lo, hi)];
  const table = GRAPH_LABELS.map((d, i) => `${d}よう日 ${values[i]}こ`).join(" / ");
  /* グラフの単元なので ぼうグラフも出す (文の ひょうは まちがいノートで 読めるよう残す) */
  const figure = {
    kind: "barChart" as const,
    bars: GRAPH_LABELS.map((d, i) => ({ label: d, value: values[i] })),
    unit: "こ",
  };
  if (rng() < 0.5) {
    const answer = values[0] + values[1] + values[2];
    return {
      skillId: "g4_graph",
      text: `ひろった どんぐりの ひょう\n${table}\nぜんぶで なんこ?`,
      figure,
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
      hints: genericHints([
        `${values[0]} + ${values[1]} + ${values[2]} = ${answer}`,
        `ひょうの 数を ぜんぶ たす`,
      ]),
    };
  }
  const max = Math.max(...values);
  const min = Math.min(...values);
  const answer = max - min;
  return {
    skillId: "g4_graph",
    text: `ひろった どんぐりの ひょう\n${table}\nいちばん多い日と 少ない日の さは なんこ?`,
    figure,
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
    hints: genericHints([
      `いちばん多いのは ${max}こ、少ないのは ${min}こ`,
      `${max} - ${min} = ${answer}こ`,
    ]),
  };
}

export const GRADE4_GENERATORS: Record<string, (rng: Rng, level?: Level) => Problem> = {
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
