import Phaser, { Scene } from "phaser";
import { generate, pickSkill } from "@/lib/curriculum";
import { getGrade } from "@/lib/grades";
import type { GradeDef, Lesson } from "@/lib/grades";
import {
  addHistory,
  loadSave,
  persistSave,
  recordAnswer,
  setLessonMedal,
} from "@/lib/save";
import type { MathSave } from "@/lib/save";
import { EventBus } from "../EventBus";
import { GAME_HEIGHT, GAME_WIDTH } from "../main";
import { getActiveProfileId } from "../session";
import { sfx } from "../sfx";

/*
 * インプットステージ (整備ドック)。
 * 問題に正解するたびに機体パーツが組み上がっていく。時間制限なし。
 */
export class HangarScene extends Scene {
  private gradeDef!: GradeDef;
  private lesson!: Lesson;
  private profileId!: string;
  private save!: MathSave;

  private questionIndex = 0;
  private correctCount = 0;
  private answerMs: number[] = [];
  private pieces: Phaser.GameObjects.GameObject[] = [];
  private progressText!: Phaser.GameObjects.Text;
  private shipImage!: Phaser.GameObjects.Image;

  constructor() {
    super("Hangar");
  }

  init(data: { grade: number; lessonId: string }) {
    const def = getGrade(data.grade);
    const lesson = def?.lessons.find((l) => l.id === data.lessonId);
    if (!def || !lesson) throw new Error("unknown lesson");
    this.gradeDef = def;
    this.lesson = lesson;
  }

  create() {
    this.questionIndex = 0;
    this.correctCount = 0;
    this.answerMs = [];
    this.pieces = [];
    this.profileId = getActiveProfileId() ?? "";
    this.save = loadSave(this.profileId);

    /* 格納庫の背景 */
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x101c33);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 60, GAME_WIDTH, 120, 0x0a1426);
    for (let x = 80; x < GAME_WIDTH; x += 160) {
      this.add.rectangle(x, 40, 60, 8, 0xffd93d, 0.25);
    }

    this.add
      .text(GAME_WIDTH / 2, 44, `${this.lesson.partIcon} ${this.lesson.name}`, {
        fontFamily: "sans-serif",
        fontSize: "30px",
        fontStyle: "bold",
        color: "#ffd93d",
        stroke: "#1a2a55",
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    /* 組み立て中の機体 (正解のたびに明るくなり、パーツが付く) */
    this.shipImage = this.add
      .image(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, "ship")
      .setScale(3.4)
      .setAlpha(0.18);

    this.progressText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 40, "", {
        fontFamily: "sans-serif",
        fontSize: "20px",
        fontStyle: "bold",
        color: "#b8cdea",
      })
      .setOrigin(0.5);
    this.updateProgress();

    const onDone = (r: { correct: boolean; timedOut: boolean; elapsedMs: number }) => {
      this.onAnswer(r);
    };
    EventBus.on("problem-done", onDone);
    this.events.once("shutdown", () => {
      EventBus.off("problem-done", onDone);
    });

    /* ちょっと間を置いて最初の問題 */
    this.time.delayedCall(700, () => this.askNext());

    EventBus.emit("current-scene-ready", this);
  }

  private updateProgress() {
    this.progressText.setText(
      `もんだい ${Math.min(this.questionIndex + 1, this.lesson.count)} / ${this.lesson.count}` +
        `  せいかい ${this.correctCount}`,
    );
  }

  private askNext() {
    if (this.questionIndex >= this.lesson.count) {
      this.finishLesson();
      return;
    }
    this.updateProgress();
    const skillId = pickSkill(this.lesson.skills, this.save.skillStats);
    const problem = generate(skillId);
    this.data.set("currentSkill", problem.skillId);
    EventBus.emit("problem-open", {
      problem,
      timeLimitMs: null, // インプットは時間プレッシャーなし
      allowHint: problem.hint !== null,
    });
  }

  private onAnswer(r: { correct: boolean; timedOut: boolean; elapsedMs: number }) {
    const skillId = this.data.get("currentSkill") as string;
    this.save = recordAnswer(this.save, skillId, r.correct, r.elapsedMs);
    persistSave(this.profileId, this.save);
    this.answerMs.push(r.elapsedMs);
    this.questionIndex++;

    if (r.correct) {
      this.correctCount++;
      sfx.good();
      this.attachPiece();
    } else {
      sfx.bad();
    }
    this.updateProgress();
    this.time.delayedCall(450, () => this.askNext());
  }

  /* 正解のたびに機体へパーツが飛んでいく演出 */
  private attachPiece() {
    const progress = this.correctCount / this.lesson.count;
    this.shipImage.setAlpha(0.18 + progress * 0.82);

    const piece = this.add
      .text(GAME_WIDTH / 2 + Phaser.Math.Between(-260, 260), GAME_HEIGHT + 30, this.lesson.partIcon, {
        fontSize: "30px",
      })
      .setOrigin(0.5);
    this.pieces.push(piece);
    this.tweens.add({
      targets: piece,
      x: this.shipImage.x + Phaser.Math.Between(-70, 70),
      y: this.shipImage.y + Phaser.Math.Between(-30, 30),
      duration: 620,
      ease: "Back.easeOut",
      onComplete: () => {
        this.tweens.add({ targets: piece, alpha: 0, delay: 250, duration: 350 });
      },
    });
    this.cameras.main.flash(120, 60, 90, 150);
  }

  private finishLesson() {
    const medal = this.correctCount >= this.lesson.count ? 3 : this.correctCount >= this.lesson.count - 2 ? 2 : 1;
    this.save = setLessonMedal(this.save, this.gradeDef.grade, this.lesson.id, medal);

    const avg = this.answerMs.length
      ? Math.round(this.answerMs.reduce((s, x) => s + x, 0) / this.answerMs.length)
      : 0;
    const wrong = this.lesson.count - this.correctCount;
    this.save = addHistory(this.save, {
      ts: Date.now(),
      grade: this.gradeDef.grade,
      mode: "input",
      stageName: this.lesson.name,
      correct: this.correctCount,
      wrong,
      accuracy: Math.round((this.correctCount / this.lesson.count) * 100),
      avgAnswerMs: avg,
      score: 0,
    });
    persistSave(this.profileId, this.save);

    sfx.fanfare();
    this.shipImage.setAlpha(1);
    const medalIcon = medal === 3 ? "🥇" : medal === 2 ? "🥈" : "🥉";
    const veil = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x060e1e, 0.78);
    veil.setDepth(40);
    this.add
      .text(GAME_WIDTH / 2, 170, `${medalIcon} ${this.lesson.partName} かんせい!`, {
        fontFamily: "sans-serif",
        fontSize: "38px",
        fontStyle: "bold",
        color: "#ffd93d",
      })
      .setOrigin(0.5)
      .setDepth(41);
    this.add
      .text(
        GAME_WIDTH / 2,
        250,
        `せいかい ${this.correctCount} / ${this.lesson.count}` +
          (avg ? `  へいきん ${(avg / 1000).toFixed(1)}びょう` : ""),
        { fontFamily: "sans-serif", fontSize: "24px", color: "#ffffff" },
      )
      .setOrigin(0.5)
      .setDepth(41);

    const next = this.add
      .text(GAME_WIDTH / 2, 380, "▶ もどる", {
        fontFamily: "sans-serif",
        fontSize: "28px",
        fontStyle: "bold",
        color: "#7cfc9a",
      })
      .setOrigin(0.5)
      .setDepth(41)
      .setInteractive({ useHandCursor: true });
    next.on("pointerdown", () => this.scene.start("Grade", { grade: this.gradeDef.grade }));
  }
}
