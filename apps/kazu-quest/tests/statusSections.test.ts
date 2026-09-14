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
    expect(data.playtime).toBe("0ふん");
  });

  it("formats playtimeMs for the つよさ tab", () => {
    const save = { ...defaultSave(), playtimeMs: 65 * 60_000 };
    expect(buildStatusData(save)!.playtime).toBe("1じかん 5ふん");
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
    expect(data.members[0].spells.map((s) => [s.name, s.mpCost, s.kind])).toEqual([
      ["ヒキダマ", 2, "attack"],
      ["タシリア", 2, "heal"],
    ]);
    expect(data.items).toEqual([{ id: "yakusou", name: "やくそう", count: 2, kind: "heal" }]);
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
    expect(data.members[0].memberId).toBe("hero");
    expect(data.members[0].spells.map((s) => s.id)).toEqual(["hikidama"]);
    expect(data.members[1].name).toBe("タスク");
    expect(data.members[1].memberId).toBe("tasuku");
    expect(data.members[1].spells.map((s) => s.id)).toEqual(["tashiria"]);
  });

  it("returns null without a hero", () => {
    expect(buildStatusData({ ...defaultSave(), party: [] })).toBeNull();
  });
});

describe("buildStatusData × mistakes (ノートタブ)", () => {
  it("新しい順のまま単元ラベルを付けて返す", () => {
    const save = {
      ...defaultSave(),
      mistakes: [
        { ts: 2, skillId: "g1_count", text: "いくつ?", answer: "3", chosen: "", explain: ["かぞえる"] },
        { ts: 1, skillId: "nope", text: "1+1", answer: "2", chosen: "3", explain: [] },
      ],
    };
    const rows = buildStatusData(save)!.mistakes;
    expect(rows.map((r) => r.ts)).toEqual([2, 1]);
    expect(rows[0].skill).not.toBe("g1_count");
    expect(rows[0].chosen).toBe("");
    expect(rows[0].explain).toEqual(["かぞえる"]);
    expect(rows[1].skill).toBe("nope");
  });

  it("空なら空", () => {
    expect(buildStatusData(defaultSave())!.mistakes).toEqual([]);
  });
});
