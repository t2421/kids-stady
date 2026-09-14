/*
 * 王都カズール — 城・宿・道具屋・ほこらは扉から中に入る (設計変更 2026-07-22)
 * とけい塔 (Q/q): 下段を しらべると とけいの問題。正解で鐘が鳴り (c1.bellRang)、
 * ふんすいの そばに かねききのおばあさんが 現れる (KQ-34)
 */

import type { MapDef } from "../../../types";
import { VILLAGE_LEGEND } from "../legends";

export const CH1_CAPITAL: MapDef = {
  id: "ch1-capital",
  name: "おうと カズール",
  theme: "grass",
  legend: {
    ...VILLAGE_LEGEND,
    Q: { art: "clockTower", walkable: false },
    q: { art: "clockTowerBase", walkable: false },
  },
  grid: [
    "TTTTTTTTTTTTTTTTTTTT",
    "T.Q..MMMMMMMM......T",
    "T.q..#+B##B+#.f.y..T",
    "T....##+##+##.[RR].T",
    "T....####GH##.WIDW.T",
    "T..f.....==....f...T",
    "T..[RR]..==.[RR]...T",
    "T..{__}..==.{__}...T",
    "T..WSDW..==.WoDW...T",
    "T.f..=...==...=..y.T",
    "T...============u..T",
    "T.f......==F...y...T",
    "T...x....==....x...T",
    "TTTTTTTTT==TTTTTTTTT",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "guard",
      x: 11,
      y: 5,
      art: "villager",
      movement: "static",
      dialog: [
        {
          if: { flag: "c1.metKing", op: "set" },
          pages: [
            "みなみの もんを でて みちなりに すすむと どんぐりの もりだ。",
            "きをつけてな!",
          ],
        },
        {
          pages: [
            "ここは おうと カズール。",
            "おしろで おうさまが まっているぞ。きたの とびらだ。",
          ],
        },
      ],
    },
    {
      /* 鐘が鳴るまで姿を見せない (時間帯限定 NPC)。ふんすいの そば */
      id: "bell-granny",
      x: 12,
      y: 11,
      art: "granny",
      movement: "static",
      hideIf: { flag: "c1.bellRang", op: "unset" },
      dialog: [
        {
          if: { flag: "c1.bellGift", op: "set" },
          pages: [
            "とけいの みじかい はりが 「なんじ」、ながい はりが 「なんぷん」だよ。",
            "ながい はりが 12 を さしたら 「ちょうど」。1じかんは 60ぷん だからね。",
          ],
        },
        {
          pages: [
            "おや、かねの おとで めが さめたよ。",
            "とけいが よめる こは えらいねえ。これを あげよう。",
            "ひらめきメダルを てにいれた!",
          ],
          then: [
            { type: "giveItem", itemId: "hiramekiMedal", count: 1 },
            { type: "setFlag", flag: "c1.bellGift" },
          ],
        },
      ],
    },
    {
      /* クイズずき (KQ-31): 1回だけ ひらめきメダル。何度でも挑戦できる。西の みちの わき */
      id: "quiz-fan",
      x: 3,
      y: 11,
      art: "villager",
      movement: "static",
      dialog: [
        {
          if: { flag: "c1.quizNpc", op: "set" },
          pages: ["また あそぼうね。"],
        },
        {
          pages: [
            "ぼくは クイズが だいすき! ひきざんの もんだいを といてみる?",
            "せいかいしたら ひらめきメダルを あげるよ!",
          ],
          then: [
            {
              type: "quiz",
              skillId: "g1_sub_nc",
              onCorrect: [
                { type: "message", pages: ["せいかい! すごいね。はい、ひらめきメダル!"] },
                { type: "giveItem", itemId: "hiramekiMedal", count: 1 },
                { type: "setFlag", flag: "c1.quizNpc" },
              ],
              onWrong: [{ type: "message", pages: ["ざんねん! また ちょうせんしてね。"] }],
            },
          ],
        },
      ],
    },
    {
      /*
       * メダル しゅうしゅうか (KQ-31): ひらめきメダルを そうびと 交換する。
       * 3枚→かわのよろい / 6枚→てつのつるぎ / 10枚→ひかりのつるぎ。
       * 選択肢は choice の入れ子 (深さ 3)。みなみ東の すみ
       */
      id: "medal-collector",
      x: 16,
      y: 12,
      art: "merchant",
      movement: "static",
      dialog: [
        {
          pages: [
            "わたしは メダル しゅうしゅうか。ひらめきメダルを そうびと こうかんするよ。",
            "3まいで かわのよろい、6まいで てつのつるぎ、10まいで ひかりのつるぎ だ。",
          ],
          then: [
            {
              type: "choice",
              prompt: "メダル 3まいで かわのよろいと こうかんする?",
              yes: [
                {
                  type: "exchange",
                  itemId: "hiramekiMedal",
                  count: 3,
                  give: { itemId: "kawaNoYoroi" },
                  onDone: [{ type: "message", pages: ["こうかん せいりつ! かわのよろいを てにいれた!"] }],
                  onShort: [{ type: "message", pages: ["メダルが たりないよ。"] }],
                },
              ],
              no: [
                {
                  type: "choice",
                  prompt: "メダル 6まいで てつのつるぎと こうかんする?",
                  yes: [
                    {
                      type: "exchange",
                      itemId: "hiramekiMedal",
                      count: 6,
                      give: { itemId: "tetsuNoTsurugi" },
                      onDone: [{ type: "message", pages: ["こうかん せいりつ! てつのつるぎを てにいれた!"] }],
                      onShort: [{ type: "message", pages: ["メダルが たりないよ。"] }],
                    },
                  ],
                  no: [
                    {
                      type: "choice",
                      prompt: "メダル 10まいで ひかりのつるぎと こうかんする?",
                      yes: [
                        {
                          type: "exchange",
                          itemId: "hiramekiMedal",
                          count: 10,
                          give: { itemId: "hikariNoKen" },
                          onDone: [{ type: "message", pages: ["こうかん せいりつ! ひかりのつるぎを てにいれた!"] }],
                          onShort: [{ type: "message", pages: ["メダルが たりないよ。"] }],
                        },
                      ],
                      no: [{ type: "message", pages: ["メダルが たまったら また きてね。"] }],
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
    {
      /* とけい塔の下段 (2,2)。手前 (2,3) から しらべる。何度でも挑戦できる (onceFlag なし) */
      id: "clock-tower",
      x: 2,
      y: 2,
      trigger: "inspect",
      commands: [
        {
          type: "message",
          pages: ["とけい塔の 大きな とけいだ。いま なんじか よめるかな?"],
        },
        {
          type: "quiz",
          skillId: "g2_time",
          onCorrect: [
            {
              type: "message",
              pages: ["かねが なった! まちの どこかで だれかが うごきだした…"],
            },
            { type: "setFlag", flag: "c1.bellRang" },
          ],
          onWrong: [
            {
              type: "message",
              pages: ["うーん、とけいが よめなかった。もういちど みてみよう。"],
            },
          ],
        },
      ],
    },
    {
      id: "to-castle",
      x: 9,
      y: 4,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch1-capital-castle", spawn: "start" },
      ],
    },
    {
      id: "to-castle-2",
      x: 10,
      y: 4,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch1-capital-castle", spawn: "start" },
      ],
    },
    {
      id: "to-inn",
      x: 16,
      y: 4,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-capital-inn", spawn: "start" }],
    },
    {
      id: "to-shop",
      x: 5,
      y: 8,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch1-capital-shop", spawn: "start" }],
    },
    {
      id: "to-shrine",
      x: 14,
      y: 8,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch1-capital-shrine", spawn: "start" },
      ],
    },
    {
      id: "to-world",
      x: 9,
      y: 13,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch1-world", spawn: "from-capital" },
      ],
    },
    {
      id: "to-world-2",
      x: 10,
      y: 13,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch1-world", spawn: "from-capital" },
      ],
    },
  ],
  spawns: {
    entrance: { x: 9, y: 12, facing: "up" },
    "from-castle": { x: 9, y: 5, facing: "down" },
    "from-inn": { x: 16, y: 5, facing: "down" },
    "from-shop": { x: 5, y: 9, facing: "down" },
    "from-shrine": { x: 14, y: 9, facing: "down" },
  },
};
