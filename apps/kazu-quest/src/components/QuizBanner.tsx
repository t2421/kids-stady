"use client";

import type { ReactNode } from "react";

/*
 * 出題ループ中の進捗バナー (しゅうとくテスト・おだいドリル共用)。
 * 画面上部に「タイトル / もんだい n/N / ○×⋯」を出す。
 */

export function QuizBanner({
  testId,
  title,
  index,
  total,
  marks,
  extra,
}: {
  testId: string;
  title: string;
  index: number;
  total: number;
  marks: ("o" | "x")[];
  extra?: ReactNode;
}) {
  return (
    <div
      data-testid={testId}
      style={{
        position: "fixed",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 60,
        background: "var(--kids-panel-bg)",
        border: "3px solid var(--kids-panel-border)",
        borderRadius: 14,
        padding: "10px 22px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        color: "#ffffff",
        fontFamily: "var(--kids-font)",
      }}
    >
      <span style={{ fontSize: 20, fontWeight: 700 }}>{title}</span>
      <span style={{ fontSize: 18 }}>
        もんだい {Math.min(index + 1, total)}/{total}
      </span>
      <span style={{ fontSize: 18, letterSpacing: 2 }}>
        {marks.map((m, i) => (
          <span
            key={i}
            style={{ color: m === "o" ? "var(--kids-good)" : "var(--kids-bad)" }}
          >
            {m === "o" ? "○" : "×"}
          </span>
        ))}
      </span>
      {extra}
    </div>
  );
}
