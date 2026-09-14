/*
 * 出題ループ (useQuestionLoop) のセッション定義と、MathPromptPanel への
 * 依頼 (math-prompt) の組み立て。純関数 — Vitest 対象。
 * まなびやテスト (test) / おだい (drill) / とっくん (practice) はすべて
 * 時間無制限 (timeLimitMs: null — 設計 A4)。
 */

export type QuestionContext = "test" | "drill" | "practice";

export interface QuestionSession {
  /* requestId の照合キー ("{prefix}{key}-{index}") */
  key: string;
  questions: number;
  context: QuestionContext;
  /* どちらか一方: skillId 固定出題 / skillIds から苦手重み付け */
  skillId?: string;
  skillIds?: string[];
}

/* MathPromptRequest (components/MathPromptPanel) と同型。lib からは components を参照しない */
export interface QuestionRequest {
  requestId: string;
  skillId?: string;
  skillIds?: string[];
  timeLimitMs: null;
  context: QuestionContext;
}

export function questionRequestId(
  prefix: string,
  session: QuestionSession,
  index: number,
): string {
  return `${prefix}${session.key}-${index}`;
}

export function questionRequest(
  prefix: string,
  session: QuestionSession,
  index: number,
): QuestionRequest {
  return {
    requestId: questionRequestId(prefix, session, index),
    skillId: session.skillId,
    skillIds: session.skillIds,
    timeLimitMs: null,
    context: session.context,
  };
}
