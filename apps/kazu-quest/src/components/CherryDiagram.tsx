"use client";

import type { CSSProperties } from "react";
import { UI_COLORS } from "@/components/uiTheme";

/*
 * さくらんぼ図 (くりあがり・くりさがりの分解を見せる)。
 * mathematics の CherryDiagram を移植して独立させたもの (import はしない)。
 * とっくんのヒントとして「見せる」だけの表示専用 — 入力パッドは持たない。
 * 見た目は uiTheme の DQ 風パレット (紺地・白枠・黄アクセント)。絵文字は使わない。
 */

export interface CherryDiagramProps {
  top: number;
  split: { first: number; second: number };
}

const NODE_SIZE = 64;

const nodeBase: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  fontFamily: "var(--kids-font)",
  fontWeight: 900,
  lineHeight: 1,
};

const topNode: CSSProperties = {
  ...nodeBase,
  minWidth: 84,
  height: NODE_SIZE,
  padding: "0 20px",
  borderRadius: 18,
  border: "4px solid #ffffff",
  background: UI_COLORS.navy,
  color: "#ffffff",
  fontSize: 38,
};

const branchNode: CSSProperties = {
  ...nodeBase,
  width: NODE_SIZE,
  height: NODE_SIZE,
  borderRadius: "50%",
  border: `4px solid ${UI_COLORS.yellow}`,
  background: "rgba(255, 217, 61, 0.18)",
  color: UI_COLORS.yellow,
  fontSize: 32,
};

export function CherryDiagram({ top, split }: CherryDiagramProps) {
  return (
    <figure
      data-testid="cherry-diagram"
      aria-label={`${top} は ${split.first} と ${split.second} に わけられる`}
      style={{
        margin: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
      }}
    >
      <div style={topNode}>{top}</div>
      <svg
        viewBox="0 0 180 50"
        aria-hidden="true"
        style={{
          display: "block",
          width: 180,
          height: 44,
          overflow: "visible",
          fill: "none",
          stroke: UI_COLORS.accent,
          strokeLinecap: "round",
          strokeWidth: 4,
        }}
      >
        <path d="M90 0 C90 22 42 18 42 50" />
        <path d="M90 0 C90 22 138 18 138 50" />
      </svg>
      <div style={{ display: "flex", gap: 32 }}>
        <div style={branchNode}>{split.first}</div>
        <div style={branchNode}>{split.second}</div>
      </div>
      <figcaption
        style={{
          marginTop: 10,
          fontFamily: "var(--kids-font)",
          fontSize: 20,
          fontWeight: 700,
          color: "#ffffff",
        }}
      >
        {top} は {split.first} と {split.second} に わけられるよ
      </figcaption>
    </figure>
  );
}
