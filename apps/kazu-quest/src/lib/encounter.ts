/*
 * ランダムエンカウントの抽選 (純関数 — Vitest 対象)。
 * FieldScene は歩数カウントの保持と戦闘起動だけを行う。
 */

import type { EncounterTable } from "../content/types";
import type { Rng } from "./curriculum/types";
import { randInt } from "./curriculum/types";

/* 次のエンカウントまでの歩数 (最低歩数保証つき) */
export function rollEncounterSteps(table: EncounterTable, rng: Rng): number {
  return randInt(rng, table.stepRange[0], table.stepRange[1]);
}

/* 重み付きで出現グループを選ぶ */
export function pickEncounterGroup(table: EncounterTable, rng: Rng): string[] {
  const sum = table.groups.reduce((s, g) => s + g.weight, 0);
  let roll = rng() * sum;
  for (const group of table.groups) {
    roll -= group.weight;
    if (roll <= 0) return group.monsterIds;
  }
  return table.groups[table.groups.length - 1].monsterIds;
}
