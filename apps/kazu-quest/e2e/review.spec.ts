import { expect, test, type Page } from "@playwright/test";
import { advanceDialog, correctChoice, startGame, teleport, warp } from "./helpers";

/*
 * ふくしゅうのほこら (KQ-13): 王都のほこらで
 *   「ぼうけんを きろくする?」 いいえ → 「にがてな もんだいを ふくしゅうする?」 はい
 * → 10問を全問正解 → ひらめきメダルを 1枚 持っている (本番静的ビルドで実行)。
 */

const REVIEW_QUESTIONS = 10;

const option = (page: Page, label: string) =>
  page.locator('[data-testid="ui-option"]', { hasText: label });

/* 会話を z で送り、はい/いいえ の選択肢が出たらタップで選ぶ */
async function chooseOption(page: Page, label: string) {
  const btn = option(page, label);
  for (let i = 0; i < 12; i++) {
    if (await btn.isVisible()) {
      await btn.click();
      return;
    }
    await page.keyboard.press("z");
    await page.waitForTimeout(400);
  }
  throw new Error(`選択肢 "${label}" が出ない`);
}

/* 復習バナーが消えるまで正解を押し続ける (正解フィードバック中は disabled) */
async function answerReviewAllCorrect(page: Page) {
  const btn = correctChoice(page);
  const banner = page.locator('[data-testid="review-quest-banner"]');
  /* 神官の前口上 (2ページ) を送ると出題が始まる */
  for (let i = 0; i < 30; i++) {
    if (await banner.isVisible()) break;
    await page.keyboard.press("z");
    await page.waitForTimeout(500);
  }
  await expect(banner).toBeVisible({ timeout: 10_000 });
  for (let i = 0; i < REVIEW_QUESTIONS * 6; i++) {
    if (!(await banner.isVisible())) return;
    if ((await btn.isVisible()) && (await btn.isEnabled())) {
      await btn.click({ timeout: 2_000 }).catch(() => {});
      await page.waitForTimeout(900);
    } else {
      await page.waitForTimeout(300);
    }
  }
  throw new Error("ふくしゅうが終わらない");
}

test("review shrine: いいえ → はい → 10 questions → ひらめきメダル", async ({ page }) => {
  test.setTimeout(240_000);
  await startGame(page);

  /* 王都のほこら: 神官は (4,2) なので (4,3) から上を向いて話す */
  await warp(page, "ch1-capital-shrine", "start");
  await teleport(page, 4, 3, "up");
  const before = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());
  expect(before.inventory.items.hiramekiMedal ?? 0).toBe(0);

  await page.keyboard.press("z");
  await chooseOption(page, "いいえ"); /* ぼうけんを きろくする? → いいえ */
  await page.locator("text=ふくしゅうする?").waitFor({ state: "visible", timeout: 5_000 });
  await chooseOption(page, "はい"); /* にがてな もんだいを ふくしゅうする? → はい */

  await answerReviewAllCorrect(page);

  /* 結果メッセージ (メダル + ゴールド) を送る */
  await page.waitForFunction(
    () =>
      (window.__KAZUQUEST_DEBUG__!.getSave().inventory.items.hiramekiMedal ?? 0) >= 1,
    undefined,
    { timeout: 15_000 },
  );
  await advanceDialog(page);

  const after = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());
  expect(after.inventory.items.hiramekiMedal).toBeGreaterThanOrEqual(1);
  expect(after.inventory.gold).toBeGreaterThan(before.inventory.gold);
  /* きろく (savePoint) は選んでいないので checkpoint は動かない */
  expect(after.totalCorrect - before.totalCorrect).toBe(REVIEW_QUESTIONS);
});
