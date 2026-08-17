/*
 * 第3章「砂の国ワケーラ」のタイル凡例。
 *
 * ワールド:   ~=海 .=砂 d=砂丘(エンカウント) ==砂の道 T=ヤシ c=サボテン
 *             r=岩 M=岩山 O=ワケーラ P=ピラミッド U=遺跡 K=隊商の宿場
 * 町:         .=砂 ==道 ~=オアシス T=ヤシ c=サボテン + 第1章の建物タイル
 * ピラミッド: W=砂岩の壁 S=砂岩の床 %=砂岩の床(エンカウント) c=柱
 *             F=かがり火 r=赤じゅうたん a=祭壇 D=扉
 */

import type { MapDef } from "../../types";
import { VILLAGE_LEGEND, WORLD_LEGEND } from "../chapter1/legends";

/* 砂のゆらぎ (座標ハッシュで決定的に選ばれる) */
const SAND_VARIANTS = ["sand", "sand", "sand2", "sand", "sand2", "sand"];
const SANDSTONE_VARIANTS = [
  "sandFloor",
  "sandFloor",
  "sandFloor2",
  "sandFloor",
  "sandFloor2",
];

export const CH3_WORLD_LEGEND: MapDef["legend"] = {
  ...WORLD_LEGEND,
  ".": { art: "sand", variants: SAND_VARIANTS, walkable: true, encounter: true },
  d: { art: "sandDune", walkable: true, encounter: true },
  T: { art: "palm", walkable: false },
  c: { art: "cactus", walkable: false },
  r: { art: "sandRock", walkable: false },
  O: { art: "locOasis", walkable: true },
  P: { art: "locPyramid", walkable: true },
  U: { art: "locRuins", walkable: true },
  K: { art: "locCamp", walkable: true },
};

/* 町・宿場 (安全地帯なのでエンカウントなし) */
export const CH3_TOWN_LEGEND: MapDef["legend"] = {
  ...VILLAGE_LEGEND,
  ".": { art: "sand", variants: SAND_VARIANTS, walkable: true },
  T: { art: "palm", walkable: false },
  c: { art: "cactus", walkable: false },
  r: { art: "sandRock", walkable: false },
};

/* ピラミッド・遺跡の内部 */
export const CH3_PYRAMID_LEGEND: MapDef["legend"] = {
  W: { art: "sandWall", walkable: false },
  S: { art: "sandFloor", variants: SANDSTONE_VARIANTS, walkable: true },
  "%": {
    art: "sandFloor",
    variants: SANDSTONE_VARIANTS,
    walkable: true,
    encounter: true,
  },
  c: { art: "column", walkable: false },
  F: { art: "brazier", walkable: false },
  r: { art: "redCarpet", walkable: true },
  a: { art: "altar", walkable: false },
  D: { art: "door", walkable: true },
};
