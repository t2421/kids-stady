/*
 * 建物内部マップ (設計変更 2026-07-22: DQ同様、扉から中に入って移動できる)。
 * 各内部の spawn "start" は扉のすぐ内側。扉 (D) を踏むと外へ戻る。
 */

import type { MapDef } from "../../../types";
import { INTERIOR_LEGEND } from "../legends";

function exitEvents(
  mapId: string,
  outMapId: string,
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
      commands: [{ type: "transfer", mapId: outMapId, spawn: outSpawn }],
    },
  ];
}

/* ハジマリ村: ゆうしゃの家 (母) */
export const CH1_HAJIMARI_HOME: MapDef = {
  id: "ch1-hajimari-home",
  name: "ゆうしゃの いえ",
  theme: "interior",
  legend: INTERIOR_LEGEND,
  grid: [
    "WWWWWWWWWW",
    "WBFFTTFFPW",
    "WBFFTTFFFW",
    "WFFCCCCFFW",
    "WFFCCCCFFW",
    "WFFFFFFFFW",
    "WWWWDWWWWW",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "mother",
      x: 6,
      y: 2,
      art: "mother",
      movement: "static",
      dialog: [
        {
          if: { flag: "c1.metKing", op: "set" },
          pages: ["きをつけて いくのよ。", "おうえん してるからね!"],
        },
        {
          pages: [
            "おはよう! 10さいの たんじょうび おめでとう!",
            "たいへん! カズールの おうさまが あなたを よんでいるの。",
            "むらの ひがしの みちから おうとに いけるわ。",
          ],
          then: [{ type: "setFlag", flag: "c1.started" }],
        },
      ],
    },
  ],
  events: exitEvents("hajimari-home", "ch1-hajimari", "from-home", 4, 6),
  spawns: { start: { x: 4, y: 5, facing: "up" } },
};

/* ハジマリ村: となりの家 */
export const CH1_HAJIMARI_NEIGHBOR: MapDef = {
  id: "ch1-hajimari-neighbor",
  name: "むらびとの いえ",
  theme: "interior",
  legend: INTERIOR_LEGEND,
  grid: [
    "WWWWWWWWWW",
    "WPFFFFFTBW",
    "WFFFFFFTBW",
    "WFFFFFFFFW",
    "WFFFFFFFFW",
    "WWWWDWWWWW",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "neighbor",
      x: 3,
      y: 2,
      art: "villager",
      movement: "static",
      dialog: [
        {
          pages: [
            "ケシケシぐんだんの せいで かんばんの すうじが きえてしまってね…",
            "はやく もとに もどると いいんだけど。",
          ],
        },
      ],
    },
  ],
  events: exitEvents("hajimari-neighbor", "ch1-hajimari", "from-neighbor", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};

/* 王都: カズール城 (王様 + まなびや) */
export const CH1_CAPITAL_CASTLE: MapDef = {
  id: "ch1-capital-castle",
  name: "カズールじょう",
  theme: "interior",
  legend: INTERIOR_LEGEND,
  grid: [
    "WWWWWWWWWWWWWW",
    "WFFFFFCCFFFFFW",
    "WFTFFFCCFFFTFW",
    "WFFFFFCCFFFFFW",
    "WFFFFFCCFFFFFW",
    "WFFFFFCCFFFFFW",
    "WPFFFFCCFFFFPW",
    "WWWWWWDWWWWWWW",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "king",
      x: 6,
      y: 1,
      art: "king",
      movement: "static",
      dialog: [
        {
          if: { flag: "c1.orb1", op: "set" },
          pages: [
            "おお ゆうしゃよ! すうしょうを とりもどしたか!",
            "みごとじゃ! これで まちの かずが もとに もどる。",
            "つぎは みなとまち ミナトスへ… それは また こんどの おはなし。",
          ],
          then: [{ type: "setFlag", flag: "c1.clear" }],
        },
        {
          if: { flag: "c1.metKing", op: "set" },
          pages: [
            "かぞえの どうくつは モリカゲむらの さきじゃ。",
            "まずは となりの まなびやで じゅもんを おぼえるのじゃぞ。",
          ],
        },
        {
          pages: [
            "よくきた ゆうしゃの こよ。わしが カウントおうじゃ。",
            "ケシケシぐんだんに 「すうしょう・壱」を うばわれてしもうた…",
            "とりもどして くれぬか。したくきんに 50ゴールド さずけよう!",
            "みなみの もりの さきに かぞえの どうくつが ある。",
          ],
          then: [
            { type: "giveGold", amount: 50 },
            { type: "setFlag", flag: "c1.metKing" },
          ],
        },
      ],
    },
    {
      id: "scholar",
      x: 2,
      y: 3,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          pages: [
            "ここは しろの まなびや。じゅもんの テストが うけられるぞ。",
            "10もん中 8もん せいかいで ごうかくじゃ!",
          ],
          then: [
            {
              type: "choice",
              prompt: "ヒキダマ (ひきざん) の テスト?",
              yes: [{ type: "openSpellTest", spellId: "hikidama" }],
              no: [
                {
                  type: "choice",
                  prompt: "タシリア (たしざん) の テスト?",
                  yes: [{ type: "openSpellTest", spellId: "tashiria" }],
                  no: [
                    {
                      type: "choice",
                      prompt: "かぞえスラッシュ (かぞえる) の テスト?",
                      yes: [{ type: "openSpellTest", spellId: "kazoeSlash" }],
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
  events: exitEvents("capital-castle", "ch1-capital", "from-castle", 6, 7),
  spawns: { start: { x: 6, y: 6, facing: "up" } },
};

/* 王都: 宿屋 */
export const CH1_CAPITAL_INN: MapDef = {
  id: "ch1-capital-inn",
  name: "カズールの やどや",
  theme: "interior",
  legend: INTERIOR_LEGEND,
  grid: [
    "WWWWWWWWWW",
    "WBFFFFFTPW",
    "WBFFFFFTFW",
    "WBFFFFFFFW",
    "WFFFFFFFFW",
    "WWWWDWWWWW",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "inn",
      x: 7,
      y: 3,
      art: "villager",
      movement: "static",
      dialog: [
        {
          pages: ["やどやへ ようこそ。ひとばん 10ゴールドだよ。"],
          then: [
            {
              type: "choice",
              prompt: "とまって いく?",
              yes: [{ type: "healInn", price: 10 }],
              no: [{ type: "message", pages: ["また きてね!"] }],
            },
          ],
        },
      ],
    },
  ],
  events: exitEvents("capital-inn", "ch1-capital", "from-inn", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};

/* 王都: 道具屋 */
export const CH1_CAPITAL_SHOP: MapDef = {
  id: "ch1-capital-shop",
  name: "カズールの どうぐや",
  theme: "interior",
  legend: INTERIOR_LEGEND,
  grid: [
    "WWWWWWWWWW",
    "WPFTTTTFPW",
    "WFFFFFFFFW",
    "WFFFFFFFFW",
    "WFFFFFFFPW",
    "WWWWDWWWWW",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "shop",
      x: 4,
      y: 2,
      art: "villager",
      movement: "static",
      dialog: [
        {
          pages: ["いらっしゃい! どうぐやだよ。"],
          then: [{ type: "openShop", shopId: "ch1-capital-shop" }],
        },
      ],
    },
  ],
  events: exitEvents("capital-shop", "ch1-capital", "from-shop", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};

/* 王都: めがみのほこら */
export const CH1_CAPITAL_SHRINE: MapDef = {
  id: "ch1-capital-shrine",
  name: "めがみの ほこら",
  theme: "interior",
  legend: INTERIOR_LEGEND,
  grid: [
    "WWWWWWWWWW",
    "WFFFCCFFFW",
    "WFFFCCFFFW",
    "WFFFCCFFFW",
    "WFFFCCFFFW",
    "WWWWDWWWWW",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "priest",
      x: 4,
      y: 1,
      art: "scholar",
      movement: "static",
      dialog: [
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
  events: exitEvents("capital-shrine", "ch1-capital", "from-shrine", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};

/* モリカゲ村: まなびや */
export const CH1_MORIKAGE_MANABIYA: MapDef = {
  id: "ch1-morikage-manabiya",
  name: "モリカゲの まなびや",
  theme: "interior",
  legend: INTERIOR_LEGEND,
  grid: [
    "WWWWWWWWWW",
    "WPFTTTTFFW",
    "WFFFFFFFFW",
    "WFTTFFTTFW",
    "WFFFFFFFFW",
    "WWWWDWWWWW",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "scholar2",
      x: 4,
      y: 2,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          pages: [
            "ここは モリカゲの まなびや。",
            "くりあがり・くりさがりは 「10のまとまり」で かんがえるのじゃ。",
          ],
          then: [
            {
              type: "choice",
              prompt: "ヒキダマン (くりさがり) の テスト?",
              yes: [{ type: "openSpellTest", spellId: "hikidaman" }],
              no: [
                {
                  type: "choice",
                  prompt: "タシリアン (くりあがり) の テスト?",
                  yes: [{ type: "openSpellTest", spellId: "tashirian" }],
                  no: [
                    {
                      type: "choice",
                      prompt: "くらべシールド (くらべる) の テスト?",
                      yes: [{ type: "openSpellTest", spellId: "kurabeShield" }],
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
  events: exitEvents("morikage-manabiya", "ch1-morikage", "from-manabiya", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};

/* モリカゲ村: 宿屋 */
export const CH1_MORIKAGE_INN: MapDef = {
  id: "ch1-morikage-inn",
  name: "モリカゲの やどや",
  theme: "interior",
  legend: INTERIOR_LEGEND,
  grid: [
    "WWWWWWWWWW",
    "WBFFFFFBFW",
    "WBFFFFFBFW",
    "WFFFFFFFFW",
    "WFTTFFFFPW",
    "WWWWDWWWWW",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "inn2",
      x: 6,
      y: 3,
      art: "villager",
      movement: "static",
      dialog: [
        {
          pages: ["やどやだよ。ひとばん 10ゴールド。"],
          then: [
            {
              type: "choice",
              prompt: "とまって いく?",
              yes: [{ type: "healInn", price: 10 }],
              no: [],
            },
          ],
        },
      ],
    },
  ],
  events: exitEvents("morikage-inn", "ch1-morikage", "from-inn", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};
