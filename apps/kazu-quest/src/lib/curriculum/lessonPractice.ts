/*
 * れんしゅう Lv1→3 とテスト (LP-09) の純ロジック。EventBus/React に依存しないので
 * Vitest で直接テストできる。段階そのもの (どの Stage 文字列が次か) は
 * LessonScreen.tsx が持つ — ここは「1問答えた結果、段階を進めるか」だけを扱う。
 */

/* 1つの段階 (Lv1〜3) 内での「連続正解」の状態 */
export interface PracticeAttempt {
  streak: number;
  /* 直近の不正解のたびに深くなるヒントの段 (0 = ヒントなし、hints.length で頭打ち) */
  hintLevel: number;
}

/* 何問連続正解で次の段階へ進むか */
export const PRACTICE_STREAK_TARGET = 3;
/* ヒントの最大の段 (LessonDef.workedExample.problem.hints などは3段 — LP-03) */
export const PRACTICE_MAX_HINT_LEVEL = 3;

export const initialPracticeAttempt: PracticeAttempt = { streak: 0, hintLevel: 0 };

export type PracticeAnswerResult =
  | { levelComplete: true }
  | { levelComplete: false; attempt: PracticeAttempt };

/*
 * 1問答えた結果を反映する。
 * 正解: streak+1。target に達したら levelComplete (呼び出し側が次の段階 or テストへ)。
 * 不正解: 段階は落とさず streak だけ0に戻す。ヒントの段を1つ深くする
 * (docs/kazu-quest-learning-tasks.md §4 LP-09「間違えたら段階は下がらず、ヒントが1段深くなる」)。
 */
export function applyPracticeAnswer(
  attempt: PracticeAttempt,
  correct: boolean,
): PracticeAnswerResult {
  if (correct) {
    const streak = attempt.streak + 1;
    if (streak >= PRACTICE_STREAK_TARGET) return { levelComplete: true };
    return { levelComplete: false, attempt: { streak, hintLevel: 0 } };
  }
  return {
    levelComplete: false,
    attempt: {
      streak: 0,
      hintLevel: Math.min(PRACTICE_MAX_HINT_LEVEL, attempt.hintLevel + 1),
    },
  };
}

/* テスト (10問・Lv2/Lv3半々・8問以上で合格) */
export const TEST_QUESTIONS = 10;
export const TEST_PASS_COUNT = 8;

/* i (0-based) 問目の出題段階。半々に割り振る (偶数番目=Lv2、奇数番目=Lv3) */
export function testLevelForIndex(index: number): 2 | 3 {
  return index % 2 === 0 ? 2 : 3;
}

export function testPassed(correct: number): boolean {
  return correct >= TEST_PASS_COUNT;
}
