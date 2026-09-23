/*
 * 論理解像度の決め方 (Phaser 非依存 — tests/viewport.test.ts)。main.ts の説明を参照。
 * 幅は 960 固定、高さは 画面の縦横比に合わせて 540 (16:9) 〜 720 (4:3)。
 */

export const GAME_WIDTH = 960;
export const MIN_GAME_HEIGHT = 540;
export const MAX_GAME_HEIGHT = 720;

export function gameHeightForViewport(width: number, height: number): number {
  if (!(width > 0) || !(height > 0)) return MIN_GAME_HEIGHT;
  const fitted = (GAME_WIDTH * height) / width;
  const clamped = Math.min(MAX_GAME_HEIGHT, Math.max(MIN_GAME_HEIGHT, fitted));
  /* 偶数に そろえる (中央寄せの 半ピクセルで ドット絵が にじまないように) */
  return Math.round(clamped / 2) * 2;
}
