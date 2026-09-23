/*
 * ぼうけんのせいせき (KQ-14) の集計 — 純関数 (Vitest 対象)。
 * 表示は components/StatsScreen.tsx が行う。
 *
 * データ源:
 * - save.skillStats: カズクエ内の全解答 (戦闘・扉クイズ・おだい・ふくしゅう)。学年別と にがて の主
 * - 共有学習ログ (kidsStudy.learning.v1): 日別の練習量。skills は "kq_" 接頭辞で
 *   カズクエ分だけを拾い、セーブに無いスキルの補完に使う (セーブ消去後の名残など)
 * - save.chapter.cleared: 6つの数晶の点灯
 */

import type { SaveData } from "./save";
import type { LearningLog } from "./learning";
import { recentDaily } from "./learning";
import { SKILLS } from "./curriculum";
import { formatPlaytime } from "./format";
import { goalsView, isAheadSkill, isCan } from "./goals";

export const STATS_GRADES = [1, 2, 3, 4, 5, 6] as const;
export const STATS_DAILY_DAYS = 14;
export const WEAK_MIN_ATTEMPTS = 5;
export const WEAK_LIMIT = 3;
/* 帯グラフの子ども向けラベル */
export const ACCURACY_GOOD = 80;
export const ACCURACY_WEAK = 60;

export interface GradeStat {
  grade: number;
  label: string;
  correct: number;
  wrong: number;
  /* 0-100。未出題は 0 */
  accuracy: number;
}

export interface WeakStat {
  skillId: string;
  label: string;
  accuracy: number;
  attempts: number;
}

export interface DailyStat {
  date: string;
  correct: number;
}

export interface StatsData {
  byGrade: GradeStat[];
  weak: WeakStat[];
  daily: DailyStat[];
  /* 数晶: index n-1 が第 n 章クリアで点灯 */
  orbs: boolean[];
  playtime: string;
  totals: { correct: number; wrong: number };
  /* さきどり (lib/goals.ts): がっこうの学年より上で「できる」に した単元 */
  sakidori: SakidoriStat;
}

export interface SakidoriStat {
  schoolGrade: number | null;
  /* 3単元が ぜんぶ できる いちばん上の章 (= 学年) */
  reachedGrade: number;
  units: { skillId: string; label: string; grade: number }[];
}

export function buildSakidori(save: SaveData): SakidoriStat {
  return {
    schoolGrade: save.settings.schoolGrade,
    reachedGrade: goalsView(save).reachedGrade,
    units: SKILLS.filter((s) => isAheadSkill(save, s.id) && isCan(save, s.id))
      .map((s) => ({ skillId: s.id, label: s.label, grade: s.grade }))
      .sort((a, b) => b.grade - a.grade),
  };
}

interface Counts {
  c: number;
  w: number;
}

const SKILL_BY_ID = new Map(SKILLS.map((s) => [s.id, s]));

function accuracyOf({ c, w }: Counts): number {
  const attempts = c + w;
  return attempts > 0 ? Math.round((c / attempts) * 100) : 0;
}

/* 帯グラフの評価ラベル。未出題は「まだ」 */
export function accuracyLabel(stat: Pick<GradeStat, "correct" | "wrong" | "accuracy">): string {
  if (stat.correct + stat.wrong === 0) return "まだ";
  if (stat.accuracy >= ACCURACY_GOOD) return "とくい";
  if (stat.accuracy < ACCURACY_WEAK) return "もうすこし";
  return "";
}

/*
 * スキル別の正誤 (セーブ優先)。セーブに無いスキルだけ共有ログの
 * "<prefix><skillId>" から補完する — 両方に記録される解答を二重に数えない。
 */
function mergedSkillCounts(
  save: SaveData,
  log: LearningLog | null,
  prefix: string,
): Record<string, Counts> {
  const out: Record<string, Counts> = {};
  for (const [id, s] of Object.entries(save.skillStats)) {
    out[id] = { c: s.c, w: s.w };
  }
  if (!log) return out;
  for (const [key, s] of Object.entries(log.skills)) {
    if (!key.startsWith(prefix)) continue;
    const id = key.slice(prefix.length);
    if (out[id]) continue;
    out[id] = { c: s.c, w: s.w };
  }
  return out;
}

function buildByGrade(counts: Record<string, Counts>): GradeStat[] {
  return STATS_GRADES.map((grade) => {
    const sum = Object.entries(counts).reduce<Counts>(
      (acc, [id, n]) =>
        SKILL_BY_ID.get(id)?.grade === grade ? { c: acc.c + n.c, w: acc.w + n.w } : acc,
      { c: 0, w: 0 },
    );
    return {
      grade,
      label: `${grade}ねんせい`,
      correct: sum.c,
      wrong: sum.w,
      accuracy: accuracyOf(sum),
    };
  });
}

/* にがて: 試行 ≥ WEAK_MIN_ATTEMPTS を正答率の低い順 (同率は試行の多い順) */
function buildWeak(counts: Record<string, Counts>): WeakStat[] {
  return Object.entries(counts)
    .map(([skillId, n]) => ({
      skillId,
      label: SKILL_BY_ID.get(skillId)?.label ?? skillId,
      accuracy: accuracyOf(n),
      attempts: n.c + n.w,
    }))
    .filter((s) => s.attempts >= WEAK_MIN_ATTEMPTS)
    .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)
    .slice(0, WEAK_LIMIT);
}

function buildDaily(log: LearningLog | null, now: number): DailyStat[] {
  if (!log) {
    return recentDaily({ version: 1, skills: {}, daily: {} }, STATS_DAILY_DAYS, now).map(
      ({ date }) => ({ date, correct: 0 }),
    );
  }
  return recentDaily(log, STATS_DAILY_DAYS, now).map(({ date, c }) => ({ date, correct: c }));
}

export function buildStats(
  save: SaveData,
  learningLog: LearningLog | null,
  profileAppPrefix = "kq_",
  now: number = Date.now(),
): StatsData {
  const counts = mergedSkillCounts(save, learningLog, profileAppPrefix);
  const totals = Object.values(counts).reduce<Counts>(
    (acc, n) => ({ c: acc.c + n.c, w: acc.w + n.w }),
    { c: 0, w: 0 },
  );
  return {
    sakidori: buildSakidori(save),
    byGrade: buildByGrade(counts),
    weak: buildWeak(counts),
    daily: buildDaily(learningLog, now),
    orbs: STATS_GRADES.map((n) => save.chapter.cleared.includes(n)),
    playtime: formatPlaytime(save.playtimeMs),
    totals: { correct: totals.c, wrong: totals.w },
  };
}
