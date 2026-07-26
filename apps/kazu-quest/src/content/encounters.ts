/*
 * エンカウントテーブルの索引。MapDef.encounterTableId から参照される。
 */

import type { EncounterTable } from "./types";

export const ENCOUNTER_TABLES: Record<string, EncounterTable> = {
  "dev-plains": {
    id: "dev-plains",
    /* 最低歩数保証つきの低頻度 (子供向け設計 A3) */
    stepRange: [10, 22],
    groups: [
      { monsterIds: ["keshigomun"], weight: 3 },
      { monsterIds: ["keshigomun", "keshigomun"], weight: 2 },
      { monsterIds: ["inkugumo"], weight: 2 },
      { monsterIds: ["keshigomun", "kazunezumi"], weight: 1 },
    ],
  },
};

/* ワールドマップ (町・城の外) の雑魚テーブル */
ENCOUNTER_TABLES["ch1-world"] = {
  id: "ch1-world",
  stepRange: [12, 24],
  groups: [
    { monsterIds: ["keshigomun"], weight: 3 },
    { monsterIds: ["keshigomun", "keshigomun"], weight: 2 },
    { monsterIds: ["inkugumo"], weight: 2 },
    { monsterIds: ["kazunezumi"], weight: 2 },
  ],
};

ENCOUNTER_TABLES["ch1-forest"] = {
  id: "ch1-forest",
  stepRange: [10, 20],
  groups: [
    { monsterIds: ["inkugumo"], weight: 3 },
    { monsterIds: ["mojibakeBat"], weight: 3 },
    { monsterIds: ["keshigomun", "inkugumo"], weight: 2 },
    { monsterIds: ["togeImomushi"], weight: 1 },
  ],
};

ENCOUNTER_TABLES["ch1-cave"] = {
  id: "ch1-cave",
  stepRange: [9, 18],
  groups: [
    { monsterIds: ["mojibakeBat"], weight: 3 },
    { monsterIds: ["togeImomushi"], weight: 2 },
    { monsterIds: ["mojibakeBat", "keshigomun"], weight: 2 },
    { monsterIds: ["togeImomushi", "mojibakeBat"], weight: 1 },
  ],
};

/* ---------- 第2章 ---------- */

ENCOUNTER_TABLES["ch2-world"] = {
  id: "ch2-world",
  stepRange: [12, 24],
  groups: [
    { monsterIds: ["awaKeshigomun"], weight: 3 },
    { monsterIds: ["awaKeshigomun", "awaKeshigomun"], weight: 2 },
    { monsterIds: ["inkgani"], weight: 3 },
    { monsterIds: ["inkgani", "awaKeshigomun"], weight: 2 },
  ],
};

ENCOUNTER_TABLES["ch2-lighthouse"] = {
  id: "ch2-lighthouse",
  stepRange: [10, 20],
  groups: [
    { monsterIds: ["inkgani"], weight: 3 },
    { monsterIds: ["mojibakeBat", "awaKeshigomun"], weight: 2 },
    { monsterIds: ["inkgani", "inkgani"], weight: 1 },
  ],
};

ENCOUNTER_TABLES["ch2-tower"] = {
  id: "ch2-tower",
  stepRange: [9, 18],
  groups: [
    { monsterIds: ["shuseiekin"], weight: 3 },
    { monsterIds: ["awaKeshigomun", "shuseiekin"], weight: 2 },
    { monsterIds: ["mojibakeBat", "mojibakeBat"], weight: 2 },
    { monsterIds: ["shuseiekin", "shuseiekin"], weight: 1 },
  ],
};

export function getEncounterTable(id: string): EncounterTable | undefined {
  return ENCOUNTER_TABLES[id];
}
