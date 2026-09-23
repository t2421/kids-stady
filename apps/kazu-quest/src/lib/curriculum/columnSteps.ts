/*
 * ひっ算の「くらいごとの 説明」を作る (純関数)。
 *
 * 以前は 2けた決め打ちで Math.floor(a / 10) を「十のくらい」と書いていたので、
 * Lv3 (3けた) では「十のくらい: 12 + 83 + 1 = 96」のような、くらいの考え方と
 * 合わない説明になっていた。ここでは 一→十→百→千 と 1けたずつ進み、
 * くり上がり・くり下がり (0 から かりる場合も) を そのまま文にする。
 *
 * 表記: 一十百千 は小1の漢字。「位」は小4 なので ひらがなで「くらい」と書く。
 */

const PLACES = ["一のくらい", "十のくらい", "百のくらい", "千のくらい", "万のくらい"];

function digitsOf(n: number): number[] {
  return String(n)
    .split("")
    .reverse()
    .map(Number);
}

function place(i: number): string {
  return PLACES[i] ?? `${i + 1}けためのくらい`;
}

/* たし算のひっ算: くらいごとに「x + y (+ 1) = s」と くり上がり */
export function columnAddSteps(a: number, b: number): string[] {
  const da = digitsOf(a);
  const db = digitsOf(b);
  const width = Math.max(da.length, db.length);
  const lines: string[] = [];
  let carry = 0;
  for (let i = 0; i < width; i++) {
    const x = da[i] ?? 0;
    const y = db[i];
    const terms = [String(x), ...(y === undefined ? [] : [String(y)]), ...(carry ? ["1"] : [])];
    const sum = x + (y ?? 0) + carry;
    const isLast = i === width - 1;
    if (terms.length === 1) {
      lines.push(`${place(i)}: ${x} を そのまま おろす`);
    } else if (sum >= 10) {
      lines.push(
        isLast
          ? `${place(i)}: ${terms.join(" + ")} = ${sum} → ${sum % 10} を かいて ${place(i + 1)}に 1`
          : `${place(i)}: ${terms.join(" + ")} = ${sum} → ${sum % 10} を かいて 1 くり上げる`,
      );
    } else {
      lines.push(`${place(i)}: ${terms.join(" + ")} = ${sum}`);
    }
    carry = sum >= 10 ? 1 : 0;
  }
  lines.push(`こたえは ${a + b}`);
  return lines;
}

/* ひき算のひっ算 (a >= b): くらいごとに「x - y」と くり下がり (0 から かりるときも) */
export function columnSubSteps(a: number, b: number): string[] {
  const da = digitsOf(a);
  const db = digitsOf(b);
  const lines: string[] = [];
  let borrow = 0;
  for (let i = 0; i < da.length; i++) {
    const x = da[i];
    const y = db[i];
    const isTop = i === da.length - 1;
    let top: number;
    let prefix = "";
    if (borrow && x === 0) {
      /* 0 は かせないので、さらに 上のくらいから かりて 10 → 1 かして 9 */
      top = 9;
      prefix = `0 は かせないので ${place(i + 1)}から かりて 10、1 かして 9。`;
    } else {
      top = x - borrow;
      if (borrow) prefix = `${x} は 1 かしたので ${top}。`;
    }
    const nextBorrow = borrow && x === 0 ? 1 : 0;
    if (y === undefined) {
      /* ひく数が もう無い くらい: そのまま おろす (上のくらいで 0 になったら かかない) */
      if (!(isTop && top === 0)) lines.push(`${place(i)}: ${prefix}${top} を そのまま おろす`);
      borrow = nextBorrow;
      continue;
    }
    if (top < y) {
      lines.push(
        `${place(i)}: ${prefix}${top} から ${y} は ひけない → ${place(i + 1)}から 1 かりて ${top + 10} - ${y} = ${top + 10 - y}`,
      );
      borrow = 1;
    } else {
      lines.push(`${place(i)}: ${prefix}${top} - ${y} = ${top - y}`);
      borrow = nextBorrow;
    }
  }
  lines.push(`こたえは ${a - b}`);
  return lines;
}

/*
 * かけ算のひっ算 (多けた × 1けた): くらいごとの かけ算を 位どり した数にして
 * さいごに たす (部分積の考え方。2けたのときは 従来の説明と同じ形)
 */
export function columnMulSteps(a: number, b: number): string[] {
  const da = digitsOf(a);
  const parts = da.map((d, i) => d * b * 10 ** i);
  const lines = da.map((d, i) =>
    i === 0 ? `${place(i)}: ${d} × ${b} = ${d * b}` : `${place(i)}: ${d} × ${b} = ${d * b} (${parts[i]})`,
  );
  lines.push(`${parts.join(" + ")} = ${a * b}`);
  return lines;
}
