import { expect, test } from "@playwright/test";
import {
  advanceDialog,
  answerCorrectOnce,
  grindBattleUntilField,
  interactAndAdvance,
  openTeacherMenuAndPickUnit,
  seedChapter,
  stepOnce,
  teleport,
  waitForAnswerable,
  walkLessonToPass,
  warp,
} from "./helpers";

/*
 * 第3章ゴールデンパス。seedChapter(3) で章3開始地点 (ワケーラ入口) に立ち、
 * まちおさ → カケル加入 → どうぐや → まなびや (ワリダマ) → 大灯りの遺跡 →
 * ピラミッド (3つの わり算とびら + かくし宝箱 + ゴーレム) → アマリダ → 報告 → クリア。
 * 位置決めはワープ/テレポート。加入イベントとボス手前の1歩は実際に歩く。
 */

const flag = (page: Parameters<typeof teleport>[0], name: string) =>
  page.waitForFunction(
    (f) => window.__KAZUQUEST_DEBUG__!.getSave().flags[f] === true,
    name,
    { timeout: 15_000 },
  );

const onMap = (page: Parameters<typeof teleport>[0], mapId: string) =>
  page.waitForFunction(
    (id) => window.__KAZUQUEST_DEBUG__!.getSave().location.mapId === id,
    mapId,
    { timeout: 30_000 },
  );

/* クイズ扉/祭壇: 出題パネルで正解 (小3の単元はテンキー — KQ-12) → 「せいかい!」を送る */
async function answerQuizCorrect(page: Parameters<typeof teleport>[0]) {
  await waitForAnswerable(page);
  await answerCorrectOnce(page);
  /* パネルの正解フィードバック (500ms) が終わって次のメッセージが開くのを待つ */
  await page.waitForTimeout(1200);
  await advanceDialog(page);
}

test("chapter 3 golden path: chief → kakeru joins → shop → learn ワリダマ → ruins lamp → pyramid doors → golem → amarida → clear", async ({
  page,
}) => {
  test.setTimeout(600_000);
  const start = await seedChapter(page, 3);
  expect(start.mapId).toBe("ch3-wakeera");
  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.grantLevel(45));

  /* ワケーラ: まちおさ (7,12) から依頼 → c3.metChief */
  await teleport(page, 7, 11, "down");
  await interactAndAdvance(page);
  await flag(page, "c3.metChief");

  /* カケル (11,6) の前まで実際に歩いて話しかける → 加入 */
  await teleport(page, 11, 8, "up");
  await stepOnce(page, "ArrowUp"); /* (11,7) */
  await interactAndAdvance(page);
  await flag(page, "c3.metKakeru");
  const party = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave().party);
  expect(party.some((m) => m.memberId === "kakeru")).toBe(true);
  /* なかまが教える場面 (LP-19): カケルの得意分野 (かけ算の ひっ算) の
   * 短いレッスンが加入直後に開く。最後まで進めて閉じないと以降の操作が
   * ブロックされたままになる */
  await walkLessonToPass(page);

  /* どうぐや: 入口 (14,4) を踏んで入り、店主 (3,3) の品物リストを開いて やめる */
  await teleport(page, 14, 5, "up");
  await stepOnce(page, "ArrowUp");
  await onMap(page, "ch3-wakeera-shop");
  await page.waitForTimeout(800);
  await teleport(page, 3, 4, "up");
  const options = page.locator('[data-testid="ui-option"]');
  /* 「いらっしゃい…」を z で送り、品物リスト (list) が出たら止める
     (list 表示中に z を押すと先頭の品物を買ってしまう) */
  for (let i = 0; i < 12 && (await options.count()) === 0; i++) {
    await page.keyboard.press("z");
    await page.waitForTimeout(500);
  }
  await expect(options.last()).toHaveText(/やめる/, { timeout: 10_000 });
  expect(await options.count()).toBeGreaterThan(1);
  await options.last().click();
  await advanceDialog(page); /* まいど ありがとう! */

  /* まなびや: 計算商人 (4,2) の一覧から「わり算」を選んで全問正解 */
  await warp(page, "ch3-wakeera-manabiya", "start");
  await teleport(page, 4, 3, "up");
  await openTeacherMenuAndPickUnit(page, "g3_div");
  await walkLessonToPass(page);
  await page.waitForFunction(
    () =>
      window.__KAZUQUEST_DEBUG__!.getSave().party[0].learnedSpells.includes(
        "waridama",
      ),
    undefined,
    { timeout: 15_000 },
  );
  await flag(page, "learned.waridama");

  /* 大灯りの遺跡 (寄り道): 祭壇 (6,1) を しらべて 円の といに 正解 → c3.ruinsLit */
  await warp(page, "ch3-ruins-2", "entrance");
  await teleport(page, 6, 2, "up");
  await page.keyboard.press("z");
  await advanceDialog(page); /* 大きな まるい 灯りだ… */
  await answerQuizCorrect(page);
  await flag(page, "c3.ruinsLit");
  const items = await page.evaluate(
    () => window.__KAZUQUEST_DEBUG__!.getSave().inventory.items,
  );
  expect(items.hagaNeNoTsurugi ?? 0).toBeGreaterThan(0);

  /* さばくから ピラミッド入口 (20,5) を踏んで入る */
  await warp(page, "ch3-world", "from-pyramid");
  await stepOnce(page, "ArrowRight");
  await onMap(page, "ch3-pyramid-1");
  await page.waitForTimeout(800);

  /* 1そう: わり算の とびら (6,0) */
  await teleport(page, 6, 1, "up");
  await stepOnce(page, "ArrowUp");
  await advanceDialog(page); /* 「わけまえの とびら」だ… */
  await answerQuizCorrect(page);
  await onMap(page, "ch3-pyramid-2");
  await page.waitForTimeout(800);

  /* 2そう: かくし宝箱 (2,6) → あまりの とびら (6,0) */
  await teleport(page, 3, 6, "left");
  await page.keyboard.press("z");
  await advanceDialog(page);
  await flag(page, "c3.pyramidChest");
  await teleport(page, 6, 1, "up");
  await stepOnce(page, "ArrowUp");
  await advanceDialog(page);
  await answerQuizCorrect(page);
  await onMap(page, "ch3-pyramid-3");
  await page.waitForTimeout(800);

  /* 3そう: わけまえゴーレム (6,3) を踏んで中ボス戦 → かけ算ひっさんの とびら */
  await teleport(page, 6, 4, "up");
  await stepOnce(page, "ArrowUp");
  await advanceDialog(page);
  await page.waitForFunction(
    () => window.__KAZUQUEST_GAME__!.scene.isActive("Battle"),
    undefined,
    { timeout: 10_000 },
  );
  await grindBattleUntilField(page, 200);
  await advanceDialog(page);
  await flag(page, "c3.golem");
  await teleport(page, 6, 1, "up");
  await stepOnce(page, "ArrowUp");
  await advanceDialog(page);
  await answerQuizCorrect(page);
  await onMap(page, "ch3-pyramid-top");
  await page.waitForTimeout(800);

  /* げんしつ: 最後の1歩を歩いて 盗賊王アマリダ (6,2) 戦 */
  await teleport(page, 6, 3, "up");
  await stepOnce(page, "ArrowUp");
  await advanceDialog(page);
  await page.waitForFunction(
    () => window.__KAZUQUEST_GAME__!.scene.isActive("Battle"),
    undefined,
    { timeout: 10_000 },
  );
  await grindBattleUntilField(page, 300);
  await advanceDialog(page);
  await flag(page, "c3.bossDefeated");
  await flag(page, "c3.orb3");

  /* まちおさへ報告 → 第3章クリア・第4章へ */
  await warp(page, "ch3-wakeera", "entrance");
  await teleport(page, 7, 11, "down");
  await interactAndAdvance(page);
  await flag(page, "c3.clear");
  const save = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());
  expect(save.chapter.current).toBe(4);
  expect(save.chapter.cleared).toContain(3);
  expect(save.party.some((m) => m.memberId === "kakeru")).toBe(true);
});
