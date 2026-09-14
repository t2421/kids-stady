/*
 * 終章「ムゲンのらせん」(KQ-30b) の色ちがいタイル。
 * ネガリア (tiles.ts の darkWall 等) と同じ方式で、既存タイルの形はそのままに
 * 色だけを 「はてしない らせん」の いろ — 金と ぞうげ色、そして うずまく 青みどり — に おきかえる。
 * tiles.ts が TILE_ART を組み立てたあとに呼び、元の rows を参照する (循環 import を避ける)。
 */
import type { PixelArt } from "./format";

const SPIRAL_FLOOR_PALETTE = {
  k: "#c9b878",
  d: "#dccf98",
  s: "#ebe2b8",
  S: "#f4edcc",
  l: "#fbf7e4",
};

export function spiralTiles(base: Record<string, PixelArt>): Record<string, PixelArt> {
  return {
    /* 金いろの 石壁 */
    spiralWall: {
      palette: { k: "#3a2e12", d: "#7a6230", s: "#b8963f", S: "#dcc06a", l: "#f5e6a6" },
      rows: base.wall.rows,
    },
    /* ぞうげ色の 床 (2種のゆらぎ) */
    spiralFloor: { palette: SPIRAL_FLOOR_PALETTE, rows: base.sandFloor.rows },
    spiralFloor2: { palette: SPIRAL_FLOOR_PALETTE, rows: base.sandFloor2.rows },
    /* ムゲンのそら — らせんの すきまに ひろがる 青みどりの うず (通れない) */
    spiralVoid: {
      palette: { b: "#1c8f96", B: "#27b0b4", d: "#146c72", w: "#6fe0dc", l: "#b7f5f0" },
      rows: base.water.rows,
    },
    /* 金の柱 (まわりの床色は 柱タイル固有の背景をそのまま使う) */
    spiralPillar: {
      palette: { ...base.column.palette, k: "#5a4718", s: "#c9a84a", S: "#e6cd7a", l: "#fbf0bd" },
      rows: base.column.rows,
    },
    /* 青みどりの じゅうたん (ボスの間) */
    spiralCarpet: {
      palette: { r: "#1c8f96", R: "#27b0b4", d: "#146c72", y: "#f2cf5b" },
      rows: base.redCarpet.rows,
    },
  };
}
