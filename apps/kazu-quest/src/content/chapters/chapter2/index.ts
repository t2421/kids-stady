/* 第2章「九九の塔と 海のひっさん」— 小2算数 (設計 A2) */

import type { ChapterDef } from "../../types";
import { CH2_WORLD } from "./maps/world2";
import { CH2_MINATOS } from "./maps/minatos";
import {
  CH2_MINATOS_INN,
  CH2_MINATOS_MANABIYA,
  CH2_MINATOS_SHOP,
  CH2_MINATOS_SHRINE,
} from "./maps/minatosInteriors";
import { CH2_KUKURI, CH2_KUKURI_MANABIYA } from "./maps/kukuri";
import { CH2_LIGHTHOUSE_1, CH2_LIGHTHOUSE_TOP } from "./maps/lighthouse";
import { CH2_TOWER_FLOORS, CH2_TOWER_TOP } from "./maps/tower";

export const CHAPTER2: ChapterDef = {
  id: 2,
  grade: 2,
  title: "九九の塔と 海のひっさん",
  implemented: true,
  startMap: "ch2-minatos",
  startSpawn: "entrance",
  maps: [
    CH2_WORLD,
    CH2_MINATOS,
    CH2_MINATOS_INN,
    CH2_MINATOS_SHOP,
    CH2_MINATOS_MANABIYA,
    CH2_MINATOS_SHRINE,
    CH2_KUKURI,
    CH2_KUKURI_MANABIYA,
    CH2_LIGHTHOUSE_1,
    CH2_LIGHTHOUSE_TOP,
    ...CH2_TOWER_FLOORS,
    CH2_TOWER_TOP,
  ],
  encounterTables: [],
  spellIds: [
    "kukudama",
    "dandanZuki",
    "hissanBreak",
    "tashiriada",
    "nagasaBeam",
    "kasaMist",
    "tokiShift",
  ],
  /* 通常攻撃の出題プール: 小1の基礎 + 九九 (章が進むと基礎も上がる) */
  attackSkillIds: ["g1_add_nc", "g1_sub_nc", "g2_kuku"],
  flags: {
    "c2.metMaster": "みなとの長から魔女ブロッタの話を聞いた",
    "c2.metTasuku": "僧侶タスクが仲間に加わった",
    "c2.lighthouse": "しおかぜ灯台に明かりをともした",
    "c2.lighthouseChest": "灯台の宝箱を開けた",
    "c2.bossDefeated": "インクの魔女ブロッタを倒した",
    "c2.orb2": "数晶・弐を取り戻した",
    "c2.clear": "第2章クリア (みなとの長に報告済み)",
    "learned.kukudama": "ククダマ習得 (テスト合格)",
    "learned.dandanZuki": "ダンダンづき習得 (テスト合格)",
    "learned.hissanBreak": "ヒッサンブレイク習得 (テスト合格)",
    "learned.tashiriada": "タシリアーダ習得 (テスト合格)",
    "learned.nagasaBeam": "ナガサビーム習得 (テスト合格)",
    "learned.kasaMist": "カサミスト習得 (テスト合格)",
    "learned.tokiShift": "トキシフト習得 (テスト合格)",
  },
  clearFlag: "c2.clear",
};
