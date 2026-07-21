import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

/*
 * エンジンのスモークテスト (開発マップ使用)。
 * window.__KAZUQUEST_GAME__ / __KAZUQUEST_DEBUG__ フック経由で
 * シーン状態とセーブデータを検証する。
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
      getSave(): {
        flags: Record<string, number | boolean>;
        inventory: { gold: number; items: Record<string, number> };
        location: { mapId: string; x: number; y: number };
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
  return page.evaluate(() => {
    const save = window.__KAZUQUEST_DEBUG__!.getSave();
    return save.location;
  });
}

/* 1タップ=1歩 (120ms押下 < STEP_MS なので2歩目が出ない) */
async function stepOnce(page: Page, key: string) {
  await page.keyboard.down(key);
  await page.waitForTimeout(120);
  await page.keyboard.up(key);
  await page.waitForTimeout(230);
}

async function walkTo(page: Page, axis: "x" | "y", target: number) {
  for (let i = 0; i < 30; i++) {
    const pos = await fieldPos(page);
    if (pos[axis] === target) return;
    const key =
      axis === "x"
        ? pos[axis] < target
          ? "ArrowRight"
          : "ArrowLeft"
        : pos[axis] < target
          ? "ArrowDown"
          : "ArrowUp";
    await stepOnce(page, key);
  }
  throw new Error(`walkTo ${axis}=${target} に到達できない`);
}

/* 壁・NPC の方を向く (移動はブロックされ向きだけ変わる) */
async function face(page: Page, key: string) {
  await page.keyboard.down(key);
  await page.waitForTimeout(80);
  await page.keyboard.up(key);
  await page.waitForTimeout(200);
}

/* 目標座標に静止していることを保証する (在飛行の tween を待ってから検証・再歩行) */
async function ensureAt(page: Page, x: number, y: number) {
  for (let i = 0; i < 4; i++) {
    await page.waitForTimeout(450);
    const pos = await fieldPos(page);
    if (pos.x === x && pos.y === y) return;
    await walkTo(page, "x", x);
    await walkTo(page, "y", y);
  }
  throw new Error(`(${x},${y}) に静止できない`);
}

/* 条件が成立するまで同方向に歩き続ける (transfer 踏み込み用・取りこぼしリトライ) */
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

/* 開いているダイアログを最後まで送る (busy の間だけ z を送る — 再オープン防止) */
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

test("engine smoke: title → field → NPC dialog → treasure chest", async ({
  page,
}) => {
  await page.goto("/");
  await waitForScene(page, "Title");

  /* タイトルをタップして冒険開始 */
  await page.locator("canvas").click({ position: { x: 640, y: 360 } });
  await waitForScene(page, "Field");

  const start = await fieldPos(page);
  expect(start.mapId).toBe("dev-village");

  /* 王様 (12,6) の下 (12,7) まで歩く */
  await walkTo(page, "x", 12);
  await walkTo(page, "y", 7);
  await ensureAt(page, 12, 7);

  /* 上を向く (王様にぶつかる=移動失敗で向きだけ変わる) → はなす */
  await face(page, "ArrowUp");
  await interactAndAdvance(page);

  /* 王様イベントの結果: 50G + フラグ */
  await page.waitForFunction(
    () => window.__KAZUQUEST_DEBUG__!.getSave().flags["dev.metKing"] === true,
    undefined,
    { timeout: 10_000 },
  );
  const afterKing = await page.evaluate(() =>
    window.__KAZUQUEST_DEBUG__!.getSave(),
  );
  expect(afterKing.inventory.gold).toBe(50);

  /* 宝箱 (17,10) の左 (16,10) へ。(15,10) は木なので row 9 を迂回する */
  await walkTo(page, "y", 9);
  await walkTo(page, "x", 16);
  await walkTo(page, "y", 10);
  await ensureAt(page, 16, 10);
  await face(page, "ArrowRight");
  await interactAndAdvance(page);

  await page.waitForFunction(
    () => window.__KAZUQUEST_DEBUG__!.getSave().flags["dev.chest1"] === true,
    undefined,
    { timeout: 10_000 },
  );
  const afterChest = await page.evaluate(() =>
    window.__KAZUQUEST_DEBUG__!.getSave(),
  );
  expect(afterChest.inventory.items.yakusou).toBe(2);
});

test("map transfer: village → field and back", async ({ page }) => {
  await page.goto("/");
  await waitForScene(page, "Title");
  await page.locator("canvas").click({ position: { x: 640, y: 360 } });
  await waitForScene(page, "Field");

  /* 南出口 (7,12) へ */
  await walkTo(page, "x", 7);
  await walkTo(page, "y", 11);
  await walkUntil(page, "ArrowDown", () =>
    page.evaluate(
      () => window.__KAZUQUEST_DEBUG__!.getSave().location.mapId === "dev-field",
    ),
  );

  /* 北出口から村へ戻る */
  await page.waitForTimeout(600);
  const pos = await fieldPos(page);
  expect(pos.mapId).toBe("dev-field");
  await walkTo(page, "x", 7);
  await walkUntil(page, "ArrowUp", () =>
    page.evaluate(
      () =>
        window.__KAZUQUEST_DEBUG__!.getSave().location.mapId === "dev-village",
    ),
  );
});
