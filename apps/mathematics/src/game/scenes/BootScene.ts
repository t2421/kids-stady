import Phaser, { Scene } from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../main";

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
    this.createStarfieldLayers();
    this.createShip();
    this.createBullets();
    this.createEnemies();
    this.createCapsule();
    this.createBoss();
    this.scene.start("Title");
  }

  private g(): Phaser.GameObjects.Graphics {
    return this.make.graphics({ x: 0, y: 0 }, false);
  }

  /* パララックス背景用の小さな星テクスチャ */
  private createStarTexture() {
    const g = this.g();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(2, 2, 2);
    g.generateTexture("star", 4, 4);
    g.destroy();
  }

  /* 画面サイズの星空3層 (TileSprite でスクロール) */
  private createStarfieldLayers() {
    const layers: Array<{ key: string; count: number; maxR: number; alpha: number }> = [
      { key: "stars-far", count: 70, maxR: 1.2, alpha: 0.5 },
      { key: "stars-mid", count: 45, maxR: 1.8, alpha: 0.75 },
      { key: "stars-near", count: 24, maxR: 2.4, alpha: 1 },
    ];
    for (const layer of layers) {
      const g = this.g();
      for (let i = 0; i < layer.count; i++) {
        g.fillStyle(0xffffff, layer.alpha * Phaser.Math.FloatBetween(0.5, 1));
        g.fillCircle(
          Phaser.Math.Between(2, GAME_WIDTH - 2),
          Phaser.Math.Between(2, GAME_HEIGHT - 2),
          Phaser.Math.FloatBetween(0.6, layer.maxR),
        );
      }
      g.generateTexture(layer.key, GAME_WIDTH, GAME_HEIGHT);
      g.destroy();
    }
  }

  /* 自機: 右向きの宇宙戦闘機 */
  private createShip() {
    const g = this.g();
    /* 尾翼 */
    g.fillStyle(0x2e6fd8, 1);
    g.fillTriangle(2, 4, 18, 18, 2, 32);
    /* 機体 */
    g.fillStyle(0x5ab8ff, 1);
    g.fillTriangle(6, 18, 52, 10, 52, 26);
    g.fillEllipse(30, 18, 44, 18);
    /* コクピット */
    g.fillStyle(0xffe28a, 1);
    g.fillEllipse(38, 16, 12, 8);
    /* エンジン光 */
    g.fillStyle(0xff9f43, 1);
    g.fillEllipse(6, 18, 8, 10);
    g.generateTexture("ship", 56, 36);
    g.destroy();

    /* オプション (子機オーブ) */
    const o = this.g();
    o.fillStyle(0xffd93d, 0.35);
    o.fillCircle(10, 10, 10);
    o.fillStyle(0xffd93d, 1);
    o.fillCircle(10, 10, 6);
    o.generateTexture("option-orb", 20, 20);
    o.destroy();

    /* バリア/シールドバブル */
    const s = this.g();
    s.lineStyle(3, 0x7cfc9a, 0.9);
    s.strokeCircle(34, 34, 31);
    s.fillStyle(0x7cfc9a, 0.14);
    s.fillCircle(34, 34, 31);
    s.generateTexture("shield-bubble", 68, 68);
    s.destroy();
  }

  private createBullets() {
    /* 自機弾 */
    const b = this.g();
    b.fillStyle(0xffe28a, 1);
    b.fillRoundedRect(0, 0, 14, 4, 2);
    b.generateTexture("bullet", 14, 4);
    b.destroy();

    /* ミサイル */
    const m = this.g();
    m.fillStyle(0xff9f43, 1);
    m.fillRoundedRect(0, 2, 12, 5, 2);
    m.fillStyle(0xffdd66, 1);
    m.fillTriangle(12, 0, 18, 4.5, 12, 9);
    m.generateTexture("missile", 18, 9);
    m.destroy();

    /* レーザー */
    const l = this.g();
    l.fillStyle(0x9be7ff, 0.5);
    l.fillRect(0, 0, 42, 8);
    l.fillStyle(0xe6f9ff, 1);
    l.fillRect(0, 2, 42, 4);
    l.generateTexture("laser", 42, 8);
    l.destroy();

    /* 敵弾 */
    const e = this.g();
    e.fillStyle(0xff7b7b, 1);
    e.fillCircle(5, 5, 5);
    e.fillStyle(0xffd1d1, 1);
    e.fillCircle(5, 5, 2.2);
    e.generateTexture("ebullet", 10, 10);
    e.destroy();
  }

  private createEnemies() {
    /* プチUFO (サイン波) */
    const u = this.g();
    u.fillStyle(0xc86bff, 1);
    u.fillEllipse(18, 14, 34, 12);
    u.fillStyle(0xe8c7ff, 1);
    u.fillEllipse(18, 9, 16, 12);
    u.fillStyle(0xffd93d, 1);
    [6, 18, 30].forEach((x) => u.fillCircle(x, 16, 2.2));
    u.generateTexture("enemy-ufo", 36, 22);
    u.destroy();

    /* ぐるぐる隕石 */
    const r = this.g();
    r.fillStyle(0xb08968, 1);
    r.fillCircle(16, 16, 14);
    r.fillStyle(0x8a6a50, 1);
    r.fillCircle(10, 12, 4);
    r.fillCircle(22, 20, 5);
    r.fillCircle(20, 8, 2.5);
    r.generateTexture("enemy-rock", 32, 32);
    r.destroy();

    /* つっこみ鳥 */
    const b = this.g();
    b.fillStyle(0x3ec46d, 1);
    b.fillEllipse(16, 14, 26, 16);
    b.fillTriangle(28, 10, 38, 14, 28, 18); /* くちばし... 左向きに飛ぶので右がしっぽ */
    b.fillStyle(0x2a9a52, 1);
    b.fillTriangle(6, 6, 16, 14, 6, 14);
    b.fillStyle(0xffffff, 1);
    b.fillCircle(10, 12, 3);
    b.fillStyle(0x0b1e3a, 1);
    b.fillCircle(9, 12, 1.5);
    b.generateTexture("enemy-bird", 40, 28);
    b.destroy();

    /* 赤い編隊機 (全滅で確定カプセル) */
    const f = this.g();
    f.fillStyle(0xff5e5e, 1);
    f.fillTriangle(34, 4, 2, 14, 34, 24);
    f.fillStyle(0xffb1b1, 1);
    f.fillEllipse(22, 14, 16, 10);
    f.generateTexture("enemy-red", 36, 28);
    f.destroy();
  }

  private createCapsule() {
    const c = this.g();
    c.fillStyle(0xffd93d, 0.25);
    c.fillCircle(20, 20, 19);
    c.fillStyle(0xffd93d, 1);
    c.fillCircle(20, 20, 13);
    c.generateTexture("capsule", 40, 40);
    c.destroy();

    /* ボス戦の問題ドローン */
    const d = this.g();
    d.fillStyle(0x9be7ff, 0.3);
    d.fillCircle(22, 22, 21);
    d.fillStyle(0x5ab8ff, 1);
    d.fillCircle(22, 22, 14);
    d.generateTexture("drone", 44, 44);
    d.destroy();
  }

  private createBoss() {
    const g = this.g();
    /* 王冠つきの大型モンスター */
    g.fillStyle(0x8447ff, 1);
    g.fillRoundedRect(10, 30, 120, 90, 26);
    g.fillStyle(0x6a30d9, 1);
    g.fillRoundedRect(10, 84, 120, 36, { tl: 0, tr: 0, bl: 26, br: 26 });
    /* 目 */
    g.fillStyle(0xffffff, 1);
    g.fillCircle(45, 66, 13);
    g.fillCircle(95, 66, 13);
    g.fillStyle(0x0b1e3a, 1);
    g.fillCircle(41, 66, 6);
    g.fillCircle(91, 66, 6);
    /* 口 */
    g.fillStyle(0x0b1e3a, 1);
    g.fillRoundedRect(48, 92, 44, 14, 7);
    /* 王冠 */
    g.fillStyle(0xffd93d, 1);
    g.fillTriangle(40, 30, 48, 8, 58, 30);
    g.fillTriangle(58, 30, 70, 4, 82, 30);
    g.fillTriangle(82, 30, 92, 8, 100, 30);
    g.generateTexture("boss", 140, 124);
    g.destroy();
  }
}
