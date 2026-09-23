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

/*
 * デスクトップの Chromium は ビューポートを縦にしても screen.orientation は
 * 横のまま (モニタの向き)。本物の iPad は 本体を回すと screen.orientation も
 * 回るので、それに合わせて「ウィンドウの縦横 = 本体の向き」を再現する。
 * splitView: true のときは 本体は横のまま (= Split View / Slide Over)
 */
async function emulateDevice(page: import("@playwright/test").Page, opts: { splitView?: boolean } = {}) {
  await page.addInitScript((splitView: boolean) => {
    const type = () =>
      splitView || window.innerWidth >= window.innerHeight ? "landscape-primary" : "portrait-primary";
    Object.defineProperty(window.screen, "orientation", {
      configurable: true,
      get: () => ({ type: type(), angle: 0, addEventListener() {}, removeEventListener() {} }),
    });
  }, opts.splitView ?? false);
}

test.describe("orientation guard", () => {
  test("portrait viewport (768x1024) shows the guard", async ({ page }) => {
    await emulateDevice(page);
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
    await emulateDevice(page);
    await page.setViewportSize(PORTRAIT);
    await page.goto("/");
    await expect(guard(page)).toBeVisible({ timeout: 20_000 });

    await page.setViewportSize(LANDSCAPE);
    await expect(guard(page)).toHaveCount(0);

    await page.setViewportSize(PORTRAIT);
    await expect(guard(page)).toBeVisible();
  });

  /* 本体は横なのに ウィンドウが縦長 (Split View) なら、回せとは言わず 広げてと言う */
  test("split view on a landscape iPad asks to widen the window", async ({ page }) => {
    await emulateDevice(page, { splitView: true });
    await page.setViewportSize({ width: 540, height: 810 });
    await page.goto("/");
    await expect(guard(page)).toBeVisible({ timeout: 20_000 });
    await expect(guard(page)).toContainText("がめんを ひろげてね");
  });
});
