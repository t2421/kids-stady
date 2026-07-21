import Phaser from "phaser";
import type { BossDef } from "@/lib/grades";
import { GAME_HEIGHT, GAME_WIDTH } from "./main";
import { sfx } from "./sfx";

/*
 * ボス戦コントローラ。FlightScene から生成され、ボスの入場・攻撃パターン・
 * フェーズ変化・ダメージ管理を担う。攻撃は必ず1秒前に予告を出し、
 * 子供でも避けられるようにする。
 */

export interface BossHooks {
  /* 敵弾を撃つ (FlightScene の物理グループに委譲) */
  fireBullet: (x: number, y: number, vx: number, vy: number) => void;
  onHpChanged: (hp: number, maxHp: number) => void;
  onDefeated: () => void;
}

type Pattern = "aimed" | "spread" | "sweep";

export class BossController {
  readonly def: BossDef;
  sprite: Phaser.GameObjects.Image;
  hp: number;
  chipDamageLeft: number;
  private scene: Phaser.Scene;
  private hooks: BossHooks;
  private patternTimer: Phaser.Time.TimerEvent | null = null;
  private phase = 0; // 0:通常 1:66%以下 2:33%以下
  private angry = false; // 直前の問題に間違えた
  private entered = false;
  private defeated = false;

  constructor(scene: Phaser.Scene, def: BossDef, hooks: BossHooks) {
    this.scene = scene;
    this.def = def;
    this.hooks = hooks;
    this.hp = def.hp;
    this.chipDamageLeft = Math.floor(def.hp * def.chipCap);
    this.sprite = scene.add.image(GAME_WIDTH + 120, GAME_HEIGHT / 2, "boss");
  }

  /* 画面右へスライドイン → 攻撃開始 */
  enter(onReady: () => void) {
    this.scene.tweens.add({
      targets: this.sprite,
      x: GAME_WIDTH - 110,
      duration: 1600,
      ease: "Sine.easeOut",
      onComplete: () => {
        this.entered = true;
        this.float();
        this.scheduleNextAttack(1200);
        onReady();
      },
    });
  }

  private float() {
    this.scene.tweens.add({
      targets: this.sprite,
      y: { from: GAME_HEIGHT / 2 - 60, to: GAME_HEIGHT / 2 + 60 },
      duration: 2600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  setAngry(v: boolean) {
    this.angry = v;
  }

  get isDefeated() {
    return this.defeated;
  }

  /* 通常ショットのチップダメージ (上限つき)。上限到達後は 0 */
  applyChipDamage(amount: number): number {
    if (this.defeated || !this.entered) return 0;
    const dealt = Math.min(amount, this.chipDamageLeft);
    if (dealt > 0) {
      this.chipDamageLeft -= dealt;
      this.damage(dealt);
    }
    return dealt;
  }

  /* 必殺技のダメージ (無制限) */
  applyBeamDamage(amount: number) {
    if (this.defeated || !this.entered) return;
    this.damage(amount);
  }

  private damage(amount: number) {
    this.hp = Math.max(0, this.hp - amount);
    this.hooks.onHpChanged(this.hp, this.def.hp);
    this.sprite.setTint(0xffffff);
    this.scene.time.delayedCall(90, () => this.sprite.clearTint());

    const ratio = this.hp / this.def.hp;
    if (ratio <= 0.33 && this.phase < 2) this.phase = 2;
    else if (ratio <= 0.66 && this.phase < 1) this.phase = 1;

    if (this.hp <= 0 && !this.defeated) {
      this.defeated = true;
      this.patternTimer?.remove();
      this.scene.tweens.killTweensOf(this.sprite);
      this.hooks.onDefeated();
    }
  }

  pause() {
    if (this.patternTimer) this.patternTimer.paused = true;
  }

  resume() {
    if (this.patternTimer) this.patternTimer.paused = false;
  }

  destroy() {
    this.patternTimer?.remove();
    this.scene.tweens.killTweensOf(this.sprite);
    this.sprite.destroy();
  }

  private scheduleNextAttack(delayMs: number) {
    if (this.defeated) return;
    this.patternTimer = this.scene.time.delayedCall(delayMs, () => this.attack());
  }

  private attack() {
    if (this.defeated) return;
    const patterns: Pattern[] = ["aimed", "spread", "sweep"];
    const pattern = patterns[Phaser.Math.Between(0, patterns.length - 1)];
    this.telegraph(pattern, () => {
      if (this.defeated) return;
      if (pattern === "aimed") this.fireAimed();
      else if (pattern === "spread") this.fireSpread();
      else this.fireSweep();
      this.angry = false;
      /* フェーズが進むほど攻撃間隔が短くなる */
      const base = 3400 - this.phase * 500;
      this.scheduleNextAttack(base + Phaser.Math.Between(0, 800));
    });
  }

  /* 予告: 1秒間、攻撃元が点滅する警告表示 */
  private telegraph(pattern: Pattern, onFire: () => void) {
    const color = this.angry ? 0xff2f43 : 0xffd93d;
    const marks: Phaser.GameObjects.GameObject[] = [];

    if (pattern === "sweep") {
      /* 横一直線のレーザー予告線 (安全地帯が見える) */
      const laneY = this.sprite.y;
      const line = this.scene.add
        .rectangle(GAME_WIDTH / 2, laneY, GAME_WIDTH, 30, color, 0.18)
        .setStrokeStyle(2, color, 0.7);
      marks.push(line);
    } else {
      const ring = this.scene.add
        .circle(this.sprite.x - 60, this.sprite.y, 26)
        .setStrokeStyle(4, color, 0.9);
      marks.push(ring);
    }

    this.scene.tweens.add({
      targets: marks,
      alpha: { from: 1, to: 0.25 },
      duration: 240,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        marks.forEach((m) => m.destroy());
        onFire();
      },
    });
  }

  /* プレイヤー狙い3連射 */
  private fireAimed() {
    const player = this.playerPos();
    const src = { x: this.sprite.x - 70, y: this.sprite.y };
    const angle = Math.atan2(player.y - src.y, player.x - src.x);
    const speed = 190 + this.phase * 25;
    for (let i = 0; i < 3; i++) {
      this.scene.time.delayedCall(i * 220, () => {
        if (this.defeated) return;
        this.hooks.fireBullet(
          src.x,
          this.sprite.y,
          Math.cos(angle) * speed,
          Math.sin(angle) * speed,
        );
      });
    }
  }

  /* 扇形弾 (怒りで少しだけ密になる) */
  private fireSpread() {
    const src = { x: this.sprite.x - 70, y: this.sprite.y };
    const n = (this.angry ? 6 : 5) + this.phase;
    const speed = 160 + this.phase * 20;
    for (let i = 0; i < n; i++) {
      const angle = Math.PI + ((i - (n - 1) / 2) * 0.75) / (n - 1) * 2;
      this.hooks.fireBullet(
        src.x,
        src.y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
      );
    }
  }

  /* 横スイープ: 予告したレーンに弾幕を流す */
  private fireSweep() {
    const laneY = this.sprite.y;
    const speed = 300 + this.phase * 40;
    for (let i = 0; i < 6; i++) {
      this.scene.time.delayedCall(i * 130, () => {
        if (this.defeated) return;
        this.hooks.fireBullet(GAME_WIDTH - 40, laneY, -speed, 0);
      });
    }
    sfx.beam();
  }

  private playerPos(): { x: number; y: number } {
    const data = this.scene.data.get("playerPos") as { x: number; y: number } | undefined;
    return data ?? { x: 120, y: GAME_HEIGHT / 2 };
  }
}
