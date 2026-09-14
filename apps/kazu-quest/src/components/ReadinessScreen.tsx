"use client";

import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { EventBus } from "@/game/EventBus";
import { getSave } from "@/game/session";
import type { SaveData } from "@/lib/save";
import type { Problem } from "@/lib/curriculum";
import { generate } from "@/lib/curriculum";
import { MathChoices } from "@/components/MathChoices";
import { dqWindow, UI_COLORS } from "@/components/uiTheme";

/*
 * 前提チェック (readiness, LP-10)。EventBus "open-readiness" {skillId, prerequisites}
 * で開く。前提単元から最大3問 (Lv2) を出し、2/3 以上正解で進める。
 * lessonFlow.ts (handleOpenLesson) が readinessRequired() で不足を判定してから
 * このイベントを出す — ここでは「もらった前提リストに出題するだけ」に徹する。
 *
 *   "open-readiness" {skillId, prerequisites} → "readiness-finished" {skillId, ok, weakest}
 */

const AUTO_ADVANCE_MS = 900;
const MAX_QUESTIONS = 3;

interface OpenReadinessPayload {
  skillId: string;
  prerequisites: string[];
}

interface ReadinessFinishedPayload {
  skillId: string;
  ok: boolean;
  weakest: string | null;
}

interface OpenState {
  skillId: string;
  questionSkillIds: string[];
  index: number;
  correct: number;
  /* 最初にまちがえた前提単元 (無ければ null)。不合格時の案内先に使う */
  firstWrongSkillId: string | null;
  problem: Problem;
  feedback: "correct" | "wrong" | null;
}

/*
 * 前提が4つ以上あるときは、いちばん実績の悪い (正答率の低い) 3つに絞る。
 * skillStats が無い (未プレイ) 前提は最悪扱い (accuracy 0) — 確認が最優先
 */
function pickQuestionSkillIds(prerequisites: string[], save: SaveData): string[] {
  if (prerequisites.length <= MAX_QUESTIONS) return prerequisites;
  return prerequisites
    .map((skillId) => {
      const stat = save.skillStats[skillId];
      const total = stat ? stat.c + stat.w : 0;
      const accuracy = total > 0 ? stat!.c / total : 0;
      return { skillId, accuracy };
    })
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, MAX_QUESTIONS)
    .map((entry) => entry.skillId);
}

export function ReadinessScreen() {
  const [state, setState] = useState<OpenState | null>(null);
  const stateRef = useRef<OpenState | null>(null);
  stateRef.current = state;

  useEffect(() => {
    const onOpen = (payload: OpenReadinessPayload) => {
      const questionSkillIds = pickQuestionSkillIds(payload.prerequisites, getSave());
      if (questionSkillIds.length === 0) {
        /* 呼び出し側の不具合など。塞がず進める (前提不足を理由にブロックしない) */
        const result: ReadinessFinishedPayload = { skillId: payload.skillId, ok: true, weakest: null };
        EventBus.emit("readiness-finished", result);
        return;
      }
      setState({
        skillId: payload.skillId,
        questionSkillIds,
        index: 0,
        correct: 0,
        firstWrongSkillId: null,
        problem: generate(questionSkillIds[0], undefined, { level: 2 }),
        feedback: null,
      });
    };
    EventBus.on("open-readiness", onOpen);
    return () => {
      EventBus.off("open-readiness", onOpen);
    };
  }, []);

  const choose = (_choice: string, isAnswer: boolean) => {
    const current = stateRef.current;
    if (!current || current.feedback !== null) return;
    const { skillId, questionSkillIds, index, correct, firstWrongSkillId } = current;
    setState({ ...current, feedback: isAnswer ? "correct" : "wrong" });

    const nextCorrect = correct + (isAnswer ? 1 : 0);
    const nextFirstWrong =
      !isAnswer && firstWrongSkillId === null ? questionSkillIds[index] : firstWrongSkillId;

    setTimeout(() => {
      if (index + 1 < questionSkillIds.length) {
        setState({
          skillId,
          questionSkillIds,
          index: index + 1,
          correct: nextCorrect,
          firstWrongSkillId: nextFirstWrong,
          problem: generate(questionSkillIds[index + 1], undefined, { level: 2 }),
          feedback: null,
        });
        return;
      }
      const total = questionSkillIds.length;
      const result: ReadinessFinishedPayload = {
        skillId,
        ok: nextCorrect >= Math.ceil((total * 2) / 3),
        weakest: nextFirstWrong,
      };
      setState(null);
      EventBus.emit("readiness-finished", result);
    }, AUTO_ADVANCE_MS);
  };

  if (!state) return null;

  /* 背景タップでは閉じない (誤タップ対策)。タップはゲームへ伝えない */
  const swallow = (e: SyntheticEvent) => e.stopPropagation();

  return (
    <div
      data-testid="readiness-screen"
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
        aria-label="まえの べんきょうの かくにん"
        style={dqWindow({
          width: "min(94vw, 640px)",
          borderRadius: 14,
          padding: "20px 24px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        })}
      >
        <div
          style={{
            fontFamily: "var(--kids-font)",
            fontWeight: 700,
            fontSize: "clamp(18px, 2.4vw, 22px)",
            color: UI_COLORS.yellow,
            textAlign: "center",
          }}
        >
          まえに ならった ことの かくにん
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--kids-font)",
            fontSize: "clamp(13px, 1.6vw, 15px)",
            color: UI_COLORS.textSub,
            textAlign: "center",
          }}
        >
          {state.index + 1} / {state.questionSkillIds.length}
        </p>
        <p
          data-testid={`lesson-page-${state.index}`}
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
        <MathChoices problem={state.problem} feedback={state.feedback} onChoose={choose} />
      </div>
    </div>
  );
}
