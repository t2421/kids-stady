/*
 * 隊商の宿場 — さばくの みちの とちゅうにある キャラバンの まちば。
 * 建物は しめきり (すなあらし よけ) で、みせも まなびやも 外に 店を ひらいている。
 */

import type { MapDef } from "../../../types";
import { CH3_TOWN_LEGEND } from "../legends";
import { spellTestMenu } from "../../spellTestMenu";

export const CH3_CARAVAN: MapDef = {
  id: "ch3-caravan",
  name: "たいしょうの しゅくば",
  theme: "desert",
  legend: CH3_TOWN_LEGEND,
  grid: [
    "TTTTTTT=TTTTTTTT",
    "T......=.......T",
    "T.[RR].=.[RR]..T",
    "T.{__}.=.{__}..T",
    "T.WoWW.=.WWoW..T",
    "T......=.......T",
    "T.==========...T",
    "T......=.......T",
    "T..cc..=..~~~..T",
    "T......=..~~~..T",
    "TTTTTTTTTTTTTTTT",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "caravan-inn",
      x: 2,
      y: 5,
      art: "villager",
      movement: "static",
      dialog: [
        {
          pages: ["テントで やすんでいくかい? ひとばん 30ゴールドさ。"],
          then: [
            {
              type: "choice",
              prompt: "とまって いく?",
              yes: [{ type: "healInn", price: 30 }],
              no: [{ type: "message", pages: ["すなあらしに きをつけてな。"] }],
            },
          ],
        },
      ],
    },
    {
      id: "caravan-shop",
      x: 10,
      y: 5,
      art: "merchant",
      movement: "static",
      dialog: [
        {
          pages: ["たいしょうの みせだ。たびの ひつじゅひんが そろっているよ。"],
          then: [{ type: "openShop", shopId: "ch3-caravan-shop" }],
        },
      ],
    },
    {
      id: "caravan-scholar",
      x: 5,
      y: 7,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          pages: [
            "わしは たびの がくしゃじゃ。小数・分数・重さ・円を おしえておる。",
            "0.1が 10こ あつまると 1。おぼえておくと つよいぞ!",
          ],
          then: spellTestMenu([
            { spellId: "shousuuRain", label: "ショウスウレイン (小数)" },
            { spellId: "hafun", label: "ハーフン (分数)" },
            { spellId: "omosaPress", label: "オモサプレス (重さ)" },
            { spellId: "enCircle", label: "エンサークル (円と球)" },
          ]),
        },
      ],
    },
    {
      id: "caravan-priest",
      x: 13,
      y: 8,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          pages: ["たびの ぶじを めがみスーリアに いのりましょう。"],
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
    {
      id: "caravan-kid",
      x: 3,
      y: 1,
      art: "villager",
      movement: "wander",
      dialog: [
        {
          if: { flag: "c3.ruinsLit", op: "set" },
          pages: [
            "にしの 遺跡の 大灯りが ともったんだって!",
            "よるでも すなの みちが みえるように なったよ。ありがとう!",
          ],
        },
        {
          pages: [
            "にしに 大灯りの いせきが あるんだ。まるい 大きな 灯りが あるんだって。",
            "いまは きえてるけど、円の ことが わかる 人なら つけられるかも!",
          ],
        },
      ],
    },
  ],
  events: [
    {
      id: "caravan-drill-board",
      x: 12,
      y: 1,
      trigger: "inspect",
      art: "questBoard",
      commands: [
        {
          type: "message",
          pages: [
            "たいしょうの おだいの けいじばん だ。",
            "もんだいを といて ゴールドを かせごう!",
          ],
        },
        { type: "openDrillBoard" },
      ],
    },
    {
      id: "caravan-to-world",
      x: 7,
      y: 0,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch3-world", spawn: "from-caravan" }],
    },
  ],
  spawns: { entrance: { x: 7, y: 1, facing: "down" } },
};
