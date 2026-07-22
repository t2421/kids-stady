/*
 * 第1章のマップで共有するタイル凡例。文字の意味を章内で統一する。
 *
 * 屋外共通: T=木 .=草 *=しげみ ~=水 ==道 f/y=花 x=柵 u=井戸 F=噴水
 * 建物:     [=屋根左 R=屋根 ]=屋根右 {=軒左 _=軒 }=軒右
 *           W=家壁 o=窓 I=宿看板 S=店看板 D=扉
 * 城:       M=胸壁 #=城壁 +=城窓 B=旗 G/H=大門(歩ける)
 * 屋内(家): W=板壁 w=窓 h=暖炉 F=床 D=扉 B=ベッド T=机 C=じゅうたん
 *           P=つぼ n=カウンター b=たる k=本棚
 * 屋内(城): W=石壁 g=ステンドグラス S=石床 r=赤絨毯 c=柱 t=玉座 a=祭壇 B=旗
 * 洞くつ:   K=洞くつ壁 C/.=床 %=エンカウント床
 */

import type { MapDef } from "../../types";

/* 草・道のゆらぎ (座標ハッシュで決定的に選ばれる。同名を重ねて重み付け) */
const GRASS_VARIANTS = [
  "grass", "grass", "grass2", "grass", "grass3",
  "grass", "grass2", "grass", "grass", "grass3",
];
const PATH_VARIANTS = ["path", "path", "path2", "path", "path", "path2", "path"];
const CAVE_VARIANTS = [
  "caveFloor", "caveFloor", "caveFloor2", "caveFloor", "caveFloor2", "caveFloor",
];

export const VILLAGE_LEGEND: MapDef["legend"] = {
  T: { art: "tree", walkable: false },
  ".": { art: "grass", variants: GRASS_VARIANTS, walkable: true },
  "=": { art: "path", variants: PATH_VARIANTS, walkable: true },
  "~": { art: "water", walkable: false },
  f: { art: "flowerR", walkable: true },
  y: { art: "flowerY", walkable: true },
  x: { art: "fence", walkable: false },
  u: { art: "well", walkable: false },
  F: { art: "fountain", walkable: false },
  /* 家 (屋根2段 + 壁) */
  "[": { art: "roofL", walkable: false },
  R: { art: "roofM", walkable: false },
  "]": { art: "roofR", walkable: false },
  "{": { art: "roofL2", walkable: false },
  _: { art: "roofM2", walkable: false },
  "}": { art: "roofR2", walkable: false },
  W: { art: "house", walkable: false },
  o: { art: "hwin", walkable: false },
  I: { art: "signInn", walkable: false },
  S: { art: "signShop", walkable: false },
  D: { art: "door", walkable: true },
  /* 城の外観 */
  M: { art: "cbattle", walkable: false },
  "#": { art: "cwall", walkable: false },
  "+": { art: "cwin", walkable: false },
  B: { art: "banner", walkable: false },
  G: { art: "cgateL", walkable: true },
  H: { art: "cgateR", walkable: true },
};

export const FIELD_LEGEND: MapDef["legend"] = {
  T: { art: "tree", walkable: false },
  ".": { art: "grass", variants: GRASS_VARIANTS, walkable: true },
  "*": { art: "bush", walkable: true, encounter: true },
  "=": { art: "path", variants: PATH_VARIANTS, walkable: true, encounter: true },
  "~": { art: "water", walkable: false },
  f: { art: "flowerR", walkable: true },
  y: { art: "flowerY", walkable: true },
};

/* 家の中: 板壁と木の床、暮らしの調度 */
export const INTERIOR_LEGEND: MapDef["legend"] = {
  W: { art: "wallWood", walkable: false },
  w: { art: "windowIn", walkable: false },
  h: { art: "fireplace", walkable: false },
  F: { art: "floor", walkable: true },
  D: { art: "door", walkable: true },
  B: { art: "bed", walkable: false },
  T: { art: "table", walkable: false },
  C: { art: "carpet", walkable: true },
  P: { art: "pot", walkable: false },
  n: { art: "counter", walkable: false },
  b: { art: "barrel", walkable: false },
  k: { art: "bookshelf", walkable: false },
};

/* 城・ほこらの中: 石壁と石床、玉座や祭壇 */
export const CASTLE_LEGEND: MapDef["legend"] = {
  W: { art: "wall", walkable: false },
  g: { art: "stainedGlass", walkable: false },
  B: { art: "banner", walkable: false },
  S: { art: "stoneFloor", walkable: true },
  r: { art: "redCarpet", walkable: true },
  c: { art: "column", walkable: false },
  t: { art: "throne", walkable: false },
  a: { art: "altar", walkable: false },
  D: { art: "door", walkable: true },
};

export const CAVE_LEGEND: MapDef["legend"] = {
  K: { art: "caveWall", walkable: false },
  C: { art: "caveFloor", variants: CAVE_VARIANTS, walkable: true },
  ".": { art: "caveFloor", variants: CAVE_VARIANTS, walkable: true },
  "%": { art: "caveFloor", variants: CAVE_VARIANTS, walkable: true, encounter: true },
};
