/*
 * 空中庭園 — 雲の上の にわ。おくの 花だんに 「星のかぎ」が ねむる。
 * 番人 「くもの ばんじん」を たおすと かぎが 手に入る。
 */

import type { MapDef } from "../../../types";
import { CH5_SKY_LEGEND } from "../legends";

export const CH5_SKY_1: MapDef = {
  id: "ch5-sky-1",
  name: "くうちゅう ていえん",
  theme: "grass",
  legend: CH5_SKY_LEGEND,
  grid: [
    "WWWWWWDWWWWWWW",
    "WSSS%%%%%%SSSW",
    "WShS%%hh%%ShSW",
    "WSS%%%%%%%%SSW",
    "WfSS%%hh%%SSyW",
    "WSSS%%%%%%SSSW",
    "WShSSS%%SSShSW",
    "WSSSSS%%SSSSSW",
    "WSSSSS%%SSSSSW",
    "WWWWWWDWWWWWWW",
  ],
  encounterTableId: "ch5-sky",
  npcs: [],
  events: [
    {
      id: "sky1-out",
      x: 6,
      y: 9,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch5-world", spawn: "from-sky" }],
    },
    {
      id: "sky1-chest",
      x: 2,
      y: 8,
      trigger: "inspect",
      art: "chest",
      onceFlag: "c5.skyChest",
      commands: [
        {
          type: "message",
          pages: ["雲に うもれた 宝箱だ!", "せいなるしずくを 3つ てにいれた!"],
        },
        { type: "giveItem", itemId: "seiNoShizuku", count: 3 },
      ],
    },
    {
      id: "sky1-in",
      x: 6,
      y: 0,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch5-sky-top", spawn: "entrance" }],
    },
  ],
  spawns: {
    entrance: { x: 6, y: 8, facing: "up" },
    "from-inner": { x: 6, y: 1, facing: "down" },
  },
};

export const CH5_SKY_TOP: MapDef = {
  id: "ch5-sky-top",
  name: "ていえんの おくにわ",
  theme: "grass",
  legend: CH5_SKY_LEGEND,
  grid: [
    "WWWWWWWWWWWWWW",
    "WSSSyyffyySSSW",
    "WShSSSSSSSShSW",
    "WSSSSSSSSSSSSW",
    "WSSShSSSShSSSW",
    "WSSSSSSSSSSSSW",
    "WShSSSSSSSShSW",
    "WSSSSSSSSSSSSW",
    "WWWWWWDWWWWWWW",
  ],
  encounterTableId: null,
  npcs: [],
  events: [
    {
      id: "skytop-back",
      x: 6,
      y: 8,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch5-sky-1", spawn: "from-inner" }],
    },
    {
      id: "sky-top-level-sign",
      x: 5,
      y: 7,
      trigger: "inspect",
      art: "signpost",
      commands: [{ type: "levelSign", level: 29 }],
    },
    {
      id: "sky-guardian",
      x: 6,
      y: 4,
      trigger: "step",
      onceFlag: "c5.skyKey",
      commands: [
        {
          type: "message",
          pages: [
            "花だんの おくに 星の かたちの かぎが ひかっている!",
            "とろうと すると、雲が むくむくと もりあがった…",
            "「くもの ばんじん」が たちふさがった!",
          ],
        },
        { type: "battle", monsterIds: ["kumoNoBanjin"], boss: true },
        {
          type: "message",
          pages: [
            "ばんじんは 雲に もどって きえた。",
            "「星のかぎ」を てにいれた!",
            "これで 海に もぐれる。みなみの 海底神殿へ いこう!",
          ],
        },
      ],
    },
  ],
  spawns: { entrance: { x: 6, y: 7, facing: "up" } },
};
