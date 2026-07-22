/* どんぐりの森 — 中ボス でかインクぐも と宝箱 (設計 A7 ビート5) */

import type { MapDef } from "../../../types";
import { FIELD_LEGEND } from "../legends";

export const CH1_FOREST: MapDef = {
  id: "ch1-forest",
  name: "どんぐりの もり",
  theme: "forest",
  legend: FIELD_LEGEND,
  grid: [
    "TTTTTTTTT=TTTTTTTTTT",
    "T...*....=.....T...T",
    "T..***...=....***..T",
    "TT..*....=.....*..TT",
    "T........=........TT",
    "TT..T....=...T....TT",
    "T........=.......~~T",
    "T..***...=..***..~~T",
    "T..***...=..***....T",
    "TT.......=........TT",
    "T....T...=...T.....T",
    "T........=.........T",
    "TTTTTTTTT=TTTTTTTTTT",
  ],
  encounterTableId: "ch1-forest",
  npcs: [],
  events: [
    {
      id: "to-capital",
      x: 9,
      y: 0,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-capital", spawn: "from-forest" }],
    },
    {
      id: "midboss",
      x: 9,
      y: 6,
      trigger: "step",
      onceFlag: "c1.midboss",
      commands: [
        {
          type: "message",
          pages: ["みちを ふさぐように でかい かげが あらわれた!"],
        },
        { type: "battle", monsterIds: ["dekaInkugumo"], boss: true },
        { type: "message", pages: ["みちが とおれるように なった!"] },
      ],
    },
    {
      id: "forest-chest",
      x: 14,
      y: 8,
      trigger: "inspect",
      onceFlag: "c1.forestChest",
      art: "chest",
      commands: [
        { type: "message", pages: ["たからばこを あけた!", "やくそうを 3つ てにいれた!"] },
        { type: "giveItem", itemId: "yakusou", count: 3 },
      ],
    },
    {
      id: "to-morikage",
      x: 9,
      y: 12,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-morikage", spawn: "north" }],
    },
  ],
  spawns: {
    north: { x: 9, y: 1, facing: "down" },
    south: { x: 9, y: 11, facing: "up" },
  },
};
