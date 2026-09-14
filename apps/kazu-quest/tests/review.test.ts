/* ふくしゅうのほこら: 弱点スキル選定と ほうび (KQ-13) */

import { describe, expect, it } from "vitest";
import type { ChapterDef } from "../src/content/types";
import type { SkillStat } from "../src/lib/save";
import { CHAPTERS, getChapter } from "../src/content/chapters";
import { skillIdsForGrades } from "../src/lib/curriculum/gradePool";
import { getDrillQuest } from "../src/lib/curriculum/drills";
import {
  REVIEW_PASS_CORRECT,
  REVIEW_QUESTIONS,
  reviewCandidateIds,
  reviewGoldPerCorrect,
  reviewReward,
  reviewSkillIds,
  weakSkillIds,
} from "../src/lib/curriculum/review";

const stat = (c: number, w: number): SkillStat => ({ c, w, recentMs: [] });

describe("weakSkillIds", () => {
  const candidates = ["a", "b", "c", "d", "e"];

  it("picks the lowest-accuracy skills among those with enough attempts", () => {
    const stats = {
      a: stat(9, 1), // 90%
      b: stat(2, 8), // 20%
      c: stat(5, 5), // 50%
      d: stat(1, 4), // 20%, fewer attempts than b
      e: stat(0, 10), // 0%
    };
    expect(weakSkillIds(stats, candidates)).toEqual(["e", "b", "d"]);
  });

  it("ignores skills below the minimum attempts", () => {
    const stats = { a: stat(0, 4), b: stat(9, 1), c: stat(2, 3) };
    /* a は 4回 (< 5) なので弱点扱いにならず、埋め合わせとして先頭から入る */
    expect(weakSkillIds(stats, candidates, 5, 2)).toEqual(["c", "b"]);
  });

  it("fills from candidates in order when fewer than limit qualify", () => {
    const stats = { d: stat(1, 9) };
    expect(weakSkillIds(stats, candidates)).toEqual(["d", "a", "b"]);
  });

  it("fills entirely from candidates when there are no stats", () => {
    expect(weakSkillIds({}, candidates)).toEqual(["a", "b", "c"]);
  });

  it("only considers candidate ids and de-duplicates them", () => {
    const stats = { zzz: stat(0, 20), a: stat(0, 9) };
    expect(weakSkillIds(stats, ["a", "a", "b"], 5, 3)).toEqual(["a", "b"]);
  });

  it("returns fewer than limit when candidates run out", () => {
    expect(weakSkillIds({}, ["a"], 5, 3)).toEqual(["a"]);
    expect(weakSkillIds({}, [], 5, 3)).toEqual([]);
  });
});

describe("reviewCandidateIds", () => {
  it("puts the chapter's attack skills first, then implemented skills up to its grade", () => {
    const ch1 = getChapter(1)!;
    const ids = reviewCandidateIds(ch1);
    expect(ids.slice(0, ch1.attackSkillIds.length)).toEqual(ch1.attackSkillIds);
    expect(new Set(ids)).toEqual(new Set([...ch1.attackSkillIds, ...skillIdsForGrades([1])]));
  });

  it("includes lower grades for later chapters and never higher ones", () => {
    const ch3 = getChapter(3)!;
    const ids = reviewCandidateIds(ch3);
    for (const id of skillIdsForGrades([1, 2, 3])) expect(ids).toContain(id);
    for (const id of skillIdsForGrades([4, 5, 6])) expect(ids).not.toContain(id);
  });

  it("falls back to all grades without a chapter", () => {
    expect(reviewCandidateIds(undefined)).toEqual(skillIdsForGrades([1, 2, 3, 4, 5, 6]));
  });

  it("every chapter yields at least 3 candidates (so a shrine always has 10 questions)", () => {
    for (const chapter of CHAPTERS) {
      expect(reviewSkillIds({}, chapter).length, `第${chapter.id}章`).toBe(3);
    }
  });
});

describe("reviewSkillIds", () => {
  it("prefers weak skills from stats over the attack-skill fill", () => {
    const ch1 = getChapter(1) as ChapterDef;
    const stats = { g1_sub_borrow: stat(1, 9) };
    const ids = reviewSkillIds(stats, ch1);
    expect(ids[0]).toBe("g1_sub_borrow");
    expect(ids.slice(1)).toEqual(ch1.attackSkillIds.slice(0, 2));
  });
});

describe("reviewReward", () => {
  it("uses the highest おだい rate among the review skills", () => {
    /* g1_count=1G, g1_sub_borrow=3G → 3G */
    expect(reviewGoldPerCorrect(["g1_count", "g1_sub_borrow"])).toBe(
      getDrillQuest("g1_sub_borrow")!.goldPerCorrect,
    );
    expect(reviewReward(["g1_count", "g1_sub_borrow"], 7)).toEqual({
      gold: 7 * 3,
      medal: false,
    });
  });

  it("falls back to a flat rate for skills without a おだい", () => {
    expect(reviewGoldPerCorrect(["nope"])).toBe(5);
    expect(reviewReward([], 2).gold).toBe(10);
  });

  it("awards the medal at the pass line and never for negative counts", () => {
    expect(REVIEW_PASS_CORRECT).toBeLessThanOrEqual(REVIEW_QUESTIONS);
    expect(reviewReward(["g1_count"], REVIEW_PASS_CORRECT).medal).toBe(true);
    expect(reviewReward(["g1_count"], REVIEW_PASS_CORRECT - 1).medal).toBe(false);
    expect(reviewReward(["g1_count"], REVIEW_QUESTIONS).medal).toBe(true);
    expect(reviewReward(["g1_count"], -1)).toEqual({ gold: 0, medal: false });
  });
});
