/* 章 → 出題プール (questionGrades) の解決と、おだい一覧への接続 */

import { describe, expect, it } from "vitest";
import type { ChapterDef } from "../src/content/types";
import { CHAPTERS } from "../src/content/chapters";
import { SKILLS } from "../src/lib/curriculum";
import { chapterQuestionGrades, skillIdsForGrades } from "../src/lib/curriculum/gradePool";
import { questsForChapter, questsForGrade, questsForGrades } from "../src/lib/curriculum/drills";

function fakeChapter(overrides: Partial<ChapterDef>): ChapterDef {
  return {
    id: 99,
    grade: 1,
    title: "テスト章",
    implemented: true,
    startMap: "none",
    startSpawn: "start",
    maps: [],
    encounterTables: [],
    spellIds: [],
    attackSkillIds: [],
    flags: {},
    clearFlag: "c99.clear",
    ...overrides,
  };
}

describe("chapterQuestionGrades", () => {
  it("defaults to the chapter's own grade", () => {
    expect(chapterQuestionGrades(fakeChapter({ grade: 3 }))).toEqual([3]);
  });

  it("uses questionGrades when set, dropping duplicates", () => {
    expect(chapterQuestionGrades(fakeChapter({ grade: 6, questionGrades: [1, 2, 2] }))).toEqual([1, 2]);
  });

  it("chapters without questionGrades resolve to exactly their own grade (behaviour unchanged)", () => {
    const plain = CHAPTERS.filter((c) => c.questionGrades === undefined);
    expect(plain.map((c) => c.id)).toEqual([1, 2, 3, 4, 5, 6]);
    for (const chapter of plain) {
      expect(chapterQuestionGrades(chapter)).toEqual([chapter.grade]);
    }
  });

  it("the final chapter (ムゲンのらせん) mixes every grade 1..6", () => {
    const ch7 = CHAPTERS.find((c) => c.id === 7);
    expect(ch7).toBeDefined();
    expect(chapterQuestionGrades(ch7!)).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe("skillIdsForGrades", () => {
  it("returns every implemented skill of the requested grades", () => {
    const ids = skillIdsForGrades([1, 2]);
    const expected = SKILLS.filter((s) => s.implemented && (s.grade === 1 || s.grade === 2)).map(
      (s) => s.id,
    );
    expect(ids).toEqual(expected);
    expect(ids).toContain("g1_add_nc");
    expect(ids).toContain("g2_kuku");
    expect(ids).not.toContain("g3_div");
  });

  it("returns nothing for grades without skills", () => {
    expect(skillIdsForGrades([0, 7])).toEqual([]);
    expect(skillIdsForGrades([])).toEqual([]);
  });
});

describe("questsForChapter", () => {
  it("a chapter with questionGrades [1, 2] offers drills from both grades", () => {
    const quests = questsForChapter(fakeChapter({ grade: 1, questionGrades: [1, 2] }));
    const grades = new Set(quests.map((q) => q.grade));
    expect(grades).toEqual(new Set([1, 2]));
    expect(quests.map((q) => q.skillId)).toContain("g1_add_nc");
    expect(quests.map((q) => q.skillId)).toContain("g2_kuku");
    expect(quests).toEqual([...questsForGrade(1), ...questsForGrade(2)]);
  });

  it("a chapter without questionGrades offers only its own grade", () => {
    const quests = questsForChapter(fakeChapter({ grade: 2 }));
    expect(quests.length).toBeGreaterThan(0);
    expect(quests.every((q) => q.grade === 2)).toBe(true);
    expect(quests).toEqual(questsForGrade(2));
  });

  it("questsForGrades sorts by grade and ignores duplicate grades", () => {
    expect(questsForGrades([2, 1, 2])).toEqual([...questsForGrade(1), ...questsForGrade(2)]);
  });
});
