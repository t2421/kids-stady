/*
 * 戦闘コマンドの ならべ方 (Phaser 非依存 — E2E からも import する)。
 *
 * 以前は 右はしに 26px 間かくの 1列で、文字の形だけが タップ判定だった
 * (iPad で 1行 およそ 128×28px。行の右を押しても 反応しない)。さらに
 * じゅもん・どうぐ は 5つめより下が 画面の外に はみ出し、タッチでは
 * 「もどる」手段も なかった。
 *
 * いまは メッセージ行の下に 3列 × 2行 の マス を しきつめ、マス全体を
 * タップ判定にする (iPad 横で 1マス およそ 240×54px)。6つより多いときは
 * 「つぎへ」で ページを めくり、じゅもん・どうぐ には かならず「もどる」を置く。
 *
 * 座標は ゲームの論理座標 (幅 960。高さは main.ts の GAME_HEIGHT = 540〜720 で、
 * 戦闘の窓は 画面の下に くっついているので y は 高さからの相対で決める)。
 */

export const BATTLE_MENU_LAYOUT = {
  x: 60,
  /* 画面の下から マスの上端までの きょり (高さ 540 なら y = 424) */
  bottomOffset: 116,
  cols: 3,
  rows: 2,
  cellW: 213,
  cellH: 48,
} as const;

export const BATTLE_MENU_CELLS = BATTLE_MENU_LAYOUT.cols * BATTLE_MENU_LAYOUT.rows;

/* マス i (0 = 左上、よこ→たて の順) の 左上と 中心。gameHeight = いまの GAME_HEIGHT */
export function battleMenuCell(
  i: number,
  gameHeight = 540,
): { x: number; y: number; cx: number; cy: number } {
  const { x, bottomOffset, cols, cellW, cellH } = BATTLE_MENU_LAYOUT;
  const y = gameHeight - bottomOffset;
  const col = i % cols;
  const row = Math.floor(i / cols);
  const left = x + col * cellW;
  const top = y + row * cellH;
  return { x: left, y: top, cx: left + cellW / 2, cy: top + cellH / 2 };
}

export type MenuCell =
  | { kind: "item"; index: number; label: string }
  | { kind: "next"; label: string }
  | { kind: "back"; label: string };

/*
 * 1ページぶんの マス。withBack (じゅもん・どうぐ) なら 最後に「もどる」。
 * 入りきらないときは 4つずつ + 「つぎへ」+「もどる」(ページは まわる)
 */
export function menuPage(labels: readonly string[], page: number, withBack: boolean): MenuCell[] {
  if (!withBack) {
    return labels
      .slice(0, BATTLE_MENU_CELLS)
      .map((label, index) => ({ kind: "item", index, label }));
  }
  const fitsOnePage = labels.length <= BATTLE_MENU_CELLS - 1;
  const perPage = fitsOnePage ? BATTLE_MENU_CELLS - 1 : BATTLE_MENU_CELLS - 2;
  const pages = pageCount(labels.length, withBack);
  const p = ((page % pages) + pages) % pages;
  const start = p * perPage;
  const items: MenuCell[] = labels
    .slice(start, start + perPage)
    .map((label, i) => ({ kind: "item", index: start + i, label }));
  const nav: MenuCell[] = fitsOnePage
    ? []
    : [{ kind: "next", label: `つぎへ ▶ ${p + 1}/${pages}` }];
  return [...items, ...nav, { kind: "back", label: "もどる" }];
}

export function pageCount(count: number, withBack: boolean): number {
  if (!withBack || count <= BATTLE_MENU_CELLS - 1) return 1;
  return Math.max(1, Math.ceil(count / (BATTLE_MENU_CELLS - 2)));
}
