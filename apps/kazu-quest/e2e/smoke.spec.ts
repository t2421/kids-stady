import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

/*
 * エンジン+第1章のスモークテスト (本番静的ビルドで実行)。
 * window.__KAZUQUEST_GAME__ / __KAZUQUEST_DEBUG__ フック経由で
 * シーン状態とセーブデータを検証する。位置決めが目的の移動は
 * デバッグテレポート/ワープを使い、移動・遷移そのものを検証する
 * テストだけ実際にキー入力で歩く。
 */

declare global {
  interface Window {
    __KAZUQUEST_GAME__?: {
      scene: {
        isActive(key: string): boolean;
        getScene(key: string): { isBusy?: () => boolean } | null;
      };
    };
    __KAZUQUEST_DEBUG__?: {
      teleport(x: number, y: number, facing: string): void;
      warp(mapId: string, spawn: string): void;
      grantLevel(level: number): void;
      learnSpell(spellId: string): void;
      getSave(): {
        flags: Record<string, number | boolean>;
        inventory: { gold: number; items: Record<string, number> };
        location: { mapId: string; x: number; y: number };
        party: {
          memberId: string;
          level: number;
          exp: number;
          hp: number;
          learnedSpells: string[];
        }[];
        totalCorrect: number;
        totalWrong: number;
        skillStats: Record<string, { c: number; w: number }>;
      };
    };
  }
}

async function waitForScene(page: Page, key: string) {
  await page.waitForFunction(
    (k) => window.__KAZUQUEST_GAME__?.scene.isActive(k) === true,
    key,
    { timeout: 30_000 },
  );
}

function fieldPos(page: Page) {
  return page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave().location);
}

/* 1タップ=1歩 (120ms押下 < STEP_MS なので2歩目が出ない) */
async function stepOnce(page: Page, key: string) {
  await page.keyboard.down(key);
  await page.waitForTimeout(120);
  await page.keyboard.up(key);
  await page.waitForTimeout(230);
}

/* 壁・NPC の方を向く (移動はブロックされ向きだけ変わる) */
async function face(page: Page, key: string) {
  await page.keyboard.down(key);
  await page.waitForTimeout(80);
  await page.keyboard.up(key);
  await page.waitForTimeout(200);
}

/* デバッグテレポートで位置と向きを確定させる */
async function teleport(page: Page, x: number, y: number, facing: string) {
  await page.waitForTimeout(300);
  await page.evaluate(
    ({ x, y, facing }) => window.__KAZUQUEST_DEBUG__!.teleport(x, y, facing),
    { x, y, facing },
  );
  await page.waitForTimeout(200);
}

/* 別マップへワープして着地を検証する (シーン再起動との競合に備えリトライ) */
async function warp(page: Page, mapId: string, spawn: string) {
  for (let attempt = 0; attempt < 4; attempt++) {
    await page.waitForTimeout(400);
    await page.evaluate(
      ({ mapId, spawn }) => window.__KAZUQUEST_DEBUG__!.warp(mapId, spawn),
      { mapId, spawn },
    );
    try {
      await page.waitForFunction(
        (id) => window.__KAZUQUEST_DEBUG__!.getSave().location.mapId === id,
        mapId,
        { timeout: 5_000 },
      );
    } catch {
      continue;
    }
    await page.waitForTimeout(700);
    const pos = await fieldPos(page);
    if (pos.mapId === mapId) return;
  }
  throw new Error(`warp ${mapId}/${spawn} に失敗`);
}

/* プロフィール作成 → タイトル → フィールド (ハジマリ村) */
async function startGame(page: Page) {
  await page.goto("/");
  /* 初回はプロフィールゲート (作成モード) が出る → そのまま はじめる */
  const startButton = page.locator('[data-testid="profile-start"]');
  try {
    await startButton.waitFor({ state: "visible", timeout: 20_000 });
  } catch {
    /* 高負荷時に初回描画が間に合わないことがある → リロードして再試行 */
    await page.reload();
    await startButton.waitFor({ state: "visible", timeout: 30_000 });
  }
  await startButton.click();
  await page
    .locator('[data-testid="profile-gate"]')
    .waitFor({ state: "hidden", timeout: 10_000 });
  await waitForScene(page, "Title");
  await page.locator("canvas").click({ position: { x: 640, y: 360 } });
  await waitForScene(page, "Field");
  await page.waitForTimeout(500);
}

/* 条件が成立するまで同方向に歩き続ける (transfer 踏み込み用) */
async function walkUntil(
  page: Page,
  key: string,
  predicate: () => boolean | Promise<boolean>,
  maxSteps = 6,
) {
  for (let i = 0; i < maxSteps; i++) {
    await stepOnce(page, key);
    await page.waitForTimeout(500);
    if (await predicate()) return;
  }
  throw new Error(`walkUntil ${key} が成立しない`);
}

/* z でダイアログを開く (開くまで最大3回リトライ) → 最後まで送る */
async function interactAndAdvance(page: Page) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.keyboard.press("z");
    try {
      await page.waitForFunction(
        () => !!window.__KAZUQUEST_GAME__?.scene.getScene("Ui")?.isBusy?.(),
        undefined,
        { timeout: 2_000 },
      );
      await advanceDialog(page);
      return;
    } catch {
      /* 開かなかった → リトライ */
    }
  }
  throw new Error("ダイアログが開かない");
}

/* 開いているダイアログを最後まで送る (busy の間だけ z を送る) */
async function advanceDialog(page: Page) {
  for (let i = 0; i < 25; i++) {
    await page.waitForTimeout(350);
    const busy = await page.evaluate(
      () => !!window.__KAZUQUEST_GAME__?.scene.getScene("Ui")?.isBusy?.(),
    );
    if (!busy) return;
    await page.keyboard.press("z");
  }
  throw new Error("ダイアログが閉じない");
}

const correctChoice = (page: Page) =>
  page.locator('[data-testid="math-choice"][data-answer="1"]');

/* 戦闘を「たたかう + 問題に正解」で終わらせる (通常攻撃も出題される) */
async function grindBattleUntilField(page: Page, maxSteps = 120) {
  const btn = correctChoice(page);
  for (let i = 0; i < maxSteps; i++) {
    /* フィードバック表示中は disabled になるので、押せるときだけ短命クリック */
    const clickable = (await btn.isVisible()) && (await btn.isEnabled());
    if (clickable) {
      await btn.click({ timeout: 2_000 }).catch(() => {});
      await page.waitForTimeout(700);
    } else {
      await page.keyboard.press("z");
      await page.waitForTimeout(700);
    }
    const backInField = await page.evaluate(
      () => window.__KAZUQUEST_GAME__!.scene.isActive("Field"),
    );
    if (backInField) return;
  }
  throw new Error("戦闘が終わらない");
}

/* まなびやテストを最初の choice = はい で受け、10問正解する */
async function takeSpellTestAllCorrect(page: Page) {
  const btn = correctChoice(page);
  await page.keyboard.press("z");
  for (let i = 0; i < 30; i++) {
    if (await btn.isVisible()) break;
    await page.keyboard.press("z");
    await page.waitForTimeout(500);
  }
  for (let i = 0; i < 10; i++) {
    await btn.waitFor({ state: "visible", timeout: 10_000 });
    await btn.click();
    await page.waitForTimeout(900);
  }
}

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

  /* X キーでステータスメニュー (3ページ) が開いて閉じられる */
  await page.waitForTimeout(400);
  await page.keyboard.press("x");
  await page.waitForFunction(
    () => !!window.__KAZUQUEST_GAME__?.scene.getScene("Ui")?.isBusy?.(),
    undefined,
    { timeout: 5_000 },
  );
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
  await warp(page, "ch1-kaido", "west");
  await teleport(page, 5, 7, "right");

  /* 街道 (エンカウント床) を行き来して戦闘を起こす */
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

  /* ユーザー報告の再現経路: まなびやで習得 → 戦闘で使用 */
  await warp(page, "ch1-capital-castle", "start");
  await teleport(page, 3, 3, "left");
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

  await warp(page, "ch1-kaido", "west");
  await teleport(page, 5, 7, "right");

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

  /* 王都: 謁見 (クエスト + 50G) */
  await warp(page, "ch1-capital-castle", "start");
  await teleport(page, 6, 2, "up");
  await interactAndAdvance(page);
  const afterKing = await page.evaluate(() =>
    window.__KAZUQUEST_DEBUG__!.getSave(),
  );
  expect(afterKing.flags["c1.metKing"]).toBe(true);
  expect(afterKing.inventory.gold).toBe(50);

  /* まなびや: ヒキダマ習得テスト */
  await teleport(page, 3, 3, "left");
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
  await teleport(page, 6, 2, "up");
  await interactAndAdvance(page);
  await page.waitForFunction(
    () => window.__KAZUQUEST_DEBUG__!.getSave().flags["c1.clear"] === true,
  );
});

test("map transfer: walk from ハジマリ村 to 街道 and back", async ({ page }) => {
  test.setTimeout(180_000);
  await startGame(page);

  /* 東出口 (19,8) へ向かって実際に歩いて遷移する */
  await teleport(page, 17, 8, "right");
  await walkUntil(page, "ArrowRight", () =>
    page.evaluate(
      () => window.__KAZUQUEST_DEBUG__!.getSave().location.mapId === "ch1-kaido",
    ),
  );
  await page.waitForTimeout(600);

  /* 西出口から村へ戻る */
  await walkUntil(page, "ArrowLeft", () =>
    page.evaluate(
      () =>
        window.__KAZUQUEST_DEBUG__!.getSave().location.mapId === "ch1-hajimari",
    ),
  );
});
