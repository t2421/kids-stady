import { expect, test, type Page } from "@playwright/test";
import { startGame } from "./helpers";

/*
 * 小2の中核単元 g2_kuku (九九) の LessonScreen を通しで検証する (LP-13)。
 * e2e/lesson.spec.ts の2つ目のテスト (g1_add_nc: 穴埋め→れんしゅうLv1〜3→テスト
 * まで合格して can になる) と同じ骨格を、g2_kuku の実際のページ数
 * (story 2ページ / concept 4ページ / workedExample 3ステップ / faded 2問) に
 * 合わせて再利用する。
 */

/* 出題パネルの正解ボタン (data-answer="1" は「これが正解」というブール値のフラグで、
 * 選択肢の並び順や具体的な値には依存しない — src/components/MathChoices.tsx) */
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

test("lesson: g2_kuku を story → concept → れい → 穴埋め → れんしゅうLv1〜3 → テスト まで通し、can になる", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startGame(page);

  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.openLesson("g2_kuku"));

  const screen = page.locator('[data-testid="lesson-screen"]');
  await expect(screen).toBeVisible({ timeout: 10_000 });
  const next = page.locator('[data-testid="lesson-next"]');

  /* story (2ページ) → concept (4ページ、九九ひょうの figure つき) →
     れい/workedExample (3ステップ) を「つぎへ」で送る。
     各セクションはページ数ぶんの「つぎへ」で次のセクションへ進む
     (2 + 4 + 3 = 9回) */
  await expect(page.locator('[data-testid="lesson-page-0"]')).toBeVisible();
  for (let i = 0; i < 2; i++) await next.click();
  for (let i = 0; i < 4; i++) await next.click();
  for (let i = 0; i < 3; i++) await next.click();

  /* 穴埋め (faded): 2問 (正解を選ぶ) */
  await answerCorrectNTimes(page, 2);

  /* れんしゅう Lv1〜3: それぞれ3問連続正解で次の段階へ */
  await expect(page.locator('[data-testid="lesson-practice"]')).toBeVisible({
    timeout: 10_000,
  });
  await answerCorrectNTimes(page, 3); // Lv1 (2・5のだん)
  await answerCorrectNTimes(page, 3); // Lv2 (1〜9のだん ぜんぶ)
  await answerCorrectNTimes(page, 3); // Lv3 (7・8・9のだん)

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
  expect(mastery.g2_kuku?.state).toBe("can");
});
