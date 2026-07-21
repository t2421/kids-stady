/* 問題生成の共通ユーティリティ */

export function shuffle<T>(arr: readonly T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/*
 * 正解 + まぎらわしい誤答2つの3択を作る。
 * candidates はまぎらわしい順に並べる (±1、くりあがり忘れ ±10 など)。
 * 範囲外・重複は除き、足りなければ正解の近くから補う。
 */
export function uniqueChoices(
  answer: number,
  candidates: number[],
  min: number,
  max: number,
): [string, string, string] {
  const picked: number[] = [];
  const pool = shuffle(candidates);
  for (const c of pool) {
    if (picked.length >= 2) break;
    if (!Number.isInteger(c) || c < min || c > max) continue;
    if (c === answer || picked.includes(c)) continue;
    picked.push(c);
  }
  /* 保険: 候補が範囲外だらけのときは近傍から埋める */
  for (let d = 1; picked.length < 2 && d <= max - min; d++) {
    for (const c of [answer - d, answer + d]) {
      if (picked.length >= 2) break;
      if (c < min || c > max || c === answer || picked.includes(c)) continue;
      picked.push(c);
    }
  }
  const three = shuffle([answer, ...picked.slice(0, 2)]);
  return [String(three[0]), String(three[1]), String(three[2])];
}
