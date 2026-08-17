/*
 * 第4章「氷の国メジャーリア」のタイル凡例。
 *
 * ワールド: ~=こおりの海 .=雪原 *=ふぶき(エンカウント) ==雪の道 T=こおりの木
 *           r=つらら岩 M=岩山 C=メジャーリア V=雪村コゴエ O=氷の洞くつ A=角度の遺跡
 * 町:       .=雪 ==雪の道 T=こおりの木 + 第1章の建物タイル
 * 洞くつ:   W=こおりの壁 S=こおりの床 %=こおりの床(エンカウント) c=柱
 *           F=かがり火 r=赤じゅうたん a=祭壇 D=扉
 */

import type { MapDef } from "../../types";
import { VILLAGE_LEGEND, WORLD_LEGEND } from "../chapter1/legends";

const SNOW_VARIANTS = ["snow", "snow", "snow2", "snow", "snow", "snow2"];
const ICE_VARIANTS = ["iceFloor", "iceFloor", "iceFloor2", "iceFloor", "iceFloor2"];

export const CH4_WORLD_LEGEND: MapDef["legend"] = {
  ...WORLD_LEGEND,
  ".": { art: "snow", variants: SNOW_VARIANTS, walkable: true, encounter: true },
  "*": { art: "snow2", walkable: true, encounter: true },
  "=": { art: "snowPath", walkable: true, encounter: true },
  T: { art: "frozenTree", walkable: false },
  r: { art: "icePillar", walkable: false },
  C: { art: "locMeasureCity", walkable: true },
  V: { art: "locSnowVillage", walkable: true },
  O: { art: "locIceCave", walkable: true },
  A: { art: "locAngleRuins", walkable: true },
};

export const CH4_TOWN_LEGEND: MapDef["legend"] = {
  ...VILLAGE_LEGEND,
  ".": { art: "snow", variants: SNOW_VARIANTS, walkable: true },
  "=": { art: "snowPath", walkable: true },
  T: { art: "frozenTree", walkable: false },
  r: { art: "icePillar", walkable: false },
};

export const CH4_CAVE_LEGEND: MapDef["legend"] = {
  W: { art: "iceWall", walkable: false },
  S: { art: "iceFloor", variants: ICE_VARIANTS, walkable: true },
  "%": {
    art: "iceFloor",
    variants: ICE_VARIANTS,
    walkable: true,
    encounter: true,
  },
  c: { art: "column", walkable: false },
  F: { art: "brazier", walkable: false },
  r: { art: "redCarpet", walkable: true },
  a: { art: "altar", walkable: false },
  D: { art: "door", walkable: true },
};
