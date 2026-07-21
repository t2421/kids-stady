import Phaser, { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { GAME_WIDTH } from "../main";
import { sfx } from "../sfx";

interface HudState {
  hearts: number;
  powerLevel: number;
  ladder: readonly string[];
  score: number;
  gauge: number;
  gaugeMax: number;
  shieldCharges: number;
  bossPhase: boolean;
}

/*
 * FlightScene に重ねて動くHUD。ハート・パワーラダー・スコア・
 * ボスHPバー・必殺技ボタンを表示する。
 */
export class HudScene extends Scene {
  private heartsText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private timeBar!: Phaser.GameObjects.Rectangle;
  private ladderTexts: Phaser.GameObjects.Text[] = [];
  private bossBarBg!: Phaser.GameObjects.Rectangle;
  private bossBar!: Phaser.GameObjects.Rectangle;
  private bossName!: Phaser.GameObjects.Text;
  private gaugeText!: Phaser.GameObjects.Text;
  private beamBtn!: Phaser.GameObjects.Text;
  private gaugeFull = false;

  constructor() {
    super("Hud");
  }

  create(data: { flight: Scene }) {
    const flight = data.flight;
    this.ladderTexts = [];

    this.heartsText = this.add.text(14, 10, "", { fontFamily: "sans-serif", fontSize: "22px" });
    this.scoreText = this.add
      .text(GAME_WIDTH - 14, 10, "", {
        fontFamily: "sans-serif",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#ffd93d",
      })
      .setOrigin(1, 0);

    /* 残り時間バー (ボス到達までの進行) */
    this.add.rectangle(GAME_WIDTH / 2, 14, 260, 8, 0x22314f).setOrigin(0.5);
    this.timeBar = this.add.rectangle(GAME_WIDTH / 2 - 130, 14, 260, 8, 0x7cfc9a).setOrigin(0, 0.5);

    /* パワーラダー (下部) */
    const ladder = ["れんしゃ", "ダブル", "ミサイル", "レーザー", "オプション", "バリア"];
    const totalW = ladder.length * 96;
    ladder.forEach((label, i) => {
      const t = this.add
        .text((GAME_WIDTH - totalW) / 2 + i * 96 + 48, 522, label, {
          fontFamily: "sans-serif",
          fontSize: "14px",
          fontStyle: "bold",
          color: "#5a6d92",
          backgroundColor: "#13264a",
          padding: { x: 8, y: 5 },
        })
        .setOrigin(0.5, 1);
      this.ladderTexts.push(t);
    });

    /* ボスHPバー */
    this.bossName = this.add
      .text(GAME_WIDTH / 2, 34, "", {
        fontFamily: "sans-serif",
        fontSize: "18px",
        fontStyle: "bold",
        color: "#ff9f9f",
      })
      .setOrigin(0.5)
      .setVisible(false);
    this.bossBarBg = this.add.rectangle(GAME_WIDTH / 2, 56, 420, 14, 0x3a1a2a).setVisible(false);
    this.bossBar = this.add
      .rectangle(GAME_WIDTH / 2 - 210, 56, 420, 14, 0xff5e5e)
      .setOrigin(0, 0.5)
      .setVisible(false);

    /* 必殺技ゲージ+ボタン (右下) */
    this.gaugeText = this.add
      .text(GAME_WIDTH - 14, 486, "", { fontFamily: "sans-serif", fontSize: "18px" })
      .setOrigin(1, 1);
    this.beamBtn = this.add
      .text(GAME_WIDTH - 14, 522, "💥 ひっさつ!", {
        fontFamily: "sans-serif",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#5a6d92",
        backgroundColor: "#13264a",
        padding: { x: 12, y: 8 },
      })
      .setOrigin(1, 1)
      .setInteractive({ useHandCursor: true });
    this.beamBtn.on("pointerdown", () => {
      if (this.gaugeFull) EventBus.emit("beam-pressed");
    });

    flight.events.on("hud-state", this.onState, this);
    flight.events.on("hud-time", this.onTime, this);
    flight.events.on("hud-boss", this.onBoss, this);
    this.events.once("shutdown", () => {
      flight.events.off("hud-state", this.onState, this);
      flight.events.off("hud-time", this.onTime, this);
      flight.events.off("hud-boss", this.onBoss, this);
    });

    /* 最初のポインタ操作で音を有効化 */
    this.input.once("pointerdown", () => {
      sfx.shoot();
    });

    /* 起動完了 → FlightScene に初期状態の再送を頼む */
    flight.events.emit("hud-request-state");
  }

  private onState(s: HudState) {
    this.heartsText.setText("❤️".repeat(s.hearts) + "🤍".repeat(Math.max(0, 3 - s.hearts)) + (s.shieldCharges > 0 ? " 🛡️" : ""));
    this.scoreText.setText(`スコア ${s.score}`);
    this.ladderTexts.forEach((t, i) => {
      if (i < s.powerLevel) {
        t.setColor("#0b1e3a").setBackgroundColor("#ffd93d");
      } else if (i === s.powerLevel) {
        t.setColor("#ffd93d").setBackgroundColor("#2a3c66");
      } else {
        t.setColor("#5a6d92").setBackgroundColor("#13264a");
      }
    });

    this.gaugeFull = s.gauge >= s.gaugeMax;
    if (s.bossPhase) {
      this.gaugeText.setText("⚡".repeat(s.gauge) + "・".repeat(Math.max(0, s.gaugeMax - s.gauge)));
      this.beamBtn.setColor(this.gaugeFull ? "#0b1e3a" : "#5a6d92");
      this.beamBtn.setBackgroundColor(this.gaugeFull ? "#ffd93d" : "#13264a");
      if (this.gaugeFull) {
        this.tweens.add({ targets: this.beamBtn, scale: { from: 1, to: 1.08 }, duration: 300, yoyo: true });
      }
    } else {
      this.gaugeText.setText("");
    }
  }

  private onTime(t: { left: number; total: number }) {
    this.timeBar.width = 260 * (1 - t.left / t.total);
  }

  private onBoss(b: { hp: number; maxHp: number; name: string }) {
    this.bossName.setVisible(true).setText(`👑 ${b.name}`);
    this.bossBarBg.setVisible(true);
    this.bossBar.setVisible(true);
    this.bossBar.width = 420 * (b.hp / b.maxHp);
    this.timeBar.setVisible(false);
  }
}
