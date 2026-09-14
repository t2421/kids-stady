/*
 * 最後の町ホシオキ — ネガリアで いちばん 大きな町。
 * 「星を おく」= すべての 数を まもる 人たちの さいごの とりで。
 */

import type { EventCommand, MapDef } from "../../../types";
import { CH6_TOWN_LEGEND } from "../legends";
import { INTERIOR_LEGEND, CASTLE_LEGEND } from "../../chapter1/legends";
import { shrineMenu } from "../../shrineMenu";
import { spellTestMenu } from "../../spellTestMenu";

export const CH6_HOSHIOKI: MapDef = {
  id: "ch6-hoshioki",
  name: "さいごのまち ホシオキ",
  theme: "grass",
  legend: CH6_TOWN_LEGEND,
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
    "T..u.....=.....u...T",
    "T........=.........T",
    "TTTTTTTTTTTTTTTTTTTT",
  ],
  encounterTableId: null,
  npcs: [
    {
      id: "hoshioki-elder",
      x: 7,
      y: 13,
      art: "king",
      movement: "static",
      dialog: [
        {
          if: { flag: "c6.bossDefeated", op: "set" },
          pages: [
            "空が… 空が 明るい! ネガリアに 色が もどっていく!",
            "ゆうしゃよ、あなたは 上と 下、2つの せかいを すくったのです。",
            "どうか わすれないで。数は かぞえる 人が いてこそ 生きるのだと。",
          ],
        },
        {
          if: { flag: "c6.metElder", op: "set" },
          pages: [
            "はやさ・円・ピタゴラ。3つの 印を そろえるのです。",
            "回廊 → 神殿 → 試練の じゅんに いくと よいでしょう。",
          ],
        },
        {
          pages: [
            "上の せかいから きた ゆうしゃ… ついに この日が きたのですね。",
            "冥王ゼロムは すべての 数を 「無」に かえそうと しています。",
            "城の門を ひらくには 3つの 印が いります。",
            "…それと、あなたの 父ガウスは まだ いきています。城の おくに。",
          ],
          then: [
            { type: "giveGold", amount: 2000 },
            { type: "setFlag", flag: "c6.metElder" },
          ],
        },
      ],
    },
    {
      id: "hoshioki-guide",
      x: 11,
      y: 6,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          if: { flag: "c6.enSeal", op: "set" },
          pages: [
            "円の印まで そろいましたか。のこりは ピタゴラの試練だけ。",
            "はつだいの 数ゆうしゃ ピタゴラが まっています。",
          ],
        },
        {
          pages: [
            "はやさの回廊は 時が ゆがんだ ばしょ。速さの しきを わすれずに。",
            "道のり ÷ 時間 = 速さ。この 3つの かんけいが すべてです。",
          ],
        },
      ],
    },
    {
      /* クイズずき (KQ-31): 1回だけ ひらめきメダル。何度でも挑戦できる */
      id: "quiz-fan",
      x: 17,
      y: 1,
      art: "villager",
      movement: "static",
      dialog: [
        {
          if: { flag: "c6.quizNpc", op: "set" },
          pages: ["また あそぼうね。"],
        },
        {
          pages: [
            "ぼくは クイズが だいすき! ばあいの かずの もんだいを といてみる?",
            "せいかいしたら ひらめきメダルを あげるよ!",
          ],
          then: [
            {
              type: "quiz",
              skillId: "g6_combination",
              onCorrect: [
                { type: "message", pages: ["せいかい! すごいね。はい、ひらめきメダル!"] },
                { type: "giveItem", itemId: "hiramekiMedal", count: 1 },
                { type: "setFlag", flag: "c6.quizNpc" },
              ],
              onWrong: [{ type: "message", pages: ["ざんねん! また ちょうせんしてね。"] }],
            },
          ],
        },
      ],
    },
  ],
  events: [
    {
      id: "h-to-inn",
      x: 5,
      y: 4,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch6-hoshioki-inn", spawn: "start" }],
    },
    {
      id: "h-to-shop",
      x: 14,
      y: 4,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch6-hoshioki-shop", spawn: "start" },
      ],
    },
    {
      id: "h-to-manabiya",
      x: 5,
      y: 9,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch6-hoshioki-manabiya", spawn: "start" },
      ],
    },
    {
      id: "h-to-shrine",
      x: 14,
      y: 9,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch6-hoshioki-shrine", spawn: "start" },
      ],
    },
    {
      id: "h-to-world",
      x: 9,
      y: 0,
      trigger: "step",
      commands: [
        { type: "transfer", mapId: "ch6-world", spawn: "from-hoshioki" },
      ],
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
      commands: [{ type: "transfer", mapId: "ch6-hoshioki", spawn: outSpawn }],
    },
  ];
}

export const CH6_HOSHIOKI_INN: MapDef = {
  id: "ch6-hoshioki-inn",
  name: "ホシオキの やどや",
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
      id: "inn6",
      x: 4,
      y: 2,
      art: "villager",
      movement: "static",
      dialog: [
        {
          pages: ["さいごの 町の やどです。ひとばん 400ゴールド。"],
          then: [
            {
              type: "choice",
              prompt: "とまって いく?",
              yes: [{ type: "healInn", price: 400 }],
              no: [{ type: "message", pages: ["ごぶじで。"] }],
            },
          ],
        },
      ],
    },
  ],
  events: exitEvents("ch6-hoshioki-inn", "from-inn", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};

export const CH6_HOSHIOKI_SHOP: MapDef = {
  id: "ch6-hoshioki-shop",
  name: "ホシオキの どうぐや",
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
      id: "shop6",
      x: 3,
      y: 3,
      art: "merchant",
      movement: "static",
      dialog: [
        {
          pages: [
            "ピタゴラの そうびが ある。はつだいの 数ゆうしゃの もちものだ。",
            "…ゼロムに いどむ ものにしか うらないよ。",
          ],
          then: [{ type: "openShop", shopId: "ch6-hoshioki-shop" }],
        },
      ],
    },
  ],
  events: exitEvents("ch6-hoshioki-shop", "from-shop", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};

export const CH6_HOSHIOKI_MANABIYA: MapDef = {
  id: "ch6-hoshioki-manabiya",
  name: "ホシオキの まなびや",
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
      id: "scholar-hoshioki",
      x: 4,
      y: 2,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          pages: [
            "ここは さいごの まなびや。分数の かけ算わり算・文字と式・拡大縮小、",
            "そして 6年ぶんを ぜんぶ つかう 「フッカツノシキ」を おしえよう。",
          ],
          then: spellTestMenu([
            { spellId: "bunsuuNova", label: "ブンスウノヴァ (分数の×÷)" },
            { spellId: "mojishikiSign", label: "モジシキサイン (文字と式)" },
            { spellId: "kakudaiSlash", label: "カクダイスラッシュ (拡大縮小)" },
            { spellId: "fukkatsuNoShiki", label: "フッカツノシキ (6年ぶんの 総ふくしゅう)" },
          ]),
        },
      ],
    },
  ],
  events: [
    ...exitEvents("ch6-hoshioki-manabiya", "from-manabiya", 4, 5),
    {
      id: "hoshioki-drill-board",
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

/*
 * 終章の入口 (KQ-30b): はい → らせん1層へ / いいえ → いつもの ほこらメニュー。
 * advanceChapter は使わない (chapter.current は 6 のまま)。入れ子の深さは 3 (上限 4)
 */
export const SPIRAL_ENTRANCE_PROMPT = "ムゲンのらせんに いどむ?";

function spiralEntrance(): EventCommand[] {
  return [
    {
      type: "choice",
      prompt: SPIRAL_ENTRANCE_PROMPT,
      yes: [
        { type: "message", pages: ["らせんの かいだんが 足もとから のびていく…"] },
        { type: "transfer", mapId: "ch7-spiral-1", spawn: "entrance" },
      ],
      no: shrineMenu(),
    },
  ];
}

export const CH6_HOSHIOKI_SHRINE: MapDef = {
  id: "ch6-hoshioki-shrine",
  name: "ホシオキの ほこら",
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
      id: "priest6",
      x: 4,
      y: 2,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          /* 終章クリア後: 称号を たたえ、もういちど らせんへ 入れる */
          if: { flag: "c7.clear", op: "set" },
          pages: [
            "ムゲンの ゆうしゃ… その 名に ふさわしい たびでした。",
            "らせんは いまも、あなたを まっています。",
          ],
          then: spiralEntrance(),
        },
        {
          /* 本編クリア後 (KQ-22) = 終章「ムゲンのらせん」の入口 (KQ-30b) */
          if: { flag: "c6.clear", op: "set" },
          pages: [
            "…このさきに まだ なにかが ある きがする。",
            "ほこらの おくに、はてしなく つづく らせんの かいだんが あらわれました。",
            "「ムゲンのらせん」— 1ねんせいから 6ねんせいまで、すべての 数の ちからが ためされる ばしょ。",
          ],
          then: spiralEntrance(),
        },
        {
          if: { flag: "c6.trialSeal", op: "set" },
          pages: [
            "3つの 印が そろいましたね。めがみスーリアが みまもって います。",
            "…どうか、いって らっしゃい。",
          ],
          then: shrineMenu(),
        },
        {
          pages: ["ここは めがみスーリアの ほこら。下の せかいにも 光は とどきます。"],
          then: shrineMenu(),
        },
      ],
    },
  ],
  events: exitEvents("ch6-hoshioki-shrine", "from-shrine", 4, 5),
  spawns: { start: { x: 4, y: 4, facing: "up" } },
};
