"use client";

import { EventBus } from "@/game/EventBus";
import {
  REVIEW_QUESTIONS,
  reviewGoldPerCorrect,
  reviewReward,
  type ReviewQuestResult,
} from "@/lib/curriculum/review";
import { useQuestionLoop } from "@/components/useQuestionLoop";
import { QuizBanner } from "@/components/QuizBanner";

/*
 * ふくしゅうのほこら (KQ-13)。"open-review-quest" {skillIds} で弱点3スキルから
 * 10問を苦手重み付けで出題し、全問終了で "review-quest-finished"
 * (ReviewQuestResult) を返す。ほうびの適用は Phaser 側 (effectHandlers) が行う。
 * 出題ループは useQuestionLoop (習得テスト・おだいと共通)。
 */

const SESSION_KEY = "review";

export function ReviewQuestScreen() {
  const state = useQuestionLoop<{ skillIds: string[] }>(
    "open-review-quest",
    "review-",
    ({ skillIds }) => {
      if (!skillIds || skillIds.length === 0) return null;
      return {
        key: SESSION_KEY,
        questions: REVIEW_QUESTIONS,
        context: "drill",
        skillIds: [...skillIds],
      };
    },
    (session, correct, total) => {
      const skillIds = session.skillIds ?? [];
      const reward = reviewReward(skillIds, correct);
      const result: ReviewQuestResult = {
        skillIds,
        correct,
        total,
        gold: reward.gold,
        medal: reward.medal,
      };
      EventBus.emit("review-quest-finished", result);
    },
  );

  if (!state) return null;
  const earned = state.correct * reviewGoldPerCorrect(state.session.skillIds ?? []);

  return (
    <QuizBanner
      testId="review-quest-banner"
      title="ふくしゅう"
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
