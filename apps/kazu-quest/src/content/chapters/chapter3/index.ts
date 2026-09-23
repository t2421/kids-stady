/* 第3章「砂漠の盗賊王と わけまえのピラミッド」— 小3算数 (設計 A2) */

import type { ChapterDef } from "../../types";
import { CH3_WORLD } from "./maps/world3";
import { CH3_WAKEERA } from "./maps/wakeera";
import {
  CH3_WAKEERA_INN,
  CH3_WAKEERA_MANABIYA,
  CH3_WAKEERA_SHOP,
  CH3_WAKEERA_SHRINE,
} from "./maps/wakeeraInteriors";
import { CH3_CARAVAN } from "./maps/caravan";
import { CH3_RUINS_1, CH3_RUINS_2 } from "./maps/ruins";
import {
  CH3_PYRAMID_1,
  CH3_PYRAMID_2,
  CH3_PYRAMID_3,
  CH3_PYRAMID_TOP,
} from "./maps/pyramid";

export const CHAPTER3: ChapterDef = {
  id: 3,
  grade: 3,
  title: "砂漠の盗賊王と わけまえのピラミッド",
  implemented: true,
  startMap: "ch3-wakeera",
  startSpawn: "entrance",
  maps: [
    CH3_WORLD,
    CH3_WAKEERA,
    CH3_WAKEERA_INN,
    CH3_WAKEERA_SHOP,
    CH3_WAKEERA_MANABIYA,
    CH3_WAKEERA_SHRINE,
    CH3_CARAVAN,
    CH3_RUINS_1,
    CH3_RUINS_2,
    CH3_PYRAMID_1,
    CH3_PYRAMID_2,
    CH3_PYRAMID_3,
    CH3_PYRAMID_TOP,
  ],
  encounterTables: [],
  spellIds: [
    "waridama",
    "amariBind",
    "ketaCrush",
    "manLight",
    "shousuuRain",
    "hafun",
    "omosaPress",
    "enCircle",
  ],
  /* 通常攻撃の出題プール: 小1〜小2の基礎 + わり算 (章が進むと基礎も上がる) */
  attackSkillIds: ["g1_add_carry", "g2_kuku", "g3_div"],
  flags: {
    "c3.metChief": "ワケーラの まちおさから 依頼を うけた",
    "c3.metKakeru": "武闘家カケルが 仲間に加わった",
    "c3.ruinsLit": "大灯りの遺跡に 明かりをともした",
    "c3.pyramidChest": "ピラミッド2そうの 宝箱を開けた",
    "c3.lockedChestPyramid": "ピラミッド1そうの すうじのカギつき宝箱を開けた (分数)",
    "c3.lockedChestRuins": "遺跡の すうじのカギつき宝箱を開けた (大きい数)",
    "c3.golem": "わけまえゴーレムを 倒した",
    "c3.bossDefeated": "盗賊王アマリダを 倒した",
    "c3.orb3": "数晶・参を 取り戻した",
    "c3.clear": "第3章クリア (まちおさに報告済み)",
    "c3.quizNpc": "クイズずきの もんだいに せいかいし ひらめきメダルを もらった (KQ-31)",
    "learned.waridama": "ワリダマ習得 (テスト合格)",
    "learned.amariBind": "アマリバインド習得 (テスト合格)",
    "learned.ketaCrush": "ケタクラッシュ習得 (テスト合格)",
    "learned.manLight": "マンライト習得 (テスト合格)",
    "learned.shousuuRain": "ショウスウレイン習得 (テスト合格)",
    "learned.hafun": "ハーフン習得 (テスト合格)",
    "learned.omosaPress": "オモサプレス習得 (テスト合格)",
    "learned.enCircle": "エンサークル習得 (テスト合格)",
    "c3.enteredPyramid": "ピラミッドに 一度 入った (番人が 道をあける — 出口で閉じこめない)",
  },
  clearFlag: "c3.clear",
};
