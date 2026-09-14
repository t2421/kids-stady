"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EventBus } from "@/game/EventBus";
import type { Problem } from "@/lib/curriculum";
import { generate, pickSkill } from "@/lib/curriculum";
import { isAnswerCorrect } from "@/lib/curriculum/answer";
import { inputModeFor } from "@/lib/inputMode";
import { getSave } from "@/game/session";
import { CountRow } from "@/components/CountIcons";
import { Keypad } from "@/components/Keypad";
import { MathChoices } from "@/components/MathChoices";
import { setCurrentProblem } from "@/components/currentProblem";
import {
  MathExplain,
  MathHintBody,
  MathHintButton,
} from "@/components/MathPracticeAids";
/* Phaser 非依存の音モジュールなので React から直接 import してよい (sfx.ts 冒頭参照) */
import { playSfx } from "@/game/audio/sfx";

/*
 * 算数プロンプト (戦闘の呪文詠唱・習得テスト・おだい・とっくん共用)。
 * Phaser から EventBus "math-prompt" で依頼され、解答後に
 * "math-result" を返す (docs/kazu-quest-design-plan.md B4)。
 * 入力方式 (lib/inputMode): 戦闘は3択、それ以外は小3以降の単元ならテンキー (KQ-12)。
 * ボタンは ≥72px (幼児の誤タップ対策)。
 * context "practice" (とっくん / KQ-11): タイマーなし・「ヒント」ボタン・
 * 不正解なら解説を全文見せて「つぎへ」で結果を返す (正解は通常の短い祝福)。
 */

export interface MathPromptRequest {
  requestId: string;
  /* skillId を直接指定するか、skillIds から苦手重み付けで選ぶ */
  skillId?: string;
  skillIds?: string[];
  /* 組み立て済みの問題 (お店のおつりチャレンジなど)。あれば生成しない */
  problem?: Problem;
  timeLimitMs: number | null;
  /* field: ステータスパネルからの回復呪文 (時間無制限、入力方式は drill と同じ学年ルール) */
  context: "battle" | "test" | "drill" | "practice" | "field";
}

export interface MathPromptResult {
  requestId: string;
  correct: boolean;
  timedOut: boolean;
  elapsedMs: number;
  problem: Problem;
  /* タップした選択肢 / テンキーで打った文字列。時間切れは null (まちがいノート用) */
  chosen: string | null;
}

const TIMER_TICK_MS = 100;

export function MathPromptPanel() {
  const [request, setRequest] = useState<MathPromptRequest | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  /* とっくん: ヒントを開いたか / 不正解の解説を読んでいる間の保留結果 */
  const [hintShown, setHintShown] = useState(false);
  const [pending, setPending] = useState<MathPromptResult | null>(null);
  const startedAt = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answeredRef = useRef(false);

  const emitResult = useCallback((result: MathPromptResult) => {
    setRequest(null);
    setProblem(null);
    setCurrentProblem(null);
    setFeedback(null);
    setPending(null);
    EventBus.emit("math-result", result);
  }, []);

  const finish = useCallback(
    (
      req: MathPromptRequest,
      prob: Problem,
      correct: boolean,
      timedOut: boolean,
      chosen: string | null,
    ) => {
      if (answeredRef.current) return;
      answeredRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      const elapsedMs = Math.round(performance.now() - startedAt.current);
      setFeedback(correct ? "correct" : "wrong");
      playSfx(correct ? "correct" : "wrong");
      const result: MathPromptResult = {
        requestId: req.requestId,
        correct,
        timedOut,
        elapsedMs,
        problem: prob,
        chosen,
      };
      /* とっくんの不正解: 解説を読み終えて「つぎへ」を押すまで結果を返さない */
      if (req.context === "practice" && !correct) {
        setPending(result);
        return;
      }
      /* 正解/不正解の色フィードバックを見せてから閉じる */
      setTimeout(() => emitResult(result), correct ? 500 : 1600);
    },
    [emitResult],
  );

  useEffect(() => {
    const onPrompt = (req: MathPromptRequest) => {
      const prob =
        req.problem ??
        generate(
          req.skillId ?? pickSkill(req.skillIds ?? [], getSave().skillStats),
        );
      answeredRef.current = false;
      setRequest(req);
      setProblem(prob);
      setCurrentProblem(prob);
      setFeedback(null);
      setHintShown(false);
      setPending(null);
      startedAt.current = performance.now();

      if (req.timeLimitMs) {
        setRemainingMs(req.timeLimitMs);
        timerRef.current = setInterval(() => {
          const left = req.timeLimitMs! - (performance.now() - startedAt.current);
          setRemainingMs(Math.max(0, left));
          if (left <= 0) {
            finish(req, prob, false, true, null);
          }
        }, TIMER_TICK_MS);
      } else {
        setRemainingMs(null);
      }
    };
    EventBus.on("math-prompt", onPrompt);
    return () => {
      EventBus.off("math-prompt", onPrompt);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [finish]);

  if (!request || !problem) return null;

  const ratio =
    request.timeLimitMs && remainingMs !== null
      ? remainingMs / request.timeLimitMs
      : null;
  const isPractice = request.context === "practice";
  const inputMode = inputModeFor(request.context, problem.skillId);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(4, 10, 24, 0.72)",
        zIndex: 50,
      }}
    >
      <div
        data-testid="math-prompt"
        data-input-mode={inputMode}
        style={{
          width: "min(92vw, 560px)",
          borderRadius: 20,
          border: "3px solid var(--kids-panel-border)",
          background: "var(--kids-panel-bg)",
          padding: "22px 24px 26px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        }}
      >
        {ratio !== null && <TimerBar ratio={ratio} />}
        <div
          style={{
            fontSize: problem.visual ? 26 : problem.text.length > 14 ? 28 : 40,
            fontWeight: 700,
            textAlign: "center",
            whiteSpace: "pre-wrap",
            lineHeight: 1.4,
            marginBottom: problem.visual ? 8 : 20,
            color: "#ffffff",
          }}
        >
          {problem.text}
        </div>
        {problem.visual && (
          <CountRow icon={problem.visual.icon} count={problem.visual.count} />
        )}
        {isPractice && !hintShown && feedback === null && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <MathHintButton onTap={() => setHintShown(true)} />
          </div>
        )}
        {isPractice && hintShown && pending === null && (
          <div style={{ marginBottom: 14 }}>
            <MathHintBody problem={problem} />
          </div>
        )}
        {inputMode === "keypad" ? (
          <Keypad
            /* 問題が変わったら入力欄を空に戻す */
            key={request.requestId}
            expected={problem.answer}
            disabled={feedback !== null}
            tone={feedback}
            onSubmit={(typed) =>
              finish(request, problem, isAnswerCorrect(typed, problem.answer), false, typed)
            }
          />
        ) : (
          <MathChoices
            problem={problem}
            feedback={feedback}
            onChoose={(choice, isAnswer) => finish(request, problem, isAnswer, false, choice)}
          />
        )}
        {feedback === "wrong" && (
          <div
            data-testid="math-answer-reveal"
            style={{
              marginTop: 14,
              textAlign: "center",
              fontSize: 22,
              color: "var(--kids-bad)",
              fontWeight: 700,
            }}
          >
            こたえは 「{problem.answer}」 だったよ
          </div>
        )}
        {pending !== null && (
          <MathExplain problem={problem} onNext={() => emitResult(pending)} />
        )}
      </div>
    </div>
  );
}

/* 戦闘の制限時間バー (残り 50% / 25% で色が変わる) */
function TimerBar({ ratio }: { ratio: number }) {
  return (
    <div
      style={{
        height: 12,
        borderRadius: 6,
        background: "rgba(255,255,255,0.15)",
        overflow: "hidden",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${ratio * 100}%`,
          borderRadius: 6,
          background:
            ratio > 0.5 ? "var(--kids-good)" : ratio > 0.25 ? "var(--kids-accent)" : "var(--kids-bad)",
          transition: "width 100ms linear",
        }}
      />
    </div>
  );
}
