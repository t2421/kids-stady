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
    "~......============rMMMM.~",
    "~......=C=........r=AMMM.~",
    "~..**..=...........=M.MM.~",
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
          if: { flag: "c4.clear", op: "set" },
          pages: [
            "けいそく長から あたらしい 船を あずかっているよ。",
            "みなみの 割合の都 パーセンへ わたるかい?",
          ],
          then: [
            {
              type: "choice",
              prompt: "割合の都 パーセンへ 船を だす?",
              yes: [
                { type: "message", pages: ["それじゃ しゅっぱーつ!"] },
                { type: "transfer", mapId: "ch5-world", spawn: "from-ship" },
              ],
              no: [
                {
                  type: "choice",
                  prompt: "砂の国 ワケーラへ もどる?",
                  yes: [
                    { type: "transfer", mapId: "ch3-world", spawn: "from-ship" },
                  ],
                  no: [{ type: "message", pages: ["いつでも こえを かけてくれ。"] }],
                },
              ],
            },
          ],
        },
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
      /*
       * LP-20: 章4の中核3単元 (角度・小数・2桁でわるわり算) が すべて「できる」で開く。
       * 遺跡の前は 行き止まりなので、一度 中に入った勇者も通す
       * (通さないと "from-angle-ruins" で出てきた勇者が 閉じこめられる)。
       */
      hideIf: {
        any: [
          [
            { skill: "g4_angle", state: "can" },
            { skill: "g4_decimal", state: "can" },
            { skill: "g4_div_2digit", state: "can" },
          ],
          { flag: "c4.enteredAngleRuins", op: "set" },
        ],
      },
      dialog: [
        {
          pages: [
            "この さきは 角度の遺跡。とびらは 分度器の しかけだ。",
            "角度・小数・2桁でわる わり算。3つとも「できる」に ならないと ひらかぬ。",
            "メジャーリアの まなびやで おぼえられるぞ。",
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
      /* setFlag は transfer より前に置く (transfer は残りのコマンドを打ち切る) */
      commands: [
        { type: "setFlag", flag: "c4.enteredAngleRuins" },
        { type: "transfer", mapId: "ch4-ruins-1", spawn: "entrance" },
      ],
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
