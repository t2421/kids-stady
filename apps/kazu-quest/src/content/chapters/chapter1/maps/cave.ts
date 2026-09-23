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
      id: "to-world",
      x: 0,
      y: 8,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-world", spawn: "from-cave" }],
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
      id: "cave-locked-chest",
      x: 1,
      y: 1,
      trigger: "inspect",
      art: "chest",
      onceFlag: "c1.lockedChestCave",
      commands: [
        {
          type: "message",
          pages: ["すうじの カギが かかっている。もんだいに こたえると あく。"],
        },
        {
          type: "quiz",
          skillId: "g1_add_carry",
          onCorrect: [
            { type: "message", pages: ["カチッ! カギが あいた!", "どうのつるぎを てにいれた!"] },
            { type: "giveItem", itemId: "douNoTsurugi" },
            { type: "setFlag", flag: "c1.lockedChestCave" },
          ],
          onWrong: [
            {
              type: "message",
              pages: ["カギは あかなかった。もういちど ちょうせん できる。"],
            },
            /* transfer は残りのコマンドを打ち切る = onceFlag を消費せず再挑戦できる (宝箱の前に戻る) */
            { type: "transfer", mapId: "ch1-cave", spawn: "locked-chest" },
          ],
        },
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
    /* すうじのカギつき宝箱の前 (不正解の再挑戦用) */
    "locked-chest": { x: 1, y: 2, facing: "up" },
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
      id: "cave-boss-level-sign",
      x: 2,
      y: 6,
      trigger: "inspect",
      art: "signpost",
      commands: [{ type: "levelSign", level: 6 }],
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
            "かがやく 「すうしょう・壱《いち》」を とりもどした!",
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
