import { describe, expect, it } from "vitest";
import {
  applyPracticeAnswer,
  initialPracticeAttempt,
  PRACTICE_MAX_HINT_LEVEL,
  PRACTICE_STREAK_TARGET,
  TEST_PASS_COUNT,
  TEST_QUESTIONS,
  testLevelForIndex,
  testPassed,
} from "../src/lib/curriculum/lessonPractice";

/*
 * れんしゅう Lv1→3 とテスト (LP-09) の純ロジック。EventBus に依存しないので
 * ここは lessonFlow.test.ts のような EventBus モックなしで直接検証できる。
 */

describe("applyPracticeAnswer", () => {
  it("3問連続正解で levelComplete になる", () => {
    let attempt = initialPracticeAttempt;
    for (let i = 0; i < PRACTICE_STREAK_TARGET - 1; i++) {
      const result = applyPracticeAnswer(attempt, true);
      expect(result.levelComplete).toBe(false);
      if (!result.levelComplete) attempt = result.attempt;
    }
    expect(attempt.streak).toBe(PRACTICE_STREAK_TARGET - 1);

    const finalResult = applyPracticeAnswer(attempt, true);
    expect(finalResult.levelComplete).toBe(true);
  });

  it("不正解では段階を落とさず (levelComplete にならず) streak が0に戻る", () => {
    const afterTwoCorrect = { streak: 2, hintLevel: 0 };
    const result = applyPracticeAnswer(afterTwoCorrect, false);
    expect(result.levelComplete).toBe(false);
    if (result.levelComplete) throw new Error("unreachable");
    expect(result.attempt.streak).toBe(0);
  });

  it("不正解のたびに hintLevel が1段ずつ深くなり、上限で頭打ちになる", () => {
    let attempt = initialPracticeAttempt;
    for (let i = 1; i <= PRACTICE_MAX_HINT_LEVEL; i++) {
      const result = applyPracticeAnswer(attempt, false);
      if (result.levelComplete) throw new Error("unreachable");
      attempt = result.attempt;
      expect(attempt.hintLevel).toBe(i);
    }
    /* さらに間違えても PRACTICE_MAX_HINT_LEVEL を超えない */
    const capped = applyPracticeAnswer(attempt, false);
    if (capped.levelComplete) throw new Error("unreachable");
    expect(capped.attempt.hintLevel).toBe(PRACTICE_MAX_HINT_LEVEL);
  });

  it("正解すると hintLevel が0に戻る (次の問題はヒントなしから)", () => {
    const afterWrong = { streak: 0, hintLevel: 2 };
    const result = applyPracticeAnswer(afterWrong, true);
    if (result.levelComplete) throw new Error("unreachable");
    expect(result.attempt.hintLevel).toBe(0);
    expect(result.attempt.streak).toBe(1);
  });
});

describe("testLevelForIndex", () => {
  it("偶数番目 (0-based) は Lv2、奇数番目は Lv3 — 10問で5問ずつになる", () => {
    const levels = Array.from({ length: TEST_QUESTIONS }, (_, i) => testLevelForIndex(i));
    expect(levels.filter((l) => l === 2)).toHaveLength(5);
    expect(levels.filter((l) => l === 3)).toHaveLength(5);
    expect(levels[0]).toBe(2);
    expect(levels[1]).toBe(3);
  });
});

describe("testPassed", () => {
  it(`${TEST_PASS_COUNT}問以上で合格`, () => {
    expect(testPassed(TEST_PASS_COUNT)).toBe(true);
    expect(testPassed(TEST_QUESTIONS)).toBe(true);
  });

  it(`${TEST_PASS_COUNT}問未満は不合格`, () => {
    expect(testPassed(TEST_PASS_COUNT - 1)).toBe(false);
    expect(testPassed(0)).toBe(false);
  });
});
