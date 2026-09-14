/*
 * ノコリビの村 — ネガリアに ただ ひとつ のこった 「あかり」の 村。
 * ゼロムに 数を けされても、ここの 人たちは かぞえることを やめなかった。
 */

import type { MapDef } from "../../../types";
import { CH6_TOWN_LEGEND } from "../legends";
import { shrineMenu } from "../../shrineMenu";
import { spellTestMenu } from "../../spellTestMenu";

export const CH6_NOKORIBI: MapDef = {
  id: "ch6-nokoribi",
  name: "ノコリビの むら",
  theme: "grass",
  legend: CH6_TOWN_LEGEND,
  grid: [
    "TTTTTTT=TTTTTTTT",
    "T......=.......T",
    "T.[RR].=.[RR]..T",
    "T.{__}.=.{__}..T",
    "T.WoWW.=.WWoW..T",
    "T......=.......T",
    "T.==========...T",
    "T......=.......T",
    "T..uu..=..fyf..T",
    "T......=.......T",
    "TTTTTTTTTTTTTTTT",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "nokoribi-inn",
      x: 2,
      y: 5,
      art: "villager",
      movement: "static",
      dialog: [
        {
          pages: [
            "上の せかいの 人かい!? …ゆっくり やすんでいきな。300ゴールドだ。",
          ],
          then: [
            {
              type: "choice",
              prompt: "とまって いく?",
              yes: [{ type: "healInn", price: 300 }],
              no: [{ type: "message", pages: ["あかりは けさないよ。"] }],
            },
          ],
        },
      ],
    },
    {
      id: "nokoribi-shop",
      x: 10,
      y: 5,
      art: "merchant",
      movement: "static",
      dialog: [
        {
          pages: ["のこりものばかりだが、たびの やくには 立つはずだ。"],
          then: [{ type: "openShop", shopId: "ch6-nokoribi-shop" }],
        },
      ],
    },
    {
      id: "nokoribi-scholar",
      x: 5,
      y: 7,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          pages: [
            "わしは ノコリビの ものしり。速さ・円・比・場合の数を つたえておる。",
            "速さ = 道のり ÷ 時間。これを わすれねば ゼロムの 「時を とめる」まほうも こわくない。",
          ],
          then: spellTestMenu([
            { spellId: "speedStar", label: "スピードスター (速さ)" },
            { spellId: "enNoHadou", label: "エンノハドウ (円の面せき)" },
            { spellId: "ratioBreak", label: "レシオブレイク (比)" },
            { spellId: "baainoKazu", label: "バアイノカズ (場合の数)" },
          ]),
        },
      ],
    },
    {
      id: "nokoribi-priest",
      x: 13,
      y: 5,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          pages: ["めがみスーリアの こえは ここまで とどきます。きろくしますか。"],
          then: shrineMenu(),
        },
      ],
    },
    {
      id: "nokoribi-child",
      x: 3,
      y: 1,
      art: "villager",
      movement: "wander",
      dialog: [
        {
          if: { flag: "c6.trialSeal", op: "set" },
          pages: [
            "3つの 印が そろったんだね! すごい!",
            "ゼロム城の 門が ひらくよ。…きをつけてね。",
          ],
        },
        {
          pages: [
            "ゼロムは 「1」も 「100」も ぜんぶ 0に しちゃうんだ。",
            "でも ぼくは かぞえるのを やめないよ。1、2、3…!",
          ],
        },
      ],
    },
  ],
  events: [
    {
      id: "nokoribi-drill-board",
      x: 12,
      y: 1,
      trigger: "inspect",
      art: "questBoard",
      commands: [
        {
          type: "message",
          pages: [
            "ノコリビの おだいの けいじばん だ。",
            "もんだいを といて ゴールドを かせごう!",
          ],
        },
        { type: "openDrillBoard" },
      ],
    },
    {
      id: "nokoribi-to-world",
      x: 7,
      y: 0,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch6-world", spawn: "from-nokoribi" },
      ],
    },
  ],
  spawns: { entrance: { x: 7, y: 1, facing: "down" } },
};
