import type { CSSProperties } from "react";

/*
 * DOM オーバーレイ共通のデザイントークン (DQ風ウィンドウ・ボタン)。
 * 色・枠・ボタン形状はここだけで定義し、各コンポーネントは組み合わせる。
 * iPad メイン利用のため、ボタンの最小サイズは指向け (≥56px)。
 */

export const UI_COLORS = {
  windowBg: "rgba(6, 10, 18, 0.94)",
  accent: "#8aa5d5",
  yellow: "#ffd93d",
  navy: "#1a2f55",
  textSub: "#b9c2d0",
  hp: "#3ec46d",
  mp: "#4a9dea",
} as const;

/* DQ風の二重枠ウィンドウ */
export function dqWindow(overrides?: CSSProperties): CSSProperties {
  return {
    boxSizing: "border-box",
    background: UI_COLORS.windowBg,
    border: "4px solid #ffffff",
    borderRadius: 10,
    boxShadow: `inset 0 0 0 4px rgba(6,10,18,1), inset 0 0 0 6px ${UI_COLORS.accent}`,
    color: "#ffffff",
    fontFamily: "var(--kids-font)",
    ...overrides,
  };
}

/* タブ・なかま切替などの選択ピル */
export function pillButton(selected: boolean): CSSProperties {
  return {
    minHeight: 56,
    padding: "10px 18px",
    fontFamily: "var(--kids-font)",
    fontSize: "clamp(16px, 2.2vw, 21px)",
    fontWeight: 700,
    color: selected ? UI_COLORS.navy : "#ffffff",
    background: selected ? UI_COLORS.yellow : UI_COLORS.navy,
    border: selected ? "3px solid #ffffff" : "3px solid rgba(255,255,255,0.55)",
    borderRadius: 12,
    cursor: "pointer",
  };
}

/* 決定・とじる などのアクションボタン */
export function actionButton(bg: string): CSSProperties {
  return {
    minHeight: 60,
    padding: "10px 22px",
    fontFamily: "var(--kids-font)",
    fontSize: "clamp(16px, 2.2vw, 21px)",
    fontWeight: 700,
    color: "#ffffff",
    background: bg,
    border: "3px solid #ffffff",
    borderRadius: 12,
    cursor: "pointer",
  };
}

/* リスト・はい/いいえ の選択肢ボタン */
export function optionButton(selected: boolean): CSSProperties {
  return {
    minHeight: 58,
    padding: "8px 18px",
    textAlign: "left",
    fontFamily: "var(--kids-font)",
    fontSize: 20,
    fontWeight: 700,
    color: selected ? UI_COLORS.navy : "#ffffff",
    background: selected ? UI_COLORS.yellow : "rgba(255,255,255,0.08)",
    border: selected
      ? "3px solid #ffffff"
      : "3px solid rgba(255,255,255,0.35)",
    borderRadius: 12,
    cursor: "pointer",
  };
}
