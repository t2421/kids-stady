import { expect, test } from "@playwright/test";
import { startGame } from "./helpers";

/*
 * KQ-14 ぼうけんのせいせき: ステータスパネル → せいせき タブで
 * 学年ごとの帯グラフ (6行) と 数晶 (6個) が描画され、とじる で戻れること。
 */

/* X キーでステータスパネルを開く (高負荷に備えリトライ) */
async function openStatusPanel(page: Parameters<typeof startGame>[0]) {
  const panel = page.locator('[data-testid="status-panel"]');
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.keyboard.press("x");
    try {
      await panel.waitFor({ state: "visible", timeout: 3_000 });
      return;
    } catch {
      /* 開かなかった → リトライ */
    }
  }
  throw new Error("ステータスパネルが開かない");
}

test("stats tab: せいせき shows 6 grade bars and 6 orbs", async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await startGame(page);
  await page.waitForTimeout(400);

  await openStatusPanel(page);
  await page.getByRole("button", { name: "せいせき", exact: true }).click();

  const body = page.locator('[data-testid="stats-body"]');
  await expect(body).toBeVisible();
  await expect(page.locator('[data-testid="stats-grade-bar"]')).toHaveCount(6);
  await expect(page.locator('[data-testid="stats-orb"]')).toHaveCount(6);
  /* 新規ゲームなので 数晶は すべて消灯 */
  await expect(page.locator('[data-testid="stats-orb"][data-lit="1"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="stats-daily-chart"]')).toBeVisible();
  await expect(page.locator('[data-testid="stats-playtime"]')).toBeVisible();

  await page.locator('[data-testid="status-close"]').click();
  await page.locator('[data-testid="status-panel"]').waitFor({ state: "hidden", timeout: 5_000 });
  expect(errors).toEqual([]);
});
