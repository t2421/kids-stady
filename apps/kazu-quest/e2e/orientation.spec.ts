import { expect, test } from "@playwright/test";

/*
 * 縦持ち警告オーバーレイ (KQ-24) の E2E。
 * iPad 縦 (768x1024) で「よこむきに してね」が出て、横 (1024x768) では出ない。
 * さらに縦→横→縦とリサイズして、resize / matchMedia の change で
 * 表示が追従することを確認する。ゲームを開始する必要はなく、
 * ページを開くだけで判定できる (プロフィールゲートより前面に出る)。
 */

const PORTRAIT = { width: 768, height: 1024 };
const LANDSCAPE = { width: 1024, height: 768 };

const guard = (page: import("@playwright/test").Page) =>
  page.locator('[data-testid="orientation-guard"]');

test.describe("orientation guard", () => {
  test("portrait viewport (768x1024) shows the guard", async ({ page }) => {
    await page.setViewportSize(PORTRAIT);
    await page.goto("/");
    await expect(guard(page)).toBeVisible({ timeout: 20_000 });
    await expect(guard(page)).toContainText("よこむきに してね");
  });

  test("landscape viewport (1024x768) hides the guard", async ({ page }) => {
    await page.setViewportSize(LANDSCAPE);
    await page.goto("/");
    /* 起動 UI (プロフィールゲート) が出るまで待ってから、ガードが無いことを確認 */
    await page
      .locator('[data-testid="profile-gate"]')
      .waitFor({ state: "visible", timeout: 20_000 });
    await expect(guard(page)).toHaveCount(0);
  });

  test("guard follows viewport rotation without reload", async ({ page }) => {
    await page.setViewportSize(PORTRAIT);
    await page.goto("/");
    await expect(guard(page)).toBeVisible({ timeout: 20_000 });

    await page.setViewportSize(LANDSCAPE);
    await expect(guard(page)).toHaveCount(0);

    await page.setViewportSize(PORTRAIT);
    await expect(guard(page)).toBeVisible();
  });
});
