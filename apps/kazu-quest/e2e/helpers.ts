import type { Page } from "@playwright/test";
import { STEP_MS } from "../src/game/field/timing";

/*
 * E2E 共通ヘルパー。window.__KAZUQUEST_GAME__ / __KAZUQUEST_DEBUG__ フック
 * (src/components/PhaserGame.tsx) 経由でシーン状態とセーブを操作・検証する。
 * 位置決めはテレポート/ワープ、移動そのものの検証だけ実際にキーで歩く。
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
      grantGold(amount: number): void;
      learnSpell(spellId: string): void;
      setFlag(flag: string, value?: number | boolean): void;
      /* 単元の習熟状態を直接書く (学びの設計 LP-04) */
      setMastery(skillId: string, state: "none" | "practicing" | "can" | "mastered"): void;
      /* TEMPORARY (LP-08 E2E 用): open-lesson を直接叩いて LessonScreen を開く */
      openLesson(skillId: string): void;
      /* TEMPORARY (LP-10 E2E 用): open-readiness を直接叩いて ReadinessScreen を開く */
      openReadiness(skillId: string, prerequisites: string[]): void;
      /* TEMPORARY (LP-11 E2E 用): open-review を直接叩いて ReviewScreen を開く
         (期日の来た単元は reviewSelection(getSave()) で選ばれる) */
      openReview(): void;
      /* TEMPORARY (LP-11 E2E 用): open-preview を直接叩いて PreviewMenu を開く */
      openPreview(): void;
      /* 間隔復習の期日到来を待たずに時計を進める (src/lib/clock.ts のオフセット) */
      advanceClock(ms: number): void;
      giveItem(itemId: string, count?: number): void;
      /* HP/MP を直接書く (fieldHeal.spec)。0〜最大値に丸められる */
      setHp(memberId: string, hp: number): void;
      setMp(memberId: string, mp: number): void;
      advanceToChapter(chapter: number): { mapId: string; spawn: string };
      /* 出題中の正解 (テンキー入力用。DOM には出ない — KQ-12) */
      currentAnswer(): string | null;
      getSave(): {
        chapter: { current: number; cleared: number[] };
        flags: Record<string, number | boolean>;
        inventory: { gold: number; items: Record<string, number> };
        location: { mapId: string; x: number; y: number };
        checkpoint: { mapId: string; spawn: string };
        party: {
          memberId: string;
          level: number;
          exp: number;
          hp: number;
          mp: number;
          learnedSpells: string[];
        }[];
        totalCorrect: number;
        totalWrong: number;
        skillStats: Record<string, { c: number; w: number }>;
        mistakes: { skillId: string; text: string; answer: string; chosen: string }[];
        mastery: Record<
          string,
          { state: string; reviewDue: number | null; streak: number; passedAt: number | null }
        >;
        settings: { sound: boolean; volume: 0 | 1 | 2 | 3 };
      };
    };
    /* AU-01: 音の診断フック (src/game/audio/sfx.ts が自己インストール)。
       recentSfx() は古い順→新しい順 (末尾が最新) */
    __KAZUQUEST_AUDIO__?: {
      contextState(): "running" | "suspended" | "closed" | null;
      enabled(): boolean;
      volume(): number;
      recentSfx(): { name: string; at: number }[];
      clearSfx(): void;
    };
  }
}

/* 指定シーン (Title / Field / Battle / Ui) がアクティブになるまで待つ */
export async function waitForScene(page: Page, key: string) {
  await page.waitForFunction(
    (k) => window.__KAZUQUEST_GAME__?.scene.isActive(k) === true,
    key,
    { timeout: 30_000 },
  );
}

/* セーブ上の現在位置 (mapId, x, y) を返す */
export function fieldPos(page: Page) {
  return page.evaluate(() => window.__KAZUQUEST_DEBUG__!.getSave().location);
}

/* 1タップ=1歩 (押下時間 < STEP_MS なので2歩目が出ない)。
   エンジン定数と連動させ、STEP_MS を変えてもここが壊れないようにする */
const STEP_HOLD_MS = Math.min(120, STEP_MS - 30);
/* 矢印キーを短く押して 1 マスだけ歩く */
export async function stepOnce(page: Page, key: string) {
  await page.keyboard.down(key);
  await page.waitForTimeout(STEP_HOLD_MS);
  await page.keyboard.up(key);
  await page.waitForTimeout(STEP_MS + 80);
}

/* 壁・NPC の方を向く (移動はブロックされ向きだけ変わる) */
export async function face(page: Page, key: string) {
  await page.keyboard.down(key);
  await page.waitForTimeout(80);
  await page.keyboard.up(key);
  await page.waitForTimeout(200);
}

/* デバッグテレポートで位置と向きを確定させる */
export async function teleport(page: Page, x: number, y: number, facing: string) {
  await page.waitForTimeout(300);
  await page.evaluate(
    ({ x, y, facing }) => window.__KAZUQUEST_DEBUG__!.teleport(x, y, facing),
    { x, y, facing },
  );
  await page.waitForTimeout(200);
}

/* 別マップへワープして着地を検証する (シーン再起動との競合に備えリトライ) */
export async function warp(page: Page, mapId: string, spawn: string) {
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

/*
 * タイトルメニュー (KQ-22) からフィールドへ。セーブがあれば「つづきから」、
 * なければ「はじめから」(新規プロフィールは確認なしで即開始)。
 * touch.spec はキー/クリック API を使わないので、操作を tap にも切り替えられる
 */
export async function startFromTitleMenu(page: Page, press: "click" | "tap" = "click") {
  await waitForScene(page, "Title");
  await page
    .locator('[data-testid="title-menu"]')
    .waitFor({ state: "visible", timeout: 15_000 });
  const cont = page.locator('[data-testid="title-continue"]');
  const target = (await cont.isVisible())
    ? cont
    : page.locator('[data-testid="title-newgame"]');
  if (press === "tap") await target.tap();
  else await target.click();
  await waitForScene(page, "Field");
  await page.waitForTimeout(500);
}

/* プロフィール作成 → タイトルメニュー → フィールド (ハジマリ村) */
export async function startGame(page: Page) {
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
  await startFromTitleMenu(page);
}

/*
 * 新規ゲームを始めて第 chapter 章の開始地点に立った状態を一発で用意する。
 * 章 1..chapter-1 のクリアフラグ・仲間加入 (コンテンツの joinParty と同じレベル)・
 * chapter.current を __KAZUQUEST_DEBUG__.advanceToChapter で適用し、着地を検証する。
 */
export async function seedChapter(
  page: Page,
  chapter: number,
): Promise<{ mapId: string; spawn: string }> {
  await startGame(page);
  const target = await page.evaluate(
    (n) => window.__KAZUQUEST_DEBUG__!.advanceToChapter(n),
    chapter,
  );
  /* フック内のワープがシーン再起動と競合して落ちることがあるので warp で着地を保証する */
  await warp(page, target.mapId, target.spawn);
  await page.waitForFunction(
    (n) => window.__KAZUQUEST_DEBUG__!.getSave().chapter.current >= n,
    chapter,
    { timeout: 5_000 },
  );
  return target;
}

/* 条件が成立するまで同方向に歩き続ける (transfer 踏み込み用) */
export async function walkUntil(
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
export async function interactAndAdvance(page: Page) {
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
export async function advanceDialog(page: Page) {
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

/* 出題パネルの正解ボタン (data-answer="1") */
export const correctChoice = (page: Page) =>
  page.locator('[data-testid="math-choice"][data-answer="1"]');

/* テンキー (KQ-12: 小3以降のテスト・おだい・とっくん) の表示欄 */
export const keypadDisplay = (page: Page) =>
  page.locator('[data-testid="keypad-display"]');

/* いま答えられる状態か (3択なら正解ボタン、テンキーなら「0」キーが押せる) */
export async function isAnswerable(page: Page): Promise<boolean> {
  const btn = correctChoice(page);
  if ((await btn.isVisible()) && (await btn.isEnabled())) return true;
  const zero = page.locator('[data-testid="keypad-key"][data-key="0"]');
  return (await zero.isVisible()) && (await zero.isEnabled());
}

/*
 * 出題パネルに1問だけ正解する。3択なら正解ボタン、テンキーなら
 * __KAZUQUEST_DEBUG__.currentAnswer() の文字列を1文字ずつタップして「こたえる」。
 * 呼ぶ前に isAnswerable で答えられる状態を確認すること。
 */
export async function answerCorrectOnce(page: Page) {
  const btn = correctChoice(page);
  if (await btn.isVisible()) {
    await btn.click({ timeout: 2_000 }).catch(() => {});
    return;
  }
  const answer = await page.evaluate(
    () => window.__KAZUQUEST_DEBUG__!.currentAnswer(),
  );
  if (answer === null) throw new Error("出題中の問題がない");
  for (const ch of answer) {
    await page
      .locator(`[data-testid="keypad-key"][data-key="${ch}"]`)
      .click({ timeout: 2_000 });
  }
  await page.locator('[data-testid="keypad-submit"]').click({ timeout: 2_000 });
}

/* 出題パネル (3択 or テンキー) が答えられる状態になるまで待つ */
export async function waitForAnswerable(page: Page, timeoutMs = 15_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isAnswerable(page)) return;
    await page.waitForTimeout(200);
  }
  throw new Error("出題パネルが答えられる状態にならない");
}

/*
 * 戦闘を「たたかう + 問題に正解」で終わらせ、sceneKey がアクティブになるまで回す
 * (通常攻撃も出題される)。戦闘後に Field へ戻るのが普通だが、
 * ラスボス戦のように Ending へ進む場合は sceneKey を変える
 */
export async function grindBattleUntil(page: Page, sceneKey: string, maxSteps = 120) {
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
    const reached = await page.evaluate(
      (k) => window.__KAZUQUEST_GAME__!.scene.isActive(k),
      sceneKey,
    );
    if (reached) return;
  }
  throw new Error("戦闘が終わらない");
}

export async function grindBattleUntilField(page: Page, maxSteps = 120) {
  await grindBattleUntil(page, "Field", maxSteps);
}

/*
 * ダイアログを送り続けて、sceneKey がアクティブになるまで待つ
 * (会話の最後でシーンが切り替わるイベント用。ページ数に依存しない)
 */
export async function advanceDialogUntilScene(page: Page, sceneKey: string, maxPresses = 80) {
  for (let i = 0; i < maxPresses; i++) {
    await page.waitForTimeout(350);
    const reached = await page.evaluate(
      (k) => window.__KAZUQUEST_GAME__!.scene.isActive(k),
      sceneKey,
    );
    if (reached) return;
    await page.keyboard.press("z");
  }
  throw new Error(`${sceneKey} に切り替わらない`);
}

/* 習得テストの前に出る「とっくんしてから テストする?」(KQ-11) の見分け用テキスト */
export const PRACTICE_PROMPT_TEXT = "とっくんしてから";

/* とっくんの choice が出ていれば はい(0) / いいえ(1) をタップして true */
export async function answerPracticePrompt(page: Page, yes: boolean) {
  const prompt = page.getByText(PRACTICE_PROMPT_TEXT);
  if (!(await prompt.isVisible().catch(() => false))) return false;
  await page.locator('[data-testid="ui-option"]').nth(yes ? 0 : 1).click();
  await page.waitForTimeout(400);
  return true;
}

/*
 * 出題バナー (spell-test-banner / spell-practice-banner …) が消えるまで
 * 正解し続ける (3択 / テンキーの両対応 — answerCorrectOnce)。
 * 1問あたり最大 5 回のポーリング (正解フィードバック中は disabled)
 */
export async function answerAllCorrectUntilHidden(
  page: Page,
  bannerTestId: string,
  maxQuestions = 40,
) {
  const banner = page.locator(`[data-testid="${bannerTestId}"]`);
  for (let i = 0; i < maxQuestions * 5; i++) {
    if (!(await banner.isVisible())) return;
    if (await isAnswerable(page)) {
      await answerCorrectOnce(page);
      await page.waitForTimeout(900);
    } else {
      await page.waitForTimeout(300);
    }
  }
  throw new Error(`${bannerTestId} が終わらない`);
}

/*
 * 学者の前で z → 最初の choice = はい で習得テストを受け、
 * 「とっくんしてから テストする?」は いいえ で飛ばして、1問目が出るまで待つ。
 *
 * 学びの設計 (LP-09) 波4で全44単元にレッスンが実装されたため、対象単元に
 * レッスンがある呪文 (=いまや全ての呪文) は従来の「とっくん/テスト」ではなく
 * open-lesson (LessonScreen) にまるごと委譲されるようになった
 * (src/game/field/spellTestFlow.ts の delegateToLesson)。ここでは
 * lesson-screen が開いた場合も検知して返す — 呼び出し側 (walkLessonToPass /
 * takeSpellTestAllCorrect) がその後の分岐を担う。
 */
export async function startSpellTest(page: Page) {
  await page.keyboard.press("z");
  const lessonScreen = page.locator('[data-testid="lesson-screen"]');
  for (let i = 0; i < 30; i++) {
    if (await lessonScreen.isVisible()) return;
    if ((await correctChoice(page).isVisible()) || (await keypadDisplay(page).isVisible())) {
      return;
    }
    if (await answerPracticePrompt(page, false)) continue;
    await page.keyboard.press("z");
    await page.waitForTimeout(500);
  }
  throw new Error("しゅうとくテストが始まらない");
}

/*
 * 開いている lesson-screen を、指定の testid (例: "lesson-practice") が
 * 見えるまで「つぎへ」/正解で進めて止まる (まだ答えない)。その画面固有の
 * UI (テンキー/3択のキーサイズなど) を検証したいときに使う。
 */
export async function advanceLessonUntil(page: Page, testId: string, maxSteps = 40) {
  const target = page.locator(`[data-testid="${testId}"]`);
  const next = page.locator('[data-testid="lesson-next"]');
  for (let i = 0; i < maxSteps; i++) {
    if (await target.isVisible().catch(() => false)) return;
    if (await next.isVisible().catch(() => false)) {
      await next.click();
      continue;
    }
    if (await isAnswerable(page)) {
      await answerCorrectOnce(page);
      await page.waitForTimeout(1_100);
      continue;
    }
    await page.waitForTimeout(300);
  }
  throw new Error(`lesson が ${testId} まで進まない`);
}

/*
 * 開いている lesson-screen を、内容 (単元/ページ数) を問わず最後まで進める:
 * 「つぎへ」(story/concept/れい/べつのせつめい) はそのままクリックし、
 * 出題パネル (穴埋め/れんしゅう/テスト、3択・テンキー両対応) は
 * answerCorrectOnce で正解し続ける。常に正解するので不合格 (→べつのせつめい
 * ループ) には入らず、テスト合格で画面が閉じて終わる。
 */
export async function walkLessonToPass(page: Page, maxSteps = 60) {
  const screen = page.locator('[data-testid="lesson-screen"]');
  const next = page.locator('[data-testid="lesson-next"]');
  for (let i = 0; i < maxSteps; i++) {
    if (!(await screen.isVisible())) return;
    if (await next.isVisible().catch(() => false)) {
      await next.click();
      continue;
    }
    if (await isAnswerable(page)) {
      await answerCorrectOnce(page);
      await page.waitForTimeout(1_100); // AUTO_ADVANCE_MS (900) + 余裕
      continue;
    }
    await page.waitForTimeout(300);
  }
  throw new Error("レッスンが終わらない");
}

/*
 * まなびやテストを最初の choice = はい で受け、全問正解で通す。
 * 「とっくんしてから テストする?」は いいえ で飛ばす (とっくんは practice.spec で検証)。
 * 問題数はコンテンツ (spell.learnTest.questions) 依存なので固定せず、
 * 進捗バナー (spell-test-banner) が消えるまで正解を押し続ける。
 * 小3以降の呪文はテンキーで答える (KQ-12)。
 *
 * 対象単元にレッスンがあれば (いまや全単元) walkLessonToPass に委譲する —
 * どちらの経路でも最終的に呪文が習得される点は変わらないので、呼び出し側の
 * ゴールデンパステストはこの分岐を意識しなくてよい。
 */
export async function takeSpellTestAllCorrect(page: Page, maxQuestions = 40) {
  await startSpellTest(page);
  if (await page.locator('[data-testid="lesson-screen"]').isVisible()) {
    await walkLessonToPass(page);
    return;
  }
  await answerAllCorrectUntilHidden(page, "spell-test-banner", maxQuestions);
}

/*
 * 新・まなびやの先生メニュー (学びの設計 LP-18)。z で話しかけると挨拶 (複数ページ)
 * のあと teacher-menu (単元一覧) が開く — 旧来の はい/いいえ 入れ子と違って
 * 中間の choice が無いので、z を送り続けて teacher-menu が現れるのを待つだけでよい。
 * 指定 skillId の項目をタップし、lesson-screen が開くまで待つ (以降は
 * walkLessonToPass に委ねる — どの章のどの先生でも同じ形)。
 */
export async function openTeacherMenuAndPickUnit(page: Page, skillId: string) {
  await page.keyboard.press("z");
  const menu = page.locator('[data-testid="teacher-menu"]');
  for (let i = 0; i < 30; i++) {
    if (await menu.isVisible()) break;
    await page.keyboard.press("z");
    await page.waitForTimeout(500);
  }
  await menu.waitFor({ state: "visible", timeout: 15_000 });
  await page
    .locator(`[data-testid="teacher-menu-item"][data-skill="${skillId}"]`)
    .click();
  await page
    .locator('[data-testid="lesson-screen"]')
    .waitFor({ state: "visible", timeout: 15_000 });
}
