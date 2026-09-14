/*
 * ムゲンのらせん — 5層の裏ダンジョン (KQ-30b)。
 * 各層は まん中から そとへ うずまく らせんの回廊。そとがわの とびら (6,0) は
 * その層の学年 (1層=小1 … 5層=小5) の クイズ扉で、まちがえると らせんが ねじれて
 * まん中 (entrance) に もどされる (九九の塔と同じ)。
 * 1層〜4層: らせん / 2層・4層: 宝箱 / 3層: らせんの みこ (きろく・ふくしゅう) /
 * 5層: 割合の 門 → すいしょうレベル看板 → ∞竜ムゲニア。
 */

import type { EventCommand, MapDef } from "../../../types";
import { CH7_SPIRAL_LEGEND } from "../legends";
import { shrineMenu } from "../../shrineMenu";

const HOSHIOKI_SHRINE = "ch6-hoshioki-shrine";

interface DoorSpec {
  floor: number;
  gradeLabel: string;
  riddle: string;
  skillId: string;
  nextMap: string;
}

/* 層の学年クイズ扉。正解で次の層へ、不正解で その層の まん中へ もどされる */
function spiralDoor(spec: DoorSpec): MapDef["events"][number] {
  return {
    id: `spiral${spec.floor}-door`,
    x: 6,
    y: 0,
    trigger: "step",
    commands: [
      {
        type: "message",
        pages: [
          `らせんの とびらに 「${spec.floor}」の 数字が ひかっている。`,
          `「${spec.gradeLabel}の ちから — ${spec.riddle}」`,
        ],
      },
      {
        type: "quiz",
        skillId: spec.skillId,
        onCorrect: [
          { type: "message", pages: ["せいかい! らせんが つぎの 層へ つづいていく!"] },
          { type: "transfer", mapId: spec.nextMap, spawn: "entrance" },
        ],
        onWrong: [
          {
            type: "message",
            pages: ["ちがう! らせんが ねじれて、はじめの ばしょへ もどされた!"],
          },
          { type: "transfer", mapId: `ch7-spiral-${spec.floor}`, spawn: "entrance" },
        ],
      },
    ],
  };
}

/* 下の層へ もどる 出口 (6,12)。1層は ホシオキの ほこら へ */
function backExit(floor: number): MapDef["events"][number] {
  const commands: EventCommand[] =
    floor === 1
      ? [{ type: "transfer", mapId: HOSHIOKI_SHRINE, spawn: "start" }]
      : [{ type: "transfer", mapId: `ch7-spiral-${floor - 1}`, spawn: "from-above" }];
  return { id: `spiral${floor}-back`, x: 6, y: 12, trigger: "step", commands };
}

const SPIRAL_SPAWNS: MapDef["spawns"] = {
  entrance: { x: 6, y: 6, facing: "up" },
  "from-above": { x: 6, y: 1, facing: "down" },
};

export const CH7_SPIRAL_1: MapDef = {
  id: "ch7-spiral-1",
  name: "ムゲンのらせん 1層",
  theme: "interior",
  legend: CH7_SPIRAL_LEGEND,
  grid: [
    "WWWWWWDWWWWWW",
    "W%%%%%%%%%%%W",
    "W%WWWWWWWWW%W",
    "W%W%%%%%%%W%W",
    "W%W%WW%WW%W%W",
    "W%W%WSSSW%W%W",
    "W%W%WSSSW%W%W",
    "W%W%WSSSW%W%W",
    "W%W%WWWWW%W%W",
    "W%W%%%%%%%W%W",
    "W%WWWW%WWWW%W",
    "W%%%%%%%%%%%W",
    "WWWWWWDWWWWWW",
  ],
  encounterTableId: "ch7-spiral",
  npcs: [],
  events: [
    backExit(1),
    spiralDoor({
      floor: 1,
      gradeLabel: "1ねんせい",
      riddle: "くりあがりの たしざんを こたえよ",
      skillId: "g1_add_carry",
      nextMap: "ch7-spiral-2",
    }),
  ],
  spawns: SPIRAL_SPAWNS,
};

export const CH7_SPIRAL_2: MapDef = {
  id: "ch7-spiral-2",
  name: "ムゲンのらせん 2層",
  theme: "interior",
  legend: CH7_SPIRAL_LEGEND,
  grid: [
    "WWWWWWDWWWWWW",
    "W%%%%%%%%%%%W",
    "W%WVVVVVVVW%W",
    "W%W%%%%%%%W%W",
    "W%W%WWWWW%W%W",
    "W%W%WSSSW%W%W",
    "W%W%%SSSW%%%W",
    "W%W%WSSSW%W%W",
    "W%W%WWWWW%W%W",
    "W%W%%%%%%%W%W",
    "W%WVVVVVVVW%W",
    "W%%%%%%%%%%%W",
    "WWWWWWDWWWWWW",
  ],
  encounterTableId: "ch7-spiral",
  npcs: [],
  events: [
    backExit(2),
    {
      id: "spiral2-chest",
      x: 7,
      y: 5,
      trigger: "inspect",
      art: "chest",
      onceFlag: "c7.chest2",
      commands: [
        {
          type: "message",
          pages: ["らせんの たからばこだ!", "せいのしずくを 5つ てにいれた!"],
        },
        { type: "giveItem", itemId: "seiNoShizuku", count: 5 },
      ],
    },
    spiralDoor({
      floor: 2,
      gradeLabel: "2ねんせい",
      riddle: "九九を こたえよ",
      skillId: "g2_kuku",
      nextMap: "ch7-spiral-3",
    }),
  ],
  spawns: SPIRAL_SPAWNS,
};

export const CH7_SPIRAL_3: MapDef = {
  id: "ch7-spiral-3",
  name: "ムゲンのらせん 3層",
  theme: "interior",
  legend: CH7_SPIRAL_LEGEND,
  grid: [
    "WWWWWWDWWWWWW",
    "W%%%%%%%%%%%W",
    "W%WWWW%WWWW%W",
    "W%W%%%%%%%W%W",
    "W%W%WWWWW%W%W",
    "W%W%WcScW%W%W",
    "W%W%WSSSW%W%W",
    "W%W%WSSSW%W%W",
    "W%W%WW%WW%W%W",
    "W%W%%%%%%%W%W",
    "W%WVVVVVVVW%W",
    "W%%%%%%%%%%%W",
    "WWWWWWDWWWWWW",
  ],
  encounterTableId: "ch7-spiral",
  npcs: [
    {
      /* らせんの なかほどの ほこら: きろく と ふくしゅう (shrineMenu) */
      id: "spiral-miko",
      x: 6,
      y: 5,
      art: "scholar",
      movement: "static",
      dialog: [
        {
          pages: [
            "ここは らせんの なかほど。めがみスーリアの 光が とどく さいごの ばしょです。",
            "この さきは、6ねんぶんの 数の ちからが すべて ためされます。",
          ],
          then: shrineMenu(),
        },
      ],
    },
  ],
  events: [
    backExit(3),
    spiralDoor({
      floor: 3,
      gradeLabel: "3ねんせい",
      riddle: "わりざんを こたえよ",
      skillId: "g3_div",
      nextMap: "ch7-spiral-4",
    }),
  ],
  spawns: SPIRAL_SPAWNS,
};

export const CH7_SPIRAL_4: MapDef = {
  id: "ch7-spiral-4",
  name: "ムゲンのらせん 4層",
  theme: "interior",
  legend: CH7_SPIRAL_LEGEND,
  grid: [
    "WWWWWWDWWWWWW",
    "W%%%%%%%%%%%W",
    "W%WWWWWWWWW%W",
    "W%V%%%%%%%V%W",
    "W%V%WW%WW%V%W",
    "W%V%WSSSW%V%W",
    "W%%%WSSSW%V%W",
    "W%V%WSSSW%V%W",
    "W%V%WWWWW%V%W",
    "W%V%%%%%%%V%W",
    "W%WWWWWWWWW%W",
    "W%%%%%%%%%%%W",
    "WWWWWWDWWWWWW",
  ],
  encounterTableId: "ch7-spiral",
  npcs: [],
  events: [
    backExit(4),
    {
      id: "spiral4-chest",
      x: 5,
      y: 7,
      trigger: "inspect",
      art: "chest",
      onceFlag: "c7.chest4",
      commands: [
        {
          type: "message",
          pages: ["らせんの たからばこだ!", "ピタゴラのつるぎを てにいれた! なかまにも もたせよう。"],
        },
        { type: "giveItem", itemId: "pitagoraNoKen" },
      ],
    },
    spiralDoor({
      floor: 4,
      gradeLabel: "4ねんせい",
      riddle: "小数の けいさんを こたえよ",
      skillId: "g4_decimal",
      nextMap: "ch7-spiral-5",
    }),
  ],
  spawns: SPIRAL_SPAWNS,
};

/* 5層 — 割合の門 → すいしょうレベル看板 → ∞竜ムゲニア */
export const CH7_SPIRAL_5: MapDef = {
  id: "ch7-spiral-5",
  name: "ムゲンのらせん さいしんぶ",
  theme: "interior",
  legend: CH7_SPIRAL_LEGEND,
  grid: [
    "WWWWWWWWWWWWW",
    "WVVVVVVVVVVVW",
    "WVSSSSSSSSSVW",
    "WVSrrrrrrrSVW",
    "WVSSSrrrSSSVW",
    "WVVVVVDVVVVVW",
    "WSSSSSrSSSSSW",
    "WScSSSrSSScSW",
    "WSSSSSrSSSSSW",
    "WSSSSSSSSSSSW",
    "WWWWWWDWWWWWW",
  ],
  encounterTableId: null,
  npcs: [],
  events: [
    {
      id: "spiral5-back",
      x: 6,
      y: 10,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch7-spiral-4", spawn: "from-above" }],
    },
    {
      id: "spiral5-level-sign",
      x: 5,
      y: 8,
      trigger: "inspect",
      art: "signpost",
      commands: [{ type: "levelSign", level: 42 }],
    },
    {
      /* 割合の門: 正解すると ひらいたまま (onceFlag)。不正解の transfer は onceFlag を消費しない */
      id: "spiral5-gate",
      x: 6,
      y: 5,
      trigger: "step",
      onceFlag: "c7.gate5",
      commands: [
        {
          type: "message",
          pages: [
            "らせんの おわりに 「5」の 数字が ひかる 門が ある。",
            "「5ねんせいの ちから — 割合を こたえよ」",
          ],
        },
        {
          type: "quiz",
          skillId: "g5_percent",
          onCorrect: [
            { type: "message", pages: ["せいかい! 門が ひらいた! この さきに なにかが いる…"] },
          ],
          onWrong: [
            {
              type: "message",
              pages: ["ちがう! らせんが ねじれて、はじめの ばしょへ もどされた!"],
            },
            { type: "transfer", mapId: "ch7-spiral-5", spawn: "entrance" },
          ],
        },
      ],
    },
    {
      id: "boss-mugenia",
      x: 6,
      y: 3,
      trigger: "step",
      onceFlag: "c7.bossDefeated",
      commands: [
        {
          type: "message",
          pages: [
            "らせんの さいしんぶ。そらも ゆかも、はてしなく つづいている。",
            "金の うろこの 竜が、しっぽを ∞の かたちに まいて ねむっていた。",
            "「…われは ムゲニア。かぞえても かぞえても おわらない 数の 竜。」",
            "「数を まもる ものよ。おまえの 6ねんぶんの ちから、すべて 見せてみよ!」",
          ],
        },
        { type: "battle", monsterIds: ["mugenia"], boss: true },
        { type: "setFlag", flag: "c7.bossDefeated" },
        {
          type: "message",
          pages: [
            "「…みごとだ。おわりの ない 数を、おまえは ひとつずつ かぞえきった。」",
            "ムゲニアは 金の 光に なって、らせんの そらへ のぼっていった。",
            "「1から 6ねんまでの すべての 数が、おまえの みかただ。」",
          ],
        },
        {
          type: "message",
          pages: [
            "光の中から 数の女神スーリアの こえが ひびいた。",
            "「ピタゴラの 名を ついだ ゆうしゃよ。あなたは はてしない らせんを のぼりきりました。」",
            "「その 名を 「ムゲンの ゆうしゃ」と よびましょう。」",
            "ムゲンの ゆうしゃの しょうごうを 手に入れた!",
          ],
        },
        { type: "setFlag", flag: "c7.clear" },
        {
          type: "message",
          pages: ["らせんが ゆっくりと ほどけて、ホシオキの ほこらへ もどっていく…"],
        },
        { type: "transfer", mapId: HOSHIOKI_SHRINE, spawn: "start" },
      ],
    },
  ],
  spawns: { entrance: { x: 6, y: 9, facing: "up" } },
};
