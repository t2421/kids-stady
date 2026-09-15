/*
 * 経験値付与の共通コア (LP-21 で battle.ts の applyVictory から抽出)。
 * 戦闘勝利 (applyVictory) と、レッスン/テスト/マスターの経験値付与
 * (../learningExp.ts) の両方から使う。パーティ全員に同じ量の EXP を加算し、
 * レベルアップを判定する。レベルアップした場合は全回復 (子供向け設計)。
 * しない場合は現在の HP/MP を新しい上限にクランプするだけ。
 */

import type { PartyMember } from "../save";
import { levelForExp } from "./stats";
import { memberStats } from "./members";

export interface LevelUp {
  memberId: string;
  from: number;
  to: number;
}

export interface ExpGrantResult {
  party: PartyMember[];
  levelUps: LevelUp[];
}

/*
 * liveStats: 戦闘中のコンバタントHP/MPなど、セーブ以外に「今の」HP/MPを
 * 持っている呼び出し元だけが渡す (戦闘中は行動でHPが減っているため)。
 * 省略時はセーブ上の hp/mp をそのまま使う (戦闘外からの付与はこちら)
 */
export function applyExpToParty(
  party: PartyMember[],
  exp: number,
  liveStats?: (memberId: string) => { hp: number; mp: number } | undefined,
): ExpGrantResult {
  const levelUps: LevelUp[] = [];
  const updated = party.map((member) => {
    const live = liveStats?.(member.memberId);
    const newExp = member.exp + exp;
    const newLevel = levelForExp(newExp);
    const stats = memberStats(member.memberId, newLevel);
    if (newLevel > member.level) {
      levelUps.push({ memberId: member.memberId, from: member.level, to: newLevel });
      return {
        ...member,
        exp: newExp,
        level: newLevel,
        hp: stats.maxHp,
        mp: stats.maxMp,
      };
    }
    return {
      ...member,
      exp: newExp,
      hp: Math.min(live?.hp ?? member.hp, stats.maxHp),
      mp: Math.min(live?.mp ?? member.mp, stats.maxMp),
    };
  });
  return { party: updated, levelUps };
}
