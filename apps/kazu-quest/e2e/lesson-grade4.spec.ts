import { expect, test, type Page } from "@playwright/test";
import { answerCorrectOnce, correctChoice, startGame, waitForAnswerable } from "./helpers";

/*
 * 小4 (LP-15) の中核単元 g4_decimal を story → concept → れい → 穴埋め →
 * れんしゅう Lv1〜3 → テスト まで通しで検証する (LP-08/LP-09 の流れを LP-12〜14 と
 * 同じ形で踏襲。波4 の受け入れ条件: 学年ごとに中核1単元を通す)。
 *
 * g4_decimal は小4単元なのでテンキー入力 (KQ-12, src/lib/inputMode.ts:
 * grade >= 3 は "battle" 以外すべてテンキー)。穴埋め (LessonFaded) だけは
 * 常に3択 (LessonFaded.tsx が MathChoices 固定 — grade を見ない)。
 * れんしゅう/テストは e2e/keypad.spec.ts と同じく
 * window.__KAZUQUEST_DEBUG__.currentAnswer() を使う汎用ヘルパー
 * (answerCorrectOnce/waitForAnswerable) が 3択・テンキーの両方を自動判別する。
 *
 * このテストは このセッションでは実行しない (ビルドを別セッションが凍結・配信中の
 * ため)。書式・セレクタが正しいことは e2e/lesson.spec.ts / e2e/keypad.spec.ts の
 * 既存パターンに合わせることで担保する。
 */

const AUTO_ADVANCE_MS = 900;
const WAIT_MARGIN_MS = 200;

/* 出題パネル (3択 or テンキー) に n 回連続で正解する (れんしゅう/テスト共通) */
async function answerLessonCorrectNTimes(page: Page, n: number) {
  for (let i = 0; i < n; i++) {
    await waitForAnswerable(page);
    await answerCorrectOnce(page);
    await page.waitForTimeout(AUTO_ADVANCE_MS + WAIT_MARGIN_MS);
  }
}

/* 穴埋め (LessonFaded) は常に3択。正解ボタン (data-answer="1") を選ぶ */
async function answerFadedCorrectNTimes(page: Page, n: number) {
  for (let i = 0; i < n; i++) {
    const choice = correctChoice(page);
    await expect(choice).toBeVisible({ timeout: 10_000 });
    await choice.click();
    await page.waitForTimeout(AUTO_ADVANCE_MS + WAIT_MARGIN_MS);
  }
}

test("lesson (grade4): g4_decimal を story → concept → れい → 穴埋め → れんしゅう Lv1〜3 → テスト まで合格して can になる", async ({
  page,
}) => {
  test.setTimeout(240_000);
  await startGame(page);

  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.openLesson("g4_decimal"));

  const screen = page.locator('[data-testid="lesson-screen"]');
  await expect(screen).toBeVisible({ timeout: 10_000 });
  const next = page.locator('[data-testid="lesson-next"]');

  /* story: 2ページ */
  await expect(page.locator('[data-testid="lesson-page-0"]')).toBeVisible();
  await next.click();
  await expect(page.locator('[data-testid="lesson-page-1"]')).toBeVisible();
  await next.click();

  /* concept: 4ページ (2ページ目・3ページ目に図つき) */
  await expect(page.locator('[data-testid="lesson-page-0"]')).toBeVisible();
  await next.click();
  await expect(page.locator('[data-testid="lesson-page-1"]')).toBeVisible();
  await expect(page.locator('[data-testid="lesson-figure"]')).toBeVisible();
  await next.click();
  await expect(page.locator('[data-testid="lesson-page-2"]')).toBeVisible();
  await expect(page.locator('[data-testid="lesson-figure"]')).toBeVisible();
  await next.click();
  await expect(page.locator('[data-testid="lesson-page-3"]')).toBeVisible();
  await next.click();

  /* れい (workedExample): 3ステップ (1ステップ目に図つき) */
  await expect(page.locator('[data-testid="lesson-page-0"]')).toBeVisible();
  await expect(page.locator('[data-testid="lesson-figure"]')).toBeVisible();
  await next.click();
  await expect(page.locator('[data-testid="lesson-page-1"]')).toBeVisible();
  await next.click();
  await expect(page.locator('[data-testid="lesson-page-2"]')).toBeVisible();
  await next.click();

  /* 穴埋め: 2問 (常に3択で答える) */
  await answerFadedCorrectNTimes(page, 2);

  /* れんしゅう Lv1〜3: それぞれ3問連続正解で次の段階へ (テンキー入力) */
  await expect(page.locator('[data-testid="lesson-practice"]')).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.locator('[data-testid="math-choice"]')).toHaveCount(0);
  await answerLessonCorrectNTimes(page, 3); // Lv1
  await answerLessonCorrectNTimes(page, 3); // Lv2
  await answerLessonCorrectNTimes(page, 3); // Lv3

  /* テスト: 10問すべて正解 (テンキー入力) */
  await expect(page.locator('[data-testid="lesson-test"]')).toBeVisible({
    timeout: 10_000,
  });
  await answerLessonCorrectNTimes(page, 10);

  /* 合格: 画面が閉じ、mastery が can になっている */
  await expect(screen).toBeHidden({ timeout: 10_000 });
  const mastery = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave().mastery);
  expect(mastery.g4_decimal?.state).toBe("can");
});
