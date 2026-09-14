import { expect, test } from "@playwright/test";
import { startGame } from "./helpers";

/*
 * ReadinessScreen.tsx (前提チェック, LP-10) の単体検証。
 * handleOpenLesson の readiness ゲート判定 (readinessRequired) はマップ側の導線が
 * まだ無い単元でしか再現できない (前提を持つ LessonDef は波4 以降)。ゲート判定
 * そのものは Vitest の純関数テスト (tests/prereqs.test.ts / tests/lessonFlow.test.ts)
 * で検証済みなので、ここでは ReadinessScreen 単体を __KAZUQUEST_DEBUG__.openReadiness
 * (E2E 専用の暫定フック) で直接開き、出題 → 回答 → 画面が閉じるところまでを見る。
 */

test("readiness: g1_add_nc を前提に開き、正解して readiness-screen が閉じる", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await startGame(page);

  await page.evaluate(() =>
    window.__KAZUQUEST_DEBUG__!.openReadiness("g1_add_carry", ["g1_add_nc"]),
  );

  const screen = page.locator('[data-testid="readiness-screen"]');
  await expect(screen).toBeVisible({ timeout: 10_000 });

  /* 前提は1件だけなので問題も1問。正解を選ぶ */
  const correctChoice = page.locator(
    '[data-testid="math-choice"][data-answer="1"]',
  );
  await expect(correctChoice).toBeVisible({ timeout: 10_000 });
  await correctChoice.click();

  /* AUTO_ADVANCE_MS (900ms) + 余裕をもって待ち、画面が閉じることを確認する */
  await expect(screen).toBeHidden({ timeout: 10_000 });
});
