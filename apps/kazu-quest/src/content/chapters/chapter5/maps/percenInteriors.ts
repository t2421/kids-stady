/* パーセンの建物内部 (宿・道具屋・まなびや・ほこら) */

import type { MapDef } from "../../../types";
import { INTERIOR_LEGEND, CASTLE_LEGEND } from "../../chapter1/legends";
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
      commands: [{ type: "transfer", mapId: "ch5-percen", spawn: outSpawn }],
    },
  ];
}

export const CH5_PERCEN_INN: MapDef = {
  id: "ch5-percen-inn",
  name: "パーセンの やどや",
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
      id: "inn5",
      x: 4,
      y: 2,
      art: "villager",
      movement: "static",
      dialog: [
        {
          pages: [
            "ひとばん 120ゴールド。きょうは 2わりびきで 96ゴールドに するよ!",
          ],
          then: [
            {
              type: "choice",
              prompt: "とまって いく? (96ゴールド)",
              yes: [{ type: "healInn", price: 96 }],
              no: [{ type: "message", pages: ["また おこしください!"] }],
            },
          ],
        },
      ],
    },
  ],
  events: exitEvents("ch5-percen-inn", "from-inn", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};

export const CH5_PERCEN_SHOP: MapDef = {
  id: "ch5-percen-shop",
  name: "パーセンの どうぐや",
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
      id: "shop5",
      x: 3,
      y: 3,
      art: "merchant",
      movement: "static",
      dialog: [
        {
          pages: [
            "いらっしゃい! ねだんは ぜんぶ 「もとの ねだんの なん%」で 書いてあるよ。",
            "ひかりの そうびも 入荷したよ!",
          ],
          then: [{ type: "openShop", shopId: "ch5-percen-shop" }],
        },
      ],
    },
  ],
  events: exitEvents("ch5-percen-shop", "from-shop", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};

export const CH5_PERCEN_MANABIYA: MapDef = {
  id: "ch5-percen-manabiya",
  name: "パーセンの まなびや",
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
      id: "scholar-percen",
      x: 4,
      y: 2,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          pages: [
            "ここは パーセンの まなびや。割合・小数・倍数約数を おしえておる。",
            "くらべる りょう ÷ もとに する りょう = わりあい。これが すべての もとじゃ!",
          ],
          then: spellTestMenu([
            { spellId: "percenFlare", label: "パーセンフレア (割合と百分率)" },
            { spellId: "shousuuStorm", label: "ショウスウストーム (小数の×÷)" },
            { spellId: "baiyakuBreak", label: "バイヤクブレイク (倍数と約数)" },
            { spellId: "heikinHeal", label: "ヘイキンヒール (平きん)" },
          ]),
        },
      ],
    },
  ],
  events: [
    ...exitEvents("ch5-percen-manabiya", "from-manabiya", 4, 5),
    {
      id: "percen-drill-board",
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

export const CH5_PERCEN_SHRINE: MapDef = {
  id: "ch5-percen-shrine",
  name: "パーセンの ほこら",
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
      id: "priest5",
      x: 4,
      y: 2,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          if: { flag: "c5.bossDefeated", op: "set" },
          pages: [
            "魔王を たおしても、まだ 空気が おもい…",
            "めがみスーリアが 「ほんとうの たたかいは これから」と おっしゃいます。",
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
          pages: ["ここは めがみスーリアの ほこら。ゆうしゃに ごかごを。"],
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
  events: exitEvents("ch5-percen-shrine", "from-shrine", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};
