/*
 * ステータスパネルの表示内容を組み立てる (純関数 — Vitest 対象)。
 * 表示は UiScene.showStatusPanel が行う。
 */

import type { SaveData } from "../../lib/save";
import { EQUIP_SLOTS } from "../../lib/save";
import { expForLevel } from "../../lib/battle/stats";
import { memberName, memberStats } from "../../lib/battle/members";
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

  /* パーティ全員のつよさ (2章以降は仲間が増える) */
  const memberBlocks = save.party.map((m) => {
    const base = memberStats(m.memberId, m.level);
    const stats = equippedStats(m);
    const nextNeed = Math.max(0, expForLevel(m.level + 1) - m.exp);
    const equipLine = EQUIP_SLOTS.map(
      (slot) =>
        `${SLOT_LABELS[slot]}: ${getItem(m.equipment[slot] ?? "")?.name ?? "なし"}`,
    ).join("   ");
    return [
      `${memberName(m.memberId)}  レベル ${m.level}`,
      `HP ${Math.min(m.hp, base.maxHp)}/${base.maxHp}   MP ${Math.min(m.mp, base.maxMp)}/${base.maxMp}`,
      `こうげき ${stats.atk}   しゅび ${stats.def}   すばやさ ${stats.agi}`,
      equipLine,
      `つぎのレベルまで あと ${nextNeed}`,
    ].join("\n");
  });

  const spellNames = save.party.flatMap((m) =>
    m.learnedSpells
      .map((id) => getSpell(id)?.name)
      .filter((n): n is string => !!n)
      .map((n) => (save.party.length > 1 ? `${n} (${memberName(m.memberId)})` : n)),
  );
  const itemLines = Object.entries(save.inventory.items)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => `${getItem(id)?.name ?? id} ×${count}`);

  return [
    {
      title: "つよさ",
      body: [`ゴールド ${save.inventory.gold}G`, ...memberBlocks].join("\n\n"),
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
