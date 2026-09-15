import { expect, test, type Page } from "@playwright/test";
import { answerCorrectOnce, startGame } from "./helpers";

/*
 * LessonScreen の学年6版 通しテスト (LP-17)。中核単元 g6_speed を
 * story → concept → れい → 穴埋め → れんしゅう Lv1〜3 → テスト まで通し、
 * mastery.g6_speed.state === "can" になることを確認する。
 *
 * g6_speed は小6単元 (grade >= KEYPAD_MIN_GRADE=3) なので、れんしゅう・テストは
 * テンキー入力 (KQ-12) — answerCorrectOnce (e2e/helpers.ts) が
 * __KAZUQUEST_DEBUG__.currentAnswer() を1文字ずつタップして「こたえる」を押す。
 * 穴埋め (LessonFaded) は学年に関わらず常に3択 (LessonFaded.tsx の仕様) なので
 * data-answer="1" の正解ボタンを直接タップする (e2e/lesson.spec.ts と同じ形)。
 *
 * まなびやの先生からの導線はまだ無い (LP-18 の仕事) ので、__KAZUQUEST_DEBUG__.openLesson
 * (E2E 専用の暫定フック) で直接開く — e2e/lesson.spec.ts と同じ手法。
 */

/* 正解を n 回連続でタップする (3択・テンキーどちらも可。AUTO_ADVANCE_MS=900 + 余裕をもって待つ) */
async function answerCorrectNTimes(page: Page, n: number) {
  for (let i = 0; i < n; i++) {
    await answerCorrectOnce(page);
    await page.waitForTimeout(1_100);
  }
}

test("lesson (grade6): g6_speed を story → concept → れい → 穴埋め → れんしゅう Lv1〜3 → テスト まで合格して can になる", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startGame(page);

  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.openLesson("g6_speed"));

  const screen = page.locator('[data-testid="lesson-screen"]');
  await expect(screen).toBeVisible({ timeout: 10_000 });
  const next = page.locator('[data-testid="lesson-next"]');

  /* story (2ページ) → concept (3ページ、図あり) → れい (3ステップ、図あり) は「つぎへ」で送る */
  for (let i = 0; i < 2 + 3 + 3; i++) {
    await expect(next).toBeVisible({ timeout: 10_000 });
    await next.click();
  }

  /* 穴埋め: 2問 (常に3択 — LessonFaded.tsx の仕様。正解を選ぶ) */
  for (let i = 0; i < 2; i++) {
    const correctChoice = page.locator('[data-testid="math-choice"][data-answer="1"]');
    await expect(correctChoice).toBeVisible({ timeout: 10_000 });
    await correctChoice.click();
    await page.waitForTimeout(1_100);
  }

  /* れんしゅう Lv1〜3: テンキーで それぞれ3問連続正解して次の段階へ */
  await expect(page.locator('[data-testid="lesson-practice"]')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('[data-testid="keypad-display"]')).toBeVisible({ timeout: 10_000 });
  await answerCorrectNTimes(page, 3); // Lv1
  await answerCorrectNTimes(page, 3); // Lv2
  await answerCorrectNTimes(page, 3); // Lv3

  /* テスト: テンキーで 10問すべて正解 */
  await expect(page.locator('[data-testid="lesson-test"]')).toBeVisible({ timeout: 10_000 });
  await answerCorrectNTimes(page, 10);

  /* 合格: 画面が閉じ、mastery が can になっている */
  await expect(screen).toBeHidden({ timeout: 10_000 });
  const mastery = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave().mastery);
  expect(mastery.g6_speed?.state).toBe("can");
});
