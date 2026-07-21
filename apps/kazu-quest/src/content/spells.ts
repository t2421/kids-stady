/*
 * 呪文・特技の定義。skillIds が curriculum への接続点 —
 * 戦闘発動時は skillIds から pickSkill で出題される。
 * 章1の6つ (docs/kazu-quest-design-plan.md A4)。
 */

import type { SpellDef } from "./types";

/* Tier別の制限時間 (設計 A3) */
const TIER1_MS = 15000;
const TIER2_MS = 20000;

export const SPELLS: Record<string, SpellDef> = {
  hikidama: {
    id: "hikidama",
    name: "ヒキダマ",
    kind: "attack",
    mpCost: 2,
    power: 10,
    target: "enemy",
    skillIds: ["g1_sub_nc"],
    battleTimeLimitMs: TIER1_MS,
    learnTest: { skillIds: ["g1_sub_nc"], questions: 10, passCount: 8 },
    description: "ひきざんの ちからで てきを こうげき",
  },
  tashiria: {
    id: "tashiria",
    name: "タシリア",
    kind: "heal",
    mpCost: 2,
    power: 10,
    target: "ally",
    skillIds: ["g1_add_nc"],
    battleTimeLimitMs: TIER1_MS,
    learnTest: { skillIds: ["g1_add_nc"], questions: 10, passCount: 8 },
    description: "たしざんの ちからで HPを かいふく",
  },
  kazoeSlash: {
    id: "kazoeSlash",
    name: "かぞえスラッシュ",
    kind: "attack",
    mpCost: 2,
    power: 12,
    target: "enemy",
    skillIds: ["g1_count"],
    battleTimeLimitMs: TIER1_MS,
    learnTest: { skillIds: ["g1_count"], questions: 10, passCount: 8 },
    description: "かぞえた かずだけ れんぞくで きりつける",
  },
  hikidaman: {
    id: "hikidaman",
    name: "ヒキダマン",
    kind: "attack",
    mpCost: 3,
    power: 19,
    target: "enemy",
    skillIds: ["g1_sub_borrow"],
    battleTimeLimitMs: TIER2_MS,
    learnTest: { skillIds: ["g1_sub_borrow"], questions: 10, passCount: 8 },
    description: "くりさがりの ちからで おおダメージ",
  },
  tashirian: {
    id: "tashirian",
    name: "タシリアン",
    kind: "heal",
    mpCost: 3,
    power: 19,
    target: "ally",
    skillIds: ["g1_add_carry"],
    battleTimeLimitMs: TIER2_MS,
    learnTest: { skillIds: ["g1_add_carry"], questions: 10, passCount: 8 },
    description: "くりあがりの ちからで おおきく かいふく",
  },
  kurabeShield: {
    id: "kurabeShield",
    name: "くらべシールド",
    kind: "buff",
    mpCost: 2,
    power: 0,
    target: "ally",
    skillIds: ["g1_compare"],
    battleTimeLimitMs: TIER1_MS,
    learnTest: { skillIds: ["g1_compare"], questions: 10, passCount: 8 },
    description: "くらべる ちからで みをまもる",
  },
};

export function getSpell(id: string): SpellDef | undefined {
  return SPELLS[id];
}
