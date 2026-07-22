/*
 * 第1章のマップで共有するタイル凡例。
 * 文字の意味を章内で統一する: T=木 .=草 *=しげみ ~=水 ==道
 * W=壁 R=屋根 F=床 D=扉 C=洞くつ床 K=洞くつ壁 %=洞くつのしげみ(エンカウント床)
 */

import type { MapDef } from "../../types";

export const VILLAGE_LEGEND: MapDef["legend"] = {
  T: { art: "tree", walkable: false },
  ".": { art: "grass", walkable: true },
  "=": { art: "path", walkable: true },
  "~": { art: "water", walkable: false },
  W: { art: "wall", walkable: false },
  R: { art: "roof", walkable: false },
  F: { art: "floor", walkable: true },
  D: { art: "door", walkable: true },
};

export const FIELD_LEGEND: MapDef["legend"] = {
  T: { art: "tree", walkable: false },
  ".": { art: "grass", walkable: true },
  "*": { art: "bush", walkable: true, encounter: true },
  "=": { art: "path", walkable: true, encounter: true },
  "~": { art: "water", walkable: false },
};

export const CAVE_LEGEND: MapDef["legend"] = {
  K: { art: "caveWall", walkable: false },
  C: { art: "caveFloor", walkable: true },
  ".": { art: "caveFloor", walkable: true },
  "%": { art: "caveFloor", walkable: true, encounter: true },
};
