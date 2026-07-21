"use client";

import { useEffect, useRef, useState } from "react";
import "./problem-panel.css";

export interface CherryDiagramProps {
  top: number;
  split: { first: number; second: number };
  interactive: boolean;
  onSolved?: () => void;
}

type SlotValue = number | null;
type Feedback = "" | "correct" | "wrong";

const NUMBER_PAD = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

export function CherryDiagram({
  top,
  split,
  interactive,
  onSolved,
}: CherryDiagramProps) {
  const [slots, setSlots] = useState<[SlotValue, SlotValue]>(() =>
    interactive ? [null, null] : [split.first, split.second],
  );
  const [feedback, setFeedback] = useState<Feedback>("");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
    setSlots(interactive ? [null, null] : [split.first, split.second]);
    setFeedback("");

    return () => {
      if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
    };
  }, [interactive, split.first, split.second, top]);

  function reset() {
    if (!interactive) return;
    if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
    setSlots([null, null]);
    setFeedback("");
  }

  function chooseNumber(value: number) {
    if (!interactive || feedback !== "") return;

    const emptyIndex = slots[0] === null ? 0 : slots[1] === null ? 1 : -1;
    if (emptyIndex === -1) return;

    const next: [SlotValue, SlotValue] = [...slots];
    next[emptyIndex] = value;
    setSlots(next);

    if (next[0] === null || next[1] === null) return;

    const correct =
      (next[0] === split.first && next[1] === split.second) ||
      (next[0] === split.second && next[1] === split.first);

    if (correct) {
      setFeedback("correct");
      onSolved?.();
      return;
    }

    setFeedback("wrong");
    resetTimerRef.current = setTimeout(() => {
      setSlots([null, null]);
      setFeedback("");
      resetTimerRef.current = null;
    }, 900);
  }

  function clearSlot(index: 0 | 1) {
    if (!interactive || slots[index] === null || feedback === "wrong") return;
    if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
    setSlots((current) => {
      const next: [SlotValue, SlotValue] = [...current];
      next[index] = null;
      return next;
    });
    setFeedback("");
  }

  return (
    <div className="cherry-root">
      <p className="cherry-instruction">
        {interactive
          ? `${top} を 2つの かずに わけよう!`
          : `${top} は ${split.first} と ${split.second} に わけられるよ`}
      </p>

      <div className="cherry-diagram" aria-label={`${top}のさくらんぼ図`}>
        <div className="cherry-top">{top}</div>
        <svg
          className="cherry-branches"
          viewBox="0 0 180 50"
          aria-hidden="true"
        >
          <path d="M90 0 C90 22 42 18 42 50" />
          <path d="M90 0 C90 22 138 18 138 50" />
        </svg>
        <div className="cherry-slots">
          {slots.map((value, index) => (
            <button
              key={index}
              type="button"
              className={`cherry-slot${value !== null ? " cherry-slot-filled" : ""}`}
              onClick={() => clearSlot(index as 0 | 1)}
              disabled={!interactive || feedback === "wrong"}
              aria-label={
                value === null
                  ? `${index + 1}つめのスロット、まだ空です`
                  : `${index + 1}つめのスロット、${value}。タップして消す`
              }
            >
              {value ?? "?"}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`cherry-feedback${feedback ? ` cherry-feedback-${feedback}` : ""}`}
        role="status"
        aria-live="polite"
      >
        {feedback === "correct" && <span>せいかい! 🎉</span>}
        {feedback === "wrong" && <span>おしい! もういちど</span>}
      </div>

      {interactive && (
        <>
          <div className="cherry-pad" aria-label="数字パッド">
            {NUMBER_PAD.map((number) => (
              <button
                key={number}
                type="button"
                className="cherry-number"
                onClick={() => chooseNumber(number)}
                disabled={feedback !== "" || slots.every((slot) => slot !== null)}
                aria-label={`${number}を入れる`}
              >
                {number}
              </button>
            ))}
          </div>
          <button type="button" className="cherry-reset" onClick={reset}>
            ↻ やりなおす
          </button>
        </>
      )}
    </div>
  );
}
