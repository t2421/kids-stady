/*
 * シーンデバッグ用のURL起動 (dev 限定)。
 * /?map=ch1-capital&spawn=west  → タイトルを飛ばしてそのマップから開始
 * /?battle=eraser               → 開始後すぐその敵と戦闘 (カンマ区切りで複数)
 * ビジュアル・ストーリー両方の動作確認をタイトル経由なしで行える。
 */

export interface DebugBoot {
  map?: { mapId: string; spawn?: string };
  battle?: string[];
}

let cached: DebugBoot | null = null;
let battleConsumed = false;

export function getDebugBoot(): DebugBoot {
  if (cached) return cached;
  cached = {};
  if (process.env.NODE_ENV !== "development") return cached;
  if (typeof window === "undefined") return cached;
  const params = new URLSearchParams(window.location.search);
  const mapId = params.get("map");
  if (mapId) {
    cached.map = { mapId, spawn: params.get("spawn") ?? undefined };
  }
  const battle = params.get("battle");
  if (battle) {
    cached.battle = battle.split(",").filter(Boolean);
  }
  return cached;
}

/* 戦闘デバッグは一度だけ発火させる (勝敗後に再突入しない) */
export function consumeDebugBattle(): string[] | null {
  const boot = getDebugBoot();
  if (!boot.battle || battleConsumed) return null;
  battleConsumed = true;
  return boot.battle;
}
