import Phaser, { Scene } from "phaser";
import { addVoidBackdrop, scrollBackdrop } from "../backdrop";
import { EventBus } from "../EventBus";
import { GAME_HEIGHT, GAME_WIDTH } from "../main";
import { getActiveProfileId } from "../session";
import { isDebugMode } from "@/lib/debug";
import { listProfiles } from "@/lib/profiles";

export class TitleScene extends Scene {
  private layers: Phaser.GameObjects.TileSprite[] = [];

  constructor() {
    super("Title");
  }

  create() {
    /* ゲーム本編と同じ Void の宇宙 */
    this.layers = addVoidBackdrop(this);

    /* 主役の自機: エンジンを噴かしながらゆったり浮遊 */
    const shipY = GAME_HEIGHT * 0.56;
    const engineFx = this.add.sprite(GAME_WIDTH / 2, shipY, "player-engine-fx").setAngle(90).setScale(2.6);
    engineFx.play("engine-fx");
    const engineMount = this.add.image(GAME_WIDTH / 2, shipY, "player-engine").setAngle(90).setScale(2.6);
    const shipBase = this.add.image(GAME_WIDTH / 2, shipY, "player-base").setAngle(90).setScale(2.6);
    this.tweens.add({
      targets: [engineFx, engineMount, shipBase],
      y: shipY - 14,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    /* 護衛のオプションオーブ (左右にふわふわ) */
    for (const dx of [-110, 110]) {
      const orb = this.add.image(GAME_WIDTH / 2 + dx, shipY + 8, "option-orb").setScale(1.4);
      this.tweens.add({
        targets: orb,
        y: shipY - 8,
        duration: 1300,
        yoyo: true,
        repeat: -1,
        delay: dx > 0 ? 300 : 0,
        ease: "Sine.easeInOut",
      });
    }

    const title = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.26, "マスマティクス", {
        fontFamily: "sans-serif",
        fontSize: "68px",
        fontStyle: "bold",
        color: "#ffd93d",
        stroke: "#2a1a4a",
        strokeThickness: 10,
        shadow: { offsetY: 6, color: "#0a0618", fill: true },
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: title,
      scale: { from: 1, to: 1.03 },
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT * 0.38,
        "けいさんで パワーアップする シューティング!",
        {
          fontFamily: "sans-serif",
          fontSize: "22px",
          fontStyle: "bold",
          color: "#c8bfe8",
          stroke: "#0a0618",
          strokeThickness: 4,
        },
      )
      .setOrigin(0.5);

    const start = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.82, "▶ タップして スタート", {
        fontFamily: "sans-serif",
        fontSize: "28px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#0a0618",
        strokeThickness: 5,
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

  update(_time: number, deltaMs: number) {
    scrollBackdrop(this.layers, Math.min(deltaMs / 1000, 1 / 20), 0.5);
  }
}
