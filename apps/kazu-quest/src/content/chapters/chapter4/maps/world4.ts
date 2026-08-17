/*
 * 第4章のワールド「メジャーリア雪原」— 船で 西の港に着く。
 * 計測の都メジャーリア C / 雪村コゴエ V / 氷の洞くつ O / 角度の遺跡 A。
 */

import type { MapDef } from "../../../types";
import { CH4_WORLD_LEGEND } from "../legends";

export const CH4_WORLD: MapDef = {
  id: "ch4-world",
  name: "メジャーリア せつげん",
  theme: "snow",
  legend: CH4_WORLD_LEGEND,
  grid: [
    "~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~........**......TT......~",
    "~..T..................r..~",
    "~......=============.MMM.~",
    "~......=C=.........=A.MM.~",
    "~..**..=...........=..MM.~",
    "~......=...**......=...T.~",
    "~=======............=....~",
    "~......=............=....~",
    "~......=============.....~",
    "~......=...........=.....~",
    "~......=...........=O....~",
    "~.V=====...........=.....~",
    "~....r.........T.........~",
    "~..**........r...........~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~",
  ],
  encounterTableId: "ch4-snowfield",
  npcs: [
    {
      id: "north-captain",
      x: 2,
      y: 7,
      art: "snowVillager",
      movement: "static",
      dialog: [
        {
          pages: [
            "ここは メジャーリア せつげんの にしの みなと。",
            "さばくの くにへ もどるかい?",
          ],
          then: [
            {
              type: "choice",
              prompt: "船で 砂の国 ワケーラへ もどる?",
              yes: [
                { type: "message", pages: ["それじゃ しゅっぱーつ!"] },
                { type: "transfer", mapId: "ch3-world", spawn: "from-ship" },
              ],
              no: [{ type: "message", pages: ["こごえないように きをつけて。"] }],
            },
          ],
        },
      ],
    },
    {
      id: "snow-traveler",
      x: 12,
      y: 3,
      art: "snowVillager",
      movement: "static",
      dialog: [
        {
          if: { flag: "c4.bossDefeated", op: "set" },
          pages: [
            "デシマロンを たおしたんだって!?",
            "ものさしも はかりも もとどおり。ほんとうに ありがとう!",
          ],
        },
        {
          pages: [
            "ここは メジャーリア せつげん。なんでも 「はかる」のが じまんの くにさ。",
            "でも このごろ ものさしの めもりが めちゃくちゃなんだ…",
            "ひがしの 角度の遺跡に 小数の魔人が すみついた せいらしい。",
          ],
        },
      ],
    },
    {
      id: "ruins-guard",
      x: 19,
      y: 5,
      art: "measurer",
      movement: "static",
      hideIf: { flag: "learned.kakudoSpin", op: "set" },
      dialog: [
        {
          pages: [
            "この さきは 角度の遺跡。とびらは 分度器の しかけだ。",
            "角度の じゅもん カクドスピンを おぼえてから いくのが よかろう。",
            "メジャーリアの まなびやで おぼえられるぞ。",
          ],
        },
      ],
    },
  ],
  events: [
    {
      id: "enter-majoria",
      x: 8,
      y: 4,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch4-majoria", spawn: "entrance" }],
    },
    {
      id: "enter-kogoe",
      x: 2,
      y: 12,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch4-kogoe", spawn: "entrance" }],
    },
    {
      id: "enter-icecave",
      x: 20,
      y: 11,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch4-icecave-1", spawn: "entrance" }],
    },
    {
      id: "enter-angle-ruins",
      x: 20,
      y: 4,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch4-ruins-1", spawn: "entrance" }],
    },
  ],
  spawns: {
    "from-ship": { x: 1, y: 7, facing: "right" },
    "from-majoria": { x: 7, y: 4, facing: "left" },
    "from-kogoe": { x: 3, y: 12, facing: "right" },
    "from-icecave": { x: 19, y: 11, facing: "left" },
    "from-angle-ruins": { x: 19, y: 4, facing: "left" },
  },
};
