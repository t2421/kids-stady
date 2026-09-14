import { expect, test, type Page } from "@playwright/test";
import {
  advanceDialog,
  answerAllCorrectUntilHidden,
  answerPracticePrompt,
  correctChoice,
  startGame,
  teleport,
  warp,
} from "./helpers";

/*
 * とっくん (KQ-11): 習得テストの前に「とっくんしてから テストする?」→ はい で
 * 5問の練習 (時間無制限・ヒント・不正解は解説) → そのまま習得テスト → 合格で習得。
 */

const practiceBanner = (page: Page) =>
  page.locator('[data-testid="spell-practice-banner"]');
const testBanner = (page: Page) => page.locator('[data-testid="spell-test-banner"]');
const wrongChoice = (page: Page) =>
  page.locator('[data-testid="math-choice"][data-answer="0"]').first();

/* 賢者に話しかけ、とっくんの choice で はい を選ぶ */
async function startPractice(page: Page) {
  await page.keyboard.press("z");
  for (let i = 0; i < 30; i++) {
    if (await answerPracticePrompt(page, true)) return;
    await page.keyboard.press("z");
    await page.waitForTimeout(500);
  }
  throw new Error("とっくんの choice が出ない");
}

/* 次の問題が答えられる状態になるまで待つ */
async function waitForQuestion(page: Page) {
  await expect(correctChoice(page)).toBeVisible({ timeout: 10_000 });
  await expect(correctChoice(page)).toBeEnabled({ timeout: 10_000 });
}

test("practice: hint, explanation on a wrong answer, then the spell test", async ({
  page,
}) => {
  test.setTimeout(240_000);
  await startGame(page);

  /* 王城の まなびや (賢者は (2,4)) — ヒキダマ (くりさがりなし の ひきざん) */
  await warp(page, "ch1-capital-castle", "start");
  await teleport(page, 3, 4, "left");
  await startPractice(page);
  await expect(practiceBanner(page)).toBeVisible({ timeout: 10_000 });
  await expect(practiceBanner(page)).toContainText("とっくん: ヒキダマ");

  /* 1問目: タイマーなし、ヒントを3段ぶん開ける (段は消えずに積み重なる) */
  await waitForQuestion(page);
  const hintButton = page.locator('[data-testid="math-hint"]');
  await expect(hintButton).toBeVisible();
  const hintBox = await hintButton.boundingBox();
  expect(hintBox?.height ?? 0).toBeGreaterThanOrEqual(56);
  for (const level of [1, 2, 3]) {
    await hintButton.click();
    await expect(hintButton).toHaveAttribute("data-level", String(level));
    await expect(page.locator('[data-testid="math-hint-body"]')).toHaveCount(level);
  }

  /* わざと まちがえる → 解説 + まちがいの型の一言が出て「つぎへ」で進む */
  await wrongChoice(page).click();
  await expect(page.locator('[data-testid="math-explain-next"]')).toBeVisible();
  await expect(page.locator('[data-testid="math-explain"]')).toContainText("かいせつ");
  await expect(page.locator('[data-testid="mistake-feedback"]')).toBeVisible();
  await expect(practiceBanner(page)).toContainText("もんだい 1/5");
  await page.locator('[data-testid="math-explain-next"]').click();
  await expect(practiceBanner(page)).toContainText("もんだい 2/5", { timeout: 10_000 });

  /* 残り 4 問は正解で通す → 合否なしで そのまま しゅうとくテストへ */
  await answerAllCorrectUntilHidden(page, "spell-practice-banner", 5);
  await expect(testBanner(page)).toBeVisible({ timeout: 10_000 });
  await expect(testBanner(page)).toContainText("しゅうとくテスト: ヒキダマ");
  await answerAllCorrectUntilHidden(page, "spell-test-banner");

  await page.waitForFunction(
    () =>
      window.__KAZUQUEST_DEBUG__!.getSave().party[0].learnedSpells.includes(
        "hikidama",
      ),
    undefined,
    { timeout: 15_000 },
  );
  await advanceDialog(page);
  const save = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());
  expect(save.flags["learned.hikidama"]).toBe(true);
  /* とっくんの不正解は まちがいノートに積まない (テストの不正解だけ) */
  expect(save.mistakes).toHaveLength(0);
});

test("practice: cherry diagram hint for くりさがり (ヒキダマン)", async ({ page }) => {
  test.setTimeout(240_000);
  await startGame(page);

  /* モリカゲ村の まなびや (賢者は (4,2)) — ヒキダマン (g1_sub_borrow → さくらんぼ図) */
  await warp(page, "ch1-morikage-manabiya", "start");
  await teleport(page, 4, 3, "up");
  await startPractice(page);
  await expect(practiceBanner(page)).toBeVisible({ timeout: 10_000 });
  await expect(practiceBanner(page)).toContainText("とっくん: ヒキダマン");

  await waitForQuestion(page);
  await page.locator('[data-testid="math-hint"]').click();
  await expect(page.locator('[data-testid="math-hint-body"]')).toBeVisible();
  await expect(page.locator('[data-testid="cherry-diagram"]')).toBeVisible();
  await page.screenshot({ path: "test-results/cherry.png" });

  await answerAllCorrectUntilHidden(page, "spell-practice-banner", 5);
  await expect(testBanner(page)).toBeVisible({ timeout: 10_000 });
  await answerAllCorrectUntilHidden(page, "spell-test-banner");
  await page.waitForFunction(
    () =>
      window.__KAZUQUEST_DEBUG__!.getSave().party[0].learnedSpells.includes(
        "hikidaman",
      ),
    undefined,
    { timeout: 15_000 },
  );
  await advanceDialog(page);
});
