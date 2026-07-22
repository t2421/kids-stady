/*
 * 町・城の外観タイル (16x16)。建物は複数タイルの組み合わせで1棟を構成する:
 *   屋根 [RR] / {__} + 壁 W・窓 o・看板 I(宿) S(店)・扉 D
 *   城   銃眼 M・城壁 #・窓 +・旗 B・大門 G/H
 * 装飾: 噴水 F・井戸 u・柵 x・花 f/y
 */
import type { PixelArt } from "./format";

/* 屋根 (赤瓦)。L/R が棟の左右端、L2/M2/R2 が軒側の段 */
const ROOF_PALETTE = {
  k: "#5c1f12",
  d: "#91341f",
  r: "#b84529",
  R: "#d75b38",
  l: "#ed8055",
  g: "#398447",
};

/* 城壁 (灰色の大石積み) */
const STONE_PALETTE = {
  k: "#4a4d55",
  d: "#747982",
  s: "#989ea8",
  S: "#b7bdc5",
};

export const TOWN_TILES: Record<string, PixelArt> = {
  roofM: {
    palette: ROOF_PALETTE,
    rows: [
      "kkkkkkkkkkkkkkkk", "llllllllllllllll", "RRRRRRRRRRRRRRRR", "rrrrdrrrrdrrrrdr",
      "dddddddddddddddd", "RRRRRRRRRRRRRRRR", "rdrrrrdrrrrdrrrr", "dddddddddddddddd",
      "RRRRRRRRRRRRRRRR", "rrrrdrrrrdrrrrdr", "dddddddddddddddd", "RRRRRRRRRRRRRRRR",
      "rdrrrrdrrrrdrrrr", "dddddddddddddddd", "rrrrrrrrrrrrrrrr", "kkkkkkkkkkkkkkkk",
    ],
  },
  roofL: {
    palette: ROOF_PALETTE,
    rows: [
      "ggkkkkkkkkkkkkkk", "gkllllllllllllll", "kRRRRRRRRRRRRRRR", "krrrdrrrrdrrrrdr",
      "kddddddddddddddd", "kRRRRRRRRRRRRRRR", "kdrrrrdrrrrdrrrr", "kddddddddddddddd",
      "kRRRRRRRRRRRRRRR", "krrrdrrrrdrrrrdr", "kddddddddddddddd", "kRRRRRRRRRRRRRRR",
      "kdrrrrdrrrrdrrrr", "kddddddddddddddd", "krrrrrrrrrrrrrrr", "kkkkkkkkkkkkkkkk",
    ],
  },
  roofR: {
    palette: ROOF_PALETTE,
    rows: [
      "kkkkkkkkkkkkkkgg", "llllllllllllllkg", "RRRRRRRRRRRRRRRk", "rrrdrrrrdrrrrdrk",
      "dddddddddddddddk", "RRRRRRRRRRRRRRRk", "drrrrdrrrrdrrrrk", "dddddddddddddddk",
      "RRRRRRRRRRRRRRRk", "rrrdrrrrdrrrrdrk", "dddddddddddddddk", "RRRRRRRRRRRRRRRk",
      "drrrrdrrrrdrrrrk", "dddddddddddddddk", "rrrrrrrrrrrrrrrk", "kkkkkkkkkkkkkkkk",
    ],
  },
  roofM2: {
    palette: ROOF_PALETTE,
    rows: [
      "dddddddddddddddd", "RRRRRRRRRRRRRRRR", "rdrrrrdrrrrdrrrr", "dddddddddddddddd",
      "RRRRRRRRRRRRRRRR", "rrrrdrrrrdrrrrdr", "dddddddddddddddd", "RRRRRRRRRRRRRRRR",
      "rdrrrrdrrrrdrrrr", "dddddddddddddddd", "RRRRRRRRRRRRRRRR", "rrrrdrrrrdrrrrdr",
      "dddddddddddddddd", "rrrrrrrrrrrrrrrr", "kkkkkkkkkkkkkkkk", "kkkkkkkkkkkkkkkk",
    ],
  },
  roofL2: {
    palette: ROOF_PALETTE,
    rows: [
      "kddddddddddddddd", "kRRRRRRRRRRRRRRR", "kdrrrrdrrrrdrrrr", "kddddddddddddddd",
      "kRRRRRRRRRRRRRRR", "krrrdrrrrdrrrrdr", "kddddddddddddddd", "kRRRRRRRRRRRRRRR",
      "kdrrrrdrrrrdrrrr", "kddddddddddddddd", "kRRRRRRRRRRRRRRR", "krrrdrrrrdrrrrdr",
      "kddddddddddddddd", "krrrrrrrrrrrrrrr", "kkkkkkkkkkkkkkkk", "kkkkkkkkkkkkkkkk",
    ],
  },
  roofR2: {
    palette: ROOF_PALETTE,
    rows: [
      "dddddddddddddddk", "RRRRRRRRRRRRRRRk", "drrrrdrrrrdrrrrk", "dddddddddddddddk",
      "RRRRRRRRRRRRRRRk", "rrrdrrrrdrrrrdrk", "dddddddddddddddk", "RRRRRRRRRRRRRRRk",
      "drrrrdrrrrdrrrrk", "dddddddddddddddk", "RRRRRRRRRRRRRRRk", "rrrdrrrrdrrrrdrk",
      "dddddddddddddddk", "rrrrrrrrrrrrrrrk", "kkkkkkkkkkkkkkkk", "kkkkkkkkkkkkkkkk",
    ],
  },
  /* 漆喰+木骨の家壁 */
  house: {
    palette: { p: "#e8dcc0", q: "#cdbd9d", t: "#7a5533", k: "#4a3320" },
    rows: [
      "tttttttttttttttt", "kkkkkkkkkkkkkkkk", "tppppppppppppppt", "tpppppqppppppppt",
      "tppppppppppppppt", "tppppppppppqpppt", "tppqpppppppppppt", "tppppppppppppppt",
      "tpppppppqpppppqt", "tppppppppppppppt", "tpqppppppppqpppt", "tppppppppppppppt",
      "tppppppqpppppppt", "tppppppppppppppt", "tqqqqqqqqqqqqqqt", "kkkkkkkkkkkkkkkk",
    ],
  },
  /* 家壁 + 窓 (青ガラス) */
  hwin: {
    palette: { p: "#e8dcc0", q: "#cdbd9d", t: "#7a5533", k: "#4a3320", b: "#8cc6e8", B: "#5b93c9" },
    rows: [
      "tttttttttttttttt", "kkkkkkkkkkkkkkkk", "tppppppppppppppt", "tpppkkkkkkkkpppt",
      "tpppkbbkkbbkpppt", "tpppkbBkkbBkpppt", "tpppkbbkkbbkpppt", "tpppkkkkkkkkpppt",
      "tpppkbbkkbbkpppt", "tpppkBBkkBBkpppt", "tpppkkkkkkkkpppt", "tppttttttttttppt",
      "tppppppppppppppt", "tppqppppppqppppt", "tqqqqqqqqqqqqqqt", "kkkkkkkkkkkkkkkk",
    ],
  },
  /* 家壁 + 宿屋の看板 (ベッドの絵) */
  signInn: {
    palette: { p: "#e8dcc0", q: "#cdbd9d", t: "#7a5533", k: "#4a3320", T: "#b57736", w: "#f2eee1", r: "#c23a3a" },
    rows: [
      "tttttttttttttttt", "kkkkkkkkkkkkkkkk", "tppppppkkppppppt", "tppkkkkkkkkkkppt",
      "tppkTTTTTTTTkppt", "tppkTwwTTTTTkppt", "tppkTwwrrrrTkppt", "tppkTTTrrrrTkppt",
      "tppkTTTTTTTTkppt", "tppkkkkkkkkkkppt", "tppppppppppppppt", "tpqpppppppppqppt",
      "tppppppppppppppt", "tppppppppppppppt", "tqqqqqqqqqqqqqqt", "kkkkkkkkkkkkkkkk",
    ],
  },
  /* 家壁 + 道具屋の看板 (金貨ぶくろの絵) */
  signShop: {
    palette: { p: "#e8dcc0", q: "#cdbd9d", t: "#7a5533", k: "#4a3320", T: "#b57736", y: "#e8b93c", Y: "#c69422" },
    rows: [
      "tttttttttttttttt", "kkkkkkkkkkkkkkkk", "tppppppkkppppppt", "tppkkkkkkkkkkppt",
      "tppkTTTTTTTTkppt", "tppkTTTyyTTTkppt", "tppkTTyyyyTTkppt", "tppkTyyYYyyTkppt",
      "tppkTTyYYyTTkppt", "tppkkkkkkkkkkppt", "tppppppppppppppt", "tpqpppppppppqppt",
      "tppppppppppppppt", "tppppppppppppppt", "tqqqqqqqqqqqqqqt", "kkkkkkkkkkkkkkkk",
    ],
  },
  /* 城壁 (大きな石積み) */
  cwall: {
    palette: STONE_PALETTE,
    rows: [
      "kkkkkkkkkkkkkkkk", "SSSSSSSSkSSSSSSS", "ssssssssksssssss", "ssdsssssksssdsss",
      "ssssssssksssssss", "sdsssssskssssdss", "ddddddddkddddddd", "kkkkkkkkkkkkkkkk",
      "kSSSSSSSSSSSSSSS", "kssssssssssdssss", "ksssssssssssssss", "ksssdssssssssdss",
      "ksssssssssssssss", "ksssssssssdsssss", "kddddddddddddddd", "kkkkkkkkkkkkkkkk",
    ],
  },
  /* 城壁の上端 (銃眼つき胸壁) */
  cbattle: {
    palette: { ...STONE_PALETTE, n: "#10141c" },
    rows: [
      "nkkkkkknnkkkkkkn", "nkSSSSknnkSSSSkn", "nkSsssknnkSssskn", "nkssssknnksssskn",
      "nksdssknnkssdskn", "nkssssknnksssskn", "kkkkkkkkkkkkkkkk", "SSSSSSSSSSSSSSSS",
      "ssssssssssssssss", "kkkkkkkkkkkkkkkk", "SSSSSSSSkSSSSSSS", "ssssssssksssssss",
      "ssdsssssksssdsss", "ssssssssksssssss", "ddddddddkddddddd", "kkkkkkkkkkkkkkkk",
    ],
  },
  /* 城壁 + 明かりのともるアーチ窓 */
  cwin: {
    palette: { ...STONE_PALETTE, n: "#1a1f2c", y: "#f5c84b" },
    rows: [
      "kkkkkkkkkkkkkkkk", "SSSSSSSSkSSSSSSS", "ssssssssksssssss", "sssssskkkkssssss",
      "sssssknnnnksssss", "sssssknyynksssss", "sdsssknyynksssds", "sssssknyynksssss",
      "sssssknyynksssss", "sssssknnnnksssss", "sssssskkkkssssss", "ksssdssssssssdss",
      "ksssssssssssssss", "ksssssssssdsssss", "kddddddddddddddd", "kkkkkkkkkkkkkkkk",
    ],
  },
  /* 城壁 + 王家の旗 (青地に金の紋) */
  banner: {
    palette: { ...STONE_PALETTE, B: "#2b4ea0", b: "#4169cc", y: "#e8b93c" },
    rows: [
      "kkkkkkkkkkkkkkkk", "SSSyyyyyyyyyySSS", "sssskBBBBBBkssss", "sssskBbbbbBkssss",
      "ssdskBbbbbBksdss", "sssskBbyybBkssss", "sssskByyyyBkssss", "sssskBbyybBkssss",
      "sssskBbbbbBkssss", "sssskBbbbbBkssss", "sdsskBbbbbBkssss", "sssskBbbbbBkssss",
      "sssskBbbbbBkssss", "sssskykykykyssss", "ssdsssssssssssss", "dddddddddddddddd",
    ],
  },
  /* 城の大門 (左半分)。歩けて城内へ入る */
  cgateL: {
    palette: { ...STONE_PALETTE, T: "#b57736", t: "#8b5429", y: "#e8b93c", e: "#5c3a1e" },
    rows: [
      "kkkkkkkkkkkkkkkk", "SSkkkkkkkkkkkkkk", "sskTTTTTTTTTTTTT", "sskTtttTtttTtttT",
      "sskTtttTtttTtttT", "sskTtktTtktTtktT", "sskTtttTtttTtttT", "sskTtttTtttTtttT",
      "sskTtttTtttTtyyT", "sskTtttTtttTtyyT", "sskTtktTtktTtktT", "sskTtttTtttTtttT",
      "sskTtttTtttTtttT", "sskTtttTtttTtttT", "sskeeeeeeeeeeeee", "dddddddddddddddd",
    ],
  },
  /* 城の大門 (右半分) */
  cgateR: {
    palette: { ...STONE_PALETTE, T: "#b57736", t: "#8b5429", y: "#e8b93c", e: "#5c3a1e" },
    rows: [
      "kkkkkkkkkkkkkkkk", "kkkkkkkkkkkkkkSS", "TTTTTTTTTTTTTkss", "TtttTtttTtttTkss",
      "TtttTtttTtttTkss", "TtktTtktTtktTkss", "TtttTtttTtttTkss", "TtttTtttTtttTkss",
      "TyytTtttTtttTkss", "TyytTtttTtttTkss", "TtktTtktTtktTkss", "TtttTtttTtttTkss",
      "TtttTtttTtttTkss", "TtttTtttTtttTkss", "eeeeeeeeeeeeekss", "dddddddddddddddd",
    ],
  },
  /* 噴水 (草地の広場用) */
  fountain: {
    palette: {
      g: "#398447", G: "#4fa35a", D: "#2d6d3a",
      k: "#4a4d55", S: "#b7bdc5",
      b: "#2f7bc2", B: "#79bce7", w: "#a8d8f0", l: "#e6f5fd",
    },
    rows: [
      "ggggggggggGggggg", "gggggkkkkkkggggg", "gggkkSSSSSSkkggg", "ggkSSwwwwwwSSkgg",
      "gkSwwbbbbbbwwSkg", "gkSwbbBllBbbwSkg", "gkSwbbBllBbbwSkg", "gkSwwbbbbbbwwSkg",
      "ggkSSwwwwwwSSkgg", "gggkkSSSSSSkkggg", "ggggDDDDDDDDgggg", "gggggggggggggggg",
      "ggGgggggggggDggg", "gggggggggggggggg", "ggggggGggggggggg", "gggggggggggggggg",
    ],
  },
  /* 井戸 (小さな赤屋根つき) */
  well: {
    palette: {
      g: "#398447", G: "#4fa35a", D: "#2d6d3a",
      r: "#b84529", k: "#33241a", t: "#7a5533",
      S: "#b7bdc5", n: "#1a222e",
    },
    rows: [
      "ggggrrrrrrrrgggg", "gggkrrrrrrrrkggg", "gggtggggggggtggg", "gggtggggggggtggg",
      "gggtgkkkkkkgtggg", "gggtkSSSSSSktggg", "ggggkSnnnnSkgggg", "ggggkSnnnnSkgggg",
      "ggggkSSSSSSkgggg", "gggggkkkkkkggggg", "ggggDDDDDDDDgggg", "gggggggggggggggg",
      "ggGgggggggggGggg", "gggggggggggggggg", "ggggggDggggggggg", "gggggggggggggggg",
    ],
  },
  /* 木の柵 (横方向につながる) */
  fence: {
    palette: { g: "#398447", G: "#4fa35a", D: "#2d6d3a", t: "#7a5533", T: "#a97648", k: "#4a3320" },
    rows: [
      "gggggggggggggggg", "ggGggggggggggggg", "ggkkggggggkkgggg", "ggtkggggggtkgggg",
      "ggtkggggggtkgggg", "TTTTTTTTTTTTTTTT", "tttttttttttttttt", "ggtkggggggtkgggg",
      "ggtkggggggtkgggg", "TTTTTTTTTTTTTTTT", "tttttttttttttttt", "ggtkggggggtkgggg",
      "ggkkggggggkkgggg", "ggDDggggggDDgggg", "gggggggggggggggg", "ggggGggggggggggg",
    ],
  },
  /* 赤い花の咲く草地 (歩ける) */
  flowerR: {
    palette: { g: "#398447", G: "#4fa35a", D: "#2d6d3a", l: "#70b868", R: "#e05252", Y: "#f7d354" },
    rows: [
      "gggggggggggggggg", "ggggggggggglgggg", "ggggRggggggggggg", "gggRYRgggggggggg",
      "ggggRggggggggggg", "gggggggggggRgggg", "ggGgggggggRYRggg", "gggggggggggRgggg",
      "gggggggggggggggg", "ggggggggggggGggg", "gggggRgggggggggg", "ggggRYRggggggggg",
      "gggggRgggggggggg", "ggggggggggglgggg", "gDgggggggggggggg", "gggggggggggggggg",
    ],
  },
  /* 黄色い花の咲く草地 (歩ける) */
  flowerY: {
    palette: { g: "#398447", G: "#4fa35a", D: "#2d6d3a", l: "#70b868", y: "#f7d354", o: "#e8862f" },
    rows: [
      "gggggggggggggggg", "gggGgggggggggggg", "ggggggggggyggggg", "gggggggggyoygggg",
      "ggggggggggyggggg", "ggyggggggggggggg", "gyoyggggggGggggg", "ggyggggggggggggg",
      "gggggggggggggggg", "gggggggggggggGgg", "ggggggggggyggggg", "gggGgggggyoygggg",
      "ggggggggggyggggg", "ggglgggggggggggg", "gggggggggggggDgg", "gggggggggggggggg",
    ],
  },
};
