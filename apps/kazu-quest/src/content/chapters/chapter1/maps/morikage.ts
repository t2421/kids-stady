/* モリカゲ村 — くりさがり呪文のストーリーゲート。まなびや・宿は扉から中へ */

import type { MapDef } from "../../../types";
import { VILLAGE_LEGEND } from "../legends";

export const CH1_MORIKAGE: MapDef = {
  id: "ch1-morikage",
  name: "モリカゲむら",
  theme: "grass",
  legend: VILLAGE_LEGEND,
  grid: [
    "TTTTTTTTT=TTTTTTTTTT",
    "T..f.....=......y..T",
    "T..[RR]..=..[RR]...T",
    "T..{__}..=..{__}...T",
    "T..WDoW..=..WoDW...T",
    "T...=....=....=....T",
    "T...======....=....T",
    "T...y....==========T",
    "T.~~.....=.......x.=",
    "T.~~.....=.y.......T",
    "T..f.....=....T..u.T",
    "T........=..y......T",
    "TTTTTTTTT=TTTTTTTTTT",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "bridge-guard",
      x: 19,
      y: 8,
      art: "villager",
      movement: "static",
      hideIf: { flag: "learned.hikidaman", op: "set" },
      dialog: [
        {
          pages: [
            "この さきは かぞえの どうくつ。",
            "くりさがりの じゅもん ヒキダマンが ないと きけんだ!",
            "まなびやで テストに ごうかく してきな。",
          ],
        },
      ],
    },
    {
      id: "villager2",
      x: 6,
      y: 8,
      art: "villager",
      movement: "static",
      dialog: [
        {
          if: { flag: "learned.hikidaman", op: "set" },
          pages: ["ヒキダマンを おぼえたんだね! どうくつは ひがしだよ。"],
        },
        {
          pages: ["どうくつの モンスターは かたいから じゅもんが ひつようだよ。"],
        },
      ],
    },
  ],
  events: [
    {
      id: "to-manabiya",
      x: 4,
      y: 4,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch1-morikage-manabiya", spawn: "start" },
      ],
    },
    {
      id: "to-inn",
      x: 14,
      y: 4,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch1-morikage-inn", spawn: "start" },
      ],
    },
    {
      id: "to-forest",
      x: 9,
      y: 0,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-forest", spawn: "south" }],
    },
    {
      id: "to-cave-1",
      x: 19,
      y: 8,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-cave", spawn: "west" }],
    },
  ],
  spawns: {
    north: { x: 9, y: 1, facing: "down" },
    "from-cave": { x: 18, y: 8, facing: "left" },
    "from-manabiya": { x: 4, y: 5, facing: "down" },
    "from-inn": { x: 14, y: 5, facing: "down" },
  },
};
