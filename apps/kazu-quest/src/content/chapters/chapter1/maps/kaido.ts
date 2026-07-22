/* 街道 — ハジマリ村と王都をつなぐ野原 (最初のエンカウント地帯) */

import type { MapDef } from "../../../types";
import { FIELD_LEGEND } from "../legends";

export const CH1_KAIDO: MapDef = {
  id: "ch1-kaido",
  name: "カズールかいどう",
  theme: "grass",
  legend: FIELD_LEGEND,
  grid: [
    "TTTTTTTTTTTTTTTTTTTT",
    "T........TT........T",
    "T..***...TT...***..T",
    "T..***........***..T",
    "T........**.......TT",
    "T.~~.....**........T",
    "T.~~...............T",
    "=========**=========",
    "=========**=========",
    "T......***.........T",
    "T..T...***....~~...T",
    "T..T..........~~...T",
    "TTTTTTTTTTTTTTTTTTTT",
  ],
  encounterTableId: "ch1-kaido",
  npcs: [
    {
      id: "traveler",
      x: 4,
      y: 8,
      art: "villager",
      movement: "static",
      dialog: [
        {
          pages: [
            "この さきが おうと カズールだよ。",
            "モンスターが でるから きをつけて!",
            "こまったら 「にげる」でも いいんだよ。",
          ],
        },
      ],
    },
  ],
  events: [
    {
      id: "to-hajimari-1",
      x: 0,
      y: 7,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-hajimari", spawn: "from-kaido" }],
    },
    {
      id: "to-hajimari-2",
      x: 0,
      y: 8,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-hajimari", spawn: "from-kaido" }],
    },
    {
      id: "to-capital-1",
      x: 19,
      y: 7,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-capital", spawn: "west" }],
    },
    {
      id: "to-capital-2",
      x: 19,
      y: 8,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-capital", spawn: "west" }],
    },
  ],
  spawns: {
    west: { x: 1, y: 7, facing: "right" },
    east: { x: 18, y: 7, facing: "left" },
  },
};
