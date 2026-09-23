"use client";

import { useEffect, useRef, useState } from "react";
import { playSfx } from "@/game/audio/sfx";
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
import { setCurrentProblem } from "@/components/currentProblem";
import { ProblemFigure } from "@/components/ProblemFigure";
import { mistakeFeedbackFor } from "@/lib/mistakeFeedback";

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
/* まちがえたときは 一言を読む時間を とる */
const WRONG_ADVANCE_MS = 2200;

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
  /* まちがえたときの その単元の一言 (lesson.mistakes → 共通の一言) */
  const [note, setNote] = useState<string | null>(null);

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

  const inputMode = inputModeFor("practice", lesson.skillId);

  /* 回答後の「つぎへ」タイマー。画面を とじたあとに 発火して 消えた画面の state を
     さわらないよう、アンマウントで 取り消す */
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (advanceTimer.current !== null) clearTimeout(advanceTimer.current);
    },
    [],
  );

  const settle = (isCorrect: boolean, chosen: string) => {
    if (feedback !== null) return;
    setFeedback(isCorrect ? "correct" : "wrong");
    setNote(isCorrect ? null : mistakeFeedbackFor(problem, chosen, lesson));
    playSfx(isCorrect ? "correct" : "wrong");
    const result = applyPracticeAnswer(attempt, isCorrect);
    if (!result.levelComplete && result.attempt.hintLevel > attempt.hintLevel) {
      /* ヒントが1段深くなった。「まちがえた」の音とかぶらないよう少し遅らせる。
       * 責めない音なので wrong とは別に鳴らす */
      setTimeout(() => playSfx("hintReveal"), 140);
    }
    advanceTimer.current = setTimeout(() => {
      if (result.levelComplete) {
        /* Lv1→2 / Lv2→3 だけ短いファンファーレ。Lv3→テストは LessonScreen.tsx が
         * testStart を鳴らすので、ここでは levelUp を重ねない */
        if (level < 3) playSfx("practiceLevelUp");
        onLevelComplete();
        return;
      }
      setAttempt(result.attempt);
      setProblem(generate(lesson.skillId, undefined, { level }));
      setProblemSeq((n) => n + 1);
      setFeedback(null);
      setNote(null);
    }, isCorrect ? AUTO_ADVANCE_MS : WRONG_ADVANCE_MS);
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
      <ProblemFigure problem={problem} />
      {inputMode === "keypad" ? (
        <Keypad
          key={problemSeq}
          expected={problem.answer}
          disabled={feedback !== null}
          tone={feedback}
          onSubmit={(typed) => settle(isAnswerCorrect(typed, problem.answer), typed)}
        />
      ) : (
        <MathChoices
          problem={problem}
          feedback={feedback}
          onChoose={(choice, isAnswer) => settle(isAnswer, choice)}
        />
      )}
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
      {attempt.hintLevel > 0 && <MathHintBody problem={problem} level={attempt.hintLevel} />}
    </div>
  );
}
