/* メジャーリアの建物内部 (宿・道具屋・まなびや・ほこら) */

import type { MapDef } from "../../../types";
import { INTERIOR_LEGEND, CASTLE_LEGEND } from "../../chapter1/legends";
import { shrineMenu } from "../../shrineMenu";
import { spellTestMenu } from "../../spellTestMenu";

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
      commands: [{ type: "transfer", mapId: "ch4-majoria", spawn: outSpawn }],
    },
  ];
}

export const CH4_MAJORIA_INN: MapDef = {
  id: "ch4-majoria-inn",
  name: "メジャーリアの やどや",
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
      id: "inn4",
      x: 4,
      y: 2,
      art: "snowVillager",
      movement: "static",
      dialog: [
        {
          pages: ["だんろの ある へやだよ。ひとばん 60ゴールド。"],
          then: [
            {
              type: "choice",
              prompt: "とまって いく?",
              yes: [{ type: "healInn", price: 60 }],
              no: [{ type: "message", pages: ["また おいで!"] }],
            },
          ],
        },
      ],
    },
  ],
  events: exitEvents("ch4-majoria-inn", "from-inn", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};

export const CH4_MAJORIA_SHOP: MapDef = {
  id: "ch4-majoria-shop",
  name: "メジャーリアの どうぐや",
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
      id: "shop4",
      x: 3,
      y: 3,
      art: "measurer",
      movement: "static",
      dialog: [
        {
          pages: [
            "いらっしゃい。ぶきの ながさも おもさも きっちり はかってあるよ。",
            "こおりの そうびは いかが?",
          ],
          then: [{ type: "openShop", shopId: "ch4-majoria-shop" }],
        },
      ],
    },
  ],
  events: exitEvents("ch4-majoria-shop", "from-shop", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};

export const CH4_MAJORIA_MANABIYA: MapDef = {
  id: "ch4-majoria-manabiya",
  name: "メジャーリアの まなびや",
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
      id: "scholar-majoria",
      x: 4,
      y: 2,
      art: "measurer",
      movement: "static",
      dialog: [
        {
          pages: [
            "ここは メジャーリアの まなびや。角度・面せき・大きな数を おしえておる。",
            "直角は 90ど。はんたいむきの 一直線は 180ど。おぼえておきなさい!",
          ],
          then: spellTestMenu([
            { spellId: "kakudoSpin", label: "カクドスピン (角度)" },
            { spellId: "mensekiWall", label: "メンセキウォール (面せき)" },
            { spellId: "octoBillion", label: "オクトビリオン (億と兆)" },
            { spellId: "gaisuuBomb", label: "ガイスウボム (がい数)" },
          ]),
        },
      ],
    },
  ],
  events: [
    ...exitEvents("ch4-majoria-manabiya", "from-manabiya", 4, 5),
    {
      id: "majoria-drill-board",
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

export const CH4_MAJORIA_SHRINE: MapDef = {
  id: "ch4-majoria-shrine",
  name: "メジャーリアの ほこら",
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
      id: "priest4",
      x: 4,
      y: 2,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          if: { flag: "c4.bossDefeated", op: "set" },
          pages: [
            "デシマロンを たおしたのですね。ゆきも やわらかく なりました。",
            "めがみスーリアが あなたを みまもって います。",
          ],
          then: shrineMenu(),
        },
        {
          pages: ["ここは めがみスーリアの ほこら。こごえた たびびとを むかえます。"],
          then: shrineMenu(),
        },
      ],
    },
  ],
  events: exitEvents("ch4-majoria-shrine", "from-shrine", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};
