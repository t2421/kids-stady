import { expect, test, type Page } from "@playwright/test";
import { startGame } from "./helpers";

/*
 * LessonScreen の導入→概念→れい→穴埋め→れんしゅう→テスト を通しで検証する
 * (LP-08 → LP-09)。まだマップ側に「まなびやの先生」の導線が無いので (LP-18 の仕事)、
 * __KAZUQUEST_DEBUG__.openLesson (E2E 専用の暫定フック) で直接開く。
 * レッスンは g1_add_nc の1本だけが本物のデータ (LP-12 以降が学年ぶん足す)。
 */

test("lesson: g1_add_nc を story → concept → れい → 穴埋め まで通す (れんしゅうへ続く)", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startGame(page);

  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.openLesson("g1_add_nc"));

  const screen = page.locator('[data-testid="lesson-screen"]');
  await expect(screen).toBeVisible({ timeout: 10_000 });

  const next = page.locator('[data-testid="lesson-next"]');

  /* story: 1ページ */
  await expect(page.locator('[data-testid="lesson-page-0"]')).toBeVisible();
  await next.click();

  /* concept: 2ページ、どちらも図 (tenFrame) つき */
  await expect(page.locator('[data-testid="lesson-page-0"]')).toBeVisible();
  await expect(page.locator('[data-testid="lesson-figure"]')).toBeVisible();
  await next.click();
  await expect(page.locator('[data-testid="lesson-page-1"]')).toBeVisible();
  await expect(page.locator('[data-testid="lesson-figure"]')).toBeVisible();
  await next.click();

  /* れい (workedExample): 2ステップ */
  await expect(page.locator('[data-testid="lesson-page-0"]')).toBeVisible();
  await next.click();
  await expect(page.locator('[data-testid="lesson-page-1"]')).toBeVisible();
  await next.click();

  /* 穴埋め (faded): 2問、3択で答える (正解ボタンを選ぶ) */
  for (let i = 0; i < 2; i++) {
    const correctChoice = page.locator(
      '[data-testid="math-choice"][data-answer="1"]',
    );
    await expect(correctChoice).toBeVisible({ timeout: 10_000 });
    await correctChoice.click();
    await page.waitForTimeout(1_100); // AUTO_ADVANCE_MS + margin
  }

  /* 穴埋めの次は れんしゅう Lv1 (LP-09) — レッスンはまだ閉じない。
     mastery は story 開始時点で practicing に入っている */
  await expect(page.locator('[data-testid="lesson-practice"]')).toBeVisible({
    timeout: 10_000,
  });
  await expect(screen).toBeVisible();
  const mastery = await page.evaluate(
    () => window.__KAZUQUEST_DEBUG__!.getSave().mastery,
  );
  expect(mastery.g1_add_nc?.state).toBe("practicing");
});

/* 出題パネルの正解ボタン (3択。g1_add_nc は小1単元なので常に3択 — KQ-12) */
const lessonCorrectChoice = (page: Page) =>
  page.locator('[data-testid="math-choice"][data-answer="1"]');

/* 正解を n 回連続でタップする (AUTO_ADVANCE_MS=900 + 余裕をもって待つ) */
async function answerCorrectNTimes(page: Page, n: number) {
  for (let i = 0; i < n; i++) {
    const choice = lessonCorrectChoice(page);
    await expect(choice).toBeVisible({ timeout: 10_000 });
    await choice.click();
    await page.waitForTimeout(1_100);
  }
}

test("lesson: 穴埋めのあと れんしゅう Lv1〜3 → テスト まで合格して can になる", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startGame(page);

  /* LP-21: パーティのEXPがレッスン完了/テスト合格ぶん増えることを、この
     合格までの通しテストの前後で確認する (増分の内訳はVitest側で検証済み) */
  const expBefore = await page.evaluate(
    () => window.__KAZUQUEST_DEBUG__!.getSave().party[0].exp,
  );

  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.openLesson("g1_add_nc"));

  const screen = page.locator('[data-testid="lesson-screen"]');
  await expect(screen).toBeVisible({ timeout: 10_000 });
  const next = page.locator('[data-testid="lesson-next"]');

  /* story → concept (2ページ) → れい (2ステップ) は「つぎへ」で送る */
  await next.click();
  await next.click();
  await next.click();
  await next.click();
  await next.click();

  /* 穴埋め: 2問 (正解を選ぶ) */
  await answerCorrectNTimes(page, 2);

  /* れんしゅう Lv1〜3: それぞれ3問連続正解で次の段階へ */
  await expect(page.locator('[data-testid="lesson-practice"]')).toBeVisible({
    timeout: 10_000,
  });
  await answerCorrectNTimes(page, 3); // Lv1
  await answerCorrectNTimes(page, 3); // Lv2
  await answerCorrectNTimes(page, 3); // Lv3

  /* テスト: 10問すべて正解 */
  await expect(page.locator('[data-testid="lesson-test"]')).toBeVisible({
    timeout: 10_000,
  });
  await answerCorrectNTimes(page, 10);

  /* 合格: 画面が閉じ、mastery が can になっている (practicing で終わらない) */
  await expect(screen).toBeHidden({ timeout: 10_000 });
  const mastery = await page.evaluate(
    () => window.__KAZUQUEST_DEBUG__!.getSave().mastery,
  );
  expect(mastery.g1_add_nc?.state).toBe("can");

  /* LP-21: レッスン完了 + テスト合格ぶんのEXPがパーティに渡っている */
  const expAfter = await page.evaluate(
    () => window.__KAZUQUEST_DEBUG__!.getSave().party[0].exp,
  );
  expect(expAfter).toBeGreaterThan(expBefore);
});
