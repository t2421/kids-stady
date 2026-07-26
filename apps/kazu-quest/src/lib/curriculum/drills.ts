/*
 * おだいクエスト (ドリル依頼)。まなびやの「おだいの けいじばん」から
 * その学年の単元を選んで10問に挑戦し、正解数に応じてゴールドを稼ぐ。
 * むずかしい単元 (★が多い)・上の学年ほど 1問あたりの報酬が高い。
 */

import { SKILLS } from "./index";

export interface DrillQuest {
  skillId: string;
  label: string;
  grade: number;
  stars: 1 | 2 | 3;
  questions: number;
  goldPerCorrect: number;
  perfectBonus: number;
}

export const DRILL_QUESTIONS = 10;

/* 単元ごとの手ごわさ。学年内での相対的な難しさを ★1〜3 で表す */
const STARS: Record<string, 1 | 2 | 3> = {
  g1_count: 1,
  g1_compare: 1,
  g1_add_nc: 1,
  g1_sub_nc: 2,
  g1_add_carry: 2,
  g1_sub_borrow: 3,
  g2_kuku: 2,
  g2_add_column: 2,
  g2_sub_column: 3,
  g2_length: 2,
  g2_volume: 2,
  g2_time: 3,
};

export function goldPerCorrect(grade: number, stars: number): number {
  return stars + (grade - 1) * 2;
}

/* その学年の おだい一覧 (やさしい順)。実装済みスキルのみ */
export function questsForGrade(grade: number): DrillQuest[] {
  return SKILLS.filter(
    (s) => s.implemented && s.grade === grade && STARS[s.id] !== undefined,
  )
    .map((s) => {
      const stars = STARS[s.id];
      const perCorrect = goldPerCorrect(s.grade, stars);
      return {
        skillId: s.id,
        label: s.label,
        grade: s.grade,
        stars,
        questions: DRILL_QUESTIONS,
        goldPerCorrect: perCorrect,
        perfectBonus: perCorrect * 5,
      };
    })
    .sort((a, b) => a.stars - b.stars || a.skillId.localeCompare(b.skillId));
}

export function getDrillQuest(skillId: string): DrillQuest | undefined {
  const grade = SKILLS.find((s) => s.id === skillId)?.grade;
  if (grade === undefined) return undefined;
  return questsForGrade(grade).find((q) => q.skillId === skillId);
}

/* 報酬: 正解数 × 単価 + 全問正解ボーナス */
export function drillReward(
  quest: Pick<DrillQuest, "questions" | "goldPerCorrect" | "perfectBonus">,
  correct: number,
): { gold: number; perfect: boolean } {
  const perfect = correct >= quest.questions;
  return {
    gold: correct * quest.goldPerCorrect + (perfect ? quest.perfectBonus : 0),
    perfect,
  };
}
