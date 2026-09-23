"use client";

import { useEffect, useState } from "react";
import { playSfx } from "@/game/audio/sfx";
import type { LessonDef } from "@/content/lessons/types";
import type { Problem } from "@/lib/curriculum";
import { generate } from "@/lib/curriculum";
import { isAnswerCorrect } from "@/lib/curriculum/answer";
import { TEST_QUESTIONS, testLevelForIndex } from "@/lib/curriculum/lessonPractice";
import { inputModeFor } from "@/lib/inputMode";
import { MathChoices } from "@/components/MathChoices";
import { Keypad } from "@/components/Keypad";
import { UI_COLORS } from "@/components/uiTheme";
import { setCurrentProblem } from "@/components/currentProblem";
import { ProblemFigure } from "@/components/ProblemFigure";

/*
 * テスト (LP-09): 10問・Lv2とLv3を半々 (testLevelForIndex)・ヒントなし。
 * 全問終わったら onDone(correct, total) — 合否判定 (8問以上で合格) は
 * 呼び出し側 (LessonScreen) が testPassed() で行う。
 */

const AUTO_ADVANCE_MS = 900;

export function LessonTest({
  lesson,
  onDone,
}: {
  lesson: LessonDef;
  onDone: (correct: number, total: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [problem, setProblem] = useState<Problem>(() =>
    generate(lesson.skillId, undefined, { level: testLevelForIndex(0) }),
  );
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  /*
   * テンキー入力 (小3以降) の E2E は DOM に答えを漏らさず
   * window.__KAZUQUEST_DEBUG__.currentAnswer() 経由で答える (MathPromptPanel と
   * 同じ約束)。ここは MathPromptPanel を使わず Keypad/MathChoices を直接
   * 描画するので、自前で setCurrentProblem を呼ぶ必要がある。
   */
  useEffect(() => {
    setCurrentProblem(problem);
  }, [problem]);
  useEffect(() => () => setCurrentProblem(null), []);

  const inputMode = inputModeFor("test", lesson.skillId);

  const settle = (isCorrect: boolean) => {
    if (feedback !== null) return;
    setFeedback(isCorrect ? "correct" : "wrong");
    playSfx(isCorrect ? "correct" : "wrong");
    const nextCorrect = correct + (isCorrect ? 1 : 0);
    setTimeout(() => {
      const nextIndex = index + 1;
      if (nextIndex >= TEST_QUESTIONS) {
        onDone(nextCorrect, TEST_QUESTIONS);
        return;
      }
      setCorrect(nextCorrect);
      setIndex(nextIndex);
      setProblem(generate(lesson.skillId, undefined, { level: testLevelForIndex(nextIndex) }));
      setFeedback(null);
    }, AUTO_ADVANCE_MS);
  };

  return (
    <div data-testid="lesson-test" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--kids-font)",
          fontWeight: 700,
          fontSize: "clamp(14px, 1.8vw, 16px)",
          color: UI_COLORS.textSub,
        }}
      >
        テスト {index + 1}/{TEST_QUESTIONS}
      </p>
      <p
        style={{
          margin: 0,
          fontFamily: "var(--kids-font)",
          fontWeight: 700,
          fontSize: "clamp(18px, 2.6vw, 23px)",
          color: "#ffffff",
        }}
      >
        {problem.text}
      </p>
      <ProblemFigure problem={problem} />
      {inputMode === "keypad" ? (
        <Keypad
          key={index}
          expected={problem.answer}
          disabled={feedback !== null}
          tone={feedback}
          onSubmit={(typed) => settle(isAnswerCorrect(typed, problem.answer))}
        />
      ) : (
        <MathChoices
          problem={problem}
          feedback={feedback}
          onChoose={(_choice, isAnswer) => settle(isAnswer)}
        />
      )}
    </div>
  );
}
