/*
 * 戦闘中の算数プロンプト要求 (通常攻撃・呪文で共通)。
 * EventBus の math-prompt / math-result を往復し、テレメトリ記録と
 * かいしん判定 (残り時間50%以上で正解) までを行う。
 */

import { EventBus } from "../EventBus";
import { autosave, getProfileId, updateSave } from "../session";
import { recordAnswer } from "../../lib/save";
import { recordLearning } from "../../lib/learning";

/*
 * 解答1件をアプリ内テレメトリと共有学習ログの両方へ記録する。
 * 共有ログの skillId は "kq_" 接頭辞を付ける (docs/save-data.md §4 —
 * mathematics の g1_* 等と衝突させないためのアプリ接頭辞)。
 */
function recordOutcome(result: MathPromptResultEvent): void {
  updateSave((s) =>
    recordAnswer(s, result.problem.skillId, result.correct, result.elapsedMs),
  );
  autosave();
  const profileId = getProfileId();
  if (profileId) {
    recordLearning(
      profileId,
      "kazu-quest",
      "kq_" + result.problem.skillId,
      result.correct,
      result.elapsedMs,
    );
  }
}

export interface MathOutcome {
  correct: boolean;
  critical: boolean;
}

interface MathPromptResultEvent {
  requestId: string;
  correct: boolean;
  timedOut: boolean;
  elapsedMs: number;
  problem: { skillId: string };
}

export function requestBattleMath(
  kind: "attack" | "spell",
  skillIds: string[],
  timeLimitMs: number,
  onOutcome: (outcome: MathOutcome) => void,
): void {
  const requestId = `${kind}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

  const onResult = (result: MathPromptResultEvent) => {
    if (result.requestId !== requestId) return;
    EventBus.off("math-result", onResult);

    /* テレメトリ: 全解答箇所から記録 (設計 A6) */
    recordOutcome(result);

    onOutcome({
      correct: result.correct,
      critical: result.correct && result.elapsedMs <= timeLimitMs / 2,
    });
  };
  EventBus.on("math-result", onResult);
  EventBus.emit("math-prompt", {
    requestId,
    skillIds,
    timeLimitMs,
    context: "battle",
  });
}

/*
 * フィールドのクイズ扉 (九九の塔など)。時間無制限・単元指定。
 * テレメトリは戦闘と同様に記録する。
 */
export function requestFieldQuiz(
  skillId: string,
  onOutcome: (correct: boolean) => void,
): void {
  const requestId = `quiz-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const onResult = (result: MathPromptResultEvent) => {
    if (result.requestId !== requestId) return;
    EventBus.off("math-result", onResult);
    recordOutcome(result);
    onOutcome(result.correct);
  };
  EventBus.on("math-result", onResult);
  EventBus.emit("math-prompt", {
    requestId,
    skillId,
    timeLimitMs: null,
    context: "drill",
  });
}
