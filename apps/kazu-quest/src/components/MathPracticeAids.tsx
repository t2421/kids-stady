"use client";

import type { Problem } from "@/lib/curriculum";
import { cherryTop, textHint } from "@/lib/curriculum/practice";
import { CherryDiagram } from "@/components/CherryDiagram";
import { actionButton, UI_COLORS } from "@/components/uiTheme";

/*
 * とっくん (practice) 専用の補助 UI。MathPromptPanel から使う。
 * - MathHintBody: 「ヒント」で開く本文。CherryHint は さくらんぼ図、それ以外は
 *   explain の先頭行を文章で見せる (答えは出さない)
 * - MathExplain: 不正解のあと、解説を全文見せてから「つぎへ」で結果を返す
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

export function MathHintButton({ onTap }: { onTap: () => void }) {
  return (
    <button
      type="button"
      data-testid="math-hint"
      onClick={onTap}
      style={{
        ...actionButton(UI_COLORS.navy),
        minHeight: 56,
        alignSelf: "center",
        marginBottom: 12,
        padding: "8px 28px",
      }}
    >
      ヒント
    </button>
  );
}

export function MathHintBody({ problem }: { problem: Problem }) {
  const text = textHint(problem);
  return (
    <div data-testid="math-hint-body" style={HINT_BOX}>
      <span
        style={{
          fontFamily: "var(--kids-font)",
          fontSize: 18,
          fontWeight: 700,
          color: UI_COLORS.textSub,
        }}
      >
        ヒント
      </span>
      {problem.hint?.type === "cherry" ? (
        <CherryDiagram top={cherryTop(problem.hint)} split={problem.hint.split} />
      ) : (
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
          {text ?? "おちついて かんがえてみよう"}
        </span>
      )}
    </div>
  );
}

export function MathExplain({
  problem,
  onNext,
}: {
  problem: Problem;
  onNext: () => void;
}) {
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
