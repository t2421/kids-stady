"use client";

import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { EventBus } from "@/game/EventBus";
import { getLesson } from "@/content/lessons/index";
import type { LessonDef } from "@/content/lessons/types";
import { autosave, updateSave } from "@/game/session";
import { onLessonStarted, onTestResult } from "@/lib/mastery";
import { testPassed } from "@/lib/curriculum/lessonPractice";
import { dqWindow, UI_COLORS } from "@/components/uiTheme";
import { LessonNextButton, LessonPageBody } from "@/components/lessonShared";
import { LessonWorkedExample } from "@/components/LessonWorkedExample";
import { LessonFaded } from "@/components/LessonFaded";
import { LessonPractice } from "@/components/LessonPractice";
import { LessonTest } from "@/components/LessonTest";

/*
 * まなびや: レッスン画面 (LP-08 → LP-09)。EventBus "open-lesson" {skillId, entry}
 * で開く。entry で途中からも開ける。全体の流れ (§1.1/§4 LP-09):
 *
 *   story → concept → workedExample (れい) → faded (穴埋め)
 *     → practiceLv1 → practiceLv2 → practiceLv3 (3問連続正解で次のLvへ。
 *       間違えても Lv は落とさず、ヒントが1段ずつ深くなる)
 *     → test (10問・Lv2/Lv3半々)
 *       → 8問以上正解: 合格。"lesson-finished" {outcome:"passed"} を返して終了
 *       → 8問未満: altExplain (べつの説明) → practiceLv1 に戻ってやりなおし
 *         ("lesson-finished" は出さない — 合格するまでレッスンは終わらない)
 *
 * 呪文の習得 (learnSpell) はここでは行わない — spellTestFlow.ts が
 * "lesson-finished" {outcome:"passed"} を受けて行う (単元テストと呪文習得の
 * 責務分離。LP-09 §4 の「シンプルな統合」)。ここで行うのは mastery の更新だけ。
 */

type PracticeStage = "practiceLv1" | "practiceLv2" | "practiceLv3";
type Stage =
  | "story"
  | "concept"
  | "workedExample"
  | "faded"
  | PracticeStage
  | "test"
  | "altExplain";
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
  /* story/concept/altExplain ステージ内の 0-based ページ番号。
   * workedExample/faded/練習Lv1-3/test は自前で持つ */
  pageIndex: number;
}

const STAGE_ORDER: Stage[] = ["story", "concept", "workedExample", "faded"];
const PRACTICE_STAGES: PracticeStage[] = ["practiceLv1", "practiceLv2", "practiceLv3"];

function stageForEntry(entry: EntryPoint | undefined): Stage {
  switch (entry) {
    case "concept":
      return "concept";
    case "faded":
      return "faded";
    case "practice":
      return "practiceLv1";
    case "test":
      return "test";
    case "story":
    default:
      return "story";
  }
}

function levelForPracticeStage(stage: PracticeStage): 1 | 2 | 3 {
  return (PRACTICE_STAGES.indexOf(stage) + 1) as 1 | 2 | 3;
}

/* Lv1→Lv2→Lv3 の次。Lv3 が終わったらテストへ */
function stageAfterPractice(stage: PracticeStage): Stage {
  const idx = PRACTICE_STAGES.indexOf(stage);
  return idx + 1 < PRACTICE_STAGES.length ? PRACTICE_STAGES[idx + 1] : "test";
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

  /* テスト合格。mastery を can に進めてからレッスンを閉じる */
  const finishPassed = (correct: number, total: number) => {
    const current = stateRef.current;
    if (!current) return;
    updateSave((save) => onTestResult(save, current.skillId, true));
    autosave();
    setState(null);
    const result: LessonFinishedPayload = {
      skillId: current.skillId,
      outcome: "passed",
      correct,
      total,
    };
    EventBus.emit("lesson-finished", result);
  };

  /* テスト不合格。mastery は onTestResult(false) に任せ (初回不合格だけ
   * practicing に進む)、画面は閉じずに altExplain → れんしゅうへ戻す */
  const restartAfterFailedTest = () => {
    const current = stateRef.current;
    if (!current) return;
    updateSave((save) => onTestResult(save, current.skillId, false));
    autosave();
    setState((s) => (s ? { ...s, stage: "altExplain", pageIndex: 0 } : s));
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
  } else if (state.stage === "faded") {
    body = (
      <LessonFaded
        lesson={state.lesson}
        onDone={() =>
          setState((s) => (s ? { ...s, stage: "practiceLv1", pageIndex: 0 } : s))
        }
      />
    );
  } else if (state.stage === "altExplain") {
    const pages = state.lesson.altExplain;
    body = (
      <>
        <LessonPageBody index={state.pageIndex} page={pages[state.pageIndex]} />
        <LessonNextButton
          onClick={() => {
            setState((s) => {
              if (!s) return s;
              if (s.pageIndex + 1 < pages.length) {
                return { ...s, pageIndex: s.pageIndex + 1 };
              }
              return { ...s, stage: "practiceLv1", pageIndex: 0 };
            });
          }}
        />
      </>
    );
  } else if (state.stage === "test") {
    body = (
      <LessonTest
        key="test"
        lesson={state.lesson}
        onDone={(correct, total) => {
          if (testPassed(correct)) {
            finishPassed(correct, total);
            return;
          }
          restartAfterFailedTest();
        }}
      />
    );
  } else {
    /* practiceLv1 / practiceLv2 / practiceLv3 */
    const practiceStage = state.stage;
    const level = levelForPracticeStage(practiceStage);
    body = (
      <LessonPractice
        key={practiceStage}
        lesson={state.lesson}
        level={level}
        onLevelComplete={() =>
          setState((s) =>
            s ? { ...s, stage: stageAfterPractice(practiceStage), pageIndex: 0 } : s,
          )
        }
      />
    );
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
