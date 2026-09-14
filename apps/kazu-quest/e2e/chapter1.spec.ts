import { expect, test } from "@playwright/test";
import {
  advanceDialog,
  fieldPos,
  grindBattleUntilField,
  interactAndAdvance,
  startGame,
  stepOnce,
  takeSpellTestAllCorrect,
  teleport,
  warp,
} from "./helpers";

/* 第1章ゴールデンパス: 母 → 王 → 習得 → 中ボス → ボス → クリア (本番静的ビルドで実行) */

test("chapter 1 golden path: mother → king → learn → gates → boss → clear", async ({
  page,
}) => {
  test.setTimeout(480_000);
  await startGame(page);

  const start = await fieldPos(page);
  expect(start.mapId).toBe("ch1-hajimari");
  await warp(page, "ch1-hajimari-home", "start");
  await teleport(page, 6, 3, "up");
  await interactAndAdvance(page);
  await page.waitForFunction(
    () => window.__KAZUQUEST_DEBUG__!.getSave().flags["c1.started"] === true,
  );

  /* 王都: 謁見 (クエスト + 50G)。王は (6,2) なので (6,3) から話す */
  await warp(page, "ch1-capital-castle", "start");
  await teleport(page, 6, 3, "up");
  await interactAndAdvance(page);
  const afterKing = await page.evaluate(() =>
    window.__KAZUQUEST_DEBUG__!.getSave(),
  );
  expect(afterKing.flags["c1.metKing"]).toBe(true);
  expect(afterKing.inventory.gold).toBe(50);

  /* まなびや: ヒキダマ習得テスト (賢者は (2,4)) */
  await teleport(page, 3, 4, "left");
  await takeSpellTestAllCorrect(page);
  await page.waitForFunction(
    () =>
      window.__KAZUQUEST_DEBUG__!.getSave().party[0].learnedSpells.includes(
        "hikidama",
      ),
    undefined,
    { timeout: 15_000 },
  );
  await advanceDialog(page);

  /* E2E用にレベルを上げてボス戦を短縮 (テストフック) */
  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.grantLevel(12));

  /* 森の中ボス */
  await warp(page, "ch1-forest", "north");
  await teleport(page, 9, 5, "down");
  await stepOnce(page, "ArrowDown");
  await advanceDialog(page);
  await page.waitForFunction(
    () => window.__KAZUQUEST_GAME__!.scene.isActive("Battle"),
    undefined,
    { timeout: 10_000 },
  );
  await grindBattleUntilField(page);
  await advanceDialog(page);
  await page.waitForFunction(
    () => window.__KAZUQUEST_DEBUG__!.getSave().flags["c1.midboss"] === true,
  );

  /* モリカゲ村のまなびや: ヒキダマン習得テスト (橋の番人ゲート解除) */
  await warp(page, "ch1-morikage-manabiya", "start");
  await teleport(page, 4, 3, "up");
  await takeSpellTestAllCorrect(page);
  await page.waitForFunction(
    () =>
      window.__KAZUQUEST_DEBUG__!.getSave().party[0].learnedSpells.includes(
        "hikidaman",
      ),
    undefined,
    { timeout: 15_000 },
  );
  await advanceDialog(page);

  /* 洞くつ最奥のボス イレイサー */
  await warp(page, "ch1-cave-boss", "entry");
  await teleport(page, 5, 4, "right");
  await stepOnce(page, "ArrowRight");
  await advanceDialog(page);
  await page.waitForFunction(
    () => window.__KAZUQUEST_GAME__!.scene.isActive("Battle"),
    undefined,
    { timeout: 10_000 },
  );
  await grindBattleUntilField(page, 160);
  await advanceDialog(page);
  await page.waitForFunction(
    () => window.__KAZUQUEST_DEBUG__!.getSave().flags["c1.orb1"] === true,
    undefined,
    { timeout: 15_000 },
  );

  /* 王様に報告して第1章クリア */
  await warp(page, "ch1-capital-castle", "start");
  await teleport(page, 6, 3, "up");
  await interactAndAdvance(page);
  await page.waitForFunction(
    () => window.__KAZUQUEST_DEBUG__!.getSave().flags["c1.clear"] === true,
  );
});
