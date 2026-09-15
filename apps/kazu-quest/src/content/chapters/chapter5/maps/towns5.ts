/*
 * バーゲンの町 と ブンスウ島 — 第5章の小さな町 (おもてで みせを ひらく形式)。
 * 呪文テストは パーセン4つ・バーゲン2つ・ブンスウ2つに わけている。
 */

import type { MapDef } from "../../../types";
import { CH5_TOWN_LEGEND } from "../legends";
import { shrineMenu } from "../../shrineMenu";
import { teacherMenu } from "../../teacherMenu";

export const CH5_BARGAIN: MapDef = {
  id: "ch5-bargain",
  name: "バーゲンの まち",
  theme: "grass",
  legend: CH5_TOWN_LEGEND,
  grid: [
    "TTTTTTT=TTTTTTTT",
    "T......=.......T",
    "T.[RR].=.[RR]..T",
    "T.{__}.=.{__}..T",
    "T.WoWW.=.WWoW..T",
    "T......=.......T",
    "T.==========...T",
    "T......=.......T",
    "T..hh..=..fyf..T",
    "T......=.......T",
    "TTTTTTTTTTTTTTTT",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "bargain-inn",
      x: 2,
      y: 5,
      art: "villager",
      movement: "static",
      dialog: [
        {
          pages: ["やすうりの まちだよ! ひとばん 80ゴールド。"],
          then: [
            {
              type: "choice",
              prompt: "とまって いく?",
              yes: [{ type: "healInn", price: 80 }],
              no: [{ type: "message", pages: ["また どうぞ!"] }],
            },
          ],
        },
      ],
    },
    {
      id: "bargain-shop",
      x: 10,
      y: 5,
      art: "merchant",
      movement: "static",
      dialog: [
        {
          pages: [
            "きょうは 3わりびきの 大バーゲン!",
            "もとの ねだんの 70%で かえるってことさ!",
          ],
          then: [{ type: "openShop", shopId: "ch5-bargain-shop" }],
        },
      ],
    },
    {
      id: "bargain-scholar",
      x: 5,
      y: 7,
      art: "percentGuildMaster",
      movement: "static",
      dialog: [
        {
          pages: [
            "わたしは 割合ギルド長だ。1あたりの りょうを かんがえると、どっちが おとくか すぐ わかる。",
            "3こ 240円と 5こ 380円、どっちが やすい? …単位量あたりの 出番だ!",
          ],
          then: teacherMenu([
            { skillId: "g5_unit_rate", label: "単位量あたり", spellIds: ["tanniAttack"] },
            { skillId: "g5_volume", label: "体せき", spellIds: ["taisekiPress"] },
          ]),
        },
      ],
    },
    {
      id: "bargain-priest",
      x: 13,
      y: 5,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          pages: ["たびの ぶじを めがみスーリアに いのりましょう。"],
          then: shrineMenu(),
        },
      ],
    },
  ],
  events: [
    {
      id: "bargain-drill-board",
      x: 12,
      y: 1,
      trigger: "inspect",
      art: "questBoard",
      commands: [
        {
          type: "message",
          pages: [
            "バーゲンの おだいの けいじばん だ。",
            "もんだいを といて ゴールドを かせごう!",
          ],
        },
        { type: "openDrillBoard" },
      ],
    },
    {
      id: "bargain-to-world",
      x: 7,
      y: 0,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch5-world", spawn: "from-bargain" }],
    },
  ],
  spawns: { entrance: { x: 7, y: 1, facing: "down" } },
};

export const CH5_BUNSUU: MapDef = {
  id: "ch5-bunsuu",
  name: "ブンスウとう",
  theme: "grass",
  legend: CH5_TOWN_LEGEND,
  grid: [
    "TTTTTTT=TTTTTTTT",
    "T......=.......T",
    "T.[RR].=.[RR]..T",
    "T.{__}.=.{__}..T",
    "T.WoWW.=.WWoW..T",
    "T......=.......T",
    "T.==========...T",
    "T......=.......T",
    "T..~~..=..~~~..T",
    "T..~~..=..~~~..T",
    "TTTTTTTTTTTTTTTT",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "bunsuu-inn",
      x: 2,
      y: 5,
      art: "villager",
      movement: "static",
      dialog: [
        {
          pages: ["しまの やどだよ。ひとばん 90ゴールド。"],
          then: [
            {
              type: "choice",
              prompt: "とまって いく?",
              yes: [{ type: "healInn", price: 90 }],
              no: [{ type: "message", pages: ["いい なみの 音でしょう。"] }],
            },
          ],
        },
      ],
    },
    {
      id: "bunsuu-scholar",
      x: 10,
      y: 5,
      art: "percentGuildMaster",
      movement: "static",
      dialog: [
        {
          pages: [
            "わたしも 割合ギルドの一員だ。この しまは 6つの 島が 1/2、1/3、1/6… と わかれておる。",
            "分母が ちがう 分数は 通分してから たすのじゃ!",
          ],
          then: teacherMenu([
            { skillId: "g5_fraction_diff", label: "異分母の分数", spellIds: ["tsuubunSlash"] },
            { skillId: "g5_area", label: "三角形の面せき", spellIds: ["sankakuMirror"] },
          ]),
        },
      ],
    },
    {
      id: "bunsuu-priest",
      x: 5,
      y: 7,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          pages: ["しまの ほこらです。ぼうけんを きろくして いきますか。"],
          then: shrineMenu(),
        },
      ],
    },
    {
      id: "bunsuu-fisher",
      x: 13,
      y: 7,
      art: "villager",
      movement: "wander",
      dialog: [
        {
          if: { flag: "c5.seaKey", op: "set" },
          pages: [
            "海底神殿から もどってきたのか! 波のかぎを 見せてくれよ。",
            "…すごい。これで きたの 城の 門も ひらくな。",
          ],
        },
        {
          pages: [
            "みなみの 海の そこに ふるい 神殿が しずんでいるんだ。",
            "でも 「星のかぎ」が ないと もぐれない。空中庭園に あるらしいぞ。",
          ],
        },
      ],
    },
  ],
  events: [
    {
      id: "bunsuu-drill-board",
      x: 12,
      y: 1,
      trigger: "inspect",
      art: "questBoard",
      commands: [
        {
          type: "message",
          pages: [
            "ブンスウ島の おだいの けいじばん だ。",
            "もんだいを といて ゴールドを かせごう!",
          ],
        },
        { type: "openDrillBoard" },
      ],
    },
    {
      id: "bunsuu-to-world",
      x: 7,
      y: 0,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch5-world", spawn: "from-bunsuu" }],
    },
  ],
  spawns: { entrance: { x: 7, y: 1, facing: "down" } },
};
