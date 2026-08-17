/*
 * 割合の都パーセン — 第5章の拠点。ものの ねだんも 人の あつまりも
 * ぜんぶ 「わりあい」で かんがえる 都。
 */

import type { MapDef } from "../../../types";
import { CH5_TOWN_LEGEND } from "../legends";

export const CH5_PERCEN: MapDef = {
  id: "ch5-percen",
  name: "わりあいのみやこ パーセン",
  theme: "grass",
  legend: CH5_TOWN_LEGEND,
  grid: [
    "TTTTTTTTT=TTTTTTTTTT",
    "T........=.........T",
    "T..[RR]..=..[RR]...T",
    "T..{__}..=..{__}...T",
    "T..WIDW..=..WSDW...T",
    "T...=....=....=....T",
    "T...======.====....T",
    "T..[RR]..=..[RR]...T",
    "T..{__}..=..{__}...T",
    "T..WoDW..=..WoDW...T",
    "T...=....=....=....T",
    "T...======....=....T",
    "T..hhh...=...hhh...T",
    "T..fyf...=...fyf...T",
    "TTTTTTTTTTTTTTTTTTTT",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "percen-queen",
      x: 7,
      y: 13,
      art: "king",
      movement: "static",
      dialog: [
        {
          if: { flag: "c5.orb5", op: "set" },
          pages: [
            "「すうしょう・伍」が もどった! 魔王マイナドスを たおしたのですね!",
            "…ですが 空を ごらんなさい。大地に 大きな あなが ひらいています。",
            "「ゼロのあな」… あの 下には もう ひとつの せかいが あると いいます。",
            "ほんとうの たたかいは これからです。きたの あなへ おいでなさい!",
          ],
          then: [
            { type: "setFlag", flag: "c5.clear" },
            { type: "advanceChapter", chapter: 6 },
          ],
        },
        {
          if: { flag: "c5.metQueen", op: "set" },
          pages: [
            "空中庭園の 「星のかぎ」、そして 海底神殿の 「波のかぎ」。",
            "その 2つが そろって はじめて マイナドス城の 門が ひらきます。",
          ],
        },
        {
          pages: [
            "わたくしが パーセンの 女王です。よくぞ きて くれました。",
            "魔王マイナドスが 「すうしょう・伍」を うばい、きたの 城に こもりました。",
            "おかげで 「100%」が どこにも なくなり、みんなが こまっています…",
            "したくきんに 1000ゴールド さしあげます。たのみましたよ!",
          ],
          then: [
            { type: "giveGold", amount: 1000 },
            { type: "setFlag", flag: "c5.metQueen" },
          ],
        },
      ],
    },
    {
      id: "percen-kid",
      x: 13,
      y: 13,
      art: "villager",
      movement: "wander",
      dialog: [
        {
          pages: [
            "20人のうち 5人が この まちの 子どもだよ。",
            "5 ÷ 20 = 0.25 だから… 25%! わりあいって おもしろいね。",
          ],
        },
      ],
    },
    {
      id: "percen-guide",
      x: 11,
      y: 6,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          if: { flag: "c5.seaKey", op: "set" },
          pages: [
            "2つの かぎが そろいましたね! きたの 城の 門が ひらきます。",
            "どうか… ごぶじで。",
          ],
        },
        {
          pages: [
            "ひがしの 空中庭園、みなみの 海底神殿。",
            "どちらにも かぎが ねむって います。まずは 空からです。",
          ],
        },
      ],
    },
  ],
  events: [
    {
      id: "to-inn",
      x: 5,
      y: 4,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch5-percen-inn", spawn: "start" }],
    },
    {
      id: "to-shop",
      x: 14,
      y: 4,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch5-percen-shop", spawn: "start" }],
    },
    {
      id: "to-manabiya",
      x: 5,
      y: 9,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch5-percen-manabiya", spawn: "start" },
      ],
    },
    {
      id: "to-shrine",
      x: 14,
      y: 9,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch5-percen-shrine", spawn: "start" },
      ],
    },
    {
      id: "to-world",
      x: 9,
      y: 0,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch5-world", spawn: "from-percen" }],
    },
  ],
  spawns: {
    entrance: { x: 9, y: 1, facing: "down" },
    "from-inn": { x: 5, y: 5, facing: "down" },
    "from-shop": { x: 14, y: 5, facing: "down" },
    "from-manabiya": { x: 5, y: 10, facing: "down" },
    "from-shrine": { x: 14, y: 10, facing: "down" },
  },
};
