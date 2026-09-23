"use client";

import { useEffect, useState } from "react";
import type { Problem } from "@/lib/curriculum";

/*
 * 出題パネルの3択 (戦闘・小1〜2)。ボタンは ≥72px (幼児の誤タップ対策)。
 * 回答後 (feedback あり) は正解を緑で強調し、全ボタンを無効化する。
 * まちがえたときは 自分が おした ボタンにも ✕ と赤わくを付ける
 * (以前は 正解が緑になるだけで、どれを おして まちがえたのか 残らなかった)。
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
  const [tapped, setTapped] = useState<string | null>(null);
  /* つぎの問題に なったら 印を消す */
  useEffect(() => setTapped(null), [problem]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {problem.choices.map((choice) => {
        const isAnswer = choice === problem.answer;
        const answered = feedback !== null;
        const wrongPick = answered && !isAnswer && choice === tapped;
        const border = answered && isAnswer
          ? "3px solid var(--kids-good)"
          : wrongPick
            ? "3px solid var(--kids-bad)"
            : "3px solid rgba(255,255,255,0.25)";
        const background = answered && isAnswer
          ? "rgba(62, 196, 109, 0.35)"
          : wrongPick
            ? "rgba(220, 80, 80, 0.3)"
            : "rgba(255,255,255,0.08)";
        return (
          <button
            key={choice}
            type="button"
            data-testid="math-choice"
            data-answer={isAnswer ? "1" : "0"}
            data-picked={choice === tapped ? "1" : "0"}
            onClick={() => {
              setTapped(choice);
              onChoose(choice, isAnswer);
            }}
            disabled={answered}
            style={{
              minHeight: 72,
              fontSize: 30,
              fontWeight: 700,
              fontFamily: "var(--kids-font)",
              borderRadius: 16,
              border,
              background,
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            {wrongPick ? `✕ ${choice}` : choice}
          </button>
        );
      })}
    </div>
  );
}
