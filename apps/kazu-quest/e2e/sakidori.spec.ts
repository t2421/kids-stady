import { expect, test, type Page } from "@playwright/test";
import { answerGradeQuestion, seedChapter, teleport, walkLessonToPass } from "./helpers";

/*
 * さきどり (先取り) で 物語を すすめる:
 *   1. はじめから で「2ねん」をえらぶ
 *   2. ★ めあて に いまの とびら と さきどり (つぎの章の単元) が出る
 *   3. 小3 の「わり算」を めあて から まなんで 合格 → さきどり せいこう! (★ と ゴールド)
 *   4. 章3 の 番人に 話しかけると「いま まなぶ?」→ めあて パネルが 開く
 */

type P = Page;

async function newGameAsGrade(page: P, grade: number) {
  await page.goto("/");
  const startButton = page.locator('[data-testid="profile-start"]');
  await startButton.waitFor({ state: "visible", timeout: 30_000 });
  await startButton.click();
  await page.locator('[data-testid="profile-gate"]').waitFor({ state: "hidden", timeout: 10_000 });
  await page.locator('[data-testid="title-newgame"]').waitFor({ state: "visible", timeout: 15_000 });
  await page.locator('[data-testid="title-newgame"]').click();
  await answerGradeQuestion(page, "click", grade);
  await page.waitForFunction(() => window.__KAZUQUEST_GAME__?.scene.isActive("Field"), undefined, {
    timeout: 20_000,
  });
  await page.waitForTimeout(600);
}

async function openGoals(page: P) {
  /* 最初の会話 (はじまりの 家) が出ていれば 先に 送る */
  for (let i = 0; i < 20; i++) {
    if (await page.locator('[data-testid="goals-panel"]').isVisible()) return;
    const busy = await page.evaluate(
      () => !!window.__KAZUQUEST_GAME__?.scene.getScene("Ui")?.isBusy?.(),
    );
    if (busy) {
      await page.keyboard.press("z");
      await page.waitForTimeout(400);
      continue;
    }
    await page.locator('[data-testid="goals-button"]').click();
    await page.waitForTimeout(600);
  }
  await expect(page.locator('[data-testid="goals-panel"]')).toBeVisible();
}

test("さきどり: 小2 が 小3 の わり算を めあて から まなんで ★ を もらう", async ({ page }) => {
  test.setTimeout(240_000);
  await newGameAsGrade(page, 2);

  const settings = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave().settings);
  expect(settings.schoolGrade).toBe(2);
  /* 小1・小2 は こたえる じかん が ゆっくり に なる */
  expect(settings.answerTime).toBe("slow");

  /*
   * 章2 の とびらの 3単元 (九九など — 2ねんせいの 単元) は できる ことにする。
   * めあての はしごは 1章ずつ のぼるので、つぎの段 = 章3 (3ねんせい) が さきどりに なる
   * (九九は わり算の 前提。レッスンそのものは lesson-grade2 が見る)
   */
  await page.evaluate(() => {
    for (const id of ["g2_kuku", "g2_add_column", "g2_time"]) {
      window.__KAZUQUEST_DEBUG__!.setMastery(id, "can");
    }
  });

  await openGoals(page);
  const current = page.locator('[data-testid="goals-current"]');
  await expect(current).toContainText("かぞえの どうくつ");
  const ahead = page.locator('[data-testid="goals-ahead"]');
  await expect(ahead).toContainText("さきどり");
  await expect(ahead.locator('[data-testid="goal-ahead-badge"]').first()).toBeVisible();

  const before = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave().inventory.gold);
  await ahead.locator('[data-testid="goal-learn"][data-skill="g3_div"]').click();
  await expect(page.locator('[data-testid="lesson-screen"]')).toBeVisible({ timeout: 15_000 });
  await walkLessonToPass(page);

  const celebration = page.locator('[data-testid="sakidori-celebration"]');
  await expect(celebration).toBeVisible({ timeout: 10_000 });
  await expect(celebration).toContainText("さきどり せいこう");
  await expect(celebration).toContainText("3ねんせい");
  /* めあて から まなんでも 単元の呪文を おぼえる (まなびやの先生と同じ) */
  await expect(page.locator('[data-testid="sakidori-spells"]')).toContainText("ワリダマ");
  await page.locator('[data-testid="sakidori-close"]').click();

  const after = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());
  expect(after.mastery.g3_div?.state).toBe("can");
  expect(after.party[0].learnedSpells).toContain("waridama");
  expect(after.flags["ahead.g3_div"]).toBe(true);
  expect(after.inventory.gold).toBe(before + 120);

  await openGoals(page);
  await expect(page.locator('[data-testid="goals-stars"]')).toContainText("★ 1");
  await expect(
    page.locator('[data-testid="goals-ahead"] [data-testid="goal-unit"][data-skill="g3_div"]'),
  ).toHaveAttribute("data-state", "can");
  await page.locator('[data-testid="goals-close"]').click();
});

test("番人に 話しかけると その場で まなべる (めあて が 開く)", async ({ page }) => {
  test.setTimeout(180_000);
  await seedChapter(page, 3);
  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.warp("ch3-world", "from-caravan"));
  await page.waitForTimeout(1_200);
  /* ピラミッドの番人 (19,6) の したに 立って 上を向く */
  await teleport(page, 19, 7, "up");
  await page.keyboard.press("z");
  const options = page.locator('[data-testid="ui-option"]');
  for (let i = 0; i < 10 && (await options.count()) === 0; i++) {
    await page.keyboard.press("z");
    await page.waitForTimeout(400);
  }
  await expect(page.getByText("とびらを ひらく さんすうを いま まなぶ?")).toBeVisible({
    timeout: 10_000,
  });
  await options.first().click(); /* はい */
  await expect(page.locator('[data-testid="goals-panel"]')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('[data-testid="goals-current"]')).toContainText("わけまえの ピラミッド");
  await page.locator('[data-testid="goals-close"]').click();
  await expect(page.locator('[data-testid="goals-panel"]')).toHaveCount(0);
});
