import { expect, test } from "@playwright/test";

/*
 * /gallery の「ず (視覚モデル)」セクションのスモーク (LP-05〜07)。
 * FigureSpec は 17 kind あり、LP-05〜07 が出そろった結果ギャラリーは
 * いくつかの kind (columnCalc の +/÷、fractionBar の単体/比較 など) を
 * 複数バリエーションで並べているため、要素の総数は 17 より多くなる。
 * ここでは「17 kind すべてが少なくとも1つ実サンプルを持ち、プレースホルダ
 * (じゅんびちゅう) が1つも残っていない」ことを検証する。
 * ゲーム本体 (Phaser) を起動しない静的ページなので startGame は使わない。
 */

const ALL_KINDS = [
  "tenFrame", "numberLine", "cherry", "columnCalc", "array", "kukuTable",
  "fractionBar", "placeValue", "areaGrid", "protractor", "clock",
  "percentBar", "tapeDiagram", "treeDiagram", "letterBox", "balance", "measureCup",
];

test("gallery: ず (figures) section covers all 17 FigureSpec kinds", async ({ page }) => {
  await page.goto("/gallery/");

  const figures = page.locator('[data-testid="lesson-figure"]');
  const count = await figures.count();
  expect(count).toBeGreaterThanOrEqual(17);

  const kinds = await figures.evaluateAll((els) =>
    els.map((el) => el.getAttribute("data-kind")),
  );
  const uniqueKinds = new Set(kinds);
  for (const kind of ALL_KINDS) {
    expect(uniqueKinds.has(kind), `${kind} should appear in the gallery`).toBe(true);
  }
});

test("gallery: every figure kind renders real content, not the placeholder", async ({ page }) => {
  await page.goto("/gallery/");

  for (const kind of ALL_KINDS) {
    const figure = page.locator(`[data-testid="lesson-figure"][data-kind="${kind}"]`).first();
    await expect(figure, `${kind} should be present`).toBeVisible();
    // 全 kind が実装ずみなので「じゅんびちゅう」のプレースホルダ文言は出ない
    await expect(figure).not.toContainText("じゅんびちゅう");
    if (kind === "cherry") {
      await expect(figure.locator('[data-testid="cherry-diagram"]')).toBeVisible();
    } else {
      await expect(figure.locator("svg").first()).toBeVisible();
    }
  }

  // プレースホルダが1件も残っていないこと、ページ全体が壊れていないことを確認する
  await expect(page.getByText("じゅんびちゅう")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "カズクエ スプライトギャラリー" })).toBeVisible();
});
