import { expect, test } from "@playwright/test";
import { startGame } from "./helpers";

/*
 * PreviewMenu.tsx (さきどり, LP-11 §4.3) の単体検証。まだマップ側に「さきどり」の
 * 導線が無いので (LP-18 の仕事)、__KAZUQUEST_DEBUG__.openPreview
 * (E2E 専用の暫定フック) で直接開く。g1_add_nc は前提なし・レッスン実装済み・
 * 新規セーブでは mastery が none なので、一覧に出るはず
 */

test("preview: 前提なしの g1_add_nc が一覧に出て、タップすると lesson-screen が開く", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await startGame(page);

  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.openPreview());

  const menu = page.locator('[data-testid="preview-menu"]');
  await expect(menu).toBeVisible({ timeout: 10_000 });

  const item = page.locator('[data-testid="preview-menu-item"][data-skill="g1_add_nc"]');
  await expect(item).toBeVisible({ timeout: 10_000 });
  await item.click();

  await expect(menu).toBeHidden({ timeout: 10_000 });
  const lessonScreen = page.locator('[data-testid="lesson-screen"]');
  await expect(lessonScreen).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('[data-testid="lesson-page-0"]')).toBeVisible();
});

test("preview: 学べる単元が無ければ案内メッセージが出て、とじる で閉じる", async ({
  page,
}) => {
  test.setTimeout(30_000);
  await startGame(page);

  /* g1_add_nc をすでに can にしておくと (none 以外) 一覧の唯一の候補が消える */
  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.setMastery("g1_add_nc", "can"));

  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.openPreview());

  const menu = page.locator('[data-testid="preview-menu"]');
  await expect(menu).toBeVisible({ timeout: 10_000 });
  await expect(
    page.getByText("いまは まなべる たんげんが ないよ。"),
  ).toBeVisible();

  await page.locator('[data-testid="preview-close"]').click();
  await expect(menu).toBeHidden({ timeout: 5_000 });
});
