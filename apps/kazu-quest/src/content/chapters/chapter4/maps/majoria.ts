/*
 * 計測の都メジャーリア — 第4章の拠点。なんでも「はかる」ことを だいじにする都。
 * 宿・道具屋・まなびや・ほこらと、ひろばの けいそく長。
 */

import type { MapDef } from "../../../types";
import { CH4_TOWN_LEGEND } from "../legends";

export const CH4_MAJORIA: MapDef = {
  id: "ch4-majoria",
  name: "けいそくのみやこ メジャーリア",
  theme: "snow",
  legend: CH4_TOWN_LEGEND,
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
    "T..r..r..=..r..r...T",
    "T........=.........T",
    "TTTTTTTTTTTTTTTTTTTT",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "measure-chief",
      x: 7,
      y: 13,
      art: "measurer",
      movement: "static",
      dialog: [
        {
          if: { flag: "c4.orb4", op: "set" },
          pages: [
            "「すうしょう・肆」が もどった! ものさしの めもりが そろっていく…",
            "みごとだ ゆうしゃよ。れいに 北の海を わたる 船を さしあげよう。",
            "つぎの すうしょうは みなみの 割合の都 パーセンに あるという。",
            "にしの みなとの 船のりに こえを かけるのだ!",
          ],
          then: [
            { type: "setFlag", flag: "c4.clear" },
            { type: "advanceChapter", chapter: 5 },
          ],
        },
        {
          if: { flag: "c4.metChief", op: "set" },
          pages: [
            "角度の遺跡の とびらは 分度器の しかけ。",
            "まなびやで カクドスピンを おぼえてから いくのだ。",
          ],
        },
        {
          pages: [
            "わしは メジャーリアの けいそく長。この 都は なんでも はかる。",
            "だが 小数の魔人デシマロンが 「すうしょう・肆」を うばってから…",
            "ものさしも はかりも 0.1ずつ くるって しまったのだ。",
            "したくきんに 400ゴールド さずけよう。たのんだぞ!",
          ],
          then: [
            { type: "giveGold", amount: 400 },
            { type: "setFlag", flag: "c4.metChief" },
          ],
        },
      ],
    },
    {
      id: "majoria-kid",
      x: 13,
      y: 13,
      art: "snowVillager",
      movement: "wander",
      dialog: [
        {
          pages: [
            "ゆきが つもった 高さも はかるんだよ。きょうは 12.5cm!",
            "0.1が 10こで 1cm。しょうすうって べんりだね!",
          ],
        },
      ],
    },
    {
      id: "majoria-guide",
      x: 11,
      y: 6,
      art: "measurer",
      movement: "static",
      dialog: [
        {
          if: { flag: "c4.metLittle", op: "set" },
          pages: [
            "リトルが なかまに なったのか! あの子は 小数の てんさいだ。",
            "デシマロンの ことも きっと わかるはずだ。",
          ],
        },
        {
          pages: [
            "ひがしの 氷の洞くつで、コゴエ村の むすめが 小数の けんきゅうを しておる。",
            "リトルという 魔法使いの たまごだ。たずねて みては どうかな。",
          ],
        },
      ],
    },
    {
      /* クイズずき (KQ-31): 1回だけ ひらめきメダル。何度でも挑戦できる */
      id: "quiz-fan",
      x: 17,
      y: 1,
      art: "snowVillager",
      movement: "static",
      dialog: [
        {
          if: { flag: "c4.quizNpc", op: "set" },
          pages: ["また あそぼうね。"],
        },
        {
          pages: [
            "ぼくは クイズが だいすき! がいすうの もんだいを といてみる?",
            "せいかいしたら ひらめきメダルを あげるよ!",
          ],
          then: [
            {
              type: "quiz",
              skillId: "g4_round",
              onCorrect: [
                { type: "message", pages: ["せいかい! すごいね。はい、ひらめきメダル!"] },
                { type: "giveItem", itemId: "hiramekiMedal", count: 1 },
                { type: "setFlag", flag: "c4.quizNpc" },
              ],
              onWrong: [{ type: "message", pages: ["ざんねん! また ちょうせんしてね。"] }],
            },
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
      commands: [{ type: "transfer", mapId: "ch4-majoria-inn", spawn: "start" }],
    },
    {
      id: "to-shop",
      x: 14,
      y: 4,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch4-majoria-shop", spawn: "start" }],
    },
    {
      id: "to-manabiya",
      x: 5,
      y: 9,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch4-majoria-manabiya", spawn: "start" },
      ],
    },
    {
      id: "to-shrine",
      x: 14,
      y: 9,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch4-majoria-shrine", spawn: "start" },
      ],
    },
    {
      id: "to-world",
      x: 9,
      y: 0,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch4-world", spawn: "from-majoria" }],
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
