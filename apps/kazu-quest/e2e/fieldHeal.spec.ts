import { expect, test } from "@playwright/test";
import { answerCorrectOnce, startGame, waitForAnswerable } from "./helpers";

/*
 * フィールド回復 (戦闘外): ステータスパネルの もちもの / じゅもん から
 * やくそう・タシリアを使う。アイテムは即時、呪文は算数 1 問 (時間無制限) で
 * 正解→回復+MP消費、不正解→何も変わらず「じゅもんが みだれた!」。
 * パネルは開いた時点のセーブで描くので、デバッグフックで HP を書いたら開き直す。
 */

type P = Parameters<typeof startGame>[0];

/* X キーでステータスパネルを開く (高負荷に備えリトライ) */
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

async function closeStatusPanel(page: P) {
  await page.locator('[data-testid="status-close"]').click();
  await page.locator('[data-testid="status-panel"]').waitFor({ state: "hidden", timeout: 5_000 });
  await page.waitForTimeout(500);
}

const hero = (page: P) =>
  page.evaluate(() => {
    const s = window.__KAZUQUEST_DEBUG__!.getSave();
    const h = s.party.find((m) => m.memberId === "hero")!;
    return { hp: h.hp, mp: h.mp, yakusou: s.inventory.items.yakusou ?? 0, mistakes: s.mistakes.length };
  });

test("field heal: やくそう and タシリア from the status panel", async ({ page }) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await startGame(page);
  await page.waitForTimeout(400);

  /* ---- もちもの: やくそう → ゆうしゃ ---- */
  await page.evaluate(() => {
    window.__KAZUQUEST_DEBUG__!.giveItem("yakusou", 2);
    window.__KAZUQUEST_DEBUG__!.setHp("hero", 5);
  });
  await openStatusPanel(page);
  await page.getByRole("button", { name: "もちもの", exact: true }).click();
  const itemUse = page.locator('[data-testid="item-use"][data-id="yakusou"]');
  await expect(itemUse).toBeVisible();
  await expect(itemUse).toBeEnabled();
  await itemUse.click();
  await page.locator('[data-testid="heal-target"][data-member="hero"]').click();

  await expect(page.locator('[data-testid="heal-result"]')).toBeVisible();
  await expect(page.locator('[data-testid="heal-result"]')).toContainText("かいふくした");
  const afterItem = await hero(page);
  expect(afterItem.hp).toBeGreaterThan(5);
  expect(afterItem.yakusou).toBe(1);
  /* 表示も組み直っている (×1) */
  await expect(page.getByText("やくそう ×1")).toBeVisible();
  await closeStatusPanel(page);

  /* ---- じゅもん: タシリア 正解 → 回復 + MP-2 ---- */
  await page.evaluate(() => {
    window.__KAZUQUEST_DEBUG__!.learnSpell("tashiria");
    window.__KAZUQUEST_DEBUG__!.setHp("hero", 5);
  });
  const beforeSpell = await hero(page);
  await openStatusPanel(page);
  await page.getByRole("button", { name: "じゅもん", exact: true }).click();
  const spellUse = page.locator('[data-testid="spell-use"][data-id="tashiria"]');
  await expect(spellUse).toBeVisible();
  await expect(spellUse).toBeEnabled();
  await spellUse.click();
  await page.locator('[data-testid="heal-target"][data-member="hero"]').click();

  /* 出題中は とじる が隠れる (パネルが消えて結果の受け手がいなくなる事故を防ぐ) */
  await expect(page.locator('[data-testid="math-prompt"]')).toBeVisible();
  await expect(page.locator('[data-testid="status-close"]')).toBeHidden();
  await waitForAnswerable(page);
  await answerCorrectOnce(page);

  await expect(page.locator('[data-testid="heal-result"]')).toContainText("かいふくした", {
    timeout: 10_000,
  });
  const afterSpell = await hero(page);
  expect(afterSpell.hp).toBeGreaterThan(5);
  expect(afterSpell.mp).toBe(beforeSpell.mp - 2);
  await expect(page.locator('[data-testid="status-close"]')).toBeVisible();
  await closeStatusPanel(page);

  /* ---- じゅもん: 不正解 → HP/MP そのまま、みだれた ---- */
  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.setHp("hero", 5));
  const beforeWrong = await hero(page);
  await openStatusPanel(page);
  await page.getByRole("button", { name: "じゅもん", exact: true }).click();
  await page.locator('[data-testid="spell-use"][data-id="tashiria"]').click();
  await page.locator('[data-testid="heal-target"][data-member="hero"]').click();
  await waitForAnswerable(page);
  await page.locator('[data-testid="math-choice"][data-answer="0"]').first().click();

  await expect(page.locator('[data-testid="heal-result"]')).toContainText("みだれた", {
    timeout: 10_000,
  });
  const afterWrong = await hero(page);
  expect(afterWrong.hp).toBe(beforeWrong.hp);
  expect(afterWrong.mp).toBe(beforeWrong.mp);
  /* まちがいノートに積まれる */
  expect(afterWrong.mistakes).toBe(beforeWrong.mistakes + 1);
  await closeStatusPanel(page);
  expect(errors).toEqual([]);
});
