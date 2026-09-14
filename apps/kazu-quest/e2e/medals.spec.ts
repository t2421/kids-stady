import { expect, test, type Page } from "@playwright/test";
import { advanceDialog, correctChoice, startGame, teleport, warp } from "./helpers";

/*
 * KQ-31: NPC ミニクイズ + ひらめきメダル交換所 (王都カズール)。
 *   - クイズずき (3,11): 正解で ひらめきメダル 1枚 (c1.quizNpc)。2回目は「また あそぼうね」
 *   - メダル しゅうしゅうか (16,12): メダル 3枚 → かわのよろい。足りなければ「たりないよ」
 * メダルは __KAZUQUEST_DEBUG__.giveItem で直接渡す (ほこら10問は review.spec が担う)。
 */

const option = (page: Page, label: string) =>
  page.locator('[data-testid="ui-option"]', { hasText: label });

const messageText = (page: Page) => page.locator('[data-testid="ui-message-text"]');

const save = (page: Page) => page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());

const medals = async (page: Page) => (await save(page)).inventory.items.hiramekiMedal ?? 0;

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

/* 会話を z で送り、出題パネルが出たら正解ボタンを押す */
async function answerQuizCorrect(page: Page) {
  const btn = correctChoice(page);
  for (let i = 0; i < 20; i++) {
    if ((await btn.isVisible()) && (await btn.isEnabled())) {
      await btn.click();
      return;
    }
    await page.keyboard.press("z");
    await page.waitForTimeout(400);
  }
  throw new Error("クイズの 出題パネルが出ない");
}

test("medal collector: 3 medals → かわのよろい, then 0 medals → たりない", async ({ page }) => {
  test.setTimeout(120_000);
  await startGame(page);
  await warp(page, "ch1-capital", "entrance");
  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.giveItem("hiramekiMedal", 3));
  expect(await medals(page)).toBe(3);
  const armorBefore = (await save(page)).inventory.items.kawaNoYoroi ?? 0;

  /* しゅうしゅうか (16,12) の上 (16,11) から 下を向いて話す */
  await teleport(page, 16, 11, "down");
  await page.keyboard.press("z");
  await chooseOption(page, "はい"); /* メダル 3まいで かわのよろいと こうかんする? */
  await expect(messageText(page)).toContainText("こうかん せいりつ", { timeout: 5_000 });
  await advanceDialog(page);

  const after = await save(page);
  expect(after.inventory.items.kawaNoYoroi ?? 0).toBe(armorBefore + 1);
  expect(after.inventory.items.hiramekiMedal ?? 0).toBe(0);

  /* 0枚で もういちど: 減らず、たりないと言われる */
  await page.keyboard.press("z");
  await chooseOption(page, "はい");
  await expect(messageText(page)).toContainText("たりない", { timeout: 5_000 });
  await advanceDialog(page);
  const again = await save(page);
  expect(again.inventory.items.kawaNoYoroi ?? 0).toBe(armorBefore + 1);
  expect(again.inventory.items.hiramekiMedal ?? 0).toBe(0);
});

test("quiz fan in 王都 gives one medal once, then says また あそぼうね", async ({ page }) => {
  test.setTimeout(120_000);
  await startGame(page);
  await warp(page, "ch1-capital", "entrance");
  expect(await medals(page)).toBe(0);

  /* クイズずき (3,11) の下 (3,12) から 上を向いて話す */
  await teleport(page, 3, 12, "up");
  await page.keyboard.press("z");
  await answerQuizCorrect(page);
  /* 正解メッセージを送るまで giveItem は実行されない (runner は逐次) */
  for (let i = 0; i < 12 && (await medals(page)) < 1; i++) {
    await page.keyboard.press("z");
    await page.waitForTimeout(400);
  }
  expect(await medals(page)).toBeGreaterThanOrEqual(1);
  await advanceDialog(page);
  const first = await save(page);
  expect(first.inventory.items.hiramekiMedal).toBe(1);
  expect(first.flags["c1.quizNpc"]).toBe(true);

  /* 2回目: クイズは出ず、メダルも増えない */
  await page.keyboard.press("z");
  await expect(messageText(page)).toContainText("また あそぼうね", { timeout: 5_000 });
  await advanceDialog(page);
  expect(await medals(page)).toBe(1);
  await expect(correctChoice(page)).toBeHidden();
});
