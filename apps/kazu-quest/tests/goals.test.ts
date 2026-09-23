/*
 * めあて と さきどり。小2 の子が 章3・章4 の単元を 先に まなんで
 * 物語を すすめられることを、セーブの状態から たしかめる。
 */

import { describe, expect, it } from "vitest";
import { defaultSave, type SaveData } from "../src/lib/save";
import { coreSkillsOf, firstToLearn, goalsView, isAheadSkill, referenceGrade } from "../src/lib/goals";
import { applySakidoriReward, sakidoriFlag } from "../src/lib/sakidori";

function withMastery(save: SaveData, ids: string[], state: "can" | "practicing" = "can"): SaveData {
  const mastery = { ...save.mastery };
  for (const id of ids) mastery[id] = { state, reviewDue: null, streak: 0, passedAt: null };
  return { ...save, mastery };
}

function secondGrader(chapter = 2): SaveData {
  const s = defaultSave();
  return {
    ...s,
    chapter: { current: chapter, cleared: [] },
    settings: { ...s.settings, schoolGrade: 2 },
  };
}

describe("coreSkillsOf", () => {
  it("returns the three gate units of every story chapter", () => {
    for (const c of [1, 2, 3, 4, 5, 6]) expect(coreSkillsOf(c), `章${c}`).toHaveLength(3);
    expect(coreSkillsOf(3).sort()).toEqual(["g3_div", "g3_div_remainder", "g3_fraction"]);
  });
});

describe("referenceGrade / isAheadSkill", () => {
  it("uses the school grade, or the story chapter when the grade is unknown", () => {
    expect(referenceGrade(secondGrader(4))).toBe(2);
    const unknown = { ...defaultSave(), chapter: { current: 3, cleared: [] } };
    expect(referenceGrade(unknown)).toBe(3);
    expect(isAheadSkill(secondGrader(), "g3_div")).toBe(true);
    expect(isAheadSkill(secondGrader(), "g2_kuku")).toBe(false);
  });
});

describe("goalsView", () => {
  it("shows the current gate and the next chapter as さきどり", () => {
    const view = goalsView(secondGrader(2));
    expect(view.current.chapter).toBe(2);
    expect(view.current.done).toBe(false);
    expect(view.ahead?.chapter).toBe(3);
    expect(view.ahead?.units.every((u) => u.ahead)).toBe(true);
  });

  it("climbs the ladder: once chapter 3 units are learned, さきどり moves to chapter 4", () => {
    const s = withMastery(secondGrader(2), [...coreSkillsOf(2), ...coreSkillsOf(3)]);
    const view = goalsView(s);
    expect(view.current.done).toBe(true);
    expect(view.ahead?.chapter).toBe(4);
    expect(view.reachedGrade).toBe(3);
  });

  it("counts さきどり stars only for units above the school grade", () => {
    const s = withMastery(secondGrader(2), ["g2_kuku", "g3_div", "g4_angle"]);
    expect(goalsView(s).aheadStars).toBe(2);
  });

  it("points a not-yet-ready unit at the prerequisite to learn first", () => {
    const view = goalsView(secondGrader(2));
    const div = view.ahead!.units.find((u) => u.skillId === "g3_div")!;
    if (!div.ready) {
      expect(div.needsFirst).not.toBeNull();
      expect(firstToLearn(secondGrader(2), "g3_div")).toBe(div.needsFirst);
    }
    const ready = withMastery(secondGrader(2), ["g2_kuku", "g1_add_carry", "g1_sub_borrow", "g1_count"]);
    const divReady = goalsView(ready).ahead!.units.find((u) => u.skillId === "g3_div")!;
    expect(divReady.needsFirst === null || divReady.ready === false).toBe(true);
  });
});

describe("applySakidoriReward", () => {
  it("rewards an above-grade unit once, with gold scaled by grade", () => {
    const s = withMastery(secondGrader(), ["g3_div"]);
    const r = applySakidoriReward(s, "g3_div")!;
    expect(r.reward.gold).toBe(120);
    expect(r.reward.stars).toBe(1);
    expect(r.save.inventory.gold).toBe(s.inventory.gold + 120);
    expect(r.save.flags[sakidoriFlag("g3_div")]).toBe(true);
    /* 2回目は なにも もらえない */
    expect(applySakidoriReward(r.save, "g3_div")).toBeNull();
  });

  it("does nothing for on-grade units or units not yet learned", () => {
    expect(applySakidoriReward(withMastery(secondGrader(), ["g2_kuku"]), "g2_kuku")).toBeNull();
    expect(applySakidoriReward(withMastery(secondGrader(), ["g3_div"], "practicing"), "g3_div")).toBeNull();
  });

  it("suggests the next さきどり unit", () => {
    const r = applySakidoriReward(withMastery(secondGrader(), ["g3_div"]), "g3_div")!;
    expect(r.reward.nextLabel).not.toBeNull();
  });
});

import { learnSpellsForSkill } from "../src/lib/learnSpell";
import { SPELLS } from "../src/content/spells";

describe("learnSpellsForSkill", () => {
  it("teaches the unit's spell wherever the lesson was passed (めあて too)", () => {
    const expected = Object.values(SPELLS)
      .filter((s) => s.learnTest.skillIds[0] === "g3_div")
      .map((s) => s.id);
    expect(expected.length).toBeGreaterThan(0);
    const r = learnSpellsForSkill(secondGrader(), "g3_div");
    expect(r.spellIds).toEqual(expected);
    const hero = r.save.party.find((m) => m.memberId === "hero")!;
    for (const id of expected) {
      expect(hero.learnedSpells).toContain(id);
      expect(r.save.flags[`learned.${id}`]).toBe(true);
    }
    /* 2回目は なにも ふえない */
    expect(learnSpellsForSkill(r.save, "g3_div").spellIds).toEqual([]);
  });
});
