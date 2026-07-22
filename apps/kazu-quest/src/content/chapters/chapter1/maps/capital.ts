/* 王都カズール — 謁見・まなびや・宿・道具屋・ほこら (設計 A7 ビート3-4) */

import type { MapDef } from "../../../types";
import { VILLAGE_LEGEND } from "../legends";

export const CH1_CAPITAL: MapDef = {
  id: "ch1-capital",
  name: "おうと カズール",
  theme: "grass",
  legend: VILLAGE_LEGEND,
  grid: [
    "TTTTTTTTTTTTTTTTTTTT",
    "T....RRRRRRRR......T",
    "T....WWWWWWWW......T",
    "T....WFFFFFFW.RRRR.T",
    "T....WFFFFFFW.WWWW.T",
    "T....WFFFDFFW.WFDW.T",
    "T........=......=..T",
    "T..RRRR..=..RRRR...T",
    "T..WWWW..=..WWWW...T",
    "=..WFDW..=..WFDW...T",
    "=...=....=....=....T",
    "T...============...T",
    "T........=.........T",
    "TTTTTTTTT=TTTTTTTTTT",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "king",
      x: 8,
      y: 4,
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
            "まずは まなびやで じゅもんを おぼえるのじゃぞ。",
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
      x: 6,
      y: 4,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          pages: [
            "ここは まなびや。じゅもんの テストが うけられるぞ。",
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
    {
      id: "inn",
      x: 15,
      y: 5,
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
    {
      id: "shop",
      x: 4,
      y: 9,
      art: "villager",
      movement: "static",
      dialog: [
        {
          pages: ["いらっしゃい! どうぐやだよ。"],
          then: [{ type: "openShop", shopId: "ch1-capital-shop" }],
        },
      ],
    },
    {
      id: "priest",
      x: 13,
      y: 9,
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
  events: [
    {
      id: "to-kaido-1",
      x: 0,
      y: 9,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-kaido", spawn: "east" }],
    },
    {
      id: "to-forest",
      x: 9,
      y: 13,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-forest", spawn: "north" }],
    },
  ],
  spawns: {
    west: { x: 1, y: 9, facing: "right" },
    "from-forest": { x: 9, y: 12, facing: "up" },
    save: { x: 14, y: 9, facing: "left" },
  },
};
