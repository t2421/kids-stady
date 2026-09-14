/*
 * 海底神殿 — 星のかぎで もぐれる 海の底の しんでん。
 * 祭壇の 「波のかぎ」を まもるのは 「しんかいの ぬし」。
 */

import type { MapDef } from "../../../types";
import { CH5_SEA_LEGEND } from "../legends";

export const CH5_SEA_1: MapDef = {
  id: "ch5-sea-1",
  name: "かいてい しんでん",
  theme: "cave",
  legend: CH5_SEA_LEGEND,
  grid: [
    "WWWWWWDWWWWWWW",
    "WSSS%%%%%%SSSW",
    "WSoS%%WW%%SoSW",
    "WSS%%%%%%%%SSW",
    "WcSS%%WW%%SScW",
    "WSSS%%%%%%SSSW",
    "WSoSSS%%SSSoSW",
    "WSSSSS%%SSSSSW",
    "WSSSSS%%SSSSSW",
    "WWWWWWDWWWWWWW",
  ],
  encounterTableId: "ch5-sea",
  npcs: [],
  events: [
    {
      id: "sea1-out",
      x: 6,
      y: 9,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch5-world", spawn: "from-sea" }],
    },
    {
      id: "sea1-door",
      x: 6,
      y: 0,
      trigger: "step",
      commands: [
        {
          type: "message",
          pages: [
            "しんでんの とびらに 貝がらの もようが ならんでいる…",
            "「もとに する りょうを 100として こたえよ」",
          ],
        },
        {
          type: "quiz",
          skillId: "g5_percent",
          onCorrect: [
            { type: "message", pages: ["せいかい! とびらが ひらいた!"] },
            { type: "transfer", mapId: "ch5-sea-2", spawn: "entrance" },
          ],
          onWrong: [
            {
              type: "message",
              pages: ["ちがう! カイテイガニが はさみを ふりあげた!"],
            },
            { type: "battle", monsterIds: ["kaiteiKani", "kaiteiKani"] },
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

export const CH5_SEA_2: MapDef = {
  id: "ch5-sea-2",
  name: "しんでん さいしんぶ",
  theme: "cave",
  legend: CH5_SEA_LEGEND,
  grid: [
    "WWWWWWWWWWWWWW",
    "WSSSSoaoSSSSSW",
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
      id: "sea2-back",
      x: 6,
      y: 8,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch5-sea-1", spawn: "from-inner" }],
    },
    {
      id: "sea2-level-sign",
      x: 5,
      y: 7,
      trigger: "inspect",
      art: "signpost",
      commands: [{ type: "levelSign", level: 29 }],
    },
    {
      id: "sea-guardian",
      x: 6,
      y: 3,
      trigger: "step",
      onceFlag: "c5.seaKey",
      commands: [
        {
          type: "message",
          pages: [
            "祭壇の 上に 波の かたちの かぎが しずんでいる。",
            "ゴボゴボ… 大きな かげが 近づいてきた!",
            "「しんかいの ぬし」が あらわれた!",
          ],
        },
        { type: "battle", monsterIds: ["shinkaiNoNushi"], boss: true },
        {
          type: "message",
          pages: [
            "ぬしは しずかに 海の おくへ かえっていった。",
            "「波のかぎ」を てにいれた!",
            "これで きたの マイナドス城の 門が ひらく!",
          ],
        },
      ],
    },
  ],
  spawns: { entrance: { x: 6, y: 7, facing: "up" } },
};
