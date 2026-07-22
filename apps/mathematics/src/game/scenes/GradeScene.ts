import Phaser, { Scene } from "phaser";
import { getGrade } from "@/lib/grades";
import type { GradeDef } from "@/lib/grades";
import { isDebugMode } from "@/lib/debug";
import { isOutputUnlocked, loadSave } from "@/lib/save";
import { EventBus } from "../EventBus";
import { GAME_HEIGHT, GAME_WIDTH } from "../main";
import { getActiveProfileId } from "../session";

const MEDALS = ["", "🥉", "🥈", "🥇"];

/* 学年画面: インプットレッスン一覧と出撃ボタン */
export class GradeScene extends Scene {
  private gradeDef!: GradeDef;

  constructor() {
    super("Grade");
  }

  init(data: { grade: number }) {
    const def = getGrade(data.grade);
    if (!def) throw new Error(`unknown grade ${data.grade}`);
    this.gradeDef = def;
  }

  create() {
    const profileId = getActiveProfileId() ?? "";
    const save = loadSave(profileId);
    const progress = save.grades[this.gradeDef.grade];
    const lessonIds = this.gradeDef.lessons.map((l) => l.id);
    const outputReady =
      isOutputUnlocked(save, this.gradeDef.grade, lessonIds) ||
      progress?.outputCleared === true ||
      isDebugMode(); // ?debug=1 ならレッスンのゲートを飛ばす

    if (isDebugMode()) {
      this.add
        .text(GAME_WIDTH - 12, 12, "🐞 debug", {
          fontFamily: "sans-serif",
          fontSize: "14px",
          fontStyle: "bold",
          color: "#ffd93d",
          backgroundColor: "#4a2f0e",
          padding: { x: 8, y: 4 },
        })
        .setOrigin(1, 0);
    }

    this.add
      .text(GAME_WIDTH / 2, 48, `${this.gradeDef.icon} ${this.gradeDef.name}`, {
        fontFamily: "sans-serif",
        fontSize: "34px",
        fontStyle: "bold",
        color: this.gradeDef.color,
        stroke: "#1a2a55",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(GAME_WIDTH / 2, 92, "🔧 せいびドックで きたえて、じゅんびが できたら しゅつげき!", {
        fontFamily: "sans-serif",
        fontSize: "17px",
        color: "#b8cdea",
      })
      .setOrigin(0.5);

    /* レッスンカード */
    this.gradeDef.lessons.forEach((lesson, i) => {
      const y = 170 + i * 92;
      const medal = progress?.inputMedals[lesson.id] ?? 0;
      const card = this.add.container(GAME_WIDTH / 2 - 130, y);
      const bg = this.add.graphics();
      bg.fillStyle(0x0d1e3a, 0.85);
      bg.fillRoundedRect(-230, -36, 460, 72, 18);
      bg.lineStyle(2, medal > 0 ? 0x7cfc9a : 0x3a4a6a, 1);
      bg.strokeRoundedRect(-230, -36, 460, 72, 18);
      card.add(bg);
      card.add(
        this.add.text(-206, -14, `${lesson.partIcon} ${lesson.name}`, {
          fontFamily: "sans-serif",
          fontSize: "21px",
          fontStyle: "bold",
          color: "#ffffff",
        }),
      );
      card.add(
        this.add
          .text(206, 0, medal > 0 ? MEDALS[medal] : "▶", {
            fontFamily: "sans-serif",
            fontSize: "26px",
            color: "#ffd93d",
          })
          .setOrigin(1, 0.5),
      );
      card.setInteractive(
        new Phaser.Geom.Rectangle(-230, -36, 460, 72),
        Phaser.Geom.Rectangle.Contains,
      );
      if (card.input) card.input.cursor = "pointer";
      card.on("pointerdown", () =>
        this.scene.start("Hangar", { grade: this.gradeDef.grade, lessonId: lesson.id }),
      );
    });

    /* 出撃ボタン */
    const launchY = 170 + this.gradeDef.lessons.length * 92 + 26;
    const launch = this.add
      .text(
        GAME_WIDTH / 2 + 210,
        launchY - 40,
        outputReady ? "🚀 しゅつげき!" : "🔒 しゅつげきは レッスンの あとで",
        {
          fontFamily: "sans-serif",
          fontSize: outputReady ? "28px" : "18px",
          fontStyle: "bold",
          color: outputReady ? "#0b1e3a" : "#7a8bad",
          backgroundColor: outputReady ? "#ffd93d" : "#13264a",
          padding: { x: 22, y: 12 },
        },
      )
      .setOrigin(0.5);
    if (outputReady) {
      launch.setInteractive({ useHandCursor: true });
      launch.on("pointerdown", () =>
        this.scene.start("Flight", { grade: this.gradeDef.grade }),
      );
      this.tweens.add({
        targets: launch,
        scale: { from: 1, to: 1.06 },
        duration: 600,
        yoyo: true,
        repeat: -1,
      });

      /* ボス戦だけをやり直したいとき用のショートカット */
      const bossBtn = this.add
        .text(GAME_WIDTH / 2 + 210, launchY + 16, "👑 ボスせんに ちょうせん!", {
          fontFamily: "sans-serif",
          fontSize: "17px",
          fontStyle: "bold",
          color: "#e8c7ff",
          backgroundColor: "#2a1a4a",
          padding: { x: 14, y: 8 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      bossBtn.on("pointerdown", () =>
        this.scene.start("Flight", { grade: this.gradeDef.grade, bossOnly: true }),
      );
    }

    const back = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 28, "← マップへ もどる", {
        fontFamily: "sans-serif",
        fontSize: "19px",
        fontStyle: "bold",
        color: "#b8cdea",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    back.on("pointerdown", () => this.scene.start("GradeMap"));

    EventBus.emit("current-scene-ready", this);
  }
}
