import { expect, test } from "@playwright/test";
import { startGame } from "./helpers";

/*
 * ReviewScreen.tsx (間隔復習「おさらい」, LP-11 §3.6) の単体検証。
 * まだマップ側に「おさらい」の導線が無いので (LP-18 の仕事)、
 * __KAZUQUEST_DEBUG__.setMastery / advanceClock / openReview
 * (E2E 専用の暫定フック) で「期日が来た状態」を直接作って開く。
 * 名前は e2e/review.spec.ts (既存の ふくしゅうのほこら KQ-13 のテスト) と
 * 衝突しないよう lessonReview.spec.ts にしている (LP-11 タスク仕様の指示どおり)。
 */

const lessonCorrectChoice = (page: import("@playwright/test").Page) =>
  page.locator('[data-testid="math-choice"][data-answer="1"]');

test("review: 期日が来た g1_add_nc を5問正解し、mastery.streak が増えて閉じる", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await startGame(page);

  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.setMastery("g1_add_nc", "can"));
  /* setMastery は reviewDue = now + 1日 を積む。2日進めて期日超過にする */
  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.advanceClock(2 * 24 * 60 * 60 * 1000));

  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.openReview());

  const screen = page.locator('[data-testid="review-screen"]');
  await expect(screen).toBeVisible({ timeout: 10_000 });

  /* g1_add_nc は小1単元なので常に3択 (KQ-12)。5問すべて正解する */
  for (let i = 0; i < 5; i++) {
    const choice = lessonCorrectChoice(page);
    await expect(choice).toBeVisible({ timeout: 10_000 });
    await choice.click();
    await page.waitForTimeout(1_100); // AUTO_ADVANCE_MS(900) + 余裕
  }

  await expect(screen).toBeHidden({ timeout: 10_000 });

  const mastery = await page.evaluate(
    () => window.__KAZUQUEST_DEBUG__!.getSave().mastery,
  );
  expect(mastery.g1_add_nc?.streak).toBeGreaterThan(0);
});

test("review: 期日の来た単元が無ければ即座に閉じられる (じゅんびちゅう相当のメッセージ)", async ({
  page,
}) => {
  test.setTimeout(30_000);
  await startGame(page);

  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.openReview());

  const screen = page.locator('[data-testid="review-screen"]');
  await expect(screen).toBeVisible({ timeout: 10_000 });
  await page.locator('[data-testid="review-close"]').click();
  await expect(screen).toBeHidden({ timeout: 5_000 });
});
