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

/* ---------- 第4章 (小4) ---------- */

SPELLS.kakudoSpin = {
  id: "kakudoSpin",
  name: "カクドスピン",
  kind: "attack",
  mpCost: 5,
  power: 38,
  target: "enemy",
  skillIds: ["g4_angle"],
  battleTimeLimitMs: TIER2_MS,
  learnTest: { skillIds: ["g4_angle"], questions: 10, passCount: 8 },
  description: "するどい 角度で きりこむ かいてん斬り",
};

SPELLS.mensekiWall = {
  id: "mensekiWall",
  name: "メンセキウォール",
  kind: "buff",
  mpCost: 5,
  power: 0,
  target: "party",
  skillIds: ["g4_area"],
  battleTimeLimitMs: TIER2_MS,
  learnTest: { skillIds: ["g4_area"], questions: 10, passCount: 8 },
  description: "面せきぶんの かべが みかた ぜんいんを まもる",
};

SPELLS.decimaFreeze = {
  id: "decimaFreeze",
  name: "デシマフリーズ",
  kind: "attack",
  mpCost: 6,
  power: 27,
  target: "allEnemies",
  skillIds: ["g4_decimal"],
  battleTimeLimitMs: TIER3_MS,
  learnTest: { skillIds: ["g4_decimal"], questions: 10, passCount: 8 },
  description: "小数の こおりが てき ぜんたいを こおらせる",
};

SPELLS.gaisuuBomb = {
  id: "gaisuuBomb",
  name: "ガイスウボム",
  kind: "attack",
  mpCost: 4,
  power: 34,
  target: "enemy",
  skillIds: ["g4_round"],
  battleTimeLimitMs: TIER2_MS,
  learnTest: { skillIds: ["g4_round"], questions: 10, passCount: 8 },
  description: "四捨五入で まるめた ばくだんを なげつける",
};

SPELLS.octoBillion = {
  id: "octoBillion",
  name: "オクトビリオン",
  kind: "attack",
  mpCost: 8,
  power: 32,
  target: "allEnemies",
  skillIds: ["g4_big_number"],
  battleTimeLimitMs: TIER3_MS,
  learnTest: { skillIds: ["g4_big_number"], questions: 10, passCount: 8 },
  description: "億と 兆の ひかりが てき ぜんたいを つらぬく",
};

SPELLS.bunsuuHeal = {
  id: "bunsuuHeal",
  name: "ブンスウヒール",
  kind: "heal",
  mpCost: 6,
  power: 30,
  target: "party",
  skillIds: ["g4_fraction_same"],
  battleTimeLimitMs: TIER2_MS,
  learnTest: { skillIds: ["g4_fraction_same"], questions: 10, passCount: 8 },
  description: "分数の ちからで みかた ぜんいんを 大きく かいふく",
};

SPELLS.warikiriBlade = {
  id: "warikiriBlade",
  name: "ワリキリブレード",
  kind: "attack",
  mpCost: 6,
  power: 46,
  target: "enemy",
  skillIds: ["g4_div_2digit"],
  battleTimeLimitMs: TIER3_MS,
  learnTest: { skillIds: ["g4_div_2digit"], questions: 10, passCount: 8 },
  description: "2けたで わりきる いちげきで 単体に 大ダメージ",
};

SPELLS.graphEye = {
  id: "graphEye",
  name: "グラフアイ",
  kind: "debuff",
  mpCost: 4,
  power: 0,
  target: "allEnemies",
  effect: "atkDown",
  skillIds: ["g4_graph"],
  battleTimeLimitMs: TIER2_MS,
  learnTest: { skillIds: ["g4_graph"], questions: 10, passCount: 8 },
  description: "グラフで よわ点を みぬき てきの こうげきを よわめる",
};

/* ---------- 第5章 (小5) ---------- */

SPELLS.percenFlare = {
  id: "percenFlare",
  name: "パーセンフレア",
  kind: "attack",
  mpCost: 7,
  power: 52,
  target: "enemy",
  skillIds: ["g5_percent"],
  battleTimeLimitMs: TIER3_MS,
  learnTest: { skillIds: ["g5_percent"], questions: 10, passCount: 8 },
  description: "百分率の ほのおが てきの ちからを けずる",
};

SPELLS.tsuubunSlash = {
  id: "tsuubunSlash",
  name: "ツウブンスラッシュ",
  kind: "attack",
  mpCost: 8,
  power: 62,
  target: "enemy",
  skillIds: ["g5_fraction_diff"],
  battleTimeLimitMs: TIER3_MS,
  learnTest: { skillIds: ["g5_fraction_diff"], questions: 10, passCount: 8 },
  description: "分母を そろえた いちげきで 単体に とくだいダメージ",
};

SPELLS.shousuuStorm = {
  id: "shousuuStorm",
  name: "ショウスウストーム",
  kind: "attack",
  mpCost: 9,
  power: 40,
  target: "allEnemies",
  skillIds: ["g5_decimal_muldiv"],
  battleTimeLimitMs: TIER3_MS,
  learnTest: { skillIds: ["g5_decimal_muldiv"], questions: 10, passCount: 8 },
  description: "小数の あらしが てき ぜんたいを のみこむ",
};

SPELLS.baiyakuBreak = {
  id: "baiyakuBreak",
  name: "バイヤクブレイク",
  kind: "attack",
  mpCost: 7,
  power: 56,
  target: "enemy",
  skillIds: ["g5_multiple"],
  battleTimeLimitMs: TIER3_MS,
  learnTest: { skillIds: ["g5_multiple"], questions: 10, passCount: 8 },
  description: "倍数と 約数の ちからで まもりを うちくだく",
};

SPELLS.heikinHeal = {
  id: "heikinHeal",
  name: "ヘイキンヒール",
  kind: "heal",
  mpCost: 8,
  power: 45,
  target: "party",
  skillIds: ["g5_average"],
  battleTimeLimitMs: TIER2_MS,
  learnTest: { skillIds: ["g5_average"], questions: 10, passCount: 8 },
  description: "平きんの ちからで みかた ぜんいんの HPを ならして かいふく",
};

SPELLS.tanniAttack = {
  id: "tanniAttack",
  name: "タンイアタック",
  kind: "buff",
  mpCost: 5,
  power: 0,
  target: "ally",
  effect: "agiUp",
  skillIds: ["g5_unit_rate"],
  battleTimeLimitMs: TIER2_MS,
  learnTest: { skillIds: ["g5_unit_rate"], questions: 10, passCount: 8 },
  description: "1あたりの りょうを 高めて うごきを はやくする",
};

SPELLS.taisekiPress = {
  id: "taisekiPress",
  name: "タイセキプレス",
  kind: "attack",
  mpCost: 8,
  power: 48,
  target: "allEnemies",
  skillIds: ["g5_volume"],
  battleTimeLimitMs: TIER3_MS,
  learnTest: { skillIds: ["g5_volume"], questions: 10, passCount: 8 },
  description: "体せきぶんの 立方体で てき ぜんたいを おしつぶす",
};

SPELLS.sankakuMirror = {
  id: "sankakuMirror",
  name: "サンカクミラー",
  kind: "buff",
  mpCost: 7,
  power: 0,
  target: "party",
  skillIds: ["g5_area"],
  battleTimeLimitMs: TIER2_MS,
  learnTest: { skillIds: ["g5_area"], questions: 10, passCount: 8 },
  description: "三角形の かがみが みかた ぜんいんを まもる",
};

export function getSpell(id: string): SpellDef | undefined {
  return SPELLS[id];
}
