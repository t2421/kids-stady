/*
 * 第2章のワールド「うみかぜの しま」— 船でしか来られない南の島。
 * 港 P / ミナトス V / ククリ村 v / しおかぜ灯台 L / 九九の塔 W
 */

import type { MapDef } from "../../../types";
import { CH2_WORLD_LEGEND } from "../legends";

export const CH2_WORLD: MapDef = {
  id: "ch2-world",
  name: "うみかぜの しま",
  theme: "grass",
  legend: CH2_WORLD_LEGEND,
  grid: [
    "~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~~~..T......T....~~~~~",
    "~~~L.....*......*...~~~~",
    "~~.=..............T..~~~",
    "~~.=....V==========..~~~",
    "~~.====.=....*....=..~~~",
    "~~.T..=.=..T......=...~~",
    "~~....===....MMMM.=..~~~",
    "~~~P..~~~....MMMM.=...~~",
    "~~~~~.~~..*.......=..~~~",
    "~~~~..........v...=...~~",
    "~~..T....*....=...W..~~~",
    "~~....*.......=..T...~~~",
    "~~~~....T.....=.....~~~~",
    "~~~~~~~~~~~~~~~~~~~~~~~~",
  ],
  encounterTableId: "ch2-world",
  npcs: [
    {
      id: "island-traveler",
      x: 10,
      y: 5,
      art: "villager",
      movement: "static",
      dialog: [
        {
          if: { flag: "c2.bossDefeated", op: "set" },
          pages: ["塔の 魔女を たおしたんだって? しまの みんなが うわさしてるよ!"],
        },
        {
          pages: [
            "ここは うみかぜの しま。",
            "みなみの 塔に インクの魔女が すみついてから、かずが おかしいんだ…",
            "まずは 港町ミナトスに よってみな。",
          ],
        },
      ],
    },
    {
      id: "tower-guard",
      x: 18,
      y: 9,
      art: "villager",
      movement: "static",
      hideIf: { flag: "learned.kukudama", op: "set" },
      dialog: [
        {
          pages: [
            "この さきは 九九の塔。とびらは ぜんぶ 九九の クイズだ。",
            "九九の じゅもん ククダマを おぼえてから いくのが おすすめだぞ。",
            "ミナトスの まなびやで おぼえられる。",
          ],
        },
      ],
    },
  ],
  events: [
    {
      id: "back-to-ship",
      x: 3,
      y: 8,
      trigger: "step",
      commands: [
        {
          type: "choice",
          prompt: "船で カズールの だいちへ もどる?",
          yes: [{ type: "transfer", mapId: "ch1-world", spawn: "port" }],
          no: [],
        },
      ],
    },
    {
      id: "enter-minatos",
      x: 8,
      y: 4,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch2-minatos", spawn: "entrance" }],
    },
    {
      id: "enter-lighthouse",
      x: 3,
      y: 2,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch2-lighthouse", spawn: "entrance" },
      ],
    },
    {
      id: "enter-kukuri",
      x: 14,
      y: 10,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch2-kukuri", spawn: "entrance" }],
    },
    {
      id: "enter-tower",
      x: 18,
      y: 11,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch2-tower-1", spawn: "start" }],
    },
  ],
  spawns: {
    "from-ship": { x: 4, y: 8, facing: "right" },
    "from-minatos": { x: 9, y: 4, facing: "right" },
    "from-lighthouse": { x: 3, y: 3, facing: "down" },
    "from-kukuri": { x: 14, y: 11, facing: "down" },
    "from-tower": { x: 18, y: 10, facing: "up" },
  },
};
