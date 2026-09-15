/* ワケーラの建物内部 (宿・道具屋・まなびや・ほこら) */

import type { MapDef } from "../../../types";
import { INTERIOR_LEGEND, CASTLE_LEGEND } from "../../chapter1/legends";
import { shrineMenu } from "../../shrineMenu";
import { teacherMenu } from "../../teacherMenu";

function exitEvents(
  mapId: string,
  outSpawn: string,
  doorX: number,
  doorY: number,
): MapDef["events"] {
  return [
    {
      id: `${mapId}-exit`,
      x: doorX,
      y: doorY,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch3-wakeera", spawn: outSpawn }],
    },
  ];
}

export const CH3_WAKEERA_INN: MapDef = {
  id: "ch3-wakeera-inn",
  name: "ワケーラの やどや",
  theme: "interior",
  legend: INTERIOR_LEGEND,
  grid: [
    "WwWWhWWwWW",
    "WBFFFFFFbW",
    "WBFnFnFFPW",
    "WBFFFFFFFW",
    "WFFFFFFFFW",
    "WWWWDWWWWW",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "inn3",
      x: 4,
      y: 2,
      art: "merchant",
      movement: "static",
      dialog: [
        {
          pages: ["さばくの たびは つかれるだろう。ひとばん 30ゴールドだよ。"],
          then: [
            {
              type: "choice",
              prompt: "とまって いく?",
              yes: [{ type: "healInn", price: 30 }],
              no: [{ type: "message", pages: ["また おいで!"] }],
            },
          ],
        },
      ],
    },
  ],
  events: exitEvents("ch3-wakeera-inn", "from-inn", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};

export const CH3_WAKEERA_SHOP: MapDef = {
  id: "ch3-wakeera-shop",
  name: "ワケーラの どうぐや",
  theme: "interior",
  legend: INTERIOR_LEGEND,
  grid: [
    "WwWWWWWwWW",
    "WkkkFFbbPW",
    "WFFFFFFFFW",
    "WFnFnFFbFW",
    "WFFFFFFFPW",
    "WWWWDWWWWW",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "shop3",
      x: 3,
      y: 3,
      art: "merchant",
      movement: "static",
      dialog: [
        {
          pages: [
            "いらっしゃい! さばくを こえてきた たいしょうの しなものだよ。",
            "はがねの そうびも あるよ!",
          ],
          then: [{ type: "openShop", shopId: "ch3-wakeera-shop" }],
        },
      ],
    },
  ],
  events: exitEvents("ch3-wakeera-shop", "from-shop", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};

export const CH3_WAKEERA_MANABIYA: MapDef = {
  id: "ch3-wakeera-manabiya",
  name: "ワケーラの まなびや",
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
      id: "scholar-wakeera",
      x: 4,
      y: 2,
      art: "calcMaster",
      movement: "static",
      dialog: [
        {
          pages: [
            "わしは 計算商人。ワケーラの まなびやで わり算と 大きな数を おしえておる。",
            "わり算は 「おなじ かずずつ わけること」。あまりが でることも あるぞ。",
          ],
          then: teacherMenu([
            { skillId: "g3_div", label: "わり算", spellIds: ["waridama"] },
            { skillId: "g3_div_remainder", label: "あまりの ある わり算", spellIds: ["amariBind"] },
            { skillId: "g3_mul_column", label: "かけ算の ひっさん", spellIds: ["ketaCrush"] },
            { skillId: "g3_big_number", label: "大きい数", spellIds: ["manLight"] },
          ]),
        },
      ],
    },
  ],
  events: [
    ...exitEvents("ch3-wakeera-manabiya", "from-manabiya", 4, 5),
    {
      id: "wakeera-drill-board",
      x: 8,
      y: 1,
      trigger: "inspect",
      art: "questBoard",
      commands: [
        {
          type: "message",
          pages: [
            "おだいの けいじばん だ。",
            "もんだいを といて ゴールドを かせごう!",
          ],
        },
        { type: "openDrillBoard" },
      ],
    },
  ],
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};

export const CH3_WAKEERA_SHRINE: MapDef = {
  id: "ch3-wakeera-shrine",
  name: "ワケーラの ほこら",
  theme: "interior",
  legend: CASTLE_LEGEND,
  grid: [
    "WWgWWWWgWW",
    "WSSSaSSSSW",
    "WScSrScSSW",
    "WSSSrSSSSW",
    "WSSSrSSSSW",
    "WWWWDWWWWW",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "priest3",
      x: 4,
      y: 2,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          if: { flag: "c3.bossDefeated", op: "set" },
          pages: [
            "アマリダを たおしたのですね。さばくに へいわが もどります。",
            "めがみスーリアの ごかごが ありますように。",
          ],
          then: shrineMenu(),
        },
        {
          pages: [
            "ここは めがみスーリアの ほこら。さばくの たびびとを まもっています。",
          ],
          then: shrineMenu(),
        },
      ],
    },
  ],
  events: exitEvents("ch3-wakeera-shrine", "from-shrine", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};
