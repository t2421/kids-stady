/*
 * 解答テレメトリ (スキル別の正誤・解答時間・プレイ履歴) — 全アプリ共通の【正典ソース】。
 * 契約は docs/save-data.md §2。
 *
 * セーブデータの中身そのものはアプリごとに自由 (ゲームの進行状況は共有しない)。
 * 共有するのは「どう数えるか」だけ:
 *   - スキル別集計 SkillStat の形と上限
 *   - 履歴エントリが最低限持つ項目 (HistoryEntryBase)
 *   - 集計を進める純関数 (recordAnswer / addHistory)
 *   - 壊れた localStorage を読んだときの正規化
 *
 * アプリ側は自分のセーブ型にこれらを混ぜて使う (例: kazu-quest の SaveData は
 * AnswerTelemetry を満たしつつ chapter/party/inventory を持つ)。
 */

/* スキルごとに保持する直近の解答時間の本数 */
export const RECENT_MS_CAP = 20;
/* プレイ履歴の保持件数 (古いものから捨てる) */
export const HISTORY_CAP = 50;

export interface SkillStat {
  c: number; // 累計正解
  w: number; // 累計誤答
  recentMs: number[]; // 直近の解答時間ms (cap RECENT_MS_CAP)
}

/* どのアプリのプレイ履歴も必ず持つ項目。各アプリはこれを extend して
   自分の文脈 (学年 / 章 / ステージ名 …) を足す */
export interface HistoryEntryBase {
  ts: number;
  correct: number;
  wrong: number;
  avgAnswerMs: number; // 解答がないランは 0
}

/* 解答テレメトリを持つセーブの最小形 */
export interface AnswerTelemetry {
  totalCorrect: number;
  totalWrong: number;
  skillStats: Record<string, SkillStat>;
}

/* ---- 正規化 (壊れた・古い localStorage を読んでも落ちないため) ---- */

/* 非負整数へ丸める。数値でない・NaN・負数はすべて 0 */
export function toCount(v: unknown): number {
  const n = typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : 0;
  return n > 0 ? n : 0;
}

export function normalizeSkillStats(raw: unknown): Record<string, SkillStat> {
  if (typeof raw !== "object" || raw === null) return {};
  const out: Record<string, SkillStat> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value !== "object" || value === null) continue;
    const v = value as Record<string, unknown>;
    out[key] = {
      c: toCount(v.c),
      w: toCount(v.w),
      recentMs: (Array.isArray(v.recentMs) ? v.recentMs : [])
        .filter((n): n is number => typeof n === "number" && Number.isFinite(n) && n >= 0)
        .slice(-RECENT_MS_CAP),
    };
  }
  return out;
}

/*
 * 履歴配列の正規化。共通項目は本関数が埋め、アプリ固有の項目は toEntry で足す。
 * toEntry が null を返した行は捨てる (必須項目が欠けている等)。
 */
export function normalizeHistory<H extends HistoryEntryBase>(
  raw: unknown,
  toEntry: (row: Record<string, unknown>, base: HistoryEntryBase) => H | null,
): H[] {
  if (!Array.isArray(raw)) return [];
  const out: H[] = [];
  for (const row of raw) {
    if (typeof row !== "object" || row === null) continue;
    const r = row as Record<string, unknown>;
    const entry = toEntry(r, {
      ts: toCount(r.ts),
      correct: toCount(r.correct),
      wrong: toCount(r.wrong),
      avgAnswerMs: toCount(r.avgAnswerMs),
    });
    if (entry !== null) out.push(entry);
  }
  return out.slice(-HISTORY_CAP);
}

/* ---- 更新 (純関数: 新しいセーブを返す) ---- */

/*
 * 全解答箇所から呼ぶ共通テレメトリ更新。
 * elapsedMs が計測できない場合も 0 として積む (呼び出し側で分岐しない)。
 */
export function recordAnswer<S extends AnswerTelemetry>(
  save: S,
  skillId: string,
  correct: boolean,
  elapsedMs: number,
): S {
  const prev = save.skillStats[skillId] ?? { c: 0, w: 0, recentMs: [] };
  const stat: SkillStat = {
    c: prev.c + (correct ? 1 : 0),
    w: prev.w + (correct ? 0 : 1),
    recentMs: [...prev.recentMs, toCount(elapsedMs)].slice(-RECENT_MS_CAP),
  };
  return {
    ...save,
    totalCorrect: save.totalCorrect + (correct ? 1 : 0),
    totalWrong: save.totalWrong + (correct ? 0 : 1),
    skillStats: { ...save.skillStats, [skillId]: stat },
  };
}

export function addHistory<H, S extends { history: H[] }>(save: S, entry: H): S {
  return { ...save, history: [...save.history, entry].slice(-HISTORY_CAP) };
}
