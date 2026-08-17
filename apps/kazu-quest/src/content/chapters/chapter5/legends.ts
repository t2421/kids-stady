/*
 * 第5章「割合の都パーセン」のタイル凡例。
 *
 * ワールド: ~=海 .=草原 *=しげみ ==道 T=木 M=山 r=岩 B=橋
 *           P=パーセンの都 b=バーゲンの町 v=ブンスウ島 G=空中庭園
 *           S=海底神殿 K=マイナドス城
 * 空中庭園: W=空のふち S=雲の床 %=雲の床(エンカウント) h=いけがき
 *           f/y=花 T=木 D=階段の門
 * 海底神殿: W=サンゴ石の壁 S=しんでんの床 %=床(エンカウント) o=サンゴ
 *           c=柱 r=赤じゅうたん a=祭壇 D=扉
 * 魔王城:   W=くろい壁 S=くろい床 %=床(エンカウント) L=ようがん
 *           c=柱 F=かがり火 r=赤じゅうたん t=玉座 D=扉
 */

import type { MapDef } from "../../types";
import { VILLAGE_LEGEND, WORLD_LEGEND } from "../chapter1/legends";

const CLOUD_VARIANTS = [
  "cloudFloor",
  "cloudFloor",
  "cloudFloor2",
  "cloudFloor",
  "cloudFloor",
];
const SEA_VARIANTS = ["seaFloor", "seaFloor", "seaFloor2", "seaFloor", "seaFloor2"];
const DARK_VARIANTS = [
  "darkFloor",
  "darkFloor",
  "darkFloor2",
  "darkFloor",
  "darkFloor2",
];

export const CH5_WORLD_LEGEND: MapDef["legend"] = {
  ...WORLD_LEGEND,
  r: { art: "sandRock", walkable: false },
  P: { art: "locPercentCity", walkable: true },
  b: { art: "locBargainTown", walkable: true },
  G: { art: "locSkyGarden", walkable: true },
  S: { art: "locSeaTemple", walkable: true },
  K: { art: "locDarkCastle", walkable: true },
};

export const CH5_TOWN_LEGEND: MapDef["legend"] = {
  ...VILLAGE_LEGEND,
  h: { art: "hedge", walkable: false },
};

export const CH5_SKY_LEGEND: MapDef["legend"] = {
  W: { art: "skyEdge", walkable: false },
  S: { art: "cloudFloor", variants: CLOUD_VARIANTS, walkable: true },
  "%": {
    art: "cloudFloor",
    variants: CLOUD_VARIANTS,
    walkable: true,
    encounter: true,
  },
  h: { art: "hedge", walkable: false },
  T: { art: "tree", walkable: false },
  f: { art: "flowerR", walkable: true },
  y: { art: "flowerY", walkable: true },
  D: { art: "door", walkable: true },
};

export const CH5_SEA_LEGEND: MapDef["legend"] = {
  W: { art: "seaWall", walkable: false },
  S: { art: "seaFloor", variants: SEA_VARIANTS, walkable: true },
  "%": {
    art: "seaFloor",
    variants: SEA_VARIANTS,
    walkable: true,
    encounter: true,
  },
  o: { art: "coral", walkable: false },
  c: { art: "column", walkable: false },
  r: { art: "redCarpet", walkable: true },
  a: { art: "altar", walkable: false },
  D: { art: "door", walkable: true },
};

export const CH5_CASTLE_LEGEND: MapDef["legend"] = {
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
  t: { art: "throne", walkable: false },
  D: { art: "door", walkable: true },
};
