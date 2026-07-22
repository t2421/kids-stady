/* 王都カズール — 城・宿・道具屋・ほこらは扉から中に入る (設計変更 2026-07-22) */

import type { MapDef } from "../../../types";
import { VILLAGE_LEGEND } from "../legends";

export const CH1_CAPITAL: MapDef = {
  id: "ch1-capital",
  name: "おうと カズール",
  theme: "grass",
  legend: VILLAGE_LEGEND,
  grid: [
    "TTTTTTTTTTTTTTTTTTTT",
    "T....MMMMMMMM......T",
    "T....#+B##B+#.f.y..T",
    "T....##+##+##.[RR].T",
    "T....####GH##.WIDW.T",
    "T..f.....==....f...T",
    "T..[RR]..==.[RR]...T",
    "T..{__}..==.{__}...T",
    "T..WSDW..==.WoDW...T",
    "=.f..=...==...=..y.T",
    "T...============u..T",
    "T.f......==F...y...T",
    "T...x....==....x...T",
    "TTTTTTTTT==TTTTTTTTT",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "guard",
      x: 11,
      y: 5,
      art: "villager",
      movement: "static",
      dialog: [
        {
          if: { flag: "c1.metKing", op: "set" },
          pages: ["みなみの もんの さきが どんぐりの もりだ。きをつけてな!"],
        },
        {
          pages: [
            "ここは おうと カズール。",
            "おしろで おうさまが まっているぞ。きたの とびらだ。",
          ],
        },
      ],
    },
  ],
  events: [
    {
      id: "to-castle",
      x: 9,
      y: 4,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch1-capital-castle", spawn: "start" },
      ],
    },
    {
      id: "to-castle-2",
      x: 10,
      y: 4,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch1-capital-castle", spawn: "start" },
      ],
    },
    {
      id: "to-inn",
      x: 16,
      y: 4,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-capital-inn", spawn: "start" }],
    },
    {
      id: "to-shop",
      x: 5,
      y: 8,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-capital-shop", spawn: "start" }],
    },
    {
      id: "to-shrine",
      x: 14,
      y: 8,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch1-capital-shrine", spawn: "start" },
      ],
    },
    {
      id: "to-kaido",
      x: 0,
      y: 9,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-kaido", spawn: "east" }],
    },
    {
      id: "to-forest",
      x: 9,
      y: 13,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-forest", spawn: "north" }],
    },
    {
      id: "to-forest-2",
      x: 10,
      y: 13,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-forest", spawn: "north" }],
    },
  ],
  spawns: {
    west: { x: 1, y: 9, facing: "right" },
    "from-forest": { x: 9, y: 12, facing: "up" },
    "from-castle": { x: 9, y: 5, facing: "down" },
    "from-inn": { x: 16, y: 5, facing: "down" },
    "from-shop": { x: 5, y: 9, facing: "down" },
    "from-shrine": { x: 14, y: 9, facing: "down" },
  },
};
