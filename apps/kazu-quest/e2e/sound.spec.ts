import { expect, test } from "@playwright/test";
import { advanceDialog, grindBattleUntilField, startGame, stepOnce, teleport, warp } from "./helpers";

/*
 * KQ-20 効果音: おと トグルがセーブ (settings.sound) に反映されること、
 * 音がオンのまま戦闘を一巡しても page error が出ないこと (Playwright は無音 —
 * 「音の呼び出しが例外を出さない」までを検証する)。
 */

/* KQ-21 BGM: src/game/audio/bgm.ts が公開する E2E フック (要求中の曲 ID) */
declare global {
  interface Window {
    __KAZUQUEST_BGM__?: { current(): string | null };
  }
}

const currentBgm = (page: Parameters<typeof startGame>[0]) =>
  page.evaluate(() => window.__KAZUQUEST_BGM__?.current() ?? null);

/* X キーでステータスパネルを開く (高負荷に備えリトライ) */
async function openStatusPanel(page: Parameters<typeof startGame>[0]) {
  const panel = page.locator('[data-testid="status-panel"]');
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.keyboard.press("x");
    try {
      await panel.waitFor({ state: "visible", timeout: 3_000 });
      return;
    } catch {
      /* 開かなかった → リトライ */
    }
  }
  throw new Error("ステータスパネルが開かない");
}

test("sound toggle: おと オン/オフ persists to settings.sound", async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await startGame(page);
  await page.waitForTimeout(400);

  await openStatusPanel(page);
  const toggle = page.locator('[data-testid="sound-toggle"]');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveText("おと: オン");
  expect(
    await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave().settings.sound),
  ).toBe(true);

  await toggle.click();
  await expect(toggle).toHaveText("おと: オフ");
  expect(
    await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave().settings.sound),
  ).toBe(false);

  await toggle.click();
  await expect(toggle).toHaveText("おと: オン");
  expect(
    await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave().settings.sound),
  ).toBe(true);

  /* とじる → パネルが消え、Field の入力が戻る */
  await page.locator('[data-testid="status-close"]').click();
  await page.locator('[data-testid="status-panel"]').waitFor({ state: "hidden", timeout: 5_000 });
  await advanceDialog(page);
  expect(errors).toEqual([]);
});

test("sound on: a full battle raises no page errors", async ({ page }) => {
  test.setTimeout(240_000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await startGame(page);
  expect(
    await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave().settings.sound),
  ).toBe(true);

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

  /* カーソル・決定・打撃・正解・勝利… の効果音が一巡する */
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowUp");
  await grindBattleUntilField(page);
  expect(errors).toEqual([]);
});

test("bgm: map transfer raises no page errors and the song follows town/field → battle → field", async ({ page }) => {
  test.setTimeout(240_000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await startGame(page);
  await page.waitForTimeout(400);
  /* はじまりの村 (町) or 野外 — どちらでもフィールド系の曲が要求されている */
  expect(["town", "field", "dungeon"]).toContain(await currentBgm(page));

  /* マップ遷移 (warp) → ワールドマップは旅の曲。遷移で例外が出ない */
  await warp(page, "ch1-world", "from-hajimari");
  await page.waitForTimeout(400);
  expect(await currentBgm(page)).toBe("field");
  expect(errors).toEqual([]);

  /* エンカウント床を行き来して戦闘 → 戦闘曲 */
  await teleport(page, 8, 4, "right");
  let inBattle = false;
  for (let i = 0; i < 100 && !inBattle; i++) {
    await stepOnce(page, i % 2 === 0 ? "ArrowRight" : "ArrowLeft");
    inBattle = await page.evaluate(
      () => window.__KAZUQUEST_GAME__!.scene.isActive("Battle"),
    );
  }
  expect(inBattle).toBe(true);
  await page.waitForTimeout(300);
  expect(await currentBgm(page)).toBe("battle");

  /* 勝って Field に戻ると旅の曲が再開する */
  await grindBattleUntilField(page);
  await page.waitForTimeout(300);
  expect(await currentBgm(page)).toBe("field");
  expect(errors).toEqual([]);
});

/*
 * AU-01: 音量 4 択 (StatusPanelOverlay の volume-step) が settings.volume / settings.sound に
 * 正しく反映されること、押すたびに __KAZUQUEST_AUDIO__.recentSfx() の末尾が "confirm" になること、
 * ゲーム操作 (startGame 自体のクリック) の後は contextState() が "running" であること。
 */
test("volume steps: 4 buttons update settings.volume/.sound and preview with confirm", async ({ page }) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await startGame(page);
  await page.waitForTimeout(400);

  /* startGame 自体のクリックで unlock 済みのはず (Chromium の自動再生ポリシー) */
  await expect
    .poll(() => page.evaluate(() => window.__KAZUQUEST_AUDIO__?.contextState() ?? null))
    .toBe("running");

  await openStatusPanel(page);

  const pressAndCheck = async (
    level: 0 | 1 | 2 | 3,
    expectSound: boolean,
    expectVolume: number,
  ) => {
    await page.locator(`[data-testid="volume-step"][data-level="${level}"]`).click();
    const settings = await page.evaluate(
      () => window.__KAZUQUEST_DEBUG__!.getSave().settings,
    );
    expect(settings.sound).toBe(expectSound);
    expect(settings.volume).toBe(expectVolume);
    const recent = await page.evaluate(() => window.__KAZUQUEST_AUDIO__?.recentSfx() ?? []);
    expect(recent.length).toBeGreaterThan(0);
    expect(recent[recent.length - 1].name).toBe("confirm");
  };

  await pressAndCheck(1, true, 1);
  await pressAndCheck(2, true, 2);
  await pressAndCheck(3, true, 3);
  /* オフは sound だけを落とす。直前の volume (3) は変えない */
  await pressAndCheck(0, false, 3);

  expect(
    await page.evaluate(() => window.__KAZUQUEST_AUDIO__?.contextState() ?? null),
  ).toBe("running");

  await page.locator('[data-testid="status-close"]').click();
  await page.locator('[data-testid="status-panel"]').waitFor({ state: "hidden", timeout: 5_000 });
  expect(errors).toEqual([]);
});
