/*
 * 第6章「下の世界ネガリア」のタイル凡例。上の世界と同じ形のまま
 * 色だけが すいこまれた むらさきに なっている、という世界観。
 *
 * ワールド: ~=ネガの海 .=ネガの大地 *=くさむら ==ネガの道 T=かれ木 M=山
 *           V=ノコリビの村 C=ホシオキ H=はやさの回廊 E=エンの神殿
 *           P=ピタゴラの試練 K=ゼロム城 O=ゼロのあな (上の世界へ)
 * 町:       .=ネガの大地 ==道 T=かれ木 + 第1章の建物タイル
 * ダンジョン: W=くろい壁 S=くろい床 %=床(エンカウント) L=ようがん
 *           c=柱 F=かがり火 r=赤じゅうたん a=祭壇 t=玉座 D=扉
 */

import type { MapDef } from "../../types";
import { VILLAGE_LEGEND, WORLD_LEGEND } from "../chapter1/legends";

const NEGA_VARIANTS = [
  "negaGround",
  "negaGround",
  "negaGround2",
  "negaGround",
  "negaGround2",
];
const DARK_VARIANTS = [
  "darkFloor",
  "darkFloor",
  "darkFloor2",
  "darkFloor",
  "darkFloor2",
];

export const CH6_WORLD_LEGEND: MapDef["legend"] = {
  ...WORLD_LEGEND,
  "~": { art: "negaSea", walkable: false },
  ".": {
    art: "negaGround",
    variants: NEGA_VARIANTS,
    walkable: true,
    encounter: true,
  },
  "*": { art: "negaGround2", walkable: true, encounter: true },
  "=": { art: "negaPath", walkable: true, encounter: true },
  T: { art: "negaTree", walkable: false },
  V: { art: "locNegaVillage", walkable: true },
  C: { art: "locNegaTown", walkable: true },
  H: { art: "locSpeedHall", walkable: true },
  E: { art: "locEnTemple", walkable: true },
  P: { art: "locPitagora", walkable: true },
  K: { art: "locZeromCastle", walkable: true },
  O: { art: "locZeroHole", walkable: true },
};

export const CH6_TOWN_LEGEND: MapDef["legend"] = {
  ...VILLAGE_LEGEND,
  ".": { art: "negaGround", variants: NEGA_VARIANTS, walkable: true },
  "=": { art: "negaPath", walkable: true },
  "~": { art: "negaSea", walkable: false },
  T: { art: "negaTree", walkable: false },
};

export const CH6_DUNGEON_LEGEND: MapDef["legend"] = {
  W: { art: "darkWall", walkable: false },
  S: { art: "darkFloor", variants: DARK_VARIANTS, walkable: true },
  "%": {
    art: "darkFloor",
    variants: DARK_VARIANTS,
    walkable: true,
    encounter: true,
  },
  L: { art: "lava", walkable: false },
  c: { art: "column", walkable: false },
  F: { art: "brazier", walkable: false },
  r: { art: "redCarpet", walkable: true },
  a: { art: "altar", walkable: false },
  t: { art: "throne", walkable: false },
  D: { art: "door", walkable: true },
};
