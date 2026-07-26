"use client";

import { useEffect, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";
import type { MathPromptResult } from "@/components/MathPromptPanel";
import type { DrillQuest } from "@/lib/curriculum/drills";
import { getDrillQuest, drillReward } from "@/lib/curriculum/drills";
import { recordAnswer } from "@/lib/save";
import { updateSave, autosave } from "@/game/session";

/*
 * おだいクエスト (けいじばんのドリル)。MathPromptPanel に1問ずつ出題を
 * 依頼し、全問終了で "drill-quest-finished" {skillId, correct, total, gold,
 * perfect} を返す。時間無制限・正解数ぶんだけゴールドが積み上がる。
 */

interface DrillState {
  quest: DrillQuest;
  index: number;
  correct: number;
  marks: ("o" | "x")[];
}

export function DrillQuestScreen() {
  const [drill, setDrill] = useState<DrillState | null>(null);
  const drillRef = useRef<DrillState | null>(null);
  drillRef.current = drill;

  useEffect(() => {
    const askNext = (state: DrillState) => {
      EventBus.emit("math-prompt", {
        requestId: `drill-${state.quest.skillId}-${state.index}`,
        skillId: state.quest.skillId,
        timeLimitMs: null,
        context: "drill",
      });
    };

    const onOpen = ({ skillId }: { skillId: string }) => {
      const quest = getDrillQuest(skillId);
      if (!quest) return;
      const state: DrillState = { quest, index: 0, correct: 0, marks: [] };
      setDrill(state);
      /* パネル表示のテンポを整える */
      setTimeout(() => askNext(state), 400);
    };

    const onResult = (result: MathPromptResult) => {
      const current = drillRef.current;
      if (!current) return;
      if (!result.requestId.startsWith(`drill-${current.quest.skillId}-`)) return;

      updateSave((s) =>
        recordAnswer(s, result.problem.skillId, result.correct, result.elapsedMs),
      );
      autosave();

      const state: DrillState = {
        ...current,
        index: current.index + 1,
        correct: current.correct + (result.correct ? 1 : 0),
        marks: [...current.marks, result.correct ? "o" : "x"],
      };

      if (state.index >= state.quest.questions) {
        const reward = drillReward(state.quest, state.correct);
        setDrill(null);
        EventBus.emit("drill-quest-finished", {
          skillId: state.quest.skillId,
          correct: state.correct,
          total: state.quest.questions,
          gold: reward.gold,
          perfect: reward.perfect,
        });
        return;
      }
      setDrill(state);
      setTimeout(() => askNext(state), 350);
    };

    EventBus.on("open-drill-quest", onOpen);
    EventBus.on("math-result", onResult);
    return () => {
      EventBus.off("open-drill-quest", onOpen);
      EventBus.off("math-result", onResult);
    };
  }, []);

  if (!drill) return null;
  const earned = drill.correct * drill.quest.goldPerCorrect;

  return (
    <div
      data-testid="drill-quest-banner"
      style={{
        position: "fixed",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 60,
        background: "var(--kids-panel-bg)",
        border: "3px solid var(--kids-panel-border)",
        borderRadius: 14,
        padding: "10px 22px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        color: "#ffffff",
        fontFamily: "var(--kids-font)",
      }}
    >
      <span style={{ fontSize: 20, fontWeight: 700 }}>
        おだい: {drill.quest.label} {"★".repeat(drill.quest.stars)}
      </span>
      <span style={{ fontSize: 18 }}>
        もんだい {Math.min(drill.index + 1, drill.quest.questions)}/
        {drill.quest.questions}
      </span>
      <span style={{ fontSize: 18, letterSpacing: 2 }}>
        {drill.marks.map((m, i) => (
          <span
            key={i}
            style={{ color: m === "o" ? "var(--kids-good)" : "var(--kids-bad)" }}
          >
            {m === "o" ? "○" : "×"}
          </span>
        ))}
      </span>
      <span
        style={{ fontSize: 18, fontWeight: 700, color: "var(--kids-accent)" }}
      >
        {earned}G
      </span>
    </div>
  );
}
