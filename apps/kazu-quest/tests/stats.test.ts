import { describe, expect, it } from "vitest";
import { accuracyLabel, buildStats, STATS_DAILY_DAYS } from "../src/lib/stats";
import { defaultSave, type SaveData } from "../src/lib/save";
import { dateKey, emptyLog, type LearningLog } from "../src/lib/learning";

const NOW = new Date(2026, 8, 14, 12, 0, 0).getTime(); // 2026-09-14 正午 (ローカル)

function stat(c: number, w: number) {
  return { c, w, recentMs: [] };
}

function withSkills(skillStats: SaveData["skillStats"]): SaveData {
  return { ...defaultSave(), skillStats };
}

describe("buildStats", () => {
  it("空のセーブ: 学年6行ぜんぶ0、にがてなし、14日ぜんぶ0、数晶は消灯", () => {
    const s = buildStats(defaultSave(), null, "kq_", NOW);
    expect(s.byGrade).toHaveLength(6);
    expect(s.byGrade.map((g) => g.grade)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(s.byGrade.every((g) => g.correct === 0 && g.wrong === 0 && g.accuracy === 0)).toBe(true);
    expect(s.byGrade[0].label).toBe("1ねんせい");
    expect(s.weak).toEqual([]);
    expect(s.daily).toHaveLength(STATS_DAILY_DAYS);
    expect(s.daily.every((d) => d.correct === 0)).toBe(true);
    expect(s.orbs).toEqual([false, false, false, false, false, false]);
    expect(s.playtime).toBe("0ふん");
    expect(s.totals).toEqual({ correct: 0, wrong: 0 });
  });

  it("学年ごとに skillStats を集計する (未知のスキルは無視)", () => {
    const s = buildStats(
      withSkills({
        g1_count: stat(8, 2),
        g1_add_nc: stat(4, 0),
        g2_kuku: stat(3, 7),
        unknown_skill: stat(9, 9),
      }),
      null,
      "kq_",
      NOW,
    );
    expect(s.byGrade[0]).toMatchObject({ grade: 1, correct: 12, wrong: 2, accuracy: 86 });
    expect(s.byGrade[1]).toMatchObject({ grade: 2, correct: 3, wrong: 7, accuracy: 30 });
    expect(s.byGrade[2]).toMatchObject({ grade: 3, correct: 0, wrong: 0, accuracy: 0 });
    /* totals は既知・未知を問わず skillStats 全体 */
    expect(s.totals).toEqual({ correct: 24, wrong: 18 });
  });

  it("にがて: 試行5以上を正答率の低い順に3つ、ラベルは SKILLS から", () => {
    const s = buildStats(
      withSkills({
        g1_count: stat(1, 4), // 20%
        g2_kuku: stat(3, 7), // 30%
        g3_div: stat(2, 2), // 4回 → 対象外
        g1_compare: stat(5, 5), // 50%
        g6_ratio: stat(9, 1), // 90%
        g2_add_column: stat(6, 14), // 30%, 試行20 → 同率では先
      }),
      null,
      "kq_",
      NOW,
    );
    expect(s.weak.map((w) => w.skillId)).toEqual(["g1_count", "g2_add_column", "g2_kuku"]);
    expect(s.weak[0]).toEqual({ skillId: "g1_count", label: "かぞえる", accuracy: 20, attempts: 5 });
  });

  it("14日の日別正解数: 古い→新しい順、記録のない日は0で埋める", () => {
    const today = dateKey(NOW);
    const threeDaysAgo = dateKey(NOW - 3 * 86400000);
    const log: LearningLog = {
      ...emptyLog(),
      daily: {
        [today]: { c: 5, w: 1 },
        [threeDaysAgo]: { c: 2, w: 0 },
        "2000-01-01": { c: 99, w: 0 }, // 範囲外
      },
    };
    const s = buildStats(defaultSave(), log, "kq_", NOW);
    expect(s.daily).toHaveLength(14);
    expect(s.daily[13]).toEqual({ date: today, correct: 5 });
    expect(s.daily[10]).toEqual({ date: threeDaysAgo, correct: 2 });
    expect(s.daily.filter((d) => d.correct > 0)).toHaveLength(2);
    expect(s.daily[0].date < s.daily[13].date).toBe(true);
  });

  it("数晶: chapter.cleared に含まれる章だけ点灯", () => {
    const save = { ...defaultSave(), chapter: { current: 4, cleared: [1, 2, 3] } };
    const s = buildStats(save, null, "kq_", NOW);
    expect(s.orbs).toEqual([true, true, true, false, false, false]);
  });

  it("共有ログの接頭辞つきスキルはセーブに無いものだけ補完する (二重に数えない)", () => {
    const log: LearningLog = {
      ...emptyLog(),
      skills: {
        kq_g1_count: { app: "kazu-quest", c: 10, w: 0, ms: [], lastTs: 0 }, // セーブ優先
        kq_g2_kuku: { app: "kazu-quest", c: 4, w: 4, ms: [], lastTs: 0 }, // 補完
        g1_count: { app: "mathematics", c: 50, w: 50, ms: [], lastTs: 0 }, // 他アプリ → 無視
      },
    };
    const s = buildStats(withSkills({ g1_count: stat(1, 1) }), log, "kq_", NOW);
    expect(s.byGrade[0]).toMatchObject({ correct: 1, wrong: 1 });
    expect(s.byGrade[1]).toMatchObject({ correct: 4, wrong: 4 });
  });

  it("あそんだ じかん は formatPlaytime の書式", () => {
    const save = { ...defaultSave(), playtimeMs: 125 * 60_000 };
    expect(buildStats(save, null, "kq_", NOW).playtime).toBe("2じかん 5ふん");
  });
});

describe("accuracyLabel", () => {
  it("とくい / もうすこし / まだ", () => {
    expect(accuracyLabel({ correct: 0, wrong: 0, accuracy: 0 })).toBe("まだ");
    expect(accuracyLabel({ correct: 8, wrong: 2, accuracy: 80 })).toBe("とくい");
    expect(accuracyLabel({ correct: 5, wrong: 5, accuracy: 50 })).toBe("もうすこし");
    expect(accuracyLabel({ correct: 7, wrong: 3, accuracy: 70 })).toBe("");
  });
});
