import { expect, test, type Page } from "@playwright/test";
import { startGame } from "./helpers";

/*
 * LP-12: 小1 全6単元の本文を通した E2E。章1の中核3単元のひとつ g1_add_carry
 * (たしざん・くりあがりあり) で story → concept → れい → 穴埋め → れんしゅう Lv1〜3
 * → テスト まで通しで検証する (e2e/lesson.spec.ts の g1_add_nc のパターンを踏襲)。
 * g1_add_carry の本文は src/content/lessons/grade1/g1_add_carry.ts:
 *   story 2ページ / concept 2ページ / workedExample 3ステップ / faded 2問
 */

/* 出題パネルの正解ボタン (3択。小1単元は常に3択 — KQ-12) */
const lessonCorrectChoice = (page: Page) =>
  page.locator('[data-testid="math-choice"][data-answer="1"]');

/* 正解を n 回連続でタップする (AUTO_ADVANCE_MS=900 + 余裕をもって待つ) */
async function answerCorrectNTimes(page: Page, n: number) {
  for (let i = 0; i < n; i++) {
    const choice = lessonCorrectChoice(page);
    await expect(choice).toBeVisible({ timeout: 10_000 });
    await choice.click();
    await page.waitForTimeout(1_100);
  }
}

test("lesson: g1_add_carry を story → concept → れい → 穴埋め → れんしゅう Lv1〜3 → テスト まで通して can になる", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startGame(page);

  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.openLesson("g1_add_carry"));

  const screen = page.locator('[data-testid="lesson-screen"]');
  await expect(screen).toBeVisible({ timeout: 10_000 });
  const next = page.locator('[data-testid="lesson-next"]');

  /* story (2ページ) → concept (2ページ、どちらも図つき) → れい (3ステップ) を
     「つぎへ」で送る (2 + 2 + 3 = 7 クリック で 穴埋めに到達する) */
  await expect(page.locator('[data-testid="lesson-page-0"]')).toBeVisible();
  await next.click();
  await expect(page.locator('[data-testid="lesson-page-1"]')).toBeVisible();
  await next.click();

  await expect(page.locator('[data-testid="lesson-page-0"]')).toBeVisible();
  await expect(page.locator('[data-testid="lesson-figure"]')).toBeVisible();
  await next.click();
  await expect(page.locator('[data-testid="lesson-page-1"]')).toBeVisible();
  await expect(page.locator('[data-testid="lesson-figure"]')).toBeVisible();
  await next.click();

  await expect(page.locator('[data-testid="lesson-page-0"]')).toBeVisible();
  await next.click();
  await expect(page.locator('[data-testid="lesson-page-1"]')).toBeVisible();
  await next.click();
  await expect(page.locator('[data-testid="lesson-page-2"]')).toBeVisible();
  await next.click();

  /* 穴埋め (faded): 2問、3択で正解を選ぶ。mastery は story 開始時点で practicing */
  await answerCorrectNTimes(page, 2);

  const masteryAfterFaded = await page.evaluate(
    () => window.__KAZUQUEST_DEBUG__!.getSave().mastery,
  );
  expect(masteryAfterFaded.g1_add_carry?.state).toBe("practicing");

  /* れんしゅう Lv1〜3: それぞれ3問連続正解で次の段階へ */
  await expect(page.locator('[data-testid="lesson-practice"]')).toBeVisible({
    timeout: 10_000,
  });
  await answerCorrectNTimes(page, 3); // Lv1
  await answerCorrectNTimes(page, 3); // Lv2
  await answerCorrectNTimes(page, 3); // Lv3

  /* テスト: 10問すべて正解 */
  await expect(page.locator('[data-testid="lesson-test"]')).toBeVisible({
    timeout: 10_000,
  });
  await answerCorrectNTimes(page, 10);

  /* 合格: 画面が閉じ、mastery が can になっている (practicing で終わらない) */
  await expect(screen).toBeHidden({ timeout: 10_000 });
  const mastery = await page.evaluate(
    () => window.__KAZUQUEST_DEBUG__!.getSave().mastery,
  );
  expect(mastery.g1_add_carry?.state).toBe("can");
});
