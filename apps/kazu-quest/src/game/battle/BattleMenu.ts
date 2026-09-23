/*
 * 戦闘コマンドウィンドウの選択リスト (カーソル + タップ対応)。
 * ルート/じゅもん/どうぐ の各メニューが同じ見た目・操作を共有する。
 * マスの ならべ方・ページ送りは battleMenuLayout.ts (Phaser 非依存・テスト対象)。
 */

import type { Scene } from "phaser";
import type Phaser from "phaser";
import { BATTLE_MENU_LAYOUT, battleMenuCell, menuPage, type MenuCell } from "./battleMenuLayout";

const FONT_SIZE = 22;
const CELL_PAD = 10;
const COLOR_SELECTED = 0x1a2f55;
const COLOR_BORDER = 0x8aa5d5;

interface CellView {
  cell: MenuCell;
  box: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
}

export class BattleMenu {
  private views: CellView[] = [];
  private labels: string[] = [];
  private page = 0;
  private cursor = 0;
  private onBack: (() => void) | null = null;

  constructor(
    private readonly scene: Scene,
    private readonly onSelect: (index: number) => void,
  ) {}

  /* カーソルがある 項目の 通し番号 (つぎへ / もどる の上なら -1) */
  get index(): number {
    const cell = this.views[this.cursor]?.cell;
    return cell?.kind === "item" ? cell.index : -1;
  }

  get isOpen(): boolean {
    return this.views.length > 0;
  }

  /* back を わたすと「もどる」マスを置く (じゅもん・どうぐ。タッチで ルートへ もどれる) */
  show(labels: string[], back?: () => void): void {
    this.labels = labels;
    this.onBack = back ?? null;
    this.page = 0;
    this.render(0);
  }

  clear(): void {
    this.views.forEach(({ box, text }) => {
      box.destroy();
      text.destroy();
    });
    this.views = [];
  }

  move(delta: number): void {
    if (this.views.length === 0) return;
    const len = this.views.length;
    this.cursor = (this.cursor + delta + len) % len;
    this.refresh();
  }

  confirm(): void {
    if (this.views.length === 0) return;
    this.activate(this.cursor);
  }

  private activate(i: number): void {
    const cell = this.views[i]?.cell;
    if (!cell) return;
    if (cell.kind === "next") {
      this.page += 1;
      this.render(0);
      return;
    }
    if (cell.kind === "back") {
      this.onBack?.();
      return;
    }
    this.cursor = i;
    this.refresh();
    this.onSelect(cell.index);
  }

  private render(cursor: number): void {
    this.clear();
    const { cellW, cellH } = BATTLE_MENU_LAYOUT;
    const cells = menuPage(this.labels, this.page, this.onBack !== null);
    this.views = cells.map((cell, i) => {
      const pos = battleMenuCell(i, this.scene.scale.height);
      /* マス全体を タップ判定にする (文字の形だけ だと 押しそこねる) */
      const box = this.scene.add
        .rectangle(pos.x + 2, pos.y + 2, cellW - 4, cellH - 4, COLOR_SELECTED, 0)
        .setOrigin(0, 0)
        .setStrokeStyle(1, COLOR_BORDER, 0.35)
        .setInteractive({ useHandCursor: true });
      box.on("pointerdown", () => this.activate(i));
      const text = this.scene.add
        .text(pos.x + CELL_PAD, pos.cy, "", {
          fontFamily: "sans-serif",
          fontSize: `${FONT_SIZE}px`,
          color: cell.kind === "item" ? "#ffffff" : "#b9c2d0",
        })
        .setOrigin(0, 0.5);
      return { cell, box, text };
    });
    this.cursor = Math.min(cursor, Math.max(0, this.views.length - 1));
    this.refresh();
  }

  private refresh(): void {
    const maxW = BATTLE_MENU_LAYOUT.cellW - CELL_PAD * 2;
    this.views.forEach(({ cell, box, text }, i) => {
      const selected = i === this.cursor;
      text.setScale(1);
      text.setText(`${selected ? "▶" : "　"}${cell.label}`);
      /* 長い じゅもん名 (ワリキリブレード (MP6) など) は マスに おさまるよう ちぢめる */
      if (text.width > maxW) text.setScale(maxW / text.width);
      box.setFillStyle(COLOR_SELECTED, selected ? 0.9 : 0);
      box.setStrokeStyle(selected ? 2 : 1, COLOR_BORDER, selected ? 0.9 : 0.35);
    });
  }
}
