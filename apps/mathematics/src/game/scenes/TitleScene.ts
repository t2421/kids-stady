import Phaser, { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { GAME_HEIGHT, GAME_WIDTH } from "../main";
import { getActiveProfileId } from "../session";
import { isDebugMode } from "@/lib/debug";
import { listProfiles } from "@/lib/profiles";

export class TitleScene extends Scene {
  constructor() {
    super("Title");
  }

  create() {
    this.addStarfield();

    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.35, "マスマティクス", {
        fontFamily: "sans-serif",
        fontSize: "64px",
        fontStyle: "bold",
        color: "#ffd93d",
        stroke: "#1a2a55",
        strokeThickness: 8,
      })
      .setOrigin(0.5);

    this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT * 0.52,
        "けいさんで パワーアップする シューティング!",
        {
          fontFamily: "sans-serif",
          fontSize: "22px",
          color: "#b8cdea",
        },
      )
      .setOrigin(0.5);

    const start = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.72, "▶ タップして スタート", {
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

    this.addProfileChip();
    this.addDebugShortcut();

    this.input.on("pointerdown", () => {
      if (getActiveProfileId()) this.scene.start("GradeMap");
    });

    /* プレイヤーを選び直したらチップを更新するため作り直す */
    const onProfileSelected = () => this.scene.restart();
    EventBus.on("profile-selected", onProfileSelected);
    this.events.once("shutdown", () => {
      EventBus.off("profile-selected", onProfileSelected);
    });

    EventBus.emit("current-scene-ready", this);
  }

  /* ?debug=1: タイトルから1タップでボス戦へ (調整用) */
  private addDebugShortcut() {
    if (!isDebugMode()) return;
    const btn = this.add
      .text(GAME_WIDTH - 14, 14, "🐞 ボスから", {
        fontFamily: "sans-serif",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#ffd93d",
        backgroundColor: "#4a2f0e",
        padding: { x: 10, y: 6 },
      })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true });
    btn.on("pointerdown", (
      _p: Phaser.Input.Pointer,
      _x: number,
      _y: number,
      event: Phaser.Types.Input.EventData,
    ) => {
      event.stopPropagation();
      if (!getActiveProfileId()) return;
      this.scene.start("Flight", { grade: 1, bossOnly: true });
    });
  }

  /* 左上にプレイヤー表示。タップでプレイヤー選択に戻れる */
  private addProfileChip() {
    const id = getActiveProfileId();
    const profile = listProfiles().find((p) => p.id === id) ?? null;
    const label = profile ? `${profile.avatar} ${profile.name}` : "";
    const chip = this.add
      .text(18, 14, `${label}  🔁 こうたい`, {
        fontFamily: "sans-serif",
        fontSize: "17px",
        fontStyle: "bold",
        color: "#b8cdea",
        backgroundColor: "#13264a",
        padding: { x: 12, y: 7 },
      })
      .setInteractive({ useHandCursor: true });
    chip.on("pointerdown", (
      _pointer: Phaser.Input.Pointer,
      _x: number,
      _y: number,
      event: Phaser.Types.Input.EventData,
    ) => {
      event.stopPropagation();
      EventBus.emit("request-profile-select");
    });
  }

  private addStarfield() {
    for (let i = 0; i < 80; i++) {
      const star = this.add.image(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        "star",
      );
      const depth = Phaser.Math.FloatBetween(0.3, 1);
      star.setAlpha(depth).setScale(depth);
    }
  }
}
