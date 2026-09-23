/*
 * 問題を「図」で表す (視覚モデル)。純関数 — React / Phaser / DOM に依存しない。
 *
 * 文章だけの問題は 読みとる ところで つまずく子がいるので、図で表せる問題は
 * 図も出す。レッスンの図 (FigureSpec / components/figures) をそのまま使う。
 *
 * 大原則: **図は「問題の じょうけん」だけを表し、こたえは 見せない**。
 *   - ひっ算は revealSteps: 0 (答えの けたは "?" のまま)
 *   - 分度器は showReading を付けない
 *   - 割合の帯 (percentBar) は %の数字を必ず出すので 問題には使わない
 *
 * a/b の意味は単元ごとに違う (g3_decimal の a=2 は 0.2 の ×10 表現) ので、
 * 一般規則ではなく skillId ごとの表で決める。表に無い単元は図なし。
 * ジェネレータが problem.figure を直接持たせていれば そちらが優先。1つの単元が
 * 複数の形の問題を出すもの (g2_time の「なんじ?」と「なんぷん?」、g4_angle の
 * 一ちょくせん/三角形/一まわり、g5_area の 三角形/平行四辺形、g6_letter_expr) は
 * a/b だけでは 見分けられないので、必ず ジェネレータ側で figure を持たせること。
 */

import type { FigureSpec, Problem } from "./types";

/* 10のかたまり (tenFrame) は 0〜10 しか描けない */
const TEN_FRAME_MAX = 10;
/* 面積図のマス目の上限 (戦闘中に 1600 マスの SVG を描かない) */
const AREA_GRID_MAX_CELLS = 144;
/* さくらんぼ (10 と ばら) で表せる くり下がりの上限 */
const BORROW_TEN_FRAME_MAX = 18;

function isCount(n: number | null): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 0;
}

/* ひっ算の わくだけを見せる (こたえの けたは "?" のまま) */
function columnCalc(op: "+" | "-" | "×" | "÷", a: number, b: number): FigureSpec | null {
  if (a <= 0 || b <= 0) return null;
  return { kind: "columnCalc", op, a, b, revealSteps: 0 };
}

/* たし算: 2つの数を 10のかたまりで ならべる。10 をこえる数は ひっ算にゆずる */
function addFigure(a: number, b: number): FigureSpec | null {
  if (a <= TEN_FRAME_MAX && b <= TEN_FRAME_MAX) {
    return { kind: "tenFrame", count: a, second: b };
  }
  return columnCalc("+", a, b);
}

/* ひき算: ひかれる数を見せる。11〜18 は「10 と ばら」に分けて見せる */
function subFigure(a: number, b: number): FigureSpec | null {
  if (a <= TEN_FRAME_MAX) return { kind: "tenFrame", count: a };
  if (a <= BORROW_TEN_FRAME_MAX) {
    return { kind: "tenFrame", count: TEN_FRAME_MAX, second: a - TEN_FRAME_MAX };
  }
  return columnCalc("-", a, b);
}

/* 分数バーで描ける分母の上限 (これより細かいと 1マスが細すぎて読めない) */
const FRACTION_BAR_MAX_PARTS = 12;

function fractionBar(n1: number, d1: number, n2: number, d2: number): FigureSpec | null {
  const ok = (n: number, d: number) => d >= 2 && d <= FRACTION_BAR_MAX_PARTS && n >= 1 && n <= d;
  if (!ok(n1, d1) || !ok(n2, d2)) return null;
  return { kind: "fractionBar", parts: d1, filled: n1, second: { parts: d2, filled: n2 } };
}

/*
 * 分数の問題は 問題文に 分数そのものが書いてあるので、a/b ではなく
 * **問題文から** 2つの分数を読みとって 2本の分数バーにする (図と文が
 * 食いちがうことが 構造上おきない)。たし算・ひき算・大小くらべ だけ —
 * かけ算・わり算は 2本の棒を ならべても 式の意味にならないので 図なし
 */
const FRACTION_PAIR = /^(\d+)\/(\d+)\s*(?:[+\-]|と)\s*(\d+)\/(\d+)(?:\s*=\s*\?|、)/;
/* 小3 Lv1 の読みとり:「1を 3つに 分けた うちの 2つ分は どれ?」 */
const FRACTION_READING = /^1を\s*(\d+)つに\s*分けた\s*うちの\s*(\d+)つ分/;

function fractionFigure({ text }: Problem): FigureSpec | null {
  const line = text.split("\n").pop() ?? "";
  const reading = FRACTION_READING.exec(line);
  if (reading) {
    const parts = Number(reading[1]);
    const filled = Number(reading[2]);
    if (parts < 2 || parts > FRACTION_BAR_MAX_PARTS || filled < 1 || filled > parts) return null;
    return { kind: "fractionBar", parts, filled };
  }
  const m = FRACTION_PAIR.exec(line);
  if (!m) return null;
  return fractionBar(Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4]));
}

/* 単元ごとの図。a/b が想定外の形なら null を返して「図なし」に倒す */
const BY_SKILL: Record<string, (p: Problem) => FigureSpec | null> = {
  /* ---- 小1 ---- (g1_compare は 3つの数を ジェネレータ側で 数直線にする) */
  g1_add_nc: ({ a, b }) => (isCount(a) && isCount(b) ? addFigure(a, b) : null),
  g1_add_carry: ({ a, b }) => (isCount(a) && isCount(b) ? addFigure(a, b) : null),
  g1_sub_nc: ({ a, b }) => (isCount(a) && isCount(b) ? subFigure(a, b) : null),
  g1_sub_borrow: ({ a, b }) => (isCount(a) && isCount(b) ? subFigure(a, b) : null),

  /* ---- 小2 ---- */
  /* 九九は アレイ図 (a のだんが b れつ) */
  g2_kuku: ({ a, b }) =>
    isCount(a) && isCount(b) && a > 0 && b > 0 ? { kind: "array", rows: a, cols: b } : null,
  g2_add_column: ({ a, b }) => (isCount(a) && isCount(b) ? columnCalc("+", a, b) : null),
  g2_sub_column: ({ a, b }) => (isCount(a) && isCount(b) ? columnCalc("-", a, b) : null),

  /* ---- 小3 ---- */
  g3_div: ({ a, b }) => (isCount(a) && isCount(b) ? columnCalc("÷", a, b) : null),
  g3_div_remainder: ({ a, b }) => (isCount(a) && isCount(b) ? columnCalc("÷", a, b) : null),
  g3_mul_column: ({ a, b }) => (isCount(a) && isCount(b) ? columnCalc("×", a, b) : null),
  g3_fraction: fractionFigure,

  /* ---- 小4 ---- */
  /* くらいを たてに ならべて 四捨五入する けたを 読みやすくする */
  g4_round: ({ a }) => (isCount(a) && a > 0 ? { kind: "placeValue", value: String(a) } : null),
  g4_div_2digit: ({ a, b }) => (isCount(a) && isCount(b) ? columnCalc("÷", a, b) : null),
  g4_fraction_same: fractionFigure,
  /* 長方形・正方形 (a=よこ, b=たて)。大きすぎる図は isAffordable が落とす */
  g4_area: ({ a, b }) =>
    isCount(a) && isCount(b) && a > 0 && b > 0
      ? { kind: "areaGrid", w: a, h: b, unit: "cm", shape: "rect" }
      : null,

  /* ---- 小5 ---- */
  /* 分母がちがう 2本を 同じ長さで ならべる — 通分が要る わけが 見える */
  g5_fraction_diff: fractionFigure,
};

/*
 * 図が重すぎないか の最終チェック (ジェネレータ指定の figure にも かける)。
 * 面積図は w×h のマスを1つずつ描くので、戦闘中に 1000 マス を描かせない。
 */
function isAffordable(spec: FigureSpec): boolean {
  if (spec.kind === "areaGrid") return spec.w * spec.h <= AREA_GRID_MAX_CELLS;
  return true;
}

/*
 * 問題に そえる図。ジェネレータが持たせた figure が最優先。
 * 図を出さない単元 (文章題・分数・小数など、a/b から図が決まらないもの) は null。
 */
export function figureForProblem(problem: Problem): FigureSpec | null {
  const spec = problem.figure ?? BY_SKILL[problem.skillId]?.(problem) ?? null;
  if (!spec || !isAffordable(spec)) return null;
  return spec;
}
