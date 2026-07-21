/*
 * モンスターのドット絵 (16x16、戦闘画面では拡大表示)。
 * テーマは「ケシケシ軍団」— 数を消す文房具の魔物 (スライム形は使わない)。
 * テクスチャ名は "monster-" + キー。
 */

import type { PixelArt } from "./format";

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
    rows: [
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
