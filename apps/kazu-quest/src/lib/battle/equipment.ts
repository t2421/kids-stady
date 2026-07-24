/*
 * 装備の純ロジック (Vitest 対象)。
 * 装備中のアイテムは inventory.items から出て equipment スロットに入る。
 * 付け替えると前の装備は inventory に戻る — アイテムが消えることはない。
 */

import type { Equipment, EquipSlot, PartyMember, SaveData } from "../save";
import { getItem } from "../../content/items";
import type { DerivedStats } from "./stats";
import { heroStats } from "./stats";

export const SLOT_LABELS: Record<EquipSlot, string> = {
  weapon: "ぶき",
  armor: "よろい",
  shield: "たて",
};

/* 装備一式の atk/def 補正 (不明な itemId は無視して安全に倒す) */
export function equipmentBonus(equipment: Equipment): { atk: number; def: number } {
  let atk = 0;
  let def = 0;
  for (const itemId of Object.values(equipment)) {
    const item = itemId ? getItem(itemId) : undefined;
    if (!item || item.kind !== "equip") continue;
    atk += item.atk ?? 0;
    def += item.def ?? 0;
  }
  return { atk, def };
}

/* レベル由来の基礎値 + 装備補正 (戦闘・ステータス表示はこちらを使う) */
export function equippedStats(member: PartyMember): DerivedStats {
  const base = heroStats(member.level);
  const bonus = equipmentBonus(member.equipment);
  return { ...base, atk: base.atk + bonus.atk, def: base.def + bonus.def };
}

function updateMember(
  save: SaveData,
  memberId: string,
  fn: (m: PartyMember) => PartyMember,
): SaveData {
  return {
    ...save,
    party: save.party.map((m) => (m.memberId === memberId ? fn(m) : m)),
  };
}

function addToInventory(
  items: Record<string, number>,
  itemId: string | undefined,
  delta: number,
): Record<string, number> {
  if (!itemId) return items;
  const next = { ...items, [itemId]: (items[itemId] ?? 0) + delta };
  if (next[itemId] <= 0) delete next[itemId];
  return next;
}

/*
 * 所持している装備アイテムを身につける。
 * 同じ部位に装備中のものがあれば inventory に戻す。
 * 所持していない・装備品でない場合は null (呼び出し側でメッセージを出す)。
 */
export function equipItem(
  save: SaveData,
  memberId: string,
  itemId: string,
): SaveData | null {
  const item = getItem(itemId);
  if (!item || item.kind !== "equip" || !item.slot) return null;
  if ((save.inventory.items[itemId] ?? 0) <= 0) return null;
  const member = save.party.find((m) => m.memberId === memberId);
  if (!member) return null;

  const slot = item.slot;
  const previous = member.equipment[slot];
  let items = addToInventory(save.inventory.items, itemId, -1);
  items = addToInventory(items, previous, +1);

  const equipped = updateMember(
    { ...save, inventory: { ...save.inventory, items } },
    memberId,
    (m) => ({ ...m, equipment: { ...m.equipment, [slot]: itemId } }),
  );
  return equipped;
}

/* 部位の装備を外して inventory に戻す。何も装備していなければ null */
export function unequipSlot(
  save: SaveData,
  memberId: string,
  slot: EquipSlot,
): SaveData | null {
  const member = save.party.find((m) => m.memberId === memberId);
  const itemId = member?.equipment[slot];
  if (!member || !itemId) return null;
  const items = addToInventory(save.inventory.items, itemId, +1);
  return updateMember(
    { ...save, inventory: { ...save.inventory, items } },
    memberId,
    (m) => {
      const equipment = { ...m.equipment };
      delete equipment[slot];
      return { ...m, equipment };
    },
  );
}
