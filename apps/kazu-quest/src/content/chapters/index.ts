/* 章の索引。章2以降はここに追加登録するだけ (implemented:false でロック表示) */

import type { ChapterDef } from "../types";
import { CHAPTER1 } from "./chapter1";
import { CHAPTER2 } from "./chapter2";
import { CHAPTER3 } from "./chapter3";
import { CHAPTER4 } from "./chapter4";
import { CHAPTER5 } from "./chapter5";
import { CHAPTER6 } from "./chapter6";
import { CHAPTER7 } from "./chapter7";

/* 章7 (終章) は advanceChapter で進まない裏ダンジョン。chapter.current は 6 のまま入る (KQ-30b) */
export const CHAPTERS: ChapterDef[] = [
  CHAPTER1,
  CHAPTER2,
  CHAPTER3,
  CHAPTER4,
  CHAPTER5,
  CHAPTER6,
  CHAPTER7,
];

export function getChapter(id: number): ChapterDef | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

/*
 * マップが属する章。chapter.current と一致しない場面 (終章のように 章を進めずに入る
 * ダンジョン) で、その場所の出題プール (attackSkillIds) を引くために使う。
 * dev マップなど どの章にも属さない id は undefined
 */
export function chapterForMap(mapId: string): ChapterDef | undefined {
  return CHAPTERS.find((c) => c.maps.some((m) => m.id === mapId));
}
