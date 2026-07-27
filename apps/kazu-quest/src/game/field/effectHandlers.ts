/*
 * イベントランナーの effect のうち、UIフローが長いもの (宿・きろく・
 * 習得テスト・店) のハンドラ。FieldScene の runCommands から呼ばれる。
 * シーンには依存せず、UiScene とセッションだけを使う。
 */

import { EventBus } from "../EventBus";
import { autosave, getSave, updateSave } from "../session";
import { memberStats } from "../../lib/battle/members";
import { equipItem } from "../../lib/battle/equipment";
import { getSpell } from "../../content/spells";
import { getItem, SHOPS } from "../../content/items";
import { questsForGrade } from "../../lib/curriculum/drills";
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
      const stats = memberStats(m.memberId, m.level);
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

/*
 * おだいの けいじばん: その学年 (= 現在の章) のドリルに挑戦して
 * ゴールドを稼ぐ。★が多い単元ほど 1問あたりの報酬が高い。
 */
export function handleDrillBoard(ui: UiScene, advance: () => void): void {
  const grade = getSave().chapter.current;
  const quests = questsForGrade(grade);
  if (quests.length === 0) {
    ui.showMessage(["いまは おだいが ないみたい。"], advance);
    return;
  }
  const options = [
    ...quests.map(
      (q) => `${"★".repeat(q.stars)} ${q.label}  1もん${q.goldPerCorrect}G`,
    ),
    "やめる",
  ];
  ui.showList("どの おだいに ちょうせんする?", options, (index) => {
    if (index === null || index >= quests.length) {
      ui.showMessage(["また ちょうせん してね!"], advance);
      return;
    }
    const quest = quests[index];
    const onFinished = (result: {
      skillId: string;
      correct: number;
      total: number;
      gold: number;
      perfect: boolean;
    }) => {
      if (result.skillId !== quest.skillId) return;
      EventBus.off("drill-quest-finished", onFinished);
      if (result.gold > 0) {
        updateSave((s) => ({
          ...s,
          inventory: { ...s.inventory, gold: s.inventory.gold + result.gold },
        }));
        autosave();
      }
      const pages = result.perfect
        ? [
            "ぜんもん せいかい! おみごと!",
            `ボーナスこみで ${result.gold}ゴールドを うけとった!`,
          ]
        : result.gold > 0
          ? [
              `${result.total}もん中 ${result.correct}もん せいかい!`,
              `ほうびに ${result.gold}ゴールドを うけとった!`,
            ]
          : ["ざんねん…。また ちょうせん してね!"];
      ui.showMessage(pages, advance);
    };
    EventBus.on("drill-quest-finished", onFinished);
    EventBus.emit("open-drill-quest", { skillId: quest.skillId });
  });
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
        /* 装備品は DQ 流に「すぐ そうびする?」と聞く */
        if (item.kind === "equip") {
          ui.showMessage([`${item.name}を てにいれた!`], () => {
            ui.showChoice("すぐ そうびする?", (yes) => {
              if (!yes) {
                openList();
                return;
              }
              const next = equipItem(getSave(), "hero", item.id);
              if (next) {
                updateSave(() => next);
                autosave();
                ui.showMessage([`${item.name}を そうびした!`], openList);
              } else {
                openList();
              }
            });
          });
          return;
        }
        ui.showMessage([`${item.name}を てにいれた!`], openList);
      },
    );
  };
  openList();
}
