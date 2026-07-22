import Phaser, { Scene } from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../main";

/*
 * 起動シーン。スプライトは scripts/gen-sprites.mjs が生成した
 * ピクセルアートPNG (public/assets/sprites/) を読み込む。
 * 星空レイヤーだけはランダム性が欲しいので手続き生成する。
 */

const SPRITE_KEYS = [
  "ship",
  "ship-flame",
  "enemy-ufo",
  "enemy-rock",
  "enemy-bird",
  "enemy-red",
  "boss",
  "capsule",
  "drone",
  "bullet",
  "missile",
  "laser",
  "ebullet",
  "option-orb",
  "shield-bubble",
] as const;

export class BootScene extends Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    for (const key of SPRITE_KEYS) {
      /* 相対パス: dev では /assets/…、Pages では basePath 配下に解決される */
      this.load.image(key, `assets/sprites/${key}.png`);
    }
  }

  create() {
    /* ピクセルアートをぼかさず拡大する */
    for (const key of SPRITE_KEYS) {
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    this.createStarTexture();
    this.createStarfieldLayers();
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
}
