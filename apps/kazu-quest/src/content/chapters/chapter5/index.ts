/* 第5章「割合の都と 魔王マイナドス」— 小5算数 (設計 A2) */

import type { ChapterDef } from "../../types";
import { CH5_WORLD } from "./maps/world5";
import { CH5_PERCEN } from "./maps/percen";
import {
  CH5_PERCEN_INN,
  CH5_PERCEN_MANABIYA,
  CH5_PERCEN_SHOP,
  CH5_PERCEN_SHRINE,
} from "./maps/percenInteriors";
import { CH5_BARGAIN, CH5_BUNSUU } from "./maps/towns5";
import { CH5_SKY_1, CH5_SKY_TOP } from "./maps/skyGarden";
import { CH5_SEA_1, CH5_SEA_2 } from "./maps/seaTemple";
import {
  CH5_CASTLE_1,
  CH5_CASTLE_2,
  CH5_CASTLE_THRONE,
} from "./maps/minadosCastle";

export const CHAPTER5: ChapterDef = {
  id: 5,
  grade: 5,
  title: "割合の都と 魔王マイナドス",
  implemented: true,
  startMap: "ch5-percen",
  startSpawn: "entrance",
  maps: [
    CH5_WORLD,
    CH5_PERCEN,
    CH5_PERCEN_INN,
    CH5_PERCEN_SHOP,
    CH5_PERCEN_MANABIYA,
    CH5_PERCEN_SHRINE,
    CH5_BARGAIN,
    CH5_BUNSUU,
    CH5_SKY_1,
    CH5_SKY_TOP,
    CH5_SEA_1,
    CH5_SEA_2,
    CH5_CASTLE_1,
    CH5_CASTLE_2,
    CH5_CASTLE_THRONE,
  ],
  encounterTables: [],
  spellIds: [
    "percenFlare",
    "tsuubunSlash",
    "shousuuStorm",
    "baiyakuBreak",
    "heikinHeal",
    "tanniAttack",
    "taisekiPress",
    "sankakuMirror",
  ],
  /* 通常攻撃の出題プール: わり算・小数・割合 */
  attackSkillIds: ["g3_div", "g4_decimal", "g5_percent"],
  flags: {
    "c5.metQueen": "パーセンの女王から 依頼をうけた",
    "c5.skyKey": "空中庭園で 星のかぎを手に入れた (くもの ばんじん撃破)",
    "c5.skyChest": "空中庭園の 宝箱を開けた",
    "c5.seaKey": "海底神殿で 波のかぎを手に入れた (しんかいの ぬし撃破)",
    "c5.castleChest": "マイナドス城の 宝箱を開けた",
    "c5.bossDefeated": "魔王マイナドスを 倒した",
    "c5.orb5": "数晶・伍を 取り戻した",
    "c5.clear": "第5章クリア (女王に報告済み・ゼロのあなが開く)",
    "c5.quizNpc": "クイズずきの もんだいに せいかいし ひらめきメダルを もらった (KQ-31)",
    "learned.percenFlare": "パーセンフレア習得 (テスト合格)",
    "learned.tsuubunSlash": "ツウブンスラッシュ習得 (テスト合格)",
    "learned.shousuuStorm": "ショウスウストーム習得 (テスト合格)",
    "learned.baiyakuBreak": "バイヤクブレイク習得 (テスト合格)",
    "learned.heikinHeal": "ヘイキンヒール習得 (テスト合格)",
    "learned.tanniAttack": "タンイアタック習得 (テスト合格)",
    "learned.taisekiPress": "タイセキプレス習得 (テスト合格)",
    "learned.sankakuMirror": "サンカクミラー習得 (テスト合格)",
  },
  clearFlag: "c5.clear",
};
