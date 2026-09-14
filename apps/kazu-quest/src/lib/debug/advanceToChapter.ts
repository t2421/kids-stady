/*
 * dev/E2E 用: セーブを「第 n 章の開始地点」まで一気に進める純ロジック。
 * 章 1..n-1 のクリアフラグ・cleared 配列・その章で加入する仲間 (コンテンツの
 * joinParty を走査してレベルも一致させる) を、エンジンと同じ applyDataCommand で
 * 適用する。勇者のレベルは加入済み仲間の最高レベル以上に揃える。
 * 画面遷移 (warp) は呼び出し側 (PhaserGame のデバッグフック) が行う。
 */

import type { ChapterDef, EventCommand, MapDef } from "../../content/types";
import { CHAPTERS, getChapter } from "../../content/chapters";
import type { SaveData } from "../save";
import { applyDataCommand } from "../events/runner";
import { expForLevel, heroStats } from "../battle/stats";

export interface PartyJoin {
  memberId: string;
  level: number;
}

export interface ChapterStart {
  mapId: string;
  spawn: string;
}

/* 入れ子 (choice / quiz) も含めてコマンドを平坦化する */
function flattenCommands(commands: readonly EventCommand[]): EventCommand[] {
  return commands.flatMap((cmd) => {
    if (cmd.type === "choice") {
      return [cmd, ...flattenCommands(cmd.yes), ...flattenCommands(cmd.no)];
    }
    if (cmd.type === "quiz") {
      return [cmd, ...flattenCommands(cmd.onCorrect), ...flattenCommands(cmd.onWrong)];
    }
    return [cmd];
  });
}

function collectMapCommands(map: MapDef): EventCommand[] {
  return [
    ...map.events.flatMap((ev) => flattenCommands(ev.commands)),
    ...map.npcs.flatMap((npc) =>
      npc.dialog.flatMap((entry) => flattenCommands(entry.then ?? [])),
    ),
  ];
}

/* その章のコンテンツで加入する仲間 (memberId ごとに最初の joinParty を採用) */
export function collectChapterJoins(chapter: ChapterDef): PartyJoin[] {
  const joins: PartyJoin[] = [];
  for (const map of chapter.maps) {
    for (const cmd of collectMapCommands(map)) {
      if (cmd.type !== "joinParty") continue;
      if (joins.some((j) => j.memberId === cmd.memberId)) continue;
      joins.push({ memberId: cmd.memberId, level: Math.max(1, cmd.level ?? 1) });
    }
  }
  return joins;
}

/* 章の開始地点 (startMap / startSpawn) */
export function chapterStart(chapter: number): ChapterStart {
  const def = getChapter(chapter);
  if (!def) throw new Error(`章 ${chapter} は存在しない`);
  return { mapId: def.startMap, spawn: def.startSpawn };
}

/* 勇者のレベルを最低 level まで引き上げる (既に上ならそのまま) */
function raiseHeroLevel(save: SaveData, level: number): SaveData {
  const stats = heroStats(level);
  return {
    ...save,
    party: save.party.map((m) =>
      m.memberId === "hero" && m.level < level
        ? { ...m, level, exp: expForLevel(level), hp: stats.maxHp, mp: stats.maxMp }
        : m,
    ),
  };
}

/* 開始地点へ location / checkpoint を移す (シーン側の warp が無くても整合する) */
function placeAtChapterStart(save: SaveData, def: ChapterDef): SaveData {
  const map = def.maps.find((m) => m.id === def.startMap);
  const point = map?.spawns[def.startSpawn];
  return {
    ...save,
    checkpoint: { mapId: def.startMap, spawn: def.startSpawn },
    location: {
      mapId: def.startMap,
      x: point?.x ?? 1,
      y: point?.y ?? 1,
      facing: point?.facing ?? "down",
    },
  };
}

/* 章 c をクリア済みにする: clearFlag + advanceChapter(c+1) + その章の仲間加入 */
function clearChapter(save: SaveData, def: ChapterDef): SaveData {
  const commands: EventCommand[] = [
    { type: "setFlag", flag: def.clearFlag },
    { type: "advanceChapter", chapter: def.id + 1 },
    ...collectChapterJoins(def).map(
      (j): EventCommand => ({ type: "joinParty", memberId: j.memberId, level: j.level }),
    ),
  ];
  return commands.reduce(applyDataCommand, save);
}

/*
 * 第 chapter 章の開始状態まで進めた新しい save を返す (元の save は変更しない)。
 * 章 1 を指定すると開始地点へ戻すだけ (フラグは触らない)。
 */
export function advanceSaveToChapter(save: SaveData, chapter: number): SaveData {
  const target = getChapter(chapter);
  if (!target) throw new Error(`章 ${chapter} は存在しない`);
  const previous = CHAPTERS.filter((c) => c.id < chapter);
  const cleared = previous.reduce(clearChapter, save);
  const joinedLevels = previous.flatMap((c) => collectChapterJoins(c).map((j) => j.level));
  const leveled = raiseHeroLevel(cleared, Math.max(1, ...joinedLevels));
  return placeAtChapterStart(leveled, target);
}
