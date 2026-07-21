/*
 * タイルのドット絵 (8x8定義 → ×2 で 16x16)。ファミコン風のチャンキーな見た目。
 * テクスチャ名は "tile-" + キー。
 */

import type { PixelArt } from "./format";

export const TILE_SIZE = 16;

export const TILE_ART: Record<string, PixelArt> = {
  grass: {
    scale: 2,
    palette: { g: "#3e8948", G: "#4fa85a" },
    rows: [
      "gggggggg",
      "gGgggggg",
      "gggggGgg",
      "gggggggg",
      "ggGggggg",
      "gggggggG",
      "gGgggGgg",
      "gggggggg",
    ],
  },
  bush: {
    scale: 2,
    palette: { g: "#3e8948", d: "#2c6e37", G: "#4fa85a" },
    rows: [
      "gdgggdgg",
      "dGdgdGdg",
      "gdgggdgg",
      "ggdgggdg",
      "gdGdgdGd",
      "ggdgggdg",
      "gdgggdgg",
      "dGdgdGdg",
    ],
  },
  tree: {
    scale: 2,
    palette: { g: "#3e8948", d: "#1e5427", D: "#173f1e", t: "#6b4226" },
    rows: [
      "ggDDDDgg",
      "gDdddDDg",
      "DdddddDD",
      "DdddddDD",
      "gDdddDDg",
      "ggDttDgg",
      "gggttggg",
      "gggttggg",
    ],
  },
  water: {
    scale: 2,
    palette: { b: "#2a6db5", B: "#3f8dd9", w: "#7db8e8" },
    rows: [
      "bbbbbbbb",
      "bBwBbbbb",
      "bbbbbBwB",
      "bbbbbbbb",
      "bBwBbbbb",
      "bbbbbBwB",
      "bbbbbbbb",
      "bBwBbbbb",
    ],
  },
  path: {
    scale: 2,
    palette: { p: "#c9a86a", P: "#d9bc82", d: "#b3945a" },
    rows: [
      "pppppppp",
      "pPpppdpp",
      "pppppppp",
      "ppdppppP",
      "pppppppp",
      "pPpppppp",
      "ppppdppp",
      "pppppppp",
    ],
  },
  wall: {
    scale: 2,
    palette: { s: "#8a8f98", S: "#a6abb5", d: "#6b7078" },
    rows: [
      "SSSSSSSS",
      "sssdsssd",
      "SSSSSSSS",
      "sdsssdss",
      "SSSSSSSS",
      "sssdsssd",
      "SSSSSSSS",
      "sdsssdss",
    ],
  },
  roof: {
    scale: 2,
    palette: { r: "#b5432a", R: "#d9603f", d: "#8a2f1c" },
    rows: [
      "RRRRRRRR",
      "rrrrrrrr",
      "dRRRRRRd",
      "rrrrrrrr",
      "RdRRRRdR",
      "rrrrrrrr",
      "ddRRRRdd",
      "rrrrrrrr",
    ],
  },
  floor: {
    scale: 2,
    palette: { f: "#a87b4f", F: "#c09265", d: "#8f6540" },
    rows: [
      "ffffFfff",
      "fFffffdf",
      "ffffffff",
      "fdffFfff",
      "ffffffff",
      "ffFfffdf",
      "fffffFff",
      "fdffffff",
    ],
  },
  door: {
    scale: 2,
    palette: { t: "#6b4226", T: "#8a5a35", y: "#ffd93d" },
    rows: [
      "TTTTTTTT",
      "TttttttT",
      "TttttttT",
      "TttttytT",
      "TttttytT",
      "TttttttT",
      "TttttttT",
      "TttttttT",
    ],
  },
  caveFloor: {
    scale: 2,
    palette: { c: "#4a4250", C: "#5a5262", d: "#3a3440" },
    rows: [
      "cccccccc",
      "cCcccdcc",
      "cccccccc",
      "ccdcccCc",
      "cccccccc",
      "cCcccccc",
      "ccccdccc",
      "cccccccc",
    ],
  },
  caveWall: {
    scale: 2,
    palette: { k: "#26202e", K: "#332b3d", d: "#1a1622" },
    rows: [
      "KKKKKKKK",
      "kkkdkkkd",
      "KKKKKKKK",
      "kdkkkdkk",
      "KKKKKKKK",
      "kkkdkkkd",
      "KKKKKKKK",
      "kdkkkdkk",
    ],
  },
};
