/*
 * まなびやの「じゅもんの テスト」メニュー。
 * EventCommand には一覧選択がないため はい/いいえ を入れ子にして順に聞く。
 * 章3以降は1つの まなびやで 4つまで (それ以上は 別の町の まなびやに分ける)。
 */

import type { EventCommand } from "../types";

export interface SpellTestEntry {
  spellId: string;
  /* 「ワリダマ (わり算)」のように 呪文名と単元を書く */
  label: string;
}

export function spellTestMenu(entries: readonly SpellTestEntry[]): EventCommand[] {
  const build = (i: number): EventCommand[] => {
    if (i >= entries.length) {
      return [{ type: "message", pages: ["また おいで!"] }];
    }
    return [
      {
        type: "choice",
        prompt: `${entries[i].label} の テスト?`,
        yes: [{ type: "openSpellTest", spellId: entries[i].spellId }],
        no: build(i + 1),
      },
    ];
  };
  return build(0);
}
