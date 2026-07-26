/* おだいクエスト (ドリル依頼) のデータとゴールド計算 */

import { describe, expect, it } from "vitest";
import {
  DRILL_QUESTIONS,
  drillReward,
  getDrillQuest,
  goldPerCorrect,
  questsForGrade,
} from "../src/lib/curriculum/drills";
import { isImplemented } from "../src/lib/curriculum";

describe("questsForGrade", () => {
  it("grade 1 and 2 each expose all implemented skills as quests", () => {
    for (const grade of [1, 2]) {
      const quests = questsForGrade(grade);
      expect(quests.length).toBeGreaterThanOrEqual(6);
      for (const q of quests) {
        expect(q.grade).toBe(grade);
        expect(isImplemented(q.skillId)).toBe(true);
        expect(q.questions).toBe(DRILL_QUESTIONS);
        expect(q.stars).toBeGreaterThanOrEqual(1);
        expect(q.stars).toBeLessThanOrEqual(3);
      }
    }
  });

  it("quests are sorted easiest first", () => {
    for (const grade of [1, 2]) {
      const stars = questsForGrade(grade).map((q) => q.stars);
      expect([...stars].sort((a, b) => a - b)).toEqual(stars);
    }
  });

  it("unimplemented grades have no quests", () => {
    expect(questsForGrade(3)).toEqual([]);
    expect(questsForGrade(6)).toEqual([]);
  });
});

describe("goldPerCorrect", () => {
  it("more stars pay more within a grade", () => {
    expect(goldPerCorrect(1, 2)).toBeGreaterThan(goldPerCorrect(1, 1));
    expect(goldPerCorrect(2, 3)).toBeGreaterThan(goldPerCorrect(2, 2));
  });

  it("higher grades pay more at equal stars", () => {
    expect(goldPerCorrect(2, 2)).toBeGreaterThan(goldPerCorrect(1, 2));
    expect(goldPerCorrect(6, 1)).toBeGreaterThan(goldPerCorrect(1, 3));
  });

  it("every quest carries its own per-correct rate and perfect bonus", () => {
    for (const q of [...questsForGrade(1), ...questsForGrade(2)]) {
      expect(q.goldPerCorrect).toBe(goldPerCorrect(q.grade, q.stars));
      expect(q.perfectBonus).toBe(q.goldPerCorrect * 5);
    }
  });
});

describe("drillReward", () => {
  const quest = { questions: 10, goldPerCorrect: 5, perfectBonus: 25 };

  it("pays per correct answer", () => {
    expect(drillReward(quest, 7)).toEqual({ gold: 35, perfect: false });
  });

  it("adds the bonus on a perfect run", () => {
    expect(drillReward(quest, 10)).toEqual({ gold: 75, perfect: true });
  });

  it("pays nothing for zero correct", () => {
    expect(drillReward(quest, 0)).toEqual({ gold: 0, perfect: false });
  });
});

describe("getDrillQuest", () => {
  it("finds a quest by skill id", () => {
    const q = getDrillQuest("g2_kuku");
    expect(q?.grade).toBe(2);
    expect(q?.stars).toBe(2);
  });

  it("returns undefined for unknown or unimplemented skills", () => {
    expect(getDrillQuest("nope")).toBeUndefined();
    expect(getDrillQuest("g3_div")).toBeUndefined();
  });
});
