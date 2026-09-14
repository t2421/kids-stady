/*
 * テンキー入力の答え合わせ (KQ-12)。React / DOM に依存しない純関数。
 *
 * Problem.answer は生成側 (numbers.ts の dec / frac) で「同じ数は同じ文字列」に
 * 揃っている: 整数 "12"、小数 "0.6" (末尾 0 なし)、分数 "3/4"。単位は付かない。
 * 子どもの入力にはブレがあるので、こちらで expected と同じ表記に寄せてから比べる:
 *   - 全角 → 半角 (１２．５ → 12.5、３／４ → 3/4)
 *   - 空白の除去、単位 (cm, kg, こ …) の切り落とし
 *   - 先頭 0 の除去 ("007" → "7"、".5" → "0.5"、"0.50" → "0.5")
 * 分数と小数は値ではなく表記で比べる (分数問題は分数で、小数問題は小数で答えさせる —
 * 2/4 と 1/2 も別扱い。約分まで含めて問うため)。
 */

const FULLWIDTH_DIGIT_BASE = "０".charCodeAt(0);
const ASCII_DIGIT_BASE = "0".charCodeAt(0);

/* 全角数字・記号を半角に。他の文字はそのまま */
export function toHalfWidth(s: string): string {
  return Array.from(s)
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= FULLWIDTH_DIGIT_BASE && code <= FULLWIDTH_DIGIT_BASE + 9) {
        return String.fromCharCode(ASCII_DIGIT_BASE + (code - FULLWIDTH_DIGIT_BASE));
      }
      switch (ch) {
        case "．":
        case "。":
          return ".";
        case "／":
          return "/";
        case "－":
        case "ー":
        case "−":
          return "-";
        case "　":
          return " ";
        default:
          return ch;
      }
    })
    .join("");
}

/* 数として読める部分 (先頭の -、数字、.、/) だけを残し、単位などの末尾を落とす */
function stripUnit(s: string): string {
  const m = /^(-?[0-9./]+)/.exec(s);
  return m ? m[1] : "";
}

/* 整数部の先頭 0 を落とす ("007" → "7"、"000" → "0"、"" → "0") */
function trimLeadingZeros(intPart: string): string {
  const trimmed = intPart.replace(/^0+/, "");
  return trimmed === "" ? "0" : trimmed;
}

/* 小数: 整数部の先頭 0 と小数部の末尾 0 を落とす (".5" → "0.5"、"2.0" → "2") */
function normalizeDecimal(s: string): string {
  const [intPart, fracPart = ""] = s.split(".");
  const frac = fracPart.replace(/0+$/, "");
  const int = trimLeadingZeros(intPart);
  return frac === "" ? int : `${int}.${frac}`;
}

/* 分数: 分子・分母それぞれの先頭 0 を落とす。約分はしない */
function normalizeFraction(s: string): string {
  const [n, d] = s.split("/");
  return `${normalizeNumber(n)}/${normalizeNumber(d)}`;
}

function normalizeNumber(s: string): string {
  const negative = s.startsWith("-");
  const body = negative ? s.slice(1) : s;
  const normalized = normalizeDecimal(body);
  return negative && normalized !== "0" ? `-${normalized}` : normalized;
}

/* 数値表記かどうか (整数 / 小数 / 分数)。それ以外は正規化せず空にする */
const NUMERIC = /^-?(\d+(\.\d*)?|\.\d+)(\/\d+)?$/;

/*
 * 入力を expected と同じ表記へ寄せる。
 * 数として読めない入力は "" を返す (空欄も "")。
 * expected は「単位なしの答え」以外の形が来ることも想定し、入力側に単位が
 * 混ざっていれば落とす (expected 側に単位がある問題は現状ない)。
 */
export function normalizeAnswer(input: string, expected: string): string {
  const half = toHalfWidth(input).replace(/\s+/g, "");
  const expectedHalf = toHalfWidth(expected).replace(/\s+/g, "");
  const expectedHasUnit = stripUnit(expectedHalf) !== expectedHalf;
  const numeric = expectedHasUnit ? half : stripUnit(half);
  if (!NUMERIC.test(numeric)) return "";
  return numeric.includes("/") ? normalizeFraction(numeric) : normalizeNumber(numeric);
}

/* 正解判定。空欄・読めない入力は常に不正解 */
export function isAnswerCorrect(input: string, expected: string): boolean {
  const got = normalizeAnswer(input, expected);
  if (got === "") return false;
  return got === normalizeAnswer(expected, expected);
}

/* テンキーで使う記号のうち、この答えに必要なもの (不要なキーは無効化して迷わせない) */
export function answerNeedsKey(expected: string, key: "." | "/" | "-"): boolean {
  return toHalfWidth(expected).includes(key);
}
