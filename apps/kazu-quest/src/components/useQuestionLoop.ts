"use client";

import { useEffect, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";
import type { MathPromptResult } from "@/components/MathPromptPanel";
import { recordAnswer } from "@/lib/save";
import { updateSave, autosave } from "@/game/session";

/*
 * 「N問 出題して ○×を集める」共通ループ (まなびやテスト・おだいドリル)。
 * open イベントを受けたら MathPromptPanel に1問ずつ依頼し、全問終了で
 * onFinished を呼ぶ。全回答は recordAnswer で苦手分析に記録する。
 * 時間無制限 (timeLimitMs: null — 設計 A4)。
 */

export interface QuestionSession {
  /* requestId の照合キー ("{prefix}{key}-{index}") */
  key: string;
  questions: number;
  context: "test" | "drill";
  /* どちらか一方: skillId 固定出題 / skillIds から苦手重み付け */
  skillId?: string;
  skillIds?: string[];
}

export interface QuestionLoopState {
  session: QuestionSession;
  index: number;
  correct: number;
  marks: ("o" | "x")[];
}

export function useQuestionLoop<P>(
  openEvent: string,
  prefix: string,
  toSession: (payload: P) => QuestionSession | null,
  onFinished: (session: QuestionSession, correct: number, total: number) => void,
): QuestionLoopState | null {
  const [state, setState] = useState<QuestionLoopState | null>(null);
  const stateRef = useRef<QuestionLoopState | null>(null);
  stateRef.current = state;
  /* コールバックは ref 経由で最新を呼ぶ (effect の張り直しを避ける) */
  const toSessionRef = useRef(toSession);
  toSessionRef.current = toSession;
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  useEffect(() => {
    const ask = (s: QuestionLoopState) => {
      EventBus.emit("math-prompt", {
        requestId: `${prefix}${s.session.key}-${s.index}`,
        skillId: s.session.skillId,
        skillIds: s.session.skillIds,
        timeLimitMs: null,
        context: s.session.context,
      });
    };

    const onOpen = (payload: P) => {
      const session = toSessionRef.current(payload);
      if (!session) return;
      const s: QuestionLoopState = { session, index: 0, correct: 0, marks: [] };
      setState(s);
      /* パネル表示のテンポを整える */
      setTimeout(() => ask(s), 400);
    };

    const onResult = (result: MathPromptResult) => {
      const current = stateRef.current;
      if (!current) return;
      if (!result.requestId.startsWith(`${prefix}${current.session.key}-`)) return;

      updateSave((save) =>
        recordAnswer(save, result.problem.skillId, result.correct, result.elapsedMs),
      );
      autosave();

      const next: QuestionLoopState = {
        ...current,
        index: current.index + 1,
        correct: current.correct + (result.correct ? 1 : 0),
        marks: [...current.marks, result.correct ? "o" : "x"],
      };
      if (next.index >= next.session.questions) {
        setState(null);
        onFinishedRef.current(next.session, next.correct, next.session.questions);
        return;
      }
      setState(next);
      setTimeout(() => ask(next), 350);
    };

    EventBus.on(openEvent, onOpen);
    EventBus.on("math-result", onResult);
    return () => {
      EventBus.off(openEvent, onOpen);
      EventBus.off("math-result", onResult);
    };
  }, [openEvent, prefix]);

  return state;
}
