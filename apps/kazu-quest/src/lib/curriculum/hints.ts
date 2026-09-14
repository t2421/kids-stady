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
