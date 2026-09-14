/*
 * ふくしゅうのほこら (設計 A6): 弱点スキル上位3つから10問の復習クエスト。
 * 弱点の選び方は shared/learning-core の weakSkills と同じ規則
 * (試行 min 回以上のうち 正答率が低い順 → 同率なら試行数が多い順)。
 * 足りない分は候補 (章の attackSkillIds → 章の学年までの実装済みスキル) で埋める。
 */

import type { ChapterDef } from "../../content/types";
import type { SkillStat } from "../save";
import { skillIdsForGrades } from "./gradePool";
import { getDrillQuest } from "./drills";

export const REVIEW_QUESTIONS = 10;
/* この正解数以上で ひらめきメダル */
export const REVIEW_PASS_CORRECT = 8;
/* おだい (drill) の単価が引けないときの 1問あたりゴールド */
const FALLBACK_GOLD_PER_CORRECT = 5;
export const REVIEW_MEDAL_ITEM_ID = "hiramekiMedal";

function attempts(stat: SkillStat | undefined): number {
  return stat ? stat.c + stat.w : 0;
}

function accuracy(stat: SkillStat): number {
  const total = stat.c + stat.w;
  return total === 0 ? 1 : stat.c / total;
}

/*
 * 弱点スキル id を最大 limit 件。candidateIds の中で試行 min 回以上のものを
 * 正答率の低い順に取り、足りなければ candidateIds の並び順で埋める。
 * candidateIds の重複は除き、順序は保つ。
 */
export function weakSkillIds(
  stats: Record<string, SkillStat>,
  candidateIds: readonly string[],
  min = 5,
  limit = 3,
): string[] {
  const candidates = [...new Set(candidateIds)];
  const weak = candidates
    .filter((id) => attempts(stats[id]) >= min)
    .sort(
      (a, b) =>
        accuracy(stats[a]) - accuracy(stats[b]) ||
        attempts(stats[b]) - attempts(stats[a]),
    )
    .slice(0, limit);
  if (weak.length >= limit) return weak;
  const fill = candidates.filter((id) => !weak.includes(id));
  return [...weak, ...fill].slice(0, limit);
}

/*
 * 復習の候補: 章の通常攻撃スキル (基礎) → 章の学年以下の実装済みスキル。
 * 章定義が無いときは学年 1〜6 すべてを候補にする。
 */
export function reviewCandidateIds(chapter: ChapterDef | undefined): string[] {
  const maxGrade = chapter?.grade ?? 6;
  const grades = Array.from({ length: maxGrade }, (_, i) => i + 1);
  return [...new Set([...(chapter?.attackSkillIds ?? []), ...skillIdsForGrades(grades)])];
}

/* ほこらで出す復習スキル (弱点3つ)。候補が無ければ空 */
export function reviewSkillIds(
  stats: Record<string, SkillStat>,
  chapter: ChapterDef | undefined,
): string[] {
  return weakSkillIds(stats, reviewCandidateIds(chapter));
}

/*
 * 1問あたりのゴールド: 復習スキルの おだい単価の最大 (弱点をやり直すごほうび)。
 * おだいに無いスキルだけなら FALLBACK。
 */
export function reviewGoldPerCorrect(skillIds: readonly string[]): number {
  const rates = skillIds
    .map((id) => getDrillQuest(id)?.goldPerCorrect)
    .filter((g): g is number => typeof g === "number");
  return rates.length > 0 ? Math.max(...rates) : FALLBACK_GOLD_PER_CORRECT;
}

/* "review-quest-finished" (React → Phaser) のペイロード */
export interface ReviewQuestResult {
  skillIds: string[];
  correct: number;
  total: number;
  gold: number;
  medal: boolean;
}

export interface ReviewReward {
  gold: number;
  /* ひらめきメダルを 1枚もらえるか (REVIEW_PASS_CORRECT 以上) */
  medal: boolean;
}

export function reviewReward(
  skillIds: readonly string[],
  correct: number,
): ReviewReward {
  return {
    gold: Math.max(0, correct) * reviewGoldPerCorrect(skillIds),
    medal: correct >= REVIEW_PASS_CORRECT,
  };
}
