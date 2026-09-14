/*
 * どんぐりの森 — 中ボス でかインクぐも と宝箱 (設計 A7 ビート5)。
 * 山脈をつらぬく唯一の通り道: 北口・南口ともワールドマップへ出る。
 */

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
    "T..f.....=....y...TT",
    "TT..T....=...T....TT",
    "T........=.......~~T",
    "T..***...=..***..~~T",
    "T..***...=..***....T",
    "TT.......=........TT",
    "T....T...=...T..f..T",
    "T.y......=.........T",
    "TTTTTTTTT=TTTTTTTTTT",
  ],
  encounterTableId: "ch1-forest",
  npcs: [],
  events: [
    {
      id: "to-world-north",
      x: 9,
      y: 0,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch1-world", spawn: "forest-north" },
      ],
    },
    {
      id: "forest-level-sign",
      x: 10,
      y: 5,
      trigger: "inspect",
      art: "signpost",
      commands: [{ type: "levelSign", level: 3 }],
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
      id: "forest-locked-chest",
      x: 1,
      y: 1,
      trigger: "inspect",
      art: "chest",
      onceFlag: "c1.lockedChestForest",
      commands: [
        {
          type: "message",
          pages: ["すうじの カギが かかっている。もんだいに こたえると あく。"],
        },
        {
          type: "quiz",
          skillId: "g1_count",
          onCorrect: [
            { type: "message", pages: ["カチッ! カギが あいた!", "かわのたてを てにいれた!"] },
            { type: "giveItem", itemId: "kawaNoTate" },
            { type: "setFlag", flag: "c1.lockedChestForest" },
          ],
          onWrong: [
            {
              type: "message",
              pages: ["カギは あかなかった。もういちど ちょうせん できる。"],
            },
            /* transfer は残りのコマンドを打ち切る = onceFlag を消費せず再挑戦できる (宝箱の前に戻る) */
            { type: "transfer", mapId: "ch1-forest", spawn: "locked-chest" },
          ],
        },
      ],
    },
    {
      id: "to-world-south",
      x: 9,
      y: 12,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch1-world", spawn: "forest-south" },
      ],
    },
  ],
  spawns: {
    north: { x: 9, y: 1, facing: "down" },
    south: { x: 9, y: 11, facing: "up" },
    /* すうじのカギつき宝箱の前 (不正解の再挑戦用) */
    "locked-chest": { x: 1, y: 2, facing: "up" },
  },
};
