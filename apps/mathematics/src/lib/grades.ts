/*
 * 学年 (ステージ) 定義データ。ゲームロジックはこのデータ駆動で動く。
 * 1年生のみ完全実装 (implemented: true)。2〜6年生は枠だけ用意し、
 * カリキュラム実装が進んだら implemented を立てて中身を埋める。
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
  /* 通常ショットで削れるHPの上限割合。残りは必殺技でしか削れない */
  chipCap: number;
}

export interface OutputDef {
  capsuleSkills: string[];
  bossSkills: string[];
  answerTimeMs: number;
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
        name: "かずと くらべっこ",
        partName: "エンジン",
        partIcon: "🔧",
        skills: ["g1_count", "g1_compare"],
        count: 8,
      },
      {
        id: "g1_l2",
        name: "たしざん こうじょう",
        partName: "ウイング",
        partIcon: "🪽",
        skills: ["g1_add_nc", "g1_add_carry"],
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
      capsuleSkills: ["g1_add_nc", "g1_add_carry", "g1_sub_nc", "g1_sub_borrow", "g1_compare"],
      bossSkills: ["g1_add_carry", "g1_sub_borrow"],
      answerTimeMs: 12000,
      boss: { name: "けいさんキング・イチ", hp: 100, chipCap: 0.15 },
    },
  },
  {
    grade: 2,
    name: "2ねんせいの ほし",
    icon: "✖️",
    color: "#5ab8ff",
    implemented: false,
    teaser: "九九・ひっさん",
    lessons: [],
    output: null,
  },
  {
    grade: 3,
    name: "3ねんせいの ほし",
    icon: "➗",
    color: "#ff9f43",
    implemented: false,
    teaser: "わりざん・大きな数",
    lessons: [],
    output: null,
  },
  {
    grade: 4,
    name: "4ねんせいの ほし",
    icon: "🔢",
    color: "#c86bff",
    implemented: false,
    teaser: "小数・2けたのわりざん",
    lessons: [],
    output: null,
  },
  {
    grade: 5,
    name: "5ねんせいの ほし",
    icon: "🧮",
    color: "#ff7ba9",
    implemented: false,
    teaser: "分数・小数のかけわり",
    lessons: [],
    output: null,
  },
  {
    grade: 6,
    name: "6ねんせいの ほし",
    icon: "👑",
    color: "#ffd93d",
    implemented: false,
    teaser: "分数のかけわり・比",
    lessons: [],
    output: null,
  },
];

export function getGrade(grade: number): GradeDef | null {
  return GRADES.find((g) => g.grade === grade) ?? null;
}
