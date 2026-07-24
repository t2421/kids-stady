/*
 * アニメーションするタイルの2コマ目。
 * "<元の名前>Anim" として TILE_ART に合流するので、テクスチャ生成・
 * サイズ検証・ギャラリー表示は通常タイルと同じ扱いを受ける。
 * どのタイルが動くかは TILE_ANIMATIONS が定義し、MapView が一定間隔で
 * 1コマ目 ⇄ 2コマ目 を入れ替える。
 */
import type { PixelArt } from "./format";

/* 元タイル名 → 2コマ目のタイル名 */
export const TILE_ANIMATIONS: Record<string, string> = {
  water: "waterAnim",
  fountain: "fountainAnim",
  flowerR: "flowerRAnim",
  flowerY: "flowerYAnim",
  fireplace: "fireplaceAnim",
};

export const ANIM_TILES: Record<string, PixelArt> = {
  /* 水面: 波の行を2pxずらして流れを出す */
  waterAnim: {
    palette: { b: "#2364a7", B: "#2f7bc2", d: "#194d8c", w: "#79bce7", l: "#b4dcf2" },
    rows: [
      "BBwwlwwBBBBwwlww", "wwBBBBBwwwwBBBBB", "bbbbbbbbbbbbbbbb", "ddbbbbbbddbbbbbb",
      "bbbBBBbbbbbbbBBB", "BBwwlwwBBBBwwlww", "wwBBBBBwwwwBBBBB", "bbbbbbbbbbbbbbbb",
      "bbbbddbbbbbbddbb", "bbbBBBbbbbbbbBBB", "BBwwlwwBBBBwwlww", "wwBBBBBwwwwBBBBB",
      "bbbbbbbbbbbbbbbb", "ddbbbbbbddbbbbbb", "bbbbbbbbbbbbbbbb", "bbbBBBbbbbbbbBBB",
    ],
  },
  /* 噴水: 水しぶきの形が入れ替わる */
  fountainAnim: {
    palette: {
      g: "#398447", G: "#4fa35a", D: "#2d6d3a",
      k: "#4a4d55", S: "#b7bdc5",
      b: "#2f7bc2", B: "#79bce7", w: "#a8d8f0", l: "#e6f5fd",
    },
    rows: [
      "ggggggggggGggggg", "gggggkkkkkkggggg", "gggkkSSSSSSkkggg", "ggkSSwwwwwwSSkgg",
      "gkSwwbBbbBbwwSkg", "gkSwbBlwwlBbwSkg", "gkSwbBlwwlBbwSkg", "gkSwwbBbbBbwwSkg",
      "ggkSSwwwwwwSSkgg", "gggkkSSSSSSkkggg", "ggggDDDDDDDDgggg", "gggggggggggggggg",
      "ggGgggggggggDggg", "gggggggggggggggg", "ggggggGggggggggg", "gggggggggggggggg",
    ],
  },
  /* 赤い花: 花あたまが1pxゆれる */
  flowerRAnim: {
    palette: { g: "#398447", G: "#4fa35a", D: "#2d6d3a", l: "#70b868", R: "#e05252", Y: "#f7d354" },
    rows: [
      "gggggggggggggggg", "ggggggggggglgggg", "gggggRgggggggggg", "ggggRYRggggggggg",
      "gggggRgggggggggg", "ggggggggggggRggg", "ggGggggggggRYRgg", "ggggggggggggRggg",
      "gggggggggggggggg", "ggggggggggggGggg", "ggggggRggggggggg", "gggggRYRgggggggg",
      "ggggggRggggggggg", "ggggggggggglgggg", "gDgggggggggggggg", "gggggggggggggggg",
    ],
  },
  /* 黄色い花: 花あたまが1pxゆれる */
  flowerYAnim: {
    palette: { g: "#398447", G: "#4fa35a", D: "#2d6d3a", l: "#70b868", y: "#f7d354", o: "#e8862f" },
    rows: [
      "gggggggggggggggg", "gggGgggggggggggg", "gggggggggggygggg", "ggggggggggyoyggg",
      "gggggggggggygggg", "gggygggggggggggg", "ggyoygggggGggggg", "gggygggggggggggg",
      "gggggggggggggggg", "gggggggggggggGgg", "gggggggggggygggg", "gggGggggggyoyggg",
      "gggggggggggygggg", "ggglgggggggggggg", "gggggggggggggDgg", "gggggggggggggggg",
    ],
  },
  /* 暖炉: 炎がゆらぐ */
  fireplaceAnim: {
    palette: {
      k: "#2a2a33", s: "#6e6e7a", S: "#8d8d99", n: "#14161c",
      o: "#e8862f", y: "#f7d354", r: "#c23a3a", t: "#6b4a2f",
    },
    rows: [
      "kkkkkkkkkkkkkkkk", "kSSSSSSSSSSSSSSk", "kSsskkkkkkkkssSk", "kSsknnnnnnnnksSk",
      "kSsknnyynnnnksSk", "kSsknyyyynnnksSk", "kSskyyooyynnksSk", "kSskyooooyynksSk",
      "kSskoorroooyksSk", "kSskorrrrrooksSk", "kSskttttttttksSk", "kSsknttttttnksSk",
      "kSSSSSSSSSSSSSSk", "kkkkkkkkkkkkkkkk", "SSSSSSSSSSSSSSSS", "kkkkkkkkkkkkkkkk",
    ],
  },
};
