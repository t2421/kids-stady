/*
 * 単元の習熟状態 (mastery) と間隔復習のスケジューラ (学びの設計 LP-04)。
 * すべて純関数 — SaveData を不変更新して新しいものを返す。
 * 時刻は必ず ./clock の now() を通す (E2E が advanceClock で早送りできるように)。
 *
 * 状態遷移:
 *   none        → practicing  : onLessonStarted (レッスンを開いた)
 *   none        → practicing  : onTestResult(false) の初回不合格
 *   practicing  → can        : onTestResult(true) (テスト合格)
 *   can         → can (streak+1, 間隔を伸ばす) : onReviewResult(pass, 1〜3日)
 *   can         → mastered    : onReviewResult(pass) が最長間隔で2回連続合格
 *   can/mastered → can (streak=0, 間隔を1日に戻す) : onReviewResult(fail)
 */

import { now } from "./clock";
import { SPELLS } from "../content/spells";
import { SKILLS } from "./curriculum";
import type { MasteryEntry, SaveData } from "./save";

/* 間隔復習の間隔 (ms)。streak を配列の添字として使う (末尾でクランプ) */
export const REVIEW_INTERVALS_MS = [
  1 * 24 * 60 * 60 * 1000,
  3 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
];

const NONE_ENTRY: MasteryEntry = { state: "none", reviewDue: null, streak: 0, passedAt: null };

/* 未登録の skillId は "none" 扱い */
export function masteryOf(save: SaveData, skillId: string): MasteryEntry {
  return save.mastery[skillId] ?? NONE_ENTRY;
}

function withMastery(save: SaveData, skillId: string, entry: MasteryEntry): SaveData {
  return { ...save, mastery: { ...save.mastery, [skillId]: entry } };
}

/* まなびやでレッスンを開いたとき。まだ手つかず (none) なら practicing にする */
export function onLessonStarted(save: SaveData, skillId: string): SaveData {
  const entry = masteryOf(save, skillId);
  if (entry.state !== "none") return save;
  return withMastery(save, skillId, { ...entry, state: "practicing" });
}

/*
 * レッスン末尾のテスト結果。合格なら can に進め、次の復習を1日後に予約する。
 * 不合格は初回 (none) だけ practicing に進める — 2回目以降の不合格では
 * 単発の失敗で can/mastered を落とさない (降格は間隔復習の失敗だけが行う)
 */
export function onTestResult(save: SaveData, skillId: string, passed: boolean): SaveData {
  if (passed) {
    return withMastery(save, skillId, {
      state: "can",
      reviewDue: now() + REVIEW_INTERVALS_MS[0],
      streak: 0,
      passedAt: now(),
    });
  }
  const entry = masteryOf(save, skillId);
  if (entry.state === "none") {
    return withMastery(save, skillId, { ...entry, state: "practicing" });
  }
  return save;
}

/*
 * 間隔復習 (おさらい5問など) の結果。can/mastered でなければ何もしない
 * (まだ復習に入っていない単元は対象外)。
 * 4/5 以上正解: 次の間隔へ (1→3→7日)。最長間隔で2回連続合格したら mastered。
 * 4/5 未満: streak を 0 に戻し、間隔を最短 (1日) に戻す。can より下へは落とさない
 */
export function onReviewResult(
  save: SaveData,
  skillId: string,
  correct: number,
  total: number,
): SaveData {
  const entry = masteryOf(save, skillId);
  if (entry.state !== "can" && entry.state !== "mastered") return save;

  const ratio = total > 0 ? correct / total : 0;
  const lastIdx = REVIEW_INTERVALS_MS.length - 1;

  if (ratio >= 0.8) {
    if (entry.state === "mastered") return save; /* 既卒業。何もしない */
    if (entry.streak >= REVIEW_INTERVALS_MS.length) {
      return withMastery(save, skillId, { ...entry, state: "mastered", reviewDue: null });
    }
    const streak = entry.streak + 1;
    return withMastery(save, skillId, {
      ...entry,
      state: "can",
      streak,
      reviewDue: now() + REVIEW_INTERVALS_MS[Math.min(streak, lastIdx)],
    });
  }

  return withMastery(save, skillId, {
    ...entry,
    state: "can",
    streak: 0,
    reviewDue: now() + REVIEW_INTERVALS_MS[0],
  });
}

/* 期日 (reviewDue <= nowMs) が来た can/mastered の単元。期日が早い順 */
export function dueReviews(save: SaveData, nowMs?: number): string[] {
  const t = nowMs ?? now();
  return Object.entries(save.mastery)
    .filter(
      ([, entry]) =>
        (entry.state === "can" || entry.state === "mastered") &&
        entry.reviewDue !== null &&
        entry.reviewDue <= t,
    )
    .sort((a, b) => (a[1].reviewDue as number) - (b[1].reviewDue as number))
    .map(([skillId]) => skillId);
}

/*
 * 既存プレイヤーの巻き戻し防止 (計画 §0): 呪文を習得済み (learned.<id>) なら、
 * その呪文の学習テスト対象単元を can に写す。skillStats の実績が十分
 * (10問以上・正答率80%以上) な単元も同様。"none" のものだけを触るので
 * 毎セッション開始時に呼んでも冪等 (state.md ref)
 */
export function initMasteryFromFlags(save: SaveData): SaveData {
  let next = save;

  const promoteToCanIfNone = (skillId: string): void => {
    if (masteryOf(next, skillId).state !== "none") return;
    next = withMastery(next, skillId, {
      state: "can",
      reviewDue: now() + REVIEW_INTERVALS_MS[0],
      streak: 0,
      passedAt: null,
    });
  };

  for (const spell of Object.values(SPELLS)) {
    if (!next.flags[`learned.${spell.id}`]) continue;
    for (const skillId of spell.learnTest.skillIds) promoteToCanIfNone(skillId);
  }

  for (const skill of SKILLS) {
    const stat = next.skillStats[skill.id];
    if (!stat) continue;
    const totalAnswers = stat.c + stat.w;
    if (totalAnswers < 10 || stat.c / totalAnswers < 0.8) continue;
    promoteToCanIfNone(skill.id);
  }

  return next;
}
