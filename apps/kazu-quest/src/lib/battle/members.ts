/*
 * パーティメンバーの定義 (名前・成長曲線・初期習得呪文)。
 * 章=学年の進行にあわせて仲間が増える (設計 A1: タスク=僧侶は第2章で加入)。
 */

import type { DerivedStats } from "./stats";
import { heroStats } from "./stats";

export interface MemberDef {
  memberId: string;
  name: string;
  /* 加入時に覚えている呪文 */
  initialSpells: string[];
  stats: (level: number) => DerivedStats;
}

export const MEMBERS: Record<string, MemberDef> = {
  hero: {
    memberId: "hero",
    name: "ゆうしゃ",
    initialSpells: [],
    stats: heroStats,
  },
  /* 僧侶タスク: HPひかえめ・MPと回復が得意 (「たす」の使い手) */
  tasuku: {
    memberId: "tasuku",
    name: "タスク",
    initialSpells: ["tashiria"],
    stats: (level) => ({
      maxHp: 16 + level * 4,
      maxMp: 10 + level * 3,
      atk: 3 + Math.floor(level * 1.5),
      def: 2 + level,
      agi: 4 + level,
    }),
  },
  /* 武闘家カケル: HPと すばやさが 高く MPは ひかえめ (「かける」の使い手) */
  kakeru: {
    memberId: "kakeru",
    name: "カケル",
    initialSpells: ["dandanZuki"],
    stats: (level) => ({
      maxHp: 24 + level * 6,
      maxMp: 4 + level,
      atk: 6 + level * 2,
      def: 3 + level,
      agi: 6 + Math.round(level * 1.4),
    }),
  },
  /* 魔法使いリトル: HPは低いが MPと 呪文の のびが よい (「リットル」の少女) */
  little: {
    memberId: "little",
    name: "リトル",
    initialSpells: ["shousuuRain"],
    stats: (level) => ({
      maxHp: 14 + level * 3,
      maxMp: 12 + level * 4,
      atk: 3 + level,
      def: 2 + level,
      agi: 5 + level,
    }),
  },
};

export function memberName(memberId: string): string {
  return MEMBERS[memberId]?.name ?? memberId;
}

export function memberStats(memberId: string, level: number): DerivedStats {
  return (MEMBERS[memberId]?.stats ?? heroStats)(level);
}
