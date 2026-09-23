/*
 * 戦闘で こたえる じかん (純関数)。
 *
 * 通常攻撃は 10秒、呪文は 呪文ごとの秒数で こたえる。小1 の子には 10秒は
 * みじかすぎることがある (UX 監査) ので、せってい で ゆっくり (1.6倍) /
 * なし (タイマーを出さない) を えらべる。学年を 小1・小2 に したときの 既定は ゆっくり。
 *
 * 「かいしん」(はやく こたえると 強い) は 設定に よらず もとの秒数の半分で判定する —
 * ゆっくり・なし を えらんでも かいしんが 出やすく ならない / 出にくく ならない。
 */

import type { AnswerTimeMode } from "./save";

export const SLOW_MULTIPLIER = 1.6;

/* 画面に出す制限時間。null = タイマーなし */
export function effectiveTimeLimit(baseMs: number, mode: AnswerTimeMode): number | null {
  if (mode === "off") return null;
  if (mode === "slow") return Math.round(baseMs * SLOW_MULTIPLIER);
  return baseMs;
}

/* 学年を えらんだときの おすすめ */
export function defaultAnswerTimeFor(schoolGrade: number | null): AnswerTimeMode {
  return schoolGrade !== null && schoolGrade <= 2 ? "slow" : "normal";
}

export const ANSWER_TIME_LABELS: Record<AnswerTimeMode, string> = {
  normal: "ふつう",
  slow: "ゆっくり",
  off: "じかん なし",
};
