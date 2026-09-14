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

/* ---------- 第5章 (割合の都と 魔王マイナドス) ---------- */

/* ワリビキゴースト — 「%OFF」の ふだを もつ おばけ */
MONSTER_ART.waribikiGhost = {
  palette: { k: "#1c1a2e", w: "#dcd8f0", y: "#f2d675" },
  rows: [
    "................", ".....kkkkkk.....", "...kkwwwwwwkk...", "..kwwwwwwwwwwk..",
    ".kwwkkwwwwkkwwk.", ".kwwkkwwwwkkwwk.", ".kwwwwwwwwwwwwk.", ".kwwwwkkkkwwwwk.",
    "kwwwwwwwwwwwwwwk", "kwwyykwwwwkyywwk", "kwwwykwwwwkywwwk", "kwwwwwwwwwwwwwwk",
    "kwwwwwwwwwwwwwwk", ".kwkkwwkkwwkkwk.", "..k..kk..kk..k..", "................",
  ],
};

/* ツウブンヘビ — 分母を そろえる とぐろの ヘビ */
MONSTER_ART.tsuubunSnake = {
  palette: { k: "#16261c", g: "#3f8a5a", G: "#5cb078", y: "#f2d675", w: "#f7f4e8" },
  rows: [
    "......kkkk......", ".....kggggk.....", "....kgwgwggk....", "....kggggggk....",
    ".....kgggggk....", "......kkgggk....", "........kgggk...", ".......kgggggk..",
    "......kgGyGgk...", ".....kgGyyyGgk..", "....kgGyyyyyGgk.", "...kgGGGGGGGGgk.",
    "..kgGGyyyyGGGgk.", ".kgGGGGGGGGGGgk.", ".kggggggggggggk.", "..kkkkkkkkkkkk..",
  ],
};

/* タイセキキューブ — 立方体の からだを もつ まもの */
MONSTER_ART.taisekiCube = {
  palette: { k: "#1b2434", w: "#7fa8c4", W: "#b8d4e4" },
  rows: [
    "................", "...kkkkkkkkkk...", "..kwwwwwwwwwwk..", ".kwWWWWWWWWWWwk.",
    "kwWWWWWWWWWWWWwk", "kwWkkWWWWkkWWWwk", "kwWkkWWWWkkWWWwk", "kwWWWWWWWWWWWWwk",
    "kwWWWWkkkkWWWWwk", "kwWWWWWWWWWWWWwk", "kwWWWWWWWWWWWWwk", "kwWWWWWWWWWWWWwk",
    ".kwWWWWWWWWWWwk.", "..kwwwwwwwwwwk..", "...kkkkkkkkkk...", "................",
  ],
};

/* 魔王マイナドス — 第5章ボス (偽ラスボス) */
MONSTER_ART.minados = {
  palette: { k: "#0c0a14", d: "#3a2a52", D: "#221838", s: "#8a6bd5", w: "#f2eaff", y: "#f2d675" },
  rows: [
    "..k..........k..", "..kk...kk...kk..", ".kdkk.kddk.kkdk.", ".kddkkddddkkddk.",
    "..kddddddddddk..", "..kdsdkddkdsdk..", "..kddddddddddk..", "..kddwwwwwwddk..",
    ".kkddddddddddkk.", "kDDdddyyyydddDDk", "kDdddddddddddDDk", "kDddyyyyyyyydDDk",
    ".kDdddddddddDDk.", "..kDDddddddDDk..", "...kDDDDDDDDk...", "....kkkkkkkk....",
  ],
};

/* 第5章の 色ちがい (端数ケシゴムン・海底ガニ・雲の番人・深海の主) */
MONSTER_ART.hasuuKeshigomun = {
  palette: { k: "#2b1f3a", w: "#efe6f7", W: "#c9b8dd", l: "#ffffff", b: "#8a6bd5", B: "#5a3f96", c: "#b79ae8", p: "#e8a0c8" },
  rows: MONSTER_ART.keshigomun.rows,
};

MONSTER_ART.kaiteiKani = {
  palette: { k: "#0f2630", i: "#1f5a63", I: "#2f8a8f", l: "#5ec4c0", w: "#f2f8f0", r: "#f2a05a" },
  rows: MONSTER_ART.inkgani.rows,
};

MONSTER_ART.kumoNoBanjin = {
  palette: { k: "#3a4a6b", S: "#dbe6f7", d: "#8fa6c9", y: "#f2d675" },
  rows: MONSTER_ART.wakemaeGolem.rows,
};

MONSTER_ART.shinkaiNoNushi = {
  palette: { k: "#08131e", i: "#123a52", I: "#1f6b8a", l: "#4fb0c4", w: "#e2f4ff" },
  rows: MONSTER_ART.dekaInkugumo.rows,
};

/* ---------- 第6章 (下の世界ネガリア) ---------- */

/* 冥王ゼロム 第1形態 — すべてを 「0」に かえそうとする 王 */
MONSTER_ART.zerom = {
  palette: { k: "#05040a", d: "#1b1430", D: "#0e0a1c", s: "#4a3f7a", l: "#8fe0ff", w: "#e6f7ff", y: "#f2e28a" },
  rows: [
    "....kkkkkkkk....", "...kdddddddddk..", "..kdddwwwwdddk..", "..kddwllllwddk..",
    ".kdddwlkkklwdddk", ".kddwlkyykkwlddk", ".kddwllkkllwddk.", ".kdddwllllwdddk.",
    "kDddddwwwwddddDk", "kDdddddddddddDDk", "kDddlllllllldDDk", "kDdlkkkkkkkkldDk",
    "kDddlllllllldDDk", ".kDdddddddddDDk.", "..kDDDddddDDDk..", "...kkkkkkkkkk...",
  ],
};

/* まぼろしの ゆうしゃ — ピタゴラの試練の 番人 */
MONSTER_ART.maboroshiHero = {
  palette: { k: "#0f1226", w: "#9ad8f2", W: "#5d8fb8", l: "#e6f7ff", b: "#3d5891", B: "#26365e", y: "#cbe8f7", m: "#7fa8c4", M: "#c9e8f7", s: "#8fb8d8" },
  rows: [
    ".....kkkkkk.....", "....kmMMMMmk....", "...kmMMMMMMmk...", "..MkmyyMMyymk...",
    "..MkwwwwwwwwWk..", "..MkwkWwwWkwWk..", "..MkwwWWWWwwWk..", "..M.kWWWWWWk....",
    "..Mkkkbbbbkklwk.", ".yyskbbbbbbklwlk", ".WWskbbbbbbklwlk", "...kBbyyyyBkllk.",
    "...kBBbbbbBBkk..", "...kkBkkkkBkk...", "....kBk..kBk....", "....kkk..kkk....",
  ],
};

/* ネガリアの まもの (色ちがい) */
MONSTER_ART.zeroKeshigomun = {
  palette: { k: "#08060f", w: "#5a4d8a", W: "#3a3160", l: "#8fe0ff", b: "#241c3d", B: "#150f26", c: "#4a3f7a", p: "#7d4166" },
  rows: MONSTER_ART.keshigomun.rows,
};

MONSTER_ART.negaGhost = {
  palette: { k: "#08060f", w: "#6b5c9e", y: "#8fe0ff" },
  rows: MONSTER_ART.waribikiGhost.rows,
};

MONSTER_ART.hayasaBat = {
  palette: { k: "#08060f", b: "#2a1f4a", B: "#463a7a", l: "#8a79c9", w: "#e6f7ff", y: "#8fe0ff" },
  rows: MONSTER_ART.mojibakeBat.rows,
};

MONSTER_ART.sokudoWolf = {
  palette: { k: "#08060f", g: "#3f3160", G: "#6b5c9e", w: "#e6f7ff", y: "#8fe0ff" },
  rows: MONSTER_ART.monosashiOokami.rows,
};

MONSTER_ART.zeroCube = {
  palette: { k: "#08060f", w: "#4a3f7a", W: "#7d6fb0" },
  rows: MONSTER_ART.taisekiCube.rows,
};

/* 冥王ゼロム 第2形態 (真の姿) */
MONSTER_ART.zeromTrue = {
  palette: { k: "#0a0812", d: "#4a1f3a", D: "#26101f", s: "#8f2f4a", l: "#ffd166", w: "#fff3d6", y: "#ff6a3c" },
  rows: MONSTER_ART.zerom.rows,
};

MONSTER_ART.sunanezumi = {
  palette: { k: "#241d16", g: "#c9a468", G: "#8f6f43", l: "#e8d3a0", p: "#e0906a", P: "#f2c0a0", w: "#fff8e6", y: "#edc43f" },
  rows: MONSTER_ART.kazunezumi.rows,
};

/* ---------- 終章「ムゲンのらせん」(KQ-30b) — 金と ぞうげ色、青みどりの 色ちがい ---------- */

MONSTER_ART.rasenKeshigomun = {
  palette: { k: "#1a1030", w: "#fff6d8", W: "#e0d3a8", l: "#ffffff", b: "#3fd6d0", B: "#1c8f96", c: "#9ff0ea", p: "#f2cf5b" },
  rows: MONSTER_ART.keshigomun.rows,
};

MONSTER_ART.rasenBat = {
  palette: { k: "#1a1030", b: "#1c8f96", B: "#3fd6d0", l: "#9ff0ea", w: "#fff6d8", y: "#f2cf5b" },
  rows: MONSTER_ART.mojibakeBat.rows,
};

MONSTER_ART.rasenDaruman = {
  palette: { k: "#1a1030", w: "#fff6d8", W: "#e0d3a8", b: "#1c8f96", o: "#f2cf5b", r: "#3fd6d0", t: "#c9932a" },
  rows: MONSTER_ART.yukiDaruman.rows,
};

MONSTER_ART.rasenSnake = {
  palette: { k: "#1a1030", g: "#c9932a", G: "#f2cf5b", y: "#3fd6d0", w: "#fff6d8" },
  rows: MONSTER_ART.tsuubunSnake.rows,
};

MONSTER_ART.rasenCube = {
  palette: { k: "#1a1030", w: "#c9932a", W: "#f2cf5b" },
  rows: MONSTER_ART.taisekiCube.rows,
};

/* ∞竜ムゲニア — 金の うろこ、青みどりの つばさ、しっぽが ∞ の かたちに まいている 隠しボス */
MONSTER_ART.mugenia = {
  palette: { k: "#1a1030", G: "#f2cf5b", T: "#1c8f96", t: "#3fd6d0", r: "#ff3c5a", w: "#fff6d8" },
  rows: [
    "..kk........kk..", ".kGGk......kGGk.", ".kGkkkkkkkkkkGk.", "kkkGGGGGGGGGGkkk",
    "kTkGrkGGGGkrGkTk", "kTTkGGGGGGGGkTTk", "kTtTkGwwwwGkTtTk", "kTtTTkkkkkkTTtTk",
    ".kTtTkGGGGkTtTk.", ".kTTkGwwwwGkTTk.", "..kkkGwwwwGkkk..", "....kGGwwGGk....",
    "....kkGGGGkk....", "...kGGkkkkGGk...", "..kGkkGkkGkkGk..", "...kkk.kk.kkk...",
  ],
};
