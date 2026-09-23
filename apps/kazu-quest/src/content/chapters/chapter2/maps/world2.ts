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
          pages: ["塔《とう》の 魔女《まじょ》を たおしたんだって? しまの みんなが うわさしてるよ!"],
        },
        {
          pages: [
            "ここは うみかぜの しま。",
            "みなみの 塔《とう》に インクの魔女《まじょ》が すみついてから、かずが おかしいんだ…",
            "まずは 港町《みなとまち》ミナトスに よってみな。",
          ],
        },
      ],
    },
    {
      id: "sabaku-sailor",
      x: 5,
      y: 9,
      art: "villager",
      movement: "static",
      dialog: [
        {
          if: { flag: "c2.clear", op: "set" },
          pages: ["みなとの長の めいれいで 砂《すな》の国ゆきの 船を よういしたぜ!"],
          then: [
            {
              type: "choice",
              prompt: "砂《すな》の国 ワケーラへ 船を だす?",
              yes: [
                { type: "message", pages: ["それじゃ しゅっぱーつ!"] },
                { type: "transfer", mapId: "ch3-world", spawn: "from-ship" },
              ],
              no: [{ type: "message", pages: ["いつでも こえを かけてくれ。"] }],
            },
          ],
        },
        {
          pages: [
            "おれは みなみまわりの 船のりさ。",
            "この 海の さきには 砂《すな》の国が あるんだ。",
            "「すうしょう・弐《に》」が もどったら 船を だせるんだけどなあ…",
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
      /* LP-20: 章2の中核3単元 (ひっ算のたし算・九九・とけい) が すべて「できる」で開く */
      hideIf: [
        { skill: "g2_add_column", state: "can" },
        { skill: "g2_kuku", state: "can" },
        { skill: "g2_time", state: "can" },
      ],
      dialog: [
        {
          pages: [
            "この さきは 九九の塔《とう》。とびらは ぜんぶ 九九の クイズだ。",
            "ひっ算のたし算・九九・とけい。3つとも「できる」に ならないと ひらかないぞ。",
            "ミナトスの まなびやで おぼえられる。",
          ],
          /* その場で まなべる (めあて パネル → 前提チェックつきの レッスン)。
             「まなびやへ いけ」と言われても 子どもは 迷うので、物語の とびらから 直接 つなぐ */
          then: [
            {
              type: "choice",
              prompt: "とびらを ひらく さんすうを いま まなぶ?",
              yes: [{ type: "openGoals" }],
              no: [{ type: "message", pages: ["いつでも 「★ めあて」から まなべるぞ。"] }],
            },
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
