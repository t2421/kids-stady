/*
 * ゼロム城 — カズクエ最後のダンジョン (3マップ)。
 * 2かいの ろうやに 父ガウスが とらわれている。
 * 玉座の間で 冥王ゼロムと 2形態の たたかい、そして エンディング。
 */

import type { MapDef } from "../../../types";
import { CH6_DUNGEON_LEGEND } from "../legends";

export const CH6_ZEROM_1: MapDef = {
  id: "ch6-zerom-1",
  name: "ゼロム城 1かい",
  theme: "cave",
  legend: CH6_DUNGEON_LEGEND,
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
  encounterTableId: "ch6-zerom",
  npcs: [],
  events: [
    {
      id: "zerom1-out",
      x: 6,
      y: 10,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch6-world", spawn: "from-zerom" }],
    },
    {
      id: "zerom1-chest",
      x: 2,
      y: 5,
      trigger: "inspect",
      art: "chest",
      onceFlag: "c6.zeromChest",
      commands: [
        {
          type: "message",
          pages: ["ゼロムの たからばこだ!", "ピタゴラのよろいを てにいれた!"],
        },
        { type: "giveItem", itemId: "pitagoraNoYoroi" },
      ],
    },
    {
      id: "zerom1-door",
      x: 6,
      y: 0,
      trigger: "step",
      commands: [
        {
          type: "message",
          pages: [
            "くろい とびらに 「x」の 文字が うかんでいる。",
            "「x に あてはまる 数を こたえよ」",
          ],
        },
        {
          type: "quiz",
          skillId: "g6_letter_expr",
          onCorrect: [
            { type: "message", pages: ["せいかい! とびらが ひらいた!"] },
            { type: "transfer", mapId: "ch6-zerom-2", spawn: "entrance" },
          ],
          onWrong: [
            {
              type: "message",
              pages: ["ちがう! ゼロの まものが あらわれた!"],
            },
            { type: "battle", monsterIds: ["negaGhost", "sokudoWolf"] },
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

export const CH6_ZEROM_2: MapDef = {
  id: "ch6-zerom-2",
  name: "ゼロム城 2かい",
  theme: "cave",
  legend: CH6_DUNGEON_LEGEND,
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
  encounterTableId: "ch6-zerom",
  npcs: [
    {
      id: "gauss",
      x: 2,
      y: 3,
      art: "gauss",
      movement: "static",
      dialog: [
        {
          if: { flag: "c6.bossDefeated", op: "set" },
          pages: [
            "よく やったな…! さすが わしの こだ。",
            "いっしょに 上の せかいへ かえろう。母さんが まっている。",
          ],
        },
        {
          if: { flag: "c6.metGauss", op: "set" },
          pages: [
            "ゼロムは 「0を かけると すべてが 0に なる」ことを つかってくる。",
            "だが 0で わることは できん。そこに あやつの よわみが ある。",
          ],
        },
        {
          pages: [
            "…その かおは。おまえ、まさか わしの こか?",
            "わしは ガウス。マイナドスを おって この 下の せかいまで きたが…",
            "冥王ゼロムに やぶれ、ここに つながれて しまった。",
            "これを もっていけ。わしの さいごの たからだ。",
            "ゼロムは 玉座の間に いる。…気を つけるのだぞ。",
          ],
          then: [
            { type: "giveItem", itemId: "seiNoShizuku", count: 3 },
            { type: "setFlag", flag: "c6.metGauss" },
          ],
        },
      ],
    },
  ],
  events: [
    {
      id: "zerom2-down",
      x: 6,
      y: 10,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch6-zerom-1", spawn: "from-above" },
      ],
    },
    {
      id: "zerom2-door",
      x: 6,
      y: 0,
      trigger: "step",
      commands: [
        {
          type: "message",
          pages: [
            "玉座の間へ つづく 最後の とびら。",
            "「分数の かけ算わり算を もって わが前に 立て」",
          ],
        },
        {
          type: "quiz",
          skillId: "g6_fraction_muldiv",
          onCorrect: [
            { type: "message", pages: ["せいかい! とびらが ひらいた!"] },
            {
              type: "transfer",
              mapId: "ch6-zerom-throne",
              spawn: "entrance",
            },
          ],
          onWrong: [
            {
              type: "message",
              pages: ["ちがう! ゼロの ぐんぜいが あらわれた!"],
            },
            {
              type: "battle",
              monsterIds: ["zeroCube", "negaGhost", "zeroKeshigomun"],
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

/* 玉座の間 — 冥王ゼロム (2形態) と エンディング */
export const CH6_ZEROM_THRONE: MapDef = {
  id: "ch6-zerom-throne",
  name: "ゼロムの ぎょくざ",
  theme: "cave",
  legend: CH6_DUNGEON_LEGEND,
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
      id: "zerom-throne-down",
      x: 6,
      y: 9,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch6-zerom-2", spawn: "from-above" },
      ],
    },
    {
      id: "zerom-throne-level-sign",
      x: 5,
      y: 8,
      trigger: "inspect",
      art: "signpost",
      commands: [{ type: "levelSign", level: 38 }],
    },
    {
      id: "boss-zerom",
      x: 6,
      y: 3,
      trigger: "step",
      onceFlag: "c6.bossDefeated",
      commands: [
        {
          type: "message",
          pages: [
            "こおりつく ような しずけさ。玉座に 冥王ゼロムが すわっている。",
            "「ようこそ、数の こどもよ。ここが せかいの そこだ。」",
            "「1も 100も 1兆も、0を かければ すべて 0。」",
            "「かぞえる ことなど、はじめから むだなのだ。」",
          ],
        },
        { type: "battle", monsterIds: ["zerom"], boss: true },
        {
          type: "message",
          pages: [
            "「…ほう。この すがたでも たおすか。」",
            "「では 見せてやろう。すべてを 無に かえす、わが しんの すがたを!」",
            "ゼロムの からだが くろい ほのおに つつまれた!",
          ],
        },
        { type: "battle", monsterIds: ["zeromTrue"], boss: true },
        {
          type: "message",
          pages: [
            "「ばかな… 0で わることは できぬのに…」",
            "「なぜ、おまえたちの 数は 0に ならぬ…!」",
            "冥王ゼロムは 光の つぶに なって きえていった。",
            "玉座の うしろから かがやく 「すうしょう・陸」が あらわれた!",
          ],
        },
        { type: "setFlag", flag: "c6.orb6" },
        {
          type: "message",
          pages: [
            "6つの すうしょうが そらに ならび、聖鳥アバカスが 鳴いた。",
            "くらかった ネガリアに、ゆっくりと 色が もどっていく…",
            "ろうやから 父ガウスが かけつけた。「よく やった。ほんとうに よく やった!」",
          ],
        },
        {
          type: "message",
          pages: [
            "「ゆうしゃよ。」— 光の中から 数の女神スーリアが あらわれた。",
            "「あなたは 数を けす ちからより、数を かぞえる ちからが つよいと しめしました。」",
            "「その 名を、はつだいの 数ゆうしゃと おなじ 「ピタゴラ」と なのりなさい。」",
            "ピタゴラの しょうごうを 手に入れた!",
          ],
        },
        {
          type: "message",
          pages: [
            "…こうして 2つの せかいに 数が もどった。",
            "村へ かえる 道みち、父ガウスが わらって いった。",
            "「さあ かえろう。かえったら、まず なにを かぞえる?」",
            "— カズクエ 〜数の王国と伝説の勇者〜  おしまい —",
          ],
        },
        { type: "setFlag", flag: "c6.clear" },
        /* エンディング演出へ (KQ-22)。cleared に 6 を積み、再開位置は ホシオキの ほこら */
        { type: "ending" },
      ],
    },
  ],
  spawns: { entrance: { x: 6, y: 8, facing: "up" } },
};
