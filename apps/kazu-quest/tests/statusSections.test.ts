import { describe, expect, it } from "vitest";
import { buildStatusData } from "../src/game/field/statusSections";
import { defaultSave } from "../src/lib/save";

describe("buildStatusData", () => {
  it("builds member stats with equipment slots and empty lists", () => {
    const data = buildStatusData(defaultSave())!;
    expect(data.members).toHaveLength(1);
    const hero = data.members[0];
    expect(hero.level).toBe(1);
    expect(hero.hp).toBe(25);
    expect(hero.maxHp).toBe(25);
    expect(hero.equipment.map((e) => e.label)).toEqual(["ぶき", "よろい", "たて"]);
    expect(hero.equipment.every((e) => e.name === "なし")).toBe(true);
    expect(hero.spells).toEqual([]);
    expect(data.items).toEqual([]);
  });

  it("lists spells with MP cost, items with counts, and applies equip bonuses", () => {
    const save = defaultSave();
    const rich = {
      ...save,
      party: [
        {
          ...save.party[0],
          learnedSpells: ["hikidama", "tashiria"],
          equipment: { weapon: "douNoTsurugi" as const },
        },
      ],
      inventory: { gold: 120, items: { yakusou: 2 } },
    };
    const data = buildStatusData(rich)!;
    expect(data.gold).toBe(120);
    /* Lv1 atk 6 + どうのつるぎ +5 = 11 */
    expect(data.members[0].atk).toBe(11);
    expect(data.members[0].equipment[0]).toEqual({
      label: "ぶき",
      name: "どうのつるぎ",
    });
    expect(data.members[0].spells.some((s) => s.startsWith("ヒキダマ MP"))).toBe(
      true,
    );
    expect(data.items).toEqual(["やくそう ×2"]);
  });

  it("keeps spells per member in a multi-member party", () => {
    const save = defaultSave();
    const party = {
      ...save,
      party: [
        { ...save.party[0], learnedSpells: ["hikidama"] },
        {
          ...save.party[0],
          memberId: "tasuku",
          learnedSpells: ["tashiria"],
        },
      ],
    };
    const data = buildStatusData(party)!;
    expect(data.members).toHaveLength(2);
    expect(data.members[0].name).toBe("ゆうしゃ");
    expect(data.members[0].spells).toEqual(["ヒキダマ MP2"]);
    expect(data.members[1].name).toBe("タスク");
    expect(data.members[1].spells).toEqual(["タシリア MP2"]);
  });

  it("returns null without a hero", () => {
    expect(buildStatusData({ ...defaultSave(), party: [] })).toBeNull();
  });
});
