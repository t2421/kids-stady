/* 章の索引。章2以降はここに追加登録するだけ (implemented:false でロック表示) */

import type { ChapterDef } from "../types";
import { CHAPTER1 } from "./chapter1";
import { CHAPTER2 } from "./chapter2";

export const CHAPTERS: ChapterDef[] = [CHAPTER1, CHAPTER2];

export function getChapter(id: number): ChapterDef | undefined {
  return CHAPTERS.find((c) => c.id === id);
}
