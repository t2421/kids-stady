/* 「ケシケシ軍団」の16x16モンスター。テクスチャ名は "monster-" + キー。 */
import type { PixelArt } from "./format";

const INK_ROWS = [
  ".......kk.......", "......kiik......", ".....kiIIik.....", "....kiIIIIik....",
  "...kiIIIIIIik...", "..kiIIIIIIIIik..", ".kiIIwwIIwwIIIik", "kIIwkwIIwkwIIIIk",
  "kIIIIIIIIIIIIIIk", "kIIIIIkkIIIIIIIk", "kIIIIkllkIIIIIIk", ".kIIIIIIIIIIIIk.",
  "..kkIIIIIIIIkk..", "..kilkIIkilk....", ".kilkk..kilkk...", "..kk.....kk.....",
];

export const MONSTER_ART: Record<string, PixelArt> = {
  keshigomun: {
    palette: { k: "#18202b", w: "#eee9dd", W: "#c9c5bb", l: "#ffffff", b: "#3475bd", B: "#1d4d83", c: "#69a5dc", p: "#ee8298" },
    rows: [
      ".....kkkkkk.....", "...kkllllllkk...", "..klwwwwwwwwlk..", ".klwwwwwwwwwwlk.",
      ".kwwkkwwwwkkwwk.", ".kwwkkwwwwkkwwk.", ".kwwwwwwwwwwwwk.", ".kwpwwwkkkkwpwwk",
      ".kwwwwkWWkwwwwwk", "..kkkkkkkkkkkk..", "kcccccccccccccck", "kcbBbbBbbBbbBbck",
      "kcbbbbbbbbbbbbck", "kcBBBBBBBBBBBBck", "kccccccccccccck.", "..kkkkkkkkkkkk..",
    ],
  },
  inkugumo: {
    palette: { k: "#111126", i: "#252563", I: "#3c3b99", l: "#6969cc", w: "#f7f4e8" },
    rows: INK_ROWS,
  },
  dekaInkugumo: {
    palette: { k: "#211027", i: "#4a1e68", I: "#74339a", l: "#ad6bd3", w: "#fff3df" },
    rows: INK_ROWS,
  },
  mojibakeBat: {
    palette: { k: "#171525", b: "#40365f", B: "#68578e", l: "#917bb7", w: "#f8f2df", y: "#f0c842" },
    rows: [
      "k..............k", "kk............kk", "kbk..........kbk", "kbbk..kkkk..kbbk",
      "kbbbkkbBBbkkbbbk", ".kbbbBllllBbbbk.", "..kBBBlBBBlBBk..", "...kBwkBBkwBk...",
      "...kBwkkkwBk....", "...kBBBBBBBk....", "....kBByBBk.....", ".....kByBk......",
      "......kyk.......", "......kyk.......", ".......k........", "................",
    ],
  },
  togeImomushi: {
    palette: { k: "#182016", g: "#4f9639", G: "#2e682d", l: "#78bd4e", t: "#d7b878", T: "#f1d99b", w: "#fff8df", p: "#e67e91" },
    rows: [
      "...t...t...t....", "..tTt.tTt.tTt...", "..kGk.kGk.kGk...", ".kglGkglGkglGkk.",
      "kglglglglglglgk.", "kggGgggGgggGgggk", ".kglGkglGkglGggk", "..kGgGkGgGkGglgk",
      "...kk.kklggggggk", ".....kglgggkwkwk", "....kggGgggkwkwk", "....kglggpgggggk",
      ".....kgggggggkk.", "......kkgggkk...", "........kkk.....", "................",
    ],
  },
  eraser: {
    palette: { k: "#1d1b1a", w: "#eee9dc", W: "#c8c2b4", l: "#ffffff", r: "#b54332", R: "#762a2a", c: "#dd6550", y: "#efca4b" },
    rows: [
      "....kkkkkkkk....", "..kkcccccccckk..", ".kcrrrrrrrrrrRck", "kcrRrrRrrRrrRrck",
      "kcrrrrrrrrrrrrck", "kRRRRRRRRRRRRRRk", ".kkkkkkkkkkkkkk.", ".klwwwwwwwwwwlk.",
      ".kwwkkwwwwkkwwk.", ".kwwkkwwwwkkwwk.", ".kwwwwwwwwwwwwk.", ".kwwwkkyykkwwwwk",
      ".kwwkWWWWWWkwwwk", ".kWwWwWwWwWwWwWk", "..kWwWwWwWwWwWk.", "...kkkkkkkkkk...",
    ],
  },
  kazunezumi: {
    palette: { k: "#1a1a1d", g: "#858b94", G: "#5d646d", l: "#adb2b8", p: "#df8e9d", P: "#f2b4bf", w: "#fff8e6", y: "#edc43f" },
    rows: [
      "..kk........kk..", ".kpPk......kPpk.", "kpggPkkkkkkPggpk", "kPgggGGGGGGgggPk",
      ".kGggggggggggGk.", "kgggkkggggkkgggk", "kgggkwkgggkwkggk", "kggggggggggggggk",
      ".kgggGGkkGGgggk.", "..kggGwwwwGggk..", ".kggggggggggggkp", "kgggyyyggggggkpk",
      "kgggykygggggkpp.", ".kggyyygggggkp..", "..kkggkkggkk....", "....kk..kk......",
    ],
  },
  /* シュウセイエキン — 修正液のおばけ (第2章・塔) */
  shuseiekin: {
    palette: { k: "#1b1d24", w: "#f4f1e6", W: "#d5d1c2", l: "#ffffff", g: "#8a9aa8", p: "#7ec3d8", d: "#5a6a78" },
    rows: [
      "......kkkk......", ".....kggggk.....", ".....kgddgk.....", "....kkkkkkkk....",
      "....kwwwwwwk....", "...kwwlwwlwwk...", "..kwwwwwwwwwwk..", "..kwwkwwwwkwwk..",
      "..kwwkwwwwkwwk..", "..kwwwwwwwwwwk..", "..kwwwkkkkwwwk..", "..kWwwwwwwwwWk..",
      "..kWwpwwwwpwWk..", "...kWwwwwwwWk...", "....kWWWWWWk....", ".....kkkkkk.....",
    ],
  },
  /* インクガニ — 海のインクいきもの (第2章・海辺) */
  inkgani: {
    palette: { k: "#161a26", i: "#2a3a7b", I: "#3d54ab", l: "#7186d5", w: "#f7f4e8", r: "#d55a6b" },
    rows: [
      "kk....kkkk....kk", "kikk.kIIIIk.kkik", ".kiikIIIIIIkiik.", "..kkIIIIIIIIkk..",
      "...kIwkIIkwIk...", "...kIwkIIkwIk...", "..kIIIIrrIIIIk..", "..kIIIIIIIIIIk..",
      ".kiIIIIIIIIIIik.", ".kiIkIIIIIIkIik.", "..kkiIIIIIIikk..", "...kIIkkkkIIk...",
      "..kiIk....kIik..", ".kiik......kiik.", ".kkk........kkk.", "................",
    ],
  },
  /* インクの魔女ブロッタ — 第2章ボス */
  blotta: {
    palette: { k: "#140f1e", h: "#3a2a5e", H: "#54408a", s: "#e8c9e0", i: "#2a2a6b", I: "#3a3a9b", l: "#8a6bd5", w: "#f4f1e6", y: "#f0c95a", p: "#c04a7e" },
    rows: [
      "......kkkkk.....", ".....khhhhhk....", "....khHHHHHhk...", "...khHHHHHHHhk..",
      "..kkkkkkkkkkkkk.", "...khhhhhhhhhk..", "...ksskssksssk..", "...ksskssksssk..",
      "...kssssssssk...", "....kspssspk....", "...kiiiiiiiiik..", "..kiIIlIIlIIiik.",
      ".kiIIIIIIIIIIik.", ".kiIIyIIIyIIIik.", "..kiIIIIIIIIik..", "...kkkkkkkkkk...",
    ],
  },
};

/* あわケシゴムン — ケシゴムンの海バージョン (色違い) */
MONSTER_ART.awaKeshigomun = {
  palette: { k: "#18202b", w: "#d8f0ee", W: "#a8d5d0", l: "#ffffff", b: "#2a9aa5", B: "#1d6d78", c: "#69d5dc", p: "#7ec3d8" },
  rows: MONSTER_ART.keshigomun.rows,
};
