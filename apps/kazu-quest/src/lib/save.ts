/*
 * カズクエのゲーム進行データ (プロフィールごとに単一オートセーブ)。
 * キー: kidsStudy.kazuQuest.profileData.<プロフィールid>
 * 読み込みは必ず normalize を通す (docs/save-data.md §2)。
 */

import { readJSON, writeJSON } from "./profiles";

export type Dir = "up" | "down" | "left" | "right";

export interface PartyMember {
  memberId: string;
  level: number;
  exp: number;
  hp: number;
  mp: number;
  learnedSpells: string[];
}

export interface HistoryEntry {
  ts: number;
  kind: "battle" | "test";
  chapter: number;
  correct: number;
  wrong: number;
  avgAnswerMs: number;
}

export interface SkillStat {
  c: number;
  w: number;
  recentMs: number[];
}

export interface SaveData {
  version: 1;
  chapter: { current: number; cleared: number[] };
  flags: Record<string, number | boolean>;
  party: PartyMember[];
  location: { mapId: string; x: number; y: number; facing: Dir };
  checkpoint: { mapId: string; spawn: string };
  inventory: { gold: number; items: Record<string, number> };
  playtimeMs: number;
  totalCorrect: number;
  totalWrong: number;
  skillStats: Record<string, SkillStat>;
  history: HistoryEntry[];
  updatedAt: number;
}

export const HISTORY_CAP = 50;
export const RECENT_MS_CAP = 20;

/* 章1の開始位置 (ハジマリ村) */
export const START_LOCATION = {
  mapId: "ch1-hajimari",
  x: 5,
  y: 5,
  facing: "down" as Dir,
};
export const START_CHECKPOINT = { mapId: "ch1-hajimari", spawn: "start" };

export function defaultSave(): SaveData {
  return {
    version: 1,
    chapter: { current: 1, cleared: [] },
    flags: {},
    party: [
      {
        memberId: "hero",
        level: 1,
        exp: 0,
        hp: 25,
        mp: 8,
        learnedSpells: [],
      },
    ],
    location: { ...START_LOCATION },
    checkpoint: { ...START_CHECKPOINT },
    inventory: { gold: 0, items: {} },
    playtimeMs: 0,
    totalCorrect: 0,
    totalWrong: 0,
    skillStats: {},
    history: [],
    updatedAt: 0,
  };
}

const DIRS: Dir[] = ["up", "down", "left", "right"];

function asNumber(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : [];
}

function normalizeParty(raw: unknown, fallback: PartyMember[]): PartyMember[] {
  if (!Array.isArray(raw)) return fallback;
  const members = raw
    .filter(
      (m): m is Record<string, unknown> =>
        typeof m === "object" && m !== null &&
        typeof (m as { memberId?: unknown }).memberId === "string",
    )
    .map((m) => ({
      memberId: m.memberId as string,
      level: Math.max(1, asNumber(m.level, 1)),
      exp: Math.max(0, asNumber(m.exp, 0)),
      hp: Math.max(0, asNumber(m.hp, 1)),
      mp: Math.max(0, asNumber(m.mp, 0)),
      learnedSpells: asStringArray(m.learnedSpells),
    }));
  return members.length > 0 ? members : fallback;
}

function normalizeSkillStats(raw: unknown): Record<string, SkillStat> {
  if (typeof raw !== "object" || raw === null) return {};
  const out: Record<string, SkillStat> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value !== "object" || value === null) continue;
    const v = value as Record<string, unknown>;
    out[key] = {
      c: Math.max(0, asNumber(v.c, 0)),
      w: Math.max(0, asNumber(v.w, 0)),
      recentMs: (Array.isArray(v.recentMs) ? v.recentMs : [])
        .filter((n): n is number => typeof n === "number" && Number.isFinite(n))
        .slice(-RECENT_MS_CAP),
    };
  }
  return out;
}

function normalizeHistory(raw: unknown): HistoryEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (h): h is Record<string, unknown> => typeof h === "object" && h !== null,
    )
    .map((h) => ({
      ts: asNumber(h.ts, 0),
      kind: h.kind === "test" ? ("test" as const) : ("battle" as const),
      chapter: Math.max(1, asNumber(h.chapter, 1)),
      correct: Math.max(0, asNumber(h.correct, 0)),
      wrong: Math.max(0, asNumber(h.wrong, 0)),
      avgAnswerMs: Math.max(0, asNumber(h.avgAnswerMs, 0)),
    }))
    .slice(-HISTORY_CAP);
}

function normalizeFlags(raw: unknown): Record<string, number | boolean> {
  if (typeof raw !== "object" || raw === null) return {};
  const out: Record<string, number | boolean> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) {
      out[key] = value;
    }
  }
  return out;
}

export function normalizeSave(raw: unknown): SaveData {
  const d = defaultSave();
  if (typeof raw !== "object" || raw === null) return d;
  const r = raw as Record<string, unknown>;

  const chapterRaw =
    typeof r.chapter === "object" && r.chapter !== null
      ? (r.chapter as Record<string, unknown>)
      : {};
  const locationRaw =
    typeof r.location === "object" && r.location !== null
      ? (r.location as Record<string, unknown>)
      : {};
  const checkpointRaw =
    typeof r.checkpoint === "object" && r.checkpoint !== null
      ? (r.checkpoint as Record<string, unknown>)
      : {};
  const inventoryRaw =
    typeof r.inventory === "object" && r.inventory !== null
      ? (r.inventory as Record<string, unknown>)
      : {};

  const items: Record<string, number> = {};
  if (typeof inventoryRaw.items === "object" && inventoryRaw.items !== null) {
    for (const [key, value] of Object.entries(
      inventoryRaw.items as Record<string, unknown>,
    )) {
      const n = asNumber(value, 0);
      if (n > 0) items[key] = Math.floor(n);
    }
  }

  return {
    version: 1,
    chapter: {
      current: Math.max(1, asNumber(chapterRaw.current, d.chapter.current)),
      cleared: Array.isArray(chapterRaw.cleared)
        ? chapterRaw.cleared.filter(
            (n): n is number => typeof n === "number" && Number.isInteger(n),
          )
        : [],
    },
    flags: normalizeFlags(r.flags),
    party: normalizeParty(r.party, d.party),
    location: {
      mapId:
        typeof locationRaw.mapId === "string" && locationRaw.mapId
          ? locationRaw.mapId
          : d.location.mapId,
      x: asNumber(locationRaw.x, d.location.x),
      y: asNumber(locationRaw.y, d.location.y),
      facing: DIRS.includes(locationRaw.facing as Dir)
        ? (locationRaw.facing as Dir)
        : d.location.facing,
    },
    checkpoint: {
      mapId:
        typeof checkpointRaw.mapId === "string" && checkpointRaw.mapId
          ? checkpointRaw.mapId
          : d.checkpoint.mapId,
      spawn:
        typeof checkpointRaw.spawn === "string" && checkpointRaw.spawn
          ? checkpointRaw.spawn
          : d.checkpoint.spawn,
    },
    inventory: {
      gold: Math.max(0, asNumber(inventoryRaw.gold, 0)),
      items,
    },
    playtimeMs: Math.max(0, asNumber(r.playtimeMs, 0)),
    totalCorrect: Math.max(0, asNumber(r.totalCorrect, 0)),
    totalWrong: Math.max(0, asNumber(r.totalWrong, 0)),
    skillStats: normalizeSkillStats(r.skillStats),
    history: normalizeHistory(r.history),
    updatedAt: Math.max(0, asNumber(r.updatedAt, 0)),
  };
}

export function saveKey(profileId: string): string {
  return "kidsStudy.kazuQuest.profileData." + profileId;
}

export function loadSave(profileId: string): SaveData {
  return normalizeSave(readJSON(saveKey(profileId)));
}

export function persistSave(profileId: string, data: SaveData): void {
  writeJSON(saveKey(profileId), { ...data, updatedAt: Date.now() });
}

export function deleteSave(profileId: string): void {
  try {
    localStorage.removeItem(saveKey(profileId));
  } catch {
    /* noop */
  }
}

/*
 * 全解答箇所 (戦闘呪文 / 習得テスト / とっくん / 宝箱 / おつり) から呼ぶ。
 * 兄弟アプリ (マスマティクス設計) と同型のテレメトリ。
 */
export function recordAnswer(
  data: SaveData,
  skillId: string,
  correct: boolean,
  ms: number,
): SaveData {
  const prev = data.skillStats[skillId] ?? { c: 0, w: 0, recentMs: [] };
  return {
    ...data,
    totalCorrect: data.totalCorrect + (correct ? 1 : 0),
    totalWrong: data.totalWrong + (correct ? 0 : 1),
    skillStats: {
      ...data.skillStats,
      [skillId]: {
        c: prev.c + (correct ? 1 : 0),
        w: prev.w + (correct ? 0 : 1),
        recentMs: [...prev.recentMs, ms].slice(-RECENT_MS_CAP),
      },
    },
  };
}

export function addHistory(data: SaveData, entry: HistoryEntry): SaveData {
  return {
    ...data,
    history: [...data.history, entry].slice(-HISTORY_CAP),
  };
}
