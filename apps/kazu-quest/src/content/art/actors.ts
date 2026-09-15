/* 正面向き16x16キャラクター。テクスチャ名は "actor-" + キー。 */
import type { PixelArt } from "./format";

export const ACTOR_ART: Record<string, PixelArt> = {
  /*
   * 勇者: 金の縁どりの兜 + 左手に剣 + 右手に白いカイトシールド。
   * m/M=鋼 y=金 w=盾の白地
   */
  hero: {
    palette: { k: "#171820", h: "#39281c", m: "#8a94a4", M: "#c4cdd8", s: "#e7ad7d", S: "#ffd0a0", b: "#2865aa", B: "#173f75", l: "#5795d2", y: "#f1c644", w: "#f7f1de" },
    rows: [
      ".....kkkkkk.....", "....kmMMMMmk....", "...kmMMMMMMmk...", "..MkmyyMMyymk...",
      "..MkSSSSSSSSk...", "..MkSksSSskSk...", "..MkSSssssSSk...", "..M.kssssssk....",
      "..Mkkkbbbbkkwwk.", ".yysklbbbblkwywk", ".hhskbbbbbbkwywk", "...kBbyyyyBkwwk.",
      "...kBBbbbbBBkk..", "...kkBkkkkBkk...", "....kBk..kBk....", "....kkk..kkk....",
    ],
  },
  /* 勇者の後ろ姿 (上向き移動時)。背中にカイトシールドを背負う */
  heroUp: {
    palette: { k: "#171820", h: "#39281c", m: "#8a94a4", M: "#c4cdd8", s: "#e7ad7d", S: "#ffd0a0", b: "#2865aa", B: "#173f75", l: "#5795d2", y: "#f1c644", w: "#f7f1de" },
    rows: [
      ".....kkkkkk.....", "....kmMMMMmk....", "...kmMMMMMMmk...", "...kmyyMMyymk...",
      "...kmMMMMMMmk...", "...kmmMMMMmmk...", "....kmmmmmmk....", "....kssssssk....",
      "...kkkwwwwkkk...", "..kskwwwwwwksk..", "..kskwwyywwksk..", "...kBkwyywkBk...",
      "...kBBkwwkBBk...", "...kkBkkkkBkk...", "....kBk..kBk....", "....kkk..kkk....",
    ],
  },
  /* 勇者の横向き (右向き。左は flipX で表示)。剣を前にかまえる */
  heroSide: {
    palette: { k: "#171820", h: "#39281c", m: "#8a94a4", M: "#c4cdd8", s: "#e7ad7d", S: "#ffd0a0", b: "#2865aa", B: "#173f75", l: "#5795d2", y: "#f1c644", w: "#f7f1de" },
    rows: [
      ".....kkkkkk.....", "....kmMMMMmk....", "...kmMMMMMMmk...", "...kmyMMSSSSkM..",
      "...kmMMSSSSSkM..", "...kmMSSkSSSkM..", "...kmMSSSssSkM..", "....kmSssssk.M..",
      "...kkkbbbbkk.M..", "...kskbbbblsyMy.", "...kskbbbbbskh..", "...kBbbyybbBk...",
      "...kBBbbbbBBk...", "...kkBkkkBkk....", "....kBk.kBk.....", "....kkk.kkk.....",
    ],
  },
  mother: {
    palette: { k: "#211916", h: "#75452b", H: "#a76a42", s: "#e8ae82", S: "#ffd0a4", d: "#b84e38", D: "#7f3029", l: "#e37b59", a: "#f0bd55" },
    rows: [
      ".....kkkkkk.....", "....kHHHHHHk....", "...kHHhhhhHHk...", "...kHkSSSSkHk...",
      "...kSSSSSSSSk...", "...kSksSSskSk...", "...kSSssssSSk...", "....kssssssk....",
      "...kklddddldkk..", "..kskddddddksk..", "..kskddadddksk..", "...kDDddddDDk...",
      "..kDDddddddDDk..", ".kDDDDddddDDDDk.", ".kDDDDDDDDDDDDk.", "..kkkkkkkkkkkk..",
    ],
  },
  king: {
    palette: { k: "#201820", c: "#f2c84b", C: "#a97420", s: "#e9ad7c", S: "#ffd0a0", h: "#70452d", r: "#b43b38", R: "#72282d", l: "#df6550", w: "#f2eee1", y: "#f4dc77" },
    rows: [
      "...kckcckcckck..", "...kccccccccck..", "....kCCCCCCk....", "...khhSSSShhk...",
      "...kSksSSskSk...", "...kSSssssSSk...", "....ksskkssk....", "....kwwwwwwk....",
      "...kklrrrrlkk...", "..kwkrrrrrrkwk..", ".kwwkrryyrrkwwk.", ".kwkRRrrrrRRkwk.",
      "..kRRrrrrrrRRk..", ".kRRRrrrrrrRRRk.", ".kRRRRRRRRRRRRk.", "..kkkkkkkkkkkk..",
    ],
  },
  villager: {
    palette: { k: "#1c1b17", h: "#4b321f", H: "#755033", s: "#e5aa7b", S: "#ffd0a2", g: "#3f8a48", G: "#286135", l: "#69ae58", b: "#725033" },
    rows: [
      ".....kkkkkk.....", "....kHHHHHHk....", "...kHhhhhhhHk...", "...kHkSSSSkHk...",
      "...kSSSSSSSSk...", "...kSksSSskSk...", "...kSSssssSSk...", "....kssssssk....",
      "...kkkggggkkk...", "..ksklgggglksk..", "..kskggggggksk..", "...kGgbbbbggGk..",
      "...kGGggggGGk...", "...kkGkkkkGkk...", "....kGk..kGk....", "....kkk..kkk....",
    ],
  },
  /* 僧侶タスク (第2章で加入する仲間 — 白いローブに青いライン、十字ならぬ「+」の印) */
  tasuku: {
    palette: { k: "#1a1c22", h: "#8a5a30", H: "#b57a42", s: "#e8ae80", S: "#ffd0a2", w: "#f4f1e6", W: "#d8d3c2", b: "#3d6fb0", y: "#f0c95a" },
    rows: [
      ".....kkkkkk.....", "....kHHHHHHk....", "...kHhhhhhhHk...", "...kHkSSSSkHk...",
      "...kSSSSSSSSk...", "...kSksSSskSk...", "...kSSssssSSk...", "....kssssssk....",
      "...kkkwwwwkkk...", "..kskwwbywwksk..", "..kskwbbbywwksk.", "...kWwwbywwWk...",
      "..kWWwwwwwwWWk..", ".kWWWwwwwwwWWWk.", ".kWWWWWWWWWWWWk.", "..kkkkkkkkkkkk..",
    ],
  },
  /* 武闘家カケル (第3章で加入する仲間 — オレンジの道着と はちまき) */
  kakeru: {
    palette: { k: "#1a1512", h: "#2f2118", s: "#e8ae80", S: "#ffd0a2", o: "#e8823a", O: "#a8531f", y: "#f2d04a", w: "#f7f1de" },
    rows: [
      ".....kkkkkk.....", "....khhhhhhk....", "...khhhhhhhhk...", "...kyyyyyyyyk...",
      "...kSSSSSSSSk...", "...kSksSSskSk...", "...kSSssssSSk...", "....kssssssk....",
      "...kkkooookkk...", "..kskoooooksk...", "..kskooooooksk..", "...kOoyyyyoOk...",
      "...kOOooooOOk...", "...kkOkkkkOkk...", "....kOk..kOk....", "....kkk..kkk....",
    ],
  },
  /* 魔法使いリトル (第4章で加入する仲間 — とんがり帽子と むらさきのローブ) */
  little: {
    palette: { k: "#1a1420", p: "#6b4a9e", P: "#432c6b", s: "#e8ae80", S: "#ffd0a2", y: "#f2d675" },
    rows: [
      ".......kk.......", "......kppk......", ".....kppppk.....", "....kpppppyk....",
      "...kkkkkkkkkk...", "...kSSSSSSSSk...", "...kSksSSskSk...", "...kSSssssSSk...",
      "....kssssssk....", "...kkkppppkkk...", "..kskppppppksk..", "..kskppyyppksk..",
      "...kPppppppPk...", "..kPPppppppPPk..", "...kkPkkkkPkk...", "....kPk..kPk....",
    ],
  },
  /* 隊商の商人 (砂の国のNPC — ターバンと青い旅装束) */
  merchant: {
    palette: { k: "#1b1920", w: "#f2eee1", W: "#cfc9b8", y: "#f2d675", s: "#dfaa82", S: "#f5c9a0", b: "#3d6fb0", B: "#274a7d" },
    rows: [
      ".....kkkkkk.....", "....kwwwwwwk....", "...kwwyywwwwk...", "...kkSSSSSSkk...",
      "...kSSSSSSSSk...", "...kSksSSskSk...", "...kSSssssSSk...", "....kssssssk....",
      "...kkkbbbbkkk...", "..kskbbbbbbksk..", "..kskbbyybbksk..", "...kBbbbbbbBk...",
      "..kBBbbbbbbBBk..", "...kkBkkkkBkk...", "....kBk..kBk....", "....kkk..kkk....",
    ],
  },
  scholar: {
    palette: { k: "#1b1920", h: "#d7d5cf", H: "#ffffff", s: "#dfaa82", S: "#f5c9a0", b: "#4c4d72", B: "#30304d", l: "#7379a0", y: "#e6bd43", d: "#9b9b9b" },
    rows: [
      ".....kkkkkk.....", "....kHHHHHHk....", "...kHhHHHHhHk...", "...khkSSSSkhk...",
      "...kSksSSskSk...", "...kSSssssSSk...", "....kshhhsk.....", "....khHhHhk.....",
      "...kklbbbblkk...", "..kskbbbybbksk..", "..khkbbbbbbkhk..", "...kBBbbybBBk...",
      "..kBBBbbbbBBBk..", ".kBBBBbbbbBBBBk.", ".kBBBBBBBBBBBBk.", "..kkkkkkkkkkkk..",
    ],
  },
  /*
   * 章の先生 (学びの設計 LP-18)。まなびやの旧「学者」使い回しをやめ、章ごとに
   * 個性のある姿にする (色違いではなく輪郭・小物から作る — measurer 等の色違い
   * 方式とは別枠)。
   */
  /* ふくろう博士 (第1章): 丸めがねと 羽の房かざり、小わきに本 */
  owlProfessor: {
    palette: { k: "#201a14", H: "#e8dcc0", h: "#b89a68", t: "#6b4a2e", S: "#e8ae82", s: "#c98a5a", g: "#e6bd43", w: "#eaf4ff", l: "#7a5a34", b: "#5c3a22", B: "#3c2415", y: "#f2d675" },
    rows: [
      "...t.kkkkkk.t...", "....kHHHHHHk....", "...kthHHHHhtk...", "...kgkSSSSkgk...",
      "...kSkwSSswSk...", "...kSSssssSSk...", "....kttttsk.....", "....ktHtHtk.....",
      "...kklbbbblkk...", "..kskbbbybbksk..", "..khkbbbbbbkhk..", "...kBBbbybyyk...",
      "..kBBBbbbbyyyk..", ".kBBBBbbbbBBBBk.", ".kBBBBBBBBBBBBk.", "..kkkkkkkkkkkk..",
    ],
  },
  /* そろばん船長 (第2章): 白い船長ぼうしと そろばんを かかえる */
  abacusCaptain: {
    palette: { k: "#141b26", c: "#f2eee1", C: "#2a4a78", a: "#8a5a2e", H: "#e2c68a", h: "#a9863f", S: "#e8ae82", s: "#c98a5a", b: "#2a4a78", B: "#17304f", l: "#4c7aa8", w: "#f2eee1", y: "#f2d675" },
    rows: [
      "..cccccccccccc..", "...CCCCCCCCCC...", "...kahHHHHhak...", "...khkSSSSkhk...",
      "...kSksSSskSk...", "...kSSssssSSk...", "....kshhhsk.....", "....khHhHhk.....",
      "...kklbbbblkk...", ".wwskbbbybbksk..", ".wawkbbbbbbkhk..", ".wwkBBbbybBBk...",
      ".wawBBbbbbBBBk..", ".kBBBBbbbbBBBBk.", ".kBBBBBBBBBBBBk.", "..kkkkkkkkkkkk..",
    ],
  },
  /* 計算商人 (第3章): 帳簿と 金貨。隊商の商人 (merchant) とは別の役どころ */
  calcMaster: {
    palette: { k: "#1c1710", e: "#c9922f", H: "#efe6d0", h: "#c0aa78", S: "#e8ae82", s: "#c98a5a", g: "#3f7a4a", b: "#2f6b3d", B: "#1c4526", l: "#4c8a55", w: "#f2eee1", y: "#f2d675" },
    rows: [
      "....ekkkkkke....", "....kHHHHHHk....", "...kghHHHHhgk...", "...khkSSSSkhk...",
      "...kSksSSskSk...", "...kSSssssSSk...", "....ksehhsk.....", "....khHhHhk.....",
      "...kklbbbblkk...", "..kskbbbybbkyy..", ".wkhkbbbbbbkyw..", ".w.kBBbeybBByy..",
      ".wkBBBbbbbBByk..", ".kBBBBbbbbBBBBk.", ".kBBBBBBBBBBBBk.", "..kkkkkkkkkkkk..",
    ],
  },
  /* はかりの女王 (第4章): 王冠と てんびん */
  scaleQueen: {
    palette: { k: "#1c1420", c: "#f2c84b", C: "#a97420", H: "#e8dcf0", h: "#c0a8d0", S: "#e8ae82", s: "#c98a5a", b: "#6b3f8a", B: "#452a5c", l: "#9a6ab8", w: "#f2eee1", y: "#f2d675" },
    rows: [
      "....ckckckkc....", "...cCcCcCcCc....", "...kHhHHHHhHk...", "...khkSSSSkhk...",
      "...kSksSSskSk...", "...kSSssssSSk...", "....kshhhsk.....", "....khHhHhk.....",
      ".wwkklbbbblkk...", "wkwwkbbbybbkswkw", ".wwhkbbbbbbkhk..", "..kkBBbbybBBk...",
      "..kBBBbbbbBBBk..", ".kBBBBbbbbBBBBk.", ".kBBBBBBBBBBBBk.", "..kkkkkkkkkkkk..",
    ],
  },
  /* 割合ギルド長 (第5章): フードに ギルドしょうの「%」バッジ */
  percentGuildMaster: {
    palette: { k: "#161c1a", H: "#e4ddc8", h: "#b8ac8a", g: "#e6bd43", S: "#e8ae82", s: "#c98a5a", b: "#2f6f6a", B: "#1c4542", l: "#4f9a92", y: "#f2d675" },
    rows: [
      ".....gkkkkg.....", "....kHHHHHHk....", "...kHhHgHHhHk...", "...khkSSSSkhk...",
      "...kSksSSskSk...", "...kSSssssSSk...", "....ksghhgk.....", "....khHhHhk.....",
      "...kklbbbblkk...", "..kskbybyybksk..", "..khkbbyybbkhk..", "...kBBybyyBBk...",
      "..kBBBbbbbBBBk..", ".kBBBBbbbbBBBBk.", ".kBBBBBBBBBBBBk.", "..kkkkkkkkkkkk..",
    ],
  },
  /* 星読み (第6章): 星のしるしと ぼうえんきょう */
  stargazer: {
    palette: { k: "#12141f", H: "#dfe6f5", h: "#a9b4cc", y: "#f2d675", p: "#6b5a9e", S: "#e8ae82", s: "#c98a5a", b: "#243a6b", B: "#152547", l: "#4a68a8", w: "#c8d4e8" },
    rows: [
      ".....kkkkkk.....", "....kHyHHHHk....", "...kHyHyHHhHk...", "...khkSSSSkhk...",
      "...kSksSSskSk...", "...kSSssssSSk...", "....ksphhpk.....", "....khHhHhk.....",
      "...kklbbbblkkw..", "..kskbbbybbksww.", "..khkbbbbbbkwk..", "...kBBbbybBwk...",
      "..kBBBbbbbwBBk..", ".kBBBBbbbbBBBBk.", ".kBBBBBBBBBBBBk.", "..kkkkkkkkkkkk..",
    ],
  },
};

/* 雪国の村人 (第4章 — あつい コートと マフラー。村人の色違い) */
ACTOR_ART.snowVillager = {
  palette: { k: "#1b2230", h: "#4a3b5a", H: "#6d5c80", s: "#e5b48b", S: "#ffd7ae", g: "#3f6f9e", G: "#2a4d75", l: "#7fb0d8", b: "#c94f4f" },
  rows: ACTOR_ART.villager.rows,
};

/* 計測の都の 学者 (第4章 — 白衣に みずいろの ライン。学者の色違い) */
ACTOR_ART.measurer = {
  palette: { k: "#18202b", h: "#dfe8f0", H: "#ffffff", s: "#dfaa82", S: "#f5c9a0", b: "#3f6488", B: "#2b4560", l: "#8fc0e0", y: "#cbe8f7", d: "#a9b4c4" },
  rows: ACTOR_ART.scholar.rows,
};

/* 勇者ガウス (第6章 — 主人公の父。ゆうしゃの色ちがい: 赤マントと 白い髪) */
ACTOR_ART.gauss = {
  palette: { k: "#171820", h: "#7d6b58", m: "#a8a29a", M: "#e0dbd2", s: "#d9a682", S: "#f2c8a0", b: "#8f2f3f", B: "#5c1d2a", l: "#c04a5a", y: "#f1c644", w: "#f7f1de" },
  rows: ACTOR_ART.hero.rows,
};

/* かねきき の おばあさん (第1章 — 白い髪に むらさきの着物。村人の色違い) */
ACTOR_ART.granny = {
  palette: { k: "#1c1b17", h: "#d9d4cc", H: "#f2efe8", s: "#e5aa7b", S: "#ffd0a2", g: "#6b4a8a", G: "#4a3161", l: "#9a7ab8", b: "#c98a3a" },
  rows: ACTOR_ART.villager.rows,
};
