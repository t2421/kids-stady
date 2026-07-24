import { describe, expect, it } from "vitest";
import {
  equipItem,
  equipmentBonus,
  equippedStats,
  unequipSlot,
} from "../src/lib/battle/equipment";
import { heroStats } from "../src/lib/battle/stats";
import { makeMemberCombatant } from "../src/lib/battle/battle";
import type { PartyMember, SaveData } from "../src/lib/save";
import { defaultSave, normalizeSave } from "../src/lib/save";

function heroWith(save: SaveData): PartyMember {
  return save.party.find((m) => m.memberId === "hero")!;
}

function saveWithItems(items: Record<string, number>): SaveData {
  const d = defaultSave();
  return { ...d, inventory: { ...d.inventory, items } };
}

describe("equipmentBonus", () => {
  it("sums atk/def across slots and ignores unknown ids", () => {
    expect(
      equipmentBonus({ weapon: "douNoTsurugi", armor: "kawaNoYoroi", shield: "nazo" }),
    ).toEqual({ atk: 5, def: 4 });
    expect(equipmentBonus({})).toEqual({ atk: 0, def: 0 });
  });
});

describe("equipItem / unequipSlot", () => {
  it("moves the item from inventory into the slot", () => {
    const save = saveWithItems({ douNoTsurugi: 1 });
    const next = equipItem(save, "hero", "douNoTsurugi")!;
    expect(next).not.toBeNull();
    expect(heroWith(next).equipment.weapon).toBe("douNoTsurugi");
    expect(next.inventory.items.douNoTsurugi).toBeUndefined();
  });

  it("swapping returns the previous equipment to the inventory", () => {
    let save = saveWithItems({ hinokiNoBou: 1, douNoTsurugi: 1 });
    save = equipItem(save, "hero", "hinokiNoBou")!;
    save = equipItem(save, "hero", "douNoTsurugi")!;
    expect(heroWith(save).equipment.weapon).toBe("douNoTsurugi");
    expect(save.inventory.items.hinokiNoBou).toBe(1);
    expect(save.inventory.items.douNoTsurugi).toBeUndefined();
  });

  it("rejects items that are not owned or not equipment", () => {
    expect(equipItem(saveWithItems({}), "hero", "douNoTsurugi")).toBeNull();
    expect(equipItem(saveWithItems({ yakusou: 2 }), "hero", "yakusou")).toBeNull();
  });

  it("unequipSlot returns the item to inventory; null when slot empty", () => {
    let save = saveWithItems({ kawaNoTate: 1 });
    save = equipItem(save, "hero", "kawaNoTate")!;
    const next = unequipSlot(save, "hero", "shield")!;
    expect(heroWith(next).equipment.shield).toBeUndefined();
    expect(next.inventory.items.kawaNoTate).toBe(1);
    expect(unequipSlot(next, "hero", "shield")).toBeNull();
  });
});

describe("equippedStats & battle integration", () => {
  it("adds equipment bonuses to derived atk/def only", () => {
    const hero: PartyMember = {
      ...heroWith(defaultSave()),
      equipment: { weapon: "douNoTsurugi", armor: "kawaNoYoroi", shield: "kawaNoTate" },
    };
    const base = heroStats(hero.level);
    const stats = equippedStats(hero);
    expect(stats.atk).toBe(base.atk + 5);
    expect(stats.def).toBe(base.def + 6);
    expect(stats.maxHp).toBe(base.maxHp);
    expect(stats.agi).toBe(base.agi);
  });

  it("battle combatants use equipped stats", () => {
    const hero: PartyMember = {
      ...heroWith(defaultSave()),
      equipment: { weapon: "douNoTsurugi" },
    };
    const combatant = makeMemberCombatant(hero);
    expect(combatant.atk).toBe(heroStats(hero.level).atk + 5);
  });
});

describe("save normalization", () => {
  it("keeps valid equipment and drops junk values", () => {
    const raw = defaultSave() as unknown as {
      party: Record<string, unknown>[];
    };
    raw.party[0].equipment = { weapon: "douNoTsurugi", armor: 42, sock: "x" };
    const normalized = normalizeSave(raw);
    expect(heroWith(normalized).equipment).toEqual({ weapon: "douNoTsurugi" });
  });

  it("old saves without equipment default to empty", () => {
    const raw = defaultSave() as unknown as { party: Record<string, unknown>[] };
    delete raw.party[0].equipment;
    expect(heroWith(normalizeSave(raw)).equipment).toEqual({});
  });
});
