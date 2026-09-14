import type { CSSProperties } from "react";
import { UI_COLORS } from "@/components/uiTheme";

/*
 * 図 (レッスンの視覚モデル) 共通のトークンとヘルパー。
 * 個々の Figure コンポーネント (TenFrame / NumberLine / ...) から使う。
 * SVG は自前描画のみ (外部アセット・絵文字なし)。幅は 100% (max 640px)。
 */

export const FIGURE_MAX_WIDTH = 640;

export const FIGURE_COLORS = {
  primary: UI_COLORS.accent,
  secondary: UI_COLORS.yellow,
  stroke: "#ffffff",
  text: "#ffffff",
  muted: UI_COLORS.textSub,
  highlight: UI_COLORS.hp,
  empty: "rgba(255,255,255,0.08)",
} as const;

/* 図の外側ラッパ (data-testid / data-kind を必ず持つ) の共通スタイル */
export function figureWrapperStyle(): CSSProperties {
  return {
    display: "block",
    width: "100%",
    maxWidth: FIGURE_MAX_WIDTH,
    margin: "0 auto",
    boxSizing: "border-box",
  };
}

export function svgStyle(): CSSProperties {
  return { display: "block", width: "100%", height: "auto" };
}

export const FIGURE_FONT = "var(--kids-font, sans-serif)";
