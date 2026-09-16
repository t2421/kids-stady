"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import { EventBus } from "@/game/EventBus";
import { playSfx } from "@/game/audio/sfx";
import { SKILLS, generate, type Problem } from "@/lib/curriculum";
import { isAnswerCorrect } from "@/lib/curriculum/answer";
import { autosave, getSave, updateSave } from "@/game/session";
import { applyReviewResultExp } from "@/lib/learningExp";
import { hasChapterCrystal } from "@/lib/review";
import { inputModeFor } from "@/lib/inputMode";
import { dqWindow, actionButton, UI_COLORS } from "@/components/uiTheme";
import { MathChoices } from "@/components/MathChoices";
import { Keypad } from "@/components/Keypad";

/*
 * ほこら/まなびやの「おさらい」(学びの設計 LP-11 §3.6)。EventBus
 * "open-review" {skillIds} で開く。skillIds ごとに5問 (Lv2, generate 経由) を
 * 順番に出題し、全skillId分が終わったら onReviewResult で mastery を更新して
 * "review-finished" {results} を返す。
 *
 * mastered に昇格した単元があれば、その単元の学年 = 章の「数晶のかけら」
 * (kakera_<chapter>) を1個渡す (src/content/items.ts に登録済み)。あわせて
 * パーティ全員に「マスター」ぶんのEXPも渡す (学びの設計 LP-21。onReviewResult
 * は mastery.ts の中で唯一 "mastered" を設定する場所なので、ここが正しい
 * フック位置 — onTestResult 側は "mastered" にはならない)。
 */

const QUESTIONS_PER_SKILL = 5;

interface ReviewResult {
  skillId: string;
  correct: number;
  total: number;
}

type ScreenState =
  | { kind: "empty" }
  | {
      kind: "quiz";
      skillIds: string[];
      skillIndex: number;
      questionIndex: number;
      corrects: number[];
      problem: Problem;
    };

interface OpenReviewPayload {
  skillIds: string[];
}

function nextProblemFor(skillId: string): Problem {
  return generate(skillId, undefined, { level: 2 });
}

export function ReviewScreen() {
  const [state, setState] = useState<ScreenState | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    const onOpen = (payload: OpenReviewPayload) => {
      const skillIds = payload?.skillIds ?? [];
      if (skillIds.length === 0) {
        EventBus.emit("review-finished", { results: [] });
        setState({ kind: "empty" });
        return;
      }
      setState({
        kind: "quiz",
        skillIds,
        skillIndex: 0,
        questionIndex: 0,
        corrects: skillIds.map(() => 0),
        problem: nextProblemFor(skillIds[0]),
      });
      setFeedback(null);
    };
    EventBus.on("open-review", onOpen);
    return () => {
      EventBus.off("open-review", onOpen);
    };
  }, []);

  /* 全問終了。mastery を更新し、mastered へ新規昇格した分の かけら を渡して閉じる */
  const finish = (skillIds: string[], corrects: number[]) => {
    const results: ReviewResult[] = skillIds.map((skillId, i) => ({
      skillId,
      correct: corrects[i],
      total: QUESTIONS_PER_SKILL,
    }));

    /* かけら付与前の状態 (章ごとの数晶完成を「付与前後で比較」するため、
     * 更新前にスナップショットしておく — src/lib/review.ts は変更しない) */
    const beforeSave = getSave();
    const masteredSkillIds: string[] = [];
    const shardGrades: number[] = [];

    updateSave((save) => {
      let next = save;
      /* applyReviewResultExp: mastery遷移 + can/mastered → mastered に
       * 初めて到達したときの「マスター」ぶんのEXP付与 (LP-21) をまとめて行う。
       * かけらの付与は justMastered を見てここで別途行う (かけらとEXPは
       * 別の報酬なので責務を分けたまま — @/lib/learningExp のコメント参照) */
      const shardGains: Record<string, number> = {};
      for (const [i, skillId] of skillIds.entries()) {
        const outcome = applyReviewResultExp(next, skillId, corrects[i], QUESTIONS_PER_SKILL);
        next = outcome.save;
        if (outcome.justMastered) {
          const grade = SKILLS.find((s) => s.id === skillId)?.grade;
          if (grade) {
            const itemId = `kakera_${grade}`;
            shardGains[itemId] = (shardGains[itemId] ?? 0) + 1;
            masteredSkillIds.push(skillId);
            shardGrades.push(grade);
          }
        }
      }
      if (Object.keys(shardGains).length > 0) {
        const items = { ...next.inventory.items };
        for (const [itemId, count] of Object.entries(shardGains)) {
          items[itemId] = (items[itemId] ?? 0) + count;
        }
        next = { ...next, inventory: { ...next.inventory, items } };
      }
      return next;
    });
    autosave();

    /* mastered → shard は昇格ごとに1組 (1個のかけらに1音)。付与後に
     * hasChapterCrystal が false→true に変わった学年があれば crystal を追加で鳴らす */
    for (let i = 0; i < masteredSkillIds.length; i++) {
      playSfx("mastered");
      playSfx("shard");
    }
    const afterSave = getSave();
    const gradesTouched = [...new Set(shardGrades)];
    for (const grade of gradesTouched) {
      if (!hasChapterCrystal(beforeSave, grade) && hasChapterCrystal(afterSave, grade)) {
        playSfx("crystal");
      }
    }

    setState(null);
    setFeedback(null);
    EventBus.emit("review-finished", { results });
  };

  const settle = (isCorrect: boolean) => {
    if (feedback !== null) return;
    setFeedback(isCorrect ? "correct" : "wrong");
    playSfx(isCorrect ? "correct" : "wrong");
    setTimeout(() => {
      setState((s) => {
        if (!s || s.kind !== "quiz") return s;
        const corrects = s.corrects.slice();
        if (isCorrect) corrects[s.skillIndex] += 1;

        const nextQuestionIndex = s.questionIndex + 1;
        if (nextQuestionIndex < QUESTIONS_PER_SKILL) {
          return {
            ...s,
            corrects,
            questionIndex: nextQuestionIndex,
            problem: nextProblemFor(s.skillIds[s.skillIndex]),
          };
        }

        const nextSkillIndex = s.skillIndex + 1;
        if (nextSkillIndex < s.skillIds.length) {
          return {
            ...s,
            corrects,
            skillIndex: nextSkillIndex,
            questionIndex: 0,
            problem: nextProblemFor(s.skillIds[nextSkillIndex]),
          };
        }

        finish(s.skillIds, corrects);
        return null;
      });
      setFeedback(null);
    }, 900);
  };

  if (state === null) return null;

  const swallow = (e: SyntheticEvent) => e.stopPropagation();

  let body: React.ReactNode;
  if (state.kind === "empty") {
    body = (
      <>
        <p
          data-testid="review-page-0"
          style={{
            margin: 0,
            fontFamily: "var(--kids-font)",
            fontWeight: 700,
            fontSize: "clamp(18px, 2.6vw, 23px)",
            color: "#ffffff",
            lineHeight: 1.5,
          }}
        >
          きょうは おさらいする ものが ないよ!
        </p>
        <button
          type="button"
          data-testid="review-close"
          onClick={() => setState(null)}
          style={{
            ...actionButton("#2d5a3d"),
            alignSelf: "flex-end",
            minHeight: 56,
            minWidth: 160,
            fontSize: 20,
          }}
        >
          とじる
        </button>
      </>
    );
  } else {
    const skillId = state.skillIds[state.skillIndex];
    const inputMode = inputModeFor("review", skillId);
    const questionNumber = state.skillIndex * QUESTIONS_PER_SKILL + state.questionIndex + 1;
    const totalQuestions = state.skillIds.length * QUESTIONS_PER_SKILL;
    const skillLabel = SKILLS.find((s) => s.id === skillId)?.label ?? skillId;

    body = (
      <>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--kids-font)",
            fontWeight: 700,
            fontSize: "clamp(14px, 1.8vw, 16px)",
            color: UI_COLORS.textSub,
          }}
        >
          おさらい: {skillLabel} ({questionNumber}/{totalQuestions})
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
          {state.problem.text}
        </p>
        {inputMode === "keypad" ? (
          <Keypad
            key={`${state.skillIndex}-${state.questionIndex}`}
            expected={state.problem.answer}
            disabled={feedback !== null}
            tone={feedback}
            onSubmit={(typed) => settle(isAnswerCorrect(typed, state.problem.answer))}
          />
        ) : (
          <MathChoices
            problem={state.problem}
            feedback={feedback}
            onChoose={(_choice, isAnswer) => settle(isAnswer)}
          />
        )}
      </>
    );
  }

  return (
    <div
      data-testid="review-screen"
      onClick={swallow}
      onPointerDown={swallow}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(4, 8, 20, 0.7)",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="おさらい"
        style={dqWindow({
          width: "min(94vw, 620px)",
          maxHeight: "92vh",
          overflowY: "auto",
          borderRadius: 14,
          padding: "20px 24px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        })}
      >
        <div
          style={{
            fontFamily: "var(--kids-font)",
            fontWeight: 700,
            fontSize: "clamp(20px, 2.8vw, 26px)",
            color: UI_COLORS.yellow,
            textAlign: "center",
          }}
        >
          おさらい
        </div>
        {body}
      </div>
    </div>
  );
}
