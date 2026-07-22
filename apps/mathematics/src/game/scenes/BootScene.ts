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

const UI_KEYS = [
  "ui-heart",
  "ui-heart-empty",
  "ui-shield",
  "ui-medal-gold",
  "ui-medal-silver",
  "ui-medal-bronze",
  "ui-lock",
  "ui-planet-1",
  "ui-planet-2",
  "ui-planet-3",
  "ui-planet-4",
  "ui-planet-5",
  "ui-planet-6",
  "ui-crown",
  "ui-rocket",
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
    for (const key of UI_KEYS) {
      this.load.image(key, `assets/sprites/ui/${key}.png`);
    }

    /* Foozle Void シリーズ (CC0)。public/assets/void/CREDITS.md 参照 */
    const v = (name: string) => `assets/void/${name}.png`;
    this.load.image("player-base", v("player-base"));
    this.load.image("player-engine", v("player-engine"));
    this.load.spritesheet("player-engine-fx", v("player-engine-fx"), { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet("proj-bullet", v("proj-bullet"), { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("proj-rocket", v("proj-rocket"), { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet("proj-zapper", v("proj-zapper"), { frameWidth: 32, frameHeight: 32 });
    for (const e of ["scout", "fighter", "bomber", "torpedo"]) {
      this.load.image(`enemy-${e}`, v(`enemy-${e}`));
      this.load.spritesheet(`enemy-${e}-boom`, v(`enemy-${e}-boom`), { frameWidth: 64, frameHeight: 64 });
    }
    this.load.image("enemy-cruiser", v("enemy-cruiser"));
    this.load.spritesheet("enemy-cruiser-boom", v("enemy-cruiser-boom"), { frameWidth: 128, frameHeight: 128 });
    this.load.image("enemy-bullet", v("enemy-bullet"));
    this.load.image("bg-void", v("bg-void"));
    this.load.image("bg-stars1", v("bg-stars1"));
    this.load.image("bg-stars2", v("bg-stars2"));
    this.load.spritesheet("planet-earth", v("planet-earth"), { frameWidth: 96, frameHeight: 96 });
  }

  create() {
    /* ピクセルアートをぼかさず拡大する */
    for (const key of this.textures.getTextureKeys()) {
      if (key === "__DEFAULT" || key === "__MISSING" || key === "__WHITE") continue;
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
    }

    this.createAnimations();
    this.createStarTexture();
    this.createStarfieldLayers();
    this.scene.start("Title");
  }

  private createAnimations() {
    const mk = (key: string, tex: string, end: number, frameRate: number, repeat: number) => {
      if (this.anims.exists(key)) return;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(tex, { start: 0, end }),
        frameRate,
        repeat,
      });
    };
    mk("engine-fx", "player-engine-fx", 3, 14, -1);
    mk("proj-bullet-anim", "proj-bullet", 3, 16, -1);
    mk("proj-rocket-anim", "proj-rocket", 2, 12, -1);
    mk("proj-zapper-anim", "proj-zapper", 7, 20, -1);
    mk("boom-scout", "enemy-scout-boom", 9, 18, 0);
    mk("boom-fighter", "enemy-fighter-boom", 8, 18, 0);
    mk("boom-bomber", "enemy-bomber-boom", 7, 18, 0);
    mk("boom-torpedo", "enemy-torpedo-boom", 9, 18, 0);
    mk("boom-cruiser", "enemy-cruiser-boom", 13, 14, 0);
    mk("planet-spin", "planet-earth", 76, 10, -1);
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
