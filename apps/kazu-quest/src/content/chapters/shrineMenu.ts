/*
 * めがみのほこら の共通メニュー (KQ-13)。
 * choice は はい/いいえ しかないので 2段に分けて聞く:
 *   「ぼうけんを きろくする?」 はい → savePoint
 *                              いいえ → 「にがてな もんだいを ふくしゅうする?」
 *                                        はい → openReviewQuest / いいえ → なにもしない
 * 入れ子の深さは 2 (上限 4 — spellTestMenu と同じ制約)。
 */

import type { EventCommand } from "../types";

export const SHRINE_SAVE_PROMPT = "ぼうけんを きろくする?";
export const SHRINE_REVIEW_PROMPT = "にがてな もんだいを ふくしゅうする?";

export function shrineMenu(): EventCommand[] {
  return [
    {
      type: "choice",
      prompt: SHRINE_SAVE_PROMPT,
      yes: [{ type: "savePoint" }],
      no: [
        {
          type: "choice",
          prompt: SHRINE_REVIEW_PROMPT,
          yes: [{ type: "openReviewQuest" }],
          no: [],
        },
      ],
    },
  ];
}
