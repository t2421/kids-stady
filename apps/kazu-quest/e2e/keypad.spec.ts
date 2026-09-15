import { expect, test, type Page } from "@playwright/test";
import {
  advanceLessonUntil,
  correctChoice,
  keypadDisplay,
  openTeacherMenuAndPickUnit,
  seedChapter,
  startGame,
  teleport,
  walkLessonToPass,
  warp,
} from "./helpers";

/*
 * テンキー入力モード (KQ-12): 小3以降の習得テストはテンキーで答える。
 * - 章3 ワケーラのまなびや (ワリダマ = g3_div): テンキーが出て、全キー ≥72px、
 *   正解を打って全問通すと習得する
 * - 章1 王城のまなびや (ヒキダマ = g1_sub_nc): 引き続き3択
 * default (デスクトップ) と ipad の両プロジェクトで走る (playwright.config.ts)。
 *
 * 学びの設計 (LP-09) 波4で全単元にレッスンが実装されたため、呪文の習得は
 * いまや従来の「しゅうとくテスト」バナーではなく open-lesson (LessonScreen)
 * に委譲される (spellTestFlow.ts の delegateToLesson)。テンキー/3択の
 * 検証ポイントは「れんしゅう Lv1」画面 (lesson-practice) に移った —
 * inputModeFor は変わらず単元の学年で決まるので、検証の意味は同じ。
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

  /* まなびや: 計算商人 (4,2) の一覧から「わり算」(g3_div、レッスンに委譲) */
  await warp(page, "ch3-wakeera-manabiya", "start");
  await teleport(page, 4, 3, "up");
  await openTeacherMenuAndPickUnit(page, "g3_div");

  /* レッスンの story/concept/れい/穴埋め (常に3択) を抜けて、
     れんしゅう Lv1 まで進める — ここが検証ポイント */
  await advanceLessonUntil(page, "lesson-practice");

  /* テンキーが出て、3択は出ない */
  await expect(keypadDisplay(page)).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('[data-testid="math-choice"]')).toHaveCount(0);

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

  /* 残りのれんしゅう・テストを正解し続けて終わらせる → 習得 */
  await walkLessonToPass(page);
  await learned(page, "waridama");
});

test("keypad: chapter 1 spell test still uses the three choices", async ({ page }) => {
  test.setTimeout(120_000);
  await startGame(page);

  /* 王城の まなびや (ふくろう博士は (2,4)) — ヒキダマ (g1_sub_nc、小1、レッスンに委譲) */
  await warp(page, "ch1-capital-castle", "start");
  await teleport(page, 3, 4, "left");
  await openTeacherMenuAndPickUnit(page, "g1_sub_nc");

  /* れんしゅう Lv1 まで進める (小1単元は穴埋め同様ずっと3択のはず) */
  await advanceLessonUntil(page, "lesson-practice");

  await expect(correctChoice(page)).toBeVisible({ timeout: 10_000 });
  await expect(keypadDisplay(page)).toHaveCount(0);
});
