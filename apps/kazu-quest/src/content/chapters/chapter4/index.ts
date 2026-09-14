/* 第4章「氷の国の はかりごと」— 小4算数 (設計 A2) */

import type { ChapterDef } from "../../types";
import { CH4_WORLD } from "./maps/world4";
import { CH4_MAJORIA } from "./maps/majoria";
import {
  CH4_MAJORIA_INN,
  CH4_MAJORIA_MANABIYA,
  CH4_MAJORIA_SHOP,
  CH4_MAJORIA_SHRINE,
} from "./maps/majoriaInteriors";
import { CH4_KOGOE } from "./maps/kogoe";
import { CH4_ICECAVE_1, CH4_ICECAVE_2 } from "./maps/icecave";
import {
  CH4_RUINS_1,
  CH4_RUINS_2,
  CH4_RUINS_3,
  CH4_RUINS_DEEP,
} from "./maps/angleRuins";

export const CHAPTER4: ChapterDef = {
  id: 4,
  grade: 4,
  title: "氷の国の はかりごと",
  implemented: true,
  startMap: "ch4-majoria",
  startSpawn: "entrance",
  maps: [
    CH4_WORLD,
    CH4_MAJORIA,
    CH4_MAJORIA_INN,
    CH4_MAJORIA_SHOP,
    CH4_MAJORIA_MANABIYA,
    CH4_MAJORIA_SHRINE,
    CH4_KOGOE,
    CH4_ICECAVE_1,
    CH4_ICECAVE_2,
    CH4_RUINS_1,
    CH4_RUINS_2,
    CH4_RUINS_3,
    CH4_RUINS_DEEP,
  ],
  encounterTables: [],
  spellIds: [
    "kakudoSpin",
    "mensekiWall",
    "decimaFreeze",
    "gaisuuBomb",
    "octoBillion",
    "bunsuuHeal",
    "warikiriBlade",
    "graphEye",
  ],
  /* 通常攻撃の出題プール: 九九・わり算・角度 */
  attackSkillIds: ["g2_kuku", "g3_div", "g4_angle"],
  flags: {
    "c4.metChief": "メジャーリアの けいそく長から 依頼をうけた",
    "c4.metLittle": "魔法使いリトルが 仲間に加わった",
    "c4.iceGolem": "こおりのゴーレムを 倒した",
    "c4.icecaveChest": "氷の洞くつの 宝箱を開けた",
    "c4.ruinsChest": "角度の遺跡2そうの 宝箱を開けた",
    "c4.bossDefeated": "小数の魔人デシマロンを 倒した",
    "c4.orb4": "数晶・肆を 取り戻した",
    "c4.clear": "第4章クリア (けいそく長に報告済み・船を入手)",
    "c4.quizNpc": "クイズずきの もんだいに せいかいし ひらめきメダルを もらった (KQ-31)",
    "learned.kakudoSpin": "カクドスピン習得 (テスト合格)",
    "learned.mensekiWall": "メンセキウォール習得 (テスト合格)",
    "learned.decimaFreeze": "デシマフリーズ習得 (テスト合格)",
    "learned.gaisuuBomb": "ガイスウボム習得 (テスト合格)",
    "learned.octoBillion": "オクトビリオン習得 (テスト合格)",
    "learned.bunsuuHeal": "ブンスウヒール習得 (テスト合格)",
    "learned.warikiriBlade": "ワリキリブレード習得 (テスト合格)",
    "learned.graphEye": "グラフアイ習得 (テスト合格)",
  },
  clearFlag: "c4.clear",
};
