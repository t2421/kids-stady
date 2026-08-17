/* 章の索引。章2以降はここに追加登録するだけ (implemented:false でロック表示) */

import type { ChapterDef } from "../types";
import { CHAPTER1 } from "./chapter1";
import { CHAPTER2 } from "./chapter2";
import { CHAPTER3 } from "./chapter3";
import { CHAPTER4 } from "./chapter4";
import { CHAPTER5 } from "./chapter5";

export const CHAPTERS: ChapterDef[] = [CHAPTER1, CHAPTER2, CHAPTER3, CHAPTER4, CHAPTER5];

export function getChapter(id: number): ChapterDef | undefined {
  return CHAPTERS.find((c) => c.id === id);
}
