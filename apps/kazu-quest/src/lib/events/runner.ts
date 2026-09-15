/*
 * EventCommand 列を逐次消化する純ロジックのインタプリタ。
 * シーンから独立しており、Vitest で完全にテストできる。
 *
 * 使い方 (FieldScene 側):
 *   let st = startRun(commands, save);
 *   loop: step(st) → effect を演出 (メッセージ表示・戦闘起動など)
 *         → 結果を input に入れて再度 step(st, input)
 *         → done になるまで繰り返す
 * setFlag / giveItem / giveGold などのデータ操作は step 内で即時 save に
 * 適用され、UI が必要なコマンドだけが effect として外に出る。
 */

import type { EventCommand, FlagCond, LessonEntryPoint } from "../../content/types";
import type { SaveData } from "../save";
import { MEMBERS, memberStats } from "../battle/members";
import { expForLevel } from "../battle/stats";

export type RunnerEffect =
  | { kind: "message"; pages: string[] }
  | { kind: "battle"; monsterIds: string[]; boss: boolean; winFlag?: string }
  | { kind: "transfer"; mapId: string; spawn: string }
  | { kind: "openShop"; shopId: string }
  | { kind: "healInn"; price: number }
  | { kind: "openSpellTest"; spellId: string }
  | { kind: "openDrillBoard" }
  | { kind: "openReviewQuest" }
  /* LP-08/LP-11 が React 画面に差し替えるまでは FieldScene が仮メッセージを出す。
   * entry/skipReadiness は EventCommand の openLesson と同じ意味 (LP-19) */
  | { kind: "openLesson"; skillId: string; entry?: LessonEntryPoint; skipReadiness?: boolean }
  | { kind: "openReview" }
  | { kind: "openPreview" }
  /* まなびやの先生メニュー (LP-18) */
  | {
      kind: "openTeacherMenu";
      entries: { skillId: string; label: string; spellIds?: string[] }[];
    }
  | { kind: "savePoint" }
  | { kind: "choice"; prompt: string }
  | { kind: "quiz"; skillId: string }
  /* 本編クリア → EndingScene。ランは終了 (残りのデータ操作は適用済み) */
  | { kind: "ending" };

export interface RunnerInput {
  choice?: "yes" | "no";
  quizCorrect?: boolean;
}

interface Frame {
  commands: readonly EventCommand[];
  index: number;
}

export interface RunnerState {
  stack: Frame[];
  save: SaveData;
  /* 直前に返した effect (choice の分岐解決に使う) */
  pending: EventCommand | null;
}

/* 習熟状態の順序。skill 条件は「指定状態 以上」で成立する */
const MASTERY_ORDER: Record<string, number> = {
  none: 0,
  practicing: 1,
  can: 2,
  mastered: 3,
};

/*
 * skill 条件が読む mastery の形。SaveData にはまだ mastery が無い (LP-04 が足す) ため、
 * 厳密な型を import せず構造的に必要な部分だけを受け取る。
 * TODO(LP-04): save.mastery が型付けされたら SaveData["mastery"] を直接受け取るよう厳格化する
 */
export type MasteryLookup = Record<string, { state?: string } | undefined> | undefined;

export function evalCond(
  cond: FlagCond | undefined,
  flags: SaveData["flags"],
  /* skill 条件の評価に使う。省略時 (mastery が無いセーブ/呼び出し) は全skillが "none" 扱い */
  mastery?: MasteryLookup,
): boolean {
  if (!cond) return true;
  if ("skill" in cond) {
    const actual = mastery?.[cond.skill]?.state ?? "none";
    const actualRank = MASTERY_ORDER[actual] ?? 0;
    const requiredRank = MASTERY_ORDER[cond.state] ?? 0;
    return actualRank >= requiredRank;
  }
  const value = flags[cond.flag];
  switch (cond.op) {
    case "set":
      return value === true || (typeof value === "number" && value !== 0);
    case "unset":
      return value === undefined || value === false || value === 0;
    case ">=":
      return typeof value === "number" && value >= (cond.value ?? 0);
  }
}

/*
 * npc.hideIf 専用の評価ラッパー (LP-20)。単一条件はそのまま evalCond に委譲し、
 * 配列は AND (全条件が成立して初めて true = 番人が消える)。
 * hideIf 省略時は false (番人は常に表示) — evalCond(undefined,...) の
 * 「条件なし=true」という別の意味論 (dialog.if 等) と混同しないよう分ける。
 */
export function evalHideIf(
  hideIf: FlagCond | FlagCond[] | undefined,
  flags: SaveData["flags"],
  mastery?: MasteryLookup,
): boolean {
  if (!hideIf) return false;
  const conds = Array.isArray(hideIf) ? hideIf : [hideIf];
  return conds.every((cond) => evalCond(cond, flags, mastery));
}

export function startRun(
  commands: readonly EventCommand[],
  save: SaveData,
): RunnerState {
  return { stack: [{ commands, index: 0 }], save, pending: null };
}

export interface StepResult {
  state: RunnerState;
  effect: RunnerEffect | null;
  done: boolean;
}

/*
 * データ操作コマンド (setFlag/giveItem/giveGold/learnSpell/joinParty/advanceChapter)
 * を save に適用する。UI コマンドは無変更で返す。デバッグフック (章スキップ) からも
 * 同じ意味論で再利用するため export する。
 */
export function applyDataCommand(save: SaveData, cmd: EventCommand): SaveData {
  return applyData(save, cmd);
}

function applyData(save: SaveData, cmd: EventCommand): SaveData {
  switch (cmd.type) {
    case "setFlag":
      return {
        ...save,
        flags: { ...save.flags, [cmd.flag]: cmd.value ?? true },
      };
    case "giveItem": {
      const count = cmd.count ?? 1;
      const prev = save.inventory.items[cmd.itemId] ?? 0;
      return {
        ...save,
        inventory: {
          ...save.inventory,
          items: { ...save.inventory.items, [cmd.itemId]: prev + count },
        },
      };
    }
    case "giveGold":
      return {
        ...save,
        inventory: { ...save.inventory, gold: save.inventory.gold + cmd.amount },
      };
    case "learnSpell":
      return {
        ...save,
        party: save.party.map((m) =>
          m.memberId === cmd.memberId && !m.learnedSpells.includes(cmd.spellId)
            ? { ...m, learnedSpells: [...m.learnedSpells, cmd.spellId] }
            : m,
        ),
      };
    case "joinParty": {
      if (save.party.some((m) => m.memberId === cmd.memberId)) return save;
      const def = MEMBERS[cmd.memberId];
      const level = Math.max(1, cmd.level ?? 1);
      const stats = memberStats(cmd.memberId, level);
      return {
        ...save,
        party: [
          ...save.party,
          {
            memberId: cmd.memberId,
            level,
            exp: expForLevel(level),
            hp: stats.maxHp,
            mp: stats.maxMp,
            learnedSpells: [...(def?.initialSpells ?? [])],
            equipment: {},
          },
        ],
      };
    }
    case "advanceChapter":
      return {
        ...save,
        chapter: {
          current: Math.max(save.chapter.current, cmd.chapter),
          cleared: save.chapter.cleared.includes(cmd.chapter - 1)
            ? save.chapter.cleared
            : [...save.chapter.cleared, cmd.chapter - 1],
        },
      };
    default:
      return save;
  }
}

/* 勇者 (party 先頭が原則だが memberId で探す) の現在レベル */
function heroLevel(save: SaveData): number {
  const hero = save.party.find((m) => m.memberId === "hero") ?? save.party[0];
  return hero?.level ?? 1;
}

/* ボス前の看板 (levelSign): 推奨Lv と 現在Lv を並べ、足りなければ まなびやへ誘導する */
export function levelSignPages(level: number, save: SaveData): string[] {
  const current = heroLevel(save);
  return [
    `たてふだ: 『この さきは つよい てき。すいしょう Lv ${level}』`,
    `いまの ゆうしゃは Lv ${current}。`,
    current < level
      ? "まず まなびやか おだいで きたえよう!"
      : "じゅんびは ばっちりだ!",
  ];
}

/*
 * 交換 (exchange): itemId を count 個 減らし give を足す。足りるかの判定は呼び出し側。
 * 0 個になったキーは消す (在庫一覧に「×0」の亡霊を残さない)
 */
function applyExchange(
  save: SaveData,
  cmd: Extract<EventCommand, { type: "exchange" }>,
): SaveData {
  const have = save.inventory.items[cmd.itemId] ?? 0;
  const remaining = have - cmd.count;
  const { [cmd.itemId]: _removed, ...rest } = save.inventory.items;
  const items = remaining > 0 ? { ...rest, [cmd.itemId]: remaining } : rest;
  const giveCount = cmd.give.count ?? 1;
  return {
    ...save,
    inventory: {
      ...save.inventory,
      items: {
        ...items,
        [cmd.give.itemId]: (items[cmd.give.itemId] ?? 0) + giveCount,
      },
    },
  };
}

const DATA_COMMANDS = new Set([
  "setFlag",
  "giveItem",
  "giveGold",
  "learnSpell",
  "joinParty",
  "advanceChapter",
]);

export function step(state: RunnerState, input?: RunnerInput): StepResult {
  let { stack, save, pending } = state;
  stack = stack.map((f) => ({ ...f }));

  /* choice の解決: 選ばれた側の枝をスタックに積む */
  if (pending?.type === "choice" && input?.choice) {
    const branch = input.choice === "yes" ? pending.yes : pending.no;
    stack.push({ commands: branch, index: 0 });
    pending = null;
  }

  /* quiz の解決: 正解/不正解の枝を積む */
  if (pending?.type === "quiz" && input?.quizCorrect !== undefined) {
    const branch = input.quizCorrect ? pending.onCorrect : pending.onWrong;
    stack.push({ commands: branch, index: 0 });
    pending = null;
  }

  for (;;) {
    const frame = stack[stack.length - 1];
    if (!frame) {
      return { state: { stack, save, pending: null }, effect: null, done: true };
    }
    if (frame.index >= frame.commands.length) {
      stack.pop();
      continue;
    }
    const cmd = frame.commands[frame.index];
    frame.index += 1;

    if (DATA_COMMANDS.has(cmd.type)) {
      save = applyData(save, cmd);
      continue;
    }

    /* 交換: 在庫を見て onDone / onShort の枝を積む (UI は枝の中の message が担う) */
    if (cmd.type === "exchange") {
      const have = save.inventory.items[cmd.itemId] ?? 0;
      const enough = have >= cmd.count;
      if (enough) save = applyExchange(save, cmd);
      const branch = enough ? cmd.onDone : cmd.onShort;
      if (branch && branch.length > 0) stack.push({ commands: branch, index: 0 });
      continue;
    }

    /* UI が必要なコマンド → effect として返す */
    switch (cmd.type) {
      case "message":
        return {
          state: { stack, save, pending: cmd },
          effect: { kind: "message", pages: cmd.pages },
          done: false,
        };
      case "choice":
        return {
          state: { stack, save, pending: cmd },
          effect: { kind: "choice", prompt: cmd.prompt },
          done: false,
        };
      case "quiz":
        return {
          state: { stack, save, pending: cmd },
          effect: { kind: "quiz", skillId: cmd.skillId },
          done: false,
        };
      case "battle":
        return {
          state: { stack, save, pending: cmd },
          effect: {
            kind: "battle",
            monsterIds: cmd.monsterIds,
            boss: cmd.boss ?? false,
            winFlag: cmd.winFlag,
          },
          done: false,
        };
      case "transfer":
        /* transfer 後の後続コマンドは意味を持たないため打ち切る */
        return {
          state: { stack: [], save, pending: null },
          effect: { kind: "transfer", mapId: cmd.mapId, spawn: cmd.spawn },
          done: false,
        };
      case "openShop":
        return {
          state: { stack, save, pending: cmd },
          effect: { kind: "openShop", shopId: cmd.shopId },
          done: false,
        };
      case "healInn":
        return {
          state: { stack, save, pending: cmd },
          effect: { kind: "healInn", price: cmd.price },
          done: false,
        };
      case "openSpellTest":
        return {
          state: { stack, save, pending: cmd },
          effect: { kind: "openSpellTest", spellId: cmd.spellId },
          done: false,
        };
      case "openDrillBoard":
        return {
          state: { stack, save, pending: cmd },
          effect: { kind: "openDrillBoard" },
          done: false,
        };
      case "openReviewQuest":
        return {
          state: { stack, save, pending: cmd },
          effect: { kind: "openReviewQuest" },
          done: false,
        };
      case "openLesson":
        return {
          state: { stack, save, pending: cmd },
          effect: {
            kind: "openLesson",
            skillId: cmd.skillId,
            entry: cmd.entry,
            skipReadiness: cmd.skipReadiness,
          },
          done: false,
        };
      case "openReview":
        return {
          state: { stack, save, pending: cmd },
          effect: { kind: "openReview" },
          done: false,
        };
      case "openPreview":
        return {
          state: { stack, save, pending: cmd },
          effect: { kind: "openPreview" },
          done: false,
        };
      case "openTeacherMenu":
        return {
          state: { stack, save, pending: cmd },
          effect: { kind: "openTeacherMenu", entries: cmd.entries },
          done: false,
        };
      case "savePoint":
        return {
          state: { stack, save, pending: cmd },
          effect: { kind: "savePoint" },
          done: false,
        };
      case "levelSign":
        return {
          state: { stack, save, pending: cmd },
          effect: { kind: "message", pages: levelSignPages(cmd.level, save) },
          done: false,
        };
      case "ending":
        /*
         * エンディングでランは終わる (FieldScene は EndingScene へ遷移する)。
         * 後続の UI コマンドは捨てるが、データ操作 — 特に runEvent が末尾に
         * 足す onceFlag の setFlag — は適用しておく。でないとボスイベントが
         * 「未実行」のまま残り、戻ってきたとき再発火する
         */
        return {
          state: { stack: [], save: drainDataCommands(stack, save), pending: null },
          effect: { kind: "ending" },
          done: false,
        };
    }
  }
}

/* スタックに残ったコマンドのうち データ操作だけを順に適用する (UI コマンドは無視) */
function drainDataCommands(stack: readonly Frame[], save: SaveData): SaveData {
  return stack
    .slice()
    .reverse()
    .flatMap((frame) => frame.commands.slice(frame.index))
    .filter((cmd) => DATA_COMMANDS.has(cmd.type))
    .reduce(applyData, save);
}
