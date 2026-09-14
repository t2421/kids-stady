import { expect, test } from "@playwright/test";
import {
  advanceDialog,
  correctChoice,
  grindBattleUntilField,
  interactAndAdvance,
  startGame,
  stepOnce,
  takeSpellTestAllCorrect,
  teleport,
  warp,
} from "./helpers";

/*
 * 第2章ゴールデンパス。章1クリア直前のセーブから王への報告で章2を開放し、
 * 船 → タスク加入 → ククダマ習得 → 九九の塔 → ブロッタ → クリア まで通す。
 * (章1→2 の遷移そのものを検証するため seedChapter ではなく王への報告から始める)
 */

test("chapter 2 golden path: ship → tasuku joins → learn ククダマ → tower quiz doors → blotta → clear", async ({
  page,
}) => {
  test.setTimeout(600_000);
  await startGame(page);

  /* 章1クリア直前の状態を用意し、王様への報告から章2を開放する */
  await page.evaluate(() => {
    window.__KAZUQUEST_DEBUG__!.setFlag("c1.metKing");
    window.__KAZUQUEST_DEBUG__!.setFlag("c1.orb1");
    window.__KAZUQUEST_DEBUG__!.grantLevel(15);
  });
  await warp(page, "ch1-capital-castle", "start");
  await teleport(page, 6, 3, "up");
  await interactAndAdvance(page);
  await page.waitForFunction(
    () =>
      window.__KAZUQUEST_DEBUG__!.getSave().flags["c1.clear"] === true &&
      window.__KAZUQUEST_DEBUG__!.getSave().chapter.current === 2,
  );

  /* 船のりに たのんで うみかぜの しまへ */
  await warp(page, "ch1-world", "port");
  await teleport(page, 19, 13, "right");
  await interactAndAdvance(page); /* choice は z で はい → しゅっぱーつ! */
  await page.waitForFunction(
    () => window.__KAZUQUEST_DEBUG__!.getSave().location.mapId === "ch2-world",
    undefined,
    { timeout: 15_000 },
  );

  /* ミナトス: 長の話 → タスク加入 */
  await warp(page, "ch2-minatos", "entrance");
  await teleport(page, 11, 6, "up"); /* みなとの長 (11,5) の下 */
  await interactAndAdvance(page);
  await page.waitForFunction(
    () => window.__KAZUQUEST_DEBUG__!.getSave().flags["c2.metMaster"] === true,
  );
  await teleport(page, 12, 10, "right"); /* タスク (13,10) のとなり */
  await interactAndAdvance(page);
  await page.waitForFunction(
    () => window.__KAZUQUEST_DEBUG__!.getSave().party.length === 2,
  );

  /* まなびやで ククダマ習得 (塔の門番ゲート解除) */
  await warp(page, "ch2-minatos-manabiya", "start");
  await teleport(page, 4, 3, "up");
  await takeSpellTestAllCorrect(page);
  await page.waitForFunction(
    () =>
      window.__KAZUQUEST_DEBUG__!.getSave().party[0].learnedSpells.includes(
        "kukudama",
      ),
    undefined,
    { timeout: 15_000 },
  );
  await advanceDialog(page);

  /* 九九の塔: 4つのクイズ扉を正解で のぼる */
  await warp(page, "ch2-tower-1", "start");
  for (let floor = 1; floor <= 4; floor++) {
    await teleport(page, 6, 3, "up");
    await stepOnce(page, "ArrowUp"); /* 扉 (6,2) を踏む */
    await advanceDialog(page); /* 「◯のだんの とびらだ…」 */
    const btn = correctChoice(page);
    await btn.waitFor({ state: "visible", timeout: 15_000 });
    await btn.click();
    /* パネルの正解フィードバック (500ms) が終わって「せいかい!」が開くのを待つ */
    await page.waitForTimeout(1200);
    await advanceDialog(page); /* 「せいかい! とびらが ひらいた!」 */
    const targetMap = floor === 4 ? "ch2-tower-top" : `ch2-tower-${floor + 1}`;
    await page.waitForFunction(
      (id) => window.__KAZUQUEST_DEBUG__!.getSave().location.mapId === id,
      targetMap,
      { timeout: 30_000 },
    );
    await page.waitForTimeout(800);
  }

  /* 最上階: ブロッタ戦 */
  await teleport(page, 5, 3, "up");
  await stepOnce(page, "ArrowUp");
  await advanceDialog(page);
  await page.waitForFunction(
    () => window.__KAZUQUEST_GAME__!.scene.isActive("Battle"),
    undefined,
    { timeout: 10_000 },
  );
  await grindBattleUntilField(page, 200);
  await advanceDialog(page);
  await page.waitForFunction(
    () => window.__KAZUQUEST_DEBUG__!.getSave().flags["c2.orb2"] === true,
    undefined,
    { timeout: 15_000 },
  );

  /* みなとの長へ報告 → 第2章クリア */
  await warp(page, "ch2-minatos", "entrance");
  await teleport(page, 11, 6, "up");
  await interactAndAdvance(page);
  await page.waitForFunction(
    () => window.__KAZUQUEST_DEBUG__!.getSave().flags["c2.clear"] === true,
  );
});
