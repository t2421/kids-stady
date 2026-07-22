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
};

export const SHOPS: Record<string, ShopDef> = {
  "ch1-capital-shop": {
    id: "ch1-capital-shop",
    name: "カズールの どうぐや",
    itemIds: ["yakusou", "anshinNoSuzu"],
  },
  "ch1-morikage-shop": {
    id: "ch1-morikage-shop",
    name: "モリカゲの どうぐや",
    itemIds: ["yakusou"],
  },
};

export function getItem(id: string): ItemDef | undefined {
  return ITEMS[id];
}
