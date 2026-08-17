/*
 * 第3章「砂の国ワケーラ」のタイル。砂漠のフィールド・オアシス・
 * ピラミッド内部 (砂岩) と、ワールドマップの拠点アイコン。
 */
import type { PixelArt } from "./format";

const SAND_PALETTE = { s: "#e0bd79", S: "#eed69f", d: "#c8a45f", l: "#f7e9c2" };
/* 壁は くらく、床は あかるく (歩ける ところが ひと目で わかるように) */
const STONE_WALL_PALETTE = {
  k: "#3f2d18",
  d: "#5c4426",
  s: "#7a5c33",
  S: "#8f6c3c",
  l: "#a8834c",
};
const STONE_PALETTE = {
  k: "#8a6a3f",
  d: "#b08a53",
  s: "#d2ae74",
  S: "#e6c68c",
  l: "#f7e2b0",
};

export const DESERT_TILES: Record<string, PixelArt> = {
  sand: {
    palette: SAND_PALETTE,
    rows: [
      "ssssSsssssssssds", "ssdsssssssssslss", "slssssssSsssssss", "ssssssdsssssssss",
      "Sssssssssdsssssl", "ssssssssssssdsss", "sssdsssSssssssss", "ssssslssssssssds",
      "ssSsssssssssssss", "sdssssssssslssss", "sssssssdssssssSs", "ssssssssssdsssss",
      "sslssssssssssdss", "Sssssdssssssssls", "ssssssssSsssssss", "sssdssssssssssss",
    ],
  },
  /* 砂のゆらぎ (風紋まじり) */
  sand2: {
    palette: SAND_PALETTE,
    rows: [
      "ssssssssssssssss", "sSssssdsssssssss", "ssssdddsssssssls", "sssssssssdddssss",
      "sslsssssssssssss", "ssssssssSsssssds", "sdddsssssssssSss", "ssssssssssdddsss",
      "ssssssSsssssssss", "sssssssssslsssss", "sdssssdddsssssss", "ssssssssssssssds",
      "ssssSssssssssdds", "sslsssssssssssss", "sssssdddssSsssss", "ssssssssssssssss",
    ],
  },
  /* 砂丘 (歩けるが足をとられる = エンカウント地帯) */
  sandDune: {
    palette: SAND_PALETTE,
    rows: [
      "ssssssssssssssss", "sssdddddssssssss", "ssdlllllddsssssd", "sdlSSSSSlldsssdl",
      "slSSSSSSSSlddldS", "sSSSsssSSSSllSSS", "ssssssssSSSSSSSs", "ssssssssssssssss",
      "ssssssssssssssss", "sssssssdddddssss", "sdddsssdlllldsss", "dlllddslSSSSlssd",
      "lSSSlldSSSSSSldl", "SSSSSSlsssSSSSlS", "sssSSSSssssssSSs", "ssssssssssssssss",
    ],
  },
  /* サボテン (通行不能) */
  cactus: {
    palette: { ...SAND_PALETTE, k: "#1d3a22", g: "#3f8a4a", G: "#57a95c" },
    rows: [
      "ssssssssssssssss", "sssssssskgGkssss", "sssssssskgGkssss", "sskgkssskgGkssss",
      "sskgkssskgGkkgks", "sskggggGGgggggks", "sskgkssskgGkskgk", "sskgkssskgGkskgk",
      "sskkkssskgGkskgk", "sssssssskgGkkgks", "sssssssskgGkkkks", "sssssssskgGkssss",
      "sssssssskgGkssss", "sssssssskgGkssss", "ssssssskgGGgksss", "ssssssskkkkkksss",
    ],
  },
  /* ヤシの木 (通行不能) */
  palm: {
    palette: {
      ...SAND_PALETTE,
      k: "#1c3320",
      g: "#3d8a48",
      G: "#5cb063",
      t: "#7a5230",
      T: "#a37040",
      y: "#e2c14e",
    },
    rows: [
      "ssssssssssssssss", "ssskgGkkkkGgksss", "sskgGGgkkgGGgkss", "skgGgggkkgggGgks",
      "skggkskyykskggks", "sskkssskTkssskks", "ssssssskTkssssss", "sssssssktkssssss",
      "ssssssskTkssssss", "sssssssktkssssss", "ssssssskTkssssss", "sssssssktkssssss",
      "ssssssskTkssssss", "ssssssktTtksssss", "sssssktTTtksssss", "sssssktTTtksssss",
    ],
  },
  /* 砂漠の岩 (通行不能) */
  sandRock: {
    palette: { ...SAND_PALETTE, k: "#5b452a", r: "#8a6b42", R: "#a98455", w: "#c9a976" },
    rows: [
      "ssssssssssssssss", "ssssssskkkksssss", "ssssskkRRRRkssss", "ssskkRRwwRRRkkss",
      "sskRRRwwRRRRRRks", "skRRRRRRRRRwwRks", "skRrRRRRRRwwRRks", "kRRrrRRRwRRRRRRk",
      "kRrrRRRRwwRRRrRk", "kRRRRRwwRRRRrrRk", "kRRRRwwRRRRRrRRk", "kRrRRRRRRRRRRRRk",
      "skRRRRRrRRRRRRks", "sskRRRRrrRRRRkss", "sssskkkkkkkkksss", "ssssssssssssssss",
    ],
  },
  /* ---- ワールドマップの拠点アイコン ---- */
  /* オアシス都市ワケーラ */
  locOasis: {
    palette: {
      ...SAND_PALETTE,
      k: "#1c3320",
      g: "#3d8a48",
      G: "#5cb063",
      t: "#7a5230",
      b: "#2f7bc2",
      B: "#79bce7",
      w: "#f2eee1",
      r: "#b84529",
    },
    rows: [
      "ssssssssssssssss", "sskggksssskggkss", "skgGGgksskgGGgks", "sssktksssssktkss",
      "sssktksssssktkss", "ssrrrrrrrrrrrrss", "srwwwwrrrwwwwwrs", "srwwwwwrrwwwwwrs",
      "srrrrrrrrrrrrrrs", "ssbBBbbbbbbBBbss", "sbBBBBbbbbBBBBbs", "sbbBBbbbbbbBBbbs",
      "ssbbbbbbbbbbbbss", "sssbbbbbbbbbbsss", "ssssssbbbbssssss", "ssssssssssssssss",
    ],
  },
  /* わけまえのピラミッド */
  locPyramid: {
    palette: {
      ...SAND_PALETTE,
      k: "#6d5230",
      d: "#8f6f43",
      R: "#c9a468",
      l: "#e0bf88",
      y: "#f2d675",
    },
    rows: [
      "ssssssssssssssss", "ssssssskksssssss", "sssssskyRkssssss", "sssssklRRRksssss",
      "ssssklRRRRRkssss", "sssklRRRRRRRksss", "ssklRRRRRRRRRkss", "sklRRRRRRRRRRRks",
      "klRRRRRRRRRRRRRk", "kdRRRRkkkkRRRRdk", "kdRRRkddddkRRRdk", "kdRRkddddddkRRdk",
      "kdRRkddddddkRRdk", "kddkddddddddkddk", "kkkkkkkkkkkkkkkk", "ssssssssssssssss",
    ],
  },
  /* 大灯りの遺跡 (くずれた柱) */
  locRuins: {
    palette: {
      ...SAND_PALETTE,
      k: "#5b4a35",
      d: "#7d6a4d",
      r: "#9c8a68",
      R: "#bcaa86",
      y: "#f6d777",
      o: "#e8912f",
    },
    rows: [
      "ssssssssssssssss", "ssssssssyyssssss", "sssssssyoyysssss", "sskkkssyoyysskks",
      "skRRRkssyyssskRk", "skRrRksssssskRRk", "skRRRkkkkkkkRRRk", "skRrRRRRRRRRRrRk",
      "skRRRkkkkkkkRRRk", "skRrRkssssskRrRk", "skRRRksssssskRRk", "skRrRksssssskRRk",
      "skRRRkssssssskRk", "kkRrRkkssssskkkk", "kdddddkssssskddk", "ssssssssssssssss",
    ],
  },
  /* 隊商の宿場 (テント) */
  locCamp: {
    palette: {
      ...SAND_PALETTE,
      k: "#4a2f1c",
      t: "#8a5a30",
      T: "#b57a42",
      w: "#f2eee1",
      r: "#b84529",
      y: "#f2d675",
    },
    rows: [
      "ssssssssssssssss", "ssssssssykssssss", "ssssssskykssssss", "ssssssskTkssssss",
      "ssssskTTTkssssss", "sssskTTTTTksssss", "ssskTTTwwTTkssss", "sskTTTwwwwTTksss",
      "skTTrrwwwwrrTTks", "kTTTrrwwwwrrTTTk", "kTTTrrwwwwrrTTTk", "kTTTrrwwwwrrTTTk",
      "kkkkkkkkkkkkkkkk", "ssssssssssssssss", "ssssssssssssssss", "ssssssssssssssss",
    ],
  },
  /* ---- ピラミッド内部 ---- */
  /* 砂岩の壁 (ヒエログリフつき) */
  sandWall: {
    palette: STONE_WALL_PALETTE,
    rows: [
      "kkkkkkkkkkkkkkkk", "kSSSSSSSkSSSSSSS", "kSlSSdSSkSSdSlSS", "kSSSSSSSkSSSSSSS",
      "kkkkkkkkkkkkkkkk", "SSSkSSSSSSSkSSSS", "SdSkSSlSSSSkSdSS", "SSSkSSSSSSSkSSSS",
      "kkkkkkkkkkkkkkkk", "kSSSSSSSkSSSSSSS", "kSSdSlSSkSlSSdSS", "kSSSSSSSkSSSSSSS",
      "kkkkkkkkkkkkkkkk", "SSSSkSSSSSSSkSSS", "SlSSkSSdSSSSkSlS", "SSSSkSSSSSSSkSSS",
    ],
  },
  /* 砂岩の床 */
  sandFloor: {
    palette: STONE_PALETTE,
    rows: [
      "kkkkkkkkkkkkkkkk", "kSSSSSSSSSSSSSSk", "kSlSSSSSSSSSSSSk", "kSSSSSSdSSSSSSSk",
      "kSSSSSSSSSSSlSSk", "kSSSdSSSSSSSSSSk", "kSSSSSSSSSSSSSSk", "kkkkkkkkkkkkkkkk",
      "SSSSSSSkSSSSSSSS", "SSSlSSSkSSSSSSSS", "SSSSSSSkSSdSSSSS", "SSSSSSSkSSSSSSSS",
      "SSdSSSSkSSSSSlSS", "SSSSSSSkSSSSSSSS", "SSSSSSSkSSSSSSSS", "kkkkkkkkkkkkkkkk",
    ],
  },
  sandFloor2: {
    palette: STONE_PALETTE,
    rows: [
      "kkkkkkkkkkkkkkkk", "kSSSSSSSSSSSSSSk", "kSSSSSdSSSSSSSSk", "kSSSSSSSSSlSSSSk",
      "kSdSSSSSSSSSSSSk", "kSSSSSSSSSSSSdSk", "kSSSlSSSSSSSSSSk", "kkkkkkkkkkkkkkkk",
      "SSSSSSSkSSSSSSSS", "SSSSSdSkSSSSlSSS", "SSSSSSSkSSSSSSSS", "SlSSSSSkSSSSSSSS",
      "SSSSSSSkSSdSSSSS", "SSSSSSSkSSSSSSSS", "SSSSSSSkSSSSSSSS", "kkkkkkkkkkkkkkkk",
    ],
  },
  /* かがり火 (通行不能・遺跡の灯り) */
  brazier: {
    palette: { ...STONE_PALETTE, y: "#ffe98a", o: "#f7a63a", r: "#e05a2a" },
    rows: [
      "SSSSSSSSSSSSSSSS", "SSSSSSSrSSSSSSSS", "SSSSSSrorSSSSSSS", "SSSSSroyorSSSSSS",
      "SSSSroyyyorSSSSS", "SSSSroyyyyoSSSSS", "SSSSSroyyorSSSSS", "SSSSSSrooSSSSSSS",
      "SSSSkkkkkkkkSSSS", "SSSkddddddddkSSS", "SSSkdlSSSSldkSSS", "SSSSkddddddkSSSS",
      "SSSSSkddddkSSSSS", "SSSSkkddddkkSSSS", "SSSkdddddddkSSSS", "SSSkkkkkkkkkSSSS",
    ],
  },
};
