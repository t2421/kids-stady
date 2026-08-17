/*
 * 第4章「氷の国メジャーリア」のタイル。雪原・こおりの洞くつ・角度の遺跡と、
 * ワールドマップの拠点アイコン。
 */
import type { PixelArt } from "./format";

const SNOW_PALETTE = { s: "#e8eef5", S: "#ffffff", d: "#c3d0de", l: "#f6fbff" };
const ICE_PALETTE = {
  k: "#2b4560",
  d: "#3f6488",
  s: "#5e8cb5",
  S: "#8fc0e0",
  l: "#cbe8f7",
};

export const ICE_TILES: Record<string, PixelArt> = {
  snow: {
    palette: SNOW_PALETTE,
    rows: [
      "ssssSsssssssssds", "ssdsssssssssslss", "slssssssSsssssss", "ssssssdsssssssss",
      "Sssssssssdsssssl", "ssssssssssssdsss", "sssdsssSssssssss", "ssssslssssssssds",
      "ssSsssssssssssss", "sdssssssssslssss", "sssssssdssssssSs", "ssssssssssdsssss",
      "sslssssssssssdss", "Sssssdssssssssls", "ssssssssSsssssss", "sssdssssssssssss",
    ],
  },
  /* 雪のゆらぎ (ふきだまり) */
  snow2: {
    palette: SNOW_PALETTE,
    rows: [
      "ssssssssssssssss", "sSsssssssssdddss", "sssdddsssdlllldd", "ssdlllldsSSSSSSl",
      "sSSSSSSlsssssSSs", "sssssSSsssssssss", "ssssssssssssssss", "ssdddsssssssdddd",
      "sdllllddssssdlll", "SSSSSSSlsssdlSSS", "sssssSSSssslSSss", "ssssssssssssssss",
      "sssssssdddssssss", "ssssssdlllddsssd", "sssssSSSSSlddSSl", "sssssssSSSSSSSss",
    ],
  },
  /* こおりの床 (歩ける・つるつる光る) */
  iceFloor: {
    palette: ICE_PALETTE,
    rows: [
      "SSSSSSSSSSSSSSSS", "SlSSSSSSSSSSlSSS", "SSSSSSlSSSSSSSSS", "SSSSSSSSSSSSSSsS",
      "SsSSSSSSSlSSSSSS", "SSSSSSSSSSSSSSSS", "SSlSSSSSSSSSsSSS", "SSSSSSSSlSSSSSSS",
      "SSSSSsSSSSSSSSSS", "SlSSSSSSSSSlSSSS", "SSSSSSSSSSSSSSSS", "SSSSlSSSSsSSSSlS",
      "SSSSSSSSSSSSSSSS", "SsSSSSSlSSSSSSSS", "SSSSSSSSSSSlSSSS", "SSSSSSSSSSSSSSSS",
    ],
  },
  iceFloor2: {
    palette: ICE_PALETTE,
    rows: [
      "SSSSSSSSSSSSSSSS", "SSSSsSSSSSSSSSSS", "SSSSSSSSSSlSSSSS", "SlSSSSSSSSSSSSSS",
      "SSSSSSSsSSSSSSlS", "SSSlSSSSSSSSSSSS", "SSSSSSSSSSSSsSSS", "SsSSSSSSSSSSSSSS",
      "SSSSSSSlSSSSSSSS", "SSSSSSSSSSSSSSSS", "SSlSSSSSSSsSSSSS", "SSSSSSSSSSSSSSSS",
      "SSSSSsSSSSSSSlSS", "SSSSSSSSSSSSSSSS", "SlSSSSSSlSSSSSSS", "SSSSSSSSSSSSSSSS",
    ],
  },
  /* こおりの壁 (通行不能) */
  iceWall: {
    palette: ICE_PALETTE,
    rows: [
      "kkkkkkkkkkkkkkkk", "kSSSSSSkkSSSSSSk", "kSllSSSkkSSSlSSk", "kSSSSSSkkSSSSSSk",
      "kkkddkkkkkkddkkk", "dddkSSSSSSkkSSSS", "SSdkSlSSSSkkSlSS", "SSdkSSSSSSkkSSSS",
      "kkkkkkkkkkkkkkkk", "kSSSSSSkkSSSSSSk", "kSSSlSSkkSllSSSk", "kSSSSSSkkSSSSSSk",
      "kkddkkkkkkddkkkk", "SSkSSSSSSkkSSSSS", "lSkSSSlSSkkSSlSS", "SSkSSSSSSkkSSSSS",
    ],
  },
  /* こおりの木 (通行不能) */
  frozenTree: {
    palette: { ...SNOW_PALETTE, k: "#1f3a2c", g: "#2e6b4a", G: "#48916a", t: "#5a4630", i: "#a8d8ee" },
    rows: [
      "ssssssskksssssss", "ssssskkGGkksssss", "sssskgGGGGgkssss", "ssskgGGiGGgkssss",
      "sskgGGGGGGGgksss", "sssskgGGGGgkssss", "ssskgGGiGGgkssss", "sskgGGGGGGGgksss",
      "skgGGGGGGGGGgkss", "ssskkgGGGgkkssss", "sssssskttkssssss", "sssssskttkssssss",
      "sssssskttkssssss", "sssssskttkssssss", "sssssktttkssssss", "ssssssssssssssss",
    ],
  },
  /* つらら岩 (通行不能) */
  icePillar: {
    palette: { ...SNOW_PALETTE, k: "#2b4560", i: "#6ea8cf", I: "#a8d8ee", w: "#e8f8ff" },
    rows: [
      "ssssssssssssssss", "ssssskkkkkssssss", "ssskkIIIIkksssss", "sskIIwwIIIIksdss",
      "skIIwwIIIIIIkkss", "skIIwIIIIIIIIkss", "kIIwIIIIIIIIIIks", "kIwIIIIIIIIIIIks",
      "kIIIIIIIIIIIIIks", "skIIIIIIIIIIIkss", "skIIIiIIIiIIIkss", "sskIIIiIIIiIkkss",
      "ssskIIIiIIIkksss", "ssskkIIIiIkksdss", "ssssskkIIkksssss", "sssssskkkkssssss",
    ],
  },
  /* ---- ワールドマップの拠点アイコン ---- */
  /* 計測の都メジャーリア (ものさしの塔がある城) */
  locMeasureCity: {
    palette: { ...SNOW_PALETTE, k: "#31384a", w: "#dfe6ee", W: "#a9b4c4", b: "#3d6fb0", y: "#f2d675", r: "#b84529" },
    rows: [
      "ssssssssssssssss", "sssyssssssysssss", "ssskssssssksssss", "sskWkkkkkkkWksss",
      "skWWWWWWWWWWWWks", "kWWbWWWbWWWbWWWk", "kWWWWWWWWWWWWWWk", "kWyWyWyWyWyWyWWk",
      "kWWWWWWWWWWWWWWk", "kWWbWWWbWWWbWWWk", "kWWWWWWWWWWWWWWk", "kWWWWkrrkWWWWWWk",
      "kWWWWkrrkWWWWWWk", "kkkkkkrrkkkkkkkk", "ssssssssssssssss", "ssssssssssssssss",
    ],
  },
  /* 雪村コゴエ */
  locSnowVillage: {
    palette: { ...SNOW_PALETTE, k: "#31384a", r: "#8a4030", R: "#b05a3c", w: "#f2eee1", y: "#f2d675" },
    rows: [
      "ssssssssssssssss", "ssssssssssssssss", "sssssssyksssssss", "sskkkssskkkkksss",
      "skRRRkskRRRRRkss", "kRRRRRkRRRRRRRks", "kRRRRRkRRRRRRRks", "kwwwwwkwwwwwwwks",
      "kwyywwkwwyywwwks", "kwwwwwkwwwwwwwks", "kkkkkkkkkkkkkkks", "ssssssssssssssss",
      "ssssssssssssssss", "ssssssssssssssss", "ssssssssssssssss", "ssssssssssssssss",
    ],
  },
  /* 氷の洞くつの入口 */
  locIceCave: {
    palette: { ...SNOW_PALETTE, k: "#22384f", i: "#5e8cb5", I: "#8fc0e0", w: "#cbe8f7" },
    rows: [
      "ssssssssssssssss", "ssssskkkkkksssss", "ssskkIIIIIIkksss", "sskIIwIIIIwIIkss",
      "skIIIIIIIIIIIIks", "kIIIIIIIIIIIIIIk", "kIIIkkkkkkkIIIIk", "kIIkkkkkkkkkIIIk",
      "kIIkkkkkkkkkIIIk", "kIIkkkkkkkkkIIIk", "kIIkkkkkkkkkIIIk", "kIIkkkkkkkkkIIIk",
      "kIikkkkkkkkkiIIk", "kkkkkkkkkkkkkkkk", "ssssssssssssssss", "ssssssssssssssss",
    ],
  },
  /* 角度の遺跡 (分度器の門) */
  locAngleRuins: {
    palette: { ...SNOW_PALETTE, k: "#3a3f52", r: "#8f97a8", R: "#c2cad8", y: "#f2d675" },
    rows: [
      "ssssssssssssssss", "ssssskkkkkksssss", "sskkRRRRRRRRkkss", "skRRRRRRRRRRRRks",
      "kRRRRkkkkkkRRRRk", "kRRkksssssskkRRk", "kRRksssyssssskRk", "kRRkssyssssssRRk",
      "kRRksyssssssskRk", "kRRkyssssssssRRk", "kRRkkssssssskkRk", "kRRRRkkkkkkRRRRk",
      "kkRRRRRRRRRRRRkk", "sskkRRRRRRRRkkss", "ssssskkkkkksssss", "ssssssssssssssss",
    ],
  },
};
