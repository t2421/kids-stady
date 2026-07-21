/*
 * キャラクター (勇者・NPC) のドット絵 (16x16)。
 * テクスチャ名は "actor-" + キー。向きは左右反転や色差し替えで表現せず、
 * まずは正面向き1枚で始める (歩行アニメは M10 のポリッシュ枠)。
 */

import type { PixelArt } from "./format";

export const ACTOR_ART: Record<string, PixelArt> = {
  hero: {
    palette: {
      h: "#2c1e12", /* 髪 */
      s: "#f2c9a0", /* 肌 */
      b: "#2a6db5", /* 服 (青) */
      B: "#1e4f85",
      y: "#ffd93d", /* ベルト・飾り */
      k: "#1a1a1a",
      w: "#ffffff",
    },
    rows: [
      "................",
      ".....hhhhhh.....",
      "....hhhhhhhh....",
      "....hsssssshh...",
      "....ssksskss....",
      "....ssssssss....",
      ".....ssssss.....",
      "....bbbbbbbb....",
      "...bbbbbbbbbb...",
      "...sbbbbbbbbs...",
      "...sbbyybbbbs...",
      "....BBBBBBBB....",
      "....BB....BB....",
      "....BB....BB....",
      "....kk....kk....",
      "................",
    ],
  },
  mother: {
    palette: {
      h: "#7a4a2a",
      s: "#f2c9a0",
      d: "#b5432a", /* ワンピース */
      D: "#8a2f1c",
      k: "#1a1a1a",
    },
    rows: [
      "................",
      ".....hhhhhh.....",
      "....hhhhhhhh....",
      "....hsssssshh...",
      "....ssksskss....",
      "....ssssssss....",
      ".....ssssss.....",
      "....dddddddd....",
      "...dddddddddd...",
      "...sdddddddds...",
      "...sdddddddds...",
      "....DDDDDDDD....",
      "...DDDDDDDDDD...",
      "...DDDDDDDDDD...",
      "....kk....kk....",
      "................",
    ],
  },
  king: {
    palette: {
      c: "#ffd93d", /* 王冠 */
      s: "#f2c9a0",
      r: "#9b59b6", /* ローブ */
      R: "#6f3f85",
      w: "#ffffff",
      k: "#1a1a1a",
    },
    rows: [
      "....c.c..c.c....",
      "....cccccccc....",
      "....cccccccc....",
      "....ssssssss....",
      "....ssksskss....",
      "....ssssssss....",
      ".....wwwwww.....",
      "....rrrrrrrr....",
      "...rrrrrrrrrr...",
      "...wrrrrrrrrw...",
      "...wrrrrrrrrw...",
      "....RRRRRRRR....",
      "...RRRRRRRRRR...",
      "...RRRRRRRRRR...",
      "....kk....kk....",
      "................",
    ],
  },
  villager: {
    palette: {
      h: "#4a3018",
      s: "#f2c9a0",
      g: "#3e8948", /* 服 (緑) */
      G: "#2c6e37",
      k: "#1a1a1a",
    },
    rows: [
      "................",
      ".....hhhhhh.....",
      "....hhhhhhhh....",
      "....hsssssshh...",
      "....ssksskss....",
      "....ssssssss....",
      ".....ssssss.....",
      "....gggggggg....",
      "...gggggggggg...",
      "...sgggggggss...",
      "...sggggggggs...",
      "....GGGGGGGG....",
      "....GG....GG....",
      "....GG....GG....",
      "....kk....kk....",
      "................",
    ],
  },
  scholar: {
    palette: {
      h: "#d9d9d9", /* 白髪のものしり博士 */
      s: "#f2c9a0",
      b: "#4a4250", /* ローブ (紺鼠) */
      B: "#332b3d",
      y: "#ffd93d",
      k: "#1a1a1a",
    },
    rows: [
      "................",
      ".....hhhhhh.....",
      "....hhhhhhhh....",
      "....hsssssshh...",
      "....ssksskss....",
      "....ssssssss....",
      ".....hhhhhh.....",
      "....bbbbbbbb....",
      "...bbbybybbbb...",
      "...sbbbbbbbbs...",
      "...sbbbbbbbbs...",
      "....BBBBBBBB....",
      "...BBBBBBBBBB...",
      "...BBBBBBBBBB...",
      "....kk....kk....",
      "................",
    ],
  },
};
