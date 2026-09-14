"use client";

import type { Problem } from "@/lib/curriculum";

/*
 * 出題パネルの3択 (戦闘・小1〜2)。ボタンは ≥72px (幼児の誤タップ対策)。
 * 回答後 (feedback あり) は正解を緑で強調し、全ボタンを無効化する。
 */

export function MathChoices({
  problem,
  feedback,
  onChoose,
}: {
  problem: Problem;
  feedback: "correct" | "wrong" | null;
  onChoose: (choice: string, isAnswer: boolean) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {problem.choices.map((choice) => {
        const isAnswer = choice === problem.answer;
        const highlight =
          feedback !== null && isAnswer ? "3px solid var(--kids-good)" : undefined;
        return (
          <button
            key={choice}
            type="button"
            data-testid="math-choice"
            data-answer={isAnswer ? "1" : "0"}
            onClick={() => onChoose(choice, isAnswer)}
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
  );
}
