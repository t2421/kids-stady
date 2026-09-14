import { expect, test } from "@playwright/test";
import {
  advanceDialog,
  correctChoice,
  fieldPos,
  grindBattleUntilField,
  interactAndAdvance,
  startGame,
  stepOnce,
  takeSpellTestAllCorrect,
  teleport,
  walkUntil,
  warp,
} from "./helpers";

/*
 * エンジン+第1章のスモークテスト (本番静的ビルドで実行)。
 * window.__KAZUQUEST_GAME__ / __KAZUQUEST_DEBUG__ フック経由で
 * シーン状態とセーブデータを検証する。位置決めが目的の移動は
 * デバッグテレポート/ワープを使い、移動・遷移そのものを検証する
 * テストだけ実際にキー入力で歩く。
 * 章ごとのゴールデンパスは chapterN.spec.ts、操作ヘルパーは helpers.ts。
 */

test("dialog & treasure: mother's send-off and the forest chest", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startGame(page);
  const start = await fieldPos(page);
  expect(start.mapId).toBe("ch1-hajimari");

  /* 移動できることを実地で確認 (開始位置は家のとびら (5,5)、下は道) */
  let moved = start;
  for (let i = 0; i < 6 && moved.y === start.y; i++) {
    await stepOnce(page, "ArrowDown");
    moved = await fieldPos(page);
  }
  expect(moved.y).toBeGreaterThan(start.y);

  /* 母に話す → 物語開始フラグ (家の中へ) */
  await warp(page, "ch1-hajimari-home", "start");
  await teleport(page, 6, 3, "up");
  await interactAndAdvance(page);
  await page.waitForFunction(
    () => window.__KAZUQUEST_DEBUG__!.getSave().flags["c1.started"] === true,
  );

  /* X キーでステータスメニューが開いて閉じられる (高負荷に備えリトライ) */
  await page.waitForTimeout(400);
  let menuOpened = false;
  for (let attempt = 0; attempt < 3 && !menuOpened; attempt++) {
    await page.keyboard.press("x");
    try {
      await page.waitForFunction(
        () => !!window.__KAZUQUEST_GAME__?.scene.getScene("Ui")?.isBusy?.(),
        undefined,
        { timeout: 3_000 },
      );
      menuOpened = true;
    } catch {
      /* 開かなかった → リトライ */
    }
  }
  expect(menuOpened).toBe(true);
  await advanceDialog(page);

  /* 森の宝箱 (14,8) を左 (13,8) から開ける */
  await warp(page, "ch1-forest", "north");
  await teleport(page, 13, 8, "right");
  await interactAndAdvance(page);
  await page.waitForFunction(
    () => window.__KAZUQUEST_DEBUG__!.getSave().flags["c1.forestChest"] === true,
    undefined,
    { timeout: 10_000 },
  );
  const save = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());
  expect(save.inventory.items.yakusou).toBe(3);
});

test("random encounter: fight on the road and win with math attacks", async ({
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

  await grindBattleUntilField(page);
  const save = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());
  expect(save.party[0].exp).toBeGreaterThan(0);
  expect(save.party[0].hp).toBeGreaterThan(0);
  /* 通常攻撃の出題が記録されている */
  expect(save.totalCorrect).toBeGreaterThanOrEqual(1);
});

test("spell casting: learn ヒキダマ at the scholar, then cast it in battle", async ({
  page,
}) => {
  test.setTimeout(300_000);
  await startGame(page);

  /* ユーザー報告の再現経路: まなびやで習得 → 戦闘で使用 (賢者は (2,4)) */
  await warp(page, "ch1-capital-castle", "start");
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

  await warp(page, "ch1-world", "from-hajimari");
  await teleport(page, 8, 4, "right");

  let inBattle = false;
  for (let i = 0; i < 100 && !inBattle; i++) {
    await stepOnce(page, i % 2 === 0 ? "ArrowRight" : "ArrowLeft");
    inBattle = await page.evaluate(
      () => window.__KAZUQUEST_GAME__!.scene.isActive("Battle"),
    );
  }
  expect(inBattle).toBe(true);

  /* コマンド待ちまで待って じゅもん (index 1) を選ぶ */
  await page.waitForFunction(
    () => {
      const scene = window.__KAZUQUEST_GAME__!.scene.getScene("Battle") as unknown as {
        busy?: boolean;
        menuKind?: string;
      } | null;
      return !!scene && scene.busy === false && scene.menuKind === "root";
    },
    undefined,
    { timeout: 15_000 },
  );
  const battleState = () =>
    page.evaluate(() => {
      const scene = window.__KAZUQUEST_GAME__!.scene.getScene("Battle") as unknown as {
        menuKind?: string;
        menuIndex?: number;
      } | null;
      return scene ? { menuKind: scene.menuKind, menuIndex: scene.menuIndex } : null;
    });
  for (let i = 0; i < 8; i++) {
    const s = await battleState();
    if (s?.menuIndex === 1) break;
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(200);
  }
  expect((await battleState())?.menuIndex).toBe(1);
  await page.keyboard.press("z");
  await page.waitForFunction(
    () => {
      const scene = window.__KAZUQUEST_GAME__!.scene.getScene("Battle") as unknown as {
        menuKind?: string;
      } | null;
      return scene?.menuKind === "spell";
    },
    undefined,
    { timeout: 8_000 },
  );
  await page.keyboard.press("z");
  await correctChoice(page).waitFor({ state: "visible", timeout: 10_000 });
  await correctChoice(page).click();

  await page.waitForFunction(
    () => window.__KAZUQUEST_DEBUG__!.getSave().totalCorrect >= 1,
    undefined,
    { timeout: 10_000 },
  );
  await grindBattleUntilField(page);
});

test("drill quest: solve 10 problems at the おだい board and earn gold", async ({
  page,
}) => {
  test.setTimeout(240_000);
  await startGame(page);

  /* 王都まなびやの けいじばん (2,6) を右 (3,6) から調べる */
  await warp(page, "ch1-capital-castle", "start");
  const before = await page.evaluate(
    () => window.__KAZUQUEST_DEBUG__!.getSave().inventory.gold,
  );
  await teleport(page, 3, 6, "left");

  /* 説明メッセージを送ると おだいリストが開く。先頭の ★1 おだいを z で受注 */
  await page.keyboard.press("z");
  await page.waitForFunction(
    () => !!window.__KAZUQUEST_GAME__?.scene.getScene("Ui")?.isBusy?.(),
    undefined,
    { timeout: 5_000 },
  );
  await advanceDialog(page);

  /* 10問すべて正解する (ドリルは時間無制限・3択) */
  const btn = correctChoice(page);
  for (let i = 0; i < 10; i++) {
    await btn.waitFor({ state: "visible", timeout: 15_000 });
    await btn.click();
    await page.waitForTimeout(900);
  }

  /* 全問正解 = 10問 × 1G + パーフェクトボーナス 5G (★1 × 小1) */
  await page.waitForFunction(
    (prev) => window.__KAZUQUEST_DEBUG__!.getSave().inventory.gold > prev,
    before,
    { timeout: 15_000 },
  );
  await advanceDialog(page);
  const save = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());
  expect(save.inventory.gold - before).toBe(15);
  expect(save.totalCorrect).toBeGreaterThanOrEqual(10);
});

test("map transfer: walk from ハジマリ村 to ワールドマップ and back", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startGame(page);

  /* 東出口 (19,8) へ向かって実際に歩いてワールドマップへ遷移する */
  await teleport(page, 17, 8, "right");
  await walkUntil(page, "ArrowRight", () =>
    page.evaluate(
      () => window.__KAZUQUEST_DEBUG__!.getSave().location.mapId === "ch1-world",
    ),
  );
  await page.waitForTimeout(600);

  /* ワールドマップの村アイコンを踏んで村へ戻る */
  await walkUntil(page, "ArrowLeft", () =>
    page.evaluate(
      () =>
        window.__KAZUQUEST_DEBUG__!.getSave().location.mapId === "ch1-hajimari",
    ),
  );
});
