import { describe, expect, it } from "vitest";
import { buildStatusSections } from "../src/game/field/statusSections";
import { defaultSave } from "../src/lib/save";

describe("buildStatusSections", () => {
  it("builds 3 sections with level/gold and empty-state hints", () => {
    const sections = buildStatusSections(defaultSave())!;
    expect(sections).toHaveLength(3);
    expect(sections[0].title).toBe("つよさ");
    expect(sections[0].body).toContain("レベル 1");
    expect(sections[0].body).toContain("HP 25/25");
    expect(sections[1].body).toContain("まだ おぼえていない");
    expect(sections[2].body).toContain("なにも もっていない");
  });

  it("lists learned spells and items", () => {
    const save = defaultSave();
    const rich = {
      ...save,
      party: [{ ...save.party[0], learnedSpells: ["hikidama", "tashiria"] }],
      inventory: { gold: 120, items: { yakusou: 2 } },
    };
    const sections = buildStatusSections(rich)!;
    expect(sections[0].body).toContain("120G");
    expect(sections[1].body).toContain("ヒキダマ");
    expect(sections[1].body).toContain("タシリア");
    expect(sections[2].body).toContain("やくそう ×2");
  });

  it("returns null without a hero", () => {
    expect(buildStatusSections({ ...defaultSave(), party: [] })).toBeNull();
  });
});
