/*
 * しおかぜ灯台 — 明かりが消えた寄り道ダンジョン (2フロア)。
 * てっぺんで「とけい」のクイズに正解すると明かりがともる (c2.lighthouse)。
 */

import type { MapDef } from "../../../types";
import { CH2_TOWER_LEGEND } from "../legends";

export const CH2_LIGHTHOUSE_1: MapDef = {
  id: "ch2-lighthouse",
  name: "しおかぜとうだい",
  theme: "cave",
  legend: CH2_TOWER_LEGEND,
  grid: [
    "WWWWWWWWWWWW",
    "WSSSSSSSSSSW",
    "WScSSSSSScSW",
    "WSSSWWWWSSSW",
    "WSSSWrrWSSSW",
    "WSSSWrrWSSSW",
    "WScSSSSSScSW",
    "WSSSSSSSSSSW",
    "WWWWWDWWWWWW",
  ],
  encounterTableId: "ch2-lighthouse",
  npcs: [],
  events: [
    {
      id: "lighthouse-exit",
      x: 5,
      y: 8,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch2-world", spawn: "from-lighthouse" },
      ],
    },
    {
      id: "lighthouse-stairs",
      x: 5,
      y: 4,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch2-lighthouse-top", spawn: "start" },
      ],
    },
    {
      id: "lighthouse-chest",
      x: 10,
      y: 1,
      trigger: "inspect",
      onceFlag: "c2.lighthouseChest",
      art: "chest",
      commands: [
        {
          type: "message",
          pages: ["たからばこを あけた!", "てつのたてを てにいれた!"],
        },
        { type: "giveItem", itemId: "tetsuNoTate" },
      ],
    },
  ],
  spawns: {
    entrance: { x: 5, y: 7, facing: "up" },
    "from-top": { x: 5, y: 5, facing: "down" },
  },
};

export const CH2_LIGHTHOUSE_TOP: MapDef = {
  id: "ch2-lighthouse-top",
  name: "とうだいの てっぺん",
  theme: "interior",
  legend: CH2_TOWER_LEGEND,
  grid: [
    "WWWWWWWW",
    "WSSSSSSW",
    "WScrrcSW",
    "WSrrrrSW",
    "WScrrcSW",
    "WSSSSSSW",
    "WWWDWWWW",
  ],
  encounterTableId: null,
  npcs: [],
  events: [
    {
      id: "lighthouse-top-exit",
      x: 3,
      y: 6,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch2-lighthouse", spawn: "from-top" },
      ],
    },
    {
      id: "beacon",
      x: 3,
      y: 2,
      trigger: "inspect",
      onceFlag: "c2.lighthouse",
      commands: [
        {
          type: "message",
          pages: [
            "おおきな あかりだ。とけいじかけの スイッチが ついている…",
            "「ただしい こたえで うごきだす」と かいてある。",
          ],
        },
        {
          type: "quiz",
          skillId: "g2_time",
          onCorrect: [
            {
              type: "message",
              pages: [
                "カチッ… ゴゴゴ…",
                "とうだいに あかりが ともった!",
                "これで よるの 船も あんしんだね!",
              ],
            },
            { type: "giveGold", amount: 100 },
            { type: "message", pages: ["おれいに 100ゴールドが おいてあった!"] },
          ],
          onWrong: [
            {
              type: "message",
              pages: [
                "ビリッ! スイッチに はじかれてしまった!",
                "もういちど ちょうせんしよう。",
              ],
            },
            /* transfer は残りのコマンドを打ち切る = onceFlag を消費せず再挑戦できる */
            { type: "transfer", mapId: "ch2-lighthouse-top", spawn: "start" },
          ],
        },
      ],
    },
  ],
  spawns: { start: { x: 3, y: 5, facing: "up" } },
};
