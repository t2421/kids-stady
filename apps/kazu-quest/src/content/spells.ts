/*
 * 呪文・特技の定義。skillIds が curriculum への接続点 —
 * 戦闘発動時は skillIds から pickSkill で出題される。
 * 章1の6つ (docs/kazu-quest-design-plan.md A4)。
 */

import type { SpellDef } from "./types";

/* Tier別の制限時間 (設計 A3) */
const TIER1_MS = 15000;
const TIER2_MS = 20000;
const TIER3_MS = 25000;

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

/* ---------- 第2章 (小2) ---------- */

SPELLS.kukudama = {
  id: "kukudama",
  name: "ククダマ",
  kind: "attack",
  mpCost: 4,
  power: 13,
  target: "allEnemies",
  skillIds: ["g2_kuku"],
  battleTimeLimitMs: TIER2_MS,
  learnTest: { skillIds: ["g2_kuku"], questions: 10, passCount: 8 },
  description: "九九の ちからで てき ぜんたいを こうげき",
};

SPELLS.dandanZuki = {
  id: "dandanZuki",
  name: "ダンダンづき",
  kind: "attack",
  mpCost: 3,
  power: 6,
  target: "enemy",
  hits: 3,
  skillIds: ["g2_kuku"],
  battleTimeLimitMs: TIER1_MS,
  learnTest: { skillIds: ["g2_kuku"], questions: 10, passCount: 8 },
  description: "九九の リズムで 3れんぞく こうげき",
};

SPELLS.hissanBreak = {
  id: "hissanBreak",
  name: "ヒッサンブレイク",
  kind: "attack",
  mpCost: 4,
  power: 26,
  target: "enemy",
  skillIds: ["g2_add_column", "g2_sub_column"],
  battleTimeLimitMs: TIER2_MS,
  learnTest: {
    skillIds: ["g2_add_column", "g2_sub_column"],
    questions: 10,
    passCount: 8,
  },
  description: "ひっさんの ちからで 単体に おおダメージ",
};

SPELLS.tashiriada = {
  id: "tashiriada",
  name: "タシリアーダ",
  kind: "heal",
  mpCost: 5,
  power: 14,
  target: "party",
  skillIds: ["g2_add_column"],
  battleTimeLimitMs: TIER2_MS,
  learnTest: { skillIds: ["g2_add_column"], questions: 10, passCount: 8 },
  description: "ひっさんの ちからで みかた ぜんいんを かいふく",
};

SPELLS.nagasaBeam = {
  id: "nagasaBeam",
  name: "ナガサビーム",
  kind: "attack",
  mpCost: 3,
  power: 18,
  target: "enemy",
  skillIds: ["g2_length"],
  battleTimeLimitMs: TIER2_MS,
  learnTest: { skillIds: ["g2_length"], questions: 10, passCount: 8 },
  description: "ながさを はかる ひかりの ビーム",
};

SPELLS.kasaMist = {
  id: "kasaMist",
  name: "カサミスト",
  kind: "debuff",
  mpCost: 3,
  power: 0,
  target: "allEnemies",
  effect: "atkDown",
  skillIds: ["g2_volume"],
  battleTimeLimitMs: TIER2_MS,
  learnTest: { skillIds: ["g2_volume"], questions: 10, passCount: 8 },
  description: "かさの きりで てきの こうげきを よわめる",
};

SPELLS.tokiShift = {
  id: "tokiShift",
  name: "トキシフト",
  kind: "buff",
  mpCost: 2,
  power: 0,
  target: "ally",
  effect: "agiUp",
  skillIds: ["g2_time"],
  battleTimeLimitMs: TIER1_MS,
  learnTest: { skillIds: ["g2_time"], questions: 10, passCount: 8 },
  description: "とけいの ちからで うごきが はやくなる",
};

/* ---------- 第3章 (小3) ---------- */

SPELLS.waridama = {
  id: "waridama",
  name: "ワリダマ",
  kind: "attack",
  mpCost: 4,
  power: 30,
  target: "enemy",
  skillIds: ["g3_div"],
  battleTimeLimitMs: TIER2_MS,
  learnTest: { skillIds: ["g3_div"], questions: 10, passCount: 8 },
  description: "わり算の ちからで まもりを 切りわって こうげき",
};

SPELLS.amariBind = {
  id: "amariBind",
  name: "アマリバインド",
  kind: "debuff",
  mpCost: 3,
  power: 0,
  target: "allEnemies",
  effect: "atkDown",
  skillIds: ["g3_div_remainder"],
  battleTimeLimitMs: TIER3_MS,
  learnTest: { skillIds: ["g3_div_remainder"], questions: 10, passCount: 8 },
  description: "あまりの なわで てきを しばり こうげきを よわめる",
};

SPELLS.ketaCrush = {
  id: "ketaCrush",
  name: "ケタクラッシュ",
  kind: "attack",
  mpCost: 5,
  power: 36,
  target: "enemy",
  skillIds: ["g3_mul_column"],
  battleTimeLimitMs: TIER3_MS,
  learnTest: { skillIds: ["g3_mul_column"], questions: 10, passCount: 8 },
  description: "かけ算の ひっさんで けたごと たたきつぶす",
};

SPELLS.manLight = {
  id: "manLight",
  name: "マンライト",
  kind: "attack",
  mpCost: 6,
  power: 24,
  target: "allEnemies",
  skillIds: ["g3_big_number"],
  battleTimeLimitMs: TIER2_MS,
  learnTest: { skillIds: ["g3_big_number"], questions: 10, passCount: 8 },
  description: "「万」の ひかりが てき ぜんたいを つらぬく",
};

SPELLS.shousuuRain = {
  id: "shousuuRain",
  name: "ショウスウレイン",
  kind: "attack",
  mpCost: 5,
  power: 21,
  target: "allEnemies",
  skillIds: ["g3_decimal"],
  battleTimeLimitMs: TIER2_MS,
  learnTest: { skillIds: ["g3_decimal"], questions: 10, passCount: 8 },
  description: "小数の しずくが てき ぜんたいに ふりそそぐ",
};

SPELLS.hafun = {
  id: "hafun",
  name: "ハーフン",
  kind: "buff",
  mpCost: 3,
  power: 0,
  target: "ally",
  skillIds: ["g3_fraction"],
  battleTimeLimitMs: TIER2_MS,
  learnTest: { skillIds: ["g3_fraction"], questions: 10, passCount: 8 },
  description: "分数の ちからで うけるダメージを 半分に する",
};

SPELLS.omosaPress = {
  id: "omosaPress",
  name: "オモサプレス",
  kind: "attack",
  mpCost: 4,
  power: 28,
  target: "enemy",
  skillIds: ["g3_weight"],
  battleTimeLimitMs: TIER2_MS,
  learnTest: { skillIds: ["g3_weight"], questions: 10, passCount: 8 },
  description: "1kgの おもりを おとして おしつぶす",
};

SPELLS.enCircle = {
  id: "enCircle",
  name: "エンサークル",
  kind: "buff",
  mpCost: 5,
  power: 0,
  target: "party",
  skillIds: ["g3_circle"],
  battleTimeLimitMs: TIER2_MS,
  learnTest: { skillIds: ["g3_circle"], questions: 10, passCount: 8 },
  description: "円の まもりが みかた ぜんいんを つつむ",
};

export function getSpell(id: string): SpellDef | undefined {
  return SPELLS[id];
}
