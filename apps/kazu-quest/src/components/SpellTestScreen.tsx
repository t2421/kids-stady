"use client";

import { useEffect, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";
import type { MathPromptResult } from "@/components/MathPromptPanel";
import { getSpell } from "@/content/spells";
import { recordAnswer } from "@/lib/save";
import { updateSave, autosave } from "@/game/session";

/*
 * 呪文の習得テスト (まなびや)。MathPromptPanel に1問ずつ出題を依頼し、
 * questions 問中 passCount 問正解で合格 → "spell-test-finished" を返す。
 * テストは時間無制限 (timeLimitMs: null) — 設計 A4。
 */

interface TestState {
  spellId: string;
  index: number;
  correct: number;
  marks: ("o" | "x")[];
}

export function SpellTestScreen() {
  const [test, setTest] = useState<TestState | null>(null);
  const testRef = useRef<TestState | null>(null);
  testRef.current = test;

  useEffect(() => {
    const askNext = (state: TestState) => {
      const spell = getSpell(state.spellId);
      if (!spell) return;
      EventBus.emit("math-prompt", {
        requestId: `spelltest-${state.spellId}-${state.index}`,
        skillIds: spell.learnTest.skillIds,
        timeLimitMs: null,
        context: "test",
      });
    };

    const onOpen = ({ spellId }: { spellId: string }) => {
      const state: TestState = { spellId, index: 0, correct: 0, marks: [] };
      setTest(state);
      /* パネル表示のテンポを整える */
      setTimeout(() => askNext(state), 400);
    };

    const onResult = (result: MathPromptResult) => {
      const current = testRef.current;
      if (!current) return;
      if (!result.requestId.startsWith(`spelltest-${current.spellId}-`)) return;
      const spell = getSpell(current.spellId);
      if (!spell) return;

      updateSave((s) =>
        recordAnswer(s, result.problem.skillId, result.correct, result.elapsedMs),
      );
      autosave();

      const state: TestState = {
        ...current,
        index: current.index + 1,
        correct: current.correct + (result.correct ? 1 : 0),
        marks: [...current.marks, result.correct ? "o" : "x"],
      };

      if (state.index >= spell.learnTest.questions) {
        const passed = state.correct >= spell.learnTest.passCount;
        setTest(null);
        EventBus.emit("spell-test-finished", {
          spellId: current.spellId,
          passed,
          correct: state.correct,
          total: spell.learnTest.questions,
        });
        return;
      }
      setTest(state);
      setTimeout(() => askNext(state), 350);
    };

    EventBus.on("open-spell-test", onOpen);
    EventBus.on("math-result", onResult);
    return () => {
      EventBus.off("open-spell-test", onOpen);
      EventBus.off("math-result", onResult);
    };
  }, []);

  if (!test) return null;
  const spell = getSpell(test.spellId);
  if (!spell) return null;

  return (
    <div
      data-testid="spell-test-banner"
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
        しゅうとくテスト: {spell.name}
      </span>
      <span style={{ fontSize: 18 }}>
        もんだい {Math.min(test.index + 1, spell.learnTest.questions)}/
        {spell.learnTest.questions}
      </span>
      <span style={{ fontSize: 18, letterSpacing: 2 }}>
        {test.marks.map((m, i) => (
          <span
            key={i}
            style={{ color: m === "o" ? "var(--kids-good)" : "var(--kids-bad)" }}
          >
            {m === "o" ? "○" : "×"}
          </span>
        ))}
      </span>
    </div>
  );
}
