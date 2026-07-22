/* かぞえの洞くつ + ボス部屋 (設計 A7 ビート7-8) */

import type { MapDef } from "../../../types";
import { CAVE_LEGEND } from "../legends";

export const CH1_CAVE: MapDef = {
  id: "ch1-cave",
  name: "かぞえの どうくつ",
  theme: "cave",
  legend: CAVE_LEGEND,
  grid: [
    "KKKKKKKKKKKKKKKKKKKK",
    "K%%%%K......K%%%%%%K",
    "K%%%%K.%%%%.K%%KK%%K",
    "K%%K%%%%KK%%%%%K.%%K",
    "K%%K.%%%KK.%%%%%.%%K",
    "K%%K.....K......K%%K",
    "K%%KKKKK.KKKKKK.K%%K",
    "K%%%%%%%.%%%%%%.%%%K",
    "CC.%%%%%.%%KK%%.%%KK",
    "K..KKKKK.KKKK.%.%%KK",
    "K%%%%%%%.%%%%.%.%%%K",
    "K%%KK%%%%%%KK%%%%%CC",
    "KKKKKKKKKKKKKKKKKKKK",
  ],
  encounterTableId: "ch1-cave",
  npcs: [],
  events: [
    {
      id: "to-morikage",
      x: 0,
      y: 8,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-morikage", spawn: "from-cave" }],
    },
    {
      id: "cave-chest",
      x: 17,
      y: 1,
      trigger: "inspect",
      onceFlag: "c1.caveChest",
      art: "chest",
      commands: [
        { type: "message", pages: ["たからばこを あけた!", "やくそうを 2つ てにいれた!"] },
        { type: "giveItem", itemId: "yakusou", count: 2 },
      ],
    },
    {
      id: "to-boss",
      x: 19,
      y: 11,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-cave-boss", spawn: "entry" }],
    },
  ],
  spawns: {
    west: { x: 1, y: 8, facing: "right" },
    "from-boss": { x: 18, y: 11, facing: "left" },
  },
};

export const CH1_CAVE_BOSS: MapDef = {
  id: "ch1-cave-boss",
  name: "どうくつの さいおく",
  theme: "cave",
  legend: CAVE_LEGEND,
  grid: [
    "KKKKKKKKKKKK",
    "K..........K",
    "K..........K",
    "K..........K",
    "K..........K",
    "K..........K",
    "K..........K",
    "CC.........K",
    "KKKKKKKKKKKK",
  ],
  encounterTableId: null,
  npcs: [],
  events: [
    {
      id: "back-to-cave",
      x: 0,
      y: 7,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-cave", spawn: "from-boss" }],
    },
    {
      id: "boss-eraser",
      x: 6,
      y: 4,
      trigger: "step",
      onceFlag: "c1.bossDefeated",
      commands: [
        {
          type: "message",
          pages: [
            "ケシケシぐんだんの かんぶ イレイサーが たちふさがった!",
            "「この すうしょうは わたさない! きえてしまえ!」",
          ],
        },
        { type: "battle", monsterIds: ["eraser"], boss: true },
        {
          type: "message",
          pages: [
            "イレイサーを やっつけた!",
            "かがやく 「すうしょう・壱」を とりもどした!",
            "おうさまに ほうこく しよう!",
          ],
        },
        { type: "setFlag", flag: "c1.orb1" },
      ],
    },
  ],
  spawns: {
    entry: { x: 1, y: 7, facing: "right" },
  },
};
