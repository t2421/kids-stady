/*
 * わけまえのピラミッド — 第3章のメインダンジョン。
 * 各層の「わけまえの とびら」は わり算の とい。まちがえると 見はりが あらわれる。
 * 3層めの おくで 中ボス わけまえゴーレム、玄室に 盗賊王アマリダ。
 */

import type { MapDef } from "../../../types";
import { CH3_PYRAMID_LEGEND } from "../legends";

export const CH3_PYRAMID_1: MapDef = {
  id: "ch3-pyramid-1",
  name: "わけまえの ピラミッド 1そう",
  theme: "cave",
  legend: CH3_PYRAMID_LEGEND,
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
  encounterTableId: "ch3-pyramid",
  npcs: [],
  events: [
    {
      id: "pyramid1-out",
      x: 6,
      y: 9,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch3-world", spawn: "from-pyramid" }],
    },
    {
      id: "pyramid1-locked-chest",
      x: 1,
      y: 1,
      trigger: "inspect",
      art: "chest",
      onceFlag: "c3.lockedChestPyramid",
      commands: [
        {
          type: "message",
          pages: ["すうじの カギが かかっている。もんだいに こたえると あく。"],
        },
        {
          type: "quiz",
          skillId: "g3_fraction",
          onCorrect: [
            { type: "message", pages: ["カチッ! カギが あいた!", "みかづきのたてを てにいれた!"] },
            { type: "giveItem", itemId: "mikazukiNoTate" },
            { type: "setFlag", flag: "c3.lockedChestPyramid" },
          ],
          onWrong: [
            {
              type: "message",
              pages: ["カギは あかなかった。もういちど ちょうせん できる。"],
            },
            /* transfer は残りのコマンドを打ち切る = onceFlag を消費せず再挑戦できる (宝箱の前に戻る) */
            { type: "transfer", mapId: "ch3-pyramid-1", spawn: "locked-chest" },
          ],
        },
      ],
    },
    {
      id: "pyramid1-door",
      x: 6,
      y: 0,
      trigger: "step",
      commands: [
        {
          type: "message",
          pages: [
            "「わけまえの とびら」だ。石に といが きざまれている…",
            "ただしく わけられた ものだけが 先へ すすめる。",
          ],
        },
        {
          type: "quiz",
          skillId: "g3_div",
          onCorrect: [
            { type: "message", pages: ["せいかい! とびらが ひらいた!"] },
            { type: "transfer", mapId: "ch3-pyramid-2", spawn: "entrance" },
          ],
          onWrong: [
            {
              type: "message",
              pages: ["ちがう! 見はりの ねずみが とびだしてきた!"],
            },
            { type: "battle", monsterIds: ["sunanezumi", "sunanezumi"] },
            {
              type: "message",
              pages: ["見はりを おいはらった。もういちど とびらに ちょうせんしよう。"],
            },
          ],
        },
      ],
    },
  ],
  spawns: {
    entrance: { x: 6, y: 8, facing: "up" },
    "from-above": { x: 6, y: 1, facing: "down" },
    /* すうじのカギつき宝箱の前 (不正解の再挑戦用) */
    "locked-chest": { x: 1, y: 2, facing: "up" },
  },
};

export const CH3_PYRAMID_2: MapDef = {
  id: "ch3-pyramid-2",
  name: "わけまえの ピラミッド 2そう",
  theme: "cave",
  legend: CH3_PYRAMID_LEGEND,
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
  encounterTableId: "ch3-pyramid",
  npcs: [],
  events: [
    {
      id: "pyramid2-down",
      x: 6,
      y: 10,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch3-pyramid-1", spawn: "from-above" },
      ],
    },
    {
      id: "pyramid2-chest",
      x: 2,
      y: 6,
      trigger: "inspect",
      art: "chest",
      onceFlag: "c3.pyramidChest",
      commands: [
        {
          type: "message",
          pages: ["盗賊たちの かくし宝箱だ!", "さばくのローブを てにいれた!"],
        },
        { type: "giveItem", itemId: "sabakuNoRobe" },
      ],
    },
    {
      id: "pyramid2-door",
      x: 6,
      y: 0,
      trigger: "step",
      commands: [
        {
          type: "message",
          pages: [
            "2そうめの とびら。こんどは 「あまり」の といだ…",
            "のこりまで ちゃんと こたえよ、と きざまれている。",
          ],
        },
        {
          type: "quiz",
          skillId: "g3_div_remainder",
          onCorrect: [
            { type: "message", pages: ["せいかい! とびらが ひらいた!"] },
            { type: "transfer", mapId: "ch3-pyramid-3", spawn: "entrance" },
          ],
          onWrong: [
            {
              type: "message",
              pages: ["ちがう! ミイラふせんが おそいかかってきた!"],
            },
            { type: "battle", monsterIds: ["mummyFusen"] },
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

export const CH3_PYRAMID_3: MapDef = {
  id: "ch3-pyramid-3",
  name: "わけまえの ピラミッド 3そう",
  theme: "cave",
  legend: CH3_PYRAMID_LEGEND,
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
  encounterTableId: "ch3-pyramid",
  npcs: [],
  events: [
    {
      id: "pyramid3-down",
      x: 6,
      y: 9,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch3-pyramid-2", spawn: "from-above" },
      ],
    },
    {
      id: "pyramid3-level-sign",
      x: 5,
      y: 7,
      trigger: "inspect",
      art: "signpost",
      commands: [{ type: "levelSign", level: 15 }],
    },
    {
      id: "pyramid3-golem",
      x: 6,
      y: 3,
      trigger: "step",
      onceFlag: "c3.golem",
      commands: [
        {
          type: "message",
          pages: [
            "ゴゴゴ… 砂岩の からだが むくりと おきあがった!",
            "「ワケマエ… タダシク… ワケヨ…」",
            "わけまえゴーレムが 立ちふさがった!",
          ],
        },
        { type: "battle", monsterIds: ["wakemaeGolem"], boss: true },
        {
          type: "message",
          pages: [
            "ゴーレムは さらさらと 砂に もどった。",
            "おくの とびらへの みちが ひらけた!",
          ],
        },
      ],
    },
    {
      id: "pyramid3-door",
      x: 6,
      y: 0,
      trigger: "step",
      commands: [
        {
          type: "message",
          pages: [
            "げんしつへ つづく さいごの とびら。",
            "「けたを そろえて かけよ」と きざまれている…",
          ],
        },
        {
          type: "quiz",
          skillId: "g3_mul_column",
          onCorrect: [
            { type: "message", pages: ["せいかい! とびらが ひらいた!"] },
            { type: "transfer", mapId: "ch3-pyramid-top", spawn: "entrance" },
          ],
          onWrong: [
            {
              type: "message",
              pages: ["ちがう! 盗賊の 見はりが あらわれた!"],
            },
            { type: "battle", monsterIds: ["cactusKnife", "sasoriCompass"] },
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

/* 玄室 — 盗賊王アマリダの間 */
export const CH3_PYRAMID_TOP: MapDef = {
  id: "ch3-pyramid-top",
  name: "ピラミッド げんしつ",
  theme: "cave",
  legend: CH3_PYRAMID_LEGEND,
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
      id: "pyramid-top-down",
      x: 6,
      y: 8,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch3-pyramid-3", spawn: "from-above" },
      ],
    },
    {
      id: "pyramid-top-level-sign",
      x: 5,
      y: 7,
      trigger: "inspect",
      art: "signpost",
      commands: [{ type: "levelSign", level: 17 }],
    },
    {
      id: "boss-amarida",
      x: 6,
      y: 2,
      trigger: "step",
      onceFlag: "c3.bossDefeated",
      commands: [
        {
          type: "message",
          pages: [
            "きんの ざいほうの 山の 上に、盗賊王アマリダが すわっている。",
            "「よく ここまで きたな、ちびっこ ゆうしゃ!」",
            "「たからは ぜんぶ おれの もの。わけまえ? そんなものは ないさ!」",
            "「すうしょう・参」も おれの コレクションに くわえて やる!",
          ],
        },
        { type: "battle", monsterIds: ["amarida"], boss: true },
        {
          type: "message",
          pages: [
            "「まいった… わけまえは ちゃんと するさ…」",
            "アマリダは たからを おいて すなあらしの 中へ きえていった。",
            "かがやく 「すうしょう・参」を とりもどした!",
            "ワケーラの まちおさに ほうこくしよう!",
          ],
        },
        { type: "setFlag", flag: "c3.orb3" },
      ],
    },
  ],
  spawns: { entrance: { x: 6, y: 7, facing: "up" } },
};
