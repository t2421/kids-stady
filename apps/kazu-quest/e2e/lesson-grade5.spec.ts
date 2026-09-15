import { expect, test } from "@playwright/test";
import {
  answerCorrectOnce,
  startGame,
  waitForAnswerable,
} from "./helpers";

/*
 * 小5の中核単元 g5_percent を story → concept → れい → 穴埋め →
 * れんしゅう Lv1〜3 → テスト まで通しで検証する (LP-16)。
 * g5_percent は小5単元なのでテンキー入力 (KQ-12, inputModeFor):
 * れんしゅう/テストは Keypad、穴埋め (LessonFaded) は常に3択のまま
 * (LessonFaded は inputModeFor を使わない)。answerCorrectOnce (helpers.ts)
 * が3択/テンキーの両方を吸収するので、段階をまたいで同じ呼び出しで正解できる。
 *
 * g5_percent の本文構成 (src/content/lessons/grade5/g5_percent.ts):
 *   story: 2ページ / concept: 3ページ / workedExample.steps: 3ステップ
 *   → 「つぎへ」を 2+3+3=8回 押すと 穴埋め (faded, 3問) に到達する。
 */

const NEXT_CLICKS_TO_FADED = 8; // story(2) + concept(3) + workedExample.steps(3)

/* 出題パネル (3択 or テンキー) に1問正解し、フィードバック演出の分だけ待つ */
async function answerAndWait(page: import("@playwright/test").Page) {
  await waitForAnswerable(page, 10_000);
  await answerCorrectOnce(page);
  await page.waitForTimeout(1_100); // AUTO_ADVANCE_MS(900) + margin
}

test("lesson: g5_percent を story → concept → れい → 穴埋め → れんしゅう Lv1〜3 → テスト まで通して can になる", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startGame(page);

  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.openLesson("g5_percent"));

  const screen = page.locator('[data-testid="lesson-screen"]');
  await expect(screen).toBeVisible({ timeout: 10_000 });
  const next = page.locator('[data-testid="lesson-next"]');

  /* story(2ページ) → concept(3ページ) → れい(3ステップ) は「つぎへ」で送る */
  for (let i = 0; i < NEXT_CLICKS_TO_FADED; i++) {
    await expect(next).toBeVisible({ timeout: 10_000 });
    await next.click();
  }

  /* 穴埋め (faded): 3問。LessonFaded は常に3択 (小1と同じ MathChoices) */
  await expect(page.locator('[data-testid="lesson-page-0"]')).toBeVisible({
    timeout: 10_000,
  });
  for (let i = 0; i < 3; i++) {
    await answerAndWait(page);
  }

  /* れんしゅう Lv1〜3: 小5単元はテンキー入力 (KQ-12)。それぞれ3問連続正解で次へ */
  await expect(page.locator('[data-testid="lesson-practice"]')).toBeVisible({
    timeout: 10_000,
  });
  for (let level = 0; level < 3; level++) {
    for (let i = 0; i < 3; i++) {
      await answerAndWait(page);
    }
  }

  /* テスト: 10問すべて正解 (テンキー) */
  await expect(page.locator('[data-testid="lesson-test"]')).toBeVisible({
    timeout: 10_000,
  });
  for (let i = 0; i < 10; i++) {
    await answerAndWait(page);
  }

  /* 合格: 画面が閉じ、mastery が can になっている */
  await expect(screen).toBeHidden({ timeout: 10_000 });
  const mastery = await page.evaluate(
    () => window.__KAZUQUEST_DEBUG__!.getSave().mastery,
  );
  expect(mastery.g5_percent?.state).toBe("can");
});
