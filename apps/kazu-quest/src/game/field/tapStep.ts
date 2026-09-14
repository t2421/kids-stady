import type { Dir } from "../../lib/save";

/*
 * タップ移動の即応 (KQ-09): pointerdown の時点で「タップしたタイルは勇者から
 * 見てどの方向か」を決め、1歩だけキューする。Phaser 非依存の純関数にして
 * Vitest (tests/tapStep.test.ts) で検証する。
 *
 * - 自分のタイル → null (メニューを開く判定は FieldScene 側)
 * - 斜め → 差の大きい軸を優先。同じなら縦 (readDirection の押し続け判定と同じ)
 */
export function tapStepFor(
  heroX: number,
  heroY: number,
  tileX: number,
  tileY: number,
): Dir | null {
  const dx = tileX - heroX;
  const dy = tileY - heroY;
  if (dx === 0 && dy === 0) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "right" : "left";
  return dy > 0 ? "down" : "up";
}
