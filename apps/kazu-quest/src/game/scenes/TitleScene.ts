import Phaser, { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { GAME_HEIGHT, GAME_WIDTH } from "../main";
import { ensureSession, getSave } from "../session";
import { actorTextureKey } from "../textures";
import { fadeOutThen } from "../transition";

export class TitleScene extends Scene {
  constructor() {
    super("Title");
  }

  create() {
    this.buildScenery();

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.26, "カズクエ", {
        fontFamily: "sans-serif",
        fontSize: "76px",
        fontStyle: "bold",
        color: "#ffd93d",
        stroke: "#3a1f0b",
        strokeThickness: 10,
      })
      .setOrigin(0.5)
      .setDepth(10)
      .setShadow(0, 6, "#00000088", 8, true, true);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.41, "〜数の王国と伝説の勇者〜", {
        fontFamily: "sans-serif",
        fontSize: "26px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#3a1f0b",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT * 0.52,
        "じゅもんを おぼえて まおうを たおす さんすうRPG",
        {
          fontFamily: "sans-serif",
          fontSize: "20px",
          color: "#b8cdea",
        },
      )
      .setOrigin(0.5)
      .setDepth(10);

    const start = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.86, "▶ タップして ぼうけんに でる", {
        fontFamily: "sans-serif",
        fontSize: "28px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#101a30",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.tweens.add({
      targets: start,
      alpha: { from: 1, to: 0.35 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.input.once("pointerdown", () => this.startAdventure());
    this.input.keyboard?.once("keydown-ENTER", () => this.startAdventure());
    this.input.keyboard?.once("keydown-SPACE", () => this.startAdventure());

    EventBus.emit("current-scene-ready", this);
  }

  /* プロフィール選択UI (React) は M8 で挟まる。まずはセーブ位置から冒険再開 */
  private startAdventure() {
    ensureSession();
    const save = getSave();
    fadeOutThen(this, () => {
      this.scene.start("Field", { mapId: save.location.mapId });
    });
  }

  /*
   * 夜のオープニング絵: 星空グラデーション + 月 + 遠くの城のシルエット +
   * 丘に立つ勇者。すべて図形とゲーム内テクスチャで描く (画像アセットなし)。
   */
  private buildScenery() {
    const skyBands = [0x0a1026, 0x101a3a, 0x18264e, 0x243560];
    const bandH = GAME_HEIGHT / skyBands.length;
    skyBands.forEach((color, i) => {
      this.add
        .rectangle(GAME_WIDTH / 2, bandH * i + bandH / 2, GAME_WIDTH, bandH + 1, color, 1)
        .setDepth(-30);
    });

    /* またたく星 */
    for (let i = 0; i < 70; i++) {
      const star = this.add
        .image(
          Phaser.Math.Between(0, GAME_WIDTH),
          Phaser.Math.Between(0, Math.round(GAME_HEIGHT * 0.7)),
          "pixel",
        )
        .setDepth(-29);
      const depth = Phaser.Math.FloatBetween(0.25, 0.9);
      star.setAlpha(depth).setScale(depth * 1.4);
      if (i % 3 === 0) {
        this.tweens.add({
          targets: star,
          alpha: depth * 0.25,
          duration: Phaser.Math.Between(600, 1600),
          yoyo: true,
          repeat: -1,
          delay: Phaser.Math.Between(0, 1200),
        });
      }
    }

    /* 月 (満月 + クレーター) */
    this.add.circle(GAME_WIDTH - 150, 92, 44, 0xf5edc8, 1).setDepth(-28);
    this.add.circle(GAME_WIDTH - 162, 80, 9, 0xdcd2a8, 1).setDepth(-27);
    this.add.circle(GAME_WIDTH - 136, 104, 6, 0xdcd2a8, 1).setDepth(-27);
    this.add.circle(GAME_WIDTH - 150, 92, 52).setStrokeStyle(6, 0xf5edc8, 0.18).setDepth(-28);

    /* 丘のシルエット (2層) */
    for (let i = 0; i < 7; i++) {
      const x = (GAME_WIDTH / 6) * i;
      this.add.circle(x, GAME_HEIGHT + 40, 150 + (i % 3) * 40, 0x101a30, 1).setDepth(-26);
    }
    this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 30, GAME_WIDTH, 90, 0x0b1222, 1)
      .setDepth(-24);

    /* 遠くの城 (右手の丘の上) */
    const cx = GAME_WIDTH - 210;
    const cy = GAME_HEIGHT - 168;
    const sil = 0x0d1526;
    this.add.rectangle(cx, cy, 150, 110, sil, 1).setDepth(-25);
    for (let i = 0; i < 4; i++) {
      this.add.rectangle(cx - 57 + i * 38, cy - 62, 22, 18, sil, 1).setDepth(-25);
    }
    this.add.rectangle(cx - 92, cy - 12, 44, 160, sil, 1).setDepth(-25);
    this.add.rectangle(cx + 92, cy - 12, 44, 160, sil, 1).setDepth(-25);
    /* 塔のとんがり屋根 (塔の上端に重ねる) */
    this.add.triangle(cx - 92, cy - 88, 0, -30, 32, 20, -32, 20, 0x131d33, 1).setDepth(-25);
    this.add.triangle(cx + 92, cy - 88, 0, -30, 32, 20, -32, 20, 0x131d33, 1).setDepth(-25);
    /* 灯りのともる窓 */
    for (const [wx, wy] of [
      [cx - 92, cy - 30],
      [cx + 92, cy - 30],
      [cx - 20, cy + 6],
      [cx + 24, cy - 18],
    ] as const) {
      this.add.rectangle(wx, wy, 8, 12, 0xffd93d, 0.9).setDepth(-24);
    }

    /* 丘に立つ勇者 (うしろ姿で城を見つめる)。スタート文言と重ねない位置 */
    const hero = this.add
      .image(GAME_WIDTH * 0.19, GAME_HEIGHT - 138, actorTextureKey("heroUp"))
      .setScale(8)
      .setDepth(-23);
    this.add
      .ellipse(GAME_WIDTH * 0.19, GAME_HEIGHT - 76, 90, 20, 0x000000, 0.35)
      .setDepth(-23);
    this.tweens.add({
      targets: hero,
      y: hero.y - 4,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
