/*
 * フィールドでの かいふく (戦闘外)。ステータスパネルの じゅもん/もちもの タブから
 * 回復呪文・回復アイテムを使う純ロジック (Vitest 対象)。
 *   - 回復量は戦闘と同じ式 (battle.spellAmount: power ±20%)。かいしんは無い
 *   - HP は maxHp で頭打ち。MP は mpCost ぶん減る (不正解時は呼ばれない = MP は減らない)
 *   - すべて不変更新 (元の save を変えない)
 */

import type { PartyMember, SaveData } from "../save";
import type { SpellDef } from "../../content/types";
import type { Rng } from "../curriculum/types";
import { getSpell } from "../../content/spells";
import { getItem } from "../../content/items";
import { memberName, memberStats } from "../battle/members";
import { spellAmount } from "../battle/battle";

export interface HealTarget {
  memberId: string;
  name: string;
  hp: number;
  maxHp: number;
}

export interface Healed {
  memberId: string;
  amount: number;
}

export type FieldHealCheck =
  | { ok: true }
  | { ok: false; reason: "notLearned" | "notHeal" | "noMp" };

function maxHpOf(m: PartyMember): number {
  return memberStats(m.memberId, m.level).maxHp;
}

/* HP が満タンでない なかま (回復対象)。HP 0 も対象に含める */
export function fieldHealTargets(save: SaveData): HealTarget[] {
  return save.party
    .map((m) => ({
      memberId: m.memberId,
      name: memberName(m.memberId),
      hp: Math.min(m.hp, maxHpOf(m)),
      maxHp: maxHpOf(m),
    }))
    .filter((t) => t.hp < t.maxHp);
}

export function canCastFieldHeal(
  save: SaveData,
  casterId: string,
  spellId: string,
): FieldHealCheck {
  const caster = save.party.find((m) => m.memberId === casterId);
  const spell = getSpell(spellId);
  if (!caster || !spell || !caster.learnedSpells.includes(spellId)) {
    return { ok: false, reason: "notLearned" };
  }
  if (spell.kind !== "heal") return { ok: false, reason: "notHeal" };
  if (caster.mp < spell.mpCost) return { ok: false, reason: "noMp" };
  return { ok: true };
}

/* 戦闘と同じ式 (かいしん無し)。rng を差し替えられるのはテスト用 */
export function healAmount(spell: SpellDef, rng: Rng = Math.random): number {
  return spellAmount(spell.power, false, rng);
}

function healMembers(
  party: PartyMember[],
  targetIds: string[],
  amountFor: (m: PartyMember) => number,
): { party: PartyMember[]; healed: Healed[] } {
  const healed: Healed[] = [];
  const next = party.map((m) => {
    if (!targetIds.includes(m.memberId)) return m;
    const maxHp = maxHpOf(m);
    const amount = Math.max(0, Math.min(maxHp - m.hp, amountFor(m)));
    healed.push({ memberId: m.memberId, amount });
    return { ...m, hp: m.hp + amount };
  });
  return { party: next, healed };
}

/*
 * 回復呪文を使う。target が "party" の呪文は targetId を無視して全員に掛かる
 * (null を渡す)。MP は 1 回ぶん消費する。canCastFieldHeal が ok でなければ何もしない
 */
export function applyFieldHeal(
  save: SaveData,
  casterId: string,
  spellId: string,
  targetId: string | null,
  rng: Rng = Math.random,
): { save: SaveData; healed: Healed[] } {
  const check = canCastFieldHeal(save, casterId, spellId);
  const spell = getSpell(spellId);
  if (!check.ok || !spell) return { save, healed: [] };

  const targetIds =
    spell.target === "party"
      ? save.party.map((m) => m.memberId)
      : [targetId ?? casterId];
  const { party, healed } = healMembers(save.party, targetIds, () => healAmount(spell, rng));
  return {
    save: {
      ...save,
      party: party.map((m) =>
        m.memberId === casterId ? { ...m, mp: m.mp - spell.mpCost } : m,
      ),
    },
    healed,
  };
}

/* 回復アイテムを 1 個使う。0 個になったら inventory からキーごと消す */
export function applyHealItem(
  save: SaveData,
  itemId: string,
  targetId: string,
): { save: SaveData; healed: Healed[] } {
  const item = getItem(itemId);
  const count = save.inventory.items[itemId] ?? 0;
  if (!item || item.kind !== "heal" || count <= 0) return { save, healed: [] };
  if (!save.party.some((m) => m.memberId === targetId)) return { save, healed: [] };

  const { party, healed } = healMembers(save.party, [targetId], () => item.power ?? 0);
  const items = { ...save.inventory.items };
  if (count - 1 <= 0) delete items[itemId];
  else items[itemId] = count - 1;
  return {
    save: { ...save, party, inventory: { ...save.inventory, items } },
    healed,
  };
}
