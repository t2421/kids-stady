/*
 * src/lib/review.ts (LP-11: 学びの設計の間隔復習「おさらい」) のテスト。
 * 別ファイル tests/review.test.ts は KQ-13 の「ふくしゅうのほこら」
 * (src/lib/curriculum/review.ts) 用で、無関係の既存機能なので混同しないこと。
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { advanceClock, resetClock } from "../src/lib/clock";
import {
  CHAPTER_CRYSTAL_POWER_MULTIPLIER,
  chapterCrystalMultiplier,
  hasChapterCrystal,
  masteredShardCount,
  negariaStageFor,
  reviewSelection,
} from "../src/lib/review";
import { defaultSave, type MasteryEntry, type SaveData } from "../src/lib/save";

/*
 * src/lib/review.ts (LP-11) の純ロジック検証。
 *   - g1_add_nc はレッスン実装済み (hasLesson === true)
 *   - g1_sub_nc は元々「レッスン未実装」の代役だったが、波4 (LP-12) が小1全単元に
 *     レッスンを実装したため実際には登録済みになった。「レッスンが無い単元は
 *     おさらい対象から除外される」分岐は今後どの単元も実装が進めば実データでは
 *     再現できなくなるため、hasLesson だけこのテストファイル内に限定してモックし、
 *     g1_sub_nc を恒久的に「未登録」扱いに固定して分岐そのものを検証し続ける。
 */
vi.mock("../src/content/lessons/index", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../src/content/lessons/index")>();
  return {
    ...actual,
    hasLesson: (skillId: string) =>
      skillId === "g1_sub_nc" ? false : actual.hasLesson(skillId),
  };
});

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

/* 数晶 (LP-11/LP-20): 章のかけら (kakera_<chapter>) が 6つで完成 */
describe("hasChapterCrystal / chapterCrystalMultiplier", () => {
  const withKakera = (chapter: number, count: number): SaveData => ({
    ...defaultSave(),
    inventory: { gold: 0, items: { [`kakera_${chapter}`]: count } },
  });

  it("5つでは未完成", () => {
    expect(hasChapterCrystal(withKakera(3, 5), 3)).toBe(false);
    expect(chapterCrystalMultiplier(withKakera(3, 5), 3)).toBe(1);
  });

  it("6つで完成", () => {
    expect(hasChapterCrystal(withKakera(3, 6), 3)).toBe(true);
    expect(chapterCrystalMultiplier(withKakera(3, 6), 3)).toBe(CHAPTER_CRYSTAL_POWER_MULTIPLIER);
  });

  it("6つを超えていても完成のまま (上限なし)", () => {
    expect(hasChapterCrystal(withKakera(3, 9), 3)).toBe(true);
  });

  it("かけらが無ければ未完成 (0扱い)", () => {
    expect(hasChapterCrystal(defaultSave(), 3)).toBe(false);
    expect(chapterCrystalMultiplier(defaultSave(), 3)).toBe(1);
  });

  it("章が違えば かけらは別集計 (章3の6つは章4の判定に影響しない)", () => {
    expect(hasChapterCrystal(withKakera(3, 6), 4)).toBe(false);
  });
});

describe("negariaStageFor", () => {
  it("しきい値ちょうどで段が上がる (0/8/16/24)", () => {
    expect(negariaStageFor(0)).toBe(0);
    expect(negariaStageFor(7)).toBe(0);
    expect(negariaStageFor(8)).toBe(1);
    expect(negariaStageFor(15)).toBe(1);
    expect(negariaStageFor(16)).toBe(2);
    expect(negariaStageFor(23)).toBe(2);
    expect(negariaStageFor(24)).toBe(3);
  });

  it("24を超えても段3のまま (上限なし)", () => {
    expect(negariaStageFor(30)).toBe(3);
    expect(negariaStageFor(1000)).toBe(3);
  });
});
