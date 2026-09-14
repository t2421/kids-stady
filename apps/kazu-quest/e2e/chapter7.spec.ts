import { expect, test } from "@playwright/test";
import {
  advanceDialog,
  answerCorrectOnce,
  grindBattleUntilField,
  seedChapter,
  stepOnce,
  teleport,
  waitForAnswerable,
  warp,
} from "./helpers";
import { SPIRAL_ENTRANCE_PROMPT } from "../src/content/chapters/chapter6/maps/hoshioki";

/*
 * 終章「ムゲンのらせん」ゴールデンパス (KQ-30b)。
 * seedChapter(6) + c6.clear で本編クリア後の状態を作り、ホシオキの ほこらの みこから
 * らせんへ → 1〜4層の学年クイズ扉 (小1〜小4) → 2層・4層の宝箱 → 5層の割合の門 (小5)
 * → ∞竜ムゲニア → 称号「ムゲンの ゆうしゃ」(c7.clear) → ほこらへ もどる。
 * chapter.current は 6 のまま (advanceChapter を使わない) ことも確認する。
 */

type P = Parameters<typeof teleport>[0];

const flag = (page: P, name: string) =>
  page.waitForFunction(
    (f) => window.__KAZUQUEST_DEBUG__!.getSave().flags[f] === true,
    name,
    { timeout: 15_000 },
  );

const onMap = (page: P, mapId: string) =>
  page.waitForFunction(
    (id) => window.__KAZUQUEST_DEBUG__!.getSave().location.mapId === id,
    mapId,
    { timeout: 30_000 },
  );

const inBattle = (page: P) =>
  page.waitForFunction(
    () => window.__KAZUQUEST_GAME__!.scene.isActive("Battle"),
    undefined,
    { timeout: 10_000 },
  );

const SHRINE = "ch6-hoshioki-shrine";

/* クイズ扉: 出題パネルで正解 (小3以降はテンキー — KQ-12) → 「せいかい!」を送る */
async function answerQuizCorrect(page: P) {
  await waitForAnswerable(page);
  await answerCorrectOnce(page);
  /* パネルの正解フィードバック (500ms) が終わって次のメッセージが開くのを待つ */
  await page.waitForTimeout(1200);
  await advanceDialog(page);
}

/* らせんの とびら (6,0): 1歩踏む → 前口上 → クイズ正解 → 次の層へ */
async function passSpiralDoor(page: P, nextMap: string) {
  await teleport(page, 6, 1, "up");
  await stepOnce(page, "ArrowUp");
  await advanceDialog(page);
  await answerQuizCorrect(page);
  await onMap(page, nextMap);
  await page.waitForTimeout(800);
}

/* 宝箱を となりから しらべる */
async function openChest(page: P, x: number, y: number, facing: string, onceFlag: string) {
  await teleport(page, x, y, facing);
  await page.keyboard.press("z");
  await advanceDialog(page);
  await flag(page, onceFlag);
}

/* みこの会話を送り、「ムゲンのらせんに いどむ?」の はい (0番) を選ぶ */
async function chooseSpiral(page: P) {
  await page.keyboard.press("z");
  const options = page.locator('[data-testid="ui-option"]');
  for (let i = 0; i < 12 && (await options.count()) === 0; i++) {
    await page.keyboard.press("z");
    await page.waitForTimeout(500);
  }
  await expect(page.getByText(SPIRAL_ENTRANCE_PROMPT)).toBeVisible({ timeout: 10_000 });
  expect(await options.count()).toBe(2);
  await options.nth(0).click();
  await page.waitForTimeout(400);
  await advanceDialog(page); /* らせんの かいだんが… */
}

/* 戦闘後の会話 (称号) を送り切って、transfer で ほこらに もどるまで待つ */
async function advanceUntilMap(page: P, mapId: string, maxPresses = 60) {
  for (let i = 0; i < maxPresses; i++) {
    await page.waitForTimeout(400);
    const pos = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave().location);
    if (pos.mapId === mapId) return;
    await page.keyboard.press("z");
  }
  throw new Error(`${mapId} に もどらない`);
}

test("chapter 7 golden path: hoshioki priest → spiral floors 1-5 (grade doors) → chests → gate → mugenia → ムゲンの ゆうしゃ → back to shrine", async ({
  page,
}) => {
  test.setTimeout(600_000);
  await seedChapter(page, 6);
  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.setFlag("c6.clear"));

  /* ホシオキの ほこら: みこ (4,2) の前で はなす → らせんへ */
  await warp(page, SHRINE, "start");
  await teleport(page, 4, 3, "up");
  await chooseSpiral(page);
  await onMap(page, "ch7-spiral-1");
  await page.waitForTimeout(800);

  /* 章は進まない (advanceChapter を使わない) */
  const chapter = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave().chapter);
  expect(chapter.current).toBe(6);

  /* 1層 (小1 くりあがり) → 2層 */
  await passSpiralDoor(page, "ch7-spiral-2");

  /* 2層: 宝箱 (7,5) を左から → 九九の扉 → 3層 */
  await openChest(page, 6, 5, "right", "c7.chest2");
  const items = await page.evaluate(
    () => window.__KAZUQUEST_DEBUG__!.getSave().inventory.items,
  );
  expect(items.seiNoShizuku ?? 0).toBeGreaterThanOrEqual(5);
  await passSpiralDoor(page, "ch7-spiral-3");

  /* 3層 (小3 わり算) → 4層 */
  await passSpiralDoor(page, "ch7-spiral-4");

  /* 4層: 宝箱 (5,7) を右から → 小数の扉 → 5層 */
  await openChest(page, 6, 7, "left", "c7.chest4");
  await passSpiralDoor(page, "ch7-spiral-5");

  /* 5層: 割合の門 (6,5) を踏む → 正解で ひらいたまま (c7.gate5) */
  await teleport(page, 6, 6, "up");
  await stepOnce(page, "ArrowUp");
  await advanceDialog(page);
  await answerQuizCorrect(page);
  await flag(page, "c7.gate5");

  /* ∞竜ムゲニア (6,3): 1マス手前から踏み込む */
  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.grantLevel(60));
  await teleport(page, 6, 4, "up");
  await stepOnce(page, "ArrowUp");
  await advanceDialog(page);
  await inBattle(page);
  await grindBattleUntilField(page, 400);

  /* 称号の会話を送り切ると ほこらへ もどる */
  await advanceUntilMap(page, SHRINE);
  await page.waitForTimeout(800);

  const saved = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());
  expect(saved.flags["c7.bossDefeated"]).toBe(true);
  expect(saved.flags["c7.clear"]).toBe(true);
  expect(saved.location.mapId).toBe(SHRINE);
  expect(saved.chapter.current).toBe(6);
});
