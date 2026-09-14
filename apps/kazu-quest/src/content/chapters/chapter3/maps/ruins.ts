/*
 * 大灯りの遺跡 — 第3章の寄り道ダンジョン (2フロア)。
 * 最深部の 大灯りは 円の といに こたえると ともり、宝箱が あらわれる。
 */

import type { MapDef } from "../../../types";
import { CH3_PYRAMID_LEGEND } from "../legends";

export const CH3_RUINS_1: MapDef = {
  id: "ch3-ruins-1",
  name: "大灯りの いせき",
  theme: "cave",
  legend: CH3_PYRAMID_LEGEND,
  grid: [
    "WWWWWWDWWWWWWW",
    "WSSS%%%%%%SSSW",
    "WScS%%WW%%SScW",
    "WSSS%%WW%%SSSW",
    "WFSS%%%%%%SSFW",
    "WSSSSS%%SSSSSW",
    "WScSSS%%SSScSW",
    "WSSSSS%%SSSSSW",
    "WSSSSS%%SSSSSW",
    "WWWWWWDWWWWWWW",
  ],
  encounterTableId: "ch3-ruins",
  npcs: [],
  events: [
    {
      id: "ruins1-out",
      x: 6,
      y: 9,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch3-world", spawn: "from-ruins" }],
    },
    {
      id: "ruins1-locked-chest",
      x: 12,
      y: 1,
      trigger: "inspect",
      art: "chest",
      onceFlag: "c3.lockedChestRuins",
      commands: [
        {
          type: "message",
          pages: ["すうじの カギが かかっている。もんだいに こたえると あく。"],
        },
        {
          type: "quiz",
          skillId: "g3_big_number",
          onCorrect: [
            { type: "message", pages: ["カチッ! カギが あいた!", "じょうやくそうを 3つ てにいれた!"] },
            { type: "giveItem", itemId: "jouyakusou", count: 3 },
            { type: "setFlag", flag: "c3.lockedChestRuins" },
          ],
          onWrong: [
            {
              type: "message",
              pages: ["カギは あかなかった。もういちど ちょうせん できる。"],
            },
            /* transfer は残りのコマンドを打ち切る = onceFlag を消費せず再挑戦できる (宝箱の前に戻る) */
            { type: "transfer", mapId: "ch3-ruins-1", spawn: "locked-chest" },
          ],
        },
      ],
    },
    {
      id: "ruins1-in",
      x: 6,
      y: 0,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch3-ruins-2", spawn: "entrance" }],
    },
  ],
  spawns: {
    entrance: { x: 6, y: 8, facing: "up" },
    "from-inner": { x: 6, y: 1, facing: "down" },
    /* すうじのカギつき宝箱の前 (不正解の再挑戦用) */
    "locked-chest": { x: 11, y: 1, facing: "right" },
  },
};

export const CH3_RUINS_2: MapDef = {
  id: "ch3-ruins-2",
  name: "大灯りの ま",
  theme: "cave",
  legend: CH3_PYRAMID_LEGEND,
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
  npcs: [],
  events: [
    {
      id: "ruins2-back",
      x: 6,
      y: 8,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch3-ruins-1", spawn: "from-inner" },
      ],
    },
    {
      id: "ruins2-lamp",
      x: 6,
      y: 1,
      trigger: "inspect",
      onceFlag: "c3.ruinsLit",
      commands: [
        {
          type: "message",
          pages: [
            "大きな まるい 灯りだ。だいざに 文字が きざまれている…",
            "「まるい かたちを しる もの、ひかりを ともせ」",
          ],
        },
        {
          type: "quiz",
          skillId: "g3_circle",
          onCorrect: [
            {
              type: "message",
              pages: [
                "せいかい! 大灯りに ひが ともった!",
                "さばくの みちが ずっと さきまで みえる!",
                "だいざの したから 古い 宝箱が せりあがってきた!",
              ],
            },
            { type: "giveItem", itemId: "hagaNeNoTsurugi" },
            { type: "message", pages: ["はがねのつるぎを てにいれた!"] },
          ],
          onWrong: [
            {
              type: "message",
              pages: [
                "ちがうようだ。灯りは くらいままだ…",
                "円の ことを おもいだして もういちど!",
              ],
            },
            /* transfer は残りのコマンドを打ち切る = onceFlag を消費せず再挑戦できる */
            { type: "transfer", mapId: "ch3-ruins-2", spawn: "entrance" },
          ],
        },
      ],
    },
  ],
  spawns: { entrance: { x: 6, y: 7, facing: "up" } },
};
