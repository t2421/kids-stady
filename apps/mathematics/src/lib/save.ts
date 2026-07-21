/*
 * マスマティクスのプレイヤーごとのゲーム進行データ。
 * キー: kidsStudy.mathematics.profileData.<プロフィールid> (docs/save-data.md)
 * 更新は「新しいオブジェクトを返す」純関数で行い、persistSave で書き込む。
 */

import { readJSON, removeKey, writeJSON } from "./profiles";

export const HISTORY_LIMIT = 50;
export const RECENT_MS_LIMIT = 20;

export type PlayMode = "input" | "output";

export interface HistoryEntry {
  ts: number;
  grade: number;
  mode: PlayMode;
  stageName: string;
  correct: number;
  wrong: number;
  accuracy: number; // 0-100 (整数)
  avgAnswerMs: number; // 平均解答時間。解答がないランは 0
  score: number; // インプットステージは 0
}

export interface SkillStat {
  c: number; // 累計正解
  w: number; // 累計誤答
  recentMs: number[]; // 直近の解答時間 (cap RECENT_MS_LIMIT)
}

export interface GradeProgress {
  inputMedals: Record<string, number>; // lessonId -> 0(未) / 1🥉 / 2🥈 / 3🥇
  outputCleared: boolean;
  bestScore: number;
}

export interface MathSave {
  version: 1;
  unlockedGrade: number;
  grades: Record<number, GradeProgress>;
  totalCorrect: number;
  totalWrong: number;
  history: HistoryEntry[];
  skillStats: Record<string, SkillStat>;
}

function dataKey(profileId: string): string {
  return "kidsStudy.mathematics.profileData." + profileId;
}

export function defaultSave(): MathSave {
  return {
    version: 1,
    unlockedGrade: 1,
    grades: {},
    totalCorrect: 0,
    totalWrong: 0,
    history: [],
    skillStats: {},
  };
}

export function defaultGradeProgress(): GradeProgress {
  return { inputMedals: {}, outputCleared: false, bestScore: 0 };
}

function toCount(v: unknown): number {
  const n = typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : 0;
  return n > 0 ? n : 0;
}

function normalizeGradeProgress(raw: unknown): GradeProgress {
  const base = defaultGradeProgress();
  if (typeof raw !== "object" || raw === null) return base;
  const obj = raw as Partial<GradeProgress>;
  const inputMedals: Record<string, number> = {};
  if (typeof obj.inputMedals === "object" && obj.inputMedals !== null) {
    for (const [k, v] of Object.entries(obj.inputMedals)) {
      const medal = toCount(v);
      if (medal > 0) inputMedals[k] = Math.min(medal, 3);
    }
  }
  return {
    inputMedals,
    outputCleared: obj.outputCleared === true,
    bestScore: toCount(obj.bestScore),
  };
}

function normalizeSkillStat(raw: unknown): SkillStat {
  if (typeof raw !== "object" || raw === null) return { c: 0, w: 0, recentMs: [] };
  const obj = raw as Partial<SkillStat>;
  return {
    c: toCount(obj.c),
    w: toCount(obj.w),
    recentMs: Array.isArray(obj.recentMs)
      ? obj.recentMs.filter((n): n is number => typeof n === "number" && n >= 0).slice(-RECENT_MS_LIMIT)
      : [],
  };
}

function normalizeHistoryEntry(raw: unknown): HistoryEntry | null {
  if (typeof raw !== "object" || raw === null) return null;
  const obj = raw as Partial<HistoryEntry>;
  if (typeof obj.ts !== "number" || typeof obj.grade !== "number") return null;
  return {
    ts: obj.ts,
    grade: obj.grade,
    mode: obj.mode === "input" ? "input" : "output",
    stageName: typeof obj.stageName === "string" ? obj.stageName : "",
    correct: toCount(obj.correct),
    wrong: toCount(obj.wrong),
    accuracy: Math.min(toCount(obj.accuracy), 100),
    avgAnswerMs: toCount(obj.avgAnswerMs),
    score: toCount(obj.score),
  };
}

export function normalizeSave(raw: unknown): MathSave {
  const base = defaultSave();
  if (typeof raw !== "object" || raw === null) return base;
  const obj = raw as Partial<MathSave>;

  const grades: Record<number, GradeProgress> = {};
  if (typeof obj.grades === "object" && obj.grades !== null) {
    for (const [k, v] of Object.entries(obj.grades)) {
      const g = Number(k);
      if (Number.isInteger(g) && g >= 1 && g <= 6) grades[g] = normalizeGradeProgress(v);
    }
  }

  const skillStats: Record<string, SkillStat> = {};
  if (typeof obj.skillStats === "object" && obj.skillStats !== null) {
    for (const [k, v] of Object.entries(obj.skillStats)) {
      skillStats[k] = normalizeSkillStat(v);
    }
  }

  const history = Array.isArray(obj.history)
    ? obj.history
        .map(normalizeHistoryEntry)
        .filter((e): e is HistoryEntry => e !== null)
        .slice(-HISTORY_LIMIT)
    : [];

  const unlocked = toCount(obj.unlockedGrade);
  return {
    version: 1,
    unlockedGrade: Math.min(Math.max(unlocked, 1), 6),
    grades,
    totalCorrect: toCount(obj.totalCorrect),
    totalWrong: toCount(obj.totalWrong),
    history,
    skillStats,
  };
}

export function loadSave(profileId: string): MathSave {
  return normalizeSave(readJSON(dataKey(profileId)));
}

export function persistSave(profileId: string, save: MathSave): void {
  writeJSON(dataKey(profileId), save);
}

export function removeSave(profileId: string): void {
  removeKey(dataKey(profileId));
}

/* ---- 純関数の更新系 (新しい MathSave を返す) ---- */

export function recordAnswer(
  save: MathSave,
  skillId: string,
  correct: boolean,
  elapsedMs: number,
): MathSave {
  const prev = save.skillStats[skillId] ?? { c: 0, w: 0, recentMs: [] };
  const stat: SkillStat = {
    c: prev.c + (correct ? 1 : 0),
    w: prev.w + (correct ? 0 : 1),
    recentMs: [...prev.recentMs, Math.max(0, Math.round(elapsedMs))].slice(-RECENT_MS_LIMIT),
  };
  return {
    ...save,
    totalCorrect: save.totalCorrect + (correct ? 1 : 0),
    totalWrong: save.totalWrong + (correct ? 0 : 1),
    skillStats: { ...save.skillStats, [skillId]: stat },
  };
}

export function addHistory(save: MathSave, entry: HistoryEntry): MathSave {
  return { ...save, history: [...save.history, entry].slice(-HISTORY_LIMIT) };
}

export function setLessonMedal(
  save: MathSave,
  grade: number,
  lessonId: string,
  medal: number,
): MathSave {
  const progress = save.grades[grade] ?? defaultGradeProgress();
  const current = progress.inputMedals[lessonId] ?? 0;
  const next: GradeProgress = {
    ...progress,
    inputMedals: { ...progress.inputMedals, [lessonId]: Math.max(current, medal) },
  };
  return { ...save, grades: { ...save.grades, [grade]: next } };
}

export function markOutputCleared(save: MathSave, grade: number, score: number): MathSave {
  const progress = save.grades[grade] ?? defaultGradeProgress();
  const next: GradeProgress = {
    ...progress,
    outputCleared: true,
    bestScore: Math.max(progress.bestScore, score),
  };
  return {
    ...save,
    grades: { ...save.grades, [grade]: next },
    unlockedGrade: Math.min(Math.max(save.unlockedGrade, grade + 1), 6),
  };
}

/* その学年の全レッスンにメダル (🥉以上) が付いたらアウトプット解放 */
export function isOutputUnlocked(save: MathSave, grade: number, lessonIds: string[]): boolean {
  const progress = save.grades[grade];
  if (!progress) return false;
  return lessonIds.every((id) => (progress.inputMedals[id] ?? 0) >= 1);
}
