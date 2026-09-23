/*
 * 「めあて」— いま なにを まなべば 物語が すすむか (純関数。tests/goals.test.ts)。
 *
 * 章のとびら (番人) は その章の 中核3単元が「できる」で ひらく (LP-20)。つまり
 * 学校で まだ習っていない学年の章でも、単元を まなべば 物語は すすめる。ところが
 * 子どもからは「つぎに なにを まなべば いいか」「どこで まなべるか」が 見えなかった。
 *
 * ここでは
 *   - いまの章の とびらに 要る 3単元と その状態
 *   - その先の章 (まだ「できる」に なっていない いちばん近い章) の 3単元 = さきどり
 * を まとめて返す。先の章は 1つ ずつ はしごのように 上がっていく
 * (小2 の子が 章3 → 章4 → … と どんどん 先取りできる)。
 *
 * 「さきどり」の基準は がっこうの学年 (settings.schoolGrade)。わからないときは
 * 物語で いま いる章 (= その学年) を基準にする。学年は 進めるところを しばらない。
 */

import type { SaveData } from "./save";
import { masteryOf } from "./mastery";
import { SKILLS } from "./curriculum";
import type { MasteryState } from "../content/lessons/types";
import { LESSONS } from "../content/lessons";
import { prerequisitesFor } from "../content/lessons/prereqs";

/* 物語の章 (= 学年)。章7 (終章) は 全学年まぜの 裏ダンジョンなので めあての 対象外 */
export const STORY_CHAPTERS = [1, 2, 3, 4, 5, 6] as const;

/* 章の とびら (番人が まもっている場所) */
export const GATE_TITLES: Record<number, string> = {
  1: "かぞえの どうくつへの はし",
  2: "九九の塔",
  3: "わけまえの ピラミッド",
  4: "角度の遺跡",
  5: "マイナドス城の 門",
  6: "ゼロム城の 門",
};

/* 章の 舞台 (さきどりの 見出しに使う — 「つぎは ○○」) */
export const CHAPTER_PLACES: Record<number, string> = {
  1: "カズールの だいち",
  2: "うみかぜの しま",
  3: "ワケーラ さばく",
  4: "こおりの国 メジャーリア",
  5: "わりあいの だいち",
  6: "したの せかい ネガリア",
};

const RANK: Record<MasteryState, number> = { none: 0, practicing: 1, can: 2, mastered: 3 };

export function isCan(save: SaveData, skillId: string): boolean {
  return RANK[masteryOf(save, skillId).state] >= RANK.can;
}

export interface GoalUnit {
  skillId: string;
  label: string;
  grade: number;
  state: MasteryState;
  /* 前提が ぜんぶ「できる」= すぐ まなべる */
  ready: boolean;
  /* ready でないとき、さきに まなぶと よい 前提 (いちばん 近いもの) */
  needsFirst: string | null;
  /* がっこうの学年より 上 (= さきどり) */
  ahead: boolean;
}

export interface ChapterGoal {
  chapter: number;
  gateTitle: string;
  place: string;
  units: GoalUnit[];
  /* 3単元が ぜんぶ できる (= とびらは ひらく) */
  done: boolean;
}

export interface GoalsView {
  /* いまの章の とびら */
  current: ChapterGoal;
  /* さきどりの はしご: いまの章より先で、まだ 3単元が そろっていない いちばん近い章 */
  ahead: ChapterGoal | null;
  /* さきどりで「できる」に した単元の数 (★) */
  aheadStars: number;
  /* 3単元が ぜんぶ できる いちばん上の章 (= その学年の ちからに とどいた) */
  reachedGrade: number;
}

/* さきどりの 基準の学年 */
export function referenceGrade(save: SaveData): number {
  return save.settings.schoolGrade ?? Math.min(6, Math.max(1, save.chapter.current));
}

export function isAheadSkill(save: SaveData, skillId: string): boolean {
  const grade = gradeOf(skillId);
  return grade !== undefined && grade > referenceGrade(save);
}

function gradeOf(skillId: string): number | undefined {
  return SKILLS.find((s) => s.id === skillId)?.grade;
}

/* 章の 中核3単元 (レッスンの coreOfChapter と 学年 = 章) */
export function coreSkillsOf(chapter: number): string[] {
  return SKILLS.filter((s) => s.grade === chapter && LESSONS[s.id]?.coreOfChapter).map((s) => s.id);
}

/*
 * まだ「できる」でない 前提を たどって、いちばん おくの (= さいしょに まなぶ) 単元を返す。
 * 前提グラフに 循環は無いが、念のため 訪問ずみで 打ち切る
 */
export function firstToLearn(save: SaveData, skillId: string, seen = new Set<string>()): string | null {
  if (seen.has(skillId)) return null;
  seen.add(skillId);
  for (const pre of prerequisitesFor(skillId)) {
    if (isCan(save, pre)) continue;
    return firstToLearn(save, pre, seen) ?? pre;
  }
  return null;
}

function goalUnit(save: SaveData, skillId: string): GoalUnit {
  const info = SKILLS.find((s) => s.id === skillId);
  const needsFirst = firstToLearn(save, skillId);
  return {
    skillId,
    label: info?.label ?? skillId,
    grade: info?.grade ?? 0,
    state: masteryOf(save, skillId).state,
    ready: needsFirst === null,
    needsFirst,
    ahead: isAheadSkill(save, skillId),
  };
}

export function chapterGoal(save: SaveData, chapter: number): ChapterGoal {
  const units = coreSkillsOf(chapter).map((id) => goalUnit(save, id));
  return {
    chapter,
    gateTitle: GATE_TITLES[chapter] ?? "",
    place: CHAPTER_PLACES[chapter] ?? "",
    units,
    done: units.length > 0 && units.every((u) => RANK[u.state] >= RANK.can),
  };
}

export function goalsView(save: SaveData): GoalsView {
  const currentChapter = Math.min(6, Math.max(1, save.chapter.current));
  const next = STORY_CHAPTERS.find((c) => c > currentChapter && !chapterGoal(save, c).done);
  const aheadStars = SKILLS.filter((s) => isAheadSkill(save, s.id) && isCan(save, s.id)).length;
  const reachedGrade = [...STORY_CHAPTERS]
    .reverse()
    .find((c) => chapterGoal(save, c).done) ?? 0;
  return {
    current: chapterGoal(save, currentChapter),
    ahead: next !== undefined ? chapterGoal(save, next) : null,
    aheadStars,
    reachedGrade,
  };
}
