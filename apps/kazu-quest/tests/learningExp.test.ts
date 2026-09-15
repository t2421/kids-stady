/*
 * src/lib/learningExp.ts (学びの設計 LP-21: レッスン完了/テスト合格/マスターの
 * 経験値付与) のテスト。expForLessonOutcome の数値と、LessonScreen.tsx /
 * ReviewScreen.tsx から呼ばれるラッパー (applyLessonStartExp /
 * applyTestResultExp / applyReviewResultExp) の配線を検証する。
 */
import { describe, expect, it } from "vitest";
import {
  applyLessonStartExp,
  applyReviewResultExp,
  applyTestResultExp,
  baselineExpForGrade,
  expForLessonOutcome,
  grantLearningExp,
} from "../src/lib/learningExp";
import { MONSTERS } from "../src/content/monsters";
import { SKILLS } from "../src/lib/curriculum";
import { masteryOf } from "../src/lib/mastery";
import { expForLevel, heroStats } from "../src/lib/battle/stats";
import { defaultSave, type MasteryEntry, type SaveData } from "../src/lib/save";

/* 学年ごとの代表 skillId (存在確認込み。SKILLS に無ければテストの前提が崩れている) */
function skillOfGrade(grade: number): string {
  const skill = SKILLS.find((s) => s.grade === grade);
  if (!skill) throw new Error(`no skill for grade ${grade}`);
  return skill.id;
}

function withMastery(entry: Partial<MasteryEntry> & { state: MasteryEntry["state"] }, skillId: string): SaveData {
  const save = defaultSave();
  return {
    ...save,
    mastery: { ...save.mastery, [skillId]: { reviewDue: null, streak: 0, passedAt: null, ...entry } },
  };
}

describe("baselineExpForGrade / expForLessonOutcome", () => {
  it("学年ごとの基準値は各章ワールドマップの最弱モンスターのEXPと一致する", () => {
    expect(baselineExpForGrade(1)).toBe(MONSTERS.keshigomun.exp);
    expect(baselineExpForGrade(2)).toBe(MONSTERS.awaKeshigomun.exp);
    expect(baselineExpForGrade(3)).toBe(MONSTERS.sunaKeshigomun.exp);
    expect(baselineExpForGrade(4)).toBe(MONSTERS.yukiKeshigomun.exp);
    expect(baselineExpForGrade(5)).toBe(MONSTERS.hasuuKeshigomun.exp);
    expect(baselineExpForGrade(6)).toBe(MONSTERS.zeroKeshigomun.exp);
  });

  it("未定義の学年は学年1にフォールバックする", () => {
    expect(baselineExpForGrade(99)).toBe(baselineExpForGrade(1));
  });

  it("レッスン完了=3戦分、テスト合格=5戦分、マスター=10戦分", () => {
    const baseline = baselineExpForGrade(3);
    expect(expForLessonOutcome(3, "lesson")).toBe(baseline * 3);
    expect(expForLessonOutcome(3, "test")).toBe(baseline * 5);
    expect(expForLessonOutcome(3, "mastery")).toBe(baseline * 10);
  });
});

describe("grantLearningExp", () => {
  it("パーティ全員に同じEXPを加算する", () => {
    const save = defaultSave();
    const party = [
      ...save.party,
      { ...save.party[0], memberId: "tasuku", exp: 0, level: 1 },
    ];
    const { party: updated } = grantLearningExp(party, 1, "test");
    const exp = expForLessonOutcome(1, "test");
    expect(updated).toHaveLength(2);
    for (const member of updated) {
      expect(member.exp).toBe(exp);
    }
  });

  it("レベルアップした場合は全回復する (applyVictory と同じルール)", () => {
    const save = defaultSave();
    const member = { ...save.party[0], hp: 1, mp: 0, exp: expForLevel(2) - 1 };
    const { party, levelUps } = grantLearningExp([member], 6, "mastery"); // 十分大きいEXP
    expect(levelUps.length).toBeGreaterThan(0);
    const newLevel = party[0].level;
    expect(party[0].hp).toBe(heroStats(newLevel).maxHp);
    expect(party[0].mp).toBe(heroStats(newLevel).maxMp);
  });

  it("レベルアップしない場合はセーブのHP/MPをそのまま (上限でクランプ) 使う", () => {
    const save = defaultSave();
    /* Lv10 なら次のLvまでの必要EXPが十分大きく、grade1のレッスンEXPでは越えない */
    const member = { ...save.party[0], level: 10, exp: expForLevel(10), hp: 3, mp: 1 };
    const { party, levelUps } = grantLearningExp([member], 1, "lesson");
    expect(levelUps).toHaveLength(0);
    expect(party[0].hp).toBe(3);
    expect(party[0].mp).toBe(1);
  });
});

describe("applyLessonStartExp", () => {
  const skillId = skillOfGrade(1);

  it("none → practicing の初回だけ「レッスン完了」ぶんのEXPを渡す", () => {
    const save = defaultSave();
    const next = applyLessonStartExp(save, skillId);
    expect(masteryOf(next, skillId).state).toBe("practicing");
    expect(next.party[0].exp).toBe(expForLessonOutcome(1, "lesson"));
  });

  it("すでに none 以外の状態ではEXPを渡さない (mastery.ts のガードのまま)", () => {
    for (const state of ["practicing", "can", "mastered"] as const) {
      const save = withMastery({ state }, skillId);
      const next = applyLessonStartExp(save, skillId);
      expect(next.party[0].exp).toBe(0);
    }
  });
});

describe("applyTestResultExp", () => {
  const skillId = skillOfGrade(2);

  it("合格で can に初めて到達したときだけ「テスト合格」ぶんのEXPを渡す", () => {
    const save = defaultSave();
    const next = applyTestResultExp(save, skillId, true);
    expect(masteryOf(next, skillId).state).toBe("can");
    expect(next.party[0].exp).toBe(expForLessonOutcome(2, "test"));
  });

  it("すでに can の状態で再合格してもEXPは渡さない (周回対策)", () => {
    const save = withMastery({ state: "can" }, skillId);
    const next = applyTestResultExp(save, skillId, true);
    expect(next.party[0].exp).toBe(0);
  });

  it("不合格ではEXPを渡さない", () => {
    const save = defaultSave();
    const next = applyTestResultExp(save, skillId, false);
    expect(masteryOf(next, skillId).state).toBe("practicing");
    expect(next.party[0].exp).toBe(0);
  });
});

describe("applyReviewResultExp", () => {
  const skillId = skillOfGrade(4);

  it("最長間隔で連続合格し mastered に到達したときだけ「マスター」ぶんのEXPを渡す", () => {
    const save = withMastery({ state: "can", streak: 3 }, skillId);
    const outcome = applyReviewResultExp(save, skillId, 5, 5);
    expect(outcome.justMastered).toBe(true);
    expect(masteryOf(outcome.save, skillId).state).toBe("mastered");
    expect(outcome.save.party[0].exp).toBe(expForLessonOutcome(4, "mastery"));
  });

  it("すでに mastered ならEXPは渡さない", () => {
    const save = withMastery({ state: "mastered", streak: 3 }, skillId);
    const outcome = applyReviewResultExp(save, skillId, 5, 5);
    expect(outcome.justMastered).toBe(false);
    expect(outcome.save.party[0].exp).toBe(0);
  });

  it("mastered に届かない結果ではEXPは渡さない", () => {
    const save = withMastery({ state: "can", streak: 0 }, skillId);
    const outcome = applyReviewResultExp(save, skillId, 5, 5); /* streakが足りないので can のまま */
    expect(outcome.justMastered).toBe(false);
    expect(masteryOf(outcome.save, skillId).state).toBe("can");
    expect(outcome.save.party[0].exp).toBe(0);
  });
});
