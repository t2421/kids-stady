/* 16x16 のレトロJRPG風フィールドタイル。テクスチャ名は "tile-" + キー。 */
import type { PixelArt } from "./format";

export const TILE_SIZE = 16;

export const TILE_ART: Record<string, PixelArt> = {
  grass: {
    palette: { g: "#398447", G: "#4fa35a", d: "#2d6d3a", l: "#70b868" },
    rows: [
      "ggggGggggggggggg", "ggggggggdggggggg", "gglgggggdgggGggg", "gGgggggggggggggg",
      "gggggdgggglggggg", "gggggdgggGgggggg", "Gggggggggggggdgg", "gggglggggggggdgg",
      "gggggggGgggggggg", "ggdgggggggglgggg", "ggdgggGggggggggg", "gggggggggggggGgg",
      "ggglggggdggggggg", "Ggggggggdgggglgg", "ggggGggggggggggg", "ggggggggggGggggg",
    ],
  },
  bush: {
    palette: { g: "#398447", D: "#174a2a", d: "#246b35", G: "#4fa85a", l: "#78c66c" },
    rows: [
      "gggggggggggggggg", "gggDDgggggDDgggg", "ggDddDDggDddDDgg", "gDdGGdDDDdGGdDgg",
      "DdlGGGdDDlGGGdDg", "DdGGdGGDDGGdGGDg", "gDddddDgDddddDDg", "ggDddDgggDddDggg",
      "gggDDggDggDDgggg", "ggDddDDDDdddDDgg", "gDdGGdDDdGGGdDgg", "DdlGGGdDlGGGGdDg",
      "DdGGdGGDGGdGGDDg", "gDddddDDDddddDgg", "ggDddDgggDddDggg", "gggDDgggggDDgggg",
    ],
  },
  tree: {
    palette: { g: "#398447", k: "#142d20", d: "#1e6032", G: "#338244", l: "#62ad54", t: "#704326", T: "#a16a38" },
    rows: [
      "gggggkkkkkgggggg", "gggkkddGddkkgggg", "ggkkdGGGGGdkkggg", "gkdGGlGGGGGdkkgg",
      "kdGGGGGdGGGGGdkg", "kdGlGGddGGGlGGdk", "kdGGGGGGGGGGGGdk", "gkdGGdGGGlGGGdkg",
      "ggkddGGGGGGddkgg", "gggkkddddddkkggg", "gggggkkTTkkggggg", "ggggggkTTkgggggg",
      "ggggggkTTkgggggg", "ggggggkTtkgggggg", "gggggkkttkkggggg", "gggggggggggggggg",
    ],
  },
  water: {
    palette: { b: "#2364a7", B: "#2f7bc2", d: "#194d8c", w: "#79bce7", l: "#b4dcf2" },
    rows: [
      "bbbbbbbbbbbbbbbb", "bbbBBBbbbbbbbBBB", "BBwwlwwBBBBwwlww", "wwBBBBBwwwwBBBBB",
      "bbbbbbbbbbbbbbbb", "ddbbbbbbddbbbbbb", "bbbBBBbbbbbbbBBB", "BBwwlwwBBBBwwlww",
      "wwBBBBBwwwwBBBBB", "bbbbbbbbbbbbbbbb", "bbbbddbbbbbbddbb", "bbbBBBbbbbbbbBBB",
      "BBwwlwwBBBBwwlww", "wwBBBBBwwwwBBBBB", "bbbbbbbbbbbbbbbb", "ddbbbbbbddbbbbbb",
    ],
  },
  path: {
    palette: { p: "#c6a267", P: "#ddbd7d", d: "#a88351", l: "#ead29b" },
    rows: [
      "pppppppppppppppp", "ppPpppppdpppppPp", "ppppplppdppppppp", "pdpppppppppPpppp",
      "pdppPppppppppdlp", "ppppppplpppppdpp", "pPpppdppppPppppp", "pppppdpppppppppp",
      "pplppppppdppppPp", "pppppPpppdpppppp", "pdpppppppppplppp", "pdppplppPppppppp",
      "pppPppppppdppppp", "pppppppdppdppPpp", "pPpplppdpppppppp", "pppppppppppppppp",
    ],
  },
  wall: {
    palette: { k: "#4a4d55", d: "#747982", s: "#989ea8", S: "#b7bdc5", l: "#d3d6da" },
    rows: [
      "kkkkkkkkkkkkkkkk", "kSSSSSSSkSSSSSSS", "kslSSSsskssSlSSs", "ksssssssksssssss",
      "kkkkkkkkkkkkkkkk", "SSSkSSSSSSSkSSSS", "sSSksslSSsskSSls", "ssskssssssskssss",
      "kkkkkkkkkkkkkkkk", "kSSSSSSSkSSSSSSS", "kssSlSSsksslSSSs", "ksssssssksssssss",
      "kkkkkkkkkkkkkkkk", "SSSSkSSSSSSSkSSS", "slSskSSslSSSksss", "ssssksssssssksss",
    ],
  },
  roof: {
    palette: { k: "#682619", d: "#91341f", r: "#b84529", R: "#d75b38", l: "#ed8055" },
    rows: [
      "kkkkkkkkkkkkkkkk", "kRRRRRRkkRRRRRRk", "krlllrrkkrlllrrk", "krrrrrrkkrrrrrrk",
      "kkkkkkkkkkkkkkkk", "kkRRRRRRkkRRRRRR", "kkrlllrrkkrlllrr", "kkrrrrrrkkrrrrrr",
      "kkkkkkkkkkkkkkkk", "kRRRRRRkkRRRRRRk", "krlllrrkkrlllrrk", "krrrrrrkkrrrrrrk",
      "kkkkkkkkkkkkkkkk", "kkRRRRRRkkRRRRRR", "kkrlllrrkkrlllrr", "kkrrrrrrkkrrrrrr",
    ],
  },
  floor: {
    palette: { k: "#765033", d: "#95683f", f: "#b27d4b", F: "#c9955f", l: "#ddb57d" },
    rows: [
      "kkkkkkkkkkkkkkkk", "fFFFFFFfFFFFFFFf", "fFFlFFFfFFFlFFFf", "fFFFFFFfFFFFFFFf",
      "fFFFFFFfFFFFFFFf", "fFFFFFFfFFFFFFFf", "fFFFFFFfFFFFFFFf", "fFFFFFFfFFFFFFFf",
      "kkkkkkkkkkkkkkkk", "FFFfFFFFFFFfFFFF", "FlFfFFFFFlFfFFFF", "FFFfFFFFFFFfFFFF",
      "FFFfFFFFFFFfFFFF", "FFFfFFFFFFFfFFFF", "FFFfFFFFFFFfFFFF", "FFFfFFFFFFFfFFFF",
    ],
  },
  door: {
    palette: { k: "#291b14", d: "#54321f", t: "#764a2a", T: "#9a6335", l: "#bd8047", y: "#f5c84b" },
    rows: [
      "kkkkkkkkkkkkkkkk", "kTTTTTTTTTTTTTTk", "kTllllllllllllTk", "kTttttttttttttTk",
      "kTtkkkkkkkkkktTk", "kTtkTTTTTTTTktTk", "kTtkTttttttTktTk", "kTtkTttttttTktTk",
      "kTtkTtttttyTktTk", "kTtkTtttttyTktTk", "kTtkTttttttTktTk", "kTtkTttttttTktTk",
      "kTtkTttttttTktTk", "kTtkTttttttTktTk", "kTtkkkkkkkkkktTk", "kkkkkkkkkkkkkkkk",
    ],
  },
  caveFloor: {
    palette: { c: "#48404e", C: "#595160", d: "#37313d", l: "#6d6472", k: "#29242e" },
    rows: [
      "cccccccccccccccc", "ccCcccccdccccCcc", "ccllccccdccccccc", "ccCcccccccccdccc",
      "ccccckkcccccdccc", "cdcckddkcccccccc", "cdccckkccccllccc", "ccccccccccccCccc",
      "cCcccccdcccccccc", "cllccccdccccckkc", "cCcccccccccckddk", "ccccccdcccccckkc",
      "ccccccdcccCccccc", "cckkccccccllcccc", "ckddkcccccCccccc", "cckkcccccccccccc",
    ],
  },
  chest: {
    palette: { k: "#291b14", d: "#5c351e", t: "#8b5429", T: "#b57736", l: "#dc9b4d", y: "#f4d34f" },
    rows: [
      "................", "....kkkkkkkk....", "..kkTTTTTTTTkk..", ".kTllllllllllTk.",
      "kTllTTTTTTTTllTk", "kTttttttttttttTk", "kkkkkkkkkkkkkkkk", "kTTTTTTTTTTTTTTk",
      "kTtttttkktttttTk", "kTttttkyykttttTk", "kTttttkyykttttTk", "kTtttttkktttttTk",
      "kTttttttttttttTk", "kddddddddddddddk", ".kkkkkkkkkkkkkk.", "................",
    ],
  },
  /* ---- 屋内 (建物内部マップ用) ---- */
  bed: {
    palette: { k: "#291b14", t: "#8b5429", r: "#b84529", R: "#d75b38", w: "#f2eee1", W: "#cfc9b8" },
    rows: [
      "kkkkkkkkkkkkkkkk", "kwwwwwwwwwwwwwwk", "kwWWWWWWWWWWWWwk", "kwwwwwwwwwwwwwwk",
      "kkkkkkkkkkkkkkkk", "kRRRRRRRRRRRRRRk", "kRrrRRrrRRrrRRrk", "kRRRRRRRRRRRRRRk",
      "kRrrRRrrRRrrRRrk", "kRRRRRRRRRRRRRRk", "kRRRRRRRRRRRRRRk", "kkkkkkkkkkkkkkkk",
      "ktkkkkkkkkkkkktk", "ktkkkkkkkkkkkktk", "ktkkkkkkkkkkkktk", "kkkkkkkkkkkkkkkk",
    ],
  },
  table: {
    palette: { k: "#291b14", t: "#8b5429", T: "#b57736", l: "#dc9b4d" },
    rows: [
      "................", ".kkkkkkkkkkkkkk.", "kTTTTTTTTTTTTTTk", "kTllTTTTTTTTllTk",
      "kTTTTTTTTTTTTTTk", "kttttttttttttttk", ".kkkkkkkkkkkkkk.", "..ktk......ktk..",
      "..ktk......ktk..", "..ktk......ktk..", "..ktk......ktk..", "..ktk......ktk..",
      "..ktk......ktk..", ".kttk......kttk.", ".kkkk......kkkk.", "................",
    ],
  },
  carpet: {
    palette: { r: "#8a3535", R: "#a54545", y: "#d9b45a", d: "#6b2828" },
    rows: [
      "yyyyyyyyyyyyyyyy", "yRRRRRRRRRRRRRRy", "yRrrrrrrrrrrrrRy", "yRryyyyyyyyyyrRy",
      "yRryrrrrrrrryrRy", "yRryrRRRRRRryrRy", "yRryrRddddRryrRy", "yRryrRdyydRryrRy",
      "yRryrRdyydRryrRy", "yRryrRddddRryrRy", "yRryrRRRRRRryrRy", "yRryrrrrrrrryrRy",
      "yRryyyyyyyyyyrRy", "yRrrrrrrrrrrrrRy", "yRRRRRRRRRRRRRRy", "yyyyyyyyyyyyyyyy",
    ],
  },
  pot: {
    palette: { k: "#241a14", t: "#7a4a26", T: "#a16a38", l: "#c98f4f", f: "#b27d4b", F: "#c9955f", d: "#95683f" },
    rows: [
      "ffffFfffFfffffff", "fFffffdfffffFfff", "ffffkkkkkkffffff", "fffkTTTTTTkfffff",
      "ffkTlTTTTTlkffff", "ffkTTTTTTTTkffff", "fkTTTTTTTTTTkfff", "fkTtTTTTTTtTkfff",
      "fkTtTTTTTTtTkfff", "fkTTTTTTTTTTkfff", "ffkTtTTTTtTkffff", "ffkTTttttTTkffff",
      "fffkkkkkkkkfffff", "fFffffffffffdfff", "ffffFfffffffffff", "ffdfffffFfffffff",
    ],
  },
  caveWall: {
    palette: { k: "#17131d", d: "#282230", c: "#393241", C: "#4b4353", l: "#62596b" },
    rows: [
      "kkkkkkkkkkkkkkkk", "kCCCCCCkkCCCCCCk", "kCllCCCkkCCClCCk", "kCCCCCCkkCCCCCCk",
      "kkkddkkkkkkddkkk", "dddkCCCCCCkkCCCC", "CCdkClCCCCkkClCC", "CCdkCCCCCCkkCCCC",
      "kkkkkkkkkkkkkkkk", "kCCCCCCkkCCCCCCk", "kCCClCCkkCllCCCk", "kCCCCCCkkCCCCCCk",
      "kkddkkkkkkddkkkk", "CCkCCCCCCkkCCCCC", "lCkCCClCCkkCClCC", "CCkCCCCCCkkCCCCC",
    ],
  },
};
