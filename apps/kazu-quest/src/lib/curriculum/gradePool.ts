/*
 * 章 → 出題プール (学年) の解決。
 * 「章の学年」を直接 grade として使わず、必ずここを通す。
 * 章1〜6は questionGrades を持たないので [grade] に解決され、従来と同じ挙動になる。
 */

import type { ChapterDef } from "../../content/types";
import { SKILLS } from "./index";

/* 章の出題学年。questionGrades 省略時は [grade]。重複は除く */
export function chapterQuestionGrades(chapter: ChapterDef): number[] {
  const grades = chapter.questionGrades ?? [chapter.grade];
  return [...new Set(grades)];
}

/* 指定学年の実装済みスキル id (学年順 → 登録順) */
export function skillIdsForGrades(grades: number[]): string[] {
  const wanted = new Set(grades);
  return SKILLS.filter((s) => s.implemented && wanted.has(s.grade)).map((s) => s.id);
}
