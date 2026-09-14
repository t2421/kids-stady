/*
 * 終章「ムゲンのらせん」— クリア後の裏ダンジョン (KQ-30b、縮約版: 5層 + 隠しボス1形態)。
 * 入口は ホシオキの ほこら (chapter6/maps/hoshioki.ts) で c6.clear 後に みこが 案内する。
 * advanceChapter は使わない (chapter.current は 6 のまま)。そのため 出題プールは
 * questionGrades ではなく、各層の扉クイズ (層=学年) と attackSkillIds のミックスで 小1〜小6 を出す。
 */

import type { ChapterDef } from "../../types";
import {
  CH7_SPIRAL_1,
  CH7_SPIRAL_2,
  CH7_SPIRAL_3,
  CH7_SPIRAL_4,
  CH7_SPIRAL_5,
} from "./maps/spiral";

export const CHAPTER7: ChapterDef = {
  id: 7,
  grade: 6,
  questionGrades: [1, 2, 3, 4, 5, 6],
  title: "ムゲンのらせん",
  implemented: true,
  startMap: "ch7-spiral-1",
  startSpawn: "entrance",
  maps: [CH7_SPIRAL_1, CH7_SPIRAL_2, CH7_SPIRAL_3, CH7_SPIRAL_4, CH7_SPIRAL_5],
  encounterTables: [],
  spellIds: [],
  /* 通常攻撃の出題: 小1〜小6 を 1つずつ (らせんの中では 6ねんぶん総ふくしゅう) */
  attackSkillIds: ["g1_add_carry", "g2_kuku", "g3_div", "g4_decimal", "g5_percent", "g6_speed"],
  flags: {
    "c7.chest2": "らせん2層の 宝箱を開けた",
    "c7.chest4": "らせん4層の 宝箱を開けた",
    "c7.gate5": "らせん5層の 割合の門を ひらいた",
    "c7.bossDefeated": "∞竜ムゲニアを倒した",
    "c7.clear": "終章クリア = 称号「ムゲンの ゆうしゃ」",
  },
  clearFlag: "c7.clear",
};
