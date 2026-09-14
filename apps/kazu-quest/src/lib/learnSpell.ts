/*
 * 呪文の習得 (まなびやテスト合格時)。純関数 — Vitest 対象。
 * 勇者の learnedSpells に足し、ストーリーゲート用の learned.<spellId> フラグも立てる。
 */

import type { SaveData } from "./save";

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
