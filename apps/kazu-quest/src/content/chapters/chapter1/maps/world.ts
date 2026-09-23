/*
 * ワールドマップ「カズールの だいち」— ドラクエ式の全体マップ。
 * 村 (V/v)・王都 (C)・森の入口 (F)・洞くつ (O) はアイコンタイルで、
 * 踏むと各マップへシーン遷移する。町の外は歩くとエンカウント。
 *
 * 地理: 北の地方 (ハジマリ村・王都) と南の地方 (モリカゲ村・洞くつ) を
 * 山脈が隔て、唯一の通り道が どんぐりの森 (F 2つが北口と南口)。
 * 南の川にかかる橋は番人が守り、ヒキダマン習得までは渡れない。
 */

import type { MapDef } from "../../../types";
import { WORLD_LEGEND } from "../legends";

export const CH1_WORLD: MapDef = {
  id: "ch1-world",
  name: "カズールの だいち",
  theme: "grass",
  legend: WORLD_LEGEND,
  grid: [
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~~~....T.........T.......~~~",
    "~~......*.....*.......*...~~",
    "~..T.................T.....~",
    "~....V============C......T.~",
    "~...*.............=....*...~",
    "~.T.......*.......=......T.~",
    "~~................=......~~~",
    "~MMMMMMMMMMMMMMMTTFTTMMMMMM~",
    "~MMMMMMMMMMMMMMMTTTTTMMMMMM~",
    "~MMMMMMMMMMMMMMMTTFTTMMMMMM~",
    "~~................=..~..MM.~",
    "~.........v==========B==O..~",
    "~....*...............~....~~",
    "~~.*.......*.........~..*..~",
    "~~~..T..........T....~.....~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  ],
  encounterTableId: "ch1-world",
  npcs: [
    {
      id: "traveler",
      x: 12,
      y: 3,
      art: "villager",
      movement: "static",
      dialog: [
        {
          pages: [
            "この みちを ひがしへ すすむと おうと カズールだよ。",
            "みちの そとは モンスターが でるから きをつけて!",
            "こまったら 「にげる」でも いいんだよ。",
          ],
        },
      ],
    },
    {
      id: "sailor",
      x: 20,
      y: 13,
      art: "villager",
      movement: "static",
      dialog: [
        {
          if: { flag: "c1.clear", op: "set" },
          pages: ["やあ ゆうしゃ! おうさまの めいれいで 船《ふね》を よういしたぜ。"],
          then: [
            {
              type: "choice",
              prompt: "うみかぜの しまへ 船《ふね》を だす?",
              yes: [
                { type: "message", pages: ["それじゃ しゅっぱーつ!"] },
                { type: "transfer", mapId: "ch2-world", spawn: "from-ship" },
              ],
              no: [{ type: "message", pages: ["いつでも こえを かけてくれ。"] }],
            },
          ],
        },
        {
          pages: [
            "おれは 船《ふね》のりさ。この 海《うみ》の むこうには べつの しまが あるんだ。",
            "「すうしょう・壱《いち》」が もどったら 船《ふね》を だせるんだけどなあ…",
          ],
        },
      ],
    },
    {
      id: "bridge-guard",
      x: 21,
      y: 12,
      art: "villager",
      movement: "static",
      /*
       * LP-20: 章1の中核3単元 (かぞえる・くりあがり・くりさがり) が すべて「できる」で開く。
       * 橋の東は どうくつしか 出口が ないので、一度 どうくつに 入った勇者も通す
       * (通さないと 出てきた瞬間に 橋の手前で 閉じこめてしまう)。
       */
      hideIf: {
        any: [
          [
            { skill: "g1_count", state: "can" },
            { skill: "g1_add_carry", state: "can" },
            { skill: "g1_sub_borrow", state: "can" },
          ],
          { flag: "c1.enteredCave", op: "set" },
        ],
      },
      dialog: [
        {
          pages: [
            "はしの さきは かぞえの どうくつ。",
            "かぞえる・くりあがり・くりさがり。3つとも「できる」に ならないと とおれないぞ!",
            "モリカゲむらの まなびやで テストに ごうかく してきな。",
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
      id: "enter-hajimari",
      x: 5,
      y: 4,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-hajimari", spawn: "entrance" }],
    },
    {
      id: "enter-capital",
      x: 18,
      y: 4,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-capital", spawn: "entrance" }],
    },
    {
      id: "forest-north-gate",
      x: 18,
      y: 8,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-forest", spawn: "north" }],
    },
    {
      id: "forest-south-gate",
      x: 18,
      y: 10,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-forest", spawn: "south" }],
    },
    {
      id: "enter-morikage",
      x: 10,
      y: 12,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-morikage", spawn: "entrance" }],
    },
    {
      id: "enter-cave",
      x: 24,
      y: 12,
      trigger: "step",
      /* setFlag は transfer より前に置く (transfer は残りのコマンドを打ち切る) */
      commands: [
        { type: "setFlag", flag: "c1.enteredCave" },
        { type: "transfer", mapId: "ch1-cave", spawn: "west" },
      ],
    },
  ],
  spawns: {
    "from-hajimari": { x: 6, y: 4, facing: "right" },
    "from-capital": { x: 18, y: 5, facing: "down" },
    "forest-north": { x: 18, y: 7, facing: "up" },
    "forest-south": { x: 18, y: 11, facing: "down" },
    "from-morikage": { x: 11, y: 12, facing: "right" },
    "from-cave": { x: 23, y: 12, facing: "left" },
    /* 第2章の船で帰ってくる場所 (船のりのとなり) */
    port: { x: 19, y: 13, facing: "right" },
  },
};
