"use client";

import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { EventBus } from "@/game/EventBus";
import { playSfx } from "@/game/audio/sfx";
import { getLesson } from "@/content/lessons/index";
import type { LessonDef } from "@/content/lessons/types";
import { autosave, getSave, updateSave } from "@/game/session";
import { testPassed } from "@/lib/curriculum/lessonPractice";
import { applyLessonStartExp, applyTestResultExp } from "@/lib/learningExp";
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
 * 責務分離。LP-09 §4 の「シンプルな統合」)。ここで行うのは mastery の更新と、
 * その状態遷移にひもづく「学びの経験値」の付与 (LP-21, @/lib/learningExp)。
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
  /*
   * concept の 2ページ目 (0-based index 1) の直後に挟む なかまの一言 (LP-19)。
   * 表示中は非nullで pageIndex はまだ 1 のまま止め、「つぎへ」で null に戻して
   * 通常どおり pageIndex を進める。null = 通常のページ表示
   */
  companionLine: string | null;
}

/*
 * lesson.companionLines のうち、いま パーティに いる なかまの ぶんを1件返す
 * (LP-19)。複数の加入済みなかまが同じレッスンに一言を持つケースは
 * いまの3組 (タスク/カケル/リトル) では起きないが、念のため party の並び順で
 * 最初に見つかった1件だけを採用する (2件以上は表示しない — 過剰な演出を避ける)
 */
function findCompanionLine(lesson: LessonDef): string | null {
  const party = getSave().party;
  for (const member of party) {
    const line = lesson.companionLines?.[member.memberId];
    if (line) return line;
  }
  return null;
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
      /* applyLessonStartExp: none→practicing (このレッスンを開くのが初めて)
       * の瞬間だけ「レッスン完了」ぶんのEXPを渡す (LP-21, @/lib/learningExp
       * のコメント参照) */
      updateSave((save) => applyLessonStartExp(save, payload.skillId));
      autosave();
      const stage = stageForEntry(payload.entry);
      setState({
        skillId: payload.skillId,
        lesson,
        stage,
        pageIndex: 0,
        companionLine: null,
      });
      playSfx("lessonOpen");
      /* entry:"test" で直接テストへ入る場合も、通常経路と同じくテスト開始音を鳴らす */
      if (stage === "test") playSfx("testStart");
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
    /* applyTestResultExp: can に初めて到達したときだけ「テスト合格」ぶんの
     * EXPを渡す (LP-21)。すでに can (再受験など) なら渡さない */
    updateSave((save) => applyTestResultExp(save, current.skillId, true));
    autosave();
    setState(null);
    playSfx("testPass");
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
    updateSave((save) => applyTestResultExp(save, current.skillId, false));
    autosave();
    setState((s) => (s ? { ...s, stage: "altExplain", pageIndex: 0 } : s));
    playSfx("testFail");
  };

  const advanceWithinPages = (pageCount: number) => {
    playSfx("pageTurn");
    setState((s) => {
      if (!s) return s;
      if (s.pageIndex + 1 < pageCount) {
        return { ...s, pageIndex: s.pageIndex + 1 };
      }
      const nextStage = STAGE_ORDER[STAGE_ORDER.indexOf(s.stage) + 1];
      return { ...s, stage: nextStage, pageIndex: 0 };
    });
  };

  /*
   * concept ページの「つぎへ」(LP-19)。2ページ目 (0-based index 1) を
   * 読み終えて次へ進もうとした瞬間に、加入済みの なかまの一言があれば
   * 1ページぶん割り込ませる (companionLine)。すでに割り込み中なら
   * それを閉じて通常どおり次のページ/ステージへ進む。pageIndex は
   * 割り込み中ずっと 1 のまま (companionLine が実ページの代わりに表示される)
   * ので、この判定は概念ページを進むあいだに一度しか成立しない
   */
  const advanceConcept = () => {
    const current = stateRef.current;
    if (!current) return;
    const conceptPages = current.lesson.concept;
    if (current.companionLine) {
      setState((s) => (s ? { ...s, companionLine: null } : s));
      advanceWithinPages(conceptPages.length);
      return;
    }
    if (current.pageIndex === 1) {
      const line = findCompanionLine(current.lesson);
      if (line) {
        setState((s) => (s ? { ...s, companionLine: line } : s));
        playSfx("companion");
        return;
      }
    }
    advanceWithinPages(conceptPages.length);
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
    /* companionLine (LP-19): 2ページ目の直後に挟む なかまの一言。図は出さない */
    const page = state.companionLine ? { text: state.companionLine } : pages[state.pageIndex];
    body = (
      <>
        <LessonPageBody index={state.pageIndex} page={page} />
        <LessonNextButton onClick={advanceConcept} />
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
            playSfx("pageTurn");
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
          setState((s) => {
            if (!s) return s;
            const nextStage = stageAfterPractice(practiceStage);
            /* Lv3 完了 → テストへ入る瞬間だけ testStart (Lv1→2/Lv2→3 の
             * practiceLevelUp は LessonPractice.tsx 自身が鳴らす) */
            if (nextStage === "test") playSfx("testStart");
            return { ...s, stage: nextStage, pageIndex: 0 };
          })
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
