/*
 * アイテム定義。章データから itemId で参照される
 * (参照整合性は tests/content.test.ts で検証)。
 */

import type { ItemDef, ShopDef } from "./types";

export const ITEMS: Record<string, ItemDef> = {
  yakusou: {
    id: "yakusou",
    name: "やくそう",
    kind: "heal",
    power: 20,
    price: 8,
    description: "HPを 20 かいふくする くすり",
  },
  anshinNoSuzu: {
    id: "anshinNoSuzu",
    name: "あんしんのすず",
    kind: "key",
    price: 30,
    description: "もっていると モンスターに あいにくくなる",
  },
  /* ---- そうび (ぶき・よろい・たて) ---- */
  hinokiNoBou: {
    id: "hinokiNoBou",
    name: "ひのきのぼう",
    kind: "equip",
    slot: "weapon",
    atk: 2,
    price: 15,
    description: "こうげき +2。はじめての ぶき",
  },
  douNoTsurugi: {
    id: "douNoTsurugi",
    name: "どうのつるぎ",
    kind: "equip",
    slot: "weapon",
    atk: 5,
    price: 60,
    description: "こうげき +5。どうで できた つるぎ",
  },
  nunoNoFuku: {
    id: "nunoNoFuku",
    name: "ぬののふく",
    kind: "equip",
    slot: "armor",
    def: 2,
    price: 12,
    description: "しゅび +2。うごきやすい ふく",
  },
  kawaNoYoroi: {
    id: "kawaNoYoroi",
    name: "かわのよろい",
    kind: "equip",
    slot: "armor",
    def: 4,
    price: 45,
    description: "しゅび +4。じょうぶな かわの よろい",
  },
  kawaNoTate: {
    id: "kawaNoTate",
    name: "かわのたて",
    kind: "equip",
    slot: "shield",
    def: 2,
    price: 30,
    description: "しゅび +2。かるくて つかいやすい たて",
  },
};

/* ---------- 第2章の装備 ---------- */

ITEMS.tetsuNoTsurugi = {
  id: "tetsuNoTsurugi",
  name: "てつのつるぎ",
  kind: "equip",
  slot: "weapon",
  atk: 9,
  price: 140,
  description: "こうげき +9。かじやの じまんの いっぴん",
};

ITEMS.kusariKatabira = {
  id: "kusariKatabira",
  name: "くさりかたびら",
  kind: "equip",
  slot: "armor",
  def: 7,
  price: 110,
  description: "しゅび +7。くさりを あんだ よろい",
};

ITEMS.tetsuNoTate = {
  id: "tetsuNoTate",
  name: "てつのたて",
  kind: "equip",
  slot: "shield",
  def: 5,
  price: 90,
  description: "しゅび +5。がんじょうな てつの たて",
};

/* ---------- 第3章の装備・どうぐ ---------- */

ITEMS.jouyakusou = {
  id: "jouyakusou",
  name: "じょうやくそう",
  kind: "heal",
  power: 50,
  price: 25,
  description: "HPを 50 かいふくする よく効く くすり",
};

ITEMS.hagaNeNoTsurugi = {
  id: "hagaNeNoTsurugi",
  name: "はがねのつるぎ",
  kind: "equip",
  slot: "weapon",
  atk: 14,
  price: 280,
  description: "こうげき +14。よく きれる はがねの つるぎ",
};

ITEMS.sabakuNoRobe = {
  id: "sabakuNoRobe",
  name: "さばくのローブ",
  kind: "equip",
  slot: "armor",
  def: 10,
  price: 230,
  description: "しゅび +10。すなあらしを ふせぐ ぬの",
};

ITEMS.mikazukiNoTate = {
  id: "mikazukiNoTate",
  name: "みかづきのたて",
  kind: "equip",
  slot: "shield",
  def: 8,
  price: 190,
  description: "しゅび +8。みかづきの かたちの たて",
};

/* ---------- 第4章の装備・どうぐ ---------- */

ITEMS.kaifukuNoTama = {
  id: "kaifukuNoTama",
  name: "かいふくのたま",
  kind: "heal",
  power: 90,
  price: 60,
  description: "HPを 90 かいふくする ふしぎな たま",
};

ITEMS.kooriNoKen = {
  id: "kooriNoKen",
  name: "こおりのつるぎ",
  kind: "equip",
  slot: "weapon",
  atk: 22,
  price: 620,
  description: "こうげき +22。こおりの やいばを もつ つるぎ",
};

ITEMS.ginNoYoroi = {
  id: "ginNoYoroi",
  name: "ぎんのよろい",
  kind: "equip",
  slot: "armor",
  def: 16,
  price: 540,
  description: "しゅび +16。さむさに つよい ぎんの よろい",
};

ITEMS.kagamiNoTate = {
  id: "kagamiNoTate",
  name: "かがみのたて",
  kind: "equip",
  slot: "shield",
  def: 13,
  price: 460,
  description: "しゅび +13。こおりの ように すきとおる たて",
};

/* ---------- 第5章の装備・どうぐ ---------- */

ITEMS.seiNoShizuku = {
  id: "seiNoShizuku",
  name: "せいなるしずく",
  kind: "heal",
  power: 180,
  price: 150,
  description: "HPを 180 かいふくする めがみの しずく",
};

ITEMS.hikariNoKen = {
  id: "hikariNoKen",
  name: "ひかりのつるぎ",
  kind: "equip",
  slot: "weapon",
  atk: 34,
  price: 1500,
  description: "こうげき +34。ひかりを やどす つるぎ",
};

ITEMS.maryokuNoRobe = {
  id: "maryokuNoRobe",
  name: "まりょくのローブ",
  kind: "equip",
  slot: "armor",
  def: 24,
  price: 1300,
  description: "しゅび +24。まほうの ちからを たかめる ローブ",
};

ITEMS.seiginoTate = {
  id: "seiginoTate",
  name: "せいぎのたて",
  kind: "equip",
  slot: "shield",
  def: 20,
  price: 1100,
  description: "しゅび +20。まものの まほうを はねかえす たて",
};

export const SHOPS: Record<string, ShopDef> = {
  "ch1-capital-shop": {
    id: "ch1-capital-shop",
    name: "カズールの どうぐや",
    itemIds: [
      "yakusou",
      "anshinNoSuzu",
      "hinokiNoBou",
      "douNoTsurugi",
      "nunoNoFuku",
      "kawaNoYoroi",
      "kawaNoTate",
    ],
  },
  "ch1-morikage-shop": {
    id: "ch1-morikage-shop",
    name: "モリカゲの どうぐや",
    itemIds: ["yakusou", "douNoTsurugi", "kawaNoYoroi", "kawaNoTate"],
  },
};

SHOPS["ch2-minatos-shop"] = {
  id: "ch2-minatos-shop",
  name: "ミナトスの どうぐや",
  itemIds: [
    "yakusou",
    "anshinNoSuzu",
    "tetsuNoTsurugi",
    "kusariKatabira",
    "tetsuNoTate",
  ],
};

SHOPS["ch3-wakeera-shop"] = {
  id: "ch3-wakeera-shop",
  name: "ワケーラの どうぐや",
  itemIds: [
    "yakusou",
    "jouyakusou",
    "anshinNoSuzu",
    "hagaNeNoTsurugi",
    "sabakuNoRobe",
    "mikazukiNoTate",
  ],
};

SHOPS["ch3-caravan-shop"] = {
  id: "ch3-caravan-shop",
  name: "たいしょうの みせ",
  itemIds: ["yakusou", "jouyakusou", "tetsuNoTsurugi", "kusariKatabira"],
};

SHOPS["ch4-majoria-shop"] = {
  id: "ch4-majoria-shop",
  name: "メジャーリアの どうぐや",
  itemIds: [
    "jouyakusou",
    "kaifukuNoTama",
    "anshinNoSuzu",
    "kooriNoKen",
    "ginNoYoroi",
    "kagamiNoTate",
  ],
};

SHOPS["ch4-kogoe-shop"] = {
  id: "ch4-kogoe-shop",
  name: "コゴエの みせ",
  itemIds: ["yakusou", "jouyakusou", "hagaNeNoTsurugi", "sabakuNoRobe"],
};

SHOPS["ch5-percen-shop"] = {
  id: "ch5-percen-shop",
  name: "パーセンの どうぐや",
  itemIds: [
    "kaifukuNoTama",
    "seiNoShizuku",
    "anshinNoSuzu",
    "hikariNoKen",
    "maryokuNoRobe",
    "seiginoTate",
  ],
};

SHOPS["ch5-bargain-shop"] = {
  id: "ch5-bargain-shop",
  name: "バーゲンの おおやすうり",
  itemIds: ["jouyakusou", "kaifukuNoTama", "kooriNoKen", "ginNoYoroi", "kagamiNoTate"],
};

export function getItem(id: string): ItemDef | undefined {
  return ITEMS[id];
}
