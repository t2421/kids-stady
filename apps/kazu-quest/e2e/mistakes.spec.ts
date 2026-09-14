import { expect, test } from "@playwright/test";
import {
  correctChoice,
  startGame,
  stepOnce,
  teleport,
  waitForScene,
  warp,
} from "./helpers";

/*
 * KQ-10 まちがいノート: 戦闘でわざと1問まちがえ → 勝利後にノートが出て
 * 「とじる」(タップのみ) でフィールドへ戻る。セーブにも記録されている。
 */

const wrongChoice = (page: Parameters<typeof correctChoice>[0]) =>
  page.locator('[data-testid="math-choice"][data-answer="0"]').first();

test("mistake note: a wrong answer in battle shows the note after victory", async ({
  page,
}) => {
  test.setTimeout(240_000);
  await startGame(page);
  await warp(page, "ch1-world", "from-hajimari");
  await teleport(page, 8, 4, "right");

  /* ワールドマップの道 (エンカウント床) を行き来して戦闘を起こす */
  let inBattle = false;
  for (let i = 0; i < 100 && !inBattle; i++) {
    await stepOnce(page, i % 2 === 0 ? "ArrowRight" : "ArrowLeft");
    inBattle = await page.evaluate(
      () => window.__KAZUQUEST_GAME__!.scene.isActive("Battle"),
    );
  }
  expect(inBattle).toBe(true);

  /* 最初の出題でわざと不正解を1回タップ */
  const wrong = wrongChoice(page);
  for (let i = 0; i < 30 && !(await wrong.isVisible()); i++) {
    await page.keyboard.press("z");
    await page.waitForTimeout(500);
  }
  await wrong.waitFor({ state: "visible", timeout: 10_000 });
  await wrong.click();
  await page.waitForFunction(
    () => window.__KAZUQUEST_DEBUG__!.getSave().mistakes.length >= 1,
    undefined,
    { timeout: 10_000 },
  );

  /* あとは正解し続けて勝つ。勝利演出のあと Field に戻る前にノートが出る */
  const note = page.locator('[data-testid="mistake-note"]');
  const right = correctChoice(page);
  for (let i = 0; i < 120; i++) {
    if (await note.isVisible()) break;
    const clickable = (await right.isVisible()) && (await right.isEnabled());
    if (clickable) {
      await right.click({ timeout: 2_000 }).catch(() => {});
      await page.waitForTimeout(700);
    } else {
      await page.keyboard.press("z");
      await page.waitForTimeout(700);
    }
    const backInField = await page.evaluate(
      () => window.__KAZUQUEST_GAME__!.scene.isActive("Field"),
    );
    expect(backInField, "ノートを出さずに Field へ戻った").toBe(false);
  }
  await note.waitFor({ state: "visible", timeout: 10_000 });
  await expect(page.locator('[data-testid="mistake-note-text"]')).not.toBeEmpty();
  await expect(page.locator('[data-testid="mistake-note-answer"]')).not.toBeEmpty();

  /* ノートが開いている間は戦闘が終わっていない */
  expect(
    await page.evaluate(() => window.__KAZUQUEST_GAME__!.scene.isActive("Field")),
  ).toBe(false);

  /* 「とじる」タップのみで Field へ戻る (キー操作なし) */
  await page.locator('[data-testid="mistake-note-close"]').click();
  await note.waitFor({ state: "hidden", timeout: 5_000 });
  await waitForScene(page, "Field");

  const save = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());
  expect(save.mistakes.length).toBeGreaterThanOrEqual(1);
  expect(save.mistakes[0].chosen).not.toBe(save.mistakes[0].answer);
  expect(save.party[0].exp).toBeGreaterThan(0);
});
