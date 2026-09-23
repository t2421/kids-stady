/*
 * 第3章のワールド「ワケーラ砂ばく」— 船で北の港に着く。
 * オアシス都市ワケーラ O / 隊商の宿場 K / 大灯りの遺跡 U /
 * わけまえのピラミッド P。砂と砂丘の上は歩くとエンカウント。
 */

import type { MapDef } from "../../../types";
import { CH3_WORLD_LEGEND } from "../legends";

export const CH3_WORLD: MapDef = {
  id: "ch3-world",
  name: "ワケーラ さばく",
  theme: "desert",
  legend: CH3_WORLD_LEGEND,
  grid: [
    "~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~........dd......TT......~",
    "~..T.................c...~",
    "~......=============.MMM.~",
    "~......=O=.........rMMMM.~",
    "~..cc..=..........r=PMMM.~",
    "~......=...dd......=MMM..~",
    "~..T...=...........=..c..~",
    "~=======...........=.....~",
    "~......=======K=====.....~",
    "~..dd..=.................~",
    "~......=...dd..........c.~",
    "~.U=====.................~",
    "~....r..........T........~",
    "~..dd........c...........~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~",
  ],
  encounterTableId: "ch3-desert",
  npcs: [
    {
      id: "ship-captain",
      x: 2,
      y: 8,
      art: "villager",
      movement: "static",
      dialog: [
        {
          if: { flag: "c3.clear", op: "set" },
          pages: [
            "まちおさの めいれいで きたの 氷の国ゆきの 船を よういしたぜ!",
          ],
          then: [
            {
              type: "choice",
              prompt: "こおりの国 メジャーリアへ 船を だす?",
              yes: [
                { type: "message", pages: ["それじゃ しゅっぱーつ!"] },
                { type: "transfer", mapId: "ch4-world", spawn: "from-ship" },
              ],
              no: [
                {
                  type: "choice",
                  prompt: "うみかぜの しまへ もどる?",
                  yes: [
                    { type: "transfer", mapId: "ch2-world", spawn: "from-ship" },
                  ],
                  no: [{ type: "message", pages: ["いつでも こえを かけてな。"] }],
                },
              ],
            },
          ],
        },
        {
          pages: [
            "ここは ワケーラ さばくの きたの みなと。",
            "うみかぜの しまへ もどるかい?",
          ],
          then: [
            {
              type: "choice",
              prompt: "船で うみかぜの しまへ もどる?",
              yes: [
                { type: "message", pages: ["それじゃ しゅっぱーつ!"] },
                { type: "transfer", mapId: "ch2-world", spawn: "from-ship" },
              ],
              no: [{ type: "message", pages: ["すなあらしに きをつけてな。"] }],
            },
          ],
        },
      ],
    },
    {
      id: "desert-traveler",
      x: 12,
      y: 3,
      art: "merchant",
      movement: "static",
      dialog: [
        {
          if: { flag: "c3.bossDefeated", op: "set" },
          pages: [
            "盗賊王アマリダを たおしたって!?",
            "これで たいしょうの にもつも ぶじに はこべるよ。ありがとう!",
          ],
        },
        {
          pages: [
            "ここは ワケーラ さばく。みずが ある ところにしか まちは ないんだ。",
            "ひがしの ピラミッドには 盗賊王アマリダの アジトが あるらしい…",
            "みなみの 宿場で ひとやすみして いくといいよ。",
          ],
        },
      ],
    },
    {
      id: "pyramid-guard",
      x: 19,
      y: 6,
      art: "villager",
      movement: "static",
      /*
       * LP-20: 章3の中核3単元 (わり算・あまりのあるわり算・分数) が すべて「できる」で開く。
       * ピラミッド前は 岩にかこまれた 行き止まりなので、一度 中に入った勇者も通す
       * (通さないと "from-pyramid" で出てきた勇者が 番人と ピラミッドの間に 閉じこめられる)。
       */
      hideIf: {
        any: [
          [
            { skill: "g3_div", state: "can" },
            { skill: "g3_div_remainder", state: "can" },
            { skill: "g3_fraction", state: "can" },
          ],
          { flag: "c3.enteredPyramid", op: "set" },
        ],
      },
      dialog: [
        {
          pages: [
            "この さきは わけまえの ピラミッド。",
            "とびらは 「わけまえ」= わり算・あまり・分数、3つとも「できる」に ならないと ひらかない。",
            "ワケーラの まなびやで おぼえてから いくんだな。",
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
      id: "enter-wakeera",
      x: 8,
      y: 4,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch3-wakeera", spawn: "entrance" }],
    },
    {
      id: "enter-caravan",
      x: 14,
      y: 9,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch3-caravan", spawn: "entrance" }],
    },
    {
      id: "enter-ruins",
      x: 2,
      y: 12,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch3-ruins-1", spawn: "entrance" }],
    },
    {
      id: "enter-pyramid",
      x: 20,
      y: 5,
      trigger: "step",
      /* setFlag は transfer より前に置く (transfer は残りのコマンドを打ち切る) */
      commands: [
        { type: "setFlag", flag: "c3.enteredPyramid" },
        { type: "transfer", mapId: "ch3-pyramid-1", spawn: "entrance" },
      ],
    },
  ],
  spawns: {
    "from-ship": { x: 1, y: 8, facing: "right" },
    "from-wakeera": { x: 7, y: 4, facing: "left" },
    "from-caravan": { x: 13, y: 9, facing: "left" },
    "from-ruins": { x: 3, y: 12, facing: "right" },
    "from-pyramid": { x: 19, y: 5, facing: "left" },
  },
};
