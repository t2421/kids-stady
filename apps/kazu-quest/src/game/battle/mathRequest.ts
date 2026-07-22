/*
 * 戦闘中の算数プロンプト要求 (通常攻撃・呪文で共通)。
 * EventBus の math-prompt / math-result を往復し、テレメトリ記録と
 * かいしん判定 (残り時間50%以上で正解) までを行う。
 */

import { EventBus } from "../EventBus";
import { autosave, updateSave } from "../session";
import { recordAnswer } from "../../lib/save";

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

    /* テレメトリ: 全解答箇所から recordAnswer (設計 A6) */
    updateSave((s) =>
      recordAnswer(s, result.problem.skillId, result.correct, result.elapsedMs),
    );
    autosave();

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
