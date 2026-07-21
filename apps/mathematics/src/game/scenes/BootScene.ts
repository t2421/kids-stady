import { Scene } from "phaser";

/*
 * 起動シーン。画像ファイルは使わず、すべてのテクスチャをここで手続き生成する
 * (リポジトリ方針: バイナリアセット0)。
 */
export class BootScene extends Scene {
  constructor() {
    super("Boot");
  }

  create() {
    this.createStarTexture();
    this.scene.start("Title");
  }

  /* パララックス背景用の小さな星テクスチャ */
  private createStarTexture() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(2, 2, 2);
    g.generateTexture("star", 4, 4);
    g.destroy();
  }
}
