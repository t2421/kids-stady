"use client";

import { EventBus } from "@/game/EventBus";
import { getDrillQuest, drillReward } from "@/lib/curriculum/drills";
import { useQuestionLoop } from "@/components/useQuestionLoop";
import { QuizBanner } from "@/components/QuizBanner";

/*
 * おだいクエスト (けいじばんのドリル)。全問終了で "drill-quest-finished"
 * {skillId, correct, total, gold, perfect} を返す。正解数ぶんだけ
 * ゴールドが積み上がる。出題ループは useQuestionLoop (習得テストと共通)。
 */

export function DrillQuestScreen() {
  const state = useQuestionLoop<{ skillId: string }>(
    "open-drill-quest",
    "drill-",
    ({ skillId }) => {
      const quest = getDrillQuest(skillId);
      if (!quest) return null;
      return {
        key: skillId,
        questions: quest.questions,
        context: "drill",
        skillId,
      };
    },
    (session, correct, total) => {
      const quest = getDrillQuest(session.key);
      if (!quest) return;
      const reward = drillReward(quest, correct);
      EventBus.emit("drill-quest-finished", {
        skillId: session.key,
        correct,
        total,
        gold: reward.gold,
        perfect: reward.perfect,
      });
    },
  );

  if (!state) return null;
  const quest = getDrillQuest(state.session.key);
  if (!quest) return null;
  const earned = state.correct * quest.goldPerCorrect;

  return (
    <QuizBanner
      testId="drill-quest-banner"
      title={`おだい: ${quest.label} ${"★".repeat(quest.stars)}`}
      index={state.index}
      total={state.session.questions}
      marks={state.marks}
      extra={
        <span
          style={{ fontSize: 18, fontWeight: 700, color: "var(--kids-accent)" }}
        >
          {earned}G
        </span>
      }
    />
  );
}
