/*
 * 戦闘中の算数プロンプト要求 (通常攻撃・呪文で共通)。
 * EventBus の math-prompt / math-result を往復し、テレメトリ記録と
 * かいしん判定 (残り時間50%以上で正解) までを行う。
 */

import { EventBus } from "../EventBus";
import { autosave, getProfileId, updateSave } from "../session";
import { recordAnswer } from "../../lib/save";
import { recordLearning } from "../../lib/learning";
import type { MistakeEntry } from "../../lib/mistakes";
import { recordMistake } from "../../lib/mistakes";
import type { Problem } from "../../lib/curriculum/types";

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
  problem: { skillId: string; text: string; answer: string; explain: string[] };
  /* タップした選択肢 (時間切れは null) — MathPromptPanel.MathPromptResult */
  chosen: string | null;
}

/*
 * まちがいノート: 今の戦闘で間違えた問題。BattleScene.init が
 * beginBattleMistakes で空にし、勝利演出の後に takeBattleMistakes で
 * 取り出してオーバーレイに渡す (セーブにも recordMistake で永続化する)。
 */
let battleMistakes: readonly MistakeEntry[] = [];

export function beginBattleMistakes(): void {
  battleMistakes = [];
}

export function takeBattleMistakes(): MistakeEntry[] {
  const taken = [...battleMistakes];
  battleMistakes = [];
  return taken;
}

function trackMistake(result: MathPromptResultEvent): void {
  const entry: MistakeEntry = {
    ts: Date.now(),
    skillId: result.problem.skillId,
    text: result.problem.text,
    answer: result.problem.answer,
    chosen: result.chosen ?? "",
    explain: [...result.problem.explain],
  };
  battleMistakes = [entry, ...battleMistakes];
  updateSave((s) => recordMistake(s, entry));
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

    /* 不正解 (時間切れ含む) はまちがいノートへ。autosave は recordOutcome が行う */
    if (!result.correct) trackMistake(result);
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

/*
 * 組み立て済みの問題を 1 問だけ出す (お店のおつりチャレンジ / KQ-33)。
 * カリキュラムの単元ではないので、テレメトリ・まちがいノートには記録しない。
 */
export function requestCustomQuiz(
  problem: Problem,
  onOutcome: (correct: boolean) => void,
): void {
  const requestId = `custom-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const onResult = (result: MathPromptResultEvent) => {
    if (result.requestId !== requestId) return;
    EventBus.off("math-result", onResult);
    onOutcome(result.correct);
  };
  EventBus.on("math-result", onResult);
  EventBus.emit("math-prompt", {
    requestId,
    problem,
    timeLimitMs: null,
    context: "drill",
  });
}
