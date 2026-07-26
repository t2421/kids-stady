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

export function getItem(id: string): ItemDef | undefined {
  return ITEMS[id];
}
