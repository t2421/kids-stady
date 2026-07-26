/*
 * 九九の塔 — 第2章のメインダンジョン。
 * 各フロアの階段は「九九の とびら」: クイズに正解で上の階へ、
 * まちがえると ばんにんが 1体 あらわれる (設計 A5)。
 * 最上階に インクの魔女ブロッタ。
 */

import type { MapDef } from "../../../types";
import { CH2_TOWER_LEGEND } from "../legends";

/* フロアの雛形 (12x9)。c=柱 r=じゅうたん D=下り口 */
const FLOOR_GRID = [
  "WWWWWWWWWWWW",
  "WSSSSSSSSSSW",
  "WScSSrrSScSW",
  "WSSSSrrSSSSW",
  "WSSSSrrSSSSW",
  "WScSSrrSScSW",
  "WSSSSSSSSSSW",
  "WSSSSSSSSSSW",
  "WWWWWDWWWWWW",
];

/* n階のフロアを生成 (階段クイズは その階の「だん」の雰囲気づけに dan を表示) */
function towerFloor(floor: number, dan: number): MapDef {
  const nextMap = floor === 4 ? "ch2-tower-top" : `ch2-tower-${floor + 1}`;
  const downMap = floor === 1 ? "ch2-world" : `ch2-tower-${floor - 1}`;
  const downSpawn = floor === 1 ? "from-tower" : "from-above";
  return {
    id: `ch2-tower-${floor}`,
    name: `九九のとう ${floor}かい`,
    theme: "cave",
    legend: CH2_TOWER_LEGEND,
    grid: FLOOR_GRID,
    encounterTableId: "ch2-tower",
    npcs: [],
    events: [
      {
        id: `tower${floor}-down`,
        x: 5,
        y: 8,
        trigger: "step",
        commands: [{ type: "transfer", mapId: downMap, spawn: downSpawn }],
      },
      {
        id: `tower${floor}-door`,
        x: 6,
        y: 2,
        trigger: "step",
        commands: [
          {
            type: "message",
            pages: [
              `${dan}のだんの とびらだ。九九の こたえを きいてくる…`,
            ],
          },
          {
            type: "quiz",
            skillId: "g2_kuku",
            onCorrect: [
              { type: "message", pages: ["せいかい! とびらが ひらいた!"] },
              { type: "transfer", mapId: nextMap, spawn: "start" },
            ],
            onWrong: [
              {
                type: "message",
                pages: ["ちがうよ! とびらの ばんにんが あらわれた!"],
              },
              { type: "battle", monsterIds: ["shuseiekin"] },
              {
                type: "message",
                pages: ["ばんにんを おいはらった。もういちど とびらに ちょうせんしよう。"],
              },
            ],
          },
        ],
      },
    ],
    spawns: {
      start: { x: 5, y: 7, facing: "up" },
      "from-above": { x: 6, y: 3, facing: "down" },
    },
  };
}

export const CH2_TOWER_FLOORS: MapDef[] = [
  towerFloor(1, 2),
  towerFloor(2, 3),
  towerFloor(3, 5),
  towerFloor(4, 7),
];

/* 最上階 — ブロッタの間 */
export const CH2_TOWER_TOP: MapDef = {
  id: "ch2-tower-top",
  name: "九九のとう さいじょうかい",
  theme: "cave",
  legend: CH2_TOWER_LEGEND,
  grid: [
    "WWWWWWWWWWWW",
    "WSSSrrrrSSSW",
    "WScSrrrrScSW",
    "WSSSrrrrSSSW",
    "WSSSrrrrSSSW",
    "WScSSrrSScSW",
    "WSSSSrrSSSSW",
    "WWWWWDWWWWWW",
  ],
  encounterTableId: null,
  npcs: [],
  events: [
    {
      id: "tower-top-down",
      x: 5,
      y: 7,
      trigger: "step",
      commands: [{ type: "transfer", mapId: "ch2-tower-4", spawn: "from-above" }],
    },
    {
      id: "boss-blotta",
      x: 5,
      y: 2,
      trigger: "step",
      onceFlag: "c2.bossDefeated",
      commands: [
        {
          type: "message",
          pages: [
            "インクの魔女ブロッタが 「すうしょう・弐」を かかえて わらっている…",
            "「この 塔の 九九は ぜんぶ インクで ぬりつぶしたわ!」",
            "「つぎは あんたたちの ばんよ!」",
          ],
        },
        { type: "battle", monsterIds: ["blotta"], boss: true },
        {
          type: "message",
          pages: [
            "ブロッタは インクに とけて きえてしまった!",
            "かがやく 「すうしょう・弐」を とりもどした!",
            "ミナトスの みなとの長に ほうこくしよう!",
          ],
        },
        { type: "setFlag", flag: "c2.orb2" },
      ],
    },
  ],
  spawns: { start: { x: 5, y: 6, facing: "up" } },
};
