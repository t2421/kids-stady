/*
 * カズクエのゲーム進行データ (プロフィールごとに単一オートセーブ)。
 * キー: kidsStudy.kazuQuest.profileData.<プロフィールid>
 * 読み込みは必ず normalize を通す (docs/save-data.md §2)。
 */

import { readJSON, writeJSON } from "./profiles";
import { memberStats } from "./battle/members";
import type { AnswerTelemetry, HistoryEntryBase, SkillStat } from "./telemetry";
import { normalizeHistory, normalizeSkillStats, toCount } from "./telemetry";
import type { MistakeEntry } from "./mistakes";
import { normalizeMistakes } from "./mistakes";

/* 設定 (音のおん/オフ + 音量)。既定はすべてオン・音量は「ふつう」。
   sound: false は volume と独立した完全ミュート (AU-01) */
/* 戦闘で こたえる じかん: ふつう / ゆっくり (1.6倍) / なし (タイマーを出さない) */
export type AnswerTimeMode = "normal" | "slow" | "off";

export interface SaveSettings {
  sound: boolean;
  /* 0: オフ / 1: ちいさい / 2: ふつう / 3: おおきい (既定 2) */
  volume: 0 | 1 | 2 | 3;
  /* 戦闘の制限時間 (lib/answerTime.ts)。小1・小2 を えらぶと ゆっくり になる */
  answerTime: AnswerTimeMode;
  /*
   * がっこうの 学年 (1〜6)。null = きいていない/ひみつ。
   * 「さきどり」(学年より上の単元) の判定と 既定値にだけ使い、進行は しばらない
   */
  schoolGrade: number | null;
}

export const DEFAULT_SETTINGS: SaveSettings = {
  sound: true,
  volume: 2,
  answerTime: "normal",
  schoolGrade: null,
};

/* 集計の作法は全アプリ共通 (docs/save-data.md §2) — 再エクスポートして
   アプリ内からは save.ts 経由で使えるようにする */
export type { SkillStat };
export {
  HISTORY_CAP,
  RECENT_MS_CAP,
  addHistory,
  recordAnswer,
} from "./telemetry";

export type Dir = "up" | "down" | "left" | "right";

/*
 * 単元の習熟状態 (学びの設計 LP-04)。none < practicing < can < mastered の順で進む。
 * reviewDue は間隔復習 (src/lib/mastery.ts) の次回期日、streak は連続合格回数。
 * 実際の遷移ロジックは src/lib/mastery.ts の純関数群にある — ここは型と正規化のみ
 */
export type MasteryState = "none" | "practicing" | "can" | "mastered";

export interface MasteryEntry {
  state: MasteryState;
  reviewDue: number | null;
  streak: number;
  passedAt: number | null;
}

const MASTERY_STATES: MasteryState[] = ["none", "practicing", "can", "mastered"];

/* 装備部位。アイテム定義 (content/types.ts) からも参照される */
export type EquipSlot = "weapon" | "armor" | "shield";

export const EQUIP_SLOTS: EquipSlot[] = ["weapon", "armor", "shield"];

/* 部位 → 装備中の itemId。装備中のアイテムは inventory.items から出ている */
export type Equipment = Partial<Record<EquipSlot, string>>;

export interface PartyMember {
  memberId: string;
  level: number;
  exp: number;
  hp: number;
  mp: number;
  learnedSpells: string[];
  equipment: Equipment;
}

/* 共通項目 (ts/correct/wrong/avgAnswerMs) + カズクエ固有の文脈 */
export interface HistoryEntry extends HistoryEntryBase {
  kind: "battle" | "test";
  chapter: number;
}

export interface SaveData extends AnswerTelemetry {
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
  /* まちがいノート: 戦闘で間違えた問題、新しい順 (最大 20 件 — lib/mistakes.ts) */
  mistakes: MistakeEntry[];
  /* 単元の習熟状態。skillId → MasteryEntry。欠損は {} (lib/mastery.ts) */
  mastery: Record<string, MasteryEntry>;
  settings: SaveSettings;
  updatedAt: number;
}

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
        equipment: {},
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
    mistakes: [],
    mastery: {},
    settings: { ...DEFAULT_SETTINGS },
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

function normalizeEquipment(raw: unknown): Equipment {
  if (typeof raw !== "object" || raw === null) return {};
  const out: Equipment = {};
  for (const slot of EQUIP_SLOTS) {
    const v = (raw as Record<string, unknown>)[slot];
    if (typeof v === "string" && v) out[slot] = v;
  }
  return out;
}

function normalizeParty(raw: unknown, fallback: PartyMember[]): PartyMember[] {
  if (!Array.isArray(raw)) return fallback;
  const members = raw
    .filter(
      (m): m is Record<string, unknown> =>
        typeof m === "object" && m !== null &&
        typeof (m as { memberId?: unknown }).memberId === "string",
    )
    .map((m) => {
      const memberId = m.memberId as string;
      const level = Math.max(1, asNumber(m.level, 1));
      /* hp/mp が欠損・破損していたら満タンで復帰させる
         (瀕死の 1 で復帰させると次の戦闘で理不尽に倒れる) */
      const stats = memberStats(memberId, level);
      return {
        memberId,
        level,
        exp: Math.max(0, asNumber(m.exp, 0)),
        hp: Math.max(0, asNumber(m.hp, stats.maxHp)),
        mp: Math.max(0, asNumber(m.mp, stats.maxMp)),
        learnedSpells: asStringArray(m.learnedSpells),
        equipment: normalizeEquipment(m.equipment),
      };
    });
  return members.length > 0 ? members : fallback;
}

/* 共通 normalizeHistory にアプリ固有項目 (kind/chapter) を足すアダプタ */
function normalizeKazuHistory(raw: unknown): HistoryEntry[] {
  return normalizeHistory<HistoryEntry>(raw, (row, base) => ({
    ...base,
    kind: row.kind === "test" ? "test" : "battle",
    chapter: Math.max(1, toCount(row.chapter)),
  }));
}

function normalizeSettings(raw: unknown): SaveSettings {
  const r = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const volume = r.volume;
  return {
    sound: typeof r.sound === "boolean" ? r.sound : DEFAULT_SETTINGS.sound,
    volume:
      volume === 0 || volume === 1 || volume === 2 || volume === 3
        ? volume
        : DEFAULT_SETTINGS.volume,
    answerTime:
      r.answerTime === "normal" || r.answerTime === "slow" || r.answerTime === "off"
        ? r.answerTime
        : DEFAULT_SETTINGS.answerTime,
    schoolGrade:
      typeof r.schoolGrade === "number" &&
      Number.isInteger(r.schoolGrade) &&
      r.schoolGrade >= 1 &&
      r.schoolGrade <= 6
        ? r.schoolGrade
        : null,
  };
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

function asNonNegativeInt(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isInteger(v) && v >= 0 ? v : fallback;
}

function asNullableFiniteNumber(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function normalizeMasteryEntry(raw: unknown): MasteryEntry | null {
  /* エントリそのものがオブジェクトでなければゴミとして捨てる */
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  return {
    state: MASTERY_STATES.includes(r.state as MasteryState) ? (r.state as MasteryState) : "none",
    reviewDue: asNullableFiniteNumber(r.reviewDue),
    streak: asNonNegativeInt(r.streak, 0),
    passedAt: asNullableFiniteNumber(r.passedAt),
  };
}

/* 欠損・破損したセーブから安全に復元する。ゴミの行 (キーが空・値がオブジェクト
   でない 等) は落とし、オブジェクトとして残った行は欠けた項目を既定値で埋める
   (normalizeMistakes と同じ作法) */
export function normalizeMastery(raw: unknown): Record<string, MasteryEntry> {
  if (typeof raw !== "object" || raw === null) return {};
  const out: Record<string, MasteryEntry> = {};
  for (const [skillId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!skillId) continue;
    const entry = normalizeMasteryEntry(value);
    if (entry) out[skillId] = entry;
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
    history: normalizeKazuHistory(r.history),
    mistakes: normalizeMistakes(r.mistakes),
    mastery: normalizeMastery(r.mastery),
    settings: normalizeSettings(r.settings),
    updatedAt: Math.max(0, asNumber(r.updatedAt, 0)),
  };
}

export function saveKey(profileId: string): string {
  return "kidsStudy.kazuQuest.profileData." + profileId;
}

export function loadSave(profileId: string): SaveData {
  return normalizeSave(readJSON(saveKey(profileId)));
}

/*
 * そのプロフィールに書き出し済みのセーブがあるか (タイトルの「つづきから」表示用)。
 * 一度でも persistSave されていれば true。壊れた JSON は読めない = 無いのと同じ扱い。
 */
export function hasSave(profileId: string): boolean {
  return readJSON(saveKey(profileId)) !== null;
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

