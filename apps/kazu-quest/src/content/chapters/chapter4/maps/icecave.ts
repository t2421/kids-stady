/*
 * 氷の洞くつ — 第4章の寄り道ダンジョン (2フロア)。
 * おくの こおりの間で 魔法使いリトルが 小数の けんきゅうを している。
 * こおりのゴーレムから 助けると なかまに なる。
 */

import type { MapDef } from "../../../types";
import { CH4_CAVE_LEGEND } from "../legends";

export const CH4_ICECAVE_1: MapDef = {
  id: "ch4-icecave-1",
  name: "こおりの どうくつ",
  theme: "cave",
  legend: CH4_CAVE_LEGEND,
  grid: [
    "WWWWWWDWWWWWWW",
    "WSSS%%%%%%SSSW",
    "WScS%%WW%%SScW",
    "WSS%%%%%%%%SSW",
    "WF%%%%WW%%%%FW",
    "WS%%%%WW%%%%SW",
    "WSSS%%%%%%SSSW",
    "WScSSS%%SSScSW",
    "WSSSSS%%SSSSSW",
    "WWWWWWDWWWWWWW",
  ],
  encounterTableId: "ch4-icecave",
  npcs: [],
  events: [
    {
      id: "icecave1-out",
      x: 6,
      y: 9,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch4-world", spawn: "from-icecave" }],
    },
    {
      id: "icecave1-chest",
      x: 2,
      y: 8,
      trigger: "inspect",
      art: "chest",
      onceFlag: "c4.icecaveChest",
      commands: [
        {
          type: "message",
          pages: ["こおりに とじこめられた 宝箱だ!", "かがみのたてを てにいれた!"],
        },
        { type: "giveItem", itemId: "kagamiNoTate" },
      ],
    },
    {
      id: "icecave1-in",
      x: 6,
      y: 0,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch4-icecave-2", spawn: "entrance" },
      ],
    },
  ],
  spawns: {
    entrance: { x: 6, y: 8, facing: "up" },
    "from-inner": { x: 6, y: 1, facing: "down" },
  },
};

export const CH4_ICECAVE_2: MapDef = {
  id: "ch4-icecave-2",
  name: "こおりの ま",
  theme: "cave",
  legend: CH4_CAVE_LEGEND,
  grid: [
    "WWWWWWWWWWWWWW",
    "WSSSSFaFSSSSSW",
    "WSSSSSrSSSSSSW",
    "WScSSSrSSSScSW",
    "WSSSSSrSSSSSSW",
    "WSSSSSrSSSSSSW",
    "WScSSSrSSSScSW",
    "WSSSSSrSSSSSSW",
    "WWWWWWDWWWWWWW",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "little-join",
      x: 4,
      y: 2,
      art: "little",
      movement: "static",
      hideIf: { flag: "c4.metLittle", op: "set" },
      dialog: [
        {
          if: { flag: "c4.iceGolem", op: "set" },
          pages: [
            "たすけて くれて ありがとう! わたしは リトル、コゴエ村の 魔法使いよ。",
            "0.1が 10こで 1。この しくみが わかれば デシマロンの まほうも やぶれるわ。",
            "わたしも つれていって! 小数と 分数の まほうなら まかせて!",
            "リトルが なかまに くわわった!",
          ],
          then: [
            { type: "joinParty", memberId: "little", level: 20 },
            { type: "setFlag", flag: "c4.metLittle" },
          ],
        },
        {
          pages: [
            "きゃっ! こないで… うしろに こおりの ゴーレムが いるの!",
            "わたしの けんきゅうノートを まもって!",
          ],
        },
      ],
    },
  ],
  events: [
    {
      id: "icecave2-back",
      x: 6,
      y: 8,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch4-icecave-1", spawn: "from-inner" },
      ],
    },
    {
      id: "icecave2-golem",
      x: 6,
      y: 5,
      trigger: "step",
      onceFlag: "c4.iceGolem",
      commands: [
        {
          type: "message",
          pages: [
            "こおりの かたまりが むくりと おきあがった!",
            "「ケンキュウ… ノート… コオラセル…」",
            "こおりのゴーレムが おそいかかってきた!",
          ],
        },
        { type: "battle", monsterIds: ["kooriGolem"], boss: true },
        {
          type: "message",
          pages: [
            "ゴーレムは くだけて みずに もどった。",
            "おくの 女の子が こちらを 見ている…",
          ],
        },
      ],
    },
  ],
  spawns: { entrance: { x: 6, y: 7, facing: "up" } },
};
