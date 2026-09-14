/*
 * 表示用の整形 (純関数 — Vitest 対象)。
 * 子ども向けなので ひらがな単位で返す。
 */

const MS_PER_MINUTE = 60_000;
const MINUTES_PER_HOUR = 60;

/* プレイ時間 (ms) → 「Xじかん Yふん」。1時間未満は「Yふん」だけ */
export function formatPlaytime(ms: number): string {
  const safeMs = Number.isFinite(ms) && ms > 0 ? ms : 0;
  const totalMinutes = Math.floor(safeMs / MS_PER_MINUTE);
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  return hours > 0 ? `${hours}じかん ${minutes}ふん` : `${minutes}ふん`;
}
