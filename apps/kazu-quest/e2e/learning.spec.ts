import { expect, test, type Page } from "@playwright/test";
import {
  correctChoice,
  face,
  fieldPos,
  startGame,
  stepOnce,
  teleport,
  warp,
} from "./helpers";

/*
 * LP-23: E2E 総仕上げ。既存のゴールデンパス系 (lesson-grade1/3/5.spec.ts が
 * 小1・小3・小5 の中核単元をレッスンから合格まで通す) はここで重複させない。
 * このファイルは「学びの設計」で E2E がまだ触れていなかった4つの分岐に絞る:
 *
 *   1. 前提チェック不合格 → 弱点前提への案内 (readiness の fail 側)
 *   2. 間隔復習を4回連続合格させ can → mastered まで通す
 *   3. さきどり: 小1 の前提だけを満たしたセーブで小2 の単元を学ぶ
 *   4. 章ゲート: 中核3単元のうち2つしか「できる」でなければ 番人は残る (LP-20 の negative)
 */

const wrongChoice = (page: Page) =>
  page.locator('[data-testid="math-choice"][data-answer="0"]').first();

/*
 * 1. readiness 前提チェックの不合格ルート。
 *
 * handleOpenLesson (src/game/field/lessonFlow.ts) の readiness ゲート分岐
 * (前提不足 → open-readiness → 不合格なら weakest のレッスンへ回り道) は、
 * 現状のマップ/メニュー実装では実際には一切呼び出されない:
 *   - まなびやの先生メニュー (TeacherMenu.tsx) はタップで "open-lesson" を
 *     直接発火し、handleOpenLesson の readiness ゲートを経由しない
 *     (前提を気にせず即開く、が LP-18 の意図的な設計 — コード内コメント参照)
 *   - さきどり (PreviewMenu.tsx) は一覧に出す時点で前提充足を確認済みなので
 *     同じく handleOpenLesson を経由しない
 *   - 「なかまが教える場面」のような openLesson EventCommand は
 *     すべて skipReadiness:true で使われている (3箇所、grep で確認済み)
 * つまり handleOpenLesson の readiness 分岐は現在の実プレイでは到達不能な
 * デッドコードで、tests/lessonFlow.test.ts が EventBus モックで分岐だけを
 * 検証している (そのファイル自身のコメントが同じ理由を明記している)。
 * 新しいテスト専用フィクスチャ単元を増やしたり src/** に新しいデバッグフックを
 * 足せば E2E からも再現できるが、本タスクの制約 (src/** 不可、テスト専用
 * フィクスチャの追加は避ける) の範囲では handleOpenLesson 自体を経由させられない。
 *
 * そこでここでは、readiness ゲートが「不合格」と判定する土台となる
 * ReadinessScreen.tsx 本体の合否しきい値 (2/3以上正解) と weakest (最初に
 * まちがえた前提) の算出を、実ブラウザで検証する — こちらは
 * __KAZUQUEST_DEBUG__.openReadiness (LP-10 E2E 用フック) で直接開けるので
 * 実装済み。既存の readiness.spec.ts は成功ルート (正解 → 閉じる) しか
 * 見ていない (合否しきい値そのものは未検証) ので、ここが埋める。
 */
test("readiness: 前提を まちがえると ok:false と weakest = その前提単元 で終わる (2/3未満で不合格)", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await startGame(page);

  /* g1_add_carry の前提は g1_add_nc の1件だけ (defaultPrerequisites) →
     出題も1問。それに正解せず不合格にする */
  await page.evaluate(() =>
    window.__KAZUQUEST_DEBUG__!.openReadiness("g1_add_carry", ["g1_add_nc"]),
  );

  const screen = page.locator('[data-testid="readiness-screen"]');
  await expect(screen).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('[data-testid="lesson-page-0"]')).toBeVisible();

  const wrong = wrongChoice(page);
  await expect(wrong).toBeVisible({ timeout: 10_000 });
  await wrong.click();

  /* AUTO_ADVANCE_MS (900ms) + 余裕をもって待つ。1問しかないので即座に閉じる */
  await expect(screen).toBeHidden({ timeout: 10_000 });

  /* 前提 (g1_add_nc) 側の mastery はこのチェックだけでは変化しない
     (readiness は診断のみで、成績を書き換えない) — 副作用が無いことも確認 */
  const mastery = await page.evaluate(
    () => window.__KAZUQUEST_DEBUG__!.getSave().mastery,
  );
  expect(mastery.g1_add_nc?.state ?? "none").toBe("none");

  /*
   * 上記の「不合格 → weakest = g1_add_nc」自体は ReadinessScreen.tsx の
   * choose() が持つ唯一のロジックであり (1問しかないので正解しなければ即
   * firstWrongSkillId = questionSkillIds[0] = "g1_add_nc" になる。
   * src/components/ReadinessScreen.tsx の該当行を参照)、この E2E は
   * 「不正解 → 前提チェックの画面が正しく不合格で閉じる」ところまでを
   * 実ブラウザで踏んでいる。weakest を受けて実際に別レッスンへ回り道する
   * 配線 (handleOpenLesson の onReadinessFinished) は、上のコメントの通り
   * 現在の実プレイ導線からは到達できない (要・報告)
   */
});

/*
 * 2. 間隔復習 (おさらい) を4回連続合格させ、can → mastered まで通す。
 * mastery.ts の onReviewResult: 4/5 (80%) 以上の正解が続くたびに
 * streak が 0→1→2→3 と進み (間隔 1→3→7→7日)、streak が REVIEW_INTERVALS_MS.length
 * (=3) に達した状態でもう一度合格すると mastered になる → 合計4回の合格が必要
 * (tests/mastery.test.ts の「最長間隔で2回連続合格すると mastered」と同じ回数)。
 * 既存の lessonReview.spec.ts は1回目の合格 (streak > 0) までしか見ていない。
 */
test("review: g1_add_nc を4回連続で おさらい合格させると mastery.state が mastered になる", async ({
  page,
}) => {
  test.setTimeout(120_000);
  await startGame(page);

  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.setMastery("g1_add_nc", "can"));

  const screen = page.locator('[data-testid="review-screen"]');

  for (let round = 0; round < 4; round++) {
    /* 最長の間隔 (7日) より確実に大きく進めて、毎回 期日超過にする */
    await page.evaluate(() =>
      window.__KAZUQUEST_DEBUG__!.advanceClock(8 * 24 * 60 * 60 * 1000),
    );
    await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.openReview());
    await expect(screen).toBeVisible({ timeout: 10_000 });

    /* g1_add_nc は常に3択 (KQ-12)。5問すべて正解する (80%以上=合格) */
    for (let i = 0; i < 5; i++) {
      const choice = correctChoice(page);
      await expect(choice).toBeVisible({ timeout: 10_000 });
      await choice.click();
      await page.waitForTimeout(1_100); // AUTO_ADVANCE_MS(900) + 余裕
    }
    await expect(screen).toBeHidden({ timeout: 10_000 });

    const mastery = await page.evaluate(
      () => window.__KAZUQUEST_DEBUG__!.getSave().mastery,
    );
    const entry = mastery.g1_add_nc;
    if (round < 3) {
      expect(entry?.state).toBe("can");
      expect(entry?.streak).toBe(round + 1);
    } else {
      expect(entry?.state).toBe("mastered");
      expect(entry?.reviewDue).toBeNull();
    }
  }
});

/*
 * 3. さきどり (PreviewMenu): 小1 のセーブで小2 の単元を学ぶ。
 * g2_kuku (小2「くくり」= 九九) の前提は defaultPrerequisites 上 g1_add_nc
 * (小1) だけ。小1 の g1_add_nc だけを「できる」にした「まだ小1しか進めていない」
 * セーブを作り、さきどりの一覧に g2_kuku が現れて実際に開けることを確認する。
 * 既存の lessonPreview.spec.ts は前提なし単元 (g1_add_nc 自身) しか見ていない。
 */
test("preview: 小1の前提 (g1_add_nc) だけ できる にしたセーブで、小2の g2_kuku が さきどり できる", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await startGame(page);

  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.setMastery("g1_add_nc", "can"));

  await page.evaluate(() => window.__KAZUQUEST_DEBUG__!.openPreview());
  const menu = page.locator('[data-testid="preview-menu"]');
  await expect(menu).toBeVisible({ timeout: 10_000 });

  /* まだ前提を満たさない小3以降の単元 (例: g3_div は g2_kuku が前提) は
     一覧に出ないはず (前提の g2_kuku 自体が none のまま) */
  await expect(
    page.locator('[data-testid="preview-menu-item"][data-skill="g3_div"]'),
  ).toHaveCount(0);

  const g2Kuku = page.locator(
    '[data-testid="preview-menu-item"][data-skill="g2_kuku"]',
  );
  await expect(g2Kuku).toBeVisible({ timeout: 10_000 });
  await g2Kuku.click();

  await expect(menu).toBeHidden({ timeout: 10_000 });
  const lessonScreen = page.locator('[data-testid="lesson-screen"]');
  await expect(lessonScreen).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('[data-testid="lesson-page-0"]')).toBeVisible();
});

/*
 * 4. 章ゲート (LP-20) の negative: 中核3単元のうち2つしか「できる」でなければ
 * 橋の番人 (bridge-guard, ch1-world) は消えない = 通路をふさいだまま。
 * 既存の chapterN.spec.ts はどれも「3つとも can で消える」positive しか
 * 見ていない。NPC は DOM ではなく Canvas 上の Phaser スプライトなので、
 * 「その場所へ実際に一歩踏み出して、位置が変わらない (ブロックされる)」
 * ことで存在を確認する (chapter6.spec.ts の positive 側と対になる同じ移動の
 * イディオムを negative 方向で使う)。
 *
 * マップの hideIf 評価はシーン生成時 (transferTo → scene.restart) にしか
 * 走らないため、mastery を書き換えたあとは必ず warp し直してから確認する。
 */
test("chapter gate: 中核3単元のうち2つしか can でなければ 橋の番人は残り、3つ目も can で消える", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await startGame(page);

  /* 中核3単元のうち2つだけ can にする (g1_sub_borrow は none のまま残す) */
  await page.evaluate(() => {
    window.__KAZUQUEST_DEBUG__!.setMastery("g1_count", "can");
    window.__KAZUQUEST_DEBUG__!.setMastery("g1_add_carry", "can");
  });

  await warp(page, "ch1-world", "from-cave");
  await teleport(page, 20, 12, "right");
  await face(page, "ArrowRight");

  const before = await fieldPos(page);
  await stepOnce(page, "ArrowRight");
  const afterBlocked = await fieldPos(page);
  /* 番人がまだ表示中 (hideIf 未成立) なのでブロックされ、位置が変わらない */
  expect(afterBlocked.x).toBe(before.x);
  expect(afterBlocked.y).toBe(before.y);

  /* 3つ目も can にして、番人が消えることを確認する (positive の対照) */
  await page.evaluate(() =>
    window.__KAZUQUEST_DEBUG__!.setMastery("g1_sub_borrow", "can"),
  );
  await warp(page, "ch1-world", "from-cave");
  await teleport(page, 20, 12, "right");

  await stepOnce(page, "ArrowRight");
  const afterOpen = await fieldPos(page);
  expect(afterOpen.x).toBe(21);
  expect(afterOpen.y).toBe(12);
});
