import { expect, test } from "@playwright/test";
import { startGame } from "./helpers";

/*
 * LessonScreen の導入→概念→れい→穴埋め の4段階を通しで検証する (LP-08)。
 * まだマップ側に「まなびやの先生」の導線が無いので (LP-18 の仕事)、
 * __KAZUQUEST_DEBUG__.openLesson (E2E 専用の暫定フック) で直接開く。
 * レッスンは g1_add_nc の1本だけが本物のデータ (LP-12 以降が学年ぶん足す)。
 */

test("lesson: g1_add_nc を story → concept → れい → 穴埋め まで通す", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startGame(page);

  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.openLesson("g1_add_nc"));

  const screen = page.locator('[data-testid="lesson-screen"]');
  await expect(screen).toBeVisible({ timeout: 10_000 });

  const next = page.locator('[data-testid="lesson-next"]');

  /* story: 1ページ */
  await expect(page.locator('[data-testid="lesson-page-0"]')).toBeVisible();
  await next.click();

  /* concept: 2ページ、どちらも図 (tenFrame) つき */
  await expect(page.locator('[data-testid="lesson-page-0"]')).toBeVisible();
  await expect(page.locator('[data-testid="lesson-figure"]')).toBeVisible();
  await next.click();
  await expect(page.locator('[data-testid="lesson-page-1"]')).toBeVisible();
  await expect(page.locator('[data-testid="lesson-figure"]')).toBeVisible();
  await next.click();

  /* れい (workedExample): 2ステップ */
  await expect(page.locator('[data-testid="lesson-page-0"]')).toBeVisible();
  await next.click();
  await expect(page.locator('[data-testid="lesson-page-1"]')).toBeVisible();
  await next.click();

  /* 穴埋め (faded): 2問、3択で答える (正解ボタンを選ぶ) */
  for (let i = 0; i < 2; i++) {
    const correctChoice = page.locator(
      '[data-testid="math-choice"][data-answer="1"]',
    );
    await expect(correctChoice).toBeVisible({ timeout: 10_000 });
    await correctChoice.click();
    await page.waitForTimeout(1_100); // AUTO_ADVANCE_MS + margin
  }

  /* 完了: 画面が閉じ、mastery が practicing になっている */
  await expect(screen).toBeHidden({ timeout: 10_000 });
  const mastery = await page.evaluate(
    () => window.__KAZUQUEST_DEBUG__!.getSave().mastery,
  );
  expect(mastery.g1_add_nc?.state).toBe("practicing");
});
