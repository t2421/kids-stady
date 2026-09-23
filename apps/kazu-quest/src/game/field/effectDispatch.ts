/*
 * イベントランナーの effect のうち、UI (メッセージ・選択・レッスン・店・クイズ…)
 * だけで完結するものを 1か所で さばく。FieldScene.runCommands から呼ぶ。
 * シーン自体を動かす effect (transfer / savePoint / battle / ending) は FieldScene に残す
 * (マップ移動・戦闘起動・クリア処理は シーンの状態を さわるため)。
 *
 * 以前は この switch が FieldScene の中にあり、ファイルが 800行を こえていた。
 */

import type { RunnerEffect, RunnerInput } from "../../lib/events/runner";
import type { UiScene } from "../scenes/UiScene";
import { requestFieldQuiz } from "../battle/mathRequest";
import {
  handleDrillBoard,
  handleHealInn,
  handleReviewQuest,
  handleShop,
  handleSpellTest,
} from "./effectHandlers";
import {
  handleOpenGoals,
  handleOpenLesson,
  handleOpenPreview,
  handleOpenReview,
  handleOpenTeacherMenu,
} from "./lessonFlow";

/* さばけたら true。false なら 呼び出し側 (FieldScene) が さばく */
export function dispatchUiEffect(
  ui: UiScene,
  effect: RunnerEffect,
  advance: (input?: RunnerInput) => void,
): boolean {
  const next = () => advance();
  switch (effect.kind) {
    case "message":
      ui.showMessage(effect.pages, next);
      return true;
    case "choice":
      ui.showChoice(effect.prompt, (yes) => advance({ choice: yes ? "yes" : "no" }));
      return true;
    case "healInn":
      handleHealInn(ui, effect.price, next);
      return true;
    case "openSpellTest":
      handleSpellTest(ui, effect.spellId, next);
      return true;
    case "openDrillBoard":
      handleDrillBoard(ui, next);
      return true;
    case "openReviewQuest":
      handleReviewQuest(ui, next);
      return true;
    case "openLesson":
      /* entry/skipReadiness (LP-19): なかまが教える場面が使う (省略時は既定の story + readiness ゲート) */
      handleOpenLesson(ui, effect.skillId, next, {
        entry: effect.entry,
        skipReadiness: effect.skipReadiness,
      });
      return true;
    case "openReview":
      handleOpenReview(ui, next);
      return true;
    case "openPreview":
      handleOpenPreview(ui, next);
      return true;
    case "openGoals":
      handleOpenGoals(ui, next);
      return true;
    case "openTeacherMenu":
      handleOpenTeacherMenu(ui, effect.entries, next);
      return true;
    case "openShop":
      handleShop(ui, effect.shopId, next);
      return true;
    case "quiz":
      /* クイズ扉: React の問題パネルに出題し、正誤で分岐 (時間無制限) */
      requestFieldQuiz(effect.skillId, (correct) => advance({ quizCorrect: correct }));
      return true;
    default:
      return false;
  }
}
