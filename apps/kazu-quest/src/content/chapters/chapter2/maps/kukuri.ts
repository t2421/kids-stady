/* ククリ村 — 塔のふもとの小さな村。単位と時間のまなびやがある */

import type { MapDef } from "../../../types";
import { VILLAGE_LEGEND, INTERIOR_LEGEND } from "../../chapter1/legends";

export const CH2_KUKURI: MapDef = {
  id: "ch2-kukuri",
  name: "ククリむら",
  theme: "grass",
  legend: VILLAGE_LEGEND,
  grid: [
    "TTTTTTTT=TTTTTTT",
    "T.......=......T",
    "T..[RR].=.f.y..T",
    "T..{__}.=......T",
    "T..WoDW.=..u...T",
    "T...=...=......T",
    "T...=====......T",
    "T.......=..x...T",
    "T.f.....=..x...T",
    "TTTTTTTT=TTTTTTT",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "kukuri-elder",
      x: 11,
      y: 6,
      art: "villager",
      movement: "static",
      dialog: [
        {
          if: { flag: "c2.bossDefeated", op: "set" },
          pages: ["塔の 魔女を たおしてくれたんだね! 九九の ひびきが もどってきたよ。"],
        },
        {
          pages: [
            "この むらは 九九の塔の ふもとの ククリむら。",
            "塔の とびらは 九九の こたえを きいてくるんだ。",
            "まちがえると ばんにんの おばけが でてくるから きをつけて!",
          ],
        },
      ],
    },
  ],
  events: [
    {
      id: "to-manabiya",
      x: 5,
      y: 4,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch2-kukuri-manabiya", spawn: "start" },
      ],
    },
    {
      id: "to-world-n",
      x: 8,
      y: 0,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch2-world", spawn: "from-kukuri" }],
    },
    {
      id: "to-world-s",
      x: 8,
      y: 9,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch2-world", spawn: "from-kukuri" }],
    },
  ],
  spawns: {
    entrance: { x: 8, y: 1, facing: "down" },
    "from-manabiya": { x: 5, y: 5, facing: "down" },
  },
};

export const CH2_KUKURI_MANABIYA: MapDef = {
  id: "ch2-kukuri-manabiya",
  name: "ククリの まなびや",
  theme: "interior",
  legend: INTERIOR_LEGEND,
  grid: [
    "WwWWWhWWwW",
    "WPFTTTTFFW",
    "WFFFFFFFFW",
    "WFTTFFTTFW",
    "WFFFFFFFFW",
    "WWWWDWWWWW",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "scholar4",
      x: 4,
      y: 2,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          pages: [
            "ここは ククリの まなびや。れんぞくわざと たんい、とけいを おしえておる。",
            "ながさは cm と mm、かさは L と dL。10ずつの かんけいじゃ!",
          ],
          then: [
            {
              type: "choice",
              prompt: "ダンダンづき (九九・れんぞく) の テスト?",
              yes: [{ type: "openSpellTest", spellId: "dandanZuki" }],
              no: [
                {
                  type: "choice",
                  prompt: "ナガサビーム (ながさ) の テスト?",
                  yes: [{ type: "openSpellTest", spellId: "nagasaBeam" }],
                  no: [
                    {
                      type: "choice",
                      prompt: "カサミスト (かさ) の テスト?",
                      yes: [{ type: "openSpellTest", spellId: "kasaMist" }],
                      no: [
                        {
                          type: "choice",
                          prompt: "トキシフト (とけい) の テスト?",
                          yes: [{ type: "openSpellTest", spellId: "tokiShift" }],
                          no: [{ type: "message", pages: ["また おいで!"] }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  events: [
    {
      id: "ch2-kukuri-manabiya-exit",
      x: 4,
      y: 5,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch2-kukuri", spawn: "from-manabiya" },
      ],
    },
  ],
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};
