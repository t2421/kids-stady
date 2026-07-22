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
};
