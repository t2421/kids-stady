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
    expect(data.spells).toEqual([]);
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
    /* 1人パーティでは呪文に もちぬしを付けない */
    expect(data.spells.some((s) => s.startsWith("ヒキダマ MP"))).toBe(true);
    expect(data.spells.some((s) => s.includes("("))).toBe(false);
    expect(data.items).toEqual(["やくそう ×2"]);
  });

  it("labels spell owners in a multi-member party", () => {
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
    expect(data.spells.some((s) => s.includes("(ゆうしゃ)"))).toBe(true);
    expect(data.spells.some((s) => s.includes("(タスク)"))).toBe(true);
  });

  it("returns null without a hero", () => {
    expect(buildStatusData({ ...defaultSave(), party: [] })).toBeNull();
  });
});
