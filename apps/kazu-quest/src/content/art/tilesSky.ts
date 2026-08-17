/*
 * 第5章「割合の都パーセン」のタイル。空中庭園の雲・海底神殿のサンゴと、
 * ワールドマップの拠点アイコン。石壁などの色ちがいは tiles.ts でまとめて作る。
 */
import type { PixelArt } from "./format";

const CLOUD_PALETTE = { w: "#f4f8ff", W: "#d7e2f2", l: "#ffffff", b: "#a9c2e0" };

export const SKY_TILES: Record<string, PixelArt> = {
  /* 雲の床 (空中庭園を歩ける) */
  cloudFloor: {
    palette: CLOUD_PALETTE,
    rows: [
      "wwwwwwwwwwwwwwww", "wWwwwwwwwwwwwWww", "wwwwwwWwwwwwwwww", "wwwwwwwwwwwwwwlw",
      "wlwwwwwwwWwwwwww", "wwwwwwwwwwwwwwww", "wwWwwwwwwwwwlwww", "wwwwwwwwWwwwwwww",
      "wwwwwlwwwwwwwwww", "wWwwwwwwwwwWwwww", "wwwwwwwwwwwwwwww", "wwwwlwwwwwWwwwlw",
      "wwwwwwwwwwwwwwww", "wWwwwwwlwwwwwwww", "wwwwwwwwwwwlwwww", "wwwwwwwwwwwwwwww",
    ],
  },
  cloudFloor2: {
    palette: CLOUD_PALETTE,
    rows: [
      "wwwwwwwwwwwwwwww", "wwwwbbwwwwwwwwww", "wwwbllbwwwwbbwww", "wwbllllbwwbllbww",
      "wblllllbwbllllbw", "wwbllllbwwbllbww", "wwwbllbwwwwbbwww", "wwwwbbwwwwwwwwww",
      "wwwwwwwwwwwwwwww", "wwwwwwwwbbwwwwww", "wwbbwwwbllbwwwww", "wbllbwbllllbwwww",
      "wbllbwblllllbwww", "wwbbwwwbllllbwww", "wwwwwwwwbllbwwww", "wwwwwwwwwbbwwwww",
    ],
  },
  /* 空のふち (落ちるので通行不能) */
  skyEdge: {
    palette: { b: "#2b3f6b", B: "#3d5891", d: "#1d2c4d", w: "#c9d8f2", y: "#f2e28a" },
    rows: [
      "bbbbbbbbbbbbbbbb", "bBbbbbbdbbbbbybb", "bbbbbbbbbbbbbbbb", "bbdbbbbbbbwbbbbb",
      "bbbbbbybbbbbbbbb", "bbbbbbbbbbdbbbbb", "bybbbbbbbbbbbbBb", "bbbbbdbbbbbbbbbb",
      "bbbbbbbbbwbbbbbb", "bbBbbbbbbbbbdbbb", "bbbbbbbbbbbbbbbb", "bbbbybbbdbbbbbbb",
      "bbbbbbbbbbbbbybb", "bdbbbbbbbbbbbbbb", "bbbbbbbwbbbbbbbb", "bbbbbbbbbbbbdbbb",
    ],
  },
  /*
   * サンゴ (海底神殿・通行不能)。b は しんでんの床と おなじ色 —
   * タイルは 不透明で描かれるため、背景を ぬっておかないと 黒く ぬけて見える。
   */
  coral: {
    palette: {
      k: "#3a1f3a",
      r: "#c4527f",
      R: "#e87ba3",
      y: "#f2c46b",
      w: "#ffd9e8",
      b: "#96d6da",
    },
    rows: [
      "bbbbbbbbbbbbbbbb", "bbbbbbkkbbbkkbbb", "bbbbbkRRkbkRRkbb", "bbkkbkRwRkkRwRkb",
      "bkRRkkRRRRRRRRkb", "kRwRRkRRkkRRRkbb", "kRRRRRRkbkRRkbbb", "bkRRkRRkbbkRkbbb",
      "bbkRRRRkbbkRkbbb", "bbkRRRRkkkRRkbbb", "bbbkRRRRRRRRkbbb", "bbbkyRRRRRRykbbb",
      "bbbbkyRRRRykbbbb", "bbbbkkyRRykkbbbb", "bbbbbkkyykkbbbbb", "bbbbbbkkkkbbbbbb",
    ],
  },
  /* ---- ワールドマップの拠点アイコン ---- */
  /* 割合の都パーセン (% のもんしょうの城下町) */
  locPercentCity: {
    palette: { g: "#398447", k: "#2b2f3d", w: "#e8ecf2", W: "#b3bcca", y: "#f2d675", r: "#b84529", b: "#3d6fb0" },
    rows: [
      "gggggggggggggggg", "ggygggggggggyggg", "ggkgggggggggkggg", "gkWkkkkkkkkkWkgg",
      "kWWWWWWWWWWWWWkg", "kWwwWWWwwWWWwwWk", "kWWWWWWWWWWWWWWk", "kWwyWWkyykWWywWk",
      "kWWWWWkyykWWWWWk", "kWwwWWWWWWWWwwWk", "kWWWWWWWWWWWWWWk", "kWWbWWWrrWWWbWWk",
      "kWWWWWWWrrWWWWWk", "kkkkkkkkrrkkkkkk", "gggggggggggggggg", "gggggggggggggggg",
    ],
  },
  /* バーゲンの町 (ねふだの かんばん) */
  locBargainTown: {
    palette: { g: "#398447", k: "#3a2a1c", r: "#b84529", R: "#d75b38", w: "#f2eee1", y: "#f2d675" },
    rows: [
      "gggggggggggggggg", "gggggggykggggggg", "ggggkkkkkkkkkggg", "gggkRRRRRRRRRkgg",
      "ggkRRRRRRRRRRRkg", "ggkwwwwwwwwwwwkg", "ggkwyykwwkyywwkg", "ggkwwwkwwkwwwwkg",
      "ggkkkkkkkkkkkkkg", "gggkwwwkkwwwkggg", "gggkwyykkwywkggg", "gggkwwwkkwwwkggg",
      "gggkkkkkkkkkkggg", "gggggggggggggggg", "gggggggggggggggg", "gggggggggggggggg",
    ],
  },
  /* 空中庭園 (雲の上の木) */
  locSkyGarden: {
    palette: { g: "#398447", k: "#1f4a30", G: "#4fa85a", t: "#7a5230", w: "#f4f8ff", W: "#d7e2f2", b: "#a9c2e0" },
    rows: [
      "gggggggggggggggg", "gggggggkkggggggg", "ggggggkGGkgggggg", "gggggkGGGGkggggg",
      "ggggkGGGGGGkgggg", "gggkGGGGGGGGkggg", "ggggkGGGGGGkgggg", "gggggkkttkkggggg",
      "gggggggttggggggg", "gggwwwwwwwwwwggg", "ggwwWwwwwwWwwwgg", "gwwwwwwwwwwwwwwg",
      "gwWwwwwwwwwwWwwg", "ggbwwwwwwwwwwbgg", "gggbbwwwwwwbbggg", "gggggbbbbbbggggg",
    ],
  },
  /* 海底神殿 (なみの下の しんでん) */
  locSeaTemple: {
    palette: { b: "#2364a7", B: "#2f7bc2", w: "#79bce7", k: "#1a3a52", s: "#7fa8c4", S: "#b8d4e4", y: "#f2d675" },
    rows: [
      "bbbbbbbbbbbbbbbb", "bwwbbbwwbbbwwbbb", "bbbbwwbbbwwbbbwb", "bbbbbbbbbbbbbbbb",
      "bbbbkkkkkkkkbbbb", "bbbkSSSSSSSSkbbb", "bbkSSSSSSSSSSkbb", "bkSSkSSyySSkSSkb",
      "bkSSkSSSSSSkSSkb", "bkSSkSSSSSSkSSkb", "bkSSkSSSSSSkSSkb", "bkSSkSSSSSSkSSkb",
      "bkSSkSSSSSSkSSkb", "bkkkkkkkkkkkkkkb", "bbbbbbbbbbbbbbbb", "bbbbbbbbbbbbbbbb",
    ],
  },
  /* マイナドス城 (くろい とげの城) */
  locDarkCastle: {
    palette: { g: "#398447", k: "#14101c", d: "#2a2338", s: "#453a5c", S: "#6b5c8a", r: "#8f2f3f", y: "#f2d675" },
    rows: [
      "gggggggggggggggg", "gkgggkgggkgggkgg", "gkkggkkgkkggkkgg", "gkSkkkSkkSkkkSkg",
      "kSSSSSSSSSSSSSSk", "kSrSSSSrrSSSSrSk", "kSSSSSSSSSSSSSSk", "kSSdSSSyySSSdSSk",
      "kSSSSSSyySSSSSSk", "kSrSSSSSSSSSSrSk", "kSSSSSSSSSSSSSSk", "kSSSSSkrrkSSSSSk",
      "kSSSSSkrrkSSSSSk", "kkkkkkkrrkkkkkkk", "gggggggggggggggg", "gggggggggggggggg",
    ],
  },
};
