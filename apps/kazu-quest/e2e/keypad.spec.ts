import { expect, test, type Page } from "@playwright/test";
import {
  answerAllCorrectUntilHidden,
  correctChoice,
  keypadDisplay,
  seedChapter,
  startGame,
  startSpellTest,
  teleport,
  warp,
} from "./helpers";

/*
 * テンキー入力モード (KQ-12): 小3以降の習得テストはテンキーで答える。
 * - 章3 ワケーラのまなびや (ワリダマ = g3_div): テンキーが出て、全キー ≥72px、
 *   正解を打って全問通すと習得する
 * - 章1 王城のまなびや (ヒキダマ = g1_sub_nc): 引き続き3択
 * default (デスクトップ) と ipad の両プロジェクトで走る (playwright.config.ts)。
 */

const KEY_MIN_PX = 72;

const learned = (page: Page, spellId: string) =>
  page.waitForFunction(
    (id) => window.__KAZUQUEST_DEBUG__!.getSave().party[0].learnedSpells.includes(id),
    spellId,
    { timeout: 15_000 },
  );

test("keypad: chapter 3 spell test uses the keypad (keys >= 72px) and passes with typed answers", async ({
  page,
}) => {
  test.setTimeout(240_000);
  const start = await seedChapter(page, 3);
  expect(start.mapId).toBe("ch3-wakeera");

  /* まなびや: 学者 (4,2) の最初の選択肢 = ワリダマ */
  await warp(page, "ch3-wakeera-manabiya", "start");
  await teleport(page, 4, 3, "up");
  await startSpellTest(page);

  /* テンキーが出て、3択は出ない。パネルは keypad モードを名乗る */
  await expect(keypadDisplay(page)).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('[data-testid="math-choice"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="math-prompt"]')).toHaveAttribute(
    "data-input-mode",
    "keypad",
  );
  await expect(page.locator('[data-testid="spell-test-banner"]')).toContainText(
    "しゅうとくテスト: ワリダマ",
  );

  /* 全キー (0〜9 . / けす こたえる) が指向けサイズ */
  const keys = page.locator(
    '[data-testid="keypad-key"], [data-testid="keypad-clear"], [data-testid="keypad-submit"]',
  );
  expect(await keys.count()).toBe(14);
  for (const box of await keys.evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { w: r.width, h: r.height };
    }),
  )) {
    expect(box.w).toBeGreaterThanOrEqual(KEY_MIN_PX);
    expect(box.h).toBeGreaterThanOrEqual(KEY_MIN_PX);
  }

  /* 空欄では「こたえる」が押せない。わり算 (整数) なので . と / は無効 */
  await expect(page.locator('[data-testid="keypad-submit"]')).toBeDisabled();
  await expect(page.locator('[data-testid="keypad-key"][data-key="."]')).toBeDisabled();
  await expect(page.locator('[data-testid="keypad-key"][data-key="/"]')).toBeDisabled();

  /* 打つ → 表示欄に出る → けす で消える */
  await page.locator('[data-testid="keypad-key"][data-key="7"]').click();
  await expect(keypadDisplay(page)).toHaveText("7");
  await expect(page.locator('[data-testid="keypad-submit"]')).toBeEnabled();
  await page.locator('[data-testid="keypad-clear"]').click();
  await expect(keypadDisplay(page)).not.toHaveText("7");
  await expect(page.locator('[data-testid="keypad-submit"]')).toBeDisabled();

  /* 正解を打って全問通す → 習得 */
  await answerAllCorrectUntilHidden(page, "spell-test-banner");
  await learned(page, "waridama");
});

test("keypad: chapter 1 spell test still uses the three choices", async ({ page }) => {
  test.setTimeout(120_000);
  await startGame(page);

  /* 王城の まなびや (賢者は (2,4)) — ヒキダマ (小1) */
  await warp(page, "ch1-capital-castle", "start");
  await teleport(page, 3, 4, "left");
  await startSpellTest(page);

  await expect(correctChoice(page)).toBeVisible({ timeout: 10_000 });
  await expect(keypadDisplay(page)).toHaveCount(0);
  await expect(page.locator('[data-testid="math-prompt"]')).toHaveAttribute(
    "data-input-mode",
    "choices",
  );
});
