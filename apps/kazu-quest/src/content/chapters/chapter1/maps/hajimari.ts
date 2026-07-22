/* ハジマリ村 — 物語の始まり (設計 A7 ビート0-1) */

import type { MapDef } from "../../../types";
import { VILLAGE_LEGEND } from "../legends";

export const CH1_HAJIMARI: MapDef = {
  id: "ch1-hajimari",
  name: "ハジマリむら",
  theme: "grass",
  legend: VILLAGE_LEGEND,
  grid: [
    "TTTTTTTTTTTTTTTTTTTT",
    "T..................T",
    "T..RRRR....RRRR....T",
    "T..WWWW....WWWW....T",
    "T..WFFW....WFFW....T",
    "T..WFDW....WFDW....T",
    "T...=.......=......T",
    "T...=========......T",
    "T.......=..........=",
    "T.......=..........=",
    "T..~~...=......T...T",
    "T..~~..............T",
    "TTTTTTTTTTTTTTTTTTTT",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "mother",
      x: 4,
      y: 4,
      art: "mother",
      movement: "static",
      dialog: [
        {
          if: { flag: "c1.metKing", op: "set" },
          pages: ["きをつけて いくのよ。", "おうえん してるからね!"],
        },
        {
          pages: [
            "おはよう! 10さいの たんじょうび おめでとう!",
            "たいへん! カズールの おうさまが あなたを よんでいるの。",
            "むらの ひがしの みちから おうとに いけるわ。",
          ],
          then: [{ type: "setFlag", flag: "c1.started" }],
        },
      ],
    },
    {
      id: "chief",
      x: 12,
      y: 6,
      art: "villager",
      movement: "static",
      dialog: [
        {
          pages: [
            "せかいから 「かず」が きえはじめて こまっておるんじゃ…",
            "ケシケシぐんだんの しわざ らしい。",
          ],
        },
      ],
    },
  ],
  events: [
    {
      id: "to-kaido-1",
      x: 19,
      y: 8,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-kaido", spawn: "west" }],
    },
    {
      id: "to-kaido-2",
      x: 19,
      y: 9,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-kaido", spawn: "west" }],
    },
  ],
  spawns: {
    start: { x: 5, y: 5, facing: "down" },
    "from-kaido": { x: 18, y: 8, facing: "left" },
  },
};
