/*
 * モンスターのドット絵 (16x16、戦闘画面では拡大表示)。
 * テーマは「ケシケシ軍団」— 数を消す文房具の魔物 (スライム形は使わない)。
 * テクスチャ名は "monster-" + キー。
 */

import type { PixelArt } from "./format";

/* インクぐもの色違い (でかインクぐも用の濃い紫) */
const INK_ROWS = [
  "......ii........",
  ".....iii........",
  "....iiiii.......",
  "...iiiiiii......",
  "..iiIiiiIii.....",
  ".iiiIiiiIiii....",
  ".iiiiiiiiiii....",
  "iiwkiiiiiwki....",
  "iiwwiiiiiwwi....",
  "iiiiiiiiiiiii...",
  ".iiiikkiiiii....",
  ".iiiiiiiiiii....",
  "..iiiiiiiii.....",
  "...iLiiiLi......",
  "..iL..iL..i.....",
  "................",
];

export const MONSTER_ART: Record<string, PixelArt> = {
  /* 消しゴム型マスコット。白いボディに青ケース */
  keshigomun: {
    palette: {
      w: "#f2f0e8", /* 消しゴム本体 */
      W: "#dcd8ca",
      b: "#3a6db5", /* ケース */
      B: "#2a4f85",
      k: "#1a1a1a",
      p: "#ff9db5", /* ほっぺ */
    },
    rows: [
      "................",
      "....wwwwwwww....",
      "...wwwwwwwwww...",
      "..wwwwwwwwwwww..",
      "..wwkwwwwwwkww..",
      "..wwkwwwwwwkww..",
      "..wwwwwwwwwwww..",
      "..wpwwwkkwwwpw..",
      "..wwwwwwwwwwww..",
      "..bbbbbbbbbbbb..",
      ".bbbbbbbbbbbbbb.",
      ".bBbbBbbBbbBbbb.",
      ".bbbbbbbbbbbbbb.",
      ".bBBBBBBBBBBBBb.",
      "..bbbbbbbbbbbb..",
      "................",
    ],
  },
  /* インクのしずく型おばけ */
  inkugumo: {
    palette: {
      i: "#2a2a6b", /* インク */
      I: "#3a3a9b",
      L: "#6b6bd5",
      w: "#ffffff",
      k: "#0a0a2a",
    },
    rows: INK_ROWS,
  },
  /* でかインクぐも (色違い・戦闘ではさらに拡大表示) */
  dekaInkugumo: {
    palette: {
      i: "#4a1a6b",
      I: "#6b2a9b",
      L: "#a56bd5",
      w: "#ffffff",
      k: "#1a0a2a",
    },
    rows: INK_ROWS,
  },
  /* もじばけバット (「?」を抱えたコウモリ) */
  mojibakeBat: {
    palette: {
      b: "#4a3a6b",
      B: "#6b559b",
      w: "#ffffff",
      k: "#1a1a2a",
      y: "#ffd93d",
    },
    rows: [
      "................",
      ".b...........b..",
      ".bb.........bb..",
      ".bbb..bbb..bbb..",
      ".bbbbbBBBbbbbb..",
      "..bbBBBBBBBbb...",
      "...BBBBBBBBB....",
      "...BwkBBBwkB....",
      "...BBBBBBBBB....",
      "...BBByyBBBB....",
      "....BBByBBB.....",
      ".....BByBB......",
      "......ByB.......",
      ".......y........",
      "................",
      "................",
    ],
  },
  /* とげとげイモムシ */
  togeImomushi: {
    palette: {
      g: "#5aa53a",
      G: "#3a7a2a",
      t: "#d9bc82", /* とげ */
      k: "#1a1a1a",
      w: "#ffffff",
      p: "#ff9db5",
    },
    rows: [
      "................",
      "..t..t..t..t....",
      "..GggGggGggG....",
      ".gggggggggggg...",
      ".gGggGggGggGg...",
      ".gggggggggggg...",
      "..GggGggGggGgg..",
      "..ggggggggggggg.",
      "......ggGGggggg.",
      ".....gggggwkggg.",
      ".....gggggwkggg.",
      ".....ggpggggggg.",
      "......ggggggkk..",
      ".......gggg.....",
      "................",
      "................",
    ],
  },
  /* 幹部イレイサー (大きな板消しの魔人) */
  eraser: {
    palette: {
      w: "#f2f0e8",
      W: "#c9c5b5",
      r: "#b5432a", /* 赤いカバー */
      R: "#8a2f1c",
      k: "#1a1a1a",
      y: "#ffd93d",
    },
    rows: [
      "................",
      "..rrrrrrrrrrrr..",
      ".rrrrrrrrrrrrrr.",
      ".rRrrRrrRrrRrrr.",
      ".rrrrrrrrrrrrrr.",
      ".RRRRRRRRRRRRRR.",
      ".wwwwwwwwwwwwww.",
      ".wkkwwwwwwwkkww.",
      ".wkkwwwwwwwkkww.",
      ".wwwwwwwwwwwwww.",
      ".wwwkkkkkkkwwww.",
      ".wwkkWWWWWkkwww.",
      ".wwwwwwwwwwwwww.",
      ".WwWwWwWwWwWwWw.",
      "..wwwwwwwwwwww..",
      "................",
    ],
  },
  /* 数字をぬすむネズミ */
  kazunezumi: {
    palette: {
      g: "#8a8f98", /* 灰色の毛 */
      G: "#6b7078",
      p: "#ffb5c5", /* 耳・しっぽ */
      k: "#1a1a1a",
      w: "#ffffff",
      y: "#ffd93d", /* ぬすんだ数字 */
    },
    rows: [
      "................",
      "..pp......pp....",
      ".pggp....pggp...",
      ".pgggggggggpp...",
      "..gggggggggg....",
      ".ggkggggggkgg...",
      ".gggggggggggg...",
      ".ggggGkkGgggg...",
      "..gggGwwGggg....",
      "...gggggggg.....",
      "..ggggggggggp...",
      ".gggyyggggggp...",
      ".gggyyggggpp....",
      "..ggggggggp.....",
      "...gg..gg.......",
      "................",
    ],
  },
};
