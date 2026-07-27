"use client";

import { EventBus } from "@/game/EventBus";
import { getSpell } from "@/content/spells";
import { useQuestionLoop } from "@/components/useQuestionLoop";
import { QuizBanner } from "@/components/QuizBanner";

/*
 * 呪文の習得テスト (まなびや)。questions 問中 passCount 問正解で合格 →
 * "spell-test-finished" を返す (docs/kazu-quest-design-plan.md B4)。
 * 出題ループは useQuestionLoop (おだいドリルと共通)。
 */

export function SpellTestScreen() {
  const state = useQuestionLoop<{ spellId: string }>(
    "open-spell-test",
    "spelltest-",
    ({ spellId }) => {
      const spell = getSpell(spellId);
      if (!spell) return null;
      return {
        key: spellId,
        questions: spell.learnTest.questions,
        context: "test",
        skillIds: spell.learnTest.skillIds,
      };
    },
    (session, correct, total) => {
      const spell = getSpell(session.key);
      if (!spell) return;
      EventBus.emit("spell-test-finished", {
        spellId: session.key,
        passed: correct >= spell.learnTest.passCount,
        correct,
        total,
      });
    },
  );

  if (!state) return null;
  const spell = getSpell(state.session.key);
  if (!spell) return null;

  return (
    <QuizBanner
      testId="spell-test-banner"
      title={`しゅうとくテスト: ${spell.name}`}
      index={state.index}
      total={state.session.questions}
      marks={state.marks}
    />
  );
}
