/* 第1章「かずのしずくと はじまりの村」— 小1算数 (設計 A2/A7) */

import type { ChapterDef } from "../../types";
import { CH1_HAJIMARI } from "./maps/hajimari";
import { CH1_KAIDO } from "./maps/kaido";
import { CH1_CAPITAL } from "./maps/capital";
import { CH1_FOREST } from "./maps/forest";
import { CH1_MORIKAGE } from "./maps/morikage";
import { CH1_CAVE, CH1_CAVE_BOSS } from "./maps/cave";

export const CHAPTER1: ChapterDef = {
  id: 1,
  grade: 1,
  title: "かずのしずくと はじまりの村",
  implemented: true,
  startMap: "ch1-hajimari",
  startSpawn: "start",
  maps: [
    CH1_HAJIMARI,
    CH1_KAIDO,
    CH1_CAPITAL,
    CH1_FOREST,
    CH1_MORIKAGE,
    CH1_CAVE,
    CH1_CAVE_BOSS,
  ],
  encounterTables: [],
  spellIds: [
    "hikidama",
    "tashiria",
    "kazoeSlash",
    "hikidaman",
    "tashirian",
    "kurabeShield",
  ],
  flags: {
    "c1.started": "母から王様の呼び出しを聞いた",
    "c1.metKing": "カウント王に謁見し、数晶探索を引き受けた",
    "c1.midboss": "どんぐりの森の でかインクぐも を倒した",
    "c1.forestChest": "森の宝箱を開けた",
    "c1.caveChest": "洞くつの宝箱を開けた",
    "c1.bossDefeated": "幹部イレイサーを倒した",
    "c1.orb1": "数晶・壱を取り戻した",
    "c1.clear": "第1章クリア (王様に報告済み)",
    "learned.hikidama": "ヒキダマ習得 (テスト合格)",
    "learned.tashiria": "タシリア習得 (テスト合格)",
    "learned.kazoeSlash": "かぞえスラッシュ習得 (テスト合格)",
    "learned.hikidaman": "ヒキダマン習得 (テスト合格)",
    "learned.tashirian": "タシリアン習得 (テスト合格)",
    "learned.kurabeShield": "くらべシールド習得 (テスト合格)",
  },
  clearFlag: "c1.clear",
};
