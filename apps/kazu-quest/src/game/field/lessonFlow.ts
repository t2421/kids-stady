/*
 * まなびやの「学びの設計」レッスンの流れ (LP-08〜09)。openLesson/openReview/openPreview
 * effect から FieldScene.runCommands が呼ぶ。実体の画面は React 側 LessonScreen.tsx
 * (EventBus 経由でのみやり取りする — spellTestFlow.ts と同じ構造)。
 *
 *   "open-lesson" {skillId, entry: "story"} → "lesson-finished" {skillId, outcome, correct, total}
 *
 * レッスンが未登録の単元 (LP-12〜17 がまだ埋めていない) は「じゅんびちゅう…」で
 * 済ませる。openReview/openPreview は LP-11 が実体を差し込むまで同じ扱い。
 *
 * LessonFinishedPayload は spellTestFlow.ts も使う (呪文の学習テスト対象単元に
 * レッスンがあるとき、とっくん/テストの代わりにレッスンへ丸ごと委譲する — LP-09 §4)。
 */

import { EventBus } from "../EventBus";
import { hasLesson } from "../../content/lessons/index";
import { readinessRequired } from "../../content/lessons/prereqs";
import { reviewSelection } from "../../lib/review";
import { getSave } from "../session";
import type { UiScene } from "../scenes/UiScene";

export interface LessonFinishedPayload {
  skillId: string;
  outcome: "passed" | "failed" | "aborted";
  correct: number;
  total: number;
}

/* readiness (前提チェック, LP-10) の結果。ReadinessScreen.tsx が返す */
export interface ReadinessFinishedPayload {
  skillId: string;
  ok: boolean;
  weakest: string | null;
}

const PREPARING_PAGES = ["じゅんびちゅう…"];

/*
 * まなびやの先生 (openLesson): レッスンが実装済みなら開き、終わったら advance()。
 * 前提単元 (readinessRequired) が「できる」未満で残っていれば、本編の前に
 * readiness (前提チェック, LP-10) を挟む。2/3 以上正解すれば本編へ、
 * 不足なら最初にまちがえた前提のレッスンへ回り道させ (登録が無ければ
 * ブロックせずそのまま本編へ進める — §3.4 の「学んでいない単元でも進める」方針)。
 */
export function handleOpenLesson(
  ui: UiScene,
  skillId: string,
  advance: () => void,
): void {
  if (!hasLesson(skillId)) {
    ui.showMessage(PREPARING_PAGES, advance);
    return;
  }

  const openLessonNow = () => {
    const onFinished = (result: LessonFinishedPayload) => {
      if (result.skillId !== skillId) return;
      EventBus.off("lesson-finished", onFinished);
      advance();
    };
    EventBus.on("lesson-finished", onFinished);
    EventBus.emit("open-lesson", { skillId, entry: "story" });
  };

  const unmetPrereqs = readinessRequired(getSave(), skillId);
  if (unmetPrereqs.length === 0) {
    openLessonNow();
    return;
  }

  const onReadinessFinished = (result: ReadinessFinishedPayload) => {
    if (result.skillId !== skillId) return;
    EventBus.off("readiness-finished", onReadinessFinished);
    if (result.ok) {
      openLessonNow();
      return;
    }
    if (result.weakest && hasLesson(result.weakest)) {
      handleOpenLesson(ui, result.weakest, () => handleOpenLesson(ui, skillId, advance));
      return;
    }
    /* 弱点の前提にレッスンがまだ無い (未登録単元) — 塞がずそのまま本編へ */
    openLessonNow();
  };
  EventBus.on("readiness-finished", onReadinessFinished);
  EventBus.emit("open-readiness", { skillId, prerequisites: unmetPrereqs });
}

/*
 * ほこら/まなびやの「おさらい」(LP-11 §3.6)。期日の来た単元 (最大3件) を
 * ReviewScreen.tsx へ渡し、"review-finished" が返ったら advance()。
 * 実体は React 側 (EventBus 経由でのみやり取りする — handleOpenLesson と同じ構造)
 */
export function handleOpenReview(ui: UiScene, advance: () => void): void {
  const onFinished = () => {
    EventBus.off("review-finished", onFinished);
    advance();
  };
  EventBus.on("review-finished", onFinished);
  EventBus.emit("open-review", { skillIds: reviewSelection(getSave()) });
}

/*
 * ほこらの「さきどり」(LP-11 §4.3)。前提を満たす未受講単元の一覧を
 * PreviewMenu.tsx へ委ね、"preview-closed" (項目タップで即 open-lesson を
 * 発火したあとも必ず出る) を待って advance()
 */
export function handleOpenPreview(ui: UiScene, advance: () => void): void {
  const onClosed = () => {
    EventBus.off("preview-closed", onClosed);
    advance();
  };
  EventBus.on("preview-closed", onClosed);
  EventBus.emit("open-preview");
}

/* まなびやの先生メニュー (openTeacherMenu, LP-18) の一覧項目 */
export interface TeacherMenuEntry {
  skillId: string;
  label: string;
  /* 旧・呪文の学習テスト対象単元だったときだけ付ける (TeacherMenu.tsx が習得させる) */
  spellIds?: string[];
}

/*
 * まなびやの先生 (openTeacherMenu): 単元一覧を TeacherMenu.tsx へ渡し、
 * "teacher-menu-closed" (項目タップで即 open-lesson を発火したあとも必ず出る)
 * を待って advance() する。handleOpenPreview と同じ「即 advance、レッスンの
 * 決着は非同期」の構造 — 呪文の習得 (spellId がある場合) は TeacherMenu.tsx が
 * タップした項目についてだけ lesson-finished を見て行う
 */
export function handleOpenTeacherMenu(
  ui: UiScene,
  entries: readonly TeacherMenuEntry[],
  advance: () => void,
): void {
  const onClosed = () => {
    EventBus.off("teacher-menu-closed", onClosed);
    advance();
  };
  EventBus.on("teacher-menu-closed", onClosed);
  EventBus.emit("open-teacher-menu", { entries });
}
