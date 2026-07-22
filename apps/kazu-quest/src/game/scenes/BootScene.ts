import { Scene } from "phaser";
import { generateAllTextures } from "../textures";
import { getDebugBoot } from "../debugBoot";
import { ensureSession } from "../session";

/*
 * 起動シーン。画像ファイルは使わず、すべてのテクスチャをここで手続き生成する
 * (リポジトリ方針: バイナリアセット0)。ドット絵定義は src/content/art/。
 */
export class BootScene extends Scene {
  constructor() {
    super("Boot");
  }

  create() {
    this.createPixelTexture();
    generateAllTextures(this);

    /* dev: ?map= 指定があればタイトルを飛ばして直接そのマップへ */
    const debug = getDebugBoot();
    if (debug.map) {
      ensureSession();
      this.scene.start("Field", {
        mapId: debug.map.mapId,
        spawn: debug.map.spawn,
      });
      return;
    }
    this.scene.start("Title");
  }

  /* タイトル背景の飾り用 4x4 白ドット */
  private createPixelTexture() {
    const g = this.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture("pixel", 4, 4);
    g.destroy();
  }
}
