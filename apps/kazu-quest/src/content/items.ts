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

export function getItem(id: string): ItemDef | undefined {
  return ITEMS[id];
}
