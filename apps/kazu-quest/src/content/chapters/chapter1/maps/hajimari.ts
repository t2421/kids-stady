/* ハジマリ村 — 物語の始まり (設計 A7 ビート0-1)。建物は扉から中に入る */

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
    "T..RRRR....RRRR....T",
    "T..WWDW....WWDW....T",
    "T...==......==.....T",
    "T...==......=......T",
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
      id: "chief",
      x: 11,
      y: 8,
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
      id: "to-home",
      x: 5,
      y: 4,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-hajimari-home", spawn: "start" }],
    },
    {
      id: "to-neighbor",
      x: 13,
      y: 4,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch1-hajimari-neighbor", spawn: "start" },
      ],
    },
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
    "from-home": { x: 5, y: 5, facing: "down" },
    "from-neighbor": { x: 13, y: 5, facing: "down" },
    "from-kaido": { x: 18, y: 8, facing: "left" },
  },
};
