/* 「ケシケシ軍団」の16x16モンスター。テクスチャ名は "monster-" + キー。 */
import type { PixelArt } from "./format";

const INK_ROWS = [
  ".......kk.......", "......kiik......", ".....kiIIik.....", "....kiIIIIik....",
  "...kiIIIIIIik...", "..kiIIIIIIIIik..", ".kiIIwwIIwwIIIik", "kIIwkwIIwkwIIIIk",
  "kIIIIIIIIIIIIIIk", "kIIIIIkkIIIIIIIk", "kIIIIkllkIIIIIIk", ".kIIIIIIIIIIIIk.",
  "..kkIIIIIIIIkk..", "..kilkIIkilk....", ".kilkk..kilkk...", "..kk.....kk.....",
];

export const MONSTER_ART: Record<string, PixelArt> = {
  keshigomun: {
    palette: { k: "#18202b", w: "#eee9dd", W: "#c9c5bb", l: "#ffffff", b: "#3475bd", B: "#1d4d83", c: "#69a5dc", p: "#ee8298" },
    rows: [
      ".....kkkkkk.....", "...kkllllllkk...", "..klwwwwwwwwlk..", ".klwwwwwwwwwwlk.",
      ".kwwkkwwwwkkwwk.", ".kwwkkwwwwkkwwk.", ".kwwwwwwwwwwwwk.", ".kwpwwwkkkkwpwwk",
      ".kwwwwkWWkwwwwwk", "..kkkkkkkkkkkk..", "kcccccccccccccck", "kcbBbbBbbBbbBbck",
      "kcbbbbbbbbbbbbck", "kcBBBBBBBBBBBBck", "kccccccccccccck.", "..kkkkkkkkkkkk..",
    ],
  },
  inkugumo: {
    palette: { k: "#111126", i: "#252563", I: "#3c3b99", l: "#6969cc", w: "#f7f4e8" },
    rows: INK_ROWS,
  },
  dekaInkugumo: {
    palette: { k: "#211027", i: "#4a1e68", I: "#74339a", l: "#ad6bd3", w: "#fff3df" },
    rows: INK_ROWS,
  },
  mojibakeBat: {
    palette: { k: "#171525", b: "#40365f", B: "#68578e", l: "#917bb7", w: "#f8f2df", y: "#f0c842" },
    rows: [
      "k..............k", "kk............kk", "kbk..........kbk", "kbbk..kkkk..kbbk",
      "kbbbkkbBBbkkbbbk", ".kbbbBllllBbbbk.", "..kBBBlBBBlBBk..", "...kBwkBBkwBk...",
      "...kBwkkkwBk....", "...kBBBBBBBk....", "....kBByBBk.....", ".....kByBk......",
      "......kyk.......", "......kyk.......", ".......k........", "................",
    ],
  },
  togeImomushi: {
    palette: { k: "#182016", g: "#4f9639", G: "#2e682d", l: "#78bd4e", t: "#d7b878", T: "#f1d99b", w: "#fff8df", p: "#e67e91" },
    rows: [
      "...t...t...t....", "..tTt.tTt.tTt...", "..kGk.kGk.kGk...", ".kglGkglGkglGkk.",
      "kglglglglglglgk.", "kggGgggGgggGgggk", ".kglGkglGkglGggk", "..kGgGkGgGkGglgk",
      "...kk.kklggggggk", ".....kglgggkwkwk", "....kggGgggkwkwk", "....kglggpgggggk",
      ".....kgggggggkk.", "......kkgggkk...", "........kkk.....", "................",
    ],
  },
  eraser: {
    palette: { k: "#1d1b1a", w: "#eee9dc", W: "#c8c2b4", l: "#ffffff", r: "#b54332", R: "#762a2a", c: "#dd6550", y: "#efca4b" },
    rows: [
      "....kkkkkkkk....", "..kkcccccccckk..", ".kcrrrrrrrrrrRck", "kcrRrrRrrRrrRrck",
      "kcrrrrrrrrrrrrck", "kRRRRRRRRRRRRRRk", ".kkkkkkkkkkkkkk.", ".klwwwwwwwwwwlk.",
      ".kwwkkwwwwkkwwk.", ".kwwkkwwwwkkwwk.", ".kwwwwwwwwwwwwk.", ".kwwwkkyykkwwwwk",
      ".kwwkWWWWWWkwwwk", ".kWwWwWwWwWwWwWk", "..kWwWwWwWwWwWk.", "...kkkkkkkkkk...",
    ],
  },
  kazunezumi: {
    palette: { k: "#1a1a1d", g: "#858b94", G: "#5d646d", l: "#adb2b8", p: "#df8e9d", P: "#f2b4bf", w: "#fff8e6", y: "#edc43f" },
    rows: [
      "..kk........kk..", ".kpPk......kPpk.", "kpggPkkkkkkPggpk", "kPgggGGGGGGgggPk",
      ".kGggggggggggGk.", "kgggkkggggkkgggk", "kgggkwkgggkwkggk", "kggggggggggggggk",
      ".kgggGGkkGGgggk.", "..kggGwwwwGggk..", ".kggggggggggggkp", "kgggyyyggggggkpk",
      "kgggykygggggkpp.", ".kggyyygggggkp..", "..kkggkkggkk....", "....kk..kk......",
    ],
  },
  /* シュウセイエキン — 修正液のおばけ (第2章・塔) */
  shuseiekin: {
    palette: { k: "#1b1d24", w: "#f4f1e6", W: "#d5d1c2", l: "#ffffff", g: "#8a9aa8", p: "#7ec3d8", d: "#5a6a78" },
    rows: [
      "......kkkk......", ".....kggggk.....", ".....kgddgk.....", "....kkkkkkkk....",
      "....kwwwwwwk....", "...kwwlwwlwwk...", "..kwwwwwwwwwwk..", "..kwwkwwwwkwwk..",
      "..kwwkwwwwkwwk..", "..kwwwwwwwwwwk..", "..kwwwkkkkwwwk..", "..kWwwwwwwwwWk..",
      "..kWwpwwwwpwWk..", "...kWwwwwwwWk...", "....kWWWWWWk....", ".....kkkkkk.....",
    ],
  },
  /* インクガニ — 海のインクいきもの (第2章・海辺) */
  inkgani: {
    palette: { k: "#161a26", i: "#2a3a7b", I: "#3d54ab", l: "#7186d5", w: "#f7f4e8", r: "#d55a6b" },
    rows: [
      "kk....kkkk....kk", "kikk.kIIIIk.kkik", ".kiikIIIIIIkiik.", "..kkIIIIIIIIkk..",
      "...kIwkIIkwIk...", "...kIwkIIkwIk...", "..kIIIIrrIIIIk..", "..kIIIIIIIIIIk..",
      ".kiIIIIIIIIIIik.", ".kiIkIIIIIIkIik.", "..kkiIIIIIIikk..", "...kIIkkkkIIk...",
      "..kiIk....kIik..", ".kiik......kiik.", ".kkk........kkk.", "................",
    ],
  },
  /* インクの魔女ブロッタ — 第2章ボス */
  blotta: {
    palette: { k: "#140f1e", h: "#3a2a5e", H: "#54408a", s: "#e8c9e0", i: "#2a2a6b", I: "#3a3a9b", l: "#8a6bd5", w: "#f4f1e6", y: "#f0c95a", p: "#c04a7e" },
    rows: [
      "......kkkkk.....", ".....khhhhhk....", "....khHHHHHhk...", "...khHHHHHHHhk..",
      "..kkkkkkkkkkkkk.", "...khhhhhhhhhk..", "...ksskssksssk..", "...ksskssksssk..",
      "...kssssssssk...", "....kspssspk....", "...kiiiiiiiiik..", "..kiIIlIIlIIiik.",
      ".kiIIIIIIIIIIik.", ".kiIIyIIIyIIIik.", "..kiIIIIIIIIik..", "...kkkkkkkkkk...",
    ],
  },
};

/* あわケシゴムン — ケシゴムンの海バージョン (色違い) */
MONSTER_ART.awaKeshigomun = {
  palette: { k: "#18202b", w: "#d8f0ee", W: "#a8d5d0", l: "#ffffff", b: "#2a9aa5", B: "#1d6d78", c: "#69d5dc", p: "#7ec3d8" },
  rows: MONSTER_ART.keshigomun.rows,
};

/* ---------- 第3章 (砂の国ワケーラ) ---------- */

/* サボテンナイフ — 腕がナイフの サボテン */
MONSTER_ART.cactusKnife = {
  palette: { k: "#152b1b", g: "#3f8a4a", G: "#57a95c", w: "#f2f6e4", s: "#9aa5b0", S: "#d3dae2", y: "#f2d675" },
  rows: [
    "................", "......kkkk......", ".....kgGGgk.....", "....kgGGGGgk....",
    "...kgGwwGGwwGgk.", "...kgGwkGGkwGgk.", "...kgGGGGGGGGgk.", "sSSkkgGGGGGGGgk.",
    "sSSkkgGGGGGGGgk.", "...kgGGGGGGGgkSs", "...kgGGGGGGGgkSs", "...kgGGGGGGGGgk.",
    "...kgGGyyyyGGgk.", "...kgGGGGGGGGgk.", "....kgggggggk...", ".....kkkkkkk....",
  ],
};

/* さそりコンパス — 製図コンパスの さそり */
MONSTER_ART.sasoriCompass = {
  palette: { k: "#1a1a22", m: "#6b7280", M: "#a8b0ba", w: "#f4f1e6", y: "#f2d675" },
  rows: [
    "................", "..kk........kk..", ".kmk........kmk.", ".kmk..kkkk..kmk.",
    ".kmkkkmMMmkkkmk.", "..kmmmMwwMmmmk..", "...kmMwkkwMmk...", "...kmMMMMMMmk...",
    "..kmMMMMMMMMmk..", "..kmMMkkkkMMmk..", "...kmMMMMMMmk...", "....kmMMMMmk....",
    ".....kmMMmk.....", "......kmmk......", "......kmk.kyk...", ".......k..kyk...",
  ],
};

/* ミイラふせん — 包帯だらけの ふせん紙 */
MONSTER_ART.mummyFusen = {
  palette: { k: "#2a2418", y: "#e8d98a", w: "#f7f3e2", d: "#8a7a4a" },
  rows: [
    "....kkkkkkkk....", "...kyyyyyyyyk...", "..kyywwwwwwyyk..", "..kywkwwwwkwyk..",
    "..kywkwwwwkwyk..", "..kywwwwwwwwyk..", "..kyywwddwwyyk..", "..kyyyyyyyyyyk..",
    "..kwwyyyyyywwk..", "..kwwwyyyywwwk..", "..kyywwwwwwyyk..", "..kyyyywwyyyyk..",
    "..kyyyyyyyyyyk..", "...kyywwwwyyk...", "...kkyyyyyykk...", ".....kkkkkk.....",
  ],
};

/* わけまえゴーレム — ピラミッドの門番 (中ボス) */
MONSTER_ART.wakemaeGolem = {
  palette: { k: "#4a3820", S: "#c9a468", d: "#8f6f43", y: "#f2d675" },
  rows: [
    "................", "...kkkkkkkkkk...", "..kSSSSSSSSSSk..", "..kSykSSSSkySk..",
    "..kSSSSSSSSSSk..", "..kSSkkSSkkSSk..", "...kSSSSSSSSk...", "kkkSSSSSSSSSSkkk",
    "kSSkSSSSSSSSkSSk", "kSSkSSdddddSkSSk", "kSSkSSdSSSdSkSSk", "kSSkSSdddddSkSSk",
    "kkkkSSSSSSSSkkkk", "...kSSSkkSSSk...", "..kkSSkkkkSSkk..", "..kkkk....kkkk..",
  ],
};

/* 盗賊王アマリダ — 第3章ボス (三日月刀と 赤いマント) */
MONSTER_ART.amarida = {
  palette: { k: "#1a1420", w: "#f4f1e6", y: "#f2d675", s: "#d9a06e", r: "#b8342f", R: "#7f2226", m: "#8a94a4", M: "#d3dae2" },
  rows: [
    "......kkkk......", ".....kwwwwk.....", "....kwwyywwk....", "....kwwwwwwk....",
    "....kssssssk....", "...kssksskssk...", "...ksssssssssk..", "...ksssssssssk..",
    "..kkrrrrrrrrkk..", ".kmrrryyyrrrrmk.", "kMmrrryyyrrrrmMk", "kMkrrrrrrrrrrkMk",
    ".kkrrrRRRRrrrkk.", "..krrRRRRRRrrk..", "..kRRRRRRRRRRk..", "...kkkkkkkkkk...",
  ],
};

/* すなケシゴムン / すなぬすみネズミ — 砂漠バージョン (色違い) */
MONSTER_ART.sunaKeshigomun = {
  palette: { k: "#2a2118", w: "#f2e2b8", W: "#d3bd88", l: "#fff8e2", b: "#c98a3a", B: "#8f5f24", c: "#e8bb6a", p: "#e0906a" },
  rows: MONSTER_ART.keshigomun.rows,
};

/* ---------- 第4章 (氷の国メジャーリア) ---------- */

/* ゆきだるマン — バケツを かぶった ゆきだるま */
MONSTER_ART.yukiDaruman = {
  palette: { k: "#2b4560", w: "#f4fbff", W: "#c9dcea", b: "#6b7280", o: "#e8823a", r: "#b8342f", t: "#7a5230" },
  rows: [
    "................", "....kkkkkkkk....", "...kbbbbbbbbk...", "...kbbbbbbbbk...",
    "....kwwwwwwk....", "...kwwwwwwwwk...", "..kwwkwwwwkwwk..", "..kwwwwoowwwwk..",
    "...kwwwwwwwwk...", "..kkwwwwwwwwkk..", "tkkwwwkkkkwwwkkt", ".kwwwwwwwwwwwwk.",
    ".kwwwwrrrrwwwwk.", ".kwwwwwwwwwwwwk.", "..kwwwwwwwwwwk..", "...kkkkkkkkkk...",
  ],
};

/* ものさしオオカミ — せなかに めもりが ある オオカミ */
MONSTER_ART.monosashiOokami = {
  palette: { k: "#1c2230", g: "#5c6b7d", G: "#8a99ab", w: "#f4f1e6", y: "#f2d675" },
  rows: [
    "................", "..kk........kk..", ".kgk........kgk.", ".kgGkkkkkkkkGgk.",
    "kgGGGGGGGGGGGGgk", "kgGkwkGGGGkwkGgk", "kgGGGGGGGGGGGGgk", ".kgGGGwwwwGGGgk.",
    ".kgGGwkkkkwGGgk.", "kkgGGGGGGGGGGgkk", "kgGyGyGyGyGyGGgk", "kgGGGGGGGGGGGGgk",
    "kkgGGGGGGGGGGgkk", ".kkgGkkkkkkGgkk.", "..kgk......kgk..", "..kkk......kkk..",
  ],
};

/* 小数の魔人デシマロン — 第4章ボス */
MONSTER_ART.decimaron = {
  palette: { k: "#0f1626", b: "#26407a", B: "#16264d", w: "#d8ecff", y: "#8fe0ff" },
  rows: [
    "......kkkk......", ".....kbbbbk.....", "....kbbyybbk....", "....kbbbbbbk....",
    "...kbwbkkbwbk...", "...kbbbbbbbbk...", "..kbbbbwwbbbbk..", ".kBbbbbbbbbbbBk.",
    "kBBbbbyyyybbbBBk", "kBbbbbbbbbbbbbBk", ".kBbbbyybbbbbBk.", "..kBbbbbbbbbBk..",
    "...kBBbbbbBBk...", "....kBBBBBBk....", ".....kBBBBk.....", "......kkkk......",
  ],
};

/* こおりの国の 色違い (ケシゴムン・コウモリ・カニ・ゴーレム) */
MONSTER_ART.yukiKeshigomun = {
  palette: { k: "#22384f", w: "#f4fbff", W: "#c9dcea", l: "#ffffff", b: "#5e8cb5", B: "#3f6488", c: "#a8d8ee", p: "#b8d0e8" },
  rows: MONSTER_ART.keshigomun.rows,
};

MONSTER_ART.kooriBat = {
  palette: { k: "#16243a", b: "#33547d", B: "#5e8cb5", l: "#a8d8ee", w: "#f4fbff", y: "#cbe8f7" },
  rows: MONSTER_ART.mojibakeBat.rows,
};

MONSTER_ART.bundokiKani = {
  palette: { k: "#1c2230", i: "#5a6675", I: "#8a99ab", l: "#c2cad8", w: "#f7f4e8", r: "#f2d675" },
  rows: MONSTER_ART.inkgani.rows,
};

MONSTER_ART.kooriGolem = {
  palette: { k: "#22384f", S: "#8fc0e0", d: "#3f6488", y: "#cbe8f7" },
  rows: MONSTER_ART.wakemaeGolem.rows,
};

MONSTER_ART.sunanezumi = {
  palette: { k: "#241d16", g: "#c9a468", G: "#8f6f43", l: "#e8d3a0", p: "#e0906a", P: "#f2c0a0", w: "#fff8e6", y: "#edc43f" },
  rows: MONSTER_ART.kazunezumi.rows,
};
