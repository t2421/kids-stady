/*
 * 角度の遺跡 — 第4章のメインダンジョン (3層 + 最深部)。
 * 各層の とびらは 分度器の しかけ (角度・面せき・がい数の とい)。
 * 最深部に 小数の魔人デシマロン。
 */

import type { MapDef } from "../../../types";
import { CH4_CAVE_LEGEND } from "../legends";

export const CH4_RUINS_1: MapDef = {
  id: "ch4-ruins-1",
  name: "角度の いせき 1そう",
  theme: "cave",
  legend: CH4_CAVE_LEGEND,
  grid: [
    "WWWWWWDWWWWWWW",
    "WSSS%%%%%%SSSW",
    "WScS%%%%%%SScW",
    "WSS%%%%%%%%SSW",
    "WF%%%%WW%%%%FW",
    "WS%%%%WW%%%%SW",
    "WSSS%%%%%%SSSW",
    "WScSSS%%SSScSW",
    "WSSSSS%%SSSSSW",
    "WWWWWWDWWWWWWW",
  ],
  encounterTableId: "ch4-angle-ruins",
  npcs: [],
  events: [
    {
      id: "ch4ruins1-out",
      x: 6,
      y: 9,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch4-world", spawn: "from-angle-ruins" },
      ],
    },
    {
      id: "ch4ruins1-door",
      x: 6,
      y: 0,
      trigger: "step",
      commands: [
        {
          type: "message",
          pages: [
            "分度器の かたちの とびらだ。",
            "「ただしい 角度を こたえよ」と ひかる 文字が うかぶ…",
          ],
        },
        {
          type: "quiz",
          skillId: "g4_angle",
          onCorrect: [
            { type: "message", pages: ["せいかい! とびらが ひらいた!"] },
            { type: "transfer", mapId: "ch4-ruins-2", spawn: "entrance" },
          ],
          onWrong: [
            {
              type: "message",
              pages: ["ちがう! ぶんどきガニが はさみを ならして あらわれた!"],
            },
            { type: "battle", monsterIds: ["bundokiKani"] },
            {
              type: "message",
              pages: ["おいはらった。もういちど とびらに ちょうせんしよう。"],
            },
          ],
        },
      ],
    },
  ],
  spawns: {
    entrance: { x: 6, y: 8, facing: "up" },
    "from-above": { x: 6, y: 1, facing: "down" },
  },
};

export const CH4_RUINS_2: MapDef = {
  id: "ch4-ruins-2",
  name: "角度の いせき 2そう",
  theme: "cave",
  legend: CH4_CAVE_LEGEND,
  grid: [
    "WWWWWWDWWWWWWW",
    "WSSS%%%%%%SSSW",
    "WSSS%%WW%%SSSW",
    "WScS%%WW%%SScW",
    "WSSS%%WW%%SSSW",
    "WFSS%%%%%%SSFW",
    "WSSSSSSSSSSSSW",
    "WScSSS%%SSScSW",
    "WSS%%%%%%%%SSW",
    "WSSSSS%%SSSSSW",
    "WWWWWWDWWWWWWW",
  ],
  encounterTableId: "ch4-angle-ruins",
  npcs: [],
  events: [
    {
      id: "ch4ruins2-down",
      x: 6,
      y: 10,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch4-ruins-1", spawn: "from-above" },
      ],
    },
    {
      id: "ch4ruins2-chest",
      x: 2,
      y: 6,
      trigger: "inspect",
      art: "chest",
      onceFlag: "c4.ruinsChest",
      commands: [
        {
          type: "message",
          pages: ["こおりに つつまれた 宝箱だ!", "こおりのつるぎを てにいれた!"],
        },
        { type: "giveItem", itemId: "kooriNoKen" },
      ],
    },
    {
      id: "ch4ruins2-door",
      x: 6,
      y: 0,
      trigger: "step",
      commands: [
        {
          type: "message",
          pages: [
            "2そうめの とびら。ゆかに ながしかくの もようが うかんでいる…",
            "「この かたちの 面せきを こたえよ」",
          ],
        },
        {
          type: "quiz",
          skillId: "g4_area",
          onCorrect: [
            { type: "message", pages: ["せいかい! とびらが ひらいた!"] },
            { type: "transfer", mapId: "ch4-ruins-3", spawn: "entrance" },
          ],
          onWrong: [
            {
              type: "message",
              pages: ["ちがう! ものさしオオカミが とびだしてきた!"],
            },
            { type: "battle", monsterIds: ["monosashiOokami"] },
            {
              type: "message",
              pages: ["おいはらった。もういちど とびらに ちょうせんしよう。"],
            },
          ],
        },
      ],
    },
  ],
  spawns: {
    entrance: { x: 6, y: 9, facing: "up" },
    "from-above": { x: 6, y: 1, facing: "down" },
  },
};

export const CH4_RUINS_3: MapDef = {
  id: "ch4-ruins-3",
  name: "角度の いせき 3そう",
  theme: "cave",
  legend: CH4_CAVE_LEGEND,
  grid: [
    "WWWWWWDWWWWWWW",
    "WSSSSSrSSSSSSW",
    "WScSSSrSSSScSW",
    "WSSSSSrSSSSSSW",
    "WF%%%%%%%%%%FW",
    "WS%%%%%%%%%%SW",
    "WScSS%%%%SSScW",
    "WSSSS%%%%SSSSW",
    "WSSSSS%%SSSSSW",
    "WWWWWWDWWWWWWW",
  ],
  encounterTableId: "ch4-angle-ruins",
  npcs: [
    {
      id: "ruins-hermit",
      x: 3,
      y: 1,
      art: "measurer",
      movement: "static",
      dialog: [
        {
          pages: [
            "この おくに 小数の魔人が おる。あやつの まほうは 0.1きざみで くるわせる…",
            "はかる ちからを しんじれば、かならず もとに もどせる。いってきなさい!",
          ],
        },
      ],
    },
  ],
  events: [
    {
      id: "ch4ruins3-down",
      x: 6,
      y: 9,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch4-ruins-2", spawn: "from-above" },
      ],
    },
    {
      id: "ch4ruins3-door",
      x: 6,
      y: 0,
      trigger: "step",
      commands: [
        {
          type: "message",
          pages: [
            "さいごの とびら。「おおよそで よい。だが ちかい 数を こたえよ」",
            "四捨五入の しかけだ…",
          ],
        },
        {
          type: "quiz",
          skillId: "g4_round",
          onCorrect: [
            { type: "message", pages: ["せいかい! とびらが ひらいた!"] },
            { type: "transfer", mapId: "ch4-ruins-deep", spawn: "entrance" },
          ],
          onWrong: [
            {
              type: "message",
              pages: ["ちがう! ゆきだるマンが ころがってきた!"],
            },
            { type: "battle", monsterIds: ["yukiDaruman", "kooriBat"] },
            {
              type: "message",
              pages: ["おいはらった。もういちど とびらに ちょうせんしよう。"],
            },
          ],
        },
      ],
    },
  ],
  spawns: {
    entrance: { x: 6, y: 8, facing: "up" },
    "from-above": { x: 6, y: 1, facing: "down" },
  },
};

/* 最深部 — デシマロンの間 */
export const CH4_RUINS_DEEP: MapDef = {
  id: "ch4-ruins-deep",
  name: "いせき さいしんぶ",
  theme: "cave",
  legend: CH4_CAVE_LEGEND,
  grid: [
    "WWWWWWWWWWWWWW",
    "WSSSrrrrrrSSSW",
    "WScSrrrrrrScSW",
    "WSSSrrrrrrSSSW",
    "WSSSrrrrrrSSSW",
    "WScSSrrrrScSSW",
    "WSSSSrrrrSSSSW",
    "WSSSSSrrSSSSSW",
    "WWWWWWDWWWWWWW",
  ],
  encounterTableId: null,
  npcs: [],
  events: [
    {
      id: "ch4ruins-deep-down",
      x: 6,
      y: 8,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch4-ruins-3", spawn: "from-above" },
      ],
    },
    {
      id: "ruins-deep-level-sign",
      x: 5,
      y: 7,
      trigger: "inspect",
      art: "signpost",
      commands: [{ type: "levelSign", level: 24 }],
    },
    {
      id: "boss-decimaron",
      x: 6,
      y: 2,
      trigger: "step",
      onceFlag: "c4.bossDefeated",
      commands: [
        {
          type: "message",
          pages: [
            "こおりの ぎょくざに 小数の魔人デシマロンが すわっている。",
            "「ようこそ、0.1の せかいへ。」",
            "「1を 10に わけ、その 1を また 10に わける…」",
            "「おまえたちの ちからも どんどん 小さく してやろう!」",
          ],
        },
        { type: "battle", monsterIds: ["decimaron"], boss: true },
        {
          type: "message",
          pages: [
            "「ばかな… 小数を 正しく つかう こどもが いるとは…」",
            "デシマロンは しずくに なって きえた。",
            "かがやく 「すうしょう・肆」を とりもどした!",
            "メジャーリアの けいそく長に ほうこくしよう!",
          ],
        },
        { type: "setFlag", flag: "c4.orb4" },
      ],
    },
  ],
  spawns: { entrance: { x: 6, y: 7, facing: "up" } },
};
