"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";
import type { Problem } from "@/lib/curriculum";
import { generate, pickSkill } from "@/lib/curriculum";
import { getSave } from "@/game/session";

/*
 * 算数プロンプト (戦闘の呪文詠唱・習得テスト共用)。
 * Phaser から EventBus "math-prompt" で依頼され、解答後に
 * "math-result" を返す (docs/kazu-quest-design-plan.md B4)。
 * ボタンは ≥72px (幼児の誤タップ対策)。
 */

export interface MathPromptRequest {
  requestId: string;
  /* skillId を直接指定するか、skillIds から苦手重み付けで選ぶ */
  skillId?: string;
  skillIds?: string[];
  timeLimitMs: number | null;
  context: "battle" | "test" | "drill";
}

export interface MathPromptResult {
  requestId: string;
  correct: boolean;
  timedOut: boolean;
  elapsedMs: number;
  problem: Problem;
}

const TIMER_TICK_MS = 100;

export function MathPromptPanel() {
  const [request, setRequest] = useState<MathPromptRequest | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const startedAt = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answeredRef = useRef(false);

  const finish = useCallback(
    (req: MathPromptRequest, prob: Problem, correct: boolean, timedOut: boolean) => {
      if (answeredRef.current) return;
      answeredRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      const elapsedMs = Math.round(performance.now() - startedAt.current);
      setFeedback(correct ? "correct" : "wrong");
      /* 正解/不正解の色フィードバックを見せてから閉じる */
      setTimeout(() => {
        setRequest(null);
        setProblem(null);
        setFeedback(null);
        const result: MathPromptResult = {
          requestId: req.requestId,
          correct,
          timedOut,
          elapsedMs,
          problem: prob,
        };
        EventBus.emit("math-result", result);
      }, correct ? 500 : 1600);
    },
    [],
  );

  useEffect(() => {
    const onPrompt = (req: MathPromptRequest) => {
      const skillId =
        req.skillId ??
        pickSkill(req.skillIds ?? [], getSave().skillStats);
      const prob = generate(skillId);
      answeredRef.current = false;
      setRequest(req);
      setProblem(prob);
      setFeedback(null);
      startedAt.current = performance.now();

      if (req.timeLimitMs) {
        setRemainingMs(req.timeLimitMs);
        timerRef.current = setInterval(() => {
          const left = req.timeLimitMs! - (performance.now() - startedAt.current);
          setRemainingMs(Math.max(0, left));
          if (left <= 0) {
            finish(req, prob, false, true);
          }
        }, TIMER_TICK_MS);
      } else {
        setRemainingMs(null);
      }
    };
    EventBus.on("math-prompt", onPrompt);
    return () => {
      EventBus.off("math-prompt", onPrompt);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [finish]);

  if (!request || !problem) return null;

  const ratio =
    request.timeLimitMs && remainingMs !== null
      ? remainingMs / request.timeLimitMs
      : null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(4, 10, 24, 0.72)",
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: "min(92vw, 560px)",
          borderRadius: 20,
          border: "3px solid var(--kids-panel-border)",
          background: "var(--kids-panel-bg)",
          padding: "22px 24px 26px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        }}
      >
        {ratio !== null && (
          <div
            style={{
              height: 12,
              borderRadius: 6,
              background: "rgba(255,255,255,0.15)",
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${ratio * 100}%`,
                borderRadius: 6,
                background:
                  ratio > 0.5 ? "var(--kids-good)" : ratio > 0.25 ? "var(--kids-accent)" : "var(--kids-bad)",
                transition: "width 100ms linear",
              }}
            />
          </div>
        )}
        <div
          style={{
            fontSize: problem.text.length > 14 ? 28 : 40,
            fontWeight: 700,
            textAlign: "center",
            whiteSpace: "pre-wrap",
            lineHeight: 1.4,
            marginBottom: 20,
            color: "#ffffff",
          }}
        >
          {problem.text}
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {problem.choices.map((choice) => {
            const isAnswer = choice === problem.answer;
            const highlight =
              feedback === null
                ? undefined
                : isAnswer
                  ? "3px solid var(--kids-good)"
                  : undefined;
            return (
              <button
                key={choice}
                data-testid="math-choice"
                data-answer={isAnswer ? "1" : "0"}
                onClick={() => finish(request, problem, isAnswer, false)}
                disabled={feedback !== null}
                style={{
                  minHeight: 72,
                  fontSize: 30,
                  fontWeight: 700,
                  fontFamily: "var(--kids-font)",
                  borderRadius: 16,
                  border: highlight ?? "3px solid rgba(255,255,255,0.25)",
                  background:
                    feedback !== null && isAnswer
                      ? "rgba(62, 196, 109, 0.35)"
                      : "rgba(255,255,255,0.08)",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                {choice}
              </button>
            );
          })}
        </div>
        {feedback === "wrong" && (
          <div
            style={{
              marginTop: 14,
              textAlign: "center",
              fontSize: 22,
              color: "var(--kids-bad)",
              fontWeight: 700,
            }}
          >
            こたえは 「{problem.answer}」 だったよ
          </div>
        )}
      </div>
    </div>
  );
}
