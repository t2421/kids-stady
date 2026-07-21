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
      teleport(x: number, y: number, facing: string): void;
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

/* デバッグテレポートで位置と向きを確定させる (歩行検証が目的でないテスト用) */
async function teleport(page: Page, x: number, y: number, facing: string) {
  await page.waitForTimeout(300);
  await page.evaluate(
    ({ x, y, facing }) => window.__KAZUQUEST_DEBUG__!.teleport(x, y, facing),
    { x, y, facing },
  );
  await page.waitForTimeout(200);
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

  /* 移動できることを実地で確認 (初回入力は落ちることがあるためリトライ) */
  let moved = start;
  for (let i = 0; i < 6 && moved.x === start.x; i++) {
    await stepOnce(page, "ArrowRight");
    moved = await fieldPos(page);
  }
  expect(moved.x).toBeGreaterThan(start.x);
  await teleport(page, 12, 7, "up");
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

  /* 宝箱 (17,10) の左へテレポートして開ける */
  await teleport(page, 16, 10, "right");
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

test("random encounter: fight in the bushes and win", async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto("/");
  await waitForScene(page, "Title");
  await page.locator("canvas").click({ position: { x: 640, y: 360 } });
  await waitForScene(page, "Field");

  /* 草原へ */
  await teleport(page, 7, 11, "down");
  await walkUntil(page, "ArrowDown", () =>
    page.evaluate(
      () => window.__KAZUQUEST_DEBUG__!.getSave().location.mapId === "dev-field",
    ),
  );
  await page.waitForTimeout(600);

  /* しげみ (x3〜5, y2) を行き来してエンカウントを起こす */
  await teleport(page, 4, 2, "left");
  let inBattle = false;
  for (let i = 0; i < 100 && !inBattle; i++) {
    await stepOnce(page, i % 2 === 0 ? "ArrowLeft" : "ArrowRight");
    inBattle = await page.evaluate(
      () => window.__KAZUQUEST_GAME__!.scene.isActive("Battle"),
    );
  }
  expect(inBattle).toBe(true);

  /* たたかう (メニュー先頭) を押し続けて勝つ */
  for (let i = 0; i < 90; i++) {
    await page.keyboard.press("z");
    await page.waitForTimeout(800);
    const backInField = await page.evaluate(
      () => window.__KAZUQUEST_GAME__!.scene.isActive("Field"),
    );
    if (backInField) break;
  }
  const save = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());
  expect(save.party[0].exp).toBeGreaterThan(0);
  expect(save.party[0].hp).toBeGreaterThan(0);
});

test("spell casting: learn from king, cast with math prompt, telemetry recorded", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.goto("/");
  await waitForScene(page, "Title");
  await page.locator("canvas").click({ position: { x: 640, y: 360 } });
  await waitForScene(page, "Field");

  /* 王様から呪文を授かる */
  await teleport(page, 12, 7, "up");
  await interactAndAdvance(page);
  await page.waitForFunction(
    () =>
      window.__KAZUQUEST_DEBUG__!.getSave().party[0].learnedSpells.includes(
        "hikidama",
      ),
    undefined,
    { timeout: 10_000 },
  );

  /* 草原でエンカウント */
  await teleport(page, 7, 11, "down");
  await walkUntil(page, "ArrowDown", () =>
    page.evaluate(
      () => window.__KAZUQUEST_DEBUG__!.getSave().location.mapId === "dev-field",
    ),
  );
  await page.waitForTimeout(600);
  await teleport(page, 4, 2, "left");
  let inBattle = false;
  for (let i = 0; i < 100 && !inBattle; i++) {
    await stepOnce(page, i % 2 === 0 ? "ArrowLeft" : "ArrowRight");
    inBattle = await page.evaluate(
      () => window.__KAZUQUEST_GAME__!.scene.isActive("Battle"),
    );
  }
  expect(inBattle).toBe(true);

  /* バトルシーンの内部状態をポーリングして確定的にメニュー操作する */
  const battleState = () =>
    page.evaluate(() => {
      const scene = window.__KAZUQUEST_GAME__!.scene.getScene("Battle") as unknown as {
        busy?: boolean;
        menuKind?: string;
        menuIndex?: number;
      } | null;
      return scene
        ? { busy: scene.busy, menuKind: scene.menuKind, menuIndex: scene.menuIndex }
        : null;
    });

  /* コマンド待ちになるまで待つ */
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

  /* カーソルを じゅもん (index 1) に合わせて確定 */
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
  const correctButton = page.locator(
    '[data-testid="math-choice"][data-answer="1"]',
  );
  await correctButton.waitFor({ state: "visible", timeout: 10_000 });
  await correctButton.click();

  /* テレメトリが記録される (recordAnswer) */
  await page.waitForFunction(
    () => {
      const save = window.__KAZUQUEST_DEBUG__!.getSave();
      return save.totalCorrect >= 1 && (save.skillStats.g1_sub_nc?.c ?? 0) >= 1;
    },
    undefined,
    { timeout: 10_000 },
  );

  /* 戦闘を離脱 (にげる or 勝つまで たたかう連打) して終了確認 */
  for (let i = 0; i < 90; i++) {
    await page.keyboard.press("z");
    await page.waitForTimeout(800);
    const backInField = await page.evaluate(
      () => window.__KAZUQUEST_GAME__!.scene.isActive("Field"),
    );
    if (backInField) break;
  }
  const save = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave());
  expect(save.totalCorrect).toBeGreaterThanOrEqual(1);
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
