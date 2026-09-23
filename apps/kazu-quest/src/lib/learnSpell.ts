/*
 * 呪文の習得 (まなびやテスト合格時)。純関数 — Vitest 対象。
 * 勇者の learnedSpells に足し、ストーリーゲート用の learned.<spellId> フラグも立てる。
 */

import type { SaveData } from "./save";
import { SPELLS } from "../content/spells";

export function learnSpell(save: SaveData, spellId: string): SaveData {
  return {
    ...save,
    flags: { ...save.flags, [`learned.${spellId}`]: true },
    party: save.party.map((m) =>
      m.memberId === "hero" && !m.learnedSpells.includes(spellId)
        ? { ...m, learnedSpells: [...m.learnedSpells, spellId] }
        : m,
    ),
  };
}

/*
 * 単元に 合格したら、その単元が「学習テストの単元」になっている 呪文を おぼえる。
 * まなびやの先生 (TeacherMenu) は 前から そうしていたが、★ めあて (lib/goals.ts) から
 * まなんだときは 呪文が 手に入らず、先取りした子が あとで まなびやで 受けなおす
 * ことになっていた。対応は 先生と同じ learnTest.skillIds[0] (TeacherMenuEntry の規約)。
 * 返り値の spellIds は 新しく おぼえた 呪文だけ (お祝いに 名前を出す)
 */
export function learnSpellsForSkill(
  save: SaveData,
  skillId: string,
): { save: SaveData; spellIds: string[] } {
  const known = new Set(save.party.flatMap((m) => m.learnedSpells));
  const spellIds = Object.values(SPELLS)
    .filter((spell) => spell.learnTest.skillIds[0] === skillId && !known.has(spell.id))
    .map((spell) => spell.id);
  return { save: spellIds.reduce((acc, id) => learnSpell(acc, id), save), spellIds };
}
