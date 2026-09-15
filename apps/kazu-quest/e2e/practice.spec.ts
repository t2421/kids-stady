import { expect, test, type Page } from "@playwright/test";
import {
  advanceLessonUntil,
  correctChoice,
  openTeacherMenuAndPickUnit,
  startGame,
  teleport,
  walkLessonToPass,
  warp,
} from "./helpers";

/*
 * とっくん (KQ-11、旧: 習得テストの前に「とっくんしてから テストする?」→ はい で
 * 5問の練習 → そのまま習得テスト → 合格で習得) は、学びの設計 (LP-09) 波4で
 * 全44単元にレッスンが実装されたことで、いまや全ての呪文が open-lesson に
 * 委譲されるため、この choice 自体が出なくなり、事実上たどり着けない画面に
 * なった (spellTestFlow.ts の delegateToLesson)。
 *
 * ここではその代わりに、同じ役割 (まちがえたときのヒント段階表示・
 * さくらんぼ図によるくりさがりの視覚化) が「れんしゅう」(LessonPractice.tsx)
 * でも成立していることを検証する。ヒントの中身 (MathHintBody/CherryDiagram) は
 * とっくん・れんしゅうの両方から共有されている同じコンポーネントなので、
 * 「間違えるとヒントが段階的に深くなる」という設計意図そのものは変わらない —
 * 見せ方が「ヒントボタンを押す」から「間違えるたびに自動で1段深くなる」に
 * 変わっただけ (LP-09 §4 の意図的な仕様)。
 */

const wrongChoice = (page: Page) =>
  page.locator('[data-testid="math-choice"][data-answer="0"]').first();

test("lesson practice: 間違えるとヒントが段階的に深くなり、そのまま呪文を習得できる", async ({
  page,
}) => {
  test.setTimeout(240_000);
  await startGame(page);

  /* 王城の まなびや (ふくろう博士は (2,4)) — ヒキダマ (g1_sub_nc、くりさがりなし の ひきざん) */
  await warp(page, "ch1-capital-castle", "start");
  await teleport(page, 3, 4, "left");
  await openTeacherMenuAndPickUnit(page, "g1_sub_nc");
  await advanceLessonUntil(page, "lesson-practice");

  await expect(correctChoice(page)).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('[data-testid="math-hint-body"]')).toHaveCount(0);

  /* 1問目をわざと3回連続でまちがえる → ヒントが1→2→3段と積み上がる
     (streak は落とさず Lv も落とさない。連続不正解でだけヒントが深まる —
     applyPracticeAnswer の仕様) */
  for (const level of [1, 2, 3]) {
    await expect(wrongChoice(page)).toBeVisible({ timeout: 10_000 });
    await wrongChoice(page).click();
    await page.waitForTimeout(1_100); // AUTO_ADVANCE_MS + 余裕
    await expect(page.locator('[data-testid="math-hint-body"]')).toHaveCount(level, {
      timeout: 10_000,
    });
  }

  /* 残りは正解し続けて Lv1〜3・テストまで通す → 習得 */
  await walkLessonToPass(page);
  await page.waitForFunction(
    () =>
      window.__KAZUQUEST_DEBUG__!.getSave().party[0].learnedSpells.includes(
        "hikidama",
      ),
    undefined,
    { timeout: 15_000 },
  );
  const save = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());
  expect(save.flags["learned.hikidama"]).toBe(true);
  /* れんしゅう中の不正解は まちがいノートに積まない (テスト不正解だけの仕様) */
  expect(save.mistakes).toHaveLength(0);
});

test("lesson practice: cherry diagram hint for くりさがり (ヒキダマン)", async ({
  page,
}) => {
  test.setTimeout(240_000);
  await startGame(page);

  /* モリカゲ村の まなびや (ふくろう博士は (4,2)) — ヒキダマン (g1_sub_borrow → さくらんぼ図) */
  await warp(page, "ch1-morikage-manabiya", "start");
  await teleport(page, 4, 3, "up");
  await openTeacherMenuAndPickUnit(page, "g1_sub_borrow");
  await advanceLessonUntil(page, "lesson-practice");

  await expect(correctChoice(page)).toBeVisible({ timeout: 10_000 });
  await wrongChoice(page).click();
  await expect(page.locator('[data-testid="math-hint-body"]')).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.locator('[data-testid="cherry-diagram"]')).toBeVisible();
  await page.screenshot({ path: "test-results/cherry.png" });

  /* 残りは正解し続けて Lv1〜3・テストまで通す → 習得 */
  await walkLessonToPass(page);
  await page.waitForFunction(
    () =>
      window.__KAZUQUEST_DEBUG__!.getSave().party[0].learnedSpells.includes(
        "hikidaman",
      ),
    undefined,
    { timeout: 15_000 },
  );
});
