/*
 * ワールドマップ (縮尺の大きい全体マップ) 専用タイル。
 * 村・城・森の入口・洞くつはドラクエ式に「1タイルのアイコン」で表し、
 * 踏むと該当マップへシーン遷移する。tiles.ts で TILE_ART に統合される。
 */
import type { PixelArt } from "./format";

export const WORLD_TILES: Record<string, PixelArt> = {
  /* 山脈 — 北と南の地方を隔てる通行不能タイル */
  mountain: {
    palette: {
      g: "#398447", k: "#241d26", r: "#6e5d51", R: "#8a776a",
      d: "#4e423b", s: "#eef1ea",
    },
    rows: [
      "ggggggggkkgggggg",
      "gggggggksskggggg",
      "ggggggksssskgggg",
      "gggggkRsssRkgggg",
      "ggggkRRsRRRdkggg",
      "gggkRRRRRdRRdkgg",
      "ggkRRrRRRRdRRrkg",
      "ggkRrrRRdRRRrdkg",
      "gkRRrRRRdRRrrdkg",
      "gkRrrRRdRRrrddkg",
      "kRRrrRRdRRrrdddk",
      "kRrrddRRdRrrdddk",
      "krrdddRrdrrddddk",
      "gkkddddddddddkkg",
      "gggggggggggggggg",
      "gggggggggggggggg",
    ],
  },
  /* 川にかかる木の橋 (東西方向)。番人が立つ関所でもある */
  bridge: {
    palette: {
      b: "#2364a7", B: "#2f7bc2", k: "#3a2417", t: "#9a6335", T: "#bd8047",
    },
    rows: [
      "bbbBBBbbbbbbbBBB",
      "kkkkkkkkkkkkkkkk",
      "TTTkTTTkTTTkTTTk",
      "TtTkTTtkTtTkTTtk",
      "TTTkTtTkTTTkTtTk",
      "tTTkTTTktTTkTTTk",
      "TTtkTTTkTTtkTTTk",
      "TTTkTtTkTTTkTtTk",
      "tTTkTTTktTTkTTTk",
      "TTTkTTtkTTTkTTtk",
      "TtTkTTTkTtTkTTTk",
      "TTTkTtTkTTTkTtTk",
      "TTtkTTTkTTtkTTTk",
      "tTTkTTtktTTkTTtk",
      "kkkkkkkkkkkkkkkk",
      "bbbBBBbbbbbbbBBB",
    ],
  },
  /* 村アイコン — 赤屋根の家が2軒。踏むと村マップへ */
  locVillage: {
    palette: {
      g: "#398447", k: "#26150f", r: "#b84529", R: "#d75b38",
      w: "#e8d9b0", W: "#c9b68c", d: "#1e6032", G: "#338244",
    },
    rows: [
      "gggggggggggggggg",
      "gggggggggggggggg",
      "ggkkkkkggggggggg",
      "gkRRRRRkgggggggg",
      "gkrRRRrkgggggggg",
      "gkrrrrrkgkkkkkkg",
      "gkwwWwwkgkRRRRkg",
      "gkwWwWwkgkrrrrkg",
      "gkwwkwwkgkwWwwkg",
      "gkwwkwwkgkwwkwkg",
      "gkkkkkkkgkwwkwkg",
      "ggggggggkkkkkkgg",
      "ggdGGdgggggggggg",
      "gggggggggggggggg",
      "gggggggggggggggg",
      "gggggggggggggggg",
    ],
  },
  /* 王都アイコン — 白い城と赤い旗。踏むと王都マップへ */
  locCastle: {
    palette: {
      g: "#398447", k: "#3f4249", s: "#989ea8", S: "#d3d6da",
      d: "#747982", r: "#d75b38", y: "#f5c84b",
    },
    rows: [
      "gkrrggggggggkrrg",
      "gkggggggggggkggg",
      "kSkSkggggggkSkSk",
      "kSSSkggggggkSSSk",
      "kSdSkkkkkkkkSdSk",
      "kSSSSSSSSSSSSSSk",
      "kSdSSdSSdSSdSdSk",
      "kSSSSSSSSSSSSSSk",
      "kSdSSkkkkkkSSdSk",
      "kSSSSkkkkkkSSSSk",
      "kSdSSkykkykSSdSk",
      "kSSSSkkkkkkSSSSk",
      "kkkkkkkkkkkkkkkk",
      "gggggsggggsggggg",
      "gggggggggggggggg",
      "gggggggggggggggg",
    ],
  },
  /* 森の入口 — 深い木立にぽっかり空いた通り道。踏むと森マップへ */
  forestMouth: {
    palette: {
      g: "#398447", k: "#142d20", d: "#1e6032", G: "#338244",
      l: "#62ad54", b: "#08130c",
    },
    rows: [
      "kddGkkdGGkkdGkkd",
      "dGGdkdGGGdkdGGdk",
      "kdGGGkdGlGdkGGdk",
      "dkGlGdkGGGkdGGkd",
      "kdGGdkdGGdkdGlGk",
      "dGGkdkbbbbkdkGGd",
      "kdGdkbbbbbbkdGdk",
      "dGGdkbbbbbbkdGGk",
      "kdGdkbbbbbbkdGdk",
      "dGGdkbbbbbbkdGGk",
      "kdGdkbbbbbbkdGdk",
      "ddGdkbbbbbbkdGdd",
      "kkdkkbbbbbbkkdkk",
      "gggkbbbbbbbbkggg",
      "ggggkbbbbbbkgggg",
      "gggggggggggggggg",
    ],
  },
  /* 洞くつの入口 — 岩肌に黒い穴。踏むと洞くつマップへ */
  caveMouth: {
    palette: {
      g: "#398447", k: "#241d26", r: "#6e5d51", R: "#8a776a",
      d: "#4e423b", b: "#0d0812",
    },
    rows: [
      "gggggkkkkkkggggg",
      "ggggkRRRRRRkgggg",
      "gggkRRrRRrRRkggg",
      "ggkRRrRRRRrRRkgg",
      "gkRrRRkkkkRRrRkg",
      "gkRRRkbbbbkRRRkg",
      "kRrRRkbbbbkRRrRk",
      "kRRrkbbbbbbkrRRk",
      "kRrRkbbbbbbkRrRk",
      "kdrRkbbbbbbkRrdk",
      "kddrkbbbbbbkrddk",
      "kkdkkbbbbbbkkdkk",
      "gkkkbbbbbbbbkkkg",
      "ggggbbbbbbbbgggg",
      "gggggggggggggggg",
      "gggggggggggggggg",
    ],
  },
};
