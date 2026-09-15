/*
 * レッスン完了・テスト合格・単元マスターで パーティ全員に経験値を渡す
 * (学びの設計 LP-21, docs/kazu-quest-learning-tasks.md §6)。
 *
 * タスク文の定義:
 *   レッスン完了 +EXP (章の雑魚 3戦分)
 *   テスト合格   +EXP (5戦分)
 *   マスター     +EXP (10戦分)
 *
 * 「章の雑魚」は一意ではない (1章に複数のエンカウントテーブル・複数の雑魚が
 * いる) ため、学年 (= 章、小1〜小6は章1〜6に対応) ごとに基準値を1つ決める
 * 必要がある。基準値は「その学年の最初の章のワールドマップ雑魚テーブル
 * (src/content/encounters.ts の ch<N>-world 系、章1のみ ch1-world) にいる
 * 最も弱い (EXPが最小の) モンスター」の EXP とする — プレイヤーがその学年の
 * 単元を学ぶ時期にふつうに出会う、いちばん手加減された雑魚という意味で
 * 「章の雑魚」の代表値にいちばん近いと判断した (設計判断: 2026-09-15)。
 * レッスン/テスト/マスターは基準値の 3倍/5倍/10倍。
 *
 * 学年と章の対応、および各章の最弱モンスターは以下 (src/content/monsters.ts
 * と src/content/encounters.ts で確認済み):
 *   学年1 (章1 ch1-world): けしごむん (exp 2)
 *   学年2 (章2 ch2-world): あわけしごむん (exp 7)
 *   学年3 (章3 ch3-desert): すなけしごむん (exp 16)
 *   学年4 (章4 ch4-snowfield): ゆきけしごむん (exp 44)
 *   学年5 (章5 ch5-field): はすうけしごむん (exp 150)
 *   学年6 (章6 ch6-nega): ぜろけしごむん (exp 500)
 *
 * モンスターの数値が変わっても (バランス調整) ここは MONSTERS を参照している
 * ので自動で追随する。章/学年が増えたらこの表に1行足す。
 */

import { MONSTERS } from "../content/monsters";
import { SKILLS } from "./curriculum";
import { masteryOf, onLessonStarted, onReviewResult, onTestResult } from "./mastery";
import type { PartyMember, SaveData } from "./save";
import { applyExpToParty, type ExpGrantResult } from "./battle/expGrant";

export type LearningExpOutcome = "lesson" | "test" | "mastery";

/* タスク文の「N戦分」の N */
const OUTCOME_MULTIPLIER: Record<LearningExpOutcome, number> = {
  lesson: 3,
  test: 5,
  mastery: 10,
};

/* 学年ごとの基準値 (その学年の最初の章、ワールドマップの最弱モンスターのEXP) */
const BASELINE_EXP_BY_GRADE: Record<number, number> = {
  1: MONSTERS.keshigomun.exp,
  2: MONSTERS.awaKeshigomun.exp,
  3: MONSTERS.sunaKeshigomun.exp,
  4: MONSTERS.yukiKeshigomun.exp,
  5: MONSTERS.hasuuKeshigomun.exp,
  6: MONSTERS.zeroKeshigomun.exp,
};

/* 学年1〜6 以外 (未定義。現状 SKILLS は学年1〜6のみなので実際には起きない
 * 防御的措置) は学年1の基準値にフォールバックする */
const FALLBACK_GRADE = 1;

export function baselineExpForGrade(grade: number): number {
  return BASELINE_EXP_BY_GRADE[grade] ?? BASELINE_EXP_BY_GRADE[FALLBACK_GRADE];
}

export function expForLessonOutcome(grade: number, outcome: LearningExpOutcome): number {
  return baselineExpForGrade(grade) * OUTCOME_MULTIPLIER[outcome];
}

/*
 * パーティ全員に付与する。戦闘中ではないのでセーブ上の hp/mp をそのまま使い、
 * レベルアップした場合だけ全回復する (applyVictory と同じルール — expGrant.ts
 * のコアを共有)
 */
export function grantLearningExp(
  party: PartyMember[],
  grade: number,
  outcome: LearningExpOutcome,
): ExpGrantResult {
  return applyExpToParty(party, expForLessonOutcome(grade, outcome));
}

function gradeOf(skillId: string): number | undefined {
  return SKILLS.find((s) => s.id === skillId)?.grade;
}

function withGrantedExp(save: SaveData, skillId: string, outcome: LearningExpOutcome): SaveData {
  const grade = gradeOf(skillId);
  if (!grade) return save; /* 未登録の skillId (現状の SKILLS には無い) は何もしない */
  return { ...save, party: grantLearningExp(save.party, grade, outcome).party };
}

/*
 * mastery.ts の状態遷移 (純関数) + 学びの経験値付与 (LP-21) をまとめた
 * ラッパー。LessonScreen.tsx / ReviewScreen.tsx はこちらを呼ぶ (mastery.ts
 * 自体は SaveData の状態遷移だけを担う純関数のまま保つ — パーティ/EXPとの
 * 結合を持ち込まない設計判断)。
 *
 * どの呼び出しも「対象の状態に初めて到達したときだけ」EXPを渡す
 * (before !== 対象state && after === 対象state)。同じ単元のテストを
 * 何度受けなおしても (can に既にいるなら) EXPが増え続けないようにするため
 */

/* レッスンを開いた瞬間の none→practicing。学びの設計では「レッスンを開く」
 * こと自体が最初の状態遷移になる (story〜faded の導入部を読み終える前でも
 * mastery は practicing になる) ので、これがタスク文の「レッスン完了」に
 * いちばん近い既存フックだと判断した (docs/kazu-quest-learning-plan.md の
 * レッスン導線を踏まえた解釈。設計判断: 2026-09-15) */
export function applyLessonStartExp(save: SaveData, skillId: string): SaveData {
  const before = masteryOf(save, skillId).state;
  const next = onLessonStarted(save, skillId);
  if (before !== "none" || masteryOf(next, skillId).state !== "practicing") return next;
  return withGrantedExp(next, skillId, "lesson");
}

/* レッスン末尾のテスト結果。合格 (passed=true) で can に初めて到達したときだけ
 * 「テスト合格」ぶんのEXPを渡す。不合格時の practicing への遷移は
 * onTestResult のまま (EXPなし) */
export function applyTestResultExp(save: SaveData, skillId: string, passed: boolean): SaveData {
  const before = masteryOf(save, skillId).state;
  const next = onTestResult(save, skillId, passed);
  if (!passed || before === "can" || masteryOf(next, skillId).state !== "can") return next;
  return withGrantedExp(next, skillId, "test");
}

/* おさらい (間隔復習) の結果。can/mastered → mastered に初めて到達したときだけ
 * 「マスター」ぶんのEXPを渡す。かけら (ReviewScreen.tsx) はこの遷移と同じ
 * before/after 判定を呼び出し側でも行うので、判定結果を justMastered として
 * 返し、二重判定を避ける */
export interface ReviewResultOutcome {
  save: SaveData;
  justMastered: boolean;
}

export function applyReviewResultExp(
  save: SaveData,
  skillId: string,
  correct: number,
  total: number,
): ReviewResultOutcome {
  const before = masteryOf(save, skillId).state;
  const next = onReviewResult(save, skillId, correct, total);
  const justMastered = before !== "mastered" && masteryOf(next, skillId).state === "mastered";
  return { save: justMastered ? withGrantedExp(next, skillId, "mastery") : next, justMastered };
}
