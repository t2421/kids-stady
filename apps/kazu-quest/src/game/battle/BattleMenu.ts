/*
 * 戦闘コマンドウィンドウの選択リスト (カーソル + タップ対応)。
 * ルート/じゅもん/どうぐ の各メニューが同じ見た目・操作を共有する。
 */

import type { Scene } from "phaser";
import type Phaser from "phaser";

export class BattleMenu {
  private texts: Phaser.GameObjects.Text[] = [];
  private labels: string[] = [];
  private _index = 0;

  constructor(
    private readonly scene: Scene,
    private readonly x: number,
    private readonly y: number,
    private readonly onSelect: (index: number) => void,
  ) {}

  get index(): number {
    return this._index;
  }

  get isOpen(): boolean {
    return this.texts.length > 0;
  }

  show(labels: string[]): void {
    this.clear();
    this.labels = labels;
    this._index = 0;
    labels.forEach((_, i) => {
      const text = this.scene.add
        .text(this.x, this.y + i * 26, "", {
          fontFamily: "sans-serif",
          fontSize: "22px",
          color: "#ffffff",
        })
        .setInteractive();
      text.on("pointerdown", () => {
        this._index = i;
        this.refresh();
        this.onSelect(i);
      });
      this.texts.push(text);
    });
    this.refresh();
  }

  clear(): void {
    this.texts.forEach((t) => t.destroy());
    this.texts = [];
    this.labels = [];
  }

  move(delta: number): void {
    if (this.texts.length === 0) return;
    const len = this.texts.length;
    this._index = (this._index + delta + len) % len;
    this.refresh();
  }

  confirm(): void {
    if (this.texts.length === 0) return;
    this.onSelect(this._index);
  }

  private refresh(): void {
    this.texts.forEach((t, i) => {
      t.setText(`${i === this._index ? "▶" : "　"} ${this.labels[i] ?? ""}`);
    });
  }
}
