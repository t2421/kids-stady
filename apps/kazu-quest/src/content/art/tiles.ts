/*
 * 16x16 のレトロJRPG風フィールドタイル。テクスチャ名は "tile-" + キー。
 * 基本地形はここ、町・城の外観は tilesTown.ts、内装は tilesInterior.ts に分割し、
 * TILE_ART として統合する。
 */
import type { PixelArt } from "./format";
import { TOWN_TILES } from "./tilesTown";
import { INTERIOR_TILES } from "./tilesInterior";
import { WORLD_TILES } from "./tilesWorld";
import { DESERT_TILES } from "./tilesDesert";
import { ICE_TILES } from "./tilesIce";
import { SKY_TILES } from "./tilesSky";
import { NEGA_TILES } from "./tilesNega";
import { spiralTiles } from "./tilesSpiral";
import { ANIM_TILES } from "./tileAnims";

export const TILE_SIZE = 16;

const BASE_TILES: Record<string, PixelArt> = {
  grass: {
    palette: { g: "#398447", G: "#4fa35a", d: "#2d6d3a", l: "#70b868" },
    rows: [
      "ggggGggggggggggg", "ggggggggdggggggg", "gglgggggdgggGggg", "gGgggggggggggggg",
      "gggggdgggglggggg", "gggggdgggGgggggg", "Gggggggggggggdgg", "gggglggggggggdgg",
      "gggggggGgggggggg", "ggdgggggggglgggg", "ggdgggGggggggggg", "gggggggggggggGgg",
      "ggglggggdggggggg", "Ggggggggdgggglgg", "ggggGggggggggggg", "ggggggggggGggggg",
    ],
  },
  /* 草のゆらぎ2種 (legend の variants で座標ハッシュ混合する) */
  grass2: {
    palette: { g: "#398447", G: "#4fa35a", d: "#2d6d3a", l: "#70b868" },
    rows: [
      "gggggggggggGgggg", "gdgggGgggggggggg", "ggggggggggggdggg", "ggggglgggggggggg",
      "gGgggggggdgggggg", "ggggggggggggglgg", "ggggdggGgggggggg", "gggggggggggggggg",
      "glgggggggggGgggg", "ggggggGggggggdgg", "gggggggggggggggg", "gdggglgggggggggg",
      "ggggggggGggggggg", "ggggggggggdggggg", "gGgggggggggggglg", "gggggdgggggggggg",
    ],
  },
  grass3: {
    palette: { g: "#398447", G: "#4fa35a", d: "#2d6d3a", l: "#70b868", w: "#e8f2d8" },
    rows: [
      "gggggggggggggggg", "ggGggggggdgggggg", "gggggggggggggGgg", "ggggwggggggggggg",
      "gggggggggggglggg", "gGgggggdgggggggg", "gggggggggggggggg", "ggggggGggggggwgg",
      "ggdggggggggggggg", "gggggggggggggggg", "gglggggGgggggggg", "ggggggggggggdggg",
      "gwggggggggGggggg", "gggggggggggggggg", "ggggGgggglgggggg", "gggggggdgggggggg",
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
  /* 道のゆらぎ (小石まじり) */
  path2: {
    palette: { p: "#c6a267", P: "#ddbd7d", d: "#a88351", l: "#ead29b", s: "#8f7a55" },
    rows: [
      "pppppppppppppppp", "ppPppssppppppppp", "pppppssppdpppPpp", "pdpppppppppppppp",
      "ppppppppppplpppp", "pPppppppsspppppp", "ppppdpppssppppPp", "pppppppppppppppp",
      "pplpppppppppdppp", "ppppppPppppppppp", "pssppppppppplppp", "pssppplppPpppppp",
      "ppppppppppppsspp", "pPppppppdpppsspp", "pppplppppppppppp", "ppppppPppppppppp",
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
  /* 洞くつ床のゆらぎ (がれき多め) */
  caveFloor2: {
    palette: { c: "#48404e", C: "#595160", d: "#37313d", l: "#6d6472", k: "#29242e" },
    rows: [
      "cccccCcccccccccc", "cdcccccccckkcccc", "ccccccccckddkccc", "clcccdcccckkcccc",
      "cccccdcccccccccc", "ccCccccccccclccc", "cccccccCcccccccc", "ckkcccccccdccccc",
      "kddkccccccdccccc", "ckkccclccccccCcc", "cccccccccccccccc", "cccCccccdccccccc",
      "cclccccckkcccdcc", "ccccccckddkccccc", "cCcccccckkcccccc", "cccccccccccclccc",
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
  /* ボス前の たてふだ (levelSign イベント用)。板に すいしょうの青い印 */
  signpost: {
    palette: { k: "#3a2415", t: "#8b5429", T: "#b57736", l: "#dc9b4d", w: "#f2eee1", b: "#5fd0ff", B: "#2a8fd0" },
    rows: [
      "................", "..kkkkkkkkkkkk..", ".kTTTTTTTTTTTTk.", ".kTllllllllllTk.",
      ".kTlwwlbblwwlTk.", ".kTllllBBllllTk.", ".kTlwwwllwwwlTk.", ".kTllllllllllTk.",
      ".kTTTTTTTTTTTTk.", "..kkkkkkkkkkkk..", "......kttk......", "......kttk......",
      "......kttk......", "......kttk......", ".....kttttk.....", "................",
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

export const TILE_ART: Record<string, PixelArt> = {
  ...BASE_TILES,
  ...TOWN_TILES,
  ...INTERIOR_TILES,
  ...WORLD_TILES,
  ...DESERT_TILES,
  ...ICE_TILES,
  ...SKY_TILES,
  ...NEGA_TILES,
  ...ANIM_TILES,
};

/* 第4章: ふみかためた 雪の道 (雪原と 見わけが つくように 青みがかった灰色) */
TILE_ART.snowPath = {
  palette: { p: "#b9c6d6", P: "#cfdae7", d: "#9daebf", l: "#e2ecf5" },
  rows: TILE_ART.path.rows,
};

/*
 * 第5章の色ちがいタイル。石壁・床・水は形はそのままに 色だけを
 * 海底 (青緑) / 魔王城 (くろむらさき) / ようがん (赤) に差し替える。
 */
TILE_ART.seaWall = {
  palette: { k: "#12303f", d: "#1f4d5e", s: "#2f7183", S: "#4a97a8", l: "#7fc4cf" },
  rows: TILE_ART.wall.rows,
};
TILE_ART.seaFloor = {
  palette: { k: "#2f7183", d: "#4a97a8", s: "#6fbcc4", S: "#96d6da", l: "#c4eef0" },
  rows: TILE_ART.sandFloor.rows,
};
TILE_ART.seaFloor2 = {
  palette: { k: "#2f7183", d: "#4a97a8", s: "#6fbcc4", S: "#96d6da", l: "#c4eef0" },
  rows: TILE_ART.sandFloor2.rows,
};
TILE_ART.darkWall = {
  palette: { k: "#0d0a14", d: "#1e1830", s: "#332a4d", S: "#4a3d6b", l: "#6b5c8a" },
  rows: TILE_ART.wall.rows,
};
TILE_ART.darkFloor = {
  palette: { k: "#2a2140", d: "#453a63", s: "#5c4f80", S: "#736496", l: "#9a8ab8" },
  rows: TILE_ART.sandFloor.rows,
};
TILE_ART.darkFloor2 = {
  palette: { k: "#2a2140", d: "#453a63", s: "#5c4f80", S: "#736496", l: "#9a8ab8" },
  rows: TILE_ART.sandFloor2.rows,
};
TILE_ART.lava = {
  palette: { b: "#a32a12", B: "#d1461c", d: "#6b1a0c", w: "#f2913a", l: "#ffd48a" },
  rows: TILE_ART.water.rows,
};
TILE_ART.hedge = {
  palette: { g: "#2c6b38", D: "#123a20", d: "#1b5228", G: "#3d8a46", l: "#5eab54" },
  rows: TILE_ART.bush.rows,
};

/*
 * 第6章「下の世界ネガリア」の色ちがいタイル。地面も海も木も
 * 上の世界と同じ形のまま、色を すいこまれた むらさきに おきかえる。
 */
const NEGA_GROUND_PALETTE = { g: "#3b2f52", G: "#4d3f6b", d: "#2a2140", l: "#665694" };
TILE_ART.negaGround = {
  palette: NEGA_GROUND_PALETTE,
  rows: TILE_ART.grass.rows,
};
TILE_ART.negaGround2 = {
  palette: NEGA_GROUND_PALETTE,
  rows: TILE_ART.grass2.rows,
};
TILE_ART.negaPath = {
  palette: { p: "#57496e", P: "#6b5c87", d: "#3f3454", l: "#8a79a8" },
  rows: TILE_ART.path.rows,
};
TILE_ART.negaSea = {
  palette: { b: "#241c3d", B: "#332a57", d: "#150f26", w: "#5a4d8a", l: "#8a79b8" },
  rows: TILE_ART.water.rows,
};
TILE_ART.negaTree = {
  palette: { g: "#3b2f52", k: "#100c1a", d: "#241c3d", G: "#3f3160", l: "#5a4886", t: "#2a2138", T: "#463a5e" },
  rows: TILE_ART.tree.rows,
};
TILE_ART.locNegaVillage = {
  palette: {
    g: "#3b2f52",
    k: "#100c1a",
    r: "#5a2f4a",
    R: "#7d4166",
    w: "#c9b8dd",
    W: "#8a79a8",
    d: "#2a2140",
    G: "#4d3f6b",
  },
  rows: TILE_ART.locVillage.rows,
};
TILE_ART.locNegaTown = {
  palette: { g: "#3b2f52", k: "#100c1a", w: "#c9b8dd", W: "#8a79a8", b: "#5a4886", y: "#f2d675", r: "#7d4166", d: "#2a2140", s: "#463a5e", S: "#6b5c8a" },
  rows: TILE_ART.locCastle.rows,
};
TILE_ART.locSpeedHall = {
  palette: {
    g: "#3b2f52",
    k: "#100c1a",
    s: "#6b5c8a",
    S: "#a99ac9",
    d: "#463a5e",
    p: "#8fe0ff",
    y: "#f2e28a",
  },
  rows: TILE_ART.locTower.rows,
};
TILE_ART.locEnTemple = {
  palette: { b: "#241c3d", B: "#332a57", w: "#5a4d8a", k: "#100c1a", s: "#6b5c8a", S: "#a99ac9", y: "#8fe0ff" },
  rows: TILE_ART.locSeaTemple.rows,
};
TILE_ART.locPitagora = {
  palette: { s: "#3b2f52", S: "#4d3f6b", d: "#2a2140", l: "#665694", k: "#100c1a", r: "#6b5c8a", R: "#a99ac9", y: "#f2e28a", o: "#8fe0ff" },
  rows: TILE_ART.locRuins.rows,
};
TILE_ART.locZeromCastle = {
  palette: { g: "#3b2f52", k: "#0a0810", d: "#161022", s: "#241c3d", S: "#3f3160", r: "#5a1f3a", y: "#8fe0ff" },
  rows: TILE_ART.locDarkCastle.rows,
};

/*
 * ネガリアの色戻し演出 (LP-22)。マスター単元数が増えるほど、開けた土地
 * (大地・海・木・拠点アイコン) だけ 上の世界と同じ色に もどっていく。
 * ゼロム城 (locZeromCastle) と 洞くつの darkWall/darkFloor 系は 第5章の
 * 魔王城とも共用しており、かつ「まだ倒していない敵の城」は色が戻る
 * 対象ではないので ふくめない。
 *
 * 各キーの stage0 (このオブジェクトに もとから ある色) が いちばん くらい状態。
 * stage3 は 対応する 上の世界タイルの色と ぴったり同じになるよう 補間する。
 * key@1 / key@2 / key@3 という 名前で TILE_ART に足し、テクスチャは
 * generateAllTextures が ふつうのタイルと同じように 生成する。
 */
const NEGARIA_BRIGHT_TARGET: Record<string, string> = {
  negaGround: "grass",
  negaGround2: "grass2",
  negaPath: "path",
  negaSea: "water",
  negaTree: "tree",
  locNegaVillage: "locVillage",
  locNegaTown: "locCastle",
  locSpeedHall: "locTower",
  locEnTemple: "locSeaTemple",
  locPitagora: "locRuins",
};

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.round(Math.min(255, Math.max(0, v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function lerpColor(from: string, to: string, t: number): string {
  const [fr, fg, fb] = hexToRgb(from);
  const [tr, tg, tb] = hexToRgb(to);
  return rgbToHex(fr + (tr - fr) * t, fg + (tg - fg) * t, fb + (tb - fb) * t);
}

/* dark 側の キーぞろえで補間する (bright に無い文字は 変化させず そのまま) */
function lerpPalette(
  dark: Record<string, string>,
  bright: Record<string, string>,
  t: number,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [ch, color] of Object.entries(dark)) {
    out[ch] = lerpColor(color, bright[ch] ?? color, t);
  }
  return out;
}

for (const [darkKey, brightKey] of Object.entries(NEGARIA_BRIGHT_TARGET)) {
  const darkArt = TILE_ART[darkKey];
  const brightArt = TILE_ART[brightKey];
  for (const stage of [1, 2, 3]) {
    TILE_ART[`${darkKey}@${stage}`] = {
      palette: lerpPalette(darkArt.palette, brightArt.palette, stage / 3),
      rows: darkArt.rows,
    };
  }
}

/* この art名 が マスター段階で色を変える対象かどうか (MapView が使う) */
export function isNegariaStagedArt(art: string): boolean {
  return art in NEGARIA_BRIGHT_TARGET;
}

/*
 * stage0 は もとの art名 そのまま (くらい状態)。stage1〜3 は上で生成した
 * `<art>@<stage>` テクスチャ。対象外の art名 は stage に関わらず そのまま返す
 * (章1〜5のタイルや ゼロム城には 影響しない)。
 */
export function negariaStageArtKey(art: string, stage: 0 | 1 | 2 | 3): string {
  if (stage === 0 || !isNegariaStagedArt(art)) return art;
  return `${art}@${stage}`;
}

/* 終章「ムゲンのらせん」の色ちがいタイル (KQ-30b)。元タイルの rows を参照するので最後に足す */
Object.assign(TILE_ART, spiralTiles(TILE_ART));
