/* モリカゲ村 — くりさがり呪文のストーリーゲート (設計 A7 ビート6) */

import type { MapDef } from "../../../types";
import { VILLAGE_LEGEND } from "../legends";

export const CH1_MORIKAGE: MapDef = {
  id: "ch1-morikage",
  name: "モリカゲむら",
  theme: "grass",
  legend: VILLAGE_LEGEND,
  grid: [
    "TTTTTTTTT=TTTTTTTTTT",
    "T........=.........T",
    "T..RRRR..=..RRRR...T",
    "T..WWWW..=..WWWW...T",
    "T..WFDW..=..WFDW...T",
    "T...=....=....=....T",
    "T...======....=....T",
    "T........==========T",
    "T.~~.....=.........=",
    "T.~~.....=.........T",
    "T........=....T....T",
    "T........=.........T",
    "TTTTTTTTT=TTTTTTTTTT",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "scholar2",
      x: 4,
      y: 4,
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
    {
      id: "inn2",
      x: 14,
      y: 4,
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
    {
      id: "bridge-guard",
      x: 19,
      y: 8,
      art: "villager",
      movement: "static",
      hideIf: { flag: "learned.hikidaman", op: "set" },
      dialog: [
        {
          pages: [
            "この さきは かぞえの どうくつ。",
            "くりさがりの じゅもん ヒキダマンが ないと きけんだ!",
            "まなびやで テストに ごうかく してきな。",
          ],
        },
      ],
    },
    {
      id: "villager2",
      x: 6,
      y: 8,
      art: "villager",
      movement: "static",
      dialog: [
        {
          if: { flag: "learned.hikidaman", op: "set" },
          pages: ["ヒキダマンを おぼえたんだね! どうくつは ひがしだよ。"],
        },
        {
          pages: ["どうくつの モンスターは かたいから じゅもんが ひつようだよ。"],
        },
      ],
    },
  ],
  events: [
    {
      id: "to-forest",
      x: 9,
      y: 0,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-forest", spawn: "south" }],
    },
    {
      id: "to-cave-1",
      x: 19,
      y: 8,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-cave", spawn: "west" }],
    },
  ],
  spawns: {
    north: { x: 9, y: 1, facing: "down" },
    "from-cave": { x: 18, y: 8, facing: "left" },
  },
};
