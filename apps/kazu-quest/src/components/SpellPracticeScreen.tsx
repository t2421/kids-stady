"use client";

import { EventBus } from "@/game/EventBus";
import { getSpell } from "@/content/spells";
import { practiceSession, type SpellPracticeResult } from "@/lib/curriculum/practice";
import { useQuestionLoop } from "@/components/useQuestionLoop";
import { QuizBanner } from "@/components/QuizBanner";

/*
 * とっくん (設計 A4 / KQ-11): 習得テストの前に挟む練習。
 * "open-spell-practice" {spellId} で開き、テストと同じ単元から 5 問
 * (時間無制限・ヒントつき・不正解は解説)。合否はなく、終わったら
 * "spell-practice-finished" {spellId} を返して effectHandlers がテストへ進める。
 * 出題ループは useQuestionLoop (習得テスト・おだいと共通)。
 */

export function SpellPracticeScreen() {
  const state = useQuestionLoop<{ spellId: string }>(
    "open-spell-practice",
    "practice-",
    ({ spellId }) => {
      const spell = getSpell(spellId);
      return spell ? practiceSession(spell) : null;
    },
    (session) => {
      const result: SpellPracticeResult = { spellId: session.key };
      EventBus.emit("spell-practice-finished", result);
    },
  );

  if (!state) return null;
  const spell = getSpell(state.session.key);
  if (!spell) return null;

  return (
    <QuizBanner
      testId="spell-practice-banner"
      title={`とっくん: ${spell.name}`}
      index={state.index}
      total={state.session.questions}
      marks={state.marks}
    />
  );
}
