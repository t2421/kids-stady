/*
 * イベントランナーの effect のうち、UIフローが長いもの (宿・きろく・
 * 習得テスト・店) のハンドラ。FieldScene の runCommands から呼ばれる。
 * シーンには依存せず、UiScene とセッションだけを使う。
 */

import { EventBus } from "../EventBus";
import { autosave, getSave, updateSave } from "../session";
import { heroStats } from "../../lib/battle/stats";
import { getSpell } from "../../content/spells";
import { getItem, SHOPS } from "../../content/items";
import type { UiScene } from "../scenes/UiScene";

/* めがみのほこら: checkpoint を更新して「きろくした!」 */
export function handleSavePoint(
  ui: UiScene,
  checkpoint: { mapId: string; spawn: string },
  advance: () => void,
): void {
  updateSave((save) => ({ ...save, checkpoint }));
  autosave();
  ui.showMessage(["ぼうけんを きろくした!"], advance);
}

/* 宿屋: ゴールドを払って全回復 */
export function handleHealInn(
  ui: UiScene,
  price: number,
  advance: () => void,
): void {
  if (getSave().inventory.gold < price) {
    ui.showMessage(["おかねが たりないみたい…"], advance);
    return;
  }
  updateSave((s) => ({
    ...s,
    inventory: { ...s.inventory, gold: s.inventory.gold - price },
    party: s.party.map((m) => {
      const stats = heroStats(m.level);
      return { ...m, hp: stats.maxHp, mp: stats.maxMp };
    }),
  }));
  autosave();
  ui.showMessage(["ゆっくり やすんで…", "げんきに なった!"], advance);
}

/* まなびや: React の SpellTestScreen に委譲し、合格なら習得 (設計 A4) */
export function handleSpellTest(
  ui: UiScene,
  spellId: string,
  advance: () => void,
): void {
  const alreadyLearned = getSave().party.some((m) =>
    m.learnedSpells.includes(spellId),
  );
  if (alreadyLearned) {
    ui.showMessage(["その じゅもんは もう おぼえているよ!"], advance);
    return;
  }
  const onFinished = (result: {
    spellId: string;
    passed: boolean;
    correct: number;
    total: number;
  }) => {
    if (result.spellId !== spellId) return;
    EventBus.off("spell-test-finished", onFinished);
    const spellName = getSpell(result.spellId)?.name ?? result.spellId;
    if (result.passed) {
      updateSave((s) => ({
        ...s,
        /* ストーリーゲート用に learned.<spellId> フラグも立てる */
        flags: { ...s.flags, [`learned.${result.spellId}`]: true },
        party: s.party.map((m) =>
          m.memberId === "hero" && !m.learnedSpells.includes(result.spellId)
            ? { ...m, learnedSpells: [...m.learnedSpells, result.spellId] }
            : m,
        ),
      }));
      autosave();
      ui.showMessage(
        [
          `${result.total}もん中 ${result.correct}もん せいかい!`,
          `ごうかく! ${spellName}を おぼえた!`,
        ],
        advance,
      );
    } else {
      ui.showMessage(
        [
          `${result.total}もん中 ${result.correct}もん せいかい…`,
          "あと すこし! また ちょうせん してね。",
        ],
        advance,
      );
    }
  };
  EventBus.on("spell-test-finished", onFinished);
  EventBus.emit("open-spell-test", { spellId });
}

/* 道具屋: 品物リストから選んで買う (一覧選択式 — 設計変更 2026-07-22) */
export function handleShop(
  ui: UiScene,
  shopId: string,
  advance: () => void,
): void {
  const shop = SHOPS[shopId];
  const items = (shop?.itemIds ?? [])
    .map((id) => getItem(id))
    .filter((it): it is NonNullable<typeof it> => !!it);
  if (items.length === 0) {
    ui.showMessage(["いまは しなぎれ みたい。"], advance);
    return;
  }
  const openList = () => {
    const save = getSave();
    const options = [...items.map((it) => `${it.name}  ${it.price}G`), "やめる"];
    ui.showList(
      `なにを かう? (もちがね ${save.inventory.gold}G)`,
      options,
      (index) => {
        if (index === null || index >= items.length) {
          ui.showMessage(["まいど ありがとう!"], advance);
          return;
        }
        const item = items[index];
        if (getSave().inventory.gold < item.price) {
          ui.showMessage(["おかねが たりないよ…"], openList);
          return;
        }
        updateSave((s) => ({
          ...s,
          inventory: {
            gold: s.inventory.gold - item.price,
            items: {
              ...s.inventory.items,
              [item.id]: (s.inventory.items[item.id] ?? 0) + 1,
            },
          },
        }));
        autosave();
        ui.showMessage([`${item.name}を てにいれた!`], openList);
      },
    );
  };
  openList();
}
