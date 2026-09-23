"use client";

import type { Problem } from "@/lib/curriculum";
import type { MistakePattern } from "@/lib/curriculum/types";
import { genericMistakeFeedback, mistakeFeedbackFor } from "@/lib/mistakeFeedback";
import { cherryTop } from "@/lib/curriculum/practice";
import { CherryDiagram } from "@/components/CherryDiagram";
import { actionButton, UI_COLORS } from "@/components/uiTheme";

/*
 * とっくん (practice) 専用の補助 UI。MathPromptPanel から使う。
 * - MathHintButton / MathHintBody: 段階ヒント (LP-03)。押すたびに
 *   problem.hints[0] → [1] → [2] と1段ずつ深まり、あらわれた段は消えずに
 *   積み重なる (data-testid="math-hint" の data-level が いま見えている最大の段)
 * - MathExplain: 不正解のあと、解説を全文見せ、diagnose() で誤答パターンの
 *   一言も添えてから「つぎへ」で結果を返す (正解は通常の短い祝福)
 * ボタンは ≥56px (iPad タッチ第一)。
 */

const HINT_BOX: React.CSSProperties = {
  marginTop: 14,
  padding: "14px 16px",
  borderRadius: 14,
  border: `2px solid ${UI_COLORS.accent}`,
  background: "rgba(138, 165, 213, 0.12)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
};

const MAX_HINT_LEVEL = 3;

export function MathHintButton({
  level,
  onTap,
}: {
  level: number;
  onTap: () => void;
}) {
  const done = level >= MAX_HINT_LEVEL;
  return (
    <button
      type="button"
      data-testid="math-hint"
      data-level={level}
      disabled={done}
      onClick={done ? undefined : onTap}
      style={{
        ...actionButton(UI_COLORS.navy),
        minHeight: 56,
        alignSelf: "center",
        marginBottom: 12,
        padding: "8px 28px",
        opacity: done ? 0.6 : 1,
      }}
    >
      {done ? "ヒント (ぜんぶ)" : `ヒント${level > 0 ? ` (${level}/${MAX_HINT_LEVEL})` : ""}`}
    </button>
  );
}

export function MathHintBody({ problem, level }: { problem: Problem; level: number }) {
  const stages = problem.hints.slice(0, level);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {stages.map((text, i) => (
        <div key={i} data-testid="math-hint-body" data-stage={i + 1} style={HINT_BOX}>
          <span
            style={{
              fontFamily: "var(--kids-font)",
              fontSize: 18,
              fontWeight: 700,
              color: UI_COLORS.textSub,
            }}
          >
            ヒント {i + 1}
          </span>
          {i === 0 && problem.hint?.type === "cherry" ? (
            <CherryDiagram top={cherryTop(problem.hint)} split={problem.hint.split} />
          ) : null}
          <span
            style={{
              fontFamily: "var(--kids-font)",
              fontSize: 24,
              fontWeight: 700,
              color: "#ffffff",
              whiteSpace: "pre-wrap",
              textAlign: "center",
            }}
          >
            {text}
          </span>
        </div>
      ))}
    </div>
  );
}

/* 共通の一言 (レッスン別の一言は lib/mistakeFeedback.ts の mistakeFeedbackFor が引く) */
export function mistakeFeedbackText(pattern: MistakePattern): string {
  return genericMistakeFeedback(pattern);
}

export function MathExplain({
  problem,
  chosen,
  onNext,
}: {
  problem: Problem;
  /* MathPromptResult.chosen。時間切れ (null) は誤答診断をしない */
  chosen: string | null;
  onNext: () => void;
}) {
  /* その単元の レッスンの一言を 先に使う (なければ 共通の一言) */
  const note = mistakeFeedbackFor(problem, chosen);
  return (
    <div data-testid="math-explain" style={{ ...HINT_BOX, alignItems: "stretch" }}>
      <span
        style={{
          fontFamily: "var(--kids-font)",
          fontSize: 18,
          fontWeight: 700,
          color: UI_COLORS.textSub,
        }}
      >
        かいせつ
      </span>
      <ol
        style={{
          margin: 0,
          paddingLeft: 28,
          display: "grid",
          gap: 6,
          fontFamily: "var(--kids-font)",
          fontSize: 22,
          fontWeight: 700,
          color: "#ffffff",
          lineHeight: 1.4,
        }}
      >
        {problem.explain.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ol>
      {note && (
        <div
          data-testid="mistake-feedback"
          style={{
            fontFamily: "var(--kids-font)",
            fontSize: 18,
            fontWeight: 700,
            color: UI_COLORS.textSub,
            textAlign: "center",
          }}
        >
          {note}
        </div>
      )}
      <button
        type="button"
        data-testid="math-explain-next"
        onClick={onNext}
        style={{ ...actionButton(UI_COLORS.navy), minHeight: 56, marginTop: 6 }}
      >
        つぎへ
      </button>
    </div>
  );
}
