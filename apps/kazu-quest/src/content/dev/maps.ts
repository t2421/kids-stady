/*
 * M4 エンジン検証用の開発マップ (第1章コンテンツ投入時に置き換わる)。
 * 村 (エンカウントなし・NPCあり) と 草原 (エンカウントあり) を行き来できる。
 */

import type { MapDef } from "../types";

const VILLAGE_LEGEND: MapDef["legend"] = {
  T: { art: "tree", walkable: false },
  ".": { art: "grass", walkable: true },
  "=": { art: "path", walkable: true },
  "~": { art: "water", walkable: false },
  W: { art: "wall", walkable: false },
  R: { art: "roof", walkable: false },
  F: { art: "floor", walkable: true },
  D: { art: "door", walkable: true },
};

export const DEV_VILLAGE: MapDef = {
  id: "dev-village",
  name: "テストむら",
  theme: "grass",
  legend: VILLAGE_LEGEND,
  grid: [
    "TTTTTTTTTTTTTTTTTTTT",
    "T..................T",
    "T..RRRR....RRRR....T",
    "T..WWWW....WWWW....T",
    "T..WFFW....WFFW....T",
    "T..WFDW....WFDW....T",
    "T...==......==.....T",
    "T...==......==..~~.T",
    "T...=========...~~.T",
    "T......==..........T",
    "T......==......T...T",
    "T......==..........T",
    "TTTTTTT==TTTTTTTTTTT",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "dev-mother",
      x: 4,
      y: 6,
      art: "mother",
      movement: "static",
      dialog: [
        {
          if: { flag: "dev.metKing", op: "set" },
          pages: ["おうさまに あえたのね! りっぱに なって…"],
        },
        {
          pages: [
            "おはよう! きょうは だいじな ひ ですよ。",
            "おうさまが よんでいたわ。あいさつ してきなさい。",
          ],
        },
      ],
    },
    {
      id: "dev-king",
      x: 12,
      y: 6,
      art: "king",
      movement: "static",
      dialog: [
        {
          if: { flag: "dev.metKing", op: "set" },
          pages: ["うむ、たのんだぞ ゆうしゃよ。"],
        },
        {
          pages: [
            "わしが カウントおう じゃ。",
            "そなたに 50ゴールドと じゅもんを さずけよう!",
            "ヒキダマと タシリアを おぼえた!",
          ],
          then: [
            { type: "giveGold", amount: 50 },
            { type: "learnSpell", memberId: "hero", spellId: "hikidama" },
            { type: "learnSpell", memberId: "hero", spellId: "tashiria" },
            { type: "setFlag", flag: "dev.metKing" },
          ],
        },
      ],
    },
    {
      id: "dev-inn",
      x: 12,
      y: 4,
      art: "villager",
      movement: "static",
      dialog: [
        {
          pages: ["ここは やどや。ひとばん 10ゴールド だよ。"],
          then: [
            {
              type: "choice",
              prompt: "とまって いく?",
              yes: [{ type: "healInn", price: 10 }],
              no: [{ type: "message", pages: ["また きてね!"] }],
            },
          ],
        },
      ],
    },
    {
      id: "dev-priest",
      x: 4,
      y: 4,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          pages: ["ここは めがみの ほこら。"],
          then: [
            {
              type: "choice",
              prompt: "ぼうけんを きろくする?",
              yes: [{ type: "savePoint" }],
              no: [],
            },
          ],
        },
      ],
    },
  ],
  events: [
    {
      id: "dev-chest1",
      x: 17,
      y: 10,
      trigger: "inspect",
      onceFlag: "dev.chest1",
      art: "chest",
      commands: [
        { type: "message", pages: ["たからばこを あけた!", "やくそうを 2つ てにいれた!"] },
        { type: "giveItem", itemId: "yakusou", count: 2 },
      ],
    },
    {
      id: "to-field",
      x: 7,
      y: 12,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "dev-field", spawn: "from-village" }],
    },
    {
      id: "to-field2",
      x: 8,
      y: 12,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "dev-field", spawn: "from-village" }],
    },
  ],
  spawns: {
    start: { x: 7, y: 8, facing: "down" },
    "from-field": { x: 7, y: 11, facing: "up" },
  },
};

export const DEV_FIELD: MapDef = {
  id: "dev-field",
  name: "テストそうげん",
  theme: "grass",
  legend: {
    T: { art: "tree", walkable: false },
    ".": { art: "grass", walkable: true },
    "*": { art: "bush", walkable: true, encounter: true },
    "~": { art: "water", walkable: false },
    "=": { art: "path", walkable: true },
  },
  grid: [
    "TTTTTTT==TTTTTTTTTTT",
    "T......==..........T",
    "T..***.==...***....T",
    "T..***..=...***....T",
    "T.......==.........T",
    "T~~......==....***.T",
    "T~~~.....==....***.T",
    "T........==........T",
    "T..***...==........T",
    "T..***...==...~~~..T",
    "T........==...~~~..T",
    "T........==........T",
    "TTTTTTTTTTTTTTTTTTTT",
  ],
  encounterTableId: "dev-plains",
  npcs: [],
  events: [
    {
      id: "to-village",
      x: 7,
      y: 0,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "dev-village", spawn: "from-field" }],
    },
    {
      id: "to-village2",
      x: 8,
      y: 0,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "dev-village", spawn: "from-field" }],
    },
  ],
  spawns: {
    "from-village": { x: 7, y: 1, facing: "down" },
  },
};
