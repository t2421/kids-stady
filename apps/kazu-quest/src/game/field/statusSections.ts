/*
 * ステータスパネルの表示内容を組み立てる (純関数 — Vitest 対象)。
 * 表示は UiScene.showStatusPanel が行う。
 */

import type { SaveData } from "../../lib/save";
import { EQUIP_SLOTS } from "../../lib/save";
import { expForLevel, heroStats } from "../../lib/battle/stats";
import { equippedStats, SLOT_LABELS } from "../../lib/battle/equipment";
import { getSpell } from "../../content/spells";
import { getItem } from "../../content/items";

export interface StatusSection {
  title: string;
  body: string;
}

export function buildStatusSections(save: SaveData): StatusSection[] | null {
  const hero = save.party.find((m) => m.memberId === "hero");
  if (!hero) return null;
  const base = heroStats(hero.level);
  const stats = equippedStats(hero);
  const nextNeed = Math.max(0, expForLevel(hero.level + 1) - hero.exp);

  const spellNames = hero.learnedSpells
    .map((id) => getSpell(id)?.name)
    .filter((n): n is string => !!n);
  const itemLines = Object.entries(save.inventory.items)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => `${getItem(id)?.name ?? id} ×${count}`);
  const equipLine = EQUIP_SLOTS.map(
    (slot) =>
      `${SLOT_LABELS[slot]}: ${getItem(hero.equipment[slot] ?? "")?.name ?? "なし"}`,
  ).join("   ");

  return [
    {
      title: "つよさ",
      body: [
        `ゆうしゃ  レベル ${hero.level}   ゴールド ${save.inventory.gold}G`,
        `HP ${Math.min(hero.hp, base.maxHp)}/${base.maxHp}   MP ${Math.min(hero.mp, base.maxMp)}/${base.maxMp}`,
        `こうげき ${stats.atk}   しゅび ${stats.def}   すばやさ ${stats.agi}`,
        equipLine,
        `つぎのレベルまで あと ${nextNeed}`,
      ].join("\n"),
    },
    {
      title: "じゅもん・とくぎ",
      body:
        spellNames.length > 0
          ? spellNames.join("、")
          : "まだ おぼえていない。まなびやで テストに ちょうせん しよう!",
    },
    {
      title: "もちもの",
      body: itemLines.length > 0 ? itemLines.join("、") : "なにも もっていない。",
    },
  ];
}
