/*
 * もちものの 整理 (うる・すてる) の純ロジック (Vitest 対象)。
 * 手に入れたアイテムが たまる一方だと もちものタブが読めなくなるので、
 * 道具屋で うる / その場で すてる の2つの出口を用意する。
 *
 * たいせつなもの (ねだんが つかないもの = ひらめきメダル・数晶のかけら) は
 * うることも すてることも できない — 進行に関わる報酬を 子どもが
 * うっかり 手ばなす事故を 型ではなく データ (price) で防ぐ。
 * そうび中のアイテムは inventory.items から出ているので ここには現れない
 * (lib/battle/equipment.ts の規約)。
 */

import type { ItemDef } from "../content/types";
import { getItem } from "../content/items";
import type { SaveData } from "./save";

/* うり値は かい値の半分 (切りすて)。ねだんが ついている以上 0G では しのびないので最低 1G */
const SELL_RATE = 0.5;
const SELL_MIN = 1;

/* たいせつなもの = ねだんが つかないもの。うる・すてる の対象外 */
export function isKeepsake(item: ItemDef): boolean {
  return item.price <= 0;
}

export function sellPrice(item: ItemDef): number {
  if (isKeepsake(item)) return 0;
  return Math.max(SELL_MIN, Math.floor(item.price * SELL_RATE));
}

/* もちものタブ・道具屋の「うる」に出す 1 行 */
export interface InventoryRow {
  id: string;
  name: string;
  count: number;
  kind: ItemDef["kind"];
  /* うり値 (たいせつなものは 0) */
  sell: number;
  keepsake: boolean;
}

/* 所持数 > 0 のものだけ。未知の itemId は 名前を id のまま たいせつなもの扱いにする */
export function inventoryRows(save: SaveData): InventoryRow[] {
  return Object.entries(save.inventory.items)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => {
      const item = getItem(id);
      return {
        id,
        count,
        name: item?.name ?? id,
        kind: item?.kind ?? "key",
        sell: item ? sellPrice(item) : 0,
        keepsake: item ? isKeepsake(item) : true,
      };
    });
}

function removeOne(
  items: Record<string, number>,
  itemId: string,
): Record<string, number> {
  const next = { ...items, [itemId]: (items[itemId] ?? 0) - 1 };
  if (next[itemId] <= 0) delete next[itemId];
  return next;
}

/* 持っていて たいせつなものでなければ 1 つ手ばなせる */
export function canRelease(save: SaveData, itemId: string): boolean {
  const item = getItem(itemId);
  if (!item || isKeepsake(item)) return false;
  return (save.inventory.items[itemId] ?? 0) > 0;
}

/*
 * 道具屋に 1 つ うる。うれない (たいせつなもの・持っていない) ときは null を返し、
 * 呼び出し側が メッセージを出す。
 */
export function sellOne(
  save: SaveData,
  itemId: string,
): { save: SaveData; gold: number } | null {
  if (!canRelease(save, itemId)) return null;
  const gold = sellPrice(getItem(itemId)!);
  return {
    gold,
    save: {
      ...save,
      inventory: {
        gold: save.inventory.gold + gold,
        items: removeOne(save.inventory.items, itemId),
      },
    },
  };
}

/* その場で 1 つ すてる。すてられないときは null */
export function discardOne(save: SaveData, itemId: string): SaveData | null {
  if (!canRelease(save, itemId)) return null;
  return {
    ...save,
    inventory: {
      ...save.inventory,
      items: removeOne(save.inventory.items, itemId),
    },
  };
}
