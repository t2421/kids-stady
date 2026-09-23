/*
 * ステータスパネルの表示内容を組み立てる (純関数 — Vitest 対象)。
 * 表示は UiScene.showStatusPanel が行う。タブ (つよさ・そうび・
 * じゅもん・もちもの・ノート) ごとに収まる構造化データを返す。
 */

import type { SaveData } from "../../lib/save";
import { EQUIP_SLOTS } from "../../lib/save";
import { expForLevel } from "../../lib/battle/stats";
import { memberName, memberStats } from "../../lib/battle/members";
import { equippedStats, SLOT_LABELS } from "../../lib/battle/equipment";
import { getSpell } from "../../content/spells";
import { getItem } from "../../content/items";
import { inventoryRows } from "../../lib/inventory";
import type { ItemDef, SpellDef } from "../../content/types";
import { formatPlaytime } from "../../lib/format";
import { buildMistakeRows, type MistakeRow } from "./mistakeRows";

export type { MistakeRow };

/* じゅもんタブの 1 行。kind/target はフィールド回復 (FieldHealControls) の判定用 */
export interface SpellRow {
  id: string;
  name: string;
  mpCost: number;
  kind: SpellDef["kind"];
  target: SpellDef["target"];
}

/* もちものタブの 1 行 (パーティ共有)。sell/keepsake は すてる・うる の判定用 */
export interface ItemRow {
  id: string;
  name: string;
  count: number;
  kind: ItemDef["kind"];
  /* 道具屋での うり値 (たいせつなものは 0) */
  sell: number;
  /* たいせつなもの = うる・すてる ができない (lib/inventory.ts) */
  keepsake: boolean;
}

export interface MemberStatus {
  memberId: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  agi: number;
  /* つぎのレベルまでに必要な のこり経験値 */
  nextNeed: number;
  /* そうびタブ用: 部位ラベル → 装備名 ("なし" を含む) */
  equipment: { label: string; name: string }[];
  /* じゅもんタブ用: 1行 = 1呪文 */
  spells: SpellRow[];
}

export interface StatusData {
  gold: number;
  /* なかまボタンで1人ずつ切り替えて表示する */
  members: MemberStatus[];
  /* もちものは パーティ共有。1行 = 1アイテム */
  items: ItemRow[];
  /* つよさタブの脚注: "1じかん 5ふん" (lib/format.formatPlaytime) */
  playtime: string;
  /* ノートタブ: 戦闘で間違えた問題、新しい順 (field/mistakeRows.ts) */
  mistakes: MistakeRow[];
}

export function buildStatusData(save: SaveData): StatusData | null {
  const hero = save.party.find((m) => m.memberId === "hero");
  if (!hero) return null;

  const members = save.party.map((m) => {
    const base = memberStats(m.memberId, m.level);
    const stats = equippedStats(m);
    return {
      memberId: m.memberId,
      name: memberName(m.memberId),
      level: m.level,
      hp: Math.min(m.hp, base.maxHp),
      maxHp: base.maxHp,
      mp: Math.min(m.mp, base.maxMp),
      maxMp: base.maxMp,
      atk: stats.atk,
      def: stats.def,
      agi: stats.agi,
      nextNeed: Math.max(0, expForLevel(m.level + 1) - m.exp),
      equipment: EQUIP_SLOTS.map((slot) => ({
        label: SLOT_LABELS[slot],
        name: getItem(m.equipment[slot] ?? "")?.name ?? "なし",
      })),
      spells: m.learnedSpells
        .map((id) => getSpell(id))
        .filter((s): s is NonNullable<typeof s> => !!s)
        .map((s) => ({
          id: s.id,
          name: s.name,
          mpCost: s.mpCost,
          kind: s.kind,
          target: s.target,
        })),
    };
  });

  const items = inventoryRows(save);

  return {
    gold: save.inventory.gold,
    members,
    items,
    playtime: formatPlaytime(save.playtimeMs),
    mistakes: buildMistakeRows(save.mistakes),
  };
}
