import { test } from "@playwright/test";

/* startInDevVillage と同じ流れを再現し、シーン生成トレースを観察する */
test("trace warp reversion", async ({ page }) => {
  for (let round = 0; round < 4; round++) {
    await page.goto("/");
    await page.waitForFunction(() =>
      (window as never as { __KAZUQUEST_GAME__?: { scene: { isActive(k: string): boolean } } }).__KAZUQUEST_GAME__?.scene.isActive("Title"),
    );
    await page.locator("canvas").click({ position: { x: 640, y: 360 } });
    await page.waitForFunction(() =>
      (window as never as { __KAZUQUEST_GAME__?: { scene: { isActive(k: string): boolean } } }).__KAZUQUEST_GAME__?.scene.isActive("Field"),
    );
    await page.waitForTimeout(400);
    await page.evaluate(() =>
      (window as never as { __KAZUQUEST_DEBUG__: { warp(m: string, s: string): void } }).__KAZUQUEST_DEBUG__.warp("dev-village", "start"),
    );
    await page.waitForTimeout(2500);
    const result = await page.evaluate(() => {
      const w = window as never as {
        __KAZUQUEST_TRACE__?: unknown[];
        __KAZUQUEST_DEBUG__: { getSave(): { location: { mapId: string } } };
      };
      return {
        finalMap: w.__KAZUQUEST_DEBUG__.getSave().location.mapId,
        trace: w.__KAZUQUEST_TRACE__ ?? [],
      };
    });
    console.log(`ROUND${round}`, JSON.stringify(result));
  }
});
