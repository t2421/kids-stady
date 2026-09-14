"use client";

import type { ReactNode } from "react";
import type { LessonPage as LessonPageSpec } from "@/content/lessons/types";
import { Figure } from "@/components/figures/Figure";
import { actionButton } from "@/components/uiTheme";

/*
 * LessonScreen / LessonWorkedExample / LessonFaded が共有する最小の表示部品
 * (LP-08)。「テキスト + 任意の図」の1ページ分と「つぎへ」ボタンをここに集約し、
 * testid 規約 (docs/kazu-quest-learning-tasks.md §1.6) をどのステージでも揃える。
 */

/* 1ページ分の本文 + 図。data-testid="lesson-page-<n>" は現在のステージ内 0-based */
export function LessonPageBody({
  index,
  page,
  extra,
}: {
  index: number;
  page: LessonPageSpec;
  extra?: ReactNode;
}) {
  return (
    <div
      data-testid={`lesson-page-${index}`}
      style={{ display: "flex", flexDirection: "column", gap: 14 }}
    >
      <p
        style={{
          margin: 0,
          fontFamily: "var(--kids-font)",
          fontWeight: 700,
          fontSize: "clamp(18px, 2.6vw, 23px)",
          color: "#ffffff",
          lineHeight: 1.5,
        }}
      >
        {page.text}
      </p>
      {page.figure && <Figure spec={page.figure} />}
      {extra}
    </div>
  );
}

/* ページ/ステップ送りの共通ボタン (iPad タップ第一: ≥56px) */
export function LessonNextButton({
  onClick,
  label = "つぎへ",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      data-testid="lesson-next"
      onClick={onClick}
      style={{
        ...actionButton("#2d5a3d"),
        alignSelf: "flex-end",
        minHeight: 56,
        minWidth: 160,
        fontSize: 20,
      }}
    >
      {label}
    </button>
  );
}
