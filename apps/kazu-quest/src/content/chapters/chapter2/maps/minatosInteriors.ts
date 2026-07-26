/* ミナトスの建物内部 (宿・道具屋・まなびや・ほこら) */

import type { MapDef } from "../../../types";
import { INTERIOR_LEGEND, CASTLE_LEGEND } from "../../chapter1/legends";

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
      commands: [{ type: "transfer", mapId: "ch2-minatos", spawn: outSpawn }],
    },
  ];
}

export const CH2_MINATOS_INN: MapDef = {
  id: "ch2-minatos-inn",
  name: "ミナトスの やどや",
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
      id: "inn",
      x: 4,
      y: 2,
      art: "villager",
      movement: "static",
      dialog: [
        {
          pages: ["やどやへ ようこそ。ひとばん 15ゴールドだよ。"],
          then: [
            {
              type: "choice",
              prompt: "とまって いく?",
              yes: [{ type: "healInn", price: 15 }],
              no: [{ type: "message", pages: ["また きてね!"] }],
            },
          ],
        },
      ],
    },
  ],
  events: exitEvents("ch2-minatos-inn", "from-inn", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};

export const CH2_MINATOS_SHOP: MapDef = {
  id: "ch2-minatos-shop",
  name: "ミナトスの どうぐや",
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
      id: "shop",
      x: 3,
      y: 3,
      art: "villager",
      movement: "static",
      dialog: [
        {
          pages: ["いらっしゃい! 港いちばんの どうぐやだよ。てつの そうびが はいったんだ。"],
          then: [{ type: "openShop", shopId: "ch2-minatos-shop" }],
        },
      ],
    },
  ],
  events: exitEvents("ch2-minatos-shop", "from-shop", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};

export const CH2_MINATOS_MANABIYA: MapDef = {
  id: "ch2-minatos-manabiya",
  name: "ミナトスの まなびや",
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
      id: "scholar3",
      x: 4,
      y: 2,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          pages: [
            "ここは ミナトスの まなびや。九九と ひっさんを おしえておるぞ。",
            "九九は 「なんばんめの だんか」を おぼえるのが コツじゃ!",
          ],
          then: [
            {
              type: "choice",
              prompt: "ククダマ (九九) の テスト?",
              yes: [{ type: "openSpellTest", spellId: "kukudama" }],
              no: [
                {
                  type: "choice",
                  prompt: "ヒッサンブレイク (ひっさん) の テスト?",
                  yes: [{ type: "openSpellTest", spellId: "hissanBreak" }],
                  no: [
                    {
                      type: "choice",
                      prompt: "タシリアーダ (ぜんいん かいふく) の テスト?",
                      yes: [{ type: "openSpellTest", spellId: "tashiriada" }],
                      no: [{ type: "message", pages: ["また おいで!"] }],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  events: [
    ...exitEvents("ch2-minatos-manabiya", "from-manabiya", 4, 5),
    {
      id: "minatos-drill-board",
      x: 8,
      y: 1,
      trigger: "inspect",
      art: "questBoard",
      commands: [
        {
          type: "message",
          pages: ["おだいの けいじばん だ。", "もんだいを といて ゴールドを かせごう!"],
        },
        { type: "openDrillBoard" },
      ],
    },
  ],
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};

export const CH2_MINATOS_SHRINE: MapDef = {
  id: "ch2-minatos-shrine",
  name: "ミナトスの ほこら",
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
      id: "priest2",
      x: 4,
      y: 2,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          if: { flag: "c2.metTasuku", op: "set" },
          pages: [
            "タスクを つれていって くれたのじゃな。よろしく たのむぞ。",
            "ここは めがみスーリアの ほこら。",
          ],
          then: [
            {
              type: "choice",
              prompt: "ぼうけんを きろくする?",
              yes: [{ type: "savePoint" }],
              no: [],
            },
          ],
        },
        {
          pages: ["ここは めがみスーリアの ほこら。"],
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
  events: exitEvents("ch2-minatos-shrine", "from-shrine", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};
