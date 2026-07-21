import Phaser, { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { GAME_HEIGHT, GAME_WIDTH } from "../main";

export class TitleScene extends Scene {
  constructor() {
    super("Title");
  }

  create() {
    this.addNightSky();

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.3, "カズクエ", {
        fontFamily: "sans-serif",
        fontSize: "72px",
        fontStyle: "bold",
        color: "#ffd93d",
        stroke: "#3a1f0b",
        strokeThickness: 10,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.45, "〜数の王国と伝説の勇者〜", {
        fontFamily: "sans-serif",
        fontSize: "26px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#3a1f0b",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT * 0.58,
        "じゅもんを おぼえて まおうを たおす さんすうRPG",
        {
          fontFamily: "sans-serif",
          fontSize: "20px",
          color: "#b8cdea",
        },
      )
      .setOrigin(0.5);

    const start = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.75, "▶ タップして ぼうけんに でる", {
        fontFamily: "sans-serif",
        fontSize: "28px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: start,
      alpha: { from: 1, to: 0.35 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    EventBus.emit("current-scene-ready", this);
  }

  /* 夜空にきらめく星 (RPGのオープニング風) */
  private addNightSky() {
    for (let i = 0; i < 60; i++) {
      const star = this.add.image(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT * 0.9),
        "pixel",
      );
      const depth = Phaser.Math.FloatBetween(0.2, 0.8);
      star.setAlpha(depth).setScale(depth);
    }
  }
}
