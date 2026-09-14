/*
 * プレイ時間の加算 (純関数 — Vitest 対象)。
 * Phaser の update(time, delta) から毎フレーム呼ばれる想定。
 * タブ復帰直後などに delta が数十秒に跳ねることがあるので、1フレーム分の
 * 加算は PLAYTIME_MAX_DELTA_MS で頭打ちにする。
 */

import type { SaveData } from "./save";

export const PLAYTIME_MAX_DELTA_MS = 1000;

/* 0 ≤ delta ≤ PLAYTIME_MAX_DELTA_MS に丸める。NaN/負数は 0 扱い */
export function clampPlaytimeDelta(deltaMs: number): number {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) return 0;
  return Math.min(deltaMs, PLAYTIME_MAX_DELTA_MS);
}

/* 不変更新: 加算後の新しい SaveData を返す */
export function addPlaytime(save: SaveData, deltaMs: number): SaveData {
  const delta = clampPlaytimeDelta(deltaMs);
  if (delta === 0) return save;
  return { ...save, playtimeMs: save.playtimeMs + delta };
}
