/* ククリ村 — 塔のふもとの小さな村。単位と時間のまなびやがある */

import type { MapDef } from "../../../types";
import { VILLAGE_LEGEND, INTERIOR_LEGEND } from "../../chapter1/legends";
import { teacherMenu } from "../../teacherMenu";

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
          pages: ["塔《とう》の 魔女《まじょ》を たおしてくれたんだね! 九九の ひびきが もどってきたよ。"],
        },
        {
          pages: [
            "この むらは 九九の塔《とう》の ふもとの ククリむら。",
            "塔《とう》の とびらは 九九の こたえを きいてくるんだ。",
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
      art: "abacusCaptain",
      movement: "static",
      dialog: [
        {
          pages: [
            "わしは そろばん船長。ククリの まなびやで れんぞくわざと たんい、とけいを おしえておる。",
            "ながさは cm と mm、かさは L と dL。10ずつの かんけいじゃ!",
          ],
          then: teacherMenu([
            { skillId: "g2_kuku", label: "九九・れんぞくわざ", spellIds: ["dandanZuki"] },
            { skillId: "g2_length", label: "ながさ", spellIds: ["nagasaBeam"] },
            { skillId: "g2_volume", label: "かさ", spellIds: ["kasaMist"] },
            { skillId: "g2_time", label: "とけい", spellIds: ["tokiShift"] },
          ]),
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
    {
      id: "kukuri-drill-board",
      x: 8,
      y: 1,
      trigger: "inspect",
      art: "questBoard",
      commands: [
        {
          type: "message",
          pages: ["おだいの けいじばん だ。", "もんだいを といて ゴールドを かせごう!"],
        },
        { type: "openDrillBoard" },
      ],
    },
  ],
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};
