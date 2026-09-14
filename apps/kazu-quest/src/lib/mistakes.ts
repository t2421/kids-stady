/*
 * まちがいノート (設計 A6)。戦闘中に間違えた問題を新しい順に最大 20 件
 * セーブへ積み、戦闘後のオーバーレイとステータスパネルの「ノート」タブで
 * 解説 (explain) を読み返せるようにする。純関数のみ — Vitest 対象。
 */

import type { SaveData } from "./save";

export const MISTAKES_CAP = 20;

export interface MistakeEntry {
  /* 間違えた時刻 (Date.now) */
  ts: number;
  skillId: string;
  /* 問題文・正解・きみのこたえ (時間切れは "") */
  text: string;
  answer: string;
  chosen: string;
  /* ステップ解説 (curriculum Problem.explain) */
  explain: string[];
}

/* 先頭 = いちばん新しい。cap を超えた古いものは落とす (不変更新) */
export function recordMistake(save: SaveData, entry: MistakeEntry): SaveData {
  return {
    ...save,
    mistakes: [entry, ...save.mistakes].slice(0, MISTAKES_CAP),
  };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function normalizeEntry(raw: unknown): MistakeEntry | null {
  if (!isRecord(raw)) return null;
  const { skillId, text, answer } = raw;
  if (typeof skillId !== "string" || !skillId) return null;
  if (typeof text !== "string" || typeof answer !== "string") return null;
  const ts = typeof raw.ts === "number" && Number.isFinite(raw.ts) ? Math.max(0, raw.ts) : 0;
  return {
    ts,
    skillId,
    text,
    answer,
    chosen: typeof raw.chosen === "string" ? raw.chosen : "",
    explain: Array.isArray(raw.explain)
      ? raw.explain.filter((s): s is string => typeof s === "string")
      : [],
  };
}

/* 欠損・破損したセーブから安全に復元する (save.normalizeSave から呼ぶ) */
export function normalizeMistakes(raw: unknown): MistakeEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeEntry)
    .filter((e): e is MistakeEntry => e !== null)
    .slice(0, MISTAKES_CAP);
}

/*
 * 出題パネルの結果 (MathPromptResult と同型) からノート項目を作る。
 * 時間切れ (chosen null) は "" として記録する
 */
export function mistakeEntryFromResult(
  result: {
    problem: Pick<MistakeEntry, "skillId" | "text" | "answer" | "explain">;
    chosen: string | null;
  },
  ts = Date.now(),
): MistakeEntry {
  return {
    ts,
    skillId: result.problem.skillId,
    text: result.problem.text,
    answer: result.problem.answer,
    chosen: result.chosen ?? "",
    explain: [...result.problem.explain],
  };
}
