import { expect, test, type Page } from "@playwright/test";
import {
  advanceDialog,
  advanceDialogUntilScene,
  answerCorrectOnce,
  fieldPos,
  grindBattleUntil,
  grindBattleUntilField,
  interactAndAdvance,
  seedChapter,
  stepOnce,
  teleport,
  waitForAnswerable,
  waitForScene,
  warp,
} from "./helpers";

/*
 * 第6章ゴールデンパス (KQ-05)。seedChapter(6) で ホシオキ入口に立ち、
 * 長老 → (番人の順路ゲート確認) → はやさの回廊 (とびら + 印) → エンの神殿 (宝箱 + とびら + 印)
 * → ピタゴラの試練 (まぼろしの勇者) → ゼロム城 (宝箱・とびら・牢のガウス・とびら)
 * → 玉座で 冥王ゼロム 2形態 → Ending → タイトル → つづきから → ホシオキの ほこら。
 * ラスボス→Ending→タイトルの詳細 (はじめから の確認など) は ending.spec.ts が担当。
 * 位置決めはワープ/テレポート。イベントを踏む最後の1歩と 番人の前だけ実際に歩く。
 *
 * レベル: grantLevel は勇者だけを上げる (仲間は加入Lv 6/13/20 のまま 1撃で倒れる) ので、
 * たたかう だけで 3体同時 (円の印) や ゼロム連戦を通すには 勇者を上限 Lv99 にする。
 * grantLevel は HP/MP も最大に戻すので、各イベント戦闘の直前と ゼロム 2形態の間の
 * 全回復にも使う (全滅すると checkpoint に戻され onceFlag が立たない)。
 */

type P = Page;

const ENDING_MAP = "ch6-hoshioki-shrine";

const getSave = (page: P) =>
  page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());

/* 勇者を Lv99 に (= HP/MP 全回復)。各イベント戦闘の直前に呼ぶ */
const restoreHero = (page: P) =>
  page.evaluate(() => window.__KAZUQUEST_DEBUG__!.grantLevel(99));

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
    { timeout: 15_000 },
  );

const isBattle = (page: P) =>
  page.evaluate(() => window.__KAZUQUEST_GAME__!.scene.isActive("Battle"));

/* Ending シーンの「タップでタイトルへ」が出るまで待つ (EndingScene.readyToLeave) */
const waitForEndingReady = (page: P) =>
  page.waitForFunction(
    () => {
      const scene = window.__KAZUQUEST_GAME__!.scene.getScene("Ending") as unknown as {
        readyToLeave?: boolean;
      } | null;
      return scene?.readyToLeave === true;
    },
    undefined,
    { timeout: 20_000 },
  );

const canvasTap = (page: P) =>
  page.locator("canvas").click({ position: { x: 640, y: 360 } });

/* クイズ: 出題パネルで正解 (小6の単元はテンキー — KQ-12) → 「せいかい!」を送る */
async function answerQuizCorrect(page: P) {
  await waitForAnswerable(page);
  await answerCorrectOnce(page);
  /* パネルの正解フィードバック (500ms) が終わって次のメッセージが開くのを待つ */
  await page.waitForTimeout(1200);
  await advanceDialog(page);
}

/* 各ダンジョンの とびら (6,0): 1歩踏む → 前口上 → クイズ正解 → 次のマップへ */
async function passQuizDoor(page: P, nextMap: string) {
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

/* (6,y) の step イベントを 1マス下から踏んで、会話 → 戦闘 → 会話 → フラグ */
async function stepIntoBattleEvent(page: P, y: number, onceFlag: string, maxSteps: number) {
  await restoreHero(page);
  await teleport(page, 6, y + 1, "up");
  await stepOnce(page, "ArrowUp");
  await advanceDialog(page);
  await inBattle(page);
  await grindBattleUntilField(page, maxSteps);
  await advanceDialog(page);
  await flag(page, onceFlag);
}

/* ワールドは全タイルがエンカウント。右へ歩いて mapId に入るまで (戦闘は捌く) */
async function walkRightInto(page: P, mapId: string, maxSteps = 4) {
  for (let i = 0; i < maxSteps; i++) {
    await stepOnce(page, "ArrowRight");
    await page.waitForTimeout(500);
    if (await isBattle(page)) {
      await grindBattleUntilField(page, 120);
      await page.waitForTimeout(500);
    }
    if ((await fieldPos(page)).mapId === mapId) return;
  }
  throw new Error(`${mapId} に入れない`);
}

test("chapter 6 golden path: elder → sequential gate → speed seal → en seal (+chest) → trial seal → castle (gauss) → zerom 2 forms → Ending → Title → つづきから", async ({
  page,
}) => {
  test.setTimeout(720_000);
  const start = await seedChapter(page, 6);
  expect(start.mapId).toBe("ch6-hoshioki");
  await restoreHero(page);

  /* ホシオキ: 長老 (7,13) から 3つの印の話 → c6.metElder (+2000G) */
  const goldBefore = (await getSave(page)).inventory.gold;
  await teleport(page, 7, 12, "down");
  await interactAndAdvance(page);
  await flag(page, "c6.metElder");
  expect((await getSave(page)).inventory.gold - goldBefore).toBe(2000);

  /* 順路ゲート: はやさの印がないうちは エンの神殿の番人 (19,12) が道をふさぐ */
  await warp(page, "ch6-world", "from-speed");
  await teleport(page, 18, 12, "right");
  await stepOnce(page, "ArrowRight");
  const blocked = await fieldPos(page);
  expect(blocked).toMatchObject({ mapId: "ch6-world", x: 18, y: 12 });
  await page.keyboard.press("z");
  await expect(page.locator('[data-testid="ui-message-text"]')).toContainText(
    /はやさの 印/,
    { timeout: 10_000 },
  );
  await advanceDialog(page);

  /* はやさの回廊: 速さの とびら (6,0) → 奥 → 祭壇 (6,1) を しらべて クイズ → はやさの印 */
  await warp(page, "ch6-speed-1", "entrance");
  await passQuizDoor(page, "ch6-speed-2");
  await teleport(page, 6, 2, "up");
  await page.keyboard.press("z");
  await advanceDialog(page);
  await answerQuizCorrect(page);
  await flag(page, "c6.speedSeal");

  /* 番人が消えて (hideIf) エンの神殿 (20,12) に歩いて入れる */
  await warp(page, "ch6-world", "from-speed");
  await teleport(page, 18, 12, "right");
  await walkRightInto(page, "ch6-en-1");
  await page.waitForTimeout(800);

  /* エンの神殿: 宝箱 (2,6) → 円の とびら (6,0) → 内陣 (6,3) を踏んで 戦闘 → 円の印 */
  await openChest(page, 2, 6, "c6.enChest");
  expect((await getSave(page)).inventory.items.suushouNoTate ?? 0).toBeGreaterThan(0);
  await passQuizDoor(page, "ch6-en-2");
  await stepIntoBattleEvent(page, 3, "c6.enSeal", 200);

  /* ピタゴラの試練: (6,3) を踏んで まぼろしの勇者 (中ボス) → ピタゴラの印 + つるぎ */
  await warp(page, "ch6-trial", "entrance");
  await stepIntoBattleEvent(page, 3, "c6.trialSeal", 300);
  expect((await getSave(page)).inventory.items.pitagoraNoKen ?? 0).toBeGreaterThan(0);

  /* ゼロム城 1かい: 宝箱 (2,5) → x の とびら (6,0) */
  await warp(page, "ch6-zerom-1", "entrance");
  await openChest(page, 2, 5, "c6.zeromChest");
  expect((await getSave(page)).inventory.items.pitagoraNoYoroi ?? 0).toBeGreaterThan(0);
  await passQuizDoor(page, "ch6-zerom-2");

  /* 2かい: 牢の ガウス (2,3) に 右隣 (3,3) から話しかける → c6.metGauss (+せいのしずく×3) */
  await teleport(page, 3, 3, "left");
  await interactAndAdvance(page);
  await flag(page, "c6.metGauss");
  expect((await getSave(page)).inventory.items.seiNoShizuku ?? 0).toBeGreaterThanOrEqual(3);

  /* 分数の とびら (6,0) → 玉座の間 */
  await passQuizDoor(page, "ch6-zerom-throne");

  /* 玉座の間: (6,3) を 1マス手前から踏む → 第1形態 → 会話 → 第2形態 → エピローグ → Ending */
  await restoreHero(page);
  await teleport(page, 6, 4, "up");
  await stepOnce(page, "ArrowUp");
  await advanceDialog(page);
  await inBattle(page);
  await grindBattleUntil(page, "Field", 300);
  /* 形態間の会話中 (Field) に全回復してから 第2形態へ */
  await restoreHero(page);
  await advanceDialog(page);
  await inBattle(page);
  await grindBattleUntil(page, "Field", 400);
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

  const saved = await getSave(page);
  expect(saved.flags["c6.bossDefeated"]).toBe(true);
  expect(saved.flags["c6.orb6"]).toBe(true);
  expect(saved.flags["c6.clear"]).toBe(true);
  expect(saved.chapter.cleared).toContain(6);
  expect(saved.checkpoint).toEqual({ mapId: ENDING_MAP, spawn: "start" });

  /* つづきから → ホシオキの ほこら で再開 */
  await cont.click();
  await waitForScene(page, "Field");
  await page.waitForTimeout(500);
  expect((await fieldPos(page)).mapId).toBe(ENDING_MAP);
});
