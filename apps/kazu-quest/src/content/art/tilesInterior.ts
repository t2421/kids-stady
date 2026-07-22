/*
 * 建物内部の調度タイル (16x16)。
 * 家: 板壁 W・窓 w・暖炉 h・カウンター n・樽 b・本棚 k
 * 城/ほこら: 石床 S・赤絨毯 r・柱 c・玉座 t・ステンドグラス g・祭壇 a
 */
import type { PixelArt } from "./format";

/* 家の床 (art/tiles.ts の floor) と同系色。床上に置く家具の背景に使う */
const FLOOR_BG = { f: "#b27d4b", F: "#c9955f" };

/* 城の石床と同系色。石の間に置く家具の背景に使う */
const STONE_BG = { F: "#d8d2c8", f: "#c4beb2", A: "#a8a296" };

export const INTERIOR_TILES: Record<string, PixelArt> = {
  /* 横板張りの木壁 (家の内壁) */
  wallWood: {
    palette: { t: "#7a5533", T: "#9a6f45", k: "#402c1c", l: "#b98a58" },
    rows: [
      "kkkkkkkkkkkkkkkk", "TTTTTTTTTTTTTTTT", "tttttttltttttttt", "tttttttttttttttt",
      "kkkkkkkkkkkkkkkk", "TTTTTTTTTTTTTTTT", "ttltttttttttttlt", "tttttttttttttttt",
      "kkkkkkkkkkkkkkkk", "TTTTTTTTTTTTTTTT", "ttttttttttlttttt", "tttttttttttttttt",
      "kkkkkkkkkkkkkkkk", "TTTTTTTTTTTTTTTT", "tttltttttttttttt", "kkkkkkkkkkkkkkkk",
    ],
  },
  /* 木壁 + 外光の入る窓 */
  windowIn: {
    palette: { t: "#7a5533", T: "#9a6f45", k: "#402c1c", b: "#8cc6e8", B: "#bfe3f5" },
    rows: [
      "kkkkkkkkkkkkkkkk", "TTTTTTTTTTTTTTTT", "tttttttttttttttt", "ttkkkkkkkkkkkktt",
      "ttkbbbbkkbbbbktt", "ttkbBBbkkbBBbktt", "ttkbBBbkkbBBbktt", "ttkkkkkkkkkkkktt",
      "ttkbbbbkkbbbbktt", "ttkbBBbkkbBBbktt", "ttkkkkkkkkkkkktt", "ttTTTTTTTTTTTTtt",
      "tttttttttttttttt", "kkkkkkkkkkkkkkkk", "TTTTTTTTTTTTTTTT", "kkkkkkkkkkkkkkkk",
    ],
  },
  /* 石造りの暖炉 (壁の列に置く) */
  fireplace: {
    palette: {
      k: "#2a2a33", s: "#6e6e7a", S: "#8d8d99", n: "#14161c",
      o: "#e8862f", y: "#f7d354", r: "#c23a3a", t: "#6b4a2f",
    },
    rows: [
      "kkkkkkkkkkkkkkkk", "kSSSSSSSSSSSSSSk", "kSsskkkkkkkkssSk", "kSsknnnnnnnnksSk",
      "kSsknnnyynnnksSk", "kSsknnyyyynnksSk", "kSsknyyooyynksSk", "kSsknyooooynksSk",
      "kSskyoorrooyksSk", "kSskoorrrrooksSk", "kSskttttttttksSk", "kSsknttttttnksSk",
      "kSSSSSSSSSSSSSSk", "kkkkkkkkkkkkkkkk", "SSSSSSSSSSSSSSSS", "kkkkkkkkkkkkkkkk",
    ],
  },
  /* 木のカウンター (店・宿の受付) */
  counter: {
    palette: { k: "#402c1c", T: "#b57736", t: "#8b5429", l: "#dc9b4d", d: "#2e1f12" },
    rows: [
      "kkkkkkkkkkkkkkkk", "kllllllllllllllk", "kTTTTTTTTTTTTTTk", "kTTTTTTTTTTTTTTk",
      "kTTTTTTTTTTTTTTk", "kkkkkkkkkkkkkkkk", "kttttttttttttttk", "kttttttttttttttk",
      "kttkttttttttkttk", "kttkttttttttkttk", "kttkttttttttkttk", "kttkttttttttkttk",
      "kttttttttttttttk", "kttttttttttttttk", "kddddddddddddddk", "kkkkkkkkkkkkkkkk",
    ],
  },
  /* 樽 (木の床の部屋に置く) */
  barrel: {
    palette: {
      ...FLOOR_BG, d: "#95683f",
      k: "#402c1c", t: "#8b5429", T: "#b57736", l: "#dc9b4d", s: "#9aa0a8",
    },
    rows: [
      "ffffFfffffffffff", "fffkkkkkkkkkkfff", "ffkTTTTTTTTTTkff", "fksssssssssssskf",
      "fkTtttTTTTtttTkf", "fkTtltTTTTtltTkf", "fksssssssssssskf", "fkTtttTTTTtttTkf",
      "fkTtltTTTTtltTkf", "fkTtttTTTTtttTkf", "fksssssssssssskf", "ffkTTTTTTTTTTkff",
      "fffkkkkkkkkkkfff", "ffddddddddddddff", "ffffffffFfffffff", "fFffffffffffdfff",
    ],
  },
  /* 本棚 (色とりどりの背表紙) */
  bookshelf: {
    palette: {
      k: "#402c1c", t: "#7a5533", T: "#9a6f45", n: "#1c1410",
      r: "#c23a3a", b: "#3f6fc4", e: "#3f9e58", y: "#e8b93c", w: "#f2eee1",
    },
    rows: [
      "kkkkkkkkkkkkkkkk", "kTTTTTTTTTTTTTTk", "ktnnnnnnnnnnnntk", "ktrbbyrewbryretk",
      "ktrbbyrewbryretk", "ktrbbyrewbryretk", "kTTTTTTTTTTTTTTk", "ktnnnnnnnnnnnntk",
      "ktybrwebyrbeywtk", "ktybrwebyrbeywtk", "ktybrwebyrbeywtk", "kTTTTTTTTTTTTTTk",
      "kttttttttttttttk", "kttttttttttttttk", "kkkkkkkkkkkkkkkk", "kkkkkkkkkkkkkkkk",
    ],
  },
  /* 玉座 (金の飾りと赤いクッション) */
  throne: {
    palette: {
      ...STONE_BG,
      k: "#3a2c14", y: "#e8b93c", Y: "#f7e084", R: "#c23a3a", r: "#a02c2c",
    },
    rows: [
      "FFkyYkFFFFkyYkFF", "FFkyykFFFFkyykFF", "FFkyyyyyyyyyykFF", "FFkyRRRRRRRRykFF",
      "FFkyRrrrrrrRykFF", "FFkyRrryyrrRykFF", "FFkyRrryyrrRykFF", "FFkyRrrrrrrRykFF",
      "FFkyRRRRRRRRykFF", "FkyyRrrrrrrRyykF", "FkyRRRRRRRRRRykF", "FkyRRRRRRRRRRykF",
      "FkyykkkkkkkkyykF", "FkyyyyyyyyyyyykF", "FkkkkkkkkkkkkkkF", "FFfFFFFFFFAFFFFF",
    ],
  },
  /* 石柱 (玉座の間・ほこら) */
  column: {
    palette: {
      ...STONE_BG,
      k: "#5c5c66", s: "#9a9aa6", S: "#c2c2cc", l: "#e8e8f0",
    },
    rows: [
      "FkkkkkkkkkkkkkkF", "FkSSSSSSSSSSSSkF", "FFkkkkkkkkkkkkFF", "FFFkSSlSSSSkFFFF",
      "FFFkSSlSSSSkFFFF", "FFFkSSlSSSSkFFFF", "FFFkSSlSSSSkFFFF", "FFFkSSlSSSSkFFFF",
      "FFFkSSlSSSSkFFFF", "FFFkSSlSSSSkFFFF", "FFFkSSlSSSSkFFFF", "FFFkSSlSSSSkFFFF",
      "FFkkkkkkkkkkkkFF", "FkSSSSSSSSSSSSkF", "FkkkkkkkkkkkkkkF", "FFAFFFFFFFFAFFFF",
    ],
  },
  /* 城の石床 (大判の敷石) */
  stoneFloor: {
    palette: { F: "#d8d2c8", f: "#c4beb2", d: "#a8a296" },
    rows: [
      "dddddddddddddddd", "dFFFFFFFdFFFFFFF", "dFFFfFFFdFFFFFFF", "dFFFFFFFdFFfFFFF",
      "dFFFFFfFdFFFFFFF", "dFfFFFFFdFFFFfFF", "dFFFFFFFdFfFFFFF", "dfffffffdfffffff",
      "dddddddddddddddd", "FFFFdFFFFFFFdFFF", "FFfFdFFFFFfFdFFF", "FFFFdFfFFFFFdFFF",
      "FFFFdFFFFFFFdFfF", "FfFFdFFFFFFFdFFF", "FFFFdFFFfFFFdFFF", "ffffdfffffffdfff",
    ],
  },
  /* 赤絨毯 (玉座へ続く道) */
  redCarpet: {
    palette: { r: "#a53030", R: "#c04040", d: "#7c2222", y: "#d9b45a" },
    rows: [
      "drrrrrrrrrrrrrrd", "drrrrRrrrrrrrrrd", "drrRrrrrrrRrrrrd", "drrrrrrrRrrrrrrd",
      "drrrrrrrrrrrRrrd", "drRrrrrrrrrrrrrd", "drrrrrrRrrrrrrrd", "drrrrryyrrrrRrrd",
      "drrRrryyrrrrrrrd", "drrrrrrrrrRrrrrd", "drrrrRrrrrrrrrrd", "drrrrrrrrrrrRrrd",
      "drRrrrrrrRrrrrrd", "drrrrrrrrrrrrrrd", "drrrRrrrrrrrRrrd", "drrrrrrrrrrrrrrd",
    ],
  },
  /* ステンドグラス (石壁の列に置く) */
  stainedGlass: {
    palette: {
      k: "#4a4d55", s: "#989ea8", S: "#b7bdc5", n: "#23252c",
      b: "#4f7fd9", B: "#7fa8ec", r: "#c94a4a", y: "#e8c84a", e: "#4aa864",
    },
    rows: [
      "kkkkkkkkkkkkkkkk", "SSSSSSSSSSSSSSSS", "sssskkkkkkkkssss", "ssskBBbnnbBBksss",
      "ssskbbbnnbbbksss", "sssknnnnnnnnksss", "ssskyyynnyyyksss", "ssskyyynnyyyksss",
      "sssknnnnnnnnksss", "ssskrrrnnrrrksss", "ssskrrrnnrrrksss", "sssknnnnnnnnksss",
      "ssskeeenneeeksss", "sssskkkkkkkkssss", "sSSSSSSSSSSSSSSs", "kkkkkkkkkkkkkkkk",
    ],
  },
  /* めがみの祭壇 (白い布と金の紋、ろうそく) */
  altar: {
    palette: {
      ...STONE_BG,
      k: "#6b6b5e", w: "#f2f2ea", W: "#d8d8cc", y: "#e8c84a", Y: "#f7e084", o: "#e8862f",
    },
    rows: [
      "FFFoFFFFFFFFoFFF", "FFFwFFFFFFFFwFFF", "FFFwFFFFFFFFwFFF", "FFkkkkkkkkkkkkFF",
      "FFkwwwwwwwwwwkFF", "FFkwwwyYYywwwkFF", "FFkwwyYYYYywwkFF", "FFkwwwyYYywwwkFF",
      "FFkwwwwwwwwwwkFF", "FFkWWWWWWWWWWkFF", "FFkkkkkkkkkkkkFF", "FFFkWWWWWWWWkFFF",
      "FFFkWWWWWWWWkFFF", "FFkkkkkkkkkkkkFF", "FFAAAAAAAAAAAAFF", "FFFFFFFfFFFFFFFF",
    ],
  },
};
