"use client";

import { useEffect, useRef, useState } from "react";
import { playSfx } from "@/game/audio/sfx";
import type { LessonDef } from "@/content/lessons/types";
import { MathChoices } from "@/components/MathChoices";
import { UI_COLORS } from "@/components/uiTheme";
import { ProblemFigure } from "@/components/ProblemFigure";
import { mistakeFeedbackFor } from "@/lib/mistakeFeedback";

/*
 * 穴埋め (faded practice) (LP-08)。lesson.faded[] を1問ずつ、答えは
 * MathChoices (3択) で埋める — 小1の単元なので3択が正しい入力方式
 * (docs/kazu-quest-learning-tasks.md §1.1)。合否のゲートはここには無く
 * (LP-09 の れんしゅう/テストが別に担当)、常にいちばん詳しいヒント
 * (hints[2]) を出しっぱなしにする「スキャフォールドされた練習」。
 * 全問終わったら onDone(correct, total) で LessonScreen に戻す。
 */

const AUTO_ADVANCE_MS = 900;
/* まちがえたときは 一言を読む時間を とる */
const WRONG_ADVANCE_MS = 2200;

export function LessonFaded({
  lesson,
  onDone,
}: {
  lesson: LessonDef;
  onDone: (correct: number, total: number) => void;
}) {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const questions = lesson.faded;
  const current = questions[index];

  /* 回答後の「つぎへ」タイマー。画面を とじたあとに 発火して 消えた画面の state を
     さわらないよう、アンマウントで 取り消す */
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (advanceTimer.current !== null) clearTimeout(advanceTimer.current);
    },
    [],
  );

  const choose = (choice: string, isAnswer: boolean) => {
    if (feedback !== null) return;
    setFeedback(isAnswer ? "correct" : "wrong");
    setNote(isAnswer ? null : mistakeFeedbackFor(current.problem, choice, lesson));
    playSfx(isAnswer ? "correct" : "wrong");
    const nextCorrect = correct + (isAnswer ? 1 : 0);
    advanceTimer.current = setTimeout(() => {
      if (index + 1 < questions.length) {
        setCorrect(nextCorrect);
        setIndex((i) => i + 1);
        setFeedback(null);
        setNote(null);
        return;
      }
      onDone(nextCorrect, questions.length);
    }, isAnswer ? AUTO_ADVANCE_MS : WRONG_ADVANCE_MS);
  };

  return (
    <div
      data-testid={`lesson-page-${index}`}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "var(--kids-font)",
          fontWeight: 700,
          fontSize: "clamp(18px, 2.6vw, 23px)",
          color: "#ffffff",
        }}
      >
        {current.problem.text}
      </p>
      <ProblemFigure problem={current.problem} />
      <MathChoices problem={current.problem} feedback={feedback} onChoose={choose} />
      {note !== null && (
        <p
          data-testid="lesson-mistake-feedback"
          role="status"
          style={{
            margin: 0,
            fontFamily: "var(--kids-font)",
            fontWeight: 700,
            fontSize: "clamp(16px, 2.2vw, 20px)",
            color: UI_COLORS.yellow,
            textAlign: "center",
          }}
        >
          {note}
        </p>
      )}
      <p
        style={{
          margin: 0,
          fontFamily: "var(--kids-font)",
          fontSize: "clamp(14px, 1.8vw, 16px)",
          color: UI_COLORS.textSub,
        }}
      >
        {current.problem.hints[2]}
      </p>
    </div>
  );
}
