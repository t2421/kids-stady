/*
 * マイナドス城 — 第5章のメインダンジョン (3マップ)。
 * ようがんの ひろまと 通分の とびら。玉座の間に 魔王マイナドス。
 */

import type { MapDef } from "../../../types";
import { CH5_CASTLE_LEGEND } from "../legends";

export const CH5_CASTLE_1: MapDef = {
  id: "ch5-castle-1",
  name: "マイナドス城 1かい",
  theme: "cave",
  legend: CH5_CASTLE_LEGEND,
  grid: [
    "WWWWWWDWWWWWWW",
    "WSSS%%%%%%SSSW",
    "WScS%%LL%%SScW",
    "WSSS%%LL%%SSSW",
    "WFSS%%%%%%SSFW",
    "WSSSSSSSSSSSSW",
    "WScSSS%%SSScSW",
    "WSS%%%%%%%%SSW",
    "WSSLL%%%%LLSSW",
    "WSSSSS%%SSSSSW",
    "WWWWWWDWWWWWWW",
  ],
  encounterTableId: "ch5-castle",
  npcs: [],
  events: [
    {
      id: "castle1-out",
      x: 6,
      y: 10,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch5-world", spawn: "from-castle" }],
    },
    {
      id: "castle1-chest",
      x: 2,
      y: 5,
      trigger: "inspect",
      art: "chest",
      onceFlag: "c5.castleChest",
      commands: [
        {
          type: "message",
          pages: ["まものの たからばこだ!", "ひかりのつるぎを てにいれた!"],
        },
        { type: "giveItem", itemId: "hikariNoKen" },
      ],
    },
    {
      id: "castle1-door",
      x: 6,
      y: 0,
      trigger: "step",
      commands: [
        {
          type: "message",
          pages: [
            "くろい とびらに 2つの 分数が うかんでいる。",
            "「分母を そろえて こたえよ」",
          ],
        },
        {
          type: "quiz",
          skillId: "g5_fraction_diff",
          onCorrect: [
            { type: "message", pages: ["せいかい! とびらが ひらいた!"] },
            { type: "transfer", mapId: "ch5-castle-2", spawn: "entrance" },
          ],
          onWrong: [
            {
              type: "message",
              pages: ["ちがう! まものたちが おそいかかってきた!"],
            },
            {
              type: "battle",
              monsterIds: ["tsuubunSnake", "waribikiGhost"],
            },
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

export const CH5_CASTLE_2: MapDef = {
  id: "ch5-castle-2",
  name: "マイナドス城 2かい",
  theme: "cave",
  legend: CH5_CASTLE_LEGEND,
  grid: [
    "WWWWWWDWWWWWWW",
    "WSSSrrrrrrSSSW",
    "WScSrrrrrrScSW",
    "WSSSrrrrrrSSSW",
    "WF%%%%LL%%%%FW",
    "WS%%%%LL%%%%SW",
    "WScSS%%%%SSScW",
    "WSSSS%%%%SSSSW",
    "WSS%%%%%%%%SSW",
    "WSSSSS%%SSSSSW",
    "WWWWWWDWWWWWWW",
  ],
  encounterTableId: "ch5-castle",
  npcs: [],
  events: [
    {
      id: "castle2-down",
      x: 6,
      y: 10,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch5-castle-1", spawn: "from-above" },
      ],
    },
    {
      id: "castle2-door",
      x: 6,
      y: 0,
      trigger: "step",
      commands: [
        {
          type: "message",
          pages: [
            "玉座の間へ つづく とびら。「もとの りょうの なん%かを こたえよ」",
            "マイナドスの こえが ひびく… 「といて みせろ、ゆうしゃ」",
          ],
        },
        {
          type: "quiz",
          skillId: "g5_percent",
          onCorrect: [
            { type: "message", pages: ["せいかい! とびらが ひらいた!"] },
            {
              type: "transfer",
              mapId: "ch5-castle-throne",
              spawn: "entrance",
            },
          ],
          onWrong: [
            {
              type: "message",
              pages: ["ちがう! まものの ぐんぜいが あらわれた!"],
            },
            {
              type: "battle",
              monsterIds: ["taisekiCube", "hasuuKeshigomun"],
            },
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

/* 玉座の間 — 魔王マイナドス */
export const CH5_CASTLE_THRONE: MapDef = {
  id: "ch5-castle-throne",
  name: "ぎょくざの ま",
  theme: "cave",
  legend: CH5_CASTLE_LEGEND,
  grid: [
    "WWWWWWWWWWWWWW",
    "WSSSSStSSSSSSW",
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
      id: "throne-down",
      x: 6,
      y: 9,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch5-castle-2", spawn: "from-above" },
      ],
    },
    {
      id: "boss-minados",
      x: 6,
      y: 3,
      trigger: "step",
      onceFlag: "c5.bossDefeated",
      commands: [
        {
          type: "message",
          pages: [
            "くろい 玉座に 魔王マイナドスが すわっている。",
            "「よくぞ ここまで きた、カズールの ゆうしゃよ。」",
            "「わしは 数を へらす もの。たす ものが あれば、ひく ものも いる。」",
            "「おまえの 数を すべて マイナスに して やろう!」",
          ],
        },
        { type: "battle", monsterIds: ["minados"], boss: true },
        {
          type: "message",
          pages: [
            "「ぐ… わしを たおしても… もう おそい…」",
            "「ゼロのあなが ひらく… ほんとうの おうは 下の せかいに いる…」",
            "マイナドスは くろい きりに なって きえた。",
            "かがやく 「すうしょう・伍」を とりもどした!",
            "…そのとき、大地が ゆれ、まちの きたに 大きな あなが ひらいた!",
          ],
        },
        { type: "setFlag", flag: "c5.orb5" },
      ],
    },
  ],
  spawns: { entrance: { x: 6, y: 8, facing: "up" } },
};
