/*
 * 第5章のワールド「わりあいの だいち」— 船で 西の港に着く。
 * パーセンの都 P / バーゲンの町 b / ブンスウ島 v / 空中庭園 G /
 * 海底神殿 S / マイナドス城 K。
 *
 * 順番の関門: 空中庭園で 星のかぎ → 海底神殿で 波のかぎ → 城の門。
 * それぞれ 番人NPCが 道をふさぐ (hideIf でフラグが立つと消える)。
 */

import type { MapDef } from "../../../types";
import { CH5_WORLD_LEGEND } from "../legends";

export const CH5_WORLD: MapDef = {
  id: "ch5-world",
  name: "わりあいの だいち",
  theme: "grass",
  legend: CH5_WORLD_LEGEND,
  grid: [
    "~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~.....TT....MKM..........~",
    "~............=...r.......~",
    "~......=============..MM.~",
    "~......=P=.........=.GM..~",
    "~..**..=...........=.....~",
    "~......=...**......=..MM.~",
    "~......=...........=.....~",
    "~=======............=....~",
    "~......======b======.....~",
    "~......=...........=.....~",
    "~..T...=...........=~..T.~",
    "~......=...........=S~...~",
    "~.v=====............~....~",
    "~....*...........*.......~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~",
  ],
  encounterTableId: "ch5-field",
  npcs: [
    {
      id: "percen-captain",
      x: 2,
      y: 8,
      art: "villager",
      movement: "static",
      dialog: [
        {
          pages: [
            "ここは わりあいの だいちの にしの みなと。",
            "こおりの国へ もどるかい?",
          ],
          then: [
            {
              type: "choice",
              prompt: "船で こおりの国 メジャーリアへ もどる?",
              yes: [
                { type: "message", pages: ["それじゃ しゅっぱーつ!"] },
                { type: "transfer", mapId: "ch4-world", spawn: "from-ship" },
              ],
              no: [{ type: "message", pages: ["きをつけて いってらっしゃい。"] }],
            },
          ],
        },
      ],
    },
    {
      id: "sky-guide",
      x: 19,
      y: 5,
      art: "villager",
      movement: "static",
      dialog: [
        {
          if: { flag: "c5.skyKey", op: "set" },
          pages: [
            "星のかぎを 手に入れたんだね! それが あれば 海に もぐれるよ。",
            "みなみの 海底神殿へ いってみて。",
          ],
        },
        {
          pages: [
            "ひがしの 空中庭園には 「星のかぎ」が ねむっているんだ。",
            "雲の上の にわだから、おちないように きをつけて!",
          ],
        },
      ],
    },
    {
      id: "sea-gate-guard",
      x: 19,
      y: 12,
      art: "villager",
      movement: "static",
      hideIf: { flag: "c5.skyKey", op: "set" },
      dialog: [
        {
          pages: [
            "この さきは 海底神殿。海に もぐるには 「星のかぎ」が いる。",
            "空中庭園に あるという はなしだ。",
          ],
        },
      ],
    },
    {
      id: "zero-hole",
      x: 12,
      y: 2,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          if: { flag: "c5.clear", op: "set" },
          pages: [
            "…ここが 「ゼロのあな」。下の せかい ネガリアへ つづいています。",
            "冥王ゼロムは この 下に います。かくごは よろしいですか?",
          ],
          then: [
            {
              type: "choice",
              prompt: "ゼロのあなへ おりる?",
              yes: [
                { type: "message", pages: ["うずまきに すいこまれていく…!"] },
                { type: "transfer", mapId: "ch6-world", spawn: "from-hole" },
              ],
              no: [
                {
                  type: "message",
                  pages: ["じゅんびが できたら こえを かけてください。"],
                },
              ],
            },
          ],
        },
        {
          pages: [
            "きたの 空が くらい… 大地が うずを まいている ようです。",
            "魔王を たおした とき、なにかが おきる かもしれません。",
          ],
        },
      ],
    },
    {
      id: "castle-gate-guard",
      x: 13,
      y: 2,
      art: "scholar",
      movement: "static",
      hideIf: { flag: "c5.seaKey", op: "set" },
      dialog: [
        {
          pages: [
            "きたの マイナドス城の 門は かたく とざされておる。",
            "海底神殿の 「波のかぎ」が なければ ひらかぬ。",
            "まずは 星のかぎ、つぎに 波のかぎ。じゅんばんじゃ。",
          ],
        },
      ],
    },
  ],
  events: [
    {
      id: "enter-percen",
      x: 8,
      y: 4,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch5-percen", spawn: "entrance" }],
    },
    {
      id: "enter-bargain",
      x: 13,
      y: 9,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch5-bargain", spawn: "entrance" }],
    },
    {
      id: "enter-bunsuu",
      x: 2,
      y: 13,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch5-bunsuu", spawn: "entrance" }],
    },
    {
      id: "enter-sky",
      x: 21,
      y: 4,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch5-sky-1", spawn: "entrance" }],
    },
    {
      id: "enter-sea",
      x: 20,
      y: 12,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch5-sea-1", spawn: "entrance" }],
    },
    {
      id: "enter-castle",
      x: 13,
      y: 1,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch5-castle-1", spawn: "entrance" }],
    },
  ],
  spawns: {
    "from-ship": { x: 1, y: 8, facing: "right" },
    "from-percen": { x: 7, y: 4, facing: "left" },
    "from-bargain": { x: 12, y: 9, facing: "left" },
    "from-bunsuu": { x: 3, y: 13, facing: "right" },
    "from-sky": { x: 20, y: 4, facing: "left" },
    "from-sea": { x: 19, y: 12, facing: "left" },
    "from-castle": { x: 13, y: 2, facing: "down" },
  },
};
