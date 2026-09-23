/*
 * 小5のスキルと問題ジェネレータ (第5章「割合の都と 魔王マイナドス」)。
 * 小数の×÷・異分母分数・割合・平均・単位量あたり・体積・倍数約数・面積。
 *
 * 出題の段階 (LP-02b, docs/kazu-quest-levels.md): 各ジェネレータは
 * `(rng, level?)` を取り、level 省略時は 2 (= 従来どおりの出題) を使う。
 * level 2 の分岐は既存コードと完全に同じ値域・同じ乱数消費順にしてある
 * (シード固定のテストが壊れないため)。
 */

import type { Problem, Rng } from "./types";
import { randInt } from "./types";
import { makeChoicesOf } from "./choices";
import { dec, frac, gcd, lcm, randCoprimeNumerator } from "./numbers";
import { genericHints } from "./hints";

type Level = 1 | 2 | 3;

/* 小数の かけ算わり算 (0.1きざみ × 整数) */
/*
 * 「0.1 が なんこ」で数える値 (tenths) を引く。10の倍数だと 3.0 → "3" と
 * 整数になり、小数の単元なのに「3 × 2 = ?」のような 小数が1つも出ない問題に
 * なってしまう (1割ほど出ていた) ので、10の倍数は引きなおす
 */
function randNotMultipleOf10(rng: Rng, lo: number, hi: number): number {
  let n = randInt(rng, lo, hi);
  while (n % 10 === 0) n = randInt(rng, lo, hi);
  return n;
}

function genDecimalMulDiv(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const [tLo, tHi, bLo, bHi] =
    lv === 1 ? [11, 30, 2, 4] : lv === 3 ? [100, 999, 2, 12] : [12, 95, 2, 9];
  if (rng() < 0.5) {
    const tenths = randNotMultipleOf10(rng, tLo, tHi);
    const b = randInt(rng, bLo, bHi);
    const answer = dec((tenths * b) / 10, 2);
    return {
      skillId: "g5_decimal_muldiv",
      text: `${dec(tenths / 10, 1)} × ${b} = ?`,
      a: tenths,
      b,
      op: "×",
      answer,
      choices: makeChoicesOf(rng, answer, [
        String(tenths * b),
        dec((tenths * b) / 100, 2),
        dec((tenths * b + 10) / 10, 2),
      ]),
      hint: null,
      explain: [
        `まず 小数点を わすれて ${tenths} × ${b} = ${tenths * b}`,
        `かけられる数に 小数点が 1つ あるので 1けた もどす`,
        `こたえは ${answer}`,
      ],
      hints: genericHints([
        `まず 小数点を わすれて ${tenths} × ${b} = ${tenths * b}`,
        `かけられる数に 小数点が 1つ あるので 1けた もどす`,
        `こたえは ${answer}`,
      ]),
    };
  }
  /*
   * わられる数も 小数にする (10の倍数だと「47 ÷ 5」になり、説明の
   * 「小数点の いちを そろえて もどす」と 食いちがう)
   */
  let quotientTenths = randNotMultipleOf10(rng, tLo, tHi);
  let divisor = randInt(rng, bLo, bHi);
  while ((quotientTenths * divisor) % 10 === 0) {
    quotientTenths = randNotMultipleOf10(rng, tLo, tHi);
    divisor = randInt(rng, bLo, bHi);
  }
  const dividendTenths = quotientTenths * divisor;
  const answer = dec(quotientTenths / 10, 1);
  return {
    skillId: "g5_decimal_muldiv",
    text: `${dec(dividendTenths / 10, 1)} ÷ ${divisor} = ?`,
    a: dividendTenths,
    b: divisor,
    op: "÷",
    answer,
    choices: makeChoicesOf(rng, answer, [
      String(quotientTenths),
      dec(quotientTenths / 100, 2),
      dec((quotientTenths + 10) / 10, 1),
    ]),
    hint: null,
    explain: [
      `${dividendTenths} ÷ ${divisor} = ${quotientTenths} と かんがえる`,
      `小数点の いちを そろえて もどす`,
      `こたえは ${answer}`,
    ],
    hints: genericHints([
      `${dividendTenths} ÷ ${divisor} = ${quotientTenths} と かんがえる`,
      `小数点の いちを そろえて もどす`,
      `こたえは ${answer}`,
    ]),
  };
}

/* 異分母の分数 (通分して たしひき・答えは約分する) */
function genFractionDiff(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const denominators =
    lv === 1 ? [2, 3, 4] : lv === 3 ? [3, 4, 5, 6, 7, 8, 9, 10, 12] : [2, 3, 4, 5, 6, 8];
  let d1 = denominators[randInt(rng, 0, denominators.length - 1)];
  let d2 = denominators[randInt(rng, 0, denominators.length - 1)];
  if (d1 === d2) {
    d2 = lv === 2 ? (d1 === 2 ? 3 : 2) : d1 === denominators[0] ? denominators[1] : denominators[0];
  }
  /* 問題の分数は 約分ずみ (2/4 ではなく 1/2) — 教科書どおり。分母がちがう
     約分ずみの分数は 等しくならないので、ひき算の こたえも 0 に ならない */
  const n1 = randCoprimeNumerator(rng, d1);
  const n2 = randCoprimeNumerator(rng, d2);
  const common = lcm(d1, d2);
  if (rng() < 0.5) {
    const total = (n1 * common) / d1 + (n2 * common) / d2;
    const answer = frac(total, common);
    return {
      skillId: "g5_fraction_diff",
      text: `${n1}/${d1} + ${n2}/${d2} = ?`,
      a: n1,
      b: n2,
      op: "+",
      answer,
      choices: makeChoicesOf(rng, answer, [
        `${n1 + n2}/${d1 + d2}`,
        `${total + 1}/${common}`,
        `${n1 + n2}/${common}`,
      ]),
      hint: null,
      explain: [
        `分母を ${common} に そろえる (通分)`,
        `${(n1 * common) / d1}/${common} + ${(n2 * common) / d2}/${common} = ${total}/${common}`,
        `こたえは ${answer}`,
      ],
      hints: [
        `分母が ちがう ぶんすうは まず 通分するよ`,
        `分母を ${common} に そろえると ${(n1 * common) / d1}/${common} と ${(n2 * common) / d2}/${common}`,
        `${(n1 * common) / d1} + ${(n2 * common) / d2} = ${total}。分母は ${common} の ままだから…`,
      ],
    };
  }
  /* ひき算は 大きいほうから ひく */
  const v1 = (n1 * common) / d1;
  const v2 = (n2 * common) / d2;
  const big = Math.max(v1, v2);
  const small = Math.min(v1, v2);
  const answer = frac(big - small, common);
  const bigText = v1 >= v2 ? `${n1}/${d1}` : `${n2}/${d2}`;
  const smallText = v1 >= v2 ? `${n2}/${d2}` : `${n1}/${d1}`;
  return {
    skillId: "g5_fraction_diff",
    text: `${bigText} - ${smallText} = ?`,
    a: n1,
    b: n2,
    op: "-",
    answer,
    choices: makeChoicesOf(rng, answer, [
      `${Math.abs(n1 - n2)}/${Math.abs(d1 - d2) || d1}`,
      `${big - small + 1}/${common}`,
      `${big + small}/${common}`,
    ]),
    hint: null,
    explain: [
      `分母を ${common} に そろえる (通分)`,
      `${big}/${common} - ${small}/${common} = ${big - small}/${common}`,
      `こたえは ${answer}`,
    ],
    hints: [
      `分母が ちがう ぶんすうは まず 通分するよ`,
      `分母を ${common} に そろえると ${big}/${common} と ${small}/${common}`,
      `${big} - ${small} = ${big - small}。分母は ${common} の ままだから…`,
    ],
  };
}

/* 割合と 百分率 */
function genPercent(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const pctList = lv === 1 ? [10, 20, 50] : lv === 3 ? [15, 24, 35, 40, 60, 65, 75, 90] : [10, 20, 25, 40, 50, 75, 80];
  const baseMul = lv === 1 ? [2, 10] : lv === 3 ? [10, 40] : [2, 20];
  const base = randInt(rng, baseMul[0], baseMul[1]) * 10;
  const pct = pctList[randInt(rng, 0, pctList.length - 1)];
  const value = (base * pct) / 100;
  if (Number.isInteger(value) && rng() < 0.6) {
    return {
      skillId: "g5_percent",
      text: `${base}この ${pct}% は なんこ?`,
      a: base,
      b: pct,
      op: null,
      answer: String(value),
      choices: makeChoicesOf(rng, String(value), [
        String(base - value),
        String(pct),
        String(value * 10),
      ]),
      hint: null,
      explain: [
        `${pct}% = ${dec(pct / 100, 2)}`,
        `${base} × ${dec(pct / 100, 2)} = ${value}こ`,
      ],
      hints: [
        `%を 小数に なおしてから かけ算しよう`,
        `${pct}% は 小数で ${dec(pct / 100, 2)}`,
        `${base} × ${dec(pct / 100, 2)} を けいさんすると…`,
      ],
    };
  }
  /* 「○は □の なん%?」 (割り切れる組にする) */
  const percentList = lv === 1 ? [10, 50] : lv === 3 ? [10, 20, 25, 50, 75] : [10, 20, 25, 50];
  const wholeMul = lv === 1 ? [2, 8] : lv === 3 ? [10, 40] : [2, 20];
  const percent = percentList[randInt(rng, 0, percentList.length - 1)];
  const whole = randInt(rng, wholeMul[0], wholeMul[1]) * 20;
  const part = (whole * percent) / 100;
  return {
    skillId: "g5_percent",
    text: `${whole}この うち ${part}こ は なん%?`,
    a: part,
    b: whole,
    op: null,
    answer: String(percent),
    choices: makeChoicesOf(rng, String(percent), [
      String(100 - percent),
      String(part),
      String(percent * 2),
    ]),
    hint: null,
    explain: [
      `${part} ÷ ${whole} = ${dec(part / whole, 2)}`,
      `100を かけて ${percent}%`,
    ],
    hints: [
      `わり算してから 100を かけると 百分率に なるよ`,
      `${part} ÷ ${whole} を けいさんしてみよう`,
      `${dec(part / whole, 2)} に 100を かけると…`,
    ],
  };
}

/* 平均 */
function genAverage(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const [countLo, countHi, ansLo, ansHi, spread] =
    lv === 1 ? [2, 3, 4, 15, 2] : lv === 3 ? [4, 5, 10, 60, 5] : [3, 4, 4, 30, 3];
  const count = randInt(rng, countLo, countHi);
  const answer = randInt(rng, ansLo, ansHi);
  const values: number[] = [];
  let rest = answer * count;
  for (let i = 0; i < count - 1; i++) {
    const v = Math.max(1, answer + randInt(rng, -spread, spread));
    values.push(v);
    rest -= v;
  }
  if (rest < 1) {
    /* 最後の1つが 0いかに ならないよう ならしなおす */
    values.length = 0;
    for (let i = 0; i < count - 1; i++) values.push(answer);
    rest = answer;
  }
  values.push(rest);
  return {
    skillId: "g5_average",
    text: `${values.join(" , ")} の 平きんは いくつ?`,
    a: null,
    b: count,
    op: null,
    answer: String(answer),
    choices: makeChoicesOf(rng, String(answer), [
      String(answer * count),
      String(Math.max(...values)),
      String(answer + 1),
    ]),
    hint: null,
    explain: [
      `ぜんぶ たすと ${answer * count}`,
      `平きん = 合計 ÷ こ数`,
      `${answer * count} ÷ ${count} = ${answer}`,
    ],
    hints: genericHints([
      `ぜんぶ たすと ${answer * count}`,
      `平きん = 合計 ÷ こ数`,
      `${answer * count} ÷ ${count} = ${answer}`,
    ]),
  };
}

/* 単位量あたりの 大きさ */
function genUnitRate(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const [perLo, perHi, countLo, countHi] =
    lv === 1 ? [10, 50, 2, 5] : lv === 3 ? [100, 500, 6, 20] : [20, 150, 3, 9];
  const per = randInt(rng, perLo, perHi);
  const count = randInt(rng, countLo, countHi);
  const total = per * count;
  if (rng() < 0.5) {
    return {
      skillId: "g5_unit_rate",
      text: `${count}こで ${total}円。1こ なん円?`,
      a: total,
      b: count,
      op: "÷",
      answer: String(per),
      choices: makeChoicesOf(rng, String(per), [
        String(total),
        String(per * count + count),
        String(per + 10),
      ]),
      hint: null,
      explain: [`1こ分 = 合計 ÷ こ数`, `${total} ÷ ${count} = ${per}円`],
      hints: genericHints([`1こ分 = 合計 ÷ こ数`, `${total} ÷ ${count} = ${per}円`]),
    };
  }
  return {
    skillId: "g5_unit_rate",
    text: `1こ ${per}円の しなもの ${count}こ分は なん円?`,
    a: per,
    b: count,
    op: "×",
    answer: String(total),
    choices: makeChoicesOf(rng, String(total), [
      String(per + count),
      String(per * (count + 1)),
      String(total + per),
    ]),
    hint: null,
    explain: [`合計 = 1こ分 × こ数`, `${per} × ${count} = ${total}円`],
    hints: genericHints([`合計 = 1こ分 × こ数`, `${per} × ${count} = ${total}円`]),
  };
}

/* 体積 (直方体・立方体) */
function genVolume(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const [lo, hi] = lv === 1 ? [2, 5] : lv === 3 ? [6, 20] : [2, 9];
  if (rng() < 0.6) {
    const a = randInt(rng, lo, hi);
    const b = randInt(rng, lo, hi);
    const c = randInt(rng, lo, hi);
    const answer = a * b * c;
    return {
      skillId: "g5_volume",
      text: `たて ${a}cm よこ ${b}cm 高さ ${c}cm の 直方体の 体せきは なんcm³?`,
      a,
      b,
      op: "×",
      answer: String(answer),
      choices: makeChoicesOf(rng, String(answer), [
        String(a * b),
        String(a + b + c),
        String((a * b + b * c + c * a) * 2),
      ]),
      hint: null,
      explain: [
        `体せき = たて × よこ × 高さ`,
        `${a} × ${b} × ${c} = ${answer}cm³`,
      ],
      hints: genericHints([
        `体せき = たて × よこ × 高さ`,
        `${a} × ${b} × ${c} = ${answer}cm³`,
      ]),
    };
  }
  const s = randInt(rng, lo, hi);
  const answer = s * s * s;
  return {
    skillId: "g5_volume",
    text: `1ぺんが ${s}cm の 立方体の 体せきは なんcm³?`,
    a: s,
    b: s,
    op: "×",
    answer: String(answer),
    choices: makeChoicesOf(rng, String(answer), [
      String(s * s),
      String(s * 6),
      String(answer + s),
    ]),
    hint: null,
    explain: [`立方体の 体せき = 1ぺん × 1ぺん × 1ぺん`, `${s}×${s}×${s} = ${answer}cm³`],
    hints: genericHints([`立方体の 体せき = 1ぺん × 1ぺん × 1ぺん`, `${s}×${s}×${s} = ${answer}cm³`]),
  };
}

/* 倍数と 約数 */
function genMultiple(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const [lo, hi] = lv === 1 ? [2, 6] : lv === 3 ? [2, 24] : [2, 12];
  const a = randInt(rng, lo, hi);
  let b = randInt(rng, lo, hi);
  if (b === a) b = a === hi ? (lv === 2 ? 6 : lo) : a + 1;
  if (rng() < 0.5) {
    const answer = lcm(a, b);
    return {
      skillId: "g5_multiple",
      text: `${a} と ${b} の 最小公倍数は?`,
      a,
      b,
      op: null,
      answer: String(answer),
      choices: makeChoicesOf(rng, String(answer), [
        String(a * b),
        /* 最大公約数と とりちがえる まちがい。ただし 1 は 公倍数に ならないので出さない */
        String(gcd(a, b) > 1 ? gcd(a, b) : Math.max(a, b)),
        String(a + b),
      ]),
      hint: null,
      explain: [
        `${a}の 倍数: ${a}, ${a * 2}, ${a * 3}…`,
        `${b}の 倍数: ${b}, ${b * 2}, ${b * 3}…`,
        `はじめて そろうのは ${answer}`,
      ],
      hints: genericHints([
        `${a}の 倍数: ${a}, ${a * 2}, ${a * 3}…`,
        `${b}の 倍数: ${b}, ${b * 2}, ${b * 3}…`,
        `はじめて そろうのは ${answer}`,
      ]),
    };
  }
  /*
   * たがいに素 (こたえが 1) が 3割ほど出ていた (7 のような素数を引くと
   * 範囲内に 公約数を もつ相手が いない)。教科書の問題は ほとんど 1 より大きい
   * 公約数を もつので、8割は「公約数 g をもつ 2数 (g×m と g×n)」から作る
   */
  let [ga, gb] = [a, b];
  if (rng() < 0.8) {
    for (let i = 0; i < 20; i++) {
      const g = randInt(rng, 2, Math.floor(hi / 2));
      const maxMul = Math.floor(hi / g);
      const m = randInt(rng, 1, maxMul);
      const n = randInt(rng, 1, maxMul);
      if (m !== n && g * m >= lo && g * n >= lo) {
        [ga, gb] = [g * m, g * n];
        break;
      }
    }
  }
  const answer = gcd(ga, gb);
  return gcdProblem(rng, ga, gb, answer);
}

function gcdProblem(rng: Rng, a: number, b: number, answer: number): Problem {
  return {
    skillId: "g5_multiple",
    text: `${a} と ${b} の 最大公約数は?`,
    a,
    b,
    op: null,
    answer: String(answer),
    choices: makeChoicesOf(rng, String(answer), [
      String(lcm(a, b)),
      String(Math.min(a, b)),
      String(a * b),
    ]),
    hint: null,
    explain: [
      `${a} も ${b} も わりきれる 数を さがす`,
      `いちばん 大きいのは ${answer}`,
    ],
    hints: genericHints([
      `${a} も ${b} も わりきれる 数を さがす`,
      `いちばん 大きいのは ${answer}`,
    ]),
  };
}

/* 面積 (三角形・平行四辺形) */
function genArea(rng: Rng, level?: Level): Problem {
  const lv = level ?? 2;
  const [baseMulLo, baseMulHi, heightLo, heightHi] =
    lv === 1 ? [2, 6, 3, 8] : lv === 3 ? [10, 20, 10, 30] : [2, 12, 3, 14];
  if (rng() < 0.5) {
    const base = randInt(rng, baseMulLo, baseMulHi) * 2; /* ÷2 でわりきれるように */
    const height = randInt(rng, heightLo, heightHi);
    const answer = (base * height) / 2;
    return {
      skillId: "g5_area",
      text: `ていへん ${base}cm 高さ ${height}cm の 三角形の 面せきは なんcm²?`,
      a: base,
      b: height,
      op: "×",
      /* 三角形か平行四辺形かは a/b から決まらないので ここで図を指定する */
      figure: { kind: "areaGrid", w: base, h: height, unit: "cm", shape: "triangle" },
      answer: String(answer),
      choices: makeChoicesOf(rng, String(answer), [
        String(base * height),
        String(base + height),
        String(answer + base),
      ]),
      hint: null,
      explain: [
        `三角形の 面せき = ていへん × 高さ ÷ 2`,
        `${base} × ${height} = ${base * height}`,
        `${base * height} ÷ 2 = ${answer}cm²`,
      ],
      hints: genericHints([
        `三角形の 面せき = ていへん × 高さ ÷ 2`,
        `${base} × ${height} = ${base * height}`,
        `${base * height} ÷ 2 = ${answer}cm²`,
      ]),
    };
  }
  const base = randInt(rng, heightLo, heightHi);
  const height = randInt(rng, heightLo, heightHi);
  const answer = base * height;
  return {
    skillId: "g5_area",
    text: `ていへん ${base}cm 高さ ${height}cm の 平行四辺形の 面せきは なんcm²?`,
    a: base,
    b: height,
    op: "×",
    figure: { kind: "areaGrid", w: base, h: height, unit: "cm", shape: "parallelogram" },
    answer: String(answer),
    choices: makeChoicesOf(rng, String(answer), [
      dec(answer / 2, 1),
      String(base + height),
      String((base + height) * 2),
    ]),
    hint: null,
    explain: [
      `平行四辺形の 面せき = ていへん × 高さ`,
      `${base} × ${height} = ${answer}cm²`,
    ],
    hints: genericHints([
      `平行四辺形の 面せき = ていへん × 高さ`,
      `${base} × ${height} = ${answer}cm²`,
    ]),
  };
}

export const GRADE5_GENERATORS: Record<string, (rng: Rng, level?: Level) => Problem> = {
  g5_decimal_muldiv: genDecimalMulDiv,
  g5_fraction_diff: genFractionDiff,
  g5_percent: genPercent,
  g5_average: genAverage,
  g5_unit_rate: genUnitRate,
  g5_volume: genVolume,
  g5_multiple: genMultiple,
  g5_area: genArea,
};

export const GRADE5_LABELS: Record<string, string> = {
  g5_decimal_muldiv: "小数の かけ算わり算",
  g5_fraction_diff: "異分母の 分数",
  g5_percent: "割合と 百分率",
  g5_average: "平きん",
  g5_unit_rate: "単位量あたり",
  g5_volume: "体せき",
  g5_multiple: "倍数と 約数",
  g5_area: "面せき (三角形・平行四辺形)",
};
