/*
 * 単元マップ画面 (src/components/MasteryMap.tsx, LP-11b (1)) のデータ組み立て。
 * 純関数のみに分離してテストしやすくする (44単元 = 学年ごとの内訳、mastery 状態)。
 */

import { SKILLS } from "./curriculum";
import { masteryOf } from "./mastery";
import type { MasteryState, SaveData } from "./save";

export interface MasteryMapCell {
  skillId: string;
  label: string;
  grade: number;
  state: MasteryState;
}

export interface MasteryMapRow {
  grade: number;
  cells: MasteryMapCell[];
}

/* 学年 (1〜6) × 単元 (最大8) の grid。SKILLS の並び順 (学年→登録順) をそのまま使う */
export function buildMasteryMapRows(save: SaveData): MasteryMapRow[] {
  const rows: MasteryMapRow[] = [];
  for (let grade = 1; grade <= 6; grade++) {
    const cells = SKILLS.filter((s) => s.grade === grade).map((s) => ({
      skillId: s.id,
      label: s.label,
      grade,
      state: masteryOf(save, s.id).state,
    }));
    rows.push({ grade, cells });
  }
  return rows;
}
