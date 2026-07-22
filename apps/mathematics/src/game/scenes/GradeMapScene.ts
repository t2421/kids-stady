import Phaser, { Scene } from "phaser";
import { addVoidBackdrop } from "../backdrop";
import { EventBus } from "../EventBus";
import { GAME_HEIGHT, GAME_WIDTH } from "../main";
import { getActiveProfileId } from "../session";
import { isDebugMode } from "@/lib/debug";
import { GRADES } from "@/lib/grades";
import { isOutputUnlocked, loadSave } from "@/lib/save";

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
    addVoidBackdrop(this);
    /* カードの可読性を上げる薄い暗幕 */
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x171225, 0.4);

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
      const unlocked = g.implemented && (g.grade <= unlockedGrade || isDebugMode());
      /* 出撃準備 (レッスン) を一度クリア済みなら、マップから直接出撃できる */
      const sortieReady =
        unlocked &&
        save !== null &&
        g.lessons.length > 0 &&
        isOutputUnlocked(save, g.grade, g.lessons.map((l) => l.id));
      this.addGradeCard(x, y, g.grade, g.name, g.icon, g.color, g.teaser, unlocked, sortieReady);
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
    sortieReady: boolean,
  ) {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    const fill = unlocked ? Phaser.Display.Color.HexStringToColor(color).color : 0x22314f;
    bg.fillStyle(0x0d1e3a, 0.85);
    bg.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 20);
    bg.lineStyle(3, unlocked ? fill : 0x3a4a6a, 1);
    bg.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 20);
    container.add(bg);

    /* 惑星/ロックはドット絵アイコン (絵文字非依存) */
    container.add(
      unlocked
        ? this.add.image(0, -34, `ui-planet-${grade}`).setScale(1.5)
        : this.add.image(0, -34, "ui-lock").setScale(1.6),
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
    if (!sortieReady) {
      container.add(
        this.add
          .text(0, 46, unlocked ? "▶ ここで あそぶ" : teaser, {
            fontFamily: "sans-serif",
            fontSize: "15px",
            color: unlocked ? color : "#7a8bad",
          })
          .setOrigin(0.5),
      );
    }

    if (!unlocked) return;

    /* Container のヒット領域は原点基準で右下に伸びるため、中心合わせで明示する */
    container.setInteractive(
      new Phaser.Geom.Rectangle(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H),
      Phaser.Geom.Rectangle.Contains,
    );
    if (container.input) container.input.cursor = "pointer";
    container.on("pointerover", () => container.setScale(1.04));
    container.on("pointerout", () => container.setScale(1));
    container.on("pointerdown", () => {
      this.scene.start("Grade", { grade });
    });

    if (!sortieReady) return;

    /* レッスンクリア済み → カード内から直接出撃 (カードの他の部分はレッスン画面へ) */
    this.add.image(x - 78, y + 46, "ui-rocket").setScale(1.1);
    const quick = this.add
      .text(x + 8, y + 46, "すぐ しゅつげき!", {
        fontFamily: "sans-serif",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#0b1e3a",
        backgroundColor: "#ffd93d",
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    quick.on("pointerdown", (
      _p: Phaser.Input.Pointer,
      _x: number,
      _y: number,
      event: Phaser.Types.Input.EventData,
    ) => {
      event.stopPropagation();
      this.scene.start("Flight", { grade });
    });
  }

}
