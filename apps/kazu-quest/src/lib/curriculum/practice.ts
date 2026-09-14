/*
 * とっくん (設計 A4 / KQ-11): 習得テストの前に挟む、時間無制限・ヒントつき・
 * 不正解で即解説の練習モード。合否はなく、5問終えたらそのままテストへ。
 * 純関数のみ — Vitest 対象。
 */

import type { SpellDef } from "../../content/types";
import type { QuestionSession } from "../questionSession";
import type { CherryHint, Problem } from "./types";

export const PRACTICE_QUESTIONS = 5;

/* 呪文の習得テストと同じ単元から出す練習セッション */
export function practiceSession(spell: SpellDef): QuestionSession {
  return {
    key: spell.id,
    questions: PRACTICE_QUESTIONS,
    context: "practice",
    skillIds: [...spell.learnTest.skillIds],
  };
}

/* さくらんぼ図のてっぺんの数 (分けられる側 = 2つの枝の和) */
export function cherryTop(hint: CherryHint): number {
  return hint.split.first + hint.split.second;
}

/*
 * ヒントを持たない問題の文章ヒント: explain の最初の 1 行 (答えを出さない範囲の
 * 誘導)。explain が空なら null (ヒントなし)。
 */
export function textHint(problem: Pick<Problem, "hint" | "explain">): string | null {
  if (problem.hint) return null;
  return problem.explain[0] ?? null;
}

/* "spell-practice-finished" (React → Phaser) のペイロード */
export interface SpellPracticeResult {
  spellId: string;
}
