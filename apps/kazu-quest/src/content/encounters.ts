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

export function getEncounterTable(id: string): EncounterTable | undefined {
  return ENCOUNTER_TABLES[id];
}
