/*
 * 単元の状態 (mastery) が使う「現在時刻」。通常は Date.now() と同じだが、
 * E2E/テストでは advanceClock でオフセットを進めて間隔復習の期日到来を
 * 待たずに検証できるようにする。mastery 関連の処理は必ずここの now() を呼び、
 * Date.now() を直接使わないこと (テストで時間を早送りできなくなる)。
 */

let offsetMs = 0;

export function now(): number {
  return Date.now() + offsetMs;
}

/* テスト/E2E 専用: 時刻を ms 進める (負値で戻すことも可能) */
export function advanceClock(ms: number): void {
  offsetMs += ms;
}

/* テスト/E2E 専用: オフセットを 0 に戻す */
export function resetClock(): void {
  offsetMs = 0;
}
