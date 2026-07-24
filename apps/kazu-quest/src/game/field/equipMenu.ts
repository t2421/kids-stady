/*
 * そうび変更メニュー。ステータスパネルの「そうびを かえる」から開く。
 * 部位を選ぶ → 持っている装備品から選ぶ (or はずす) → 反映、のループ。
 * ロジックは lib/battle/equipment.ts の純関数に委譲する。
 */

import { EQUIP_SLOTS } from "../../lib/save";
import type { EquipSlot } from "../../lib/save";
import {
  equipItem,
  equippedStats,
  SLOT_LABELS,
  unequipSlot,
} from "../../lib/battle/equipment";
import { getItem } from "../../content/items";
import { autosave, getSave, updateSave } from "../session";
import type { UiScene } from "../scenes/UiScene";

function bonusText(itemId: string): string {
  const item = getItem(itemId);
  if (!item) return "";
  const parts: string[] = [];
  if (item.atk) parts.push(`こうげき+${item.atk}`);
  if (item.def) parts.push(`しゅび+${item.def}`);
  return parts.join(" ");
}

export function openEquipMenu(ui: UiScene, done: () => void): void {
  const chooseSlot = () => {
    const hero = getSave().party.find((m) => m.memberId === "hero");
    if (!hero) {
      done();
      return;
    }
    const stats = equippedStats(hero);
    const options = [
      ...EQUIP_SLOTS.map((slot) => {
        const name = getItem(hero.equipment[slot] ?? "")?.name ?? "なし";
        return `${SLOT_LABELS[slot]}: ${name}`;
      }),
      "もどる",
    ];
    ui.showList(
      `そうび (こうげき ${stats.atk} / しゅび ${stats.def})`,
      options,
      (index) => {
        if (index === null || index >= EQUIP_SLOTS.length) {
          done();
          return;
        }
        chooseItem(EQUIP_SLOTS[index]);
      },
    );
  };

  const chooseItem = (slot: EquipSlot) => {
    const save = getSave();
    const hero = save.party.find((m) => m.memberId === "hero");
    if (!hero) {
      done();
      return;
    }
    const candidates = Object.entries(save.inventory.items)
      .filter(([id, count]) => {
        const item = getItem(id);
        return count > 0 && item?.kind === "equip" && item.slot === slot;
      })
      .map(([id]) => id);
    const hasEquipped = !!hero.equipment[slot];

    if (candidates.length === 0 && !hasEquipped) {
      ui.showMessage(
        [`そうびできる ${SLOT_LABELS[slot]}を もっていないよ。おみせで かおう!`],
        chooseSlot,
      );
      return;
    }

    const options = [
      ...candidates.map((id) => `${getItem(id)!.name} (${bonusText(id)})`),
      ...(hasEquipped ? ["はずす"] : []),
      "もどる",
    ];
    ui.showList(`${SLOT_LABELS[slot]}を えらんでね`, options, (index) => {
      if (index === null || index >= options.length - 1) {
        chooseSlot();
        return;
      }
      if (index < candidates.length) {
        const itemId = candidates[index];
        const next = equipItem(getSave(), "hero", itemId);
        if (!next) {
          chooseSlot();
          return;
        }
        updateSave(() => next);
        autosave();
        ui.showMessage(
          [`${getItem(itemId)!.name}を そうびした! (${bonusText(itemId)})`],
          chooseSlot,
        );
        return;
      }
      /* はずす */
      const next = unequipSlot(getSave(), "hero", slot);
      if (next) {
        updateSave(() => next);
        autosave();
        ui.showMessage([`${SLOT_LABELS[slot]}を はずした。`], chooseSlot);
      } else {
        chooseSlot();
      }
    });
  };

  chooseSlot();
}
