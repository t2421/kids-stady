import { expect, test } from "@playwright/test";
import {
  advanceLessonUntil,
  correctChoice,
  face,
  fieldPos,
  interactAndAdvance,
  startGame,
  stepOnce,
  teleport,
  walkLessonToPass,
  warp,
} from "./helpers";

/*
 * AU-04: 学びの全画面に差した効果音が「意図どおりの順序で鳴らそうとしたか」を
 * window.__KAZUQUEST_AUDIO__.recentSfx() で検証する (Playwright は無音なので
 * 実際に聞こえるかは docs/kazu-quest-release-checklist.md の手動項目に委ねる)。
 *
 * recentSfx() は直近32件しか保持しない。1レッスンの通しは軽く32件を超えるため、
 * 各フェーズの節目で clearSfx() してから次の部分列を確認する (§2.5 の想定どおり)。
 */

function names(entries: { name: string; at: number }[]): string[] {
  return entries.map((e) => e.name);
}

/* target が log の部分列 (順序どおり、間に他の要素があってもよい) になっているか */
function isSubsequence(log: string[], target: string[]): boolean {
  let i = 0;
  for (const name of log) {
    if (i < target.length && name === target[i]) i++;
  }
  return i === target.length;
}

async function recentSfxNames(page: Parameters<typeof startGame>[0]): Promise<string[]> {
  return names(await page.evaluate(() => window.__KAZUQUEST_AUDIO__?.recentSfx() ?? []));
}

async function clearSfx(page: Parameters<typeof startGame>[0]) {
  await page.evaluate(() => window.__KAZUQUEST_AUDIO__?.clearSfx());
}

test("lesson audio: g1_add_carry を開いて合格するまで、lessonOpen→pageTurn→correct→practiceLevelUp×2→testStart→testPass の順に鳴らそうとする", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await startGame(page);
  await clearSfx(page);

  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.openLesson("g1_add_carry"));
  const screen = page.locator('[data-testid="lesson-screen"]');
  await expect(screen).toBeVisible({ timeout: 10_000 });

  /* 開いた直後: lessonOpen だけが記録されている */
  expect(await recentSfxNames(page)).toEqual(["lessonOpen"]);
  await clearSfx(page);

  /* story → concept → れい → 穴埋め (2問) を経て れんしゅう画面が見えるまで進める。
   * pageTurn (story2 + concept2 + workedExample3 = 7) → correct (faded 2問) の順になるはず */
  await advanceLessonUntil(page, "lesson-practice");
  const afterFaded = await recentSfxNames(page);
  expect(isSubsequence(afterFaded, ["pageTurn", "pageTurn", "correct", "correct"])).toBe(true);
  expect(afterFaded.filter((n) => n === "pageTurn").length).toBe(7);
  expect(afterFaded.filter((n) => n === "correct").length).toBe(2);
  await clearSfx(page);

  /* れんしゅう Lv1〜3 (各3問連続正解) を経て テスト画面が見えるまで進める。
   * Lv1→2, Lv2→3 の2回だけ practiceLevelUp。Lv3→テストは testStart になる */
  await advanceLessonUntil(page, "lesson-test");
  const afterPractice = await recentSfxNames(page);
  expect(
    isSubsequence(afterPractice, [
      "correct",
      "practiceLevelUp",
      "correct",
      "practiceLevelUp",
      "correct",
      "testStart",
    ]),
  ).toBe(true);
  expect(afterPractice.filter((n) => n === "practiceLevelUp").length).toBe(2);
  expect(afterPractice.filter((n) => n === "correct").length).toBe(9);
  expect(afterPractice[afterPractice.length - 1]).toBe("testStart");
  await clearSfx(page);

  /* テスト (10問) を全問正解して合格する。最後は testPass */
  await walkLessonToPass(page);
  await expect(screen).toBeHidden({ timeout: 10_000 });
  const afterTest = await recentSfxNames(page);
  expect(isSubsequence(afterTest, ["correct", "testPass"])).toBe(true);
  expect(afterTest[afterTest.length - 1]).toBe("testPass");

  const mastery = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave().mastery);
  expect(mastery.g1_add_carry?.state).toBe("can");
});

test("review audio: おさらいを4回連続で合格させると mastered と shard を鳴らそうとする", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startGame(page);

  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.setMastery("g1_add_nc", "can"));

  const screen = page.locator('[data-testid="review-screen"]');

  for (let round = 0; round < 4; round++) {
    await page.evaluate(() =>
      window.__KAZUQUEST_DEBUG__!.advanceClock(8 * 24 * 60 * 60 * 1000),
    );
    await clearSfx(page);
    await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.openReview());
    await expect(screen).toBeVisible({ timeout: 10_000 });

    for (let i = 0; i < 5; i++) {
      const choice = correctChoice(page);
      await expect(choice).toBeVisible({ timeout: 10_000 });
      await choice.click();
      await page.waitForTimeout(1_100);
    }
    await expect(screen).toBeHidden({ timeout: 10_000 });
  }

  const mastery = await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave().mastery);
  expect(mastery.g1_add_nc?.state).toBe("mastered");

  /* 最後 (4回目) の合格ラウンドで mastered → shard の順に鳴らそうとしたはず
   * (clearSfx はラウンドの直前に呼んでいるので、この時点のログは4回目ぶんだけ) */
  const recent = await recentSfxNames(page);
  expect(isSubsequence(recent, ["mastered", "shard"])).toBe(true);
});

/*
 * gateOpen は MapView.refresh() (戦闘勝利後・イベント終了後に相乗り) で
 * 「いま表示中の番人が今回消えたか」を見て鳴る。番人の表示可否そのものは
 * シーン生成時 (transferTo → scene.restart → build()) にしか評価しないため、
 * mastery を変えてから warp し直しても (build() が最初から作らないだけで)
 * refresh() は一度も呼ばれず gateOpen は鳴らない。実際に鳴る場面を再現するため、
 * 番人がまだ居るシーンのまま3つ目を can にし、近くの NPC (sailor, 無害な
 * 定型セリフのみ) に話しかけてイベント終了 (finishRun→refresh) を起こす。
 */
test("gate audio: 章1 中核3単元のうち2つだけ can では gateOpen が鳴らず、3つ目も can にして番人が消える瞬間に鳴る", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await startGame(page);

  await page.evaluate(() => {
    window.__KAZUQUEST_DEBUG__!.setMastery("g1_count", "can");
    window.__KAZUQUEST_DEBUG__!.setMastery("g1_add_carry", "can");
  });

  await warp(page, "ch1-world", "from-cave");
  await teleport(page, 20, 12, "right");
  await face(page, "ArrowRight");

  await clearSfx(page);
  const before = await fieldPos(page);
  await stepOnce(page, "ArrowRight");
  const afterBlocked = await fieldPos(page);
  /* 番人がまだ表示中なのでブロックされる (LP-20 negative と同じ確認) */
  expect(afterBlocked.x).toBe(before.x);
  expect(afterBlocked.y).toBe(before.y);
  expect(await recentSfxNames(page)).not.toContain("gateOpen");

  /* 3つ目も can に。まだ同じシーンにいるので番人のスプライトは残ったまま */
  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.setMastery("g1_sub_borrow", "can"));
  await clearSfx(page);

  /* sailor (20,13) に話しかけて完結させ、finishRun→refresh を起こす */
  await teleport(page, 20, 14, "up");
  await interactAndAdvance(page);

  expect(await recentSfxNames(page)).toContain("gateOpen");

  /* 番人が消え、実際に通れるようになったことも確認する。位置の再テレポート直後は
     直前の会話 (interactAndAdvance) が残す入力/移動処理が1テンポ遅れて反映される
     ことがあるため (このテストの主眼は gateOpen が鳴ることで、正確な着地マスは
     e2e/learning.spec.ts の chapter gate テストが既に厳密に検証済み)、
     「ブロックされず前進できた」ことだけを確認する — 完全一致ではなく > で見る */
  await teleport(page, 20, 12, "right");
  await stepOnce(page, "ArrowRight");
  const afterOpen = await fieldPos(page);
  expect(afterOpen.x).toBeGreaterThan(before.x);
  expect(afterOpen.y).toBe(12);
});
