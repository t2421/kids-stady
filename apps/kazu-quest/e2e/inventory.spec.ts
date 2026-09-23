import { expect, test } from "@playwright/test";
import { advanceDialog, startGame, teleport, warp } from "./helpers";

/*
 * もちものの出口 (2つ):
 *   1. 道具屋の「うる」— 半値で買いとってもらう
 *   2. もちものタブの「すてる」— 確認してから 手ばなす
 * たいせつなもの (ひらめきメダル) は どちらにも出てこないことも見る。
 */

type P = Parameters<typeof startGame>[0];

const SHOP_MAP = "ch1-capital-shop";

async function openStatusPanel(page: P) {
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

const inventory = (page: P) =>
  page.evaluate(() => {
    const s = window.__KAZUQUEST_DEBUG__!.getSave();
    return { gold: s.inventory.gold, items: s.inventory.items };
  });

test("shop sell: 半値で買いとってもらう (たいせつなものは 一覧に出ない)", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startGame(page);
  await page.evaluate(() => {
    window.__KAZUQUEST_DEBUG__!.giveItem("yakusou", 2);
    window.__KAZUQUEST_DEBUG__!.giveItem("hiramekiMedal", 1);
  });
  const before = await inventory(page);

  await warp(page, SHOP_MAP, "start");
  await teleport(page, 3, 4, "up");

  /* 「いらっしゃい…」を送り、かう/うる の入口を出す */
  const options = page.locator('[data-testid="ui-option"]');
  for (let i = 0; i < 12 && (await options.count()) === 0; i++) {
    await page.keyboard.press("z");
    await page.waitForTimeout(500);
  }
  await expect(options.first()).toHaveText(/かう/, { timeout: 10_000 });
  await options.nth(1).click(); /* うる */

  /* うり物一覧: やくそう だけが並ぶ (ひらめきメダルは たいせつなもの) */
  await expect(options.first()).toHaveText(/やくそう .*4G/, { timeout: 10_000 });
  await expect(page.getByText("ひらめきメダル")).toHaveCount(0);
  await expect(options.last()).toHaveText(/やめる/);
  await options.first().click();

  /* 「やくそうを 4Gで うる?」 → はい */
  await expect(page.getByText(/やくそうを 4Gで うる\?/)).toBeVisible({ timeout: 10_000 });
  await options.first().click();
  await expect(page.getByText(/やくそうを うって 4G もらった!/)).toBeVisible({
    timeout: 10_000,
  });
  await page.keyboard.press("z");

  /* うり物一覧に戻る → やめる で入口へ → やめる で会話に戻る */
  await expect(options.first()).toHaveText(/やくそう/, { timeout: 10_000 });
  await options.last().click();
  await expect(options.first()).toHaveText(/かう/, { timeout: 10_000 });
  await options.last().click();
  await advanceDialog(page);

  const after = await inventory(page);
  expect(after.gold).toBe(before.gold + 4);
  expect(after.items.yakusou).toBe(1);
  expect(after.items.hiramekiMedal).toBe(1);
});

test("inventory discard: 確認してから すてる (たいせつなものには ボタンが出ない)", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startGame(page);
  await page.evaluate(() => {
    window.__KAZUQUEST_DEBUG__!.giveItem("hinokiNoBou", 1);
    window.__KAZUQUEST_DEBUG__!.giveItem("hiramekiMedal", 1);
  });

  await openStatusPanel(page);
  await page.getByRole("button", { name: "もちもの", exact: true }).click();

  /* たいせつなもの には すてる が出ない */
  await expect(
    page.locator('[data-testid="item-discard"][data-id="hiramekiMedal"]'),
  ).toHaveCount(0);

  /* 1回目のタップは確認だけ — まだ減らない */
  const discard = page.locator('[data-testid="item-discard"][data-id="hinokiNoBou"]');
  await expect(discard).toBeVisible();
  await discard.click();
  await expect(page.getByText("ひのきのぼうを すてる?")).toBeVisible();
  expect((await inventory(page)).items.hinokiNoBou).toBe(1);

  /* やめる で元に戻る */
  await page.locator('[data-testid="item-discard-cancel"]').click();
  await expect(discard).toBeVisible();
  expect((await inventory(page)).items.hinokiNoBou).toBe(1);

  /* すてる → 行が消えて もちものから無くなる */
  await discard.click();
  await page.locator('[data-testid="item-discard-yes"]').click();
  await expect(page.getByText("ひのきのぼうを すてた。")).toBeVisible();
  await expect(discard).toHaveCount(0);

  const after = await inventory(page);
  expect(after.items.hinokiNoBou).toBeUndefined();
  expect(after.items.hiramekiMedal).toBe(1);
});
