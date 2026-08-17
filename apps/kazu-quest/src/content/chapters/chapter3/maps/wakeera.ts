/*
 * オアシス都市ワケーラ — 第3章の拠点。宿・道具屋・まなびや・ほこらと
 * まちの まんなかの オアシス。武闘家カケルが 修行中で、話すと なかまに なる。
 */

import type { MapDef } from "../../../types";
import { CH3_TOWN_LEGEND } from "../legends";

export const CH3_WAKEERA: MapDef = {
  id: "ch3-wakeera",
  name: "オアシスとし ワケーラ",
  theme: "desert",
  legend: CH3_TOWN_LEGEND,
  grid: [
    "TTTTTTTTT=TTTTTTTTTT",
    "T........=.........T",
    "T..[RR]..=..[RR]...T",
    "T..{__}..=..{__}...T",
    "T..WIDW..=..WSDW...T",
    "T...=....=....=....T",
    "T...======.====....T",
    "T..[RR]..=..[RR]...T",
    "T..{__}..=..{__}...T",
    "T..WoDW..=..WoDW...T",
    "T...=....=....=....T",
    "T...======....=....T",
    "T..~~~~..=..cc.....T",
    "T..~~~~..=.........T",
    "TTTTTTTTTTTTTTTTTTTT",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "wakeera-chief",
      x: 7,
      y: 12,
      art: "merchant",
      movement: "static",
      dialog: [
        {
          if: { flag: "c3.orb3", op: "set" },
          pages: [
            "おお! 「すうしょう・参」が もどってきた!",
            "オアシスの みずも わけまえも もとどおりだ。ありがとう ゆうしゃよ!",
            "つぎの すうしょうは きたの こおりの くに メジャーリアに あるという。",
            "さばくの きたの みなとから 船が でる。きをつけて いくのだぞ!",
          ],
          then: [
            { type: "setFlag", flag: "c3.clear" },
            { type: "advanceChapter", chapter: 4 },
          ],
        },
        {
          if: { flag: "c3.metChief", op: "set" },
          pages: [
            "ピラミッドの とびらは 「わけまえ」の といで ひらく。",
            "まなびやで ワリダマを おぼえるのが ちかみちじゃ。",
          ],
        },
        {
          pages: [
            "わしが ワケーラの まちおさじゃ。よくぞ この さばくまで きてくれた。",
            "盗賊王アマリダが 「すうしょう・参」を うばい、ピラミッドに たてこもった…",
            "おかげで まちの わけまえ (わり算) が めちゃくちゃじゃ。",
            "したくきんに 200ゴールド わたそう。たのんだぞ!",
          ],
          then: [
            { type: "giveGold", amount: 200 },
            { type: "setFlag", flag: "c3.metChief" },
          ],
        },
      ],
    },
    {
      id: "kakeru-join",
      x: 11,
      y: 6,
      art: "kakeru",
      movement: "static",
      hideIf: { flag: "c3.metKakeru", op: "set" },
      dialog: [
        {
          pages: [
            "はっ! はっ! ……おっと、きみが うわさの ゆうしゃか!",
            "おれは カケル。かける (×) の わざを みがく ぶとうかだ。",
            "アマリダに どうじょうの たからを ぬすまれてな。かたきを うちたい。",
            "つれてってくれ! れんぞく こうげきなら まかせろ!",
            "カケルが なかまに くわわった!",
          ],
          then: [
            { type: "joinParty", memberId: "kakeru", level: 13 },
            { type: "setFlag", flag: "c3.metKakeru" },
          ],
        },
      ],
    },
    {
      id: "water-kid",
      x: 16,
      y: 13,
      art: "villager",
      movement: "wander",
      dialog: [
        {
          pages: [
            "オアシスの みずは みんなで わけまえっこ するんだ。",
            "12リットルを 4人で わけると… ひとり 3リットル! わり算だね!",
          ],
        },
      ],
    },
  ],
  events: [
    {
      id: "to-inn",
      x: 5,
      y: 4,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch3-wakeera-inn", spawn: "start" }],
    },
    {
      id: "to-shop",
      x: 14,
      y: 4,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch3-wakeera-shop", spawn: "start" }],
    },
    {
      id: "to-manabiya",
      x: 5,
      y: 9,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch3-wakeera-manabiya", spawn: "start" },
      ],
    },
    {
      id: "to-shrine",
      x: 14,
      y: 9,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch3-wakeera-shrine", spawn: "start" },
      ],
    },
    {
      id: "to-world",
      x: 9,
      y: 0,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch3-world", spawn: "from-wakeera" }],
    },
  ],
  spawns: {
    entrance: { x: 9, y: 1, facing: "down" },
    "from-inn": { x: 5, y: 5, facing: "down" },
    "from-shop": { x: 14, y: 5, facing: "down" },
    "from-manabiya": { x: 5, y: 10, facing: "down" },
    "from-shrine": { x: 14, y: 10, facing: "down" },
  },
};
