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
 * 第4章ゴールデンパス。seedChapter(4) で章4開始地点 (メジャーリア入口) に立ち、
 * けいそく長 → どうぐや → まなびや (カクドスピン) → 氷の洞くつ (宝箱 + こおりのゴーレム
 * + リトル加入) → 角度の遺跡 (3つの分度器とびら + 宝箱) → デシマロン → 報告 → クリア
 * → 西の港の船のりが パーセン行きの船を出す (章末の船入手)。
 * 位置決めはワープ/テレポート。加入イベントとボス手前の1歩は実際に歩く。
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

/* クイズ扉: 出題パネルで正解 (小4の単元はテンキー — KQ-12) → 「せいかい!」を送る */
async function answerQuizCorrect(page: P) {
  await waitForAnswerable(page);
  await answerCorrectOnce(page);
  /* パネルの正解フィードバック (500ms) が終わって次のメッセージが開くのを待つ */
  await page.waitForTimeout(1200);
  await advanceDialog(page);
}

/* 分度器の とびら (6,0): 1歩踏む → 前口上 → クイズ正解 → 次の層へ */
async function passRuinsDoor(page: P, nextMap: string) {
  await teleport(page, 6, 1, "up");
  await stepOnce(page, "ArrowUp");
  await advanceDialog(page);
  await answerQuizCorrect(page);
  await onMap(page, nextMap);
  await page.waitForTimeout(800);
}

/* 宝箱 (x,y) の右隣から しらべる */
async function openChest(page: P, x: number, y: number, onceFlag: string) {
  await teleport(page, x + 1, y, "left");
  await page.keyboard.press("z");
  await advanceDialog(page);
  await flag(page, onceFlag);
}

test("chapter 4 golden path: chief → shop → learn カクドスピン → icecave golem → little joins → angle ruins doors → decimaron → clear → ship", async ({
  page,
}) => {
  test.setTimeout(600_000);
  const start = await seedChapter(page, 4);
  expect(start.mapId).toBe("ch4-majoria");
  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.grantLevel(60));

  /* メジャーリア: けいそく長 (7,13) から依頼 → c4.metChief (+400G) */
  const goldBefore = await page.evaluate(
    () => window.__KAZUQUEST_DEBUG__!.getSave().inventory.gold,
  );
  await teleport(page, 7, 12, "down");
  await interactAndAdvance(page);
  await flag(page, "c4.metChief");
  const goldAfter = await page.evaluate(
    () => window.__KAZUQUEST_DEBUG__!.getSave().inventory.gold,
  );
  expect(goldAfter - goldBefore).toBe(400);

  /* どうぐや: 入口 (14,4) を踏んで入り、店主 (3,3) の かう/うる の入口を開いて やめる */
  await teleport(page, 14, 5, "up");
  await stepOnce(page, "ArrowUp");
  await onMap(page, "ch4-majoria-shop");
  await page.waitForTimeout(800);
  await teleport(page, 3, 4, "up");
  const options = page.locator('[data-testid="ui-option"]');
  /* 「いらっしゃい…」を z で送り、かう/うる の list が出たら止める
     (list 表示中に z を押すと先頭 = かう を選んでしまう) */
  for (let i = 0; i < 12 && (await options.count()) === 0; i++) {
    await page.keyboard.press("z");
    await page.waitForTimeout(500);
  }
  await expect(options.last()).toHaveText(/やめる/, { timeout: 10_000 });
  expect(await options.count()).toBeGreaterThan(1);
  await options.last().click();
  await advanceDialog(page); /* まいど ありがとう! */

  /* まなびや: はかりの女王 (4,2) の一覧から「角度」を選んで全問正解 */
  await warp(page, "ch4-majoria-manabiya", "start");
  await teleport(page, 4, 3, "up");
  await openTeacherMenuAndPickUnit(page, "g4_angle");
  await walkLessonToPass(page);
  await page.waitForFunction(
    () =>
      window.__KAZUQUEST_DEBUG__!.getSave().party[0].learnedSpells.includes(
        "kakudoSpin",
      ),
    undefined,
    { timeout: 15_000 },
  );
  await flag(page, "learned.kakudoSpin");

  /* せつげんから 氷の洞くつ入口 (20,11) を踏んで入る */
  await warp(page, "ch4-world", "from-icecave");
  await stepOnce(page, "ArrowRight");
  await onMap(page, "ch4-icecave-1");
  await page.waitForTimeout(800);

  /* 1F: 宝箱 (2,8) → 奥の扉 (6,0) から こおりの間へ */
  await openChest(page, 2, 8, "c4.icecaveChest");
  const items1 = await page.evaluate(
    () => window.__KAZUQUEST_DEBUG__!.getSave().inventory.items,
  );
  expect(items1.kagamiNoTate ?? 0).toBeGreaterThan(0);
  await teleport(page, 6, 1, "up");
  await stepOnce(page, "ArrowUp");
  await onMap(page, "ch4-icecave-2");
  await page.waitForTimeout(800);

  /* こおりの間: (6,5) を踏んで こおりのゴーレム戦 (中ボス) */
  await teleport(page, 6, 6, "up");
  await stepOnce(page, "ArrowUp");
  await advanceDialog(page);
  await inBattle(page);
  await grindBattleUntilField(page, 200);
  await advanceDialog(page);
  await flag(page, "c4.iceGolem");

  /* リトル (4,2) の前まで実際に歩いて話しかける → 加入 (4人パーティ) */
  await teleport(page, 4, 4, "up");
  await stepOnce(page, "ArrowUp"); /* (4,3) */
  await interactAndAdvance(page);
  await flag(page, "c4.metLittle");
  const party = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave().party);
  expect(party.some((m) => m.memberId === "little")).toBe(true);
  expect(party.length).toBe(4);
  /* なかまが教える場面 (LP-19): リトルの得意分野 (小数の 計算) の
   * 短いレッスンが加入直後に開く。最後まで進めて閉じないと以降の操作が
   * ブロックされたままになる */
  await walkLessonToPass(page);

  /*
   * LP-20: 遺跡の番人は 章4の中核3単元 (角度・小数・2桁でわるわり算) が
   * すべて「できる」で消える。角度 (g4_angle) は上のレッスンで実際に学んだので、
   * 残り2つを E2E ショートカットで can にする
   */
  await page.evaluate(() => {
    window.__KAZUQUEST_DEBUG__!.setMastery("g4_decimal", "can");
    window.__KAZUQUEST_DEBUG__!.setMastery("g4_div_2digit", "can");
  });

  /* せつげんから 角度の遺跡入口 (20,4) を踏んで入る */
  await warp(page, "ch4-world", "from-angle-ruins");
  await stepOnce(page, "ArrowRight");
  await onMap(page, "ch4-ruins-1");
  await page.waitForTimeout(800);

  /* 1そう: 角度の とびら */
  await passRuinsDoor(page, "ch4-ruins-2");

  /* 2そう: 宝箱 (2,6) → 面せきの とびら */
  await openChest(page, 2, 6, "c4.ruinsChest");
  const items2 = await page.evaluate(
    () => window.__KAZUQUEST_DEBUG__!.getSave().inventory.items,
  );
  expect(items2.kooriNoKen ?? 0).toBeGreaterThan(0);
  await passRuinsDoor(page, "ch4-ruins-3");

  /* 3そう: がい数の とびら → 最深部 */
  await passRuinsDoor(page, "ch4-ruins-deep");

  /* 最深部: 最後の1歩を歩いて 小数の魔人デシマロン (6,2) 戦 */
  await teleport(page, 6, 3, "up");
  await stepOnce(page, "ArrowUp");
  await advanceDialog(page);
  await inBattle(page);
  await grindBattleUntilField(page, 300);
  await advanceDialog(page);
  await flag(page, "c4.orb4");
  await flag(page, "c4.bossDefeated");

  /* けいそく長へ報告 → 第4章クリア・第5章へ */
  await warp(page, "ch4-majoria", "entrance");
  await teleport(page, 7, 12, "down");
  await interactAndAdvance(page);
  await flag(page, "c4.clear");
  const save = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());
  expect(save.chapter.current).toBe(5);
  expect(save.chapter.cleared).toContain(4);
  expect(save.party.some((m) => m.memberId === "little")).toBe(true);
  expect(save.party.length).toBe(4);

  /* 章末の船: 西の港の船のり (2,7) が 新しい船で パーセン行きを提案する */
  await warp(page, "ch4-world", "from-ship");
  await teleport(page, 1, 7, "right");
  await page.keyboard.press("z");
  await expect(page.locator('[data-testid="ui-message-text"]')).toContainText(
    /あたらしい 船/,
    { timeout: 10_000 },
  );
  for (let i = 0; i < 8 && (await options.count()) === 0; i++) {
    await page.keyboard.press("z");
    await page.waitForTimeout(500);
  }
  expect(await options.count()).toBe(2); /* パーセンへ 船を だす? はい/いいえ */
  await options.last().click(); /* いいえ → ワケーラへ もどる? */
  await page.waitForTimeout(700);
  if ((await options.count()) > 0) await options.last().click(); /* いいえ */
  await advanceDialog(page);
  const pos = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave().location);
  expect(pos.mapId).toBe("ch4-world");
});
