/*
 * 戦闘の舞台背景と小演出。
 * 背景はフィールドのテーマ (grass/forest/cave/interior) ごとに
 * 空のグラデーション + 遠景シルエット + 地面を描き分ける。
 * ダメージポップアップとヒットバーストもここに集約する。
 */
import type { Scene } from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../main";

interface StagePalette {
  sky: number[];
  silhouette: number;
  silhouetteFar: number;
  ground: number;
  groundDark: number;
  platform: number;
}

const PALETTES: Record<string, StagePalette> = {
  grass: {
    sky: [0x1d3f7a, 0x2b5aa5, 0x3d76c4, 0x6fa3d8],
    silhouette: 0x1c4a35,
    silhouetteFar: 0x27604a,
    ground: 0x2f7a44,
    groundDark: 0x235c34,
    platform: 0x3d8f52,
  },
  forest: {
    sky: [0x11263a, 0x1a3a52, 0x235068, 0x38707f],
    silhouette: 0x12351f,
    silhouetteFar: 0x1c4a2c,
    ground: 0x245a33,
    groundDark: 0x1b4426,
    platform: 0x2f6e40,
  },
  cave: {
    sky: [0x120f1c, 0x1a1528, 0x241d36, 0x2f2745],
    silhouette: 0x0c0a14,
    silhouetteFar: 0x1c1728,
    ground: 0x3a3346,
    groundDark: 0x2b2536,
    platform: 0x4a4258,
  },
  interior: {
    sky: [0x241a12, 0x33261a, 0x413020, 0x503b27],
    silhouette: 0x1c130c,
    silhouetteFar: 0x2b1f14,
    ground: 0x6e4f30,
    groundDark: 0x59402a,
    platform: 0x84603c,
  },
};

/* 決定的な擬似乱数 (背景の散らし模様が毎戦闘で変わらないように) */
function hashNoise(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function buildBattleBackdrop(scene: Scene, theme: string): void {
  const p = PALETTES[theme] ?? PALETTES.grass;
  const horizon = GAME_HEIGHT * 0.62;

  /* 空: 4段のグラデーション帯 */
  const bandH = horizon / p.sky.length;
  p.sky.forEach((color, i) => {
    scene.add
      .rectangle(GAME_WIDTH / 2, bandH * i + bandH / 2, GAME_WIDTH, bandH + 1, color, 1)
      .setDepth(-30);
  });

  if (theme === "cave") {
    /* 鍾乳石が天井から垂れる (▼: 底辺が上、先端が下) */
    for (let i = 0; i < 14; i++) {
      const x = (GAME_WIDTH / 14) * i + hashNoise(i) * 40;
      const len = 40 + hashNoise(i + 50) * 90;
      const w = 26 + hashNoise(i + 90) * 30;
      scene.add
        .triangle(x, len / 2, -w / 2, -len / 2, w / 2, -len / 2, 0, len / 2, p.silhouetteFar, 1)
        .setDepth(-29);
    }
    for (let i = 0; i < 9; i++) {
      const x = (GAME_WIDTH / 9) * i + hashNoise(i + 7) * 60 + 30;
      const len = 30 + hashNoise(i + 21) * 60;
      const w = 30 + hashNoise(i + 33) * 26;
      scene.add
        .triangle(x, len / 2, -w / 2, -len / 2, w / 2, -len / 2, 0, len / 2, p.silhouette, 1)
        .setDepth(-28);
    }
  } else if (theme === "interior") {
    /* 石壁ブロックと柱 */
    for (let i = 0; i < 5; i++) {
      const x = (GAME_WIDTH / 5) * i + GAME_WIDTH / 10;
      scene.add.rectangle(x, horizon / 2, 46, horizon, p.silhouette, 1).setDepth(-29);
      scene.add.rectangle(x, horizon / 2, 34, horizon, p.silhouetteFar, 1).setDepth(-28);
    }
    for (let i = 0; i < 24; i++) {
      const x = hashNoise(i) * GAME_WIDTH;
      const y = hashNoise(i + 40) * horizon * 0.9;
      scene.add
        .rectangle(x, y, 30, 3, p.silhouette, 0.5)
        .setDepth(-29);
    }
  } else {
    /* 遠くの丘 (2層) と木立のシルエット */
    for (let i = 0; i < 8; i++) {
      const x = (GAME_WIDTH / 7) * i;
      const r = 90 + hashNoise(i + 3) * 70;
      scene.add.circle(x, horizon + 24, r, p.silhouetteFar, 1).setDepth(-29);
    }
    for (let i = 0; i < 10; i++) {
      const x = (GAME_WIDTH / 9) * i + 40;
      const r = 55 + hashNoise(i + 11) * 55;
      scene.add.circle(x, horizon + 30, r, p.silhouette, 1).setDepth(-28);
    }
    if (theme === "forest") {
      for (let i = 0; i < 12; i++) {
        const x = (GAME_WIDTH / 12) * i + hashNoise(i + 60) * 50;
        const h = 60 + hashNoise(i + 71) * 60;
        scene.add
          .triangle(x, horizon - h / 2 + 18, 0, -h / 2, 24, h / 2, -24, h / 2, p.silhouette, 1)
          .setDepth(-27);
      }
    }
  }

  /* 地面 */
  scene.add
    .rectangle(GAME_WIDTH / 2, (GAME_HEIGHT + horizon) / 2, GAME_WIDTH, GAME_HEIGHT - horizon, p.ground, 1)
    .setDepth(-26);
  /* 地面の散らし模様 (草むら・石ころ) */
  for (let i = 0; i < 40; i++) {
    const x = hashNoise(i + 100) * GAME_WIDTH;
    const y = horizon + 8 + hashNoise(i + 140) * (GAME_HEIGHT - horizon - 20);
    scene.add
      .rectangle(x, y, 8 + hashNoise(i) * 10, 4, p.groundDark, 0.8)
      .setDepth(-25);
  }
  /* モンスターの立つ台地 */
  scene.add
    .ellipse(GAME_WIDTH / 2, GAME_HEIGHT * 0.55, GAME_WIDTH * 0.72, 96, p.platform, 1)
    .setDepth(-24);
  scene.add
    .ellipse(GAME_WIDTH / 2, GAME_HEIGHT * 0.55, GAME_WIDTH * 0.72, 96)
    .setStrokeStyle(3, p.groundDark, 0.9)
    .setDepth(-24);
}

/* 敵スプライトの足元の影 */
export function addEnemyShadow(scene: Scene, x: number, y: number): void {
  scene.add.ellipse(x, y, 104, 22, 0x000000, 0.3).setDepth(-23);
}

/* ダメージ数字がふわっと浮かんで消える。かいしんは大きく金色で */
export function spawnDamagePopup(
  scene: Scene,
  x: number,
  y: number,
  text: string,
  color = "#ffffff",
  big = false,
): void {
  const popup = scene.add
    .text(x, y, text, {
      fontFamily: "sans-serif",
      fontSize: big ? "56px" : "40px",
      fontStyle: "bold",
      color,
      stroke: "#101018",
      strokeThickness: big ? 10 : 8,
    })
    .setOrigin(0.5)
    .setDepth(30)
    .setScale(1.25);
  scene.tweens.add({
    targets: popup,
    y: y - (big ? 64 : 52),
    scale: 1,
    alpha: { from: 1, to: 0 },
    duration: big ? 900 : 750,
    ease: "Cubic.easeOut",
    onComplete: () => popup.destroy(),
  });
}

/* ヒットの白いバースト (リング + 火花) */
export function spawnImpactBurst(scene: Scene, x: number, y: number): void {
  const ring = scene.add
    .circle(x, y, 12)
    .setStrokeStyle(6, 0xffffff, 0.95)
    .setDepth(29);
  scene.tweens.add({
    targets: ring,
    scale: 4,
    alpha: 0,
    duration: 280,
    ease: "Cubic.easeOut",
    onComplete: () => ring.destroy(),
  });
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6 + 0.4;
    const spark = scene.add.rectangle(x, y, 10, 4, 0xffe9a0, 1).setDepth(29);
    spark.setRotation(angle);
    scene.tweens.add({
      targets: spark,
      x: x + Math.cos(angle) * 64,
      y: y + Math.sin(angle) * 64,
      alpha: 0,
      duration: 300,
      ease: "Cubic.easeOut",
      onComplete: () => spark.destroy(),
    });
  }
}

/* ---------- 呪文・攻撃のエフェクト ---------- */

interface SpellFxDef {
  style: "orb" | "slash" | "multi" | "bigburst";
  color: number;
  light: number;
  /* orb の弾の大きさ (上位呪文は大きく) */
  size?: number;
}

/* 呪文ごとの見た目。未登録の攻撃呪文は水色のオーブになる */
const SPELL_FX: Record<string, SpellFxDef> = {
  hikidama: { style: "orb", color: 0x7b5cff, light: 0xc9b8ff, size: 14 },
  hikidaman: { style: "orb", color: 0x5c3cff, light: 0xb39fff, size: 20 },
  kukudama: { style: "orb", color: 0xff7b2e, light: 0xffd9a0, size: 16 },
  kazoeSlash: { style: "slash", color: 0x4de3ff, light: 0xd2f6ff },
  dandanZuki: { style: "multi", color: 0xffd94d, light: 0xfff3c0 },
  hissanBreak: { style: "bigburst", color: 0xff5c3c, light: 0xffd2a8 },
};

const DEFAULT_SPELL_FX: SpellFxDef = {
  style: "orb",
  color: 0x59c9f2,
  light: 0xd2f0fc,
  size: 14,
};

/* 色つきの爆発 (リング + 火花) */
function coloredBurst(
  scene: Scene,
  x: number,
  y: number,
  color: number,
  light: number,
  scale = 1,
): void {
  const ring = scene.add
    .circle(x, y, 14 * scale)
    .setStrokeStyle(7 * scale, light, 0.95)
    .setDepth(29);
  scene.tweens.add({
    targets: ring,
    scale: 3.6,
    alpha: 0,
    duration: 320,
    ease: "Cubic.easeOut",
    onComplete: () => ring.destroy(),
  });
  const count = Math.round(8 * scale);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + 0.2;
    const spark = scene.add
      .rectangle(x, y, 12 * scale, 5 * scale, i % 2 === 0 ? color : light, 1)
      .setDepth(29)
      .setRotation(angle);
    scene.tweens.add({
      targets: spark,
      x: x + Math.cos(angle) * 80 * scale,
      y: y + Math.sin(angle) * 80 * scale,
      alpha: 0,
      duration: 340,
      ease: "Cubic.easeOut",
      onComplete: () => spark.destroy(),
    });
  }
}

/* 斜めの斬撃バー (色つき)。delay 後にシュッと伸びて消える */
function slashBar(
  scene: Scene,
  x: number,
  y: number,
  color: number,
  angleDeg: number,
  delay: number,
): void {
  const bar = scene.add
    .rectangle(x, y, 10, 14, color, 0.95)
    .setDepth(29)
    .setAngle(angleDeg)
    .setAlpha(0);
  scene.tweens.add({
    targets: bar,
    alpha: { from: 0.95, to: 0 },
    scaleX: { from: 0.2, to: 16 },
    duration: 240,
    delay,
    ease: "Cubic.easeOut",
    onComplete: () => bar.destroy(),
  });
}

/*
 * 攻撃呪文のエフェクトを再生し、着弾の瞬間に onImpact を呼ぶ。
 * 呼び出し側は onImpact でダメージ表示 (点滅・ポップアップ) を行う。
 */
export function playSpellAttackFx(
  scene: Scene,
  spellId: string,
  targetX: number,
  targetY: number,
  onImpact: () => void,
): void {
  const fx = SPELL_FX[spellId] ?? DEFAULT_SPELL_FX;

  if (fx.style === "slash") {
    slashBar(scene, targetX, targetY, fx.light, -38, 0);
    slashBar(scene, targetX, targetY, fx.color, 32, 110);
    scene.time.delayedCall(180, () => {
      coloredBurst(scene, targetX, targetY, fx.color, fx.light, 0.9);
      onImpact();
    });
    return;
  }

  if (fx.style === "multi") {
    for (let i = 0; i < 3; i++) {
      scene.time.delayedCall(i * 140, () => {
        coloredBurst(
          scene,
          targetX + (i - 1) * 26,
          targetY + (i % 2 === 0 ? 12 : -14),
          fx.color,
          fx.light,
          0.7,
        );
      });
    }
    scene.time.delayedCall(3 * 140, onImpact);
    return;
  }

  if (fx.style === "bigburst") {
    scene.cameras.main.flash(220, 255, 190, 140);
    scene.cameras.main.shake(260, 0.012);
    coloredBurst(scene, targetX, targetY, fx.color, fx.light, 2.1);
    scene.time.delayedCall(240, onImpact);
    return;
  }

  /* orb: 手前から山なりに飛んでいく魔法弾 + 尾を引く残光 */
  const startX = GAME_WIDTH / 2;
  const startY = GAME_HEIGHT - 170;
  const size = fx.size ?? 14;
  const glow = scene.add.circle(startX, startY, size * 1.6, fx.color, 0.35).setDepth(28);
  const core = scene.add.circle(startX, startY, size, fx.light, 1).setDepth(29);
  let trailTick = 0;
  scene.tweens.addCounter({
    from: 0,
    to: 1,
    duration: 430,
    ease: "Sine.easeIn",
    onUpdate: (tween) => {
      const t = tween.getValue() ?? 0;
      const x = startX + (targetX - startX) * t;
      const y = startY + (targetY - startY) * t - Math.sin(Math.PI * t) * 130;
      core.setPosition(x, y);
      glow.setPosition(x, y);
      trailTick += 1;
      if (trailTick % 3 === 0) {
        const dot = scene.add.circle(x, y, size * 0.55, fx.color, 0.5).setDepth(27);
        scene.tweens.add({
          targets: dot,
          alpha: 0,
          scale: 0.3,
          duration: 260,
          onComplete: () => dot.destroy(),
        });
      }
    },
    onComplete: () => {
      core.destroy();
      glow.destroy();
      coloredBurst(scene, targetX, targetY, fx.color, fx.light, 1.15);
      onImpact();
    },
  });
}

/* 物理攻撃: 白い十字の斬撃 */
export function playSlashFx(scene: Scene, x: number, y: number): void {
  slashBar(scene, x, y, 0xffffff, -35, 0);
  slashBar(scene, x, y, 0xd8e8ff, 40, 90);
}

/* 敵の攻撃: 画面手前 (プレイヤー側) に赤いツメあと */
export function playEnemyAttackFx(scene: Scene): void {
  const cx = GAME_WIDTH / 2;
  const cy = GAME_HEIGHT - 190;
  for (let i = 0; i < 3; i++) {
    const bar = scene.add
      .rectangle(cx - 60 + i * 60, cy - 40, 14, 10, 0xff4d4d, 0.9)
      .setDepth(29)
      .setAngle(62)
      .setAlpha(0);
    scene.tweens.add({
      targets: bar,
      alpha: { from: 0.9, to: 0 },
      scaleY: { from: 0.3, to: 13 },
      duration: 300,
      delay: i * 70,
      ease: "Cubic.easeOut",
      onComplete: () => bar.destroy(),
    });
  }
}

/* 回復: みどりの光の粒が舞い上がる + やわらかい輪 */
export function playHealFx(scene: Scene): void {
  const cx = GAME_WIDTH / 2;
  const cy = GAME_HEIGHT - 180;
  const ring = scene.add
    .circle(cx, cy, 30)
    .setStrokeStyle(6, 0x8cf5a2, 0.8)
    .setDepth(28);
  scene.tweens.add({
    targets: ring,
    scale: 2.6,
    alpha: 0,
    duration: 500,
    ease: "Sine.easeOut",
    onComplete: () => ring.destroy(),
  });
  for (let i = 0; i < 10; i++) {
    const x = cx - 130 + hashNoise(i + 300) * 260;
    const y = cy + 10 + hashNoise(i + 330) * 30;
    const star = scene.add.star(x, y, 4, 3, 7, 0x8cf5a2, 1).setDepth(29).setAlpha(0);
    scene.tweens.add({
      targets: star,
      y: y - 70 - hashNoise(i) * 40,
      alpha: { from: 1, to: 0 },
      duration: 650 + hashNoise(i + 360) * 300,
      delay: i * 45,
      ease: "Sine.easeOut",
      onComplete: () => star.destroy(),
    });
  }
}

/* 守りの呪文: 青いシールドの輪がひろがる */
export function playBuffFx(scene: Scene): void {
  const cx = GAME_WIDTH / 2;
  const cy = GAME_HEIGHT - 185;
  for (let i = 0; i < 2; i++) {
    const ring = scene.add
      .circle(cx, cy, 36)
      .setStrokeStyle(7 - i * 2, 0x6fb8ff, 0.85)
      .setDepth(28);
    scene.tweens.add({
      targets: ring,
      scale: 2.2 + i * 0.9,
      alpha: 0,
      duration: 520,
      delay: i * 130,
      ease: "Sine.easeOut",
      onComplete: () => ring.destroy(),
    });
  }
  const dome = scene.add.circle(cx, cy, 58, 0x6fb8ff, 0.22).setDepth(27);
  scene.tweens.add({
    targets: dome,
    scale: 1.5,
    alpha: 0,
    duration: 620,
    ease: "Sine.easeOut",
    onComplete: () => dome.destroy(),
  });
}

/* 勝利のきらめき (金の粒が舞い上がる) */
export function spawnVictorySparkles(scene: Scene): void {
  for (let i = 0; i < 14; i++) {
    const x = GAME_WIDTH * 0.25 + hashNoise(i + 200) * GAME_WIDTH * 0.5;
    const y = GAME_HEIGHT * 0.45 + hashNoise(i + 230) * 60;
    const spark = scene.add
      .star(x, y, 4, 3, 8, 0xffe066, 1)
      .setDepth(28)
      .setAlpha(0);
    scene.tweens.add({
      targets: spark,
      y: y - 90 - hashNoise(i) * 60,
      alpha: { from: 1, to: 0 },
      angle: 180,
      duration: 900 + hashNoise(i + 260) * 500,
      delay: i * 60,
      ease: "Sine.easeOut",
      onComplete: () => spark.destroy(),
    });
  }
}
