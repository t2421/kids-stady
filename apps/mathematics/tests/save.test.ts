import { beforeEach, describe, expect, it } from "vitest";
import { installLocalStorage } from "./localStorageMock";
import {
  HISTORY_LIMIT,
  RECENT_MS_LIMIT,
  addHistory,
  defaultSave,
  isOutputUnlocked,
  loadSave,
  markOutputCleared,
  normalizeSave,
  persistSave,
  recordAnswer,
  removeSave,
  setLessonMedal,
} from "../src/lib/save";
import type { HistoryEntry } from "../src/lib/save";

function entry(over: Partial<HistoryEntry> = {}): HistoryEntry {
  return {
    ts: 1752900000000,
    grade: 1,
    mode: "output",
    stageName: "1ねんせいの ほし",
    correct: 8,
    wrong: 2,
    accuracy: 80,
    avgAnswerMs: 4200,
    score: 1200,
    ...over,
  };
}

describe("save: 永続化と正規化", () => {
  beforeEach(() => installLocalStorage());

  it("未保存プロフィールはデフォルトを返す", () => {
    expect(loadSave("pnew")).toEqual(defaultSave());
  });

  it("保存→読込→削除のラウンドトリップ", () => {
    let s = defaultSave();
    s = recordAnswer(s, "g1_add_nc", true, 3000);
    persistSave("p1", s);
    expect(loadSave("p1").totalCorrect).toBe(1);
    removeSave("p1");
    expect(loadSave("p1")).toEqual(defaultSave());
  });

  it("壊れたデータはデフォルトに正規化される", () => {
    expect(normalizeSave(null)).toEqual(defaultSave());
    expect(normalizeSave("junk")).toEqual(defaultSave());
    const s = normalizeSave({
      unlockedGrade: 99,
      totalCorrect: -5,
      grades: { 1: { inputMedals: { g1_l1: 9 }, bestScore: -1 }, 7: {} },
      history: [null, { ts: "x" }, entry()],
      skillStats: { g1_count: { c: "x", w: 2, recentMs: [100, -5, "y"] } },
    });
    expect(s.unlockedGrade).toBe(6);
    expect(s.totalCorrect).toBe(0);
    expect(s.grades[1].inputMedals.g1_l1).toBe(3); // 3にクランプ
    expect(s.grades[7]).toBeUndefined();
    expect(s.history).toHaveLength(1);
    expect(s.skillStats.g1_count).toEqual({ c: 0, w: 2, recentMs: [100] });
  });
});

describe("save: 更新系純関数", () => {
  it("recordAnswer は元を変えず、統計を積み上げる", () => {
    const s0 = defaultSave();
    const s1 = recordAnswer(s0, "g1_count", true, 2500);
    const s2 = recordAnswer(s1, "g1_count", false, 8000);
    expect(s0.totalCorrect).toBe(0);
    expect(s2.totalCorrect).toBe(1);
    expect(s2.totalWrong).toBe(1);
    expect(s2.skillStats.g1_count).toEqual({ c: 1, w: 1, recentMs: [2500, 8000] });
  });

  it("recentMs は上限でトリムされる", () => {
    let s = defaultSave();
    for (let i = 0; i < RECENT_MS_LIMIT + 5; i++) {
      s = recordAnswer(s, "g1_count", true, 1000 + i);
    }
    expect(s.skillStats.g1_count.recentMs).toHaveLength(RECENT_MS_LIMIT);
    expect(s.skillStats.g1_count.recentMs[0]).toBe(1005);
  });

  it("history は上限でトリムされる", () => {
    let s = defaultSave();
    for (let i = 0; i < HISTORY_LIMIT + 3; i++) {
      s = addHistory(s, entry({ ts: i }));
    }
    expect(s.history).toHaveLength(HISTORY_LIMIT);
    expect(s.history[0].ts).toBe(3);
  });

  it("メダルは下がらない", () => {
    let s = defaultSave();
    s = setLessonMedal(s, 1, "g1_l1", 3);
    s = setLessonMedal(s, 1, "g1_l1", 1);
    expect(s.grades[1].inputMedals.g1_l1).toBe(3);
  });

  it("全レッスンにメダルが付いたらアウトプット解放", () => {
    const lessons = ["g1_l1", "g1_l2", "g1_l3"];
    let s = defaultSave();
    expect(isOutputUnlocked(s, 1, lessons)).toBe(false);
    s = setLessonMedal(s, 1, "g1_l1", 1);
    s = setLessonMedal(s, 1, "g1_l2", 2);
    expect(isOutputUnlocked(s, 1, lessons)).toBe(false);
    s = setLessonMedal(s, 1, "g1_l3", 3);
    expect(isOutputUnlocked(s, 1, lessons)).toBe(true);
  });

  it("アウトプットクリアで次学年解放・ベストスコア更新", () => {
    let s = defaultSave();
    s = markOutputCleared(s, 1, 500);
    expect(s.unlockedGrade).toBe(2);
    expect(s.grades[1].outputCleared).toBe(true);
    expect(s.grades[1].bestScore).toBe(500);
    s = markOutputCleared(s, 1, 300); // 下回っても保持
    expect(s.grades[1].bestScore).toBe(500);
    s = markOutputCleared(s, 6, 100); // 上限6でクランプ
    expect(s.unlockedGrade).toBe(6);
  });
});
