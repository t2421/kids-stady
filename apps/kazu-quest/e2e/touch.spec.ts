import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import { STEP_MS } from "../src/game/field/timing";
import {
  correctChoice,
  fieldPos,
  startFromTitleMenu,
  teleport,
  waitForScene,
  warp,
} from "./helpers";

/*
 * タッチ操作だけの通し E2E (KQ-06)。playwright.config.ts の "ipad" project
 * (iPad 横向き + hasTouch) でのみ動く。キー入力は一切使わず、
 * タイトル → タップ移動 → NPC タップで会話 → 会話送り → 戦闘 (たたかう→3択) →
 * メニューボタン → タブ切替 → とじる、を指だけで通す。
 * 位置決めだけは helpers の warp/teleport (デバッグフック) を使う。
 *
 * タップ移動: KQ-09 で Field は pointerdown の時点でタップしたタイル方向へ
 * 1 歩をキューするので、touchStart→touchEnd が同一フレームに収まる
 * Playwright の瞬間タップ (page.touchscreen.tap) でも 1 歩動く。
 * (KQ-09 以前は pointerHeld をフレームごとに読むだけだったため瞬間タップでは
 *  0/10 で動かず、CDP Input.dispatchTouchEvent で ~90ms の接触を再現していた。
 *  押し続け歩行は今も pointerHeld で継続する)
 */

/* 論理解像度 (src/game/main.ts GAME_WIDTH/HEIGHT)。Scale.FIT で canvas に収まる */
const GAME_W = 960;
const GAME_H = 540;
/* src/content/art/tiles.ts TILE_SIZE (ピクセルアート一式を node に読ませないため直書き) */
const TILE = 16;
/* 戦闘コマンド窓の配置 (BattleScene.create → new BattleMenu(GAME_W-420, GAME_H-148)、行間 26) */
const BATTLE_MENU = { x: GAME_W - 420, y: GAME_H - 148, rowHeight: 26 };
const TABS = ["つよさ", "そうび", "じゅもん", "もちもの"] as const;

/* ---------- 指の基本操作 ---------- */

/* 論理座標 (960x540) → ページ座標。canvas は Scale.FIT でアスペクト維持のまま拡縮される */
async function logicalToPage(page: Page, lx: number, ly: number) {
  const box = await page.locator("canvas").boundingBox();
  if (!box) throw new Error("canvas が見つからない");
  return {
    x: box.x + (lx * box.width) / GAME_W,
    y: box.y + (ly * box.height) / GAME_H,
  };
}

/* Field のタイル座標 → ページ座標 (カメラの worldView と zoom で変換) */
async function tileToPage(page: Page, tx: number, ty: number) {
  const logical = await page.evaluate(
    ({ tx, ty, tile }) => {
      const scene = window.__KAZUQUEST_GAME__!.scene.getScene("Field") as unknown as {
        cameras: {
          main: { worldView: { x: number; y: number }; zoom: number };
        };
      };
      const cam = scene.cameras.main;
      return {
        x: (tx * tile + tile / 2 - cam.worldView.x) * cam.zoom,
        y: (ty * tile + tile / 2 - cam.worldView.y) * cam.zoom,
      };
    },
    { tx, ty, tile: TILE },
  );
  return logicalToPage(page, logical.x, logical.y);
}

/* 隣接タイルを指で瞬間タップする (歩く / NPC に話しかける) */
async function tapTile(page: Page, tx: number, ty: number) {
  const p = await tileToPage(page, tx, ty);
  await page.touchscreen.tap(p.x, p.y);
}

/* 戦闘コマンド窓の index 行 (0=たたかう) をタップする。Phaser の Text は
   pointerdown 即時なので瞬間タップで足りる */
async function tapBattleCommand(page: Page, index: number) {
  const p = await logicalToPage(
    page,
    BATTLE_MENU.x + 40,
    BATTLE_MENU.y + index * BATTLE_MENU.rowHeight + BATTLE_MENU.rowHeight / 2,
  );
  await page.touchscreen.tap(p.x, p.y);
}

/* ---------- 状態の問い合わせ ---------- */

const isSceneActive = (page: Page, key: string) =>
  page.evaluate((k) => window.__KAZUQUEST_GAME__!.scene.isActive(k), key);

const isUiBusy = (page: Page) =>
  page.evaluate(
    () => !!window.__KAZUQUEST_GAME__?.scene.getScene("Ui")?.isBusy?.(),
  );

/* 戦闘がコマンド入力待ち (ルートメニュー表示中) か */
const battleAwaitsCommand = (page: Page) =>
  page.evaluate(() => {
    const scene = window.__KAZUQUEST_GAME__!.scene.getScene("Battle") as unknown as {
      busy?: boolean;
      menuKind?: string;
    } | null;
    return !!scene && scene.busy === false && scene.menuKind === "root";
  });

/* ---------- 画面ごとの操作 ---------- */

/* プロフィール作成 → タイトル → フィールド。すべてタップ */
async function startGameByTap(page: Page) {
  await page.goto("/");
  const startButton = page.locator('[data-testid="profile-start"]');
  try {
    await startButton.waitFor({ state: "visible", timeout: 20_000 });
  } catch {
    await page.reload();
    await startButton.waitFor({ state: "visible", timeout: 30_000 });
  }
  await startButton.tap();
  await page
    .locator('[data-testid="profile-gate"]')
    .waitFor({ state: "hidden", timeout: 10_000 });
  /* タイトルメニュー (KQ-22) の「はじめから」をタップ */
  await startFromTitleMenu(page, "tap");
}

/* メッセージ窓をタップして会話を最後まで送る (表示途中なら全文表示→次ページ) */
async function advanceDialogByTap(page: Page) {
  const backdrop = page.locator('[data-testid="ui-backdrop"]');
  const viewport = page.viewportSize()!;
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(350);
    if (!(await isUiBusy(page))) return;
    if (await backdrop.isVisible()) {
      /* 画面下部のメッセージ窓の位置 (GameUiOverlay windowStyle: bottom 20 / minHeight 140) */
      await backdrop.tap({
        position: { x: viewport.width / 2, y: viewport.height - 80 },
        timeout: 2_000,
      });
    }
  }
  throw new Error("ダイアログが閉じない");
}

/* エンカウント床を左右にタップ移動して戦闘を起こす */
async function walkUntilBattle(page: Page, maxSteps = 100) {
  for (let i = 0; i < maxSteps; i++) {
    const pos = await fieldPos(page);
    await tapTile(page, pos.x + (i % 2 === 0 ? 1 : -1), pos.y);
    await page.waitForTimeout(STEP_MS + 250);
    if (await isSceneActive(page, "Battle")) return;
  }
  throw new Error("戦闘が起きない");
}

/* たたかう → 正解をタップ、を Field に戻るまで繰り返す。
   戻り値: 出題パネルの選択ボタンの最小高さ (px) */
async function fightByTap(page: Page, maxSteps = 120): Promise<number> {
  const choice = correctChoice(page);
  const allChoices = page.locator('[data-testid="math-choice"]');
  let minChoiceHeight = Infinity;
  for (let i = 0; i < maxSteps; i++) {
    if (await isSceneActive(page, "Field")) return minChoiceHeight;
    const answerable = (await choice.isVisible()) && (await choice.isEnabled());
    if (answerable) {
      for (const box of await allChoices.evaluateAll((els) =>
        els.map((el) => el.getBoundingClientRect().height),
      )) {
        minChoiceHeight = Math.min(minChoiceHeight, box);
      }
      await choice.tap({ timeout: 2_000 }).catch(() => {});
      await page.waitForTimeout(700);
      continue;
    }
    if (await battleAwaitsCommand(page)) {
      await tapBattleCommand(page, 0);
      await page.waitForTimeout(400);
      continue;
    }
    await page.waitForTimeout(300);
  }
  throw new Error("戦闘が終わらない");
}

/* ---------- テスト ---------- */

test("lint: この spec はキー入力 API を一切使わない", () => {
  const src = fs.readFileSync(__filename, "utf8");
  expect(src).not.toMatch(/page\.keyboard/);
  /* helpers のキー操作ヘルパーも呼ばない (呼び出し形 "name(" で検査) */
  const keyHelpers = [
    "startGame",
    "stepOnce",
    "face",
    "walkUntil",
    "interactAndAdvance",
    "advanceDialog",
    "grindBattleUntilField",
    "takeSpellTestAllCorrect",
    "openTeacherMenuAndPickUnit",
  ];
  for (const name of keyHelpers) {
    expect(src.includes(`${name}(`), `${name}( を使っている`).toBe(false);
  }
});

test("touch only: title → move → talk → battle → menu", async ({ page }) => {
  test.setTimeout(300_000);

  /* (1) タイトル → フィールド */
  await startGameByTap(page);
  const start = await fieldPos(page);
  expect(start.mapId).toBe("ch1-hajimari");

  /* (2a) 隣接タイル (家のとびら (5,5) の下は道) をタップ → 1 歩だけ進む */
  await tapTile(page, start.x, start.y + 1);
  await page.waitForTimeout(STEP_MS + 300);
  const moved = await fieldPos(page);
  expect({ x: moved.x, y: moved.y }).toEqual({ x: start.x, y: start.y + 1 });

  /* (2b) 母 (ch1-hajimari-home の (6,2)) に背を向けて立ち、母のタイルをタップ → 会話 */
  await warp(page, "ch1-hajimari-home", "start");
  await teleport(page, 6, 3, "down");
  await tapTile(page, 6, 2);
  await expect(page.locator('[data-testid="ui-message-text"]')).toBeVisible({
    timeout: 5_000,
  });
  expect(await isUiBusy(page)).toBe(true);

  /* (3) メッセージ窓をタップして最後まで送る → 物語開始フラグ */
  await advanceDialogByTap(page);
  await page.waitForFunction(
    () => window.__KAZUQUEST_DEBUG__!.getSave().flags["c1.started"] === true,
    undefined,
    { timeout: 5_000 },
  );

  /* (4) ワールドマップの道をタップで行き来して戦闘 → たたかう → 3択タップで勝つ */
  await warp(page, "ch1-world", "from-hajimari");
  await teleport(page, 8, 4, "right");
  await walkUntilBattle(page);
  const minChoiceHeight = await fightByTap(page);
  expect(minChoiceHeight).toBeGreaterThanOrEqual(72);
  await waitForScene(page, "Field");
  const afterBattle = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());
  expect(afterBattle.party[0].exp).toBeGreaterThan(0);
  expect(afterBattle.totalCorrect).toBeGreaterThanOrEqual(1);
  /* レベルアップ等のメッセージが出ていれば送っておく */
  await advanceDialogByTap(page);

  /* (5) メニューボタン → タブ切替 (≥56px) → とじる */
  const menuButton = page.locator('[data-testid="menu-button"]');
  await expect(menuButton).toBeVisible({ timeout: 5_000 });
  expect((await menuButton.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(56);
  await menuButton.tap();
  const panel = page.locator('[data-testid="status-panel"]');
  await expect(panel).toBeVisible({ timeout: 5_000 });
  for (const label of TABS) {
    const tab = panel.getByRole("button", { name: label, exact: true });
    await tab.tap();
    await expect(tab).toContainText(label);
    expect((await tab.boundingBox())?.height ?? 0, `${label} タブの高さ`).toBeGreaterThanOrEqual(56);
  }
  /* もちもの タブでは戦利品/初期アイテムの一覧か「なにも もっていない」が出る */
  await panel.locator('[data-testid="status-close"]').tap();
  await expect(panel).toBeHidden({ timeout: 5_000 });
  await page.waitForFunction(
    () => !window.__KAZUQUEST_GAME__?.scene.getScene("Ui")?.isBusy?.(),
    undefined,
    { timeout: 5_000 },
  );
});
