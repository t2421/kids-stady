import Phaser, { Scene } from "phaser";
import { GAME_WIDTH } from "../main";
import { sfx } from "../sfx";

interface HudState {
  hearts: number;
  powerLevel: number;
  ladder: readonly string[];
  score: number;
  shieldCharges: number;
  bossPhase: boolean;
}

/*
 * FlightScene に重ねて動くHUD。ハート・パワーラダー・スコア・
 * ボスHPバー・必殺技ボタンを表示する。
 */
export class HudScene extends Scene {
  private heartIcons: Phaser.GameObjects.Image[] = [];
  private shieldIcon!: Phaser.GameObjects.Image;
  private scoreText!: Phaser.GameObjects.Text;
  private timeBar!: Phaser.GameObjects.Rectangle;
  private ladderTexts: Phaser.GameObjects.Text[] = [];
  private bossBarBg!: Phaser.GameObjects.Rectangle;
  private bossBar!: Phaser.GameObjects.Rectangle;
  private bossName!: Phaser.GameObjects.Text;
  private powerBarBg!: Phaser.GameObjects.Rectangle;
  private powerBar!: Phaser.GameObjects.Rectangle;
  private bossHint!: Phaser.GameObjects.Text;

  constructor() {
    super("Hud");
  }

  create(data: { flight: Scene }) {
    const flight = data.flight;
    this.ladderTexts = [];

    /* ハート (ドット絵アイコン) */
    this.heartIcons = [];
    for (let i = 0; i < 3; i++) {
      this.heartIcons.push(this.add.image(28 + i * 34, 24, "ui-heart").setScale(1.1));
    }
    this.shieldIcon = this.add.image(28 + 3 * 34 + 6, 24, "ui-shield").setScale(1.1).setVisible(false);
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

    /* 武器の持続時間ゲージ (ラダーの上) */
    this.powerBarBg = this.add
      .rectangle(GAME_WIDTH / 2, 496, 240, 7, 0x22314f)
      .setVisible(false);
    this.powerBar = this.add
      .rectangle(GAME_WIDTH / 2 - 120, 496, 240, 7, 0xffd93d)
      .setOrigin(0, 0.5)
      .setVisible(false);

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

    /* ボス戦の案内 (右下): ?ドローンを取って正解すれば必殺技 */
    this.bossHint = this.add
      .text(GAME_WIDTH - 14, 522, "❓を とって せいかい → 💥ひっさつ!", {
        fontFamily: "sans-serif",
        fontSize: "17px",
        fontStyle: "bold",
        color: "#9be7ff",
        backgroundColor: "#13264a",
        padding: { x: 12, y: 8 },
      })
      .setOrigin(1, 1)
      .setVisible(false);

    flight.events.on("hud-state", this.onState, this);
    flight.events.on("hud-time", this.onTime, this);
    flight.events.on("hud-boss", this.onBoss, this);
    flight.events.on("hud-boss-clear", this.onBossClear, this);
    flight.events.on("hud-power-timer", this.onPowerTimer, this);
    this.events.once("shutdown", () => {
      flight.events.off("hud-state", this.onState, this);
      flight.events.off("hud-time", this.onTime, this);
      flight.events.off("hud-boss", this.onBoss, this);
      flight.events.off("hud-boss-clear", this.onBossClear, this);
      flight.events.off("hud-power-timer", this.onPowerTimer, this);
    });

    /* 最初のポインタ操作で音を有効化 */
    this.input.once("pointerdown", () => {
      sfx.shoot();
    });

    /* 起動完了 → FlightScene に初期状態の再送を頼む */
    flight.events.emit("hud-request-state");
  }

  private onState(s: HudState) {
    this.heartIcons.forEach((h, i) => h.setTexture(i < s.hearts ? "ui-heart" : "ui-heart-empty"));
    this.shieldIcon.setVisible(s.shieldCharges > 0);
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

    this.bossHint.setVisible(s.bossPhase);
  }

  private onTime(t: { left: number; total: number }) {
    this.timeBar.width = 260 * (1 - t.left / t.total);
  }

  /* 武器の持続時間: 残りわずかで赤点滅 */
  private onPowerTimer(p: { ratio: number; active: boolean }) {
    this.powerBarBg.setVisible(p.active);
    this.powerBar.setVisible(p.active);
    if (!p.active) return;
    this.powerBar.width = 240 * Math.max(0, Math.min(1, p.ratio));
    const low = p.ratio < 0.25;
    this.powerBar.fillColor = low ? 0xff5e5e : 0xffd93d;
    this.powerBar.setAlpha(low && Math.floor(this.time.now / 200) % 2 === 0 ? 0.35 : 1);
  }

  private onBoss(b: { hp: number; maxHp: number; name: string }) {
    this.bossName.setVisible(true).setText(`⚔️ ${b.name}`);
    this.bossBarBg.setVisible(true);
    this.bossBar.setVisible(true);
    this.bossBar.width = 420 * (b.hp / b.maxHp);
    this.timeBar.setVisible(false);
  }

  /* 中ボス撃破 → ボスバーを片付けて進行バーに戻す */
  private onBossClear() {
    this.bossName.setVisible(false);
    this.bossBarBg.setVisible(false);
    this.bossBar.setVisible(false);
    this.timeBar.setVisible(true);
  }
}
