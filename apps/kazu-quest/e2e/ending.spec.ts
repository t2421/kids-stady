import { expect, test, type Page } from "@playwright/test";
import {
  advanceDialog,
  advanceDialogUntilScene,
  fieldPos,
  grindBattleUntil,
  seedChapter,
  startGame,
  stepOnce,
  teleport,
  waitForScene,
  warp,
} from "./helpers";

/*
 * KQ-22 エンディング + タイトルメニュー。
 * (1) 第6章のラスボス (冥王ゼロム 2形態) を倒す → Ending → タップでタイトル →
 *     「つづきから」→ ホシオキの ほこら で再開。cleared に 6 が積まれる
 * (2) 「はじめから」→「やめる」でセーブが消えない (誤タップ対策)
 * (3) 「はじめから」→「はい、けす」で最初から (ハジマリ村・フラグなし)
 */

const C6_PREREQ_FLAGS = [
  "c6.metElder",
  "c6.speedSeal",
  "c6.enSeal",
  "c6.trialSeal",
  "c6.metGauss",
];

const ENDING_MAP = "ch6-hoshioki-shrine";

async function waitForBattle(page: Page) {
  await page.waitForFunction(
    () => window.__KAZUQUEST_GAME__!.scene.isActive("Battle"),
    undefined,
    { timeout: 15_000 },
  );
}

/* Ending シーンの「タップでタイトルへ」が出るまで待つ (EndingScene.readyToLeave) */
async function waitForEndingReady(page: Page) {
  await page.waitForFunction(
    () => {
      const scene = window.__KAZUQUEST_GAME__!.scene.getScene("Ending") as unknown as {
        readyToLeave?: boolean;
      } | null;
      return scene?.readyToLeave === true;
    },
    undefined,
    { timeout: 20_000 },
  );
}

const canvasTap = (page: Page) =>
  page.locator("canvas").click({ position: { x: 640, y: 360 } });

/* 既存プロフィールでページを開き直してタイトルメニューまで進む */
async function reopenToTitle(page: Page) {
  await page.reload();
  const select = page.locator('[data-testid="profile-select"]').first();
  await select.waitFor({ state: "visible", timeout: 20_000 });
  await select.click();
  await page
    .locator('[data-testid="profile-gate"]')
    .waitFor({ state: "hidden", timeout: 10_000 });
  await waitForScene(page, "Title");
  await page
    .locator('[data-testid="title-menu"]')
    .waitFor({ state: "visible", timeout: 15_000 });
}

test("ending: zerom (2 forms) → Ending → Title → つづきから → hoshioki shrine", async ({
  page,
}) => {
  test.setTimeout(600_000);
  await seedChapter(page, 6);
  await page.evaluate((flags) => {
    for (const flag of flags) window.__KAZUQUEST_DEBUG__!.setFlag(flag);
    window.__KAZUQUEST_DEBUG__!.grantLevel(60);
  }, C6_PREREQ_FLAGS);

  /* 玉座の間: ボスは (6,3) の step イベント。1マス手前から踏み込む */
  await warp(page, "ch6-zerom-throne", "entrance");
  await teleport(page, 6, 4, "up");
  await stepOnce(page, "ArrowUp");
  await advanceDialog(page);
  await waitForBattle(page);
  await grindBattleUntil(page, "Field", 300);

  /* 第2形態 */
  await advanceDialog(page);
  await waitForBattle(page);
  await grindBattleUntil(page, "Field", 400);

  /* エピローグの会話を送り切ると { type: "ending" } で Ending へ */
  await advanceDialogUntilScene(page, "Ending");
  await waitForScene(page, "Ending");

  /* 1回目のタップで最終状態へスキップ、2回目でタイトルへ */
  await page.waitForTimeout(800);
  await canvasTap(page);
  await waitForEndingReady(page);
  await canvasTap(page);
  await waitForScene(page, "Title");

  const cont = page.locator('[data-testid="title-continue"]');
  await expect(cont).toBeVisible({ timeout: 15_000 });

  const saved = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());
  expect(saved.chapter.cleared).toContain(6);
  expect(saved.flags["c6.clear"]).toBe(true);
  /* ending でランが打ち切られても onceFlag (ボス撃破) は立っている */
  expect(saved.flags["c6.bossDefeated"]).toBe(true);
  expect(saved.checkpoint).toEqual({ mapId: ENDING_MAP, spawn: "start" });

  await cont.click();
  await waitForScene(page, "Field");
  await page.waitForTimeout(500);
  expect((await fieldPos(page)).mapId).toBe(ENDING_MAP);
});

test("title menu: はじめから → やめる keeps the save, つづきから resumes there", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startGame(page);
  /* マップ移動でオートセーブされる → 王都にいる記録が残る */
  await warp(page, "ch1-capital", "entrance");

  await reopenToTitle(page);
  const cont = page.locator('[data-testid="title-continue"]');
  await expect(cont).toBeVisible();

  await page.locator('[data-testid="title-newgame"]').click();
  await expect(page.locator('[data-testid="title-confirm-yes"]')).toBeVisible();
  await page.locator('[data-testid="title-confirm-no"]').click();
  await expect(page.locator('[data-testid="title-confirm-yes"]')).toHaveCount(0);
  await expect(cont).toBeVisible();

  /* セーブは無変更 (リロード後にストレージから読み直した値) */
  const saved = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());
  expect(saved.location.mapId).toBe("ch1-capital");

  await cont.click();
  await waitForScene(page, "Field");
  await page.waitForTimeout(500);
  expect((await fieldPos(page)).mapId).toBe("ch1-capital");
});

test("title menu: はじめから → はい、けす starts over from ハジマリ村", async ({ page }) => {
  test.setTimeout(180_000);
  await startGame(page);
  /* フラグを立ててから移動 (transfer のオートセーブで書き出される) */
  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.setFlag("c1.metKing"));
  await warp(page, "ch1-capital", "entrance");

  await reopenToTitle(page);
  await page.locator('[data-testid="title-newgame"]').click();
  await page.locator('[data-testid="title-confirm-yes"]').click();
  await waitForScene(page, "Field");
  await page.waitForTimeout(500);

  expect((await fieldPos(page)).mapId).toBe("ch1-hajimari");
  const saved = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());
  expect(saved.flags["c1.metKing"]).toBeUndefined();
  expect(saved.chapter.current).toBe(1);
});
