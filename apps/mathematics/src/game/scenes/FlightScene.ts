import Phaser, { Scene } from "phaser";
import { generate, pickSkill } from "@/lib/curriculum";
import type { Problem } from "@/lib/curriculum";
import { getGrade } from "@/lib/grades";
import type { GradeDef, OutputDef } from "@/lib/grades";
import {
  addHistory,
  loadSave,
  markOutputCleared,
  persistSave,
  recordAnswer,
} from "@/lib/save";
import type { MathSave } from "@/lib/save";
import { BossController } from "../boss";
import { EventBus } from "../EventBus";
import { GAME_HEIGHT, GAME_WIDTH } from "../main";
import { getActiveProfileId } from "../session";
import { sfx } from "../sfx";

type EnemyKind = "ufo" | "rock" | "bird" | "red";
type ProblemContext = "capsule" | "boss";

const POWER_LADDER = ["れんしゃ", "ダブル", "ミサイル", "レーザー", "オプション", "バリア"] as const;
const GAUGE_MAX = 3;
const BEAM_DAMAGE = 30;
/* 武器の持続時間: 問題を解き続けないとパワーが1段ずつ落ちていく */
const POWER_DECAY_SEC = 8;

/*
 * アウトプットステージ本体: 横スクロールシューティング。
 * 飛行パート (ウェーブ+カプセル) → ボス戦。
 * 問題の出題UIは React (ProblemPanel) に EventBus で委譲する。
 */
export class FlightScene extends Scene {
  private gradeDef!: GradeDef;
  private output!: OutputDef;
  private profileId!: string;
  private save!: MathSave;

  private ship!: Phaser.Physics.Arcade.Image;
  private flame!: Phaser.GameObjects.Image;
  private optionOrb: Phaser.GameObjects.Image | null = null;
  private shieldSprite: Phaser.GameObjects.Image | null = null;
  private layers: Phaser.GameObjects.TileSprite[] = [];

  private pBullets!: Phaser.Physics.Arcade.Group;
  private eBullets!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private capsules!: Phaser.Physics.Arcade.Group;

  private hearts = 3;
  private powerLevel = 0;
  private powerTimer = 0; // 現在のパワー段が落ちるまでの残り秒
  private score = 0;
  private gauge = 0;
  private shieldCharges = 0;
  private invulnUntil = 0;
  private frozen = false;
  private ended = false;

  private elapsedSec = 0;
  private fireAccum = 0;
  private spawnAccum = 0;
  private formationAccum = 12; // 最初の編隊を早めに出す
  private droneAccum = 6;
  private formationSeq = 0;
  private formationAlive = new Map<number, number>();

  private boss: BossController | null = null;
  private bossPhase = false;

  private frozenGraceMs = 0; // フリーズ中にパネルが見当たらない時間 (ウォッチドッグ)
  private run = { correct: 0, wrong: 0, answerMs: [] as number[] };
  private problemContext: ProblemContext | null = null;
  private onProblemDone:
    | ((r: { correct: boolean; timedOut: boolean; elapsedMs: number }) => void)
    | null = null;

  constructor() {
    super("Flight");
  }

  init(data: { grade: number }) {
    const def = getGrade(data.grade);
    if (!def || !def.output) throw new Error(`grade ${data.grade} not playable`);
    this.gradeDef = def;
    this.output = def.output;
  }

  create() {
    this.resetState();
    this.profileId = getActiveProfileId() ?? "";
    this.save = loadSave(this.profileId);

    this.layers = [
      this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, "stars-far"),
      this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, "stars-mid"),
      this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, "stars-near"),
    ];

    this.pBullets = this.physics.add.group();
    this.eBullets = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.capsules = this.physics.add.group();

    this.ship = this.physics.add.image(120, GAME_HEIGHT / 2, "ship");
    this.ship.setCircle(13, 26, 9); // 当たり判定は見た目より小さく (機体中心のみ)
    this.ship.setCollideWorldBounds(true);
    this.flame = this.add.image(this.ship.x - 37, this.ship.y, "ship-flame").setOrigin(1, 0.5);

    this.setupInput();
    this.setupCollisions();

    this.scene.launch("Hud", { flight: this });
    /* Hud は非同期に起動するため、準備完了通知を受けて初期状態を再送する */
    const onHudRequest = () => this.pushHud();
    this.events.on("hud-request-state", onHudRequest);
    this.pushHud();

    const onDone = (r: { correct: boolean; timedOut: boolean; elapsedMs: number }) => {
      this.handleProblemDone(r);
    };
    EventBus.on("problem-done", onDone);
    const onBeam = () => this.fireBeam();
    EventBus.on("beam-pressed", onBeam);
    this.events.once("shutdown", () => {
      EventBus.off("problem-done", onDone);
      EventBus.off("beam-pressed", onBeam);
      this.events.off("hud-request-state", onHudRequest);
      this.boss?.destroy();
      this.scene.stop("Hud");
    });

    EventBus.emit("current-scene-ready", this);
  }

  private resetState() {
    this.hearts = 3;
    this.powerLevel = 0;
    this.powerTimer = 0;
    this.score = 0;
    this.gauge = 0;
    this.shieldCharges = 0;
    this.invulnUntil = 0;
    this.frozen = false;
    this.ended = false;
    this.elapsedSec = 0;
    this.fireAccum = 0;
    this.spawnAccum = 0;
    this.formationAccum = 8; // 最初の編隊を早めに出す
    this.droneAccum = 6;
    this.formationSeq = 0;
    this.formationAlive.clear();
    this.boss = null;
    this.bossPhase = false;
    this.frozenGraceMs = 0;
    this.optionOrb = null;
    this.shieldSprite = null;
    this.run = { correct: 0, wrong: 0, answerMs: [] };
    this.problemContext = null;
  }

  /* ---------- 入力: 相対ドラッグ + オートショット ---------- */

  private setupInput() {
    /* 子供が別の指を画面に置いたままでも操作できるようマルチタッチを許可 */
    this.input.addPointer(2);
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (!p.isDown || this.frozen || this.ended) return;
      const dx = (p.x - p.prevPosition.x) * 1.15;
      const dy = (p.y - p.prevPosition.y) * 1.15;
      this.ship.x = Phaser.Math.Clamp(this.ship.x + dx, 30, GAME_WIDTH - 30);
      this.ship.y = Phaser.Math.Clamp(this.ship.y + dy, 24, GAME_HEIGHT - 24);
    });
  }

  private fireInterval(): number {
    return this.powerLevel >= 1 ? 210 : 330;
  }

  private autofire() {
    if (this.powerLevel >= 4) {
      const laser = this.pBullets.create(this.ship.x + 40, this.ship.y, "laser") as Phaser.Physics.Arcade.Image;
      laser.setVelocityX(620);
      laser.setData("dmg", 2);
      laser.setData("pierce", true);
    } else {
      const b = this.pBullets.create(this.ship.x + 32, this.ship.y, "bullet") as Phaser.Physics.Arcade.Image;
      b.setVelocityX(540);
      b.setData("dmg", 1);
    }
    if (this.powerLevel >= 2) {
      const d = this.pBullets.create(this.ship.x + 24, this.ship.y - 10, "bullet") as Phaser.Physics.Arcade.Image;
      d.setVelocity(500, -170);
      d.setData("dmg", 1);
    }
    if (this.powerLevel >= 3) {
      const m = this.pBullets.create(this.ship.x + 16, this.ship.y + 14, "missile") as Phaser.Physics.Arcade.Image;
      m.setVelocity(430, 120);
      m.setData("dmg", 2);
    }
    if (this.optionOrb) {
      const o = this.pBullets.create(this.optionOrb.x + 16, this.optionOrb.y, "bullet") as Phaser.Physics.Arcade.Image;
      o.setVelocityX(540);
      o.setData("dmg", 1);
    }
    sfx.shoot();
  }

  /* ---------- 衝突 ---------- */

  private setupCollisions() {
    this.physics.add.overlap(this.pBullets, this.enemies, (bullet, enemy) => {
      this.onBulletHitsEnemy(
        bullet as Phaser.Physics.Arcade.Image,
        enemy as Phaser.Physics.Arcade.Image,
      );
    });
    this.physics.add.overlap(this.ship, this.enemies, (_s, enemy) => {
      (enemy as Phaser.Physics.Arcade.Image).destroy();
      this.hurt();
    });
    this.physics.add.overlap(this.ship, this.eBullets, (_s, b) => {
      (b as Phaser.Physics.Arcade.Image).destroy();
      this.hurt();
    });
    this.physics.add.overlap(this.ship, this.capsules, (_s, c) => {
      this.collectCapsule(c as Phaser.Physics.Arcade.Image);
    });
  }

  private onBulletHitsEnemy(
    bullet: Phaser.Physics.Arcade.Image,
    enemy: Phaser.Physics.Arcade.Image,
  ) {
    const dmg = (bullet.getData("dmg") as number) ?? 1;
    if (!bullet.getData("pierce")) bullet.destroy();

    if (enemy.getData("isBoss")) {
      const dealt = this.boss?.applyChipDamage(dmg) ?? 0;
      if (dealt > 0) this.score += 2;
      return;
    }

    const hp = ((enemy.getData("hp") as number) ?? 1) - dmg;
    enemy.setData("hp", hp);
    enemy.setAlpha(0.4);
    this.time.delayedCall(60, () => enemy.setAlpha?.(1));
    if (hp > 0) return;

    this.explode(enemy.x, enemy.y);
    const kind = enemy.getData("kind") as EnemyKind;
    const formationId = enemy.getData("formationId") as number | undefined;
    enemy.destroy();
    sfx.boom();
    this.score += kind === "red" ? 20 : 10;

    if (formationId != null) {
      const left = (this.formationAlive.get(formationId) ?? 1) - 1;
      if (left <= 0) {
        this.formationAlive.delete(formationId);
        this.dropCapsule(enemy.x, enemy.y); // 編隊全滅 → 確定カプセル
      } else {
        this.formationAlive.set(formationId, left);
      }
    } else if (kind === "rock" && Math.random() < 0.12) {
      this.dropCapsule(enemy.x, enemy.y);
    }
    this.pushHud();
  }

  private explode(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      const p = this.add.image(x, y, "star").setTint(0xffb45e);
      const a = Math.random() * Math.PI * 2;
      const d = 20 + Math.random() * 46;
      this.tweens.add({
        targets: p,
        x: x + Math.cos(a) * d,
        y: y + Math.sin(a) * d,
        alpha: 0,
        scale: 0.4,
        duration: 380,
        onComplete: () => p.destroy(),
      });
    }
  }

  private hurt() {
    if (this.ended || this.frozen) return;
    if (this.time.now < this.invulnUntil) return;

    if (this.shieldCharges > 0) {
      this.shieldCharges--;
      sfx.capsule();
      if (this.shieldCharges === 0) {
        this.shieldSprite?.destroy();
        this.shieldSprite = null;
      }
      this.invulnUntil = this.time.now + 900;
      this.pushHud();
      return;
    }

    this.hearts--;
    this.powerLevel = Math.max(0, this.powerLevel - 1);
    this.powerTimer = POWER_DECAY_SEC;
    this.syncPowerVisuals();
    sfx.hurt();
    this.cameras.main.shake(220, 0.012);
    this.invulnUntil = this.time.now + 1500;
    this.tweens.add({
      targets: this.ship,
      alpha: { from: 0.25, to: 1 },
      duration: 150,
      repeat: 9,
    });
    this.pushHud();
    if (this.hearts <= 0) this.gameOver();
  }

  /* ---------- スポーン ---------- */

  private spawnEnemy(kind: EnemyKind, y?: number, formationId?: number) {
    const spawnY = y ?? Phaser.Math.Between(50, GAME_HEIGHT - 50);
    const tex = kind === "ufo" ? "enemy-ufo" : kind === "rock" ? "enemy-rock" : kind === "bird" ? "enemy-bird" : "enemy-red";
    const e = this.enemies.create(GAME_WIDTH + 40, spawnY, tex) as Phaser.Physics.Arcade.Image;
    e.setData("kind", kind);
    e.setData("baseY", spawnY);
    e.setData("hp", kind === "rock" ? 2 : 1);
    if (formationId != null) e.setData("formationId", formationId);
    const speed = kind === "bird" ? 210 : kind === "red" ? 170 : 130;
    e.setVelocityX(-speed);
  }

  private spawnFormation() {
    const id = ++this.formationSeq;
    const baseY = Phaser.Math.Between(90, GAME_HEIGHT - 90);
    this.formationAlive.set(id, 4);
    for (let i = 0; i < 4; i++) {
      this.time.delayedCall(i * 260, () => {
        if (this.ended || this.bossPhase) {
          /* ボス突入後は残数を減らして整合を保つ */
          const left = (this.formationAlive.get(id) ?? 1) - 1;
          if (left <= 0) this.formationAlive.delete(id);
          else this.formationAlive.set(id, left);
          return;
        }
        this.spawnEnemy("red", baseY, id);
      });
    }
  }

  private dropCapsule(x: number, y: number) {
    const c = this.capsules.create(
      Phaser.Math.Clamp(x, 60, GAME_WIDTH - 60),
      Phaser.Math.Clamp(y, 50, GAME_HEIGHT - 50),
      "capsule",
    ) as Phaser.Physics.Arcade.Image;
    c.setVelocityX(-40);
    this.tweens.add({
      targets: c,
      scale: { from: 1, to: 1.18 },
      duration: 420,
      yoyo: true,
      repeat: -1,
    });
  }

  private spawnDrone() {
    const c = this.capsules.create(GAME_WIDTH + 30, Phaser.Math.Between(70, GAME_HEIGHT - 70), "drone") as Phaser.Physics.Arcade.Image;
    c.setData("isDrone", true);
    c.setVelocityX(-120);
    const label = this.add
      .text(c.x, c.y, "?", { fontFamily: "sans-serif", fontSize: "24px", fontStyle: "bold", color: "#0b1e3a" })
      .setOrigin(0.5);
    c.setData("label", label);
  }

  /* ---------- カプセル → 問題 ---------- */

  private collectCapsule(c: Phaser.Physics.Arcade.Image) {
    if (this.frozen || this.ended) return;
    const isDrone = !!c.getData("isDrone");
    (c.getData("label") as Phaser.GameObjects.Text | undefined)?.destroy();
    c.destroy();
    sfx.capsule();

    const skills = isDrone ? this.output.bossSkills : this.output.capsuleSkills;
    const skillId = pickSkill(skills, this.save.skillStats);
    const problem = generate(skillId);
    this.problemContext = isDrone ? "boss" : "capsule";
    this.openProblem(problem, this.output.answerTimeMs, (r) => {
      this.applyAnswerToSave(problem.skillId, r);
      if (this.problemContext === "boss") {
        if (r.correct) {
          this.gauge = Math.min(GAUGE_MAX, this.gauge + 1);
          this.grantShield();
          sfx.gauge();
        } else {
          this.boss?.setAngry(true);
        }
      } else if (r.correct) {
        this.powerUp();
        if (r.elapsedMs < 5000) this.score += 30; // スピードボーナス
        this.score += 50;
      }
      this.invulnUntil = this.time.now + 1000;
      this.pushHud();
    });
  }

  private openProblem(
    problem: Problem,
    timeLimitMs: number,
    after: (r: { correct: boolean; timedOut: boolean; elapsedMs: number }) => void,
  ) {
    this.freeze(true);
    this.onProblemDone = after;
    /* 注意: freeze中は this.time が止まるので delayedCall は使えない (フリーズバグの元)。
       即時にパネルを開く */
    EventBus.emit("problem-open", {
      problem,
      timeLimitMs,
      allowHint: problem.hint !== null,
    });
  }

  private handleProblemDone(r: { correct: boolean; timedOut: boolean; elapsedMs: number }) {
    const cb = this.onProblemDone;
    this.onProblemDone = null;
    this.problemContext = null;
    if (cb) {
      if (r.correct) sfx.good();
      else sfx.bad();
      cb(r);
    }
    /* コールバックの有無に関わらず必ず解凍する (フリーズ取り残し防止) */
    if (this.frozen) this.freeze(false);
  }

  private applyAnswerToSave(
    skillId: string,
    r: { correct: boolean; timedOut: boolean; elapsedMs: number },
  ) {
    this.run.correct += r.correct ? 1 : 0;
    this.run.wrong += r.correct ? 0 : 1;
    this.run.answerMs.push(r.elapsedMs);
    this.save = recordAnswer(this.save, skillId, r.correct, r.elapsedMs);
    persistSave(this.profileId, this.save);
  }

  private freeze(v: boolean) {
    this.frozen = v;
    if (v) {
      this.physics.world.pause();
      this.tweens.pauseAll();
      this.time.paused = true;
      this.boss?.pause();
    } else {
      this.physics.world.resume();
      this.tweens.resumeAll();
      this.time.paused = false;
      this.boss?.resume();
    }
  }

  /* ---------- パワーアップ ---------- */

  private powerUp() {
    this.powerTimer = POWER_DECAY_SEC; // 正解するたびに持続時間はフル回復
    if (this.powerLevel >= POWER_LADDER.length) {
      this.score += 100; // 満タン時は得点ボーナス
      return;
    }
    this.powerLevel++;
    sfx.powerup();
    this.syncPowerVisuals();
    this.pushHud();
  }

  /* 武器の持続時間: 時間切れでパワーが1段落ちる (ボス戦中は停止) */
  private decayPower(dt: number) {
    if (this.powerLevel <= 0 || this.bossPhase) return;
    this.powerTimer -= dt;
    if (this.powerTimer <= 0) {
      this.powerLevel--;
      this.powerTimer = POWER_DECAY_SEC;
      sfx.bad();
      this.showPowerDownPop();
      this.syncPowerVisuals();
      this.pushHud();
    }
    this.events.emit("hud-power-timer", {
      ratio: this.powerLevel > 0 ? this.powerTimer / POWER_DECAY_SEC : 0,
      active: this.powerLevel > 0,
    });
  }

  private showPowerDownPop() {
    const pop = this.add
      .text(this.ship.x + 10, this.ship.y - 40, "パワーダウン…", {
        fontFamily: "sans-serif",
        fontSize: "18px",
        fontStyle: "bold",
        color: "#ff7b7b",
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: pop,
      y: pop.y - 26,
      alpha: 0,
      duration: 900,
      onComplete: () => pop.destroy(),
    });
  }

  private syncPowerVisuals() {
    if (this.powerLevel >= 5 && !this.optionOrb) {
      this.optionOrb = this.add.image(this.ship.x - 40, this.ship.y, "option-orb");
    } else if (this.powerLevel < 5 && this.optionOrb) {
      this.optionOrb.destroy();
      this.optionOrb = null;
    }
    if (this.powerLevel >= 6 && this.shieldCharges === 0) {
      this.shieldCharges = 2;
      this.grantShieldSprite();
    }
  }

  private grantShield() {
    this.shieldCharges = Math.max(this.shieldCharges, 1);
    this.grantShieldSprite();
  }

  private grantShieldSprite() {
    if (!this.shieldSprite) {
      this.shieldSprite = this.add.image(this.ship.x, this.ship.y, "shield-bubble");
    }
  }

  /* ---------- ボス ---------- */

  private enterBossPhase() {
    this.bossPhase = true;
    sfx.fanfare();
    const warn = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `⚔️ ${this.output.boss.name} が あらわれた!`, {
        fontFamily: "sans-serif",
        fontSize: "34px",
        fontStyle: "bold",
        color: "#ff7b7b",
        stroke: "#1a2a55",
        strokeThickness: 6,
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: warn, alpha: 0, delay: 1600, duration: 500, onComplete: () => warn.destroy() });

    this.boss = new BossController(this, this.output.boss, {
      fireBullet: (x, y, vx, vy) => {
        if (this.ended) return;
        const b = this.eBullets.create(x, y, "ebullet") as Phaser.Physics.Arcade.Image;
        b.setVelocity(vx, vy);
      },
      onHpChanged: (hp, maxHp) => this.events.emit("hud-boss", { hp, maxHp, name: this.output.boss.name }),
      onDefeated: () => this.stageClear(),
    });
    /* ボス本体を敵グループにも登録して被弾判定を通す */
    const bossBody = this.enemies.create(this.boss.sprite.x, this.boss.sprite.y, "boss") as Phaser.Physics.Arcade.Image;
    bossBody.setVisible(false);
    bossBody.setData("isBoss", true);
    bossBody.setData("hp", 999999);
    bossBody.setImmovable(true);
    (bossBody.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    bossBody.setVelocity(0, 0);
    this.boss.sprite.setData("bodyRef", bossBody);
    this.boss.enter(() => {
      this.events.emit("hud-boss", { hp: this.boss!.hp, maxHp: this.output.boss.hp, name: this.output.boss.name });
    });
  }

  private fireBeam() {
    if (this.gauge < GAUGE_MAX || !this.boss || this.boss.isDefeated || this.frozen || this.ended) return;
    this.gauge = 0;
    sfx.beam();
    const beam = this.add.rectangle(GAME_WIDTH / 2, this.ship.y, GAME_WIDTH, 46, 0x9be7ff, 0.9);
    this.cameras.main.flash(300, 155, 231, 255);
    this.tweens.add({ targets: beam, alpha: 0, duration: 500, onComplete: () => beam.destroy() });
    this.boss.applyBeamDamage(BEAM_DAMAGE);
    this.pushHud();
  }

  /* ---------- 終了処理 ---------- */

  private stageClear() {
    if (this.ended) return;
    this.ended = true;
    sfx.fanfare();
    const bossBody = this.boss?.sprite.getData("bodyRef") as Phaser.Physics.Arcade.Image | undefined;
    bossBody?.destroy();
    if (this.boss) {
      this.explode(this.boss.sprite.x, this.boss.sprite.y);
      this.tweens.add({ targets: this.boss.sprite, alpha: 0, scale: 1.4, duration: 900 });
    }

    const avg = this.run.answerMs.length
      ? Math.round(this.run.answerMs.reduce((s, x) => s + x, 0) / this.run.answerMs.length)
      : 0;
    const total = this.run.correct + this.run.wrong;
    const accuracy = total ? Math.round((this.run.correct / total) * 100) : 100;

    this.save = markOutputCleared(this.save, this.gradeDef.grade, this.score);
    this.save = addHistory(this.save, {
      ts: Date.now(),
      grade: this.gradeDef.grade,
      mode: "output",
      stageName: this.gradeDef.name,
      correct: this.run.correct,
      wrong: this.run.wrong,
      accuracy,
      avgAnswerMs: avg,
      score: this.score,
    });
    persistSave(this.profileId, this.save);

    this.time.delayedCall(1100, () => {
      this.showEndOverlay(
        "🏆 ステージクリア!",
        [
          `スコア: ${this.score}`,
          `せいかい: ${this.run.correct} / ${total}  (${accuracy}%)`,
          avg ? `へいきん かいとう: ${(avg / 1000).toFixed(1)}びょう` : "",
        ].filter(Boolean),
        "マップへ もどる",
        () => this.scene.start("GradeMap"),
      );
    });
  }

  private gameOver() {
    if (this.ended) return;
    this.ended = true;
    this.physics.world.pause();
    sfx.bad();

    const avg = this.run.answerMs.length
      ? Math.round(this.run.answerMs.reduce((s, x) => s + x, 0) / this.run.answerMs.length)
      : 0;
    const total = this.run.correct + this.run.wrong;
    if (total > 0) {
      this.save = addHistory(this.save, {
        ts: Date.now(),
        grade: this.gradeDef.grade,
        mode: "output",
        stageName: this.gradeDef.name,
        correct: this.run.correct,
        wrong: this.run.wrong,
        accuracy: Math.round((this.run.correct / total) * 100),
        avgAnswerMs: avg,
        score: this.score,
      });
      persistSave(this.profileId, this.save);
    }

    this.showEndOverlay(
      "ゲームオーバー…",
      [`スコア: ${this.score}`, "もういちど ちょうせんしよう!"],
      "もういちど",
      () => this.scene.restart({ grade: this.gradeDef.grade }),
      "マップへ",
      () => this.scene.start("GradeMap"),
    );
  }

  private showEndOverlay(
    title: string,
    lines: string[],
    primaryLabel: string,
    onPrimary: () => void,
    secondaryLabel?: string,
    onSecondary?: () => void,
  ) {
    const veil = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x060e1e, 0.82);
    veil.setDepth(50);
    const make = (y: number, text: string, size: number, color: string) =>
      this.add
        .text(GAME_WIDTH / 2, y, text, {
          fontFamily: "sans-serif",
          fontSize: `${size}px`,
          fontStyle: "bold",
          color,
          align: "center",
        })
        .setOrigin(0.5)
        .setDepth(51);

    make(150, title, 42, "#ffd93d");
    lines.forEach((l, i) => make(230 + i * 40, l, 24, "#ffffff"));

    const primary = make(400, `▶ ${primaryLabel}`, 28, "#7cfc9a").setInteractive({ useHandCursor: true });
    primary.on("pointerdown", onPrimary);
    if (secondaryLabel && onSecondary) {
      const secondary = make(460, secondaryLabel, 22, "#b8cdea").setInteractive({ useHandCursor: true });
      secondary.on("pointerdown", onSecondary);
    }
  }

  /* ---------- HUD ---------- */

  private pushHud() {
    this.events.emit("hud-state", {
      hearts: this.hearts,
      powerLevel: this.powerLevel,
      ladder: POWER_LADDER,
      score: this.score,
      gauge: this.gauge,
      gaugeMax: GAUGE_MAX,
      shieldCharges: this.shieldCharges,
      bossPhase: this.bossPhase,
    });
  }

  /* ---------- メインループ ---------- */

  update(_time: number, deltaMs: number) {
    /* ウォッチドッグ: フリーズしたのに問題パネルが無い状態が続いたら自動復帰する。
       (パネルとの同期が万一崩れても、操作不能のまま固まらないための保険) */
    if (this.frozen && !this.ended) {
      const panelVisible = document.querySelector(".pp-overlay") !== null;
      this.frozenGraceMs = panelVisible ? 0 : this.frozenGraceMs + deltaMs;
      if (this.frozenGraceMs > 1000) {
        this.frozenGraceMs = 0;
        this.onProblemDone = null;
        this.problemContext = null;
        this.freeze(false);
      }
    } else {
      this.frozenGraceMs = 0;
    }

    if (this.frozen || this.ended) return;
    const dt = Math.min(deltaMs / 1000, 1 / 20);

    this.layers[0].tilePositionX += 12 * dt;
    this.layers[1].tilePositionX += 34 * dt;
    this.layers[2].tilePositionX += 70 * dt;

    this.data.set("playerPos", { x: this.ship.x, y: this.ship.y });

    /* 噴射炎の追従とフリッカー */
    this.flame.setPosition(this.ship.x - 37, this.ship.y);
    this.flame.setScale(0.7 + Math.random() * 0.5, 0.8 + Math.random() * 0.4);
    this.flame.setAlpha(this.ship.alpha);

    /* オプション/バリアの追従 */
    if (this.optionOrb) {
      this.optionOrb.x = Phaser.Math.Linear(this.optionOrb.x, this.ship.x - 44, 0.12);
      this.optionOrb.y = Phaser.Math.Linear(this.optionOrb.y, this.ship.y, 0.12);
    }
    if (this.shieldSprite) {
      this.shieldSprite.setPosition(this.ship.x, this.ship.y);
    }

    /* オートショット */
    this.fireAccum += deltaMs;
    if (this.fireAccum >= this.fireInterval()) {
      this.fireAccum = 0;
      this.autofire();
    }

    this.decayPower(dt);

    if (!this.bossPhase) {
      this.elapsedSec += dt;
      this.events.emit("hud-time", {
        left: Math.max(0, this.output.durationSec - this.elapsedSec),
        total: this.output.durationSec,
      });

      /* ウェーブスポーン: テンポよく湧かせてピンチを作る */
      this.spawnAccum += dt;
      if (this.spawnAccum >= 0.9) {
        this.spawnAccum = 0;
        const roll = Math.random();
        this.spawnEnemy(roll < 0.4 ? "ufo" : roll < 0.75 ? "rock" : "bird");
        /* ときどき2体同時 (上下バラけて) */
        if (Math.random() < 0.35) {
          const roll2 = Math.random();
          this.spawnEnemy(roll2 < 0.5 ? "ufo" : roll2 < 0.8 ? "rock" : "bird");
        }
      }
      this.formationAccum += dt;
      if (this.formationAccum >= 12) {
        this.formationAccum = 0;
        this.spawnFormation();
      }

      if (this.elapsedSec >= this.output.durationSec) this.enterBossPhase();
    } else if (this.boss && !this.boss.isDefeated) {
      /* ボス戦: 問題ドローンを定期供給 */
      this.droneAccum += dt;
      if (this.droneAccum >= 10) {
        this.droneAccum = 0;
        this.spawnDrone();
      }
      const bossBody = this.boss.sprite.getData("bodyRef") as Phaser.Physics.Arcade.Image | undefined;
      bossBody?.setPosition(this.boss.sprite.x, this.boss.sprite.y);
    }

    this.updateEnemies(dt);
    this.cleanupOffscreen();
  }

  private updateEnemies(dt: number) {
    for (const obj of this.enemies.getChildren()) {
      const e = obj as Phaser.Physics.Arcade.Image;
      if (e.getData("isBoss")) continue;
      const kind = e.getData("kind") as EnemyKind;
      if (kind === "ufo" || kind === "red") {
        const baseY = e.getData("baseY") as number;
        e.y = baseY + Math.sin(e.x / 60) * 46;
      } else if (kind === "rock") {
        e.rotation += 2.4 * dt;
      } else if (kind === "bird") {
        const dy = this.ship.y - e.y;
        e.setVelocityY(Phaser.Math.Clamp(dy * 2.2, -140, 140));
      }
      /* UFOはときどき狙い弾を撃つ */
      if (kind === "ufo" && Math.random() < 0.35 * dt && e.x > GAME_WIDTH * 0.4) {
        const b = this.eBullets.create(e.x - 16, e.y + 8, "ebullet") as Phaser.Physics.Arcade.Image;
        const angle = Math.atan2(this.ship.y - e.y, this.ship.x - e.x);
        b.setVelocity(Math.cos(angle) * 170, Math.sin(angle) * 170);
      }
    }

    /* ドローンのラベル追従 */
    for (const obj of this.capsules.getChildren()) {
      const c = obj as Phaser.Physics.Arcade.Image;
      const label = c.getData("label") as Phaser.GameObjects.Text | undefined;
      label?.setPosition(c.x, c.y);
    }
  }

  private cleanupOffscreen() {
    const kill = (g: Phaser.Physics.Arcade.Group, margin: number) => {
      for (const obj of g.getChildren()) {
        const s = obj as Phaser.Physics.Arcade.Image;
        if (s.x < -margin || s.x > GAME_WIDTH + margin + 140 || s.y < -margin || s.y > GAME_HEIGHT + margin) {
          const kind = s.getData("kind") as EnemyKind | undefined;
          const formationId = s.getData("formationId") as number | undefined;
          if (kind && formationId != null) {
            /* 編隊が画面外へ逃げたら全滅ボーナスは不成立にする */
            this.formationAlive.delete(formationId);
          }
          (s.getData("label") as Phaser.GameObjects.Text | undefined)?.destroy();
          s.destroy();
        }
      }
    };
    kill(this.pBullets, 60);
    kill(this.eBullets, 40);
    kill(this.enemies, 80);
    kill(this.capsules, 60);
  }
}
