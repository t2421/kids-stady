/*
 * ゲーム横断の共有学習ログ — 全アプリ共通基盤の【正典ソース】。
 * キー: kidsStudy.learning.v1.<プロフィールid> (契約は docs/save-data.md §4)。
 *
 * 利用方法:
 * - Next系アプリ (mathematics / kazu-quest): このファイルを直接 import する
 *   (mathematics は src/lib/learning.ts が再エクスポートしている)
 * - 静的アプリ (keisan-shooter): shared/js/learning.js を <script> で読む。
 *   これは本ファイルから `npm run gen:learning` (apps/mathematics) で生成した
 *   バンドルであり、直接編集してはならない。
 */

/* ---- storage (自己完結: localStorage が無い環境でも落ちない) ---- */

function readJSON(key: string): unknown {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(key);
    return raw == null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ストレージが使えない環境ではあきらめる */
  }
}

function removeKey(key: string): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}


export const LEARNING_MS_LIMIT = 20;
export const LEARNING_DAILY_LIMIT = 60;

export interface LearningSkill {
  app: string; // 記録元アプリ (mathematics / keisan-shooter …)
  c: number; // 累計正解
  w: number; // 累計誤答
  /* 直近の解答時間ms (0=計測なし、平均計算から除外)。cap LEARNING_MS_LIMIT */
  ms: number[];
  lastTs: number;
}

export interface LearningDaily {
  c: number;
  w: number;
}

export interface LearningLog {
  version: 1;
  skills: Record<string, LearningSkill>;
  /* "YYYY-MM-DD" → その日の正誤数。cap LEARNING_DAILY_LIMIT 日 */
  daily: Record<string, LearningDaily>;
}

function key(profileId: string): string {
  return "kidsStudy.learning.v1." + profileId;
}

export function emptyLog(): LearningLog {
  return { version: 1, skills: {}, daily: {} };
}

function toCount(v: unknown): number {
  const n = typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : 0;
  return n > 0 ? n : 0;
}

export function normalizeLog(raw: unknown): LearningLog {
  const base = emptyLog();
  if (typeof raw !== "object" || raw === null) return base;
  const obj = raw as Partial<LearningLog>;

  const skills: Record<string, LearningSkill> = {};
  if (typeof obj.skills === "object" && obj.skills !== null) {
    for (const [id, v] of Object.entries(obj.skills)) {
      if (typeof v !== "object" || v === null) continue;
      const s = v as Partial<LearningSkill>;
      skills[id] = {
        app: typeof s.app === "string" ? s.app : "unknown",
        c: toCount(s.c),
        w: toCount(s.w),
        ms: Array.isArray(s.ms)
          ? s.ms.filter((n): n is number => typeof n === "number" && n >= 0).slice(-LEARNING_MS_LIMIT)
          : [],
        lastTs: toCount(s.lastTs),
      };
    }
  }

  const daily: Record<string, LearningDaily> = {};
  if (typeof obj.daily === "object" && obj.daily !== null) {
    for (const [date, v] of Object.entries(obj.daily)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      if (typeof v !== "object" || v === null) continue;
      const d = v as Partial<LearningDaily>;
      daily[date] = { c: toCount(d.c), w: toCount(d.w) };
    }
  }

  return { version: 1, skills, daily };
}

export function loadLearning(profileId: string): LearningLog {
  return normalizeLog(readJSON(key(profileId)));
}

export function removeLearning(profileId: string): void {
  removeKey(key(profileId));
}

export function dateKey(ts: number): string {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/* 日別エントリが上限を超えたら古い日付から削る */
function trimDaily(daily: Record<string, LearningDaily>): Record<string, LearningDaily> {
  const dates = Object.keys(daily).sort();
  if (dates.length <= LEARNING_DAILY_LIMIT) return daily;
  const keep = new Set(dates.slice(-LEARNING_DAILY_LIMIT));
  const out: Record<string, LearningDaily> = {};
  for (const d of dates) if (keep.has(d)) out[d] = daily[d];
  return out;
}

/* 1回の解答を記録して保存する (全アプリ共通の入口) */
export function recordLearning(
  profileId: string,
  app: string,
  skillId: string,
  correct: boolean,
  elapsedMs: number,
  now: number = Date.now(),
): LearningLog {
  const log = loadLearning(profileId);
  const prev = log.skills[skillId] ?? { app, c: 0, w: 0, ms: [], lastTs: 0 };
  const ms = elapsedMs > 0 ? [...prev.ms, Math.round(elapsedMs)].slice(-LEARNING_MS_LIMIT) : prev.ms;
  const skills = {
    ...log.skills,
    [skillId]: {
      app,
      c: prev.c + (correct ? 1 : 0),
      w: prev.w + (correct ? 0 : 1),
      ms,
      lastTs: now,
    },
  };
  const dk = dateKey(now);
  const day = log.daily[dk] ?? { c: 0, w: 0 };
  const daily = trimDaily({
    ...log.daily,
    [dk]: { c: day.c + (correct ? 1 : 0), w: day.w + (correct ? 0 : 1) },
  });
  const next: LearningLog = { version: 1, skills, daily };
  writeJSON(key(profileId), next);
  return next;
}

/* ---- 分析ヘルパ (せいせき画面用) ---- */

export interface SkillReport {
  skillId: string;
  app: string;
  attempts: number;
  accuracy: number; // 0-100
  avgMs: number; // 0 = 計測なし
  /* 直近の速度トレンド: 負 = はやくなっている (ms減少) */
  trendMs: number;
}

export function skillReports(log: LearningLog): SkillReport[] {
  return Object.entries(log.skills).map(([skillId, s]) => {
    const attempts = s.c + s.w;
    const timed = s.ms.filter((n) => n > 0);
    const avgMs = timed.length ? Math.round(timed.reduce((a, b) => a + b, 0) / timed.length) : 0;
    let trendMs = 0;
    if (timed.length >= 6) {
      const half = Math.floor(timed.length / 2);
      const first = timed.slice(0, half);
      const second = timed.slice(half);
      const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
      trendMs = Math.round(avg(second) - avg(first));
    }
    return {
      skillId,
      app: s.app,
      attempts,
      accuracy: attempts ? Math.round((s.c / attempts) * 100) : 0,
      avgMs,
      trendMs,
    };
  });
}

/* にがてスキル: 試行が minAttempts 以上で正答率が低い順 */
export function weakSkills(log: LearningLog, minAttempts = 5, limit = 3): SkillReport[] {
  return skillReports(log)
    .filter((r) => r.attempts >= minAttempts)
    .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)
    .slice(0, limit);
}

/* 直近n日の日別集計 (古い→新しい順、記録のない日は0) */
export function recentDaily(
  log: LearningLog,
  days: number,
  now: number = Date.now(),
): Array<{ date: string; c: number; w: number }> {
  const out: Array<{ date: string; c: number; w: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const dk = dateKey(now - i * 86400000);
    const d = log.daily[dk] ?? { c: 0, w: 0 };
    out.push({ date: dk, c: d.c, w: d.w });
  }
  return out;
}
