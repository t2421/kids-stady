/*
 * イベントランナーの effect のうち、UIフローが長いもの (宿・きろく・
 * 習得テスト・店) のハンドラ。FieldScene の runCommands から呼ばれる。
 * シーンには依存せず、UiScene とセッションだけを使う。
 */

import { EventBus } from "../EventBus";
import { autosave, getSave, updateSave } from "../session";
import { memberStats } from "../../lib/battle/members";
import { equipItem } from "../../lib/battle/equipment";
import { getItem, SHOPS } from "../../content/items";
import { questsForChapter, questsForGrades } from "../../lib/curriculum/drills";
import { SKILLS } from "../../lib/curriculum";
import {
  REVIEW_MEDAL_ITEM_ID,
  REVIEW_PASS_CORRECT,
  REVIEW_QUESTIONS,
  reviewSkillIds,
  type ReviewQuestResult,
} from "../../lib/curriculum/review";
import { applyDataCommand } from "../../lib/events/runner";
import { getChapter } from "../../content/chapters";
import type { SaveData } from "../../lib/save";
import type { UiScene } from "../scenes/UiScene";
import { playSfx } from "../audio/sfx";
import { requestCustomQuiz } from "../battle/mathRequest";
import { cashback, changeChallenge, changeProblem } from "../../lib/shop/change";

/* めがみのほこら: checkpoint を更新して「きろくした!」 */
export function handleSavePoint(
  ui: UiScene,
  checkpoint: { mapId: string; spawn: string },
  advance: () => void,
): void {
  updateSave((save) => ({ ...save, checkpoint }));
  autosave();
  playSfx("save");
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
  playSfx("heal");
  ui.showMessage(["ゆっくり やすんで…", "げんきに なった!"], advance);
}

/* まなびや: とっくん → 習得テスト の流れは spellTestFlow.ts (設計 A4 / KQ-11) */
export { handleSpellTest } from "./spellTestFlow";

/*
 * 現在の章の おだい一覧。章の出題プール (questionGrades、省略時は章の学年) から引く。
 * 章定義が無い番号 (未登録の章) は従来どおり章番号 = 学年として扱う
 */
function currentChapterQuests() {
  const current = getSave().chapter.current;
  const chapter = getChapter(current);
  return chapter ? questsForChapter(chapter) : questsForGrades([current]);
}

/*
 * おだいの けいじばん: 現在の章の出題プールのドリルに挑戦して
 * ゴールドを稼ぐ。★が多い単元ほど 1問あたりの報酬が高い。
 */
export function handleDrillBoard(ui: UiScene, advance: () => void): void {
  const quests = currentChapterQuests();
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

/* 復習の結果を save に反映 (ゴールド + 合格ならメダル)。データ操作はランナーと同じ経路 */
function applyReviewResult(save: SaveData, result: ReviewQuestResult): SaveData {
  const withGold =
    result.gold > 0
      ? applyDataCommand(save, { type: "giveGold", amount: result.gold })
      : save;
  return result.medal
    ? applyDataCommand(withGold, {
        type: "giveItem",
        itemId: REVIEW_MEDAL_ITEM_ID,
        count: 1,
      })
    : withGold;
}

function reviewResultPages(result: ReviewQuestResult): string[] {
  const score = `${result.total}もん中 ${result.correct}もん せいかい`;
  if (result.medal) {
    return [
      `${score}! にがてを のりこえた!`,
      `ひらめきメダルを てにいれた! ほうびに ${result.gold}ゴールドも うけとった!`,
    ];
  }
  if (result.gold > 0) {
    return [
      `${score}。`,
      `ほうびに ${result.gold}ゴールドを うけとった! ${REVIEW_PASS_CORRECT}もん せいかいで メダルだよ。`,
    ];
  }
  return [`${score}…。また ちょうせん してね!`];
}

/*
 * ふくしゅうのほこら (設計 A6 / KQ-13): 弱点スキル3つから 10問。
 * React の ReviewQuestScreen に委譲し、結果でゴールドと ひらめきメダルを渡す。何度でも可
 */
export function handleReviewQuest(ui: UiScene, advance: () => void): void {
  const save = getSave();
  const skillIds = reviewSkillIds(save.skillStats, getChapter(save.chapter.current));
  if (skillIds.length === 0) {
    ui.showMessage(["いまは ふくしゅうする もんだいが ないみたい。"], advance);
    return;
  }
  const labels = skillIds.map((id) => SKILLS.find((s) => s.id === id)?.label ?? id);
  const onFinished = (result: ReviewQuestResult) => {
    EventBus.off("review-quest-finished", onFinished);
    updateSave((s) => applyReviewResult(s, result));
    autosave();
    ui.showMessage(reviewResultPages(result), advance);
  };
  ui.showMessage(
    [
      `きょうの ふくしゅうは 「${labels.join("」「")}」。`,
      `${REVIEW_QUESTIONS}もん中 ${REVIEW_PASS_CORRECT}もん せいかいで ひらめきメダルを あげよう。`,
    ],
    () => {
      EventBus.on("review-quest-finished", onFinished);
      EventBus.emit("open-review-quest", { skillIds });
    },
  );
}

/* お店のおつりチャレンジ (KQ-33) の問いかけ文 (E2E の見分けにも使う) */
export const CHANGE_CHALLENGE_PROMPT =
  "おつりチャレンジに ちょうせんする? (せいかいで 10% もどってくる)";

/*
 * 購入のあとに任意で「おつりは いくら?」を出す。正解で代金の 10% を返金、
 * 不正解はペナルティなし。1 回の買い物につき 1 回だけで、断れる。
 * goldBefore は はらう前の もちがね (はらった額の上限)
 */
function offerChangeChallenge(
  ui: UiScene,
  price: number,
  goldBefore: number,
  next: () => void,
): void {
  const challenge = changeChallenge(price, goldBefore, Math.random);
  if (challenge.change <= 0) {
    next();
    return;
  }
  ui.showChoice(CHANGE_CHALLENGE_PROMPT, (yes) => {
    if (!yes) {
      next();
      return;
    }
    requestCustomQuiz(changeProblem(challenge), (correct) => {
      if (!correct) {
        ui.showMessage([`ざんねん! こたえは ${challenge.answer}G だった。`], next);
        return;
      }
      const back = cashback(price);
      updateSave((s) => applyDataCommand(s, { type: "giveGold", amount: back }));
      autosave();
      ui.showMessage([`せいかい! ${back}G もどってきた!`], next);
    });
  });
}

/* 装備品は DQ 流に「すぐ そうびする?」と聞く */
function askEquip(
  ui: UiScene,
  item: { id: string; name: string },
  next: () => void,
): void {
  ui.showChoice("すぐ そうびする?", (yes) => {
    if (!yes) {
      next();
      return;
    }
    const equipped = equipItem(getSave(), "hero", item.id);
    if (!equipped) {
      next();
      return;
    }
    updateSave(() => equipped);
    autosave();
    ui.showMessage([`${item.name}を そうびした!`], next);
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
        const goldBefore = getSave().inventory.gold;
        if (goldBefore < item.price) {
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
        /* てにいれた! → おつりチャレンジ (任意) → 装備品なら そうびする? → リストへ */
        const afterBuy =
          item.kind === "equip" ? () => askEquip(ui, item, openList) : openList;
        ui.showMessage([`${item.name}を てにいれた!`], () =>
          offerChangeChallenge(ui, item.price, goldBefore, afterBuy),
        );
      },
    );
  };
  openList();
}
