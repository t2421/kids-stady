/*
 * 学年 (ステージ) 定義データ。ゲームロジックはこのデータ駆動で動く。
 * 出題スキルの内容は docs/curriculum-spec.md (指導要領ベース) を参照。
 */

export interface Lesson {
  id: string;
  name: string;
  partName: string; // 組み立てる機体パーツ
  partIcon: string;
  skills: string[]; // curriculum のスキルID
  count: number; // 出題数
}

export interface BossDef {
  name: string;
  hp: number;
  /* 通常ショット1ダメージあたりの実効ダメージ倍率 (小さく削れる) */
  chipScale: number;
  /* ?ドローン正解で自動発動する必殺技のダメージ */
  beamDamage: number;
}

export interface OutputDef {
  capsuleSkills: string[];
  bossSkills: string[];
  answerTimeMs: number;
  /* ボス登場までの飛行パート秒数 */
  durationSec: number;
  boss: BossDef;
}

export interface GradeDef {
  grade: number;
  name: string;
  icon: string;
  color: string;
  implemented: boolean;
  teaser: string; // ロック中カードに表示する学習内容
  lessons: Lesson[];
  output: OutputDef | null;
}

export const GRADES: GradeDef[] = [
  {
    grade: 1,
    name: "1ねんせいの ほし",
    icon: "🌱",
    color: "#54d1a1",
    implemented: true,
    teaser: "たしざん・ひきざん",
    lessons: [
      {
        id: "g1_l1",
        name: "かずの きち",
        partName: "エンジン",
        partIcon: "🔧",
        skills: ["g1_count", "g1_compare", "g1_seq", "g1_ten_pack"],
        count: 8,
      },
      {
        id: "g1_l2",
        name: "たしざん こうじょう",
        partName: "ウイング",
        partIcon: "🪽",
        skills: ["g1_add_nc", "g1_add_carry", "g1_three"],
        count: 8,
      },
      {
        id: "g1_l3",
        name: "ひきざん こうじょう",
        partName: "キャノン",
        partIcon: "🔫",
        skills: ["g1_sub_nc", "g1_sub_borrow"],
        count: 8,
      },
    ],
    output: {
      capsuleSkills: [
        "g1_add_nc",
        "g1_add_carry",
        "g1_sub_nc",
        "g1_sub_borrow",
        "g1_three",
        "g1_ten_pack",
        "g1_compare",
      ],
      bossSkills: ["g1_add_carry", "g1_sub_borrow"],
      answerTimeMs: 8000,
      durationSec: 100,
      boss: { name: "けいさんキング・イチ", hp: 100, chipScale: 0.05, beamDamage: 25 },
    },
  },
  {
    grade: 2,
    name: "2ねんせいの ほし",
    icon: "✖️",
    color: "#5ab8ff",
    implemented: true,
    teaser: "九九・ひっさん",
    lessons: [
      {
        id: "g2_l1",
        name: "ひっさん こうじょう",
        partName: "エンジン",
        partIcon: "🔧",
        skills: ["g2_add2", "g2_sub2"],
        count: 8,
      },
      {
        id: "g2_l2",
        name: "くく ドック",
        partName: "ウイング",
        partIcon: "🪽",
        skills: ["g2_kuku", "g2_kuku_hole"],
        count: 8,
      },
      {
        id: "g2_l3",
        name: "かずと たんい ラボ",
        partName: "キャノン",
        partIcon: "🔫",
        skills: ["g2_kazu", "g2_time", "g2_length"],
        count: 8,
      },
    ],
    output: {
      capsuleSkills: ["g2_add2", "g2_sub2", "g2_kuku", "g2_kuku_hole", "g2_kazu"],
      bossSkills: ["g2_kuku_hole", "g2_sub2"],
      answerTimeMs: 9000,
      durationSec: 100,
      boss: { name: "くくキング・ニ", hp: 110, chipScale: 0.05, beamDamage: 25 },
    },
  },
  {
    grade: 3,
    name: "3ねんせいの ほし",
    icon: "➗",
    color: "#ff9f43",
    implemented: true,
    teaser: "わりざん・小数・分数",
    lessons: [
      {
        id: "g3_l1",
        name: "わりざん こうじょう",
        partName: "エンジン",
        partIcon: "🔧",
        skills: ["g3_div", "g3_div_amari"],
        count: 8,
      },
      {
        id: "g3_l2",
        name: "おおきなかず ドック",
        partName: "ウイング",
        partIcon: "🪽",
        skills: ["g3_add3", "g3_mult2x1"],
        count: 8,
      },
      {
        id: "g3_l3",
        name: "しょうすう・ぶんすう ラボ",
        partName: "キャノン",
        partIcon: "🔫",
        skills: ["g3_shosu", "g3_bunsu", "g3_tani"],
        count: 8,
      },
    ],
    output: {
      capsuleSkills: ["g3_div", "g3_mult2x1", "g3_shosu", "g3_bunsu", "g3_tani"],
      bossSkills: ["g3_div_amari", "g3_mult2x1"],
      answerTimeMs: 10000,
      durationSec: 100,
      boss: { name: "わりざんキング・サン", hp: 120, chipScale: 0.05, beamDamage: 25 },
    },
  },
  {
    grade: 4,
    name: "4ねんせいの ほし",
    icon: "🔢",
    color: "#c86bff",
    implemented: true,
    teaser: "わり算ひっ算・小数・面積",
    lessons: [
      {
        id: "g4_l1",
        name: "わりざんひっさん こうじょう",
        partName: "エンジン",
        partIcon: "🔧",
        skills: ["g4_div2", "g4_gaisu"],
        count: 8,
      },
      {
        id: "g4_l2",
        name: "しょうすう こうじょう",
        partName: "ウイング",
        partIcon: "🪽",
        skills: ["g4_shosu_mul", "g4_kimari"],
        count: 8,
      },
      {
        id: "g4_l3",
        name: "ぶんすう・めんせき ラボ",
        partName: "キャノン",
        partIcon: "🔫",
        skills: ["g4_bunsu", "g4_menseki"],
        count: 8,
      },
    ],
    output: {
      capsuleSkills: ["g4_div2", "g4_shosu_mul", "g4_kimari", "g4_menseki"],
      bossSkills: ["g4_div2", "g4_bunsu"],
      answerTimeMs: 12000,
      durationSec: 100,
      boss: { name: "しょうすうキング・ヨン", hp: 130, chipScale: 0.05, beamDamage: 25 },
    },
  },
  {
    grade: 5,
    name: "5ねんせいの ほし",
    icon: "🧮",
    color: "#ff7ba9",
    implemented: true,
    teaser: "分数・小数のかけわり・割合",
    lessons: [
      {
        id: "g5_l1",
        name: "しょうすう マスター",
        partName: "エンジン",
        partIcon: "🔧",
        skills: ["g5_shosu_mul", "g5_shosu_div"],
        count: 8,
      },
      {
        id: "g5_l2",
        name: "ぶんすう マスター",
        partName: "ウイング",
        partIcon: "🪽",
        skills: ["g5_bunsu_add", "g5_yakubun", "g5_baisu"],
        count: 8,
      },
      {
        id: "g5_l3",
        name: "わりあい ラボ",
        partName: "キャノン",
        partIcon: "🔫",
        skills: ["g5_wariai", "g5_heikin"],
        count: 8,
      },
    ],
    output: {
      capsuleSkills: ["g5_shosu_mul", "g5_yakubun", "g5_wariai", "g5_heikin"],
      bossSkills: ["g5_bunsu_add", "g5_shosu_div"],
      answerTimeMs: 14000,
      durationSec: 100,
      boss: { name: "ぶんすうキング・ゴ", hp: 140, chipScale: 0.05, beamDamage: 25 },
    },
  },
  {
    grade: 6,
    name: "6ねんせいの ほし",
    icon: "👑",
    color: "#ffd93d",
    implemented: true,
    teaser: "分数のかけわり・比・速さ",
    lessons: [
      {
        id: "g6_l1",
        name: "ぶんすう さいしゅうけいたい",
        partName: "エンジン",
        partIcon: "🔧",
        skills: ["g6_bunsu_mul", "g6_bunsu_div"],
        count: 8,
      },
      {
        id: "g6_l2",
        name: "もじと ひ の けんきゅうじょ",
        partName: "ウイング",
        partIcon: "🪽",
        skills: ["g6_moji", "g6_hi"],
        count: 8,
      },
      {
        id: "g6_l3",
        name: "はやさと えん ラボ",
        partName: "キャノン",
        partIcon: "🔫",
        skills: ["g6_hayasa", "g6_en"],
        count: 8,
      },
    ],
    output: {
      capsuleSkills: ["g6_bunsu_mul", "g6_moji", "g6_hi", "g6_hayasa"],
      bossSkills: ["g6_bunsu_div", "g6_en"],
      answerTimeMs: 15000,
      durationSec: 100,
      boss: { name: "けいさんだいまおう", hp: 150, chipScale: 0.05, beamDamage: 25 },
    },
  },
];

export function getGrade(grade: number): GradeDef | null {
  return GRADES.find((g) => g.grade === grade) ?? null;
}
