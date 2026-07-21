import Phaser, { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { GAME_HEIGHT, GAME_WIDTH } from "../main";
import { getActiveProfileId } from "../session";
import { GRADES } from "@/lib/grades";
import { loadSave } from "@/lib/save";

const CARD_W = 260;
const CARD_H = 150;
const GAP_X = 40;
const GAP_Y = 34;

/* 6学年を惑星カードで並べるステージ選択マップ */
export class GradeMapScene extends Scene {
  constructor() {
    super("GradeMap");
  }

  create() {
    const profileId = getActiveProfileId();
    const save = profileId ? loadSave(profileId) : null;
    const unlockedGrade = save?.unlockedGrade ?? 1;

    this.add
      .text(GAME_WIDTH / 2, 44, "どの ほしへ いく?", {
        fontFamily: "sans-serif",
        fontSize: "32px",
        fontStyle: "bold",
        color: "#ffd93d",
        stroke: "#1a2a55",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    const gridW = 3 * CARD_W + 2 * GAP_X;
    const startX = (GAME_WIDTH - gridW) / 2 + CARD_W / 2;
    const startY = 150;

    GRADES.forEach((g, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = startX + col * (CARD_W + GAP_X);
      const y = startY + row * (CARD_H + GAP_Y);
      const unlocked = g.implemented && g.grade <= unlockedGrade;
      this.addGradeCard(x, y, g.grade, g.name, g.icon, g.color, g.teaser, unlocked);
    });

    const back = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 30, "← タイトルへ もどる", {
        fontFamily: "sans-serif",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#b8cdea",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    back.on("pointerdown", () => this.scene.start("Title"));

    EventBus.emit("current-scene-ready", this);
  }

  private addGradeCard(
    x: number,
    y: number,
    grade: number,
    name: string,
    icon: string,
    color: string,
    teaser: string,
    unlocked: boolean,
  ) {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    const fill = unlocked ? Phaser.Display.Color.HexStringToColor(color).color : 0x22314f;
    bg.fillStyle(0x0d1e3a, 0.85);
    bg.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 20);
    bg.lineStyle(3, unlocked ? fill : 0x3a4a6a, 1);
    bg.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 20);
    container.add(bg);

    container.add(
      this.add
        .text(0, -34, unlocked ? icon : "🔒", { fontSize: "40px" })
        .setOrigin(0.5),
    );
    container.add(
      this.add
        .text(0, 14, name, {
          fontFamily: "sans-serif",
          fontSize: "22px",
          fontStyle: "bold",
          color: unlocked ? "#ffffff" : "#7a8bad",
        })
        .setOrigin(0.5),
    );
    container.add(
      this.add
        .text(0, 46, unlocked ? "▶ ここで あそぶ" : teaser, {
          fontFamily: "sans-serif",
          fontSize: "15px",
          color: unlocked ? color : "#7a8bad",
        })
        .setOrigin(0.5),
    );

    if (!unlocked) return;

    container.setSize(CARD_W, CARD_H);
    container.setInteractive({ useHandCursor: true });
    container.on("pointerover", () => container.setScale(1.04));
    container.on("pointerout", () => container.setScale(1));
    container.on("pointerdown", () => {
      /* 格納庫 (インプットステージ) は後続マイルストーンで実装 */
      this.showComingSoon(grade);
    });
  }

  private showComingSoon(grade: number) {
    const toast = this.add
      .text(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 76,
        `${grade}ねんせいの ステージは じゅんびちゅう!`,
        {
          fontFamily: "sans-serif",
          fontSize: "20px",
          fontStyle: "bold",
          color: "#ffd93d",
          backgroundColor: "#1a2a55",
          padding: { x: 16, y: 8 },
        },
      )
      .setOrigin(0.5);
    this.tweens.add({
      targets: toast,
      alpha: 0,
      delay: 1200,
      duration: 400,
      onComplete: () => toast.destroy(),
    });
  }
}
