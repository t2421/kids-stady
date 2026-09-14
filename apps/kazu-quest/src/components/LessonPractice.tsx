"use client";

import { useState } from "react";
import type { LessonDef } from "@/content/lessons/types";
import type { Problem } from "@/lib/curriculum";
import { generate } from "@/lib/curriculum";
import { isAnswerCorrect } from "@/lib/curriculum/answer";
import {
  applyPracticeAnswer,
  initialPracticeAttempt,
  type PracticeAttempt,
} from "@/lib/curriculum/lessonPractice";
import { inputModeFor } from "@/lib/inputMode";
import { MathChoices } from "@/components/MathChoices";
import { Keypad } from "@/components/Keypad";
import { MathHintBody } from "@/components/MathPracticeAids";
import { UI_COLORS } from "@/components/uiTheme";

/*
 * れんしゅう (LP-09): 指定の Lv で generate() した問題を、3問連続で正解する
 * まで出し続ける。間違えても Lv は落とさず (連続カウントが0に戻るだけ)、
 * 間違えるたびに problem.hints を1段ずつ深く見せる (MathHintBody を流用 —
 * とっくんの「タップで開く」とは違い、ここは間違えるたびに自動で深まる)。
 * 3連続正解したら onLevelComplete (親の LessonScreen が次の Lv / テストへ進める)。
 * 親は Lv が変わるたびに key を張り替えて再マウントすること
 * (streak/hintLevel をこのコンポーネント内で自己完結してリセットするため)。
 */

const AUTO_ADVANCE_MS = 900;

export function LessonPractice({
  lesson,
  level,
  onLevelComplete,
}: {
  lesson: LessonDef;
  level: 1 | 2 | 3;
  onLevelComplete: () => void;
}) {
  const [attempt, setAttempt] = useState<PracticeAttempt>(initialPracticeAttempt);
  const [problemSeq, setProblemSeq] = useState(0);
  const [problem, setProblem] = useState<Problem>(() =>
    generate(lesson.skillId, undefined, { level }),
  );
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const inputMode = inputModeFor("practice", lesson.skillId);

  const settle = (isCorrect: boolean) => {
    if (feedback !== null) return;
    setFeedback(isCorrect ? "correct" : "wrong");
    const result = applyPracticeAnswer(attempt, isCorrect);
    setTimeout(() => {
      if (result.levelComplete) {
        onLevelComplete();
        return;
      }
      setAttempt(result.attempt);
      setProblem(generate(lesson.skillId, undefined, { level }));
      setProblemSeq((n) => n + 1);
      setFeedback(null);
    }, AUTO_ADVANCE_MS);
  };

  const levelLabel = lesson.levels[level - 1]?.label ?? "";

  return (
    <div
      data-testid="lesson-practice"
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "var(--kids-font)",
          fontWeight: 700,
          fontSize: "clamp(14px, 1.8vw, 16px)",
          color: UI_COLORS.textSub,
        }}
      >
        れんしゅう Lv{level}: {levelLabel} ({attempt.streak}/3 れんぞく せいかい)
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
      {inputMode === "keypad" ? (
        <Keypad
          key={problemSeq}
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
      {attempt.hintLevel > 0 && <MathHintBody problem={problem} level={attempt.hintLevel} />}
    </div>
  );
}
