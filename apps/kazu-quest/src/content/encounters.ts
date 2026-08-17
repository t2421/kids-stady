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

/* ---------- 第3章 ---------- */

ENCOUNTER_TABLES["ch3-desert"] = {
  id: "ch3-desert",
  stepRange: [12, 24],
  groups: [
    { monsterIds: ["sunaKeshigomun"], weight: 3 },
    { monsterIds: ["sunaKeshigomun", "sunanezumi"], weight: 2 },
    { monsterIds: ["cactusKnife"], weight: 3 },
    { monsterIds: ["sasoriCompass"], weight: 2 },
    { monsterIds: ["cactusKnife", "sunaKeshigomun"], weight: 1 },
  ],
};

ENCOUNTER_TABLES["ch3-ruins"] = {
  id: "ch3-ruins",
  stepRange: [10, 20],
  groups: [
    { monsterIds: ["sasoriCompass"], weight: 3 },
    { monsterIds: ["mummyFusen"], weight: 2 },
    { monsterIds: ["sasoriCompass", "sunanezumi"], weight: 2 },
    { monsterIds: ["cactusKnife", "cactusKnife"], weight: 1 },
  ],
};

ENCOUNTER_TABLES["ch3-pyramid"] = {
  id: "ch3-pyramid",
  stepRange: [9, 18],
  groups: [
    { monsterIds: ["mummyFusen"], weight: 3 },
    { monsterIds: ["mummyFusen", "sasoriCompass"], weight: 2 },
    { monsterIds: ["sunanezumi", "sunanezumi"], weight: 2 },
    { monsterIds: ["mummyFusen", "mummyFusen"], weight: 1 },
  ],
};

/* ---------- 第4章 ---------- */

ENCOUNTER_TABLES["ch4-snowfield"] = {
  id: "ch4-snowfield",
  stepRange: [12, 24],
  groups: [
    { monsterIds: ["yukiKeshigomun"], weight: 3 },
    { monsterIds: ["yukiKeshigomun", "kooriBat"], weight: 2 },
    { monsterIds: ["kooriBat", "kooriBat"], weight: 2 },
    { monsterIds: ["yukiDaruman"], weight: 2 },
    { monsterIds: ["monosashiOokami"], weight: 1 },
  ],
};

ENCOUNTER_TABLES["ch4-icecave"] = {
  id: "ch4-icecave",
  stepRange: [10, 20],
  groups: [
    { monsterIds: ["yukiDaruman"], weight: 3 },
    { monsterIds: ["bundokiKani"], weight: 2 },
    { monsterIds: ["yukiDaruman", "kooriBat"], weight: 2 },
    { monsterIds: ["monosashiOokami", "yukiKeshigomun"], weight: 1 },
  ],
};

ENCOUNTER_TABLES["ch4-angle-ruins"] = {
  id: "ch4-angle-ruins",
  stepRange: [9, 18],
  groups: [
    { monsterIds: ["bundokiKani"], weight: 3 },
    { monsterIds: ["monosashiOokami"], weight: 3 },
    { monsterIds: ["bundokiKani", "yukiDaruman"], weight: 2 },
    { monsterIds: ["monosashiOokami", "monosashiOokami"], weight: 1 },
  ],
};

/* ---------- 第5章 ---------- */

ENCOUNTER_TABLES["ch5-field"] = {
  id: "ch5-field",
  stepRange: [12, 24],
  groups: [
    { monsterIds: ["hasuuKeshigomun"], weight: 3 },
    { monsterIds: ["hasuuKeshigomun", "waribikiGhost"], weight: 2 },
    { monsterIds: ["waribikiGhost"], weight: 3 },
    { monsterIds: ["tsuubunSnake"], weight: 2 },
  ],
};

ENCOUNTER_TABLES["ch5-sky"] = {
  id: "ch5-sky",
  stepRange: [10, 20],
  groups: [
    { monsterIds: ["waribikiGhost", "waribikiGhost"], weight: 2 },
    { monsterIds: ["tsuubunSnake"], weight: 3 },
    { monsterIds: ["taisekiCube"], weight: 2 },
    { monsterIds: ["hasuuKeshigomun", "tsuubunSnake"], weight: 1 },
  ],
};

ENCOUNTER_TABLES["ch5-sea"] = {
  id: "ch5-sea",
  stepRange: [10, 20],
  groups: [
    { monsterIds: ["kaiteiKani"], weight: 3 },
    { monsterIds: ["kaiteiKani", "waribikiGhost"], weight: 2 },
    { monsterIds: ["taisekiCube"], weight: 2 },
    { monsterIds: ["kaiteiKani", "kaiteiKani"], weight: 1 },
  ],
};

ENCOUNTER_TABLES["ch5-castle"] = {
  id: "ch5-castle",
  stepRange: [9, 18],
  groups: [
    { monsterIds: ["tsuubunSnake", "taisekiCube"], weight: 2 },
    { monsterIds: ["waribikiGhost", "waribikiGhost", "hasuuKeshigomun"], weight: 2 },
    { monsterIds: ["taisekiCube", "taisekiCube"], weight: 2 },
    { monsterIds: ["kaiteiKani", "tsuubunSnake"], weight: 1 },
  ],
};

export function getEncounterTable(id: string): EncounterTable | undefined {
  return ENCOUNTER_TABLES[id];
}
