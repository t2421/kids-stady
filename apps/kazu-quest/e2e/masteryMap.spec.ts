import { expect, test } from "@playwright/test";
import { startGame } from "./helpers";

/*
 * 単元マップ (学びの設計 LP-11b (1))。せいせきタブ → 「たんげんマップを みる」で
 * 開き、mastered な単元が金 (MASTERY_COLORS.mastered = UI_COLORS.yellow) で
 * 表示されることを確認する。少なくとも1単元を mastered にしておくため
 * __KAZUQUEST_DEBUG__.setMastery を使う (新規セーブは全単元 none なので)。
 */

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

test("mastery map: せいせきタブから開き、mastered のセルが金で表示される", async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await startGame(page);
  await page.waitForTimeout(400);

  await page.evaluate(() => {
    window.__KAZUQUEST_DEBUG__!.setMastery("g1_add_nc", "mastered");
  });

  await openStatusPanel(page);
  await page.getByRole("button", { name: "せいせき", exact: true }).click();

  const openButton = page.locator('[data-testid="open-mastery-map"]');
  await expect(openButton).toBeVisible();
  await openButton.click();

  const map = page.locator('[data-testid="mastery-map"]');
  await expect(map).toBeVisible({ timeout: 10_000 });

  /* 全44単元ぶんのセルが出る (小1:6 小2:6 小3:8 小4:8 小5:8 小6:8) */
  await expect(page.locator('[data-testid="mastery-cell"]')).toHaveCount(44);

  const masteredCell = page.locator('[data-testid="mastery-cell"][data-skill="g1_add_nc"]');
  await expect(masteredCell).toHaveAttribute("data-state", "mastered");
  const color = await masteredCell.evaluate((el) => getComputedStyle(el).borderColor);
  /* #ffd93d = rgb(255, 217, 61) */
  expect(color).toBe("rgb(255, 217, 61)");

  /* mastered でない単元は違う色 (金ではない) */
  const noneCell = page.locator('[data-testid="mastery-cell"][data-state="none"]').first();
  await expect(noneCell).toBeVisible();
  const noneColor = await noneCell.evaluate((el) => getComputedStyle(el).borderColor);
  expect(noneColor).not.toBe("rgb(255, 217, 61)");

  await page.locator('[data-testid="mastery-map-close"]').click();
  await expect(map).toBeHidden({ timeout: 5_000 });

  /* せいせきタブ (StatusPanelOverlay) はマップの裏でまだ開いたまま */
  await expect(page.locator('[data-testid="status-panel"]')).toBeVisible();
  await page.locator('[data-testid="status-close"]').click();
  await page.locator('[data-testid="status-panel"]').waitFor({ state: "hidden", timeout: 5_000 });

  expect(errors).toEqual([]);
});
