/*
 * レベル・経験値・能力値の導出 (セーブには level/exp/hp/mp だけを保存し、
 * 最大値や攻撃力はここから導出する — docs/kazu-quest-design-plan.md B7)。
 */

export interface DerivedStats {
  maxHp: number;
  maxMp: number;
  atk: number;
  def: number;
  agi: number;
}

/* 勇者の成長曲線 (章1想定: Lv1 HP25 → Lv7 HP55 前後) */
export function heroStats(level: number): DerivedStats {
  return {
    maxHp: 20 + level * 5,
    maxMp: 6 + level * 2,
    atk: 4 + level * 2,
    def: 2 + level,
    agi: 3 + level,
  };
}

/* 次のレベルまでに必要な累計EXP。グラインド不要の緩い曲線 */
export function expForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let l = 1; l < level; l++) {
    total += Math.round(6 * Math.pow(l, 1.6));
  }
  return total;
}

export function levelForExp(exp: number): number {
  let level = 1;
  while (level < 99 && exp >= expForLevel(level + 1)) {
    level += 1;
  }
  return level;
}
