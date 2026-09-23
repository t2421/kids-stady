/*
 * もちもの整理 (うる・すてる) の純ロジック。
 * 「たいせつなもの (メダル・かけら) は うれない・すてられない」が
 * いちばん大事な性質なので、実データ (ITEMS) で全数検査する。
 */

import { describe, expect, it } from "vitest";
import {
  canRelease,
  discardOne,
  inventoryRows,
  isKeepsake,
  sellOne,
  sellPrice,
} from "../src/lib/inventory";
import { ITEMS } from "../src/content/items";
import { defaultSave, type SaveData } from "../src/lib/save";

function withItems(items: Record<string, number>, gold = 100): SaveData {
  const save = defaultSave();
  return { ...save, inventory: { gold, items } };
}

describe("sellPrice", () => {
  it("is half the buy price, rounded down", () => {
    expect(sellPrice(ITEMS.yakusou)).toBe(4); /* 8G → 4G */
    expect(sellPrice(ITEMS.hinokiNoBou)).toBe(7); /* 15G → 7G (切りすて) */
  });

  it("is 0 for keepsakes, never a fraction elsewhere", () => {
    for (const item of Object.values(ITEMS)) {
      const price = sellPrice(item);
      expect(Number.isInteger(price), `${item.id} のうり値が整数でない`).toBe(true);
      expect(price, `${item.id} のうり値がマイナス`).toBeGreaterThanOrEqual(0);
      if (isKeepsake(item)) expect(price, `${item.id}`).toBe(0);
      else expect(price, `${item.id}`).toBeGreaterThan(0);
    }
  });
});

describe("keepsakes are protected", () => {
  /* ほうび (メダル) と 数晶のかけらは 進行に関わるので 手ばなせてはいけない */
  const protectedIds = [
    "hiramekiMedal",
    ...Object.keys(ITEMS).filter((id) => id.startsWith("kakera_")),
  ];

  it("covers the medal and every chapter's shard", () => {
    expect(protectedIds.length).toBeGreaterThan(1);
    for (const id of protectedIds) {
      expect(isKeepsake(ITEMS[id]), `${id} が たいせつなもの 扱いでない`).toBe(true);
    }
  });

  it("cannot be sold or discarded even when held", () => {
    for (const id of protectedIds) {
      const save = withItems({ [id]: 3 });
      expect(canRelease(save, id)).toBe(false);
      expect(sellOne(save, id)).toBeNull();
      expect(discardOne(save, id)).toBeNull();
    }
  });

  it("never appear in the shop's sell list", () => {
    const save = withItems({ yakusou: 1, hiramekiMedal: 2, kakera_1: 1 });
    const sellable = inventoryRows(save).filter((r) => !r.keepsake);
    expect(sellable.map((r) => r.id)).toEqual(["yakusou"]);
  });
});

describe("sellOne", () => {
  it("removes one and adds its sell price to the purse", () => {
    const r = sellOne(withItems({ yakusou: 2 }, 50), "yakusou")!;
    expect(r.gold).toBe(4);
    expect(r.save.inventory.gold).toBe(54);
    expect(r.save.inventory.items.yakusou).toBe(1);
  });

  it("drops the entry entirely when the last one is sold", () => {
    const r = sellOne(withItems({ yakusou: 1 }, 0), "yakusou")!;
    expect(r.save.inventory.items).toEqual({});
  });

  it("returns null when the item isn't held or doesn't exist", () => {
    expect(sellOne(withItems({}), "yakusou")).toBeNull();
    expect(sellOne(withItems({ nazono: 1 }), "nazono")).toBeNull();
  });

  it("does not mutate the original save", () => {
    const save = withItems({ yakusou: 2 }, 50);
    sellOne(save, "yakusou");
    expect(save.inventory).toEqual({ gold: 50, items: { yakusou: 2 } });
  });
});

describe("discardOne", () => {
  it("removes one without touching the purse", () => {
    const next = discardOne(withItems({ yakusou: 2 }, 50), "yakusou")!;
    expect(next.inventory.gold).toBe(50);
    expect(next.inventory.items.yakusou).toBe(1);
  });

  it("drops the entry entirely when the last one is discarded", () => {
    const next = discardOne(withItems({ hinokiNoBou: 1 }), "hinokiNoBou")!;
    expect(next.inventory.items).toEqual({});
  });

  it("does not mutate the original save", () => {
    const save = withItems({ yakusou: 1 });
    discardOne(save, "yakusou");
    expect(save.inventory.items).toEqual({ yakusou: 1 });
  });
});

describe("inventoryRows", () => {
  it("hides zero-count entries and keeps unknown ids as untouchable", () => {
    const save = withItems({ yakusou: 0, nazono: 1 });
    expect(inventoryRows(save)).toEqual([
      { id: "nazono", name: "nazono", count: 1, kind: "key", sell: 0, keepsake: true },
    ]);
  });
});
