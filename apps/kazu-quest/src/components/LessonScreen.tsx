"use client";

import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { EventBus } from "@/game/EventBus";
import { getLesson } from "@/content/lessons/index";
import type { LessonDef } from "@/content/lessons/types";
import { autosave, updateSave } from "@/game/session";
import { onLessonStarted } from "@/lib/mastery";
import { dqWindow, UI_COLORS } from "@/components/uiTheme";
import { LessonNextButton, LessonPageBody } from "@/components/lessonShared";
import { LessonWorkedExample } from "@/components/LessonWorkedExample";
import { LessonFaded } from "@/components/LessonFaded";

/*
 * まなびや: レッスン画面 (LP-08)。EventBus "open-lesson" {skillId, entry} で開く。
 * 導入 (story) → 概念 (concept) → れい (workedExample) → 穴埋め (faded) の
 * 4段階を1つずつ「つぎへ」で進める全画面オーバーレイ (DQ風二重枠)。
 * entry で途中から開ける (§1.3): "story"/省略 = story から、"concept" = concept
 * から、"faded"/"practice"/"test" = faded から (れんしゅう・テストは LP-09 が
 * 引き継ぐまでの暫定入口)。
 * 完了したら "lesson-finished" {skillId, outcome: "passed", correct, total} を
 * 返す — outcome は穴埋めに合否ゲートが無いので常に "passed" (LP-09 が接続するまで)。
 */

type Stage = "story" | "concept" | "workedExample" | "faded";
type EntryPoint = "story" | "concept" | "faded" | "practice" | "test";

interface OpenLessonPayload {
  skillId: string;
  entry?: EntryPoint;
}

interface LessonFinishedPayload {
  skillId: string;
  outcome: "passed" | "failed" | "aborted";
  correct: number;
  total: number;
}

interface OpenState {
  skillId: string;
  lesson: LessonDef;
  stage: Stage;
  /* story/concept ステージ内の 0-based ページ番号。workedExample/faded は自前で持つ */
  pageIndex: number;
}

const STAGE_ORDER: Stage[] = ["story", "concept", "workedExample", "faded"];

function stageForEntry(entry: EntryPoint | undefined): Stage {
  switch (entry) {
    case "concept":
      return "concept";
    case "faded":
    case "practice":
    case "test":
      return "faded";
    case "story":
    default:
      return "story";
  }
}

export function LessonScreen() {
  const [state, setState] = useState<OpenState | null>(null);
  const stateRef = useRef<OpenState | null>(null);
  stateRef.current = state;

  useEffect(() => {
    const onOpen = (payload: OpenLessonPayload) => {
      const lesson = getLesson(payload.skillId);
      if (!lesson) return; /* lessonFlow は hasLesson を先に見ているので通常は起きない */
      updateSave((save) => onLessonStarted(save, payload.skillId));
      autosave();
      setState({
        skillId: payload.skillId,
        lesson,
        stage: stageForEntry(payload.entry),
        pageIndex: 0,
      });
    };
    EventBus.on("open-lesson", onOpen);
    return () => {
      EventBus.off("open-lesson", onOpen);
    };
  }, []);

  const finish = (correct: number, total: number) => {
    const current = stateRef.current;
    if (!current) return;
    setState(null);
    const result: LessonFinishedPayload = {
      skillId: current.skillId,
      outcome: "passed",
      correct,
      total,
    };
    EventBus.emit("lesson-finished", result);
  };

  const advanceWithinPages = (pageCount: number) => {
    setState((s) => {
      if (!s) return s;
      if (s.pageIndex + 1 < pageCount) {
        return { ...s, pageIndex: s.pageIndex + 1 };
      }
      const nextStage = STAGE_ORDER[STAGE_ORDER.indexOf(s.stage) + 1];
      return { ...s, stage: nextStage, pageIndex: 0 };
    });
  };

  if (!state) return null;

  /* 背景タップでは閉じない (誤タップ対策)。タップはゲームへ伝えない */
  const swallow = (e: SyntheticEvent) => e.stopPropagation();

  let body: React.ReactNode;
  if (state.stage === "story") {
    const pages = state.lesson.story.pages;
    body = (
      <>
        <LessonPageBody index={state.pageIndex} page={{ text: pages[state.pageIndex] }} />
        <LessonNextButton onClick={() => advanceWithinPages(pages.length)} />
      </>
    );
  } else if (state.stage === "concept") {
    const pages = state.lesson.concept;
    body = (
      <>
        <LessonPageBody index={state.pageIndex} page={pages[state.pageIndex]} />
        <LessonNextButton onClick={() => advanceWithinPages(pages.length)} />
      </>
    );
  } else if (state.stage === "workedExample") {
    body = (
      <LessonWorkedExample
        lesson={state.lesson}
        onDone={() => setState((s) => (s ? { ...s, stage: "faded", pageIndex: 0 } : s))}
      />
    );
  } else {
    body = <LessonFaded lesson={state.lesson} onDone={finish} />;
  }

  return (
    <div
      data-testid="lesson-screen"
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
        aria-label={state.lesson.title}
        style={dqWindow({
          width: "min(94vw, 760px)",
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
          {state.lesson.title}
        </div>
        {body}
      </div>
    </div>
  );
}
