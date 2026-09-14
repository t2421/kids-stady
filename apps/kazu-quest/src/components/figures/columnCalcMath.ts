/*
 * columnCalc (ひっ算) の純計算部分。SVG 描画 (ColumnCalc.tsx) から分離し、
 * 見た目を変えずにロジックだけ確認できるようにする。
 */

export function pad(s: string, width: number): string {
  return s.length >= width ? s : " ".repeat(width - s.length) + s;
}

export interface AddSubResult {
  width: number;
  aDigits: string[]; // 長さ width。空欄は " "
  bDigits: string[];
  resultDigits: string[];
  /* + のみ: carries[j] = 列 j (0=いちばん右) で発生し、左どなり (j-1) に運ばれる くり上がり (0 or 1) */
  carries: number[];
  /* - のみ: borrows[j] = 列 j が左どなりから 1 かりた場合 true */
  borrows: boolean[];
  resultStr: string;
}

/* 引き算は a >= b を前提 (エレメンタリー算数の範囲。負にはしない) */
export function computeAddSub(op: "+" | "-" | "×", a: number, b: number): AddSubResult {
  const aStr = String(Math.abs(a));
  const bStr = String(Math.abs(b));
  const resultNum = op === "+" ? a + b : op === "-" ? a - b : a * b;
  const resultStr = String(Math.abs(resultNum));
  const width = Math.max(aStr.length, bStr.length, resultStr.length);

  const aDigits = pad(aStr, width).split("");
  const bDigits = pad(bStr, width).split("");
  const carries = new Array(width).fill(0) as number[];
  const borrows = new Array(width).fill(false) as boolean[];
  const resultDigits = new Array(width).fill(" ") as string[];

  if (op === "+") {
    let carry = 0;
    for (let j = width - 1; j >= 0; j--) {
      const av = aDigits[j] === " " ? 0 : Number(aDigits[j]);
      const bv = bDigits[j] === " " ? 0 : Number(bDigits[j]);
      const sum = av + bv + carry;
      resultDigits[j] = String(sum % 10);
      carry = Math.floor(sum / 10);
      carries[j] = carry;
    }
  } else if (op === "-") {
    let borrow = 0;
    for (let j = width - 1; j >= 0; j--) {
      const av = aDigits[j] === " " ? 0 : Number(aDigits[j]);
      const bv = bDigits[j] === " " ? 0 : Number(bDigits[j]);
      let top = av - borrow;
      let borrowed = false;
      if (top < bv) {
        top += 10;
        borrowed = true;
      }
      resultDigits[j] = String(top - bv);
      borrow = borrowed ? 1 : 0;
      borrows[j] = borrowed;
    }
  } else {
    // × は簡易表示のみ (くり上がりメモは出さない)
    const padded = pad(resultStr, width).split("");
    for (let j = 0; j < width; j++) resultDigits[j] = padded[j];
  }

  return { width, aDigits, bDigits, resultDigits, carries, borrows, resultStr };
}

export interface DivStep {
  /* この段までに使った被除数の桁 (文字列) */
  digitsUsed: string;
  /* 商のこの列の数字。まだ立たない (先頭の 0 を飛ばす) 場合は "" */
  quotientDigit: string;
  /* かけた結果。quotientDigit が "" のときは null */
  product: number | null;
  /* ひいた後の余り (次の段の頭に使う) */
  remainderStr: string;
}

export interface LongDivision {
  quotient: string;
  remainder: number;
  steps: DivStep[];
}

/* 筆算のわり算 (long division)。b <= 0 は安全側で商 0 として返す */
export function computeLongDivision(a: number, b: number): LongDivision {
  const dividend = Math.abs(Math.round(a));
  const divisor = Math.abs(Math.round(b));
  const s = String(dividend);
  const steps: DivStep[] = [];
  if (divisor === 0) {
    return { quotient: "0", remainder: dividend, steps: [{ digitsUsed: s, quotientDigit: "", product: null, remainderStr: s }] };
  }
  let remainder = 0;
  let quotient = "";
  let started = false;
  for (let i = 0; i < s.length; i++) {
    remainder = remainder * 10 + Number(s[i]);
    const digitsUsed = s.slice(0, i + 1);
    const digit = Math.floor(remainder / divisor);
    if (!started && digit === 0 && i < s.length - 1) {
      steps.push({ digitsUsed, quotientDigit: "", product: null, remainderStr: String(remainder) });
      continue;
    }
    started = true;
    quotient += String(digit);
    const product = digit * divisor;
    remainder -= product;
    steps.push({ digitsUsed, quotientDigit: String(digit), product, remainderStr: String(remainder) });
  }
  if (quotient === "") quotient = "0";
  return { quotient, remainder, steps };
}
