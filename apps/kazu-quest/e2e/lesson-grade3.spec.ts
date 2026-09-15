import { expect, test, type Page } from "@playwright/test";
import { answerCorrectOnce, isAnswerable, startGame } from "./helpers";

/*
 * 小3の中核単元 g3_div を story → concept → れい → 穴埋め → れんしゅう Lv1〜3
 * → テスト まで通しで検証する (LP-14、e2e/lesson.spec.ts の第2テストと同じ形)。
 *
 * g3_div は学年3以上なので、れんしゅう・テストはテンキー入力になる (KQ-12,
 * src/lib/inputMode.ts の KEYPAD_MIN_GRADE=3)。ただし穴埋め (LessonFaded) は
 * 常に3択で答える実装 (LessonFaded.tsx が MathChoices を無条件に使う) なので、
 * 穴埋め区間だけは3択のまま。answerCorrectNTimes は
 * helpers.answerCorrectOnce (3択/テンキーの両方を自動判定して答える) を使うので、
 * どちらの区間でもそのまま流用できる。
 */

/* 出題パネルが答えられる状態になるのを待ってから1問正解する、を n 回くり返す */
async function answerCorrectNTimes(page: Page, n: number) {
  for (let i = 0; i < n; i++) {
    await expect
      .poll(() => isAnswerable(page), { timeout: 10_000 })
      .toBe(true);
    await answerCorrectOnce(page);
    await page.waitForTimeout(1_100); // AUTO_ADVANCE_MS (900) + 余裕
  }
}

test("lesson: g3_div を story から テストまで通して can になる (テンキー入力)", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startGame(page);

  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.openLesson("g3_div"));

  const screen = page.locator('[data-testid="lesson-screen"]');
  await expect(screen).toBeVisible({ timeout: 10_000 });
  const next = page.locator('[data-testid="lesson-next"]');

  /* story: 2ページ → concept: 3ページ (図あり) → れい: 3ステップ、
     すべて「つぎへ」で送る (合計 2 + 3 + 3 = 8 回) */
  for (let i = 0; i < 8; i++) {
    await expect(next).toBeVisible({ timeout: 10_000 });
    await next.click();
  }

  /* 穴埋め: 2問。LessonFaded は常に3択 */
  await answerCorrectNTimes(page, 2);

  /* れんしゅう Lv1〜3: それぞれ3問連続正解で次の段階へ (テンキー入力) */
  await expect(page.locator('[data-testid="lesson-practice"]')).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.locator('[data-testid="keypad-key"][data-key="0"]')).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.locator('[data-testid="math-choice"]')).toHaveCount(0);
  await answerCorrectNTimes(page, 3); // Lv1
  await answerCorrectNTimes(page, 3); // Lv2
  await answerCorrectNTimes(page, 3); // Lv3

  /* テスト: 10問すべて正解 (テンキー入力) */
  await expect(page.locator('[data-testid="lesson-test"]')).toBeVisible({
    timeout: 10_000,
  });
  await answerCorrectNTimes(page, 10);

  /* 合格: 画面が閉じ、mastery が can になっている */
  await expect(screen).toBeHidden({ timeout: 10_000 });
  const mastery = await page.evaluate(
    () => window.__KAZUQUEST_DEBUG__!.getSave().mastery,
  );
  expect(mastery.g3_div?.state).toBe("can");
});
