import { expect, test } from "@playwright/test";
import {
  advanceDialog,
  answerCorrectOnce,
  fieldPos,
  grindBattleUntilField,
  interactAndAdvance,
  openTeacherMenuAndPickUnit,
  seedChapter,
  stepOnce,
  teleport,
  waitForAnswerable,
  walkLessonToPass,
  walkUntil,
  warp,
} from "./helpers";

/*
 * 第5章ゴールデンパス。seedChapter(5) で章5開始地点 (パーセン入口) に立ち、
 * 女王 → どうぐや → まなびや (パーセンフレア) → 順番ゲート (星のかぎ なしで
 * 海の番人が道をふさぐ) → 空中庭園 (宝箱 + くもの ばんじん = 星のかぎ) →
 * 海底神殿 (クイズ扉 + しんかいの ぬし = 波のかぎ) → マイナドス城 (宝箱 +
 * 2つのクイズ扉 + 魔王マイナドス) → 女王に報告 → クリア → ゼロのあなの案内。
 * 位置決めはワープ/テレポート。ボス・扉・番人の手前の1歩は実際に歩く。
 * ボス部屋の看板 (5,7)/(5,8) は inspect イベントで移動をブロックするので踏まない。
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

const getSave = (page: P) =>
  page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());

const messageText = (page: P) => page.locator('[data-testid="ui-message-text"]');
const options = (page: P) => page.locator('[data-testid="ui-option"]');

/* z を送って ui-option (choice / 店の品物リスト) が出るまで待つ */
async function pressUntilOptions(page: P, maxPresses = 12) {
  for (let i = 0; i < maxPresses && (await options(page).count()) === 0; i++) {
    await page.keyboard.press("z");
    await page.waitForTimeout(500);
  }
}

/* クイズ扉: 出題パネルで正解 (小5の単元はテンキー — KQ-12) → 「せいかい!」を送る */
async function answerQuizCorrect(page: P) {
  await waitForAnswerable(page);
  await answerCorrectOnce(page);
  /* パネルの正解フィードバック (500ms) が終わって次のメッセージが開くのを待つ */
  await page.waitForTimeout(1200);
  await advanceDialog(page);
}

/* (6,0) のクイズ扉: 1歩踏む → 前口上 → クイズ正解 → 次の層へ */
async function passQuizDoor(page: P, nextMap: string) {
  await teleport(page, 6, 1, "up");
  await stepOnce(page, "ArrowUp");
  await advanceDialog(page);
  await answerQuizCorrect(page);
  await onMap(page, nextMap);
  await page.waitForTimeout(800);
}

/* (6,0) の ただの出入口: 1歩踏んで次のマップへ */
async function passDoor(page: P, nextMap: string) {
  await teleport(page, 6, 1, "up");
  await stepOnce(page, "ArrowUp");
  await onMap(page, nextMap);
  await page.waitForTimeout(800);
}

/*
 * E2E の勇者レベル。grantLevel は勇者だけを上げる (仲間は加入時の Lv6/13/20 のまま)
 * ので、仲間は 2〜3発で倒れ 勇者ひとりの通常攻撃になる。マイナドスは heal (30%)
 * を持ち、Lv40 の勇者単騎では DPS が回復と相殺されて勝率 0% (simulate.ts で測定:
 * Lv40=0% / Lv70=87% / Lv80=99% / Lv90=100%)。ボスごとに grantLevel し直して
 * HP/MP も全快させる (3連戦の持ち越しダメージを切る)。
 */
const HERO_LEVEL = 90;
const grantHeroLevel = (page: P) =>
  page.evaluate((lv) => window.__KAZUQUEST_DEBUG__!.grantLevel(lv), HERO_LEVEL);

/* ボス (bossX, bossY) の1歩手前から踏み込んで戦闘 → 勝利後の会話を送る。
   全滅すると ほこら (checkpoint) へ飛ばされるので、マップが変わっていたら失敗にする */
async function fightBossAt(page: P, bossX: number, bossY: number, maxSteps: number) {
  await grantHeroLevel(page);
  const { mapId } = await fieldPos(page);
  await teleport(page, bossX, bossY + 1, "up");
  await stepOnce(page, "ArrowUp");
  await advanceDialog(page);
  await inBattle(page);
  await grindBattleUntilField(page, maxSteps);
  await advanceDialog(page);
  const after = await fieldPos(page);
  if (after.mapId !== mapId) {
    throw new Error(`ボス戦で全滅した (${mapId} → ${after.mapId})`);
  }
}

/* 宝箱 (x,y) の右隣から しらべる */
async function openChest(page: P, x: number, y: number, onceFlag: string) {
  await teleport(page, x + 1, y, "left");
  await page.keyboard.press("z");
  await advanceDialog(page);
  await flag(page, onceFlag);
}

/* 女王 (7,13) の前に立って話す */
async function talkToQueen(page: P) {
  await warp(page, "ch5-percen", "entrance");
  await teleport(page, 7, 12, "down");
  await interactAndAdvance(page);
}

test("chapter 5 golden path: queen → shop → learn パーセンフレア → sea guard blocks → sky garden key → sea temple key → minados castle → clear → ゼロのあな", async ({
  page,
}) => {
  test.setTimeout(600_000);
  const start = await seedChapter(page, 5);
  expect(start.mapId).toBe("ch5-percen");
  await grantHeroLevel(page);

  /* パーセン: 女王 (7,13) から依頼 → c5.metQueen (+1000G) */
  const goldBefore = (await getSave(page)).inventory.gold;
  await talkToQueen(page);
  await flag(page, "c5.metQueen");
  expect((await getSave(page)).inventory.gold - goldBefore).toBe(1000);

  /* どうぐや: 入口 (14,4) を踏んで入り、店主 (3,3) の かう/うる の入口を開いて やめる */
  await teleport(page, 14, 5, "up");
  await stepOnce(page, "ArrowUp");
  await onMap(page, "ch5-percen-shop");
  await page.waitForTimeout(800);
  await teleport(page, 3, 4, "up");
  /* 「いらっしゃい…」を z で送り、かう/うる の list が出たら止める
     (list 表示中に z を押すと先頭 = かう を選んでしまう) */
  await pressUntilOptions(page);
  await expect(options(page).last()).toHaveText(/やめる/, { timeout: 10_000 });
  expect(await options(page).count()).toBeGreaterThan(1);
  await options(page).last().click();
  await advanceDialog(page); /* まいど ありがとう! */

  /* まなびや: 割合ギルド長 (4,2) の一覧から「割合と百分率」を選んで全問正解 */
  await warp(page, "ch5-percen-manabiya", "start");
  await teleport(page, 4, 3, "up");
  await openTeacherMenuAndPickUnit(page, "g5_percent");
  await walkLessonToPass(page);
  await page.waitForFunction(
    () =>
      window.__KAZUQUEST_DEBUG__!.getSave().party[0].learnedSpells.includes(
        "percenFlare",
      ),
    undefined,
    { timeout: 15_000 },
  );
  await flag(page, "learned.percenFlare");

  /* 順番ゲート: 星のかぎ なしでは 海の番人 (19,12) が 海底神殿入口 (20,12) への道をふさぐ */
  await warp(page, "ch5-world", "from-percen");
  expect((await getSave(page)).flags["c5.skyKey"]).toBeUndefined();
  await teleport(page, 18, 12, "right");
  await page.keyboard.press("z");
  await expect(messageText(page)).toContainText(/星のかぎ/, { timeout: 10_000 });
  await advanceDialog(page);
  await stepOnce(page, "ArrowRight"); /* 番人に ぶつかって進めない */
  const blocked = await fieldPos(page);
  expect(blocked).toMatchObject({ mapId: "ch5-world", x: 18, y: 12 });

  /* 城の門番 (13,2) も 波のかぎ が ないと 門が とざされていると言う (1ページ目で判定) */
  await teleport(page, 13, 3, "up");
  await page.keyboard.press("z");
  await expect(messageText(page)).toContainText(/門は かたく/, { timeout: 10_000 });
  /* 門番は「とびらを ひらく さんすうを いま まなぶ?」と きく (めあて — さきどり設計)。
     ここでは まなばずに 先へ: いいえ → 「いつでも ★ めあて から…」を送る */
  for (let i = 0; i < 12 && (await options(page).count()) === 0; i++) {
    await page.keyboard.press("z");
    await page.waitForTimeout(400);
  }
  await expect(page.getByText("とびらを ひらく さんすうを いま まなぶ?")).toBeVisible();
  await options(page).last().click();
  await advanceDialog(page);

  /* 空中庭園: 入口 (21,4) を踏んで入る → 宝箱 (2,8) → 奥 (6,0) → おくにわ */
  await teleport(page, 20, 4, "right");
  await stepOnce(page, "ArrowRight");
  await onMap(page, "ch5-sky-1");
  await page.waitForTimeout(800);
  await openChest(page, 2, 8, "c5.skyChest");
  expect((await getSave(page)).inventory.items.seiNoShizuku ?? 0).toBeGreaterThanOrEqual(3);
  await passDoor(page, "ch5-sky-top");

  /* おくにわ: (6,4) を踏んで くもの ばんじん戦 → 星のかぎ */
  await fightBossAt(page, 6, 4, 200);
  await flag(page, "c5.skyKey");

  /* 星のかぎ で 海の番人が消え、さっき止められた (18,12) から 番人の いた (19,12) を
     通って 海底神殿入口 (20,12) へ歩ける (高負荷時に 1押しで 2歩進むことがあるので
     歩数固定にせず、入口に着くまで歩く) */
  await warp(page, "ch5-world", "from-percen");
  await teleport(page, 18, 12, "right");
  await walkUntil(
    page,
    "ArrowRight",
    async () => (await fieldPos(page)).mapId === "ch5-sea-1",
    3,
  );
  await onMap(page, "ch5-sea-1");
  await page.waitForTimeout(800);

  /* 海底神殿: 貝がらの扉 (割合クイズ) → さいしんぶ → (6,3) で しんかいの ぬし → 波のかぎ */
  await passQuizDoor(page, "ch5-sea-2");
  await fightBossAt(page, 6, 3, 200);
  await flag(page, "c5.seaKey");

  /*
   * LP-20: 城の門番 (castle-gate-guard) は 波のかぎ (順番ゲート、上で取得済み) に加え、
   * 章5の中核3単元 (小数のかけ算わり算・分数のひきざん・割合) が すべて「できる」でも
   * 消える AND 条件になった。割合 (g5_percent) は上のレッスンで実際に学んだので、
   * 残り2つを E2E ショートカットで can にする (これが無いと この先の門番の前で
   * 実際にブロックされ、次の歩行アサーションが失敗する)
   */
  await page.evaluate(() => {
    window.__KAZUQUEST_DEBUG__!.setMastery("g5_decimal_muldiv", "can");
    window.__KAZUQUEST_DEBUG__!.setMastery("g5_fraction_diff", "can");
  });

  /* マイナドス城: 門番 (13,2) が消えているので from-castle (13,2) から 門 (13,1) を踏む */
  await warp(page, "ch5-world", "from-castle");
  await teleport(page, 13, 2, "up");
  await stepOnce(page, "ArrowUp");
  await onMap(page, "ch5-castle-1");
  await page.waitForTimeout(800);

  /* 1かい: 宝箱 (2,5) → 通分の扉 → 2かい: 割合の扉 → 玉座の間 */
  await openChest(page, 2, 5, "c5.castleChest");
  expect((await getSave(page)).inventory.items.hikariNoKen ?? 0).toBeGreaterThan(0);
  await passQuizDoor(page, "ch5-castle-2");
  await passQuizDoor(page, "ch5-castle-throne");

  /* 玉座の間: 最後の1歩を歩いて 魔王マイナドス (6,3) 戦 */
  await fightBossAt(page, 6, 3, 300);
  await flag(page, "c5.orb5");
  await flag(page, "c5.bossDefeated");

  /* 女王へ報告 → 第5章クリア・第6章へ */
  await talkToQueen(page);
  await flag(page, "c5.clear");
  const save = await getSave(page);
  expect(save.chapter.current).toBe(6);
  expect(save.chapter.cleared).toContain(5);
  expect(save.party.length).toBe(4);

  /* 章末: ゼロのあな (12,2) の案内人が 下の世界への入口を教える (いいえ で残る) */
  await warp(page, "ch5-world", "from-castle");
  await teleport(page, 12, 3, "up");
  await page.keyboard.press("z");
  await expect(messageText(page)).toContainText(/ゼロのあな/, { timeout: 10_000 });
  await pressUntilOptions(page, 8);
  expect(await options(page).count()).toBe(2); /* ゼロのあなへ おりる? はい/いいえ */
  await options(page).last().click(); /* いいえ */
  await advanceDialog(page);
  expect((await fieldPos(page)).mapId).toBe("ch5-world");
});
