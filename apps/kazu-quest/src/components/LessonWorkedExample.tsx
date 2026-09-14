"use client";

import { useState } from "react";
import type { LessonDef } from "@/content/lessons/types";
import { UI_COLORS } from "@/components/uiTheme";
import { LessonNextButton, LessonPageBody } from "@/components/lessonShared";

/*
 * れい (worked example) のステップ再生 (LP-08)。lesson.workedExample.problem を
 * 上部に固定表示したまま、steps を1つずつ「つぎへ」で進める。最後のステップで
 * 「つぎへ」を押すと onDone (穴埋めへ)。
 */

export function LessonWorkedExample({
  lesson,
  onDone,
}: {
  lesson: LessonDef;
  onDone: () => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const { problem, steps } = lesson.workedExample;
  const step = steps[stepIndex];

  const advance = () => {
    if (stepIndex + 1 < steps.length) {
      setStepIndex((i) => i + 1);
      return;
    }
    onDone();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          fontFamily: "var(--kids-font)",
          fontWeight: 700,
          fontSize: "clamp(15px, 2vw, 18px)",
          color: UI_COLORS.yellow,
        }}
      >
        れい: {problem.text}
      </div>
      <LessonPageBody index={stepIndex} page={step} />
      <LessonNextButton onClick={advance} />
    </div>
  );
}
