import Phaser, { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { GAME_HEIGHT, GAME_WIDTH } from "../main";
import { getSave } from "../session";
import { fadeIn, fadeOutThen } from "../transition";
import { playBgm } from "../audio/bgm";
import { buildEndingSummary, ORB_COLORS } from "../../lib/ending";

/*
 * エンディング (KQ-22)。
 * 黒背景に 6つの数晶が順に点灯 → 「あなたの ぼうけん」の集計が下からせり上がる
 * → 「— おしまい —」→ タップでタイトルへ。
 * 演出中のタップは最終状態へスキップ (子どもの誤タップで見逃さない)。
 * 集計の中身は lib/ending.ts (純関数)。セーブの更新は FieldScene が済ませている。
 */

const ORB_Y = 104;
const ORB_RADIUS = 22;
const ORB_GAP = 96;
const ORB_START_DELAY_MS = 600;
const ORB_INTERVAL_MS = 650;
const SUMMARY_DELAY_MS = 700;
const SUMMARY_SCROLL_MS = 6500;
const SUMMARY_TOP_Y = 176;
const ROW_HEIGHT = 46;
const ROW_HALF_WIDTH = 230;

const FONT = "sans-serif";
const DIM_ALPHA = 0.18;

export class EndingScene extends Scene {
  /* E2E から読む: 演出が終わり、次のタップでタイトルへ戻れる状態 */
  readyToLeave = false;
  private leaving = false;
  private orbs: Phaser.GameObjects.Arc[] = [];
  private halos: Phaser.GameObjects.Arc[] = [];
  private highlights: Phaser.GameObjects.Arc[] = [];
  private summary!: Phaser.GameObjects.Container;
  private prompt!: Phaser.GameObjects.Text;

  constructor() {
    super("Ending");
  }

  create() {
    this.readyToLeave = false;
    this.leaving = false;
    this.orbs = [];
    this.halos = [];
    this.highlights = [];
    this.cameras.main.setBackgroundColor("#000000");
    playBgm("ending");

    this.buildOrbs();
    this.buildSummary();
    this.buildPrompt();
    fadeIn(this);

    this.time.delayedCall(ORB_START_DELAY_MS, () => this.lightOrb(0));

    this.input.on("pointerdown", () => this.onTap());
    this.input.keyboard?.on("keydown-ENTER", () => this.onTap());
    this.input.keyboard?.on("keydown-SPACE", () => this.onTap());

    EventBus.emit("current-scene-ready", this);
  }

  /* ---------- 数晶 ---------- */

  private buildOrbs() {
    const startX = GAME_WIDTH / 2 - (ORB_GAP * (ORB_COLORS.length - 1)) / 2;
    ORB_COLORS.forEach((color, i) => {
      const x = startX + ORB_GAP * i;
      const halo = this.add
        .circle(x, ORB_Y, ORB_RADIUS + 12, color, 0.35)
        .setAlpha(0)
        .setDepth(1);
      const orb = this.add
        .circle(x, ORB_Y, ORB_RADIUS, color, 1)
        .setAlpha(DIM_ALPHA)
        .setDepth(2);
      /* ハイライト (左上の小さな白) */
      const highlight = this.add
        .circle(x - 7, ORB_Y - 8, 5, 0xffffff, 0.9)
        .setAlpha(DIM_ALPHA)
        .setDepth(3);
      this.halos.push(halo);
      this.orbs.push(orb);
      this.highlights.push(highlight);
    });
  }

  private lightOrb(index: number) {
    if (this.readyToLeave) return;
    if (index >= this.orbs.length) {
      this.time.delayedCall(SUMMARY_DELAY_MS, () => this.startScroll());
      return;
    }
    this.setOrbLit(index);
    const orb = this.orbs[index];
    this.tweens.add({
      targets: orb,
      scale: { from: 1.5, to: 1 },
      duration: 420,
      ease: "Back.easeOut",
    });
    this.tweens.add({
      targets: this.halos[index],
      alpha: { from: 0, to: 1 },
      scale: { from: 0.6, to: 1 },
      duration: 500,
      ease: "Sine.easeOut",
    });
    this.time.delayedCall(ORB_INTERVAL_MS, () => this.lightOrb(index + 1));
  }

  private setOrbLit(index: number) {
    this.orbs[index].setAlpha(1);
    this.halos[index].setAlpha(1).setScale(1);
    this.highlights[index].setAlpha(1);
  }

  /* ---------- 集計 ---------- */

  private buildSummary() {
    const rows = buildEndingSummary(getSave());
    const items: Phaser.GameObjects.GameObject[] = [];

    items.push(
      this.add
        .text(0, 0, "あなたの ぼうけん", {
          fontFamily: FONT,
          fontSize: "34px",
          fontStyle: "bold",
          color: "#ffd93d",
        })
        .setOrigin(0.5, 0),
    );

    rows.forEach((row, i) => {
      const y = 76 + ROW_HEIGHT * i;
      items.push(
        this.add
          .text(-ROW_HALF_WIDTH, y, row.label, {
            fontFamily: FONT,
            fontSize: "26px",
            color: "#b8cdea",
          })
          .setOrigin(0, 0),
        this.add
          .text(ROW_HALF_WIDTH, y, row.value, {
            fontFamily: FONT,
            fontSize: "26px",
            fontStyle: "bold",
            color: "#ffffff",
          })
          .setOrigin(1, 0),
      );
    });

    items.push(
      this.add
        .text(0, 76 + ROW_HEIGHT * rows.length + 40, "— おしまい —", {
          fontFamily: FONT,
          fontSize: "30px",
          fontStyle: "bold",
          color: "#ffffff",
        })
        .setOrigin(0.5, 0),
    );

    this.summary = this.add
      .container(GAME_WIDTH / 2, GAME_HEIGHT + 40, items)
      .setDepth(5)
      .setAlpha(0);
  }

  private startScroll() {
    if (this.readyToLeave) return;
    this.summary.setAlpha(1);
    this.tweens.add({
      targets: this.summary,
      y: SUMMARY_TOP_Y,
      duration: SUMMARY_SCROLL_MS,
      ease: "Sine.easeOut",
      onComplete: () => this.finish(),
    });
    /* tween の onComplete が高負荷で発火しない保険 (transition.ts と同じ理由) */
    this.time.delayedCall(SUMMARY_SCROLL_MS + 400, () => this.finish());
  }

  /* ---------- 終了・入力 ---------- */

  private buildPrompt() {
    this.prompt = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 30, "タップで タイトルへ", {
        fontFamily: FONT,
        fontSize: "24px",
        fontStyle: "bold",
        color: "#ffffff",
        stroke: "#101a30",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(6)
      .setAlpha(0);
  }

  /* 最終状態にそろえる (演出完了時・スキップ時どちらからも呼ばれる) */
  private finish() {
    if (this.readyToLeave) return;
    this.readyToLeave = true;
    this.tweens.killAll();
    this.time.removeAllEvents();
    this.orbs.forEach((_, i) => {
      this.setOrbLit(i);
      this.orbs[i].setScale(1);
    });
    this.summary.setAlpha(1).setY(SUMMARY_TOP_Y);
    this.prompt.setAlpha(1);
    this.tweens.add({
      targets: this.prompt,
      alpha: { from: 1, to: 0.35 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    });
  }

  private onTap() {
    if (this.leaving) return;
    if (!this.readyToLeave) {
      this.finish();
      return;
    }
    this.leaving = true;
    fadeOutThen(this, () => this.scene.start("Title"));
  }
}
