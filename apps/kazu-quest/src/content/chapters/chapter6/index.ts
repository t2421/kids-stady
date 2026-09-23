/* 第6章「ゼロのあなと 下の世界ネガリア」— 小6算数 (設計 A2) */

import type { ChapterDef } from "../../types";
import { CH6_WORLD } from "./maps/world6";
import { CH6_NOKORIBI } from "./maps/nokoribi";
import {
  CH6_HOSHIOKI,
  CH6_HOSHIOKI_INN,
  CH6_HOSHIOKI_MANABIYA,
  CH6_HOSHIOKI_SHOP,
  CH6_HOSHIOKI_SHRINE,
} from "./maps/hoshioki";
import {
  CH6_EN_1,
  CH6_EN_2,
  CH6_SPEED_1,
  CH6_SPEED_2,
  CH6_TRIAL,
} from "./maps/dungeons6";
import {
  CH6_ZEROM_1,
  CH6_ZEROM_2,
  CH6_ZEROM_THRONE,
} from "./maps/zeromCastle";

export const CHAPTER6: ChapterDef = {
  id: 6,
  grade: 6,
  title: "ゼロのあなと 下の世界ネガリア",
  implemented: true,
  startMap: "ch6-hoshioki",
  startSpawn: "entrance",
  maps: [
    CH6_WORLD,
    CH6_NOKORIBI,
    CH6_HOSHIOKI,
    CH6_HOSHIOKI_INN,
    CH6_HOSHIOKI_SHOP,
    CH6_HOSHIOKI_MANABIYA,
    CH6_HOSHIOKI_SHRINE,
    CH6_SPEED_1,
    CH6_SPEED_2,
    CH6_EN_1,
    CH6_EN_2,
    CH6_TRIAL,
    CH6_ZEROM_1,
    CH6_ZEROM_2,
    CH6_ZEROM_THRONE,
  ],
  encounterTables: [],
  spellIds: [
    "speedStar",
    "enNoHadou",
    "bunsuuNova",
    "ratioBreak",
    "mojishikiSign",
    "kakudaiSlash",
    "baainoKazu",
    "fukkatsuNoShiki",
  ],
  /* 通常攻撃の出題プール: 小4〜小6のミックス (最終章は総ふくしゅう) */
  attackSkillIds: ["g4_decimal", "g5_percent", "g6_speed"],
  flags: {
    "c6.metElder": "ホシオキの長老から 3つの印の話を聞いた",
    "c6.speedSeal": "はやさの回廊で はやさの印を手に入れた",
    "c6.enSeal": "エンの神殿で 円の印を手に入れた",
    "c6.enChest": "エンの神殿の 宝箱を開けた",
    "c6.trialSeal": "ピタゴラの試練を突破し ピタゴラの印を手に入れた",
    "c6.metGauss": "ゼロム城の牢で 父ガウスと再会した",
    "c6.zeromChest": "ゼロム城の 宝箱を開けた",
    "c6.bossDefeated": "冥王ゼロム (2形態) を倒した",
    "c6.orb6": "数晶・陸を 取り戻した",
    "c6.clear": "第6章クリア = カズクエ本編クリア (エンディング視聴済み)",
    "c6.quizNpc": "クイズずきの もんだいに せいかいし ひらめきメダルを もらった (KQ-31)",
    "learned.speedStar": "スピードスター習得 (テスト合格)",
    "learned.enNoHadou": "エンノハドウ習得 (テスト合格)",
    "learned.bunsuuNova": "ブンスウノヴァ習得 (テスト合格)",
    "learned.ratioBreak": "レシオブレイク習得 (テスト合格)",
    "learned.mojishikiSign": "モジシキサイン習得 (テスト合格)",
    "learned.kakudaiSlash": "カクダイスラッシュ習得 (テスト合格)",
    "learned.baainoKazu": "バアイノカズ習得 (テスト合格)",
    "learned.fukkatsuNoShiki": "フッカツノシキ習得 (テスト合格)",
    "c6.enteredTrial": "ピタゴラの試練に 一度 入った (番人が 道をあける — 出口で閉じこめない)",
  },
  clearFlag: "c6.clear",
};
