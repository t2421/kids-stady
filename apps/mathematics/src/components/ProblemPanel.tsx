"use client";

import { useEffect, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";
import type { Problem } from "@/lib/curriculum/types";
import { CherryDiagram } from "./CherryDiagram";
import "./problem-panel.css";

export interface ProblemOpenPayload {
  problem: Problem;
  timeLimitMs: number | null;
  allowHint: boolean;
}

type PanelView = "hidden" | "question" | "correct" | "explanation" | "timeout";

const CORRECT_MESSAGE_MS = 700;
const TIMEOUT_MESSAGE_MS = 2_000;

function hasEmoji(text: string): boolean {
  return /\p{Extended_Pictographic}/u.test(text);
}

export function ProblemPanel() {
  const [payload, setPayload] = useState<ProblemOpenPayload | null>(null);
  const [view, setView] = useState<PanelView>("hidden");
  const [hintOpen, setHintOpen] = useState(false);
  const [session, setSession] = useState(0);
  const [barRatio, setBarRatio] = useState(1);
  const [barTransitionMs, setBarTransitionMs] = useState(0);

  const openedAtRef = useRef(0);
  const answerElapsedRef = useRef(0);
  const remainingMsRef = useRef(0);
  const countdownStartedAtRef = useRef(0);
  const answerLockedRef = useRef(false);
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFramesRef = useRef<number[]>([]);
  const sessionRef = useRef(0);

  function clearCountdown() {
    if (countdownTimerRef.current !== null) {
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    animationFramesRef.current.forEach(cancelAnimationFrame);
    animationFramesRef.current = [];
  }

  function clearMessageTimer() {
    if (messageTimerRef.current !== null) {
      clearTimeout(messageTimerRef.current);
      messageTimerRef.current = null;
    }
  }

  function emitDone(result: {
    correct: boolean;
    timedOut: boolean;
    elapsedMs: number;
  }) {
    clearCountdown();
    clearMessageTimer();
    setView("hidden");
    setHintOpen(false);
    EventBus.emit("problem-done", result);
  }

  useEffect(() => {
    const openProblem = (nextPayload: ProblemOpenPayload) => {
      clearCountdown();
      clearMessageTimer();
      sessionRef.current += 1;
      openedAtRef.current = performance.now();
      answerElapsedRef.current = 0;
      remainingMsRef.current = nextPayload.timeLimitMs ?? 0;
      answerLockedRef.current = false;
      setPayload(nextPayload);
      setHintOpen(false);
      setBarTransitionMs(0);
      setBarRatio(1);
      setView("question");
      setSession(sessionRef.current);
    };

    EventBus.on("problem-open", openProblem);
    return () => {
      EventBus.off("problem-open", openProblem);
      clearCountdown();
      clearMessageTimer();
    };
  }, []);

  useEffect(() => {
    if (
      view !== "question" ||
      hintOpen ||
      payload?.timeLimitMs === null ||
      payload === null
    ) {
      return;
    }

    const duration = Math.max(0, remainingMsRef.current);
    const total = payload.timeLimitMs;
    const activeSession = sessionRef.current;

    if (duration === 0) {
      answerLockedRef.current = true;
      setView("timeout");
      messageTimerRef.current = setTimeout(() => {
        if (sessionRef.current !== activeSession) return;
        emitDone({ correct: false, timedOut: true, elapsedMs: total });
      }, TIMEOUT_MESSAGE_MS);
      return;
    }

    countdownStartedAtRef.current = performance.now();
    setBarTransitionMs(0);
    setBarRatio(duration / total);

    const firstFrame = requestAnimationFrame(() => {
      const secondFrame = requestAnimationFrame(() => {
        setBarTransitionMs(duration);
        setBarRatio(0);
      });
      animationFramesRef.current.push(secondFrame);
    });
    animationFramesRef.current.push(firstFrame);

    countdownTimerRef.current = setTimeout(() => {
      if (sessionRef.current !== activeSession || answerLockedRef.current) return;
      answerLockedRef.current = true;
      remainingMsRef.current = 0;
      setBarTransitionMs(0);
      setBarRatio(0);
      setView("timeout");
      messageTimerRef.current = setTimeout(() => {
        if (sessionRef.current !== activeSession) return;
        emitDone({ correct: false, timedOut: true, elapsedMs: total });
      }, TIMEOUT_MESSAGE_MS);
    }, duration);

    return clearCountdown;
  }, [hintOpen, payload, session, view]);

  function openHint() {
    if (!payload || payload.timeLimitMs === null) {
      setHintOpen(true);
      return;
    }

    const elapsed = performance.now() - countdownStartedAtRef.current;
    remainingMsRef.current = Math.max(0, remainingMsRef.current - elapsed);
    clearCountdown();
    setBarTransitionMs(0);
    setBarRatio(remainingMsRef.current / payload.timeLimitMs);
    setHintOpen(true);
  }

  function chooseAnswer(choice: string) {
    if (!payload || answerLockedRef.current || view !== "question") return;
    answerLockedRef.current = true;
    clearCountdown();
    answerElapsedRef.current = Math.max(0, performance.now() - openedAtRef.current);

    if (choice === payload.problem.answer) {
      const activeSession = sessionRef.current;
      setView("correct");
      messageTimerRef.current = setTimeout(() => {
        if (sessionRef.current !== activeSession) return;
        emitDone({
          correct: true,
          timedOut: false,
          elapsedMs: answerElapsedRef.current,
        });
      }, CORRECT_MESSAGE_MS);
      return;
    }

    setView("explanation");
  }

  if (view === "hidden" || payload === null) return null;

  const { problem, timeLimitMs, allowHint } = payload;
  const canShowHint = allowHint && problem.hint !== null;
  const problemLines = problem.text.split("\n");

  return (
    <div className="pp-overlay">
      <section
        className={`pp-panel pp-panel-${view}`}
        role="dialog"
        aria-modal="true"
        aria-label="算数の問題"
      >
        {timeLimitMs !== null && (
          <div
            className="pp-timer"
            role="progressbar"
            aria-label="のこり時間"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(barRatio * 100)}
          >
            <div
              className="pp-timer-fill"
              style={{
                transform: `scaleX(${barRatio})`,
                transitionDuration: `${barTransitionMs}ms`,
              }}
            />
          </div>
        )}

        {view === "correct" && (
          <div className="pp-result pp-result-correct" role="status">
            せいかい! 🎉
          </div>
        )}

        {view === "timeout" && (
          <div className="pp-result pp-result-timeout" role="status">
            <span>じかんぎれ!</span>
            <small>こたえは {problem.answer} だったよ</small>
          </div>
        )}

        {view === "question" && hintOpen && problem.hint && (
          <div className="pp-hint-view">
            {problem.hint.type === "cherry" ? (
              <>
                <h2 className="pp-heading">🍒 さくらんぼヒント</h2>
                <CherryDiagram
                  top={problem.b ?? problem.hint.split.first + problem.hint.split.second}
                  split={problem.hint.split}
                  interactive
                />
              </>
            ) : (
              <>
                <h2 className="pp-heading">💡 かんがえかた</h2>
                <ol className="pp-steps pp-hint-steps">
                  {problem.hint.lines.map((line, index) => (
                    <li key={`${line}-${index}`}>{line}</li>
                  ))}
                </ol>
              </>
            )}
            <button
              type="button"
              className="pp-secondary-button"
              onClick={() => setHintOpen(false)}
            >
              もんだいに もどる
            </button>
          </div>
        )}

        {view === "question" && !hintOpen && (
          <>
            <div className="pp-problem" aria-label={problem.text}>
              {problemLines.map((line, index) => (
                <div
                  key={`${line}-${index}`}
                  className={hasEmoji(line) ? "pp-problem-emoji" : "pp-problem-line"}
                >
                  {line || "\u00a0"}
                </div>
              ))}
            </div>

            <div className="pp-choices">
              {problem.choices.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  className="pp-choice"
                  disabled={answerLockedRef.current}
                  onClick={() => chooseAnswer(choice)}
                >
                  {choice}
                </button>
              ))}
            </div>

            {canShowHint && (
              <button type="button" className="pp-hint-button" onClick={openHint}>
                {problem.hint?.type === "cherry" ? "🍒 さくらんぼヒント" : "💡 ヒント"}
              </button>
            )}
          </>
        )}

        {view === "explanation" && (
          <div className="pp-explanation">
            <h2 className="pp-heading">💡 かいせつ</h2>
            <p className="pp-answer">
              こたえは <strong>{problem.answer}</strong>
            </p>

            {problem.hint?.type === "cherry" && (
              <CherryDiagram
                top={problem.b ?? problem.hint.split.first + problem.hint.split.second}
                split={problem.hint.split}
                interactive={false}
              />
            )}

            <ol className="pp-steps">
              {problem.explain.map((step, index) => (
                <li key={`${step}-${index}`}>{step}</li>
              ))}
            </ol>

            <button
              type="button"
              className="pp-next-button"
              onClick={() =>
                emitDone({
                  correct: false,
                  timedOut: false,
                  elapsedMs: answerElapsedRef.current,
                })
              }
            >
              つぎへ
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
