/*
 * 既定の段階ヒント (LP-03)。生成器ごとに手書きしていない単元向けに、
 * explain から機械的に3段ヒントを作る。手書きした単元はこれを使わず
 * 独自の [string, string, string] を返す。
 */

const GENERIC_NUDGE = "じゅんばんに かんがえてみよう";

/*
 * [0] 考え方 (まだ何も教えない一般的な声かけ)
 * [1] 途中まで (explain の最初の1行。無ければ考え方をくり返す)
 * [2] 直前 (explain を全部つなげる。答えのすぐ手前まで見せる)
 */
export function genericHints(explain: readonly string[]): [string, string, string] {
  const stage1 = GENERIC_NUDGE;
  const stage2 = explain[0] ?? GENERIC_NUDGE;
  const stage3 = explain.length > 0 ? explain.join(" ") : GENERIC_NUDGE;
  return [stage1, stage2, stage3];
}

/*
 * ヒントから こたえを かくす (LP-03 の「[2] 直前 = 答えのすぐ手前まで」を守る)。
 *
 * genericHints は explain を つなげるので、explain の最後の行 (「こたえは 8」
 * 「4 × 2 = 8」) がそのまま ヒントに入り、こたえが画面に出ていた。とくに
 * レッスンの穴埋め (LessonFaded) は hints[2] を ずっと出しっぱなしにするので、
 * こたえを見ながら選ぶだけの練習に なっていた。
 *
 * 規則は2つだけ (広く かくすと 式や単位が こわれるので わざと せまくする):
 *   1. どの段でも「= こたえ」は「= ?」にする        例 1じ + 3じかん = 4じ → = ?じ
 *   2. 最後の段は、1 が 当たらなければ 最後に出てくる数が こたえのとき ? にする
 *                                                   例 くらいを そろえて 0.2 → ?
 * こたえが 問題文に そのまま出ている数なら (大小くらべ 等) かくすと
 * 問題の数まで消えてしまうので 何もしない。
 */
const NUMBER_TOKEN = /(?<![\d./])\d+(?:[./]\d+)?(?![\d./])/g;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}

function standalone(answer: string): RegExp {
  return new RegExp(`(?<![\\d./])${escapeRegExp(answer)}(?![\\d./])`);
}

function maskHint(hint: string, answer: string, isLast: boolean): string {
  const afterEquals = new RegExp(`(=\\s*)${escapeRegExp(answer)}(?![\\d./])`, "g");
  const masked = hint.replace(afterEquals, "$1?");
  if (!isLast) return masked;
  /*
   * 最後に出てくる数が こたえなら かくす。ただし すでに かくした「?」より
   * 前にある数は 式の一部 (「4 ÷ 2 = ?cm」の 2) なので さわらない —
   * 「18 - 14 = ? 18 ÷ 7 = 2 あまり 4」の 4 のように、? の あとで
   * もう一度 こたえを言っている ところだけを かくす
   */
  const tokens = [...masked.matchAll(NUMBER_TOKEN)];
  const last = tokens[tokens.length - 1];
  if (!last || last[0] !== answer || last.index === undefined) return masked;
  if (last.index < masked.lastIndexOf("?")) return masked;
  return masked.slice(0, last.index) + "?" + masked.slice(last.index + last[0].length);
}

export function maskAnswerInHints(
  hints: readonly [string, string, string],
  answer: string,
  problemText: string,
): [string, string, string] {
  if (answer === "" || standalone(answer).test(problemText)) return [...hints];
  return [
    maskHint(hints[0], answer, false),
    maskHint(hints[1], answer, false),
    maskHint(hints[2], answer, true),
  ];
}
