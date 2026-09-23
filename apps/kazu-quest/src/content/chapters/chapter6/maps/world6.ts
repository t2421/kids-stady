/*
 * 第6章のワールド「下の世界 ネガリア」— ゼロのあなから おりてくる。
 * ノコリビの村 V / ホシオキ C / はやさの回廊 H / エンの神殿 E /
 * ピタゴラの試練 P / ゼロム城 K / 上の世界へ もどる ゼロのあな O。
 *
 * 3つの印を じゅんばんに 集める (速さ → 円 → ピタゴラ)。
 * 番人NPCが hideIf で 道をふさぐ。
 */

import type { MapDef } from "../../../types";
import { CH6_WORLD_LEGEND } from "../legends";

export const CH6_WORLD: MapDef = {
  id: "ch6-world",
  name: "したの せかい ネガリア",
  theme: "grass",
  legend: CH6_WORLD_LEGEND,
  grid: [
    "~~~~~~~~~~~~~~~~~~~~~~~~~~",
    "~.....TT....MKM..........~",
    "~............=...T.......~",
    "~......============MMMMM.~",
    "~......=C=........T=.PM..~",
    "~..**..=...........=MM...~",
    "~......=...**......=..MM.~",
    "~...O..=...........=.....~",
    "~......=............=....~",
    "~......======H======.....~",
    "~......=...........=.....~",
    "~..T...=...........=T..T.~",
    "~......=...........=ET...~",
    "~.V=====............T....~",
    "~....*...........*.......~",
    "~~~~~~~~~~~~~~~~~~~~~~~~~~",
  ],
  encounterTableId: "ch6-nega",
  npcs: [
    {
      id: "zero-hole-back",
      x: 5,
      y: 7,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          pages: [
            "この うずまきは 上の せかいへ もどる 道です。",
            "上へ もどりますか?",
          ],
          then: [
            {
              type: "choice",
              prompt: "上の せかいへ もどる?",
              yes: [
                { type: "message", pages: ["うずまきが ひかった!"] },
                { type: "transfer", mapId: "ch5-world", spawn: "from-castle" },
              ],
              no: [{ type: "message", pages: ["ごぶじを いのっています。"] }],
            },
          ],
        },
      ],
    },
    {
      id: "en-gate-guard",
      x: 19,
      y: 12,
      art: "scholar",
      movement: "static",
      hideIf: { flag: "c6.speedSeal", op: "set" },
      dialog: [
        {
          pages: [
            "エンの神殿の とびらは 「はやさの 印」が なければ ひらきません。",
            "まずは まんなかの はやさの回廊へ。",
          ],
        },
      ],
    },
    {
      id: "trial-gate-guard",
      x: 19,
      y: 5,
      art: "scholar",
      movement: "static",
      /*
       * 試練の前は 行き止まりなので、一度 中に入った勇者も通す
       * (通さないと "from-trial" で出てきた勇者が 閉じこめられる)。
       */
      hideIf: {
        any: [{ flag: "c6.enSeal", op: "set" }, { flag: "c6.enteredTrial", op: "set" }],
      },
      dialog: [
        {
          pages: [
            "ピタゴラの試練に いどむには 「円の 印」が いります。",
            "エンの神殿で 手に入れて おいでなさい。",
          ],
        },
      ],
    },
    {
      id: "castle-gate-guard6",
      x: 13,
      y: 2,
      art: "measurer",
      movement: "static",
      /*
       * LP-20: 3つの印 (順番ゲート) はそのまま維持しつつ、章6の中核3単元
       * (分数のかけ算わり算・比・はやさ) も すべて「できる」で開く AND 条件に拡張。
       */
      hideIf: [
        { flag: "c6.trialSeal", op: "set" },
        { skill: "g6_fraction_muldiv", state: "can" },
        { skill: "g6_ratio", state: "can" },
        { skill: "g6_speed", state: "can" },
      ],
      dialog: [
        {
          pages: [
            "ゼロム城の 門には 3つの 印が きざまれておる。",
            "はやさ・円・ピタゴラ。すべてが そろわねば 門は ひらかぬ。",
            "そして 分数・比・はやさの力、3つとも「できる」に なっておるか。",
            "…そなたの 父も、この 門の 前で とらわれたと きく。",
          ],
          /* その場で まなべる (めあて パネル → 前提チェックつきの レッスン)。
             「まなびやへ いけ」と言われても 子どもは 迷うので、物語の とびらから 直接 つなぐ */
          then: [
            {
              type: "choice",
              prompt: "とびらを ひらく さんすうを いま まなぶ?",
              yes: [{ type: "openGoals" }],
              no: [{ type: "message", pages: ["いつでも 「★ めあて」から まなべるぞ。"] }],
            },
          ],
        },
      ],
    },
  ],
  events: [
    {
      id: "enter-nokoribi",
      x: 2,
      y: 13,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch6-nokoribi", spawn: "entrance" }],
    },
    {
      id: "enter-hoshioki",
      x: 8,
      y: 4,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch6-hoshioki", spawn: "entrance" }],
    },
    {
      id: "enter-speed",
      x: 13,
      y: 9,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch6-speed-1", spawn: "entrance" }],
    },
    {
      id: "enter-en",
      x: 20,
      y: 12,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch6-en-1", spawn: "entrance" }],
    },
    {
      id: "enter-trial",
      x: 21,
      y: 4,
      trigger: "step",
      /* setFlag は transfer より前に置く (transfer は残りのコマンドを打ち切る) */
      commands: [
        { type: "setFlag", flag: "c6.enteredTrial" },
        { type: "transfer", mapId: "ch6-trial", spawn: "entrance" },
      ],
    },
    {
      id: "enter-zerom",
      x: 13,
      y: 1,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch6-zerom-1", spawn: "entrance" }],
    },
  ],
  spawns: {
    "from-hole": { x: 6, y: 7, facing: "left" },
    "from-nokoribi": { x: 3, y: 13, facing: "right" },
    "from-hoshioki": { x: 7, y: 4, facing: "left" },
    "from-speed": { x: 12, y: 9, facing: "left" },
    "from-en": { x: 19, y: 12, facing: "left" },
    "from-trial": { x: 20, y: 4, facing: "left" },
    "from-zerom": { x: 13, y: 2, facing: "down" },
  },
};
