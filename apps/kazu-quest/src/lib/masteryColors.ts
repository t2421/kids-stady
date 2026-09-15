/*
 * 単元の習熟状態 (MasteryState) の4色表現。純関数のみ (色を返すだけ、DOM非依存)。
 *
 * 色の選定は新規発明ではなく、既存の TeacherMenu.tsx の MASTERY_COLORS/MASTERY_LABELS
 * (先生メニューの単元一覧、学びの設計 LP-18) を踏襲する — 同じ4状態を同じ色で表す方が
 * プレイヤーにとって一貫している。TeacherMenu.tsx 自体はタスク境界外 (触らない) なので
 * ここに複製して単独 import できるようにした (mastered=UI_COLORS.yellow は
 * "#ffd93d" で、単元マップの「mastered のセルが金」要件をそのまま満たす)。
 */

import { UI_COLORS } from "@/components/uiTheme";
import type { MasteryState } from "./save";

export const MASTERY_COLORS: Record<MasteryState, string> = {
  none: "#6b7686",
  practicing: UI_COLORS.mp,
  can: UI_COLORS.hp,
  mastered: UI_COLORS.yellow,
};

export const MASTERY_LABELS: Record<MasteryState, string> = {
  none: "みならい",
  practicing: "とっくん中",
  can: "できる",
  mastered: "マスター",
};

export function masteryCellColor(state: MasteryState): string {
  return MASTERY_COLORS[state] ?? MASTERY_COLORS.none;
}

export function masteryCellLabel(state: MasteryState): string {
  return MASTERY_LABELS[state] ?? MASTERY_LABELS.none;
}
