/*
 * 第6章の3つの試練 — はやさの回廊 / エンの神殿 / ピタゴラの試練。
 * それぞれ 「はやさの印」「円の印」「ピタゴラの印」を さずける。
 * 3つの印が そろうと ゼロム城の門が ひらく (ワールドの番人NPCが消える)。
 */

import type { MapDef } from "../../../types";
import { CH6_DUNGEON_LEGEND } from "../legends";

export const CH6_SPEED_1: MapDef = {
  id: "ch6-speed-1",
  name: "はやさの かいろう",
  theme: "cave",
  legend: CH6_DUNGEON_LEGEND,
  grid: [
    "WWWWWWDWWWWWWW",
    "WSSS%%%%%%SSSW",
    "WScS%%%%%%SScW",
    "WSS%%%%%%%%SSW",
    "WF%%%%LL%%%%FW",
    "WS%%%%LL%%%%SW",
    "WSSS%%%%%%SSSW",
    "WScSSS%%SSScSW",
    "WSSSSS%%SSSSSW",
    "WWWWWWDWWWWWWW",
  ],
  encounterTableId: "ch6-speed",
  npcs: [],
  events: [
    {
      id: "speed1-out",
      x: 6,
      y: 9,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch6-world", spawn: "from-speed" }],
    },
    {
      id: "speed1-door",
      x: 6,
      y: 0,
      trigger: "step",
      commands: [
        {
          type: "message",
          pages: [
            "とびらに 走る すがたの もようが きざまれている。",
            "「道のりと 時間から 速さを こたえよ」",
          ],
        },
        {
          type: "quiz",
          skillId: "g6_speed",
          onCorrect: [
            { type: "message", pages: ["せいかい! とびらが ひらいた!"] },
            { type: "transfer", mapId: "ch6-speed-2", spawn: "entrance" },
          ],
          onWrong: [
            {
              type: "message",
              pages: ["ちがう! ハヤサバットの むれが おそいかかってきた!"],
            },
            { type: "battle", monsterIds: ["hayasaBat", "hayasaBat"] },
            {
              type: "message",
              pages: ["おいはらった。もういちど とびらに ちょうせんしよう。"],
            },
          ],
        },
      ],
    },
  ],
  spawns: {
    entrance: { x: 6, y: 8, facing: "up" },
    "from-inner": { x: 6, y: 1, facing: "down" },
  },
};

export const CH6_SPEED_2: MapDef = {
  id: "ch6-speed-2",
  name: "かいろうの おく",
  theme: "cave",
  legend: CH6_DUNGEON_LEGEND,
  grid: [
    "WWWWWWWWWWWWWW",
    "WSSSSFaFSSSSSW",
    "WSSSSSrSSSSSSW",
    "WScSSSrSSSScSW",
    "WSSSSSrSSSSSSW",
    "WSSSSSrSSSSSSW",
    "WScSSSrSSSScSW",
    "WSSSSSrSSSSSSW",
    "WWWWWWDWWWWWWW",
  ],
  encounterTableId: null,
  npcs: [],
  events: [
    {
      id: "speed2-back",
      x: 6,
      y: 8,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch6-speed-1", spawn: "from-inner" }],
    },
    {
      id: "speed-seal",
      x: 6,
      y: 1,
      trigger: "inspect",
      onceFlag: "c6.speedSeal",
      commands: [
        {
          type: "message",
          pages: [
            "祭壇に 光る 印が うかんでいる。",
            "「時を こえる ものだけが これを もてる」",
          ],
        },
        {
          type: "quiz",
          skillId: "g6_speed",
          onCorrect: [
            {
              type: "message",
              pages: [
                "せいかい! 「はやさの印」を てにいれた!",
                "みなみの エンの神殿へ すすめる ように なった!",
              ],
            },
          ],
          onWrong: [
            {
              type: "message",
              pages: ["印は かがやかない… 速さの しきを おもいだそう。"],
            },
            /* transfer は残りのコマンドを打ち切る = onceFlag を消費せず再挑戦できる */
            { type: "transfer", mapId: "ch6-speed-2", spawn: "entrance" },
          ],
        },
      ],
    },
  ],
  spawns: { entrance: { x: 6, y: 7, facing: "up" } },
};

export const CH6_EN_1: MapDef = {
  id: "ch6-en-1",
  name: "エンの しんでん",
  theme: "cave",
  legend: CH6_DUNGEON_LEGEND,
  grid: [
    "WWWWWWDWWWWWWW",
    "WSSS%%%%%%SSSW",
    "WSSS%%WW%%SSSW",
    "WScS%%WW%%SScW",
    "WSSS%%WW%%SSSW",
    "WFSS%%%%%%SSFW",
    "WSSSSSSSSSSSSW",
    "WScSSS%%SSScSW",
    "WSS%%%%%%%%SSW",
    "WSSSSS%%SSSSSW",
    "WWWWWWDWWWWWWW",
  ],
  encounterTableId: "ch6-temple",
  npcs: [],
  events: [
    {
      id: "en1-out",
      x: 6,
      y: 10,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch6-world", spawn: "from-en" }],
    },
    {
      id: "en1-chest",
      x: 2,
      y: 6,
      trigger: "inspect",
      art: "chest",
      onceFlag: "c6.enChest",
      commands: [
        {
          type: "message",
          pages: ["神殿の たからばこだ!", "すうしょうのたてを てにいれた!"],
        },
        { type: "giveItem", itemId: "suushouNoTate" },
      ],
    },
    {
      id: "en1-door",
      x: 6,
      y: 0,
      trigger: "step",
      commands: [
        {
          type: "message",
          pages: [
            "まるい とびらに 円の しきが きざまれている。",
            "「半けい × 半けい × 3.14 の こたえを もって すすめ」",
          ],
        },
        {
          type: "quiz",
          skillId: "g6_circle_area",
          onCorrect: [
            { type: "message", pages: ["せいかい! とびらが ひらいた!"] },
            { type: "transfer", mapId: "ch6-en-2", spawn: "entrance" },
          ],
          onWrong: [
            {
              type: "message",
              pages: ["ちがう! ゼロキューブが ころがってきた!"],
            },
            { type: "battle", monsterIds: ["zeroCube", "negaGhost"] },
            {
              type: "message",
              pages: ["おいはらった。もういちど とびらに ちょうせんしよう。"],
            },
          ],
        },
      ],
    },
  ],
  spawns: {
    entrance: { x: 6, y: 9, facing: "up" },
    "from-inner": { x: 6, y: 1, facing: "down" },
  },
};

export const CH6_EN_2: MapDef = {
  id: "ch6-en-2",
  name: "しんでんの ないじん",
  theme: "cave",
  legend: CH6_DUNGEON_LEGEND,
  grid: [
    "WWWWWWWWWWWWWW",
    "WSSSSFaFSSSSSW",
    "WSSSSSrSSSSSSW",
    "WScSSSrSSSScSW",
    "WSSSSSrSSSSSSW",
    "WSSSSSrSSSSSSW",
    "WScSSSrSSSScSW",
    "WSSSSSrSSSSSSW",
    "WWWWWWDWWWWWWW",
  ],
  encounterTableId: null,
  npcs: [],
  events: [
    {
      id: "en2-back",
      x: 6,
      y: 8,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch6-en-1", spawn: "from-inner" }],
    },
    {
      id: "en-seal",
      x: 6,
      y: 3,
      trigger: "step",
      onceFlag: "c6.enSeal",
      commands: [
        {
          type: "message",
          pages: [
            "祭壇の 上で 円の 印が まわっている。",
            "…とった とたん、ゼロの まものたちが わきだした!",
          ],
        },
        { type: "battle", monsterIds: ["zeroCube", "zeroCube", "negaGhost"] },
        {
          type: "message",
          pages: [
            "「円の印」を てにいれた!",
            "きたの ピタゴラの試練へ すすめる ように なった!",
          ],
        },
      ],
    },
  ],
  spawns: { entrance: { x: 6, y: 7, facing: "up" } },
};

export const CH6_TRIAL: MapDef = {
  id: "ch6-trial",
  name: "ピタゴラの しれん",
  theme: "cave",
  legend: CH6_DUNGEON_LEGEND,
  grid: [
    "WWWWWWWWWWWWWW",
    "WSSSrrrrrrSSSW",
    "WScSrrrrrrScSW",
    "WSSSrrrrrrSSSW",
    "WSSSrrrrrrSSSW",
    "WScSSrrrrScSSW",
    "WSSSSrrrrSSSSW",
    "WSSSSSrrSSSSSW",
    "WWWWWWDWWWWWWW",
  ],
  encounterTableId: null,
  npcs: [],
  events: [
    {
      id: "trial-out",
      x: 6,
      y: 8,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch6-world", spawn: "from-trial" }],
    },
    {
      id: "trial-level-sign",
      x: 5,
      y: 7,
      trigger: "inspect",
      art: "signpost",
      commands: [{ type: "levelSign", level: 36 }],
    },
    {
      id: "trial-guardian",
      x: 6,
      y: 3,
      trigger: "step",
      onceFlag: "c6.trialSeal",
      commands: [
        {
          type: "message",
          pages: [
            "しずかな 石の間に、ひかりの ゆうしゃが 立っている。",
            "「われは はつだいの 数ゆうしゃ ピタゴラの まぼろし。」",
            "「ゼロムに いどむ しかくが あるか、この 手で たしかめよう!」",
          ],
        },
        { type: "battle", monsterIds: ["maboroshiHero"], boss: true },
        {
          type: "message",
          pages: [
            "「みごとだ。数を まもる こころ、たしかに うけとった。」",
            "「ピタゴラの印」と 「ピタゴラのつるぎ」を さずかった!",
            "これで ゼロム城の 門が ひらく!",
          ],
        },
        { type: "giveItem", itemId: "pitagoraNoKen" },
      ],
    },
  ],
  spawns: { entrance: { x: 6, y: 7, facing: "up" } },
};
