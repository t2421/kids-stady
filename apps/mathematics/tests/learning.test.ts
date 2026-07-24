import { beforeEach, describe, expect, it } from "vitest";
import { installLocalStorage } from "./localStorageMock";
import {
  LEARNING_DAILY_LIMIT,
  LEARNING_MS_LIMIT,
  dateKey,
  loadLearning,
  normalizeLog,
  recentDaily,
  recordLearning,
  removeLearning,
  skillReports,
  weakSkills,
} from "../src/lib/learning";

const T0 = new Date("2026-07-24T10:00:00").getTime();

describe("learning: 記録と読み込み", () => {
  beforeEach(() => installLocalStorage());

  it("正誤とスキル別統計・日別集計が積み上がる", () => {
    recordLearning("p1", "mathematics", "g1_add_carry", true, 2500, T0);
    recordLearning("p1", "mathematics", "g1_add_carry", false, 8000, T0);
    recordLearning("p1", "keisan-shooter", "ks_add_nc", true, 0, T0);
    const log = loadLearning("p1");
    expect(log.skills.g1_add_carry).toMatchObject({ c: 1, w: 1, app: "mathematics" });
    expect(log.skills.g1_add_carry.ms).toEqual([2500, 8000]);
    expect(log.skills.ks_add_nc).toMatchObject({ c: 1, w: 0, app: "keisan-shooter" });
    expect(log.skills.ks_add_nc.ms).toEqual([]); // ms=0 は積まない
    expect(log.daily[dateKey(T0)]).toEqual({ c: 2, w: 1 });
  });

  it("プロフィールごとに独立し、削除で消える", () => {
    recordLearning("p1", "mathematics", "g1_count", true, 1000, T0);
    recordLearning("p2", "mathematics", "g1_count", false, 1000, T0);
    expect(loadLearning("p1").skills.g1_count.c).toBe(1);
    expect(loadLearning("p2").skills.g1_count.w).toBe(1);
    removeLearning("p1");
    expect(loadLearning("p1").skills.g1_count).toBeUndefined();
    expect(loadLearning("p2").skills.g1_count.w).toBe(1);
  });

  it("ms は上限、daily は日数上限でトリムされる", () => {
    for (let i = 0; i < LEARNING_MS_LIMIT + 5; i++) {
      recordLearning("p1", "m", "s", true, 1000 + i, T0);
    }
    expect(loadLearning("p1").skills.s.ms).toHaveLength(LEARNING_MS_LIMIT);
    for (let i = 0; i < LEARNING_DAILY_LIMIT + 10; i++) {
      recordLearning("p2", "m", "s", true, 100, T0 + i * 86400000);
    }
    const days = Object.keys(loadLearning("p2").daily);
    expect(days).toHaveLength(LEARNING_DAILY_LIMIT);
    expect(days.sort()[0]).toBe(dateKey(T0 + 10 * 86400000)); // 古い日から消える
  });

  it("壊れたデータはデフォルトに正規化", () => {
    expect(normalizeLog(null)).toEqual({ version: 1, skills: {}, daily: {} });
    const log = normalizeLog({
      skills: { ok: { app: 1, c: "x", w: 2, ms: [100, -5, "y"] }, bad: null },
      daily: { "2026-07-24": { c: 3 }, junk: { c: 1 } },
    });
    expect(log.skills.ok).toEqual({ app: "unknown", c: 0, w: 2, ms: [100], lastTs: 0 });
    expect(log.skills.bad).toBeUndefined();
    expect(log.daily["2026-07-24"]).toEqual({ c: 3, w: 0 });
    expect(log.daily.junk).toBeUndefined();
  });
});

describe("learning: 分析ヘルパ", () => {
  beforeEach(() => installLocalStorage());

  it("skillReports: 正答率・平均・トレンド", () => {
    /* 前半遅く後半速い → trendMs 負 (はやくなってる) */
    const times = [4000, 4200, 3800, 1500, 1400, 1600];
    times.forEach((ms) => recordLearning("p1", "m", "s1", true, ms, T0));
    recordLearning("p1", "m", "s1", false, 2000, T0);
    const [r] = skillReports(loadLearning("p1"));
    expect(r.attempts).toBe(7);
    expect(r.accuracy).toBe(86);
    expect(r.trendMs).toBeLessThan(-300);
  });

  it("weakSkills: 試行5回以上を正答率の低い順に", () => {
    for (let i = 0; i < 6; i++) recordLearning("p1", "m", "easy", true, 0, T0);
    for (let i = 0; i < 6; i++) recordLearning("p1", "m", "hard", i < 2, 0, T0);
    for (let i = 0; i < 3; i++) recordLearning("p1", "m", "rare", false, 0, T0); // 試行不足
    const weak = weakSkills(loadLearning("p1"));
    expect(weak[0].skillId).toBe("hard");
    expect(weak.some((w) => w.skillId === "rare")).toBe(false);
  });

  it("recentDaily: 記録のない日は0で埋まる", () => {
    recordLearning("p1", "m", "s", true, 0, T0);
    recordLearning("p1", "m", "s", true, 0, T0 - 2 * 86400000);
    const days = recentDaily(loadLearning("p1"), 3, T0);
    expect(days).toHaveLength(3);
    expect(days[0].c).toBe(1); // 2日前
    expect(days[1].c).toBe(0); // 1日前
    expect(days[2].c).toBe(1); // 今日
  });
});
