/*
 * 雪村コゴエ — 魔法使いリトルの ふるさと。小さな村だが 小数と分数に くわしい。
 * 家は しめきり (ふぶき よけ) で、みせも まなびやも おもてで ひらいている。
 */

import type { MapDef } from "../../../types";
import { CH4_TOWN_LEGEND } from "../legends";
import { shrineMenu } from "../../shrineMenu";
import { teacherMenu } from "../../teacherMenu";

export const CH4_KOGOE: MapDef = {
  id: "ch4-kogoe",
  name: "ゆきむら コゴエ",
  theme: "snow",
  legend: CH4_TOWN_LEGEND,
  grid: [
    "TTTTTTT=TTTTTTTT",
    "T......=.......T",
    "T.[RR].=.[RR]..T",
    "T.{__}.=.{__}..T",
    "T.WoWW.=.WWoW..T",
    "T......=.......T",
    "T.==========...T",
    "T......=.......T",
    "T..rr..=..rrr..T",
    "T......=.......T",
    "TTTTTTTTTTTTTTTT",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "kogoe-inn",
      x: 2,
      y: 5,
      art: "snowVillager",
      movement: "static",
      dialog: [
        {
          pages: ["さむかったろう。ひとばん 50ゴールドで あたたまって いきな。"],
          then: [
            {
              type: "choice",
              prompt: "とまって いく?",
              yes: [{ type: "healInn", price: 50 }],
              no: [{ type: "message", pages: ["ふぶきに きをつけて。"] }],
            },
          ],
        },
      ],
    },
    {
      id: "kogoe-shop",
      x: 10,
      y: 5,
      art: "snowVillager",
      movement: "static",
      dialog: [
        {
          pages: ["コゴエの みせだよ。たびの どうぐを そろえていきな。"],
          then: [{ type: "openShop", shopId: "ch4-kogoe-shop" }],
        },
      ],
    },
    {
      id: "kogoe-scholar",
      x: 5,
      y: 7,
      art: "scaleQueen",
      movement: "static",
      dialog: [
        {
          pages: [
            "わたくしは はかりの女王。コゴエでは 小数・分数・わり算・グラフを おしえています。",
            "1/4 と 2/4 は 分母が おなじだから そのまま たせるぞ!",
          ],
          then: teacherMenu([
            { skillId: "g4_decimal", label: "小数の計算", spellIds: ["decimaFreeze"] },
            { skillId: "g4_fraction_same", label: "同分母の分数", spellIds: ["bunsuuHeal"] },
            { skillId: "g4_div_2digit", label: "2けたで わる わり算", spellIds: ["warikiriBlade"] },
            { skillId: "g4_graph", label: "ひょうと グラフ", spellIds: ["graphEye"] },
          ]),
        },
      ],
    },
    {
      id: "kogoe-priest",
      x: 13,
      y: 5,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          pages: ["めがみスーリアに ぶじを いのりましょう。"],
          then: shrineMenu(),
        },
      ],
    },
    {
      id: "little-mother",
      x: 3,
      y: 1,
      art: "mother",
      movement: "static",
      dialog: [
        {
          if: { flag: "c4.metLittle", op: "set" },
          pages: [
            "リトルを つれていって くれて ありがとう。",
            "あの子は ちいさいけど 小数の ことなら だれにも まけないの。",
          ],
        },
        {
          pages: [
            "むすめの リトルは 東の 氷の洞くつで けんきゅうを しているの。",
            "「0.1の ひみつを といたら 魔人にも まけない」って…",
            "しんぱいだわ。ようすを 見てきて くれない?",
          ],
        },
      ],
    },
  ],
  events: [
    {
      id: "kogoe-drill-board",
      x: 12,
      y: 1,
      trigger: "inspect",
      art: "questBoard",
      commands: [
        {
          type: "message",
          pages: [
            "コゴエの おだいの けいじばん だ。",
            "もんだいを といて ゴールドを かせごう!",
          ],
        },
        { type: "openDrillBoard" },
      ],
    },
    {
      id: "kogoe-to-world",
      x: 7,
      y: 0,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch4-world", spawn: "from-kogoe" }],
    },
  ],
  spawns: { entrance: { x: 7, y: 1, facing: "down" } },
};
