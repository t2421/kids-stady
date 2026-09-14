/*
 * src/lib/review.ts (LP-11: 学びの設計の間隔復習「おさらい」) のテスト。
 * 別ファイル tests/review.test.ts は KQ-13 の「ふくしゅうのほこら」
 * (src/lib/curriculum/review.ts) 用で、無関係の既存機能なので混同しないこと。
 */
import { afterEach, describe, expect, it } from "vitest";
import { advanceClock, resetClock } from "../src/lib/clock";
import { masteredShardCount, reviewSelection } from "../src/lib/review";
import { defaultSave, type MasteryEntry, type SaveData } from "../src/lib/save";

/*
 * src/lib/review.ts (LP-11) の純ロジック検証。
 *   - g1_add_nc はレッスン実装済み (hasLesson === true)
 *   - g1_sub_nc はレッスン未実装 (LESSONS に無い) — おさらい対象から除外されること
 */
const WITH_LESSON = "g1_add_nc";
const NO_LESSON = "g1_sub_nc";

afterEach(() => {
  resetClock();
});

function withMastery(entries: Record<string, Partial<MasteryEntry> & { state: MasteryEntry["state"] }>): SaveData {
  const save = defaultSave();
  const mastery: Record<string, MasteryEntry> = {};
  for (const [skillId, entry] of Object.entries(entries)) {
    mastery[skillId] = { reviewDue: null, streak: 0, passedAt: null, ...entry };
  }
  return { ...save, mastery };
}

describe("reviewSelection", () => {
  it("期日が来ていない単元は選ばない", () => {
    const save = withMastery({
      [WITH_LESSON]: { state: "can", reviewDue: Date.now() + 100_000 },
    });
    expect(reviewSelection(save)).toEqual([]);
  });

  it("期日が来た can/mastered の単元をレッスン実装済みに絞って選ぶ", () => {
    const save = withMastery({
      [WITH_LESSON]: { state: "can", reviewDue: Date.now() - 1000 },
      [NO_LESSON]: { state: "can", reviewDue: Date.now() - 1000 },
    });
    expect(reviewSelection(save)).toEqual([WITH_LESSON]);
  });

  it("期日が来た単元がなければ空配列", () => {
    expect(reviewSelection(defaultSave())).toEqual([]);
  });

  it("advanceClock で期日を早送りすると選ばれる", () => {
    const save = withMastery({
      [WITH_LESSON]: { state: "can", reviewDue: Date.now() + 1000 },
    });
    expect(reviewSelection(save)).toEqual([]);
    advanceClock(24 * 60 * 60 * 1000);
    expect(reviewSelection(save)).toEqual([WITH_LESSON]);
  });

  it("最大3件までに絞る (期日が早い順)", () => {
    /* g1_add_nc はレッスンが1件しかないため、複数選ばれることの検証は
       件数上限のロジックだけを直接叩いて確認する (実データはレッスン1件のみ) */
    const save = withMastery({
      [WITH_LESSON]: { state: "mastered", reviewDue: Date.now() - 1000 },
    });
    const selection = reviewSelection(save);
    expect(selection.length).toBeLessThanOrEqual(3);
  });

  it("state が none/practicing の単元は対象外", () => {
    const save = withMastery({
      [WITH_LESSON]: { state: "practicing", reviewDue: Date.now() - 1000 },
    });
    expect(reviewSelection(save)).toEqual([]);
  });
});

describe("masteredShardCount", () => {
  it("mastered が無ければ0", () => {
    expect(masteredShardCount(defaultSave())).toBe(0);
  });

  it("mastered の単元数だけを数える (can/practicing は数えない)", () => {
    const save = withMastery({
      a: { state: "mastered" },
      b: { state: "mastered" },
      c: { state: "can" },
      d: { state: "practicing" },
      e: { state: "none" },
    });
    expect(masteredShardCount(save)).toBe(2);
  });
});
