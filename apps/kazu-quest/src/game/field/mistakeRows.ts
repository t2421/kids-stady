/*
 * ステータスパネル「ノート」タブの行 (純関数 — Vitest 対象)。
 * セーブの MistakeEntry に単元ラベル (curriculum SKILLS) を足して
 * 新しい順のまま返す。
 */

import type { MistakeEntry } from "../../lib/mistakes";
import { SKILLS } from "../../lib/curriculum";

export interface MistakeRow {
  ts: number;
  /* 単元ラベル ("たしざん (10まで)" など)。未知の skillId は id のまま */
  skill: string;
  text: string;
  answer: string;
  /* 時間切れは "" */
  chosen: string;
  explain: string[];
}

const SKILL_LABELS: ReadonlyMap<string, string> = new Map(
  SKILLS.map((s) => [s.id, s.label]),
);

export function skillLabel(skillId: string): string {
  return SKILL_LABELS.get(skillId) ?? skillId;
}

export function buildMistakeRows(mistakes: readonly MistakeEntry[]): MistakeRow[] {
  return mistakes.map((m) => ({
    ts: m.ts,
    skill: skillLabel(m.skillId),
    text: m.text,
    answer: m.answer,
    chosen: m.chosen,
    explain: [...m.explain],
  }));
}
