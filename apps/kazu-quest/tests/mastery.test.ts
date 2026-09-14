import { afterEach, describe, expect, it } from "vitest";
import { advanceClock, now, resetClock } from "../src/lib/clock";
import {
  REVIEW_INTERVALS_MS,
  dueReviews,
  initMasteryFromFlags,
  masteryOf,
  onLessonStarted,
  onReviewResult,
  onTestResult,
} from "../src/lib/mastery";
import { defaultSave, normalizeMastery, type MasteryEntry, type SaveData } from "../src/lib/save";

afterEach(() => {
  resetClock();
});

const SKILL = "g1_add_nc";

/* hikidama の learnTest.skillIds = ["g1_sub_nc"] (src/content/spells.ts) */
const SPELL_ID = "hikidama";
const SPELL_SKILL = "g1_sub_nc";

function withEntry(entry: Partial<MasteryEntry> & { state: MasteryEntry["state"] }): SaveData {
  const save = defaultSave();
  return {
    ...save,
    mastery: {
      ...save.mastery,
      [SKILL]: { reviewDue: null, streak: 0, passedAt: null, ...entry },
    },
  };
}

describe("masteryOf", () => {
  it("未登録の skillId は none の既定値", () => {
    expect(masteryOf(defaultSave(), SKILL)).toEqual({
      state: "none",
      reviewDue: null,
      streak: 0,
      passedAt: null,
    });
  });

  it("登録済みならそのエントリを返す", () => {
    const save = withEntry({ state: "can", streak: 2 });
    expect(masteryOf(save, SKILL)).toEqual({
      state: "can",
      reviewDue: null,
      streak: 2,
      passedAt: null,
    });
  });
});

describe("onLessonStarted", () => {
  it("none → practicing", () => {
    const save = onLessonStarted(defaultSave(), SKILL);
    expect(masteryOf(save, SKILL).state).toBe("practicing");
  });

  it("none 以外は何もしない (同じ save を返す)", () => {
    for (const state of ["practicing", "can", "mastered"] as const) {
      const save = withEntry({ state });
      expect(onLessonStarted(save, SKILL)).toBe(save);
    }
  });

  it("不変更新: 元の save は変わらない", () => {
    const before = defaultSave();
    const after = onLessonStarted(before, SKILL);
    expect(before.mastery[SKILL]).toBeUndefined();
    expect(after).not.toBe(before);
  });
});

describe("onTestResult", () => {
  it("合格: can になり reviewDue が 1日後、streak 0、passedAt が今", () => {
    const t0 = now();
    const save = onTestResult(defaultSave(), SKILL, true);
    const entry = masteryOf(save, SKILL);
    expect(entry.state).toBe("can");
    expect(entry.streak).toBe(0);
    expect(entry.reviewDue).toBeGreaterThanOrEqual(t0 + REVIEW_INTERVALS_MS[0]);
    expect(entry.passedAt).toBeGreaterThanOrEqual(t0);
  });

  it("合格は practicing/can/mastered からも can に上書きする", () => {
    for (const state of ["practicing", "can", "mastered"] as const) {
      const save = withEntry({ state, streak: 5 });
      const entry = masteryOf(onTestResult(save, SKILL, true), SKILL);
      expect(entry.state).toBe("can");
      expect(entry.streak).toBe(0);
    }
  });

  it("初回不合格 (none): practicing にする", () => {
    const save = onTestResult(defaultSave(), SKILL, false);
    expect(masteryOf(save, SKILL).state).toBe("practicing");
  });

  it("2回目以降の不合格 (practicing/can/mastered) は状態を変えない", () => {
    for (const state of ["practicing", "can", "mastered"] as const) {
      const save = withEntry({ state, streak: 3 });
      const after = onTestResult(save, SKILL, false);
      expect(after).toBe(save);
      expect(masteryOf(after, SKILL).state).toBe(state);
    }
  });
});

describe("onReviewResult", () => {
  it("none/practicing のときは何もしない (同じ save を返す)", () => {
    for (const state of ["none", "practicing"] as const) {
      const save = state === "none" ? defaultSave() : withEntry({ state });
      expect(onReviewResult(save, SKILL, 5, 5)).toBe(save);
    }
  });

  it("4/5 (80%) 以上は合格: streak が進み、間隔が 1→3→7 日と伸びる", () => {
    let save = withEntry({ state: "can", streak: 0 });

    let tCall = now();
    save = onReviewResult(save, SKILL, 4, 5);
    expect(masteryOf(save, SKILL)).toMatchObject({ state: "can", streak: 1 });
    expect(masteryOf(save, SKILL).reviewDue).toBeGreaterThanOrEqual(tCall + REVIEW_INTERVALS_MS[1]);

    tCall = now();
    save = onReviewResult(save, SKILL, 5, 5);
    expect(masteryOf(save, SKILL)).toMatchObject({ state: "can", streak: 2 });
    expect(masteryOf(save, SKILL).reviewDue).toBeGreaterThanOrEqual(tCall + REVIEW_INTERVALS_MS[2]);
  });

  it("最長間隔で2回連続合格すると mastered になり reviewDue が null", () => {
    let save = withEntry({ state: "can", streak: 0 });
    save = onReviewResult(save, SKILL, 4, 5); // streak 0→1 (3日)
    save = onReviewResult(save, SKILL, 4, 5); // streak 1→2 (7日)
    save = onReviewResult(save, SKILL, 4, 5); // streak 2→3 (7日 で維持、まだ mastered ではない)
    expect(masteryOf(save, SKILL)).toMatchObject({ state: "can", streak: 3 });

    save = onReviewResult(save, SKILL, 5, 5); // 7日 で2回連続合格 → mastered
    expect(masteryOf(save, SKILL)).toMatchObject({ state: "mastered", reviewDue: null });
  });

  it("mastered に達したあとの合格は何もしない", () => {
    const save = withEntry({ state: "mastered", streak: 4, reviewDue: null });
    expect(onReviewResult(save, SKILL, 5, 5)).toBe(save);
  });

  it("3問以下 (< 80%) は streak を 0 に戻し、間隔を1日に戻す。can より下へは落ちない", () => {
    for (const state of ["can", "mastered"] as const) {
      const t0 = now();
      const save = withEntry({ state, streak: 3, reviewDue: 999 });
      const after = onReviewResult(save, SKILL, 3, 5);
      const entry = masteryOf(after, SKILL);
      expect(entry.state).toBe("can");
      expect(entry.streak).toBe(0);
      expect(entry.reviewDue).toBeGreaterThanOrEqual(t0 + REVIEW_INTERVALS_MS[0]);
    }
  });

  it("total が 0 のときは不合格として扱う (0除算しない)", () => {
    const save = withEntry({ state: "can", streak: 2 });
    const after = onReviewResult(save, SKILL, 0, 0);
    expect(masteryOf(after, SKILL).streak).toBe(0);
  });
});

describe("dueReviews", () => {
  it("can/mastered かつ reviewDue が来ているものだけを、期日が早い順に返す", () => {
    const save: SaveData = {
      ...defaultSave(),
      mastery: {
        due_can: { state: "can", reviewDue: 100, streak: 0, passedAt: null },
        due_mastered: { state: "mastered", reviewDue: 50, streak: 4, passedAt: null },
        not_due_yet: { state: "can", reviewDue: 500, streak: 0, passedAt: null },
        no_review_due: { state: "mastered", reviewDue: null, streak: 4, passedAt: null },
        practicing_ignored: { state: "practicing", reviewDue: 10, streak: 0, passedAt: null },
        none_ignored: { state: "none", reviewDue: 10, streak: 0, passedAt: null },
      },
    };
    expect(dueReviews(save, 200)).toEqual(["due_mastered", "due_can"]);
  });

  it("nowMs 省略時は clock.now() を使う — advanceClock で1日進めると拾われる", () => {
    let save = defaultSave();
    save = onTestResult(save, SKILL, true); // reviewDue = now() + 1日

    expect(dueReviews(save)).not.toContain(SKILL);

    advanceClock(REVIEW_INTERVALS_MS[0]);
    expect(dueReviews(save)).toContain(SKILL);
  });
});

describe("normalizeMastery", () => {
  it("オブジェクトでなければ空", () => {
    expect(normalizeMastery(undefined)).toEqual({});
    expect(normalizeMastery(null)).toEqual({});
    expect(normalizeMastery("junk")).toEqual({});
    expect(normalizeMastery(42)).toEqual({});
  });

  it("正しいエントリはそのまま残る", () => {
    const raw = { [SKILL]: { state: "can", reviewDue: 123, streak: 2, passedAt: 100 } };
    expect(normalizeMastery(raw)).toEqual(raw);
  });

  it("ゴミの行 (オブジェクトでない値) は落とす", () => {
    const out = normalizeMastery({
      [SKILL]: { state: "can", reviewDue: 1, streak: 0, passedAt: null },
      garbage_string: "not-an-object",
      garbage_number: 42,
      garbage_null: null,
      "": { state: "can", reviewDue: 1, streak: 0, passedAt: null },
    });
    expect(Object.keys(out)).toEqual([SKILL]);
  });

  it("欠けた項目・壊れた項目はフィールドごとに既定値で埋める", () => {
    const out = normalizeMastery({
      bad_state: { state: "bogus", reviewDue: 1, streak: 1, passedAt: 1 },
      missing_fields: {},
      bad_review_due: { state: "can", reviewDue: "soon", streak: 1, passedAt: 1 },
      bad_streak: { state: "can", reviewDue: 1, streak: -1, passedAt: 1 },
      bad_streak_float: { state: "can", reviewDue: 1, streak: 1.5, passedAt: 1 },
      bad_passed_at: { state: "can", reviewDue: 1, streak: 1, passedAt: "never" },
    });
    expect(out.bad_state.state).toBe("none");
    expect(out.missing_fields).toEqual({
      state: "none",
      reviewDue: null,
      streak: 0,
      passedAt: null,
    });
    expect(out.bad_review_due.reviewDue).toBeNull();
    expect(out.bad_streak.streak).toBe(0);
    expect(out.bad_streak_float.streak).toBe(0);
    expect(out.bad_passed_at.passedAt).toBeNull();
  });
});

describe("initMasteryFromFlags", () => {
  it("learned.<spellId> が立っている呪文の学習テスト対象単元を can にする", () => {
    const save = {
      ...defaultSave(),
      flags: { [`learned.${SPELL_ID}`]: true },
    };
    const after = initMasteryFromFlags(save);
    expect(masteryOf(after, SPELL_SKILL).state).toBe("can");
    expect(masteryOf(after, SPELL_SKILL).reviewDue).not.toBeNull();
  });

  it("skillStats が 10問以上・正答率80%以上の単元も can にする", () => {
    const save: SaveData = {
      ...defaultSave(),
      skillStats: {
        [SKILL]: { c: 8, w: 2, recentMs: [] }, // 10問、80%ちょうど
      },
    };
    const after = initMasteryFromFlags(save);
    expect(masteryOf(after, SKILL).state).toBe("can");
  });

  it("10問未満・正答率80%未満は昇格させない", () => {
    const save: SaveData = {
      ...defaultSave(),
      skillStats: {
        under_total: { c: 5, w: 2, recentMs: [] }, // 7問 (< 10)
        under_accuracy: { c: 7, w: 3, recentMs: [] }, // 70%
      },
    };
    const after = initMasteryFromFlags(save);
    expect(masteryOf(after, "under_total").state).toBe("none");
    expect(masteryOf(after, "under_accuracy").state).toBe("none");
  });

  it("既に none を超えている単元には手を出さない (先取り学習などを巻き戻さない)", () => {
    const save = {
      ...defaultSave(),
      flags: { [`learned.${SPELL_ID}`]: true },
      mastery: { [SPELL_SKILL]: { state: "practicing" as const, reviewDue: null, streak: 0, passedAt: null } },
    };
    const after = initMasteryFromFlags(save);
    expect(masteryOf(after, SPELL_SKILL).state).toBe("practicing");
  });

  it("冪等: 2回呼んでも結果は変わらない", () => {
    const save = {
      ...defaultSave(),
      flags: { [`learned.${SPELL_ID}`]: true },
      skillStats: { [SKILL]: { c: 8, w: 2, recentMs: [] } },
    };
    const once = initMasteryFromFlags(save);
    const twice = initMasteryFromFlags(once);
    expect(twice).toEqual(once);
  });
});
