/*
 * エンディング (KQ-22) の純ロジック — Vitest 対象。
 * - markGameCleared: 本編クリアをセーブに確定する (cleared に 6、再開位置は ホシオキの ほこら)
 * - buildEndingSummary: 「あなたの ぼうけん」に流す集計行
 * 表示は game/scenes/EndingScene.ts が行う。
 */

import { getMapDef } from "../content/maps";
import { formatPlaytime } from "./format";
import type { SaveData } from "./save";

/* 本編の最終章。cleared に積むと せいせき の数晶6つ目が点灯する */
export const FINAL_CHAPTER = 6;

/* クリア後の再開位置 (checkpoint + location)。終章 (KQ-30b) の入口もここ */
export const ENDING_CHECKPOINT = { mapId: "ch6-hoshioki-shrine", spawn: "start" } as const;

export interface EndingSummaryRow {
  label: string;
  value: string;
}

/* 数晶の色 (第1章〜第6章)。せいせき の Orb と同じ並び */
export const ORB_COLORS = [0xff6b6b, 0xffa94d, 0xffd93d, 0x3ec46d, 0x4a9dea, 0xb197fc] as const;

/*
 * cleared に最終章を積み、再開位置を ほこら に移す (不変更新)。
 * 位置は spawn 定義から解決するので、マップ側の座標変更に追従する。
 */
export function markGameCleared(save: SaveData): SaveData {
  const map = getMapDef(ENDING_CHECKPOINT.mapId);
  const point = map.spawns[ENDING_CHECKPOINT.spawn] ?? Object.values(map.spawns)[0];
  const cleared = save.chapter.cleared.includes(FINAL_CHAPTER)
    ? save.chapter.cleared
    : [...save.chapter.cleared, FINAL_CHAPTER];
  return {
    ...save,
    chapter: { ...save.chapter, cleared },
    checkpoint: { ...ENDING_CHECKPOINT },
    location: {
      mapId: map.id,
      x: point?.x ?? 1,
      y: point?.y ?? 1,
      facing: point?.facing ?? "down",
    },
  };
}

/* パーティ全員が覚えた呪文の のべ数 */
export function countLearnedSpells(save: SaveData): number {
  return save.party.reduce((sum, m) => sum + m.learnedSpells.length, 0);
}

/*
 * 「あなたの ぼうけん」の行。
 * 戦闘回数はセーブに記録されていない (history は未使用) ので、
 * といた もんだいの数 (正解+不正解) を冒険の量として見せる。
 */
export function buildEndingSummary(save: SaveData): EndingSummaryRow[] {
  return [
    { label: "といた もんだい", value: `${save.totalCorrect + save.totalWrong} もん` },
    { label: "せいかいした かず", value: `${save.totalCorrect} かい` },
    { label: "おぼえた じゅもん", value: `${countLearnedSpells(save)} こ` },
    { label: "あそんだ じかん", value: formatPlaytime(save.playtimeMs) },
  ];
}
