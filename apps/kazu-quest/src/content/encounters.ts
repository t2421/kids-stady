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

ENCOUNTER_TABLES["ch1-kaido"] = {
  id: "ch1-kaido",
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

export function getEncounterTable(id: string): EncounterTable | undefined {
  return ENCOUNTER_TABLES[id];
}
