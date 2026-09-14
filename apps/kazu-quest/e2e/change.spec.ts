import { expect, test } from "@playwright/test";
import {
  advanceDialog,
  correctChoice,
  startGame,
  teleport,
  warp,
} from "./helpers";
import { cashback } from "../src/lib/shop/change";

/*
 * お店のおつりチャレンジ (KQ-33)。
 * 王都の道具屋で先頭の品物 (やくそう 8G) を買う → 「おつりチャレンジに ちょうせんする?」
 * に はい → 出題パネルの正解を押す → ゴールドが「代金を引いた額 + 代金の 10% (最低 1G)」になる。
 * 位置決めは warp/teleport (デバッグフック)。
 */

const SHOP_MAP = "ch1-capital-shop";
const YAKUSOU_PRICE = 8;
const CHALLENGE_PROMPT_TEXT = "おつりチャレンジ";

test("shop change challenge: buy → challenge → correct answer refunds 10%", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startGame(page);
  /* キリのいい額 (10/50/100G) で払えるだけの もちがねを用意する */
  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.grantGold(500));
  await warp(page, SHOP_MAP, "start");
  /* 店主 (3,3) の前に立つ */
  await teleport(page, 3, 4, "up");

  const before = (await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave()))
    .inventory.gold;
  expect(before).toBeGreaterThanOrEqual(100);

  /* 「いらっしゃい…」を z で送り、品物リスト (list) が出たら止める */
  const options = page.locator('[data-testid="ui-option"]');
  for (let i = 0; i < 12 && (await options.count()) === 0; i++) {
    await page.keyboard.press("z");
    await page.waitForTimeout(500);
  }
  await expect(options.last()).toHaveText(/やめる/, { timeout: 10_000 });
  await expect(options.first()).toHaveText(/やくそう/);
  /* 先頭 = やくそう を買う */
  await options.first().click();

  /* 「やくそうを てにいれた!」を送ると おつりチャレンジの はい/いいえ が出る */
  const prompt = page.getByText(CHALLENGE_PROMPT_TEXT);
  for (let i = 0; i < 10 && !(await prompt.isVisible().catch(() => false)); i++) {
    await page.keyboard.press("z");
    await page.waitForTimeout(500);
  }
  await expect(prompt).toBeVisible({ timeout: 10_000 });
  /* はい = 0 */
  await options.nth(0).click();

  /* 出題パネル: 正解ボタン (data-answer="1") をタップ */
  const answer = correctChoice(page);
  await expect(answer).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Gで はらった。おつりは いくら\?/)).toBeVisible();
  await answer.click();

  /* 「せいかい! nG もどってきた!」 → 品物リストに戻るので やめる → まいど */
  await expect(page.getByText(/せいかい! \d+G もどってきた!/)).toBeVisible({
    timeout: 10_000,
  });
  await page.keyboard.press("z");
  await expect(options.last()).toHaveText(/やめる/, { timeout: 10_000 });
  await options.last().click();
  await advanceDialog(page);

  const save = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());
  expect(save.location.mapId).toBe(SHOP_MAP);
  expect(save.inventory.items.yakusou).toBeGreaterThanOrEqual(1);
  expect(save.inventory.gold).toBe(before - YAKUSOU_PRICE + cashback(YAKUSOU_PRICE));
});
