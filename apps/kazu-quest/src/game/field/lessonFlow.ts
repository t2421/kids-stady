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
import type { UiScene } from "../scenes/UiScene";

export interface LessonFinishedPayload {
  skillId: string;
  outcome: "passed" | "failed" | "aborted";
  correct: number;
  total: number;
}

const PREPARING_PAGES = ["じゅんびちゅう…"];

/* まなびやの先生 (openLesson): レッスンが実装済みなら開き、終わったら advance() */
export function handleOpenLesson(
  ui: UiScene,
  skillId: string,
  advance: () => void,
): void {
  if (!hasLesson(skillId)) {
    ui.showMessage(PREPARING_PAGES, advance);
    return;
  }

  const onFinished = (result: LessonFinishedPayload) => {
    if (result.skillId !== skillId) return;
    EventBus.off("lesson-finished", onFinished);
    advance();
  };
  EventBus.on("lesson-finished", onFinished);
  EventBus.emit("open-lesson", { skillId, entry: "story" });
}

/* ほこら/まなびやの「おさらい」。実体は LP-11 */
export function handleOpenReview(ui: UiScene, advance: () => void): void {
  ui.showMessage(PREPARING_PAGES, advance);
}

/* ほこらの「さきどり」。実体は LP-11 */
export function handleOpenPreview(ui: UiScene, advance: () => void): void {
  ui.showMessage(PREPARING_PAGES, advance);
}
