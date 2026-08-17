/*
 * 戦闘の舞台背景と小演出。
 * 背景はフィールドのテーマ (grass/forest/cave/interior) ごとに
 * 空のグラデーション + 遠景シルエット + 地面を描き分ける。
 * ダメージポップアップとヒットバーストもここに集約する。
 */
import type Phaser from "phaser";
import type { Scene } from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../main";
import { EFFECT_ART } from "../../content/art/effects";
import { effectTextureKey } from "../textures";

/* ---------- スプライトアニメ再生 ---------- */

interface EffectAnimOpts {
  scale?: number;
  frameMs?: number;
  tint?: number;
  angle?: number;
  flipX?: boolean;
  depth?: number;
  onDone?: () => void;
}

/*
 * "fx-<name>-<i>" の連番テクスチャを順に表示して消える。
 * 返した Image を呼び出し側が tween で動かしてもよい (移動しながら再生)。
 */
export function playEffectAnim(
  scene: Scene,
  name: keyof typeof EFFECT_ART,
  x: number,
  y: number,
  opts: EffectAnimOpts = {},
): Phaser.GameObjects.Image {
  const frames = EFFECT_ART[name].length;
  const img = scene.add
    .image(x, y, effectTextureKey(name, 0))
    .setDepth(opts.depth ?? 29)
    .setScale(opts.scale ?? 6);
  if (opts.tint !== undefined) img.setTint(opts.tint);
  if (opts.angle !== undefined) img.setAngle(opts.angle);
  if (opts.flipX) img.setFlipX(true);
  const step = (i: number) => {
    if (!img.active) return;
    if (i >= frames) {
      img.destroy();
      opts.onDone?.();
      return;
    }
    img.setTexture(effectTextureKey(name, i));
    scene.time.delayedCall(opts.frameMs ?? 90, () => step(i + 1));
  };
  step(0);
  return img;
}

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

/* 物理ヒットの白いスターバースト (スプライトアニメ + 火花) */
export function spawnImpactBurst(scene: Scene, x: number, y: number): void {
  playEffectAnim(scene, "hit", x, y, { scale: 7, frameMs: 80 });
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6 + 0.4;
    const spark = scene.add.rectangle(x, y, 10, 4, 0xffe9a0, 1).setDepth(28);
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
  /* 着弾演出: tint した hit スター or 炎の爆発 */
  impact: "hit" | "explosion";
  /* orb スプライトの拡大率 (上位呪文は大きく) */
  orbScale?: number;
}

/* 呪文ごとの見た目。未登録の攻撃呪文は水色のオーブになる */
const SPELL_FX: Record<string, SpellFxDef> = {
  hikidama: { style: "orb", color: 0x9b7bff, light: 0xd9ccff, impact: "hit", orbScale: 5 },
  hikidaman: { style: "orb", color: 0x7b54ff, light: 0xc4b2ff, impact: "hit", orbScale: 7 },
  kukudama: { style: "orb", color: 0xffa04d, light: 0xffe2b8, impact: "explosion", orbScale: 6 },
  kazoeSlash: { style: "slash", color: 0x4de3ff, light: 0xd2f6ff, impact: "hit" },
  dandanZuki: { style: "multi", color: 0xffd94d, light: 0xfff3c0, impact: "hit" },
  hissanBreak: { style: "bigburst", color: 0xff5c3c, light: 0xffd2a8, impact: "explosion" },
  /* 第3章 */
  waridama: { style: "slash", color: 0x4de08a, light: 0xd6ffe8, impact: "hit" },
  ketaCrush: { style: "bigburst", color: 0xff9f1c, light: 0xffe6b0, impact: "explosion" },
  manLight: { style: "orb", color: 0xfff1a8, light: 0xffffff, impact: "explosion", orbScale: 8 },
  shousuuRain: { style: "multi", color: 0x6fd0f2, light: 0xd8f4ff, impact: "hit" },
  omosaPress: { style: "bigburst", color: 0x9a8f7a, light: 0xe0d8c8, impact: "hit" },
  /* 第4章 */
  kakudoSpin: { style: "slash", color: 0x8fc0e0, light: 0xf0fbff, impact: "hit" },
  decimaFreeze: { style: "multi", color: 0x5ec8f0, light: 0xd8f4ff, impact: "hit" },
  gaisuuBomb: { style: "bigburst", color: 0xffb347, light: 0xffe9c2, impact: "explosion" },
  octoBillion: { style: "orb", color: 0xc9a0ff, light: 0xf2e6ff, impact: "explosion", orbScale: 9 },
  warikiriBlade: { style: "slash", color: 0xa8e0ff, light: 0xffffff, impact: "explosion" },
  /* 第5章 */
  percenFlare: { style: "bigburst", color: 0xff6a3c, light: 0xffd9a8, impact: "explosion" },
  tsuubunSlash: { style: "slash", color: 0x7fffd4, light: 0xffffff, impact: "explosion" },
  shousuuStorm: { style: "multi", color: 0x5ec8f0, light: 0xe0f8ff, impact: "explosion" },
  baiyakuBreak: { style: "bigburst", color: 0xd9a0ff, light: 0xf6e6ff, impact: "hit" },
  taisekiPress: { style: "orb", color: 0x9ab8d8, light: 0xe6f0ff, impact: "explosion", orbScale: 9 },
  /* 第6章 */
  enNoHadou: { style: "orb", color: 0xfff4c2, light: 0xffffff, impact: "explosion", orbScale: 10 },
  bunsuuNova: { style: "bigburst", color: 0xff4fa3, light: 0xffd9ec, impact: "explosion" },
  ratioBreak: { style: "slash", color: 0xffc14d, light: 0xfff0c2, impact: "explosion" },
  mojishikiSign: { style: "orb", color: 0x8fe0ff, light: 0xffffff, impact: "hit", orbScale: 7 },
  kakudaiSlash: { style: "slash", color: 0xd9a0ff, light: 0xf6e6ff, impact: "explosion" },
  baainoKazu: { style: "multi", color: 0xffe98a, light: 0xfffbe6, impact: "hit" },
};

const DEFAULT_SPELL_FX: SpellFxDef = {
  style: "orb",
  color: 0x59c9f2,
  light: 0xd2f0fc,
  impact: "hit",
  orbScale: 5,
};

/* 着弾: hit スター (tint) or 炎の爆発アニメ + 色つき火花 */
function impactAnim(
  scene: Scene,
  x: number,
  y: number,
  fx: SpellFxDef,
  scale = 7,
): void {
  if (fx.impact === "explosion") {
    playEffectAnim(scene, "explosion", x, y, { scale, frameMs: 80 });
  } else {
    playEffectAnim(scene, "hit", x, y, { scale, frameMs: 80, tint: fx.color });
  }
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 * i) / 6 + 0.3;
    const spark = scene.add
      .rectangle(x, y, 12, 5, i % 2 === 0 ? fx.color : fx.light, 1)
      .setDepth(28)
      .setRotation(angle);
    scene.tweens.add({
      targets: spark,
      x: x + Math.cos(angle) * 78,
      y: y + Math.sin(angle) * 78,
      alpha: 0,
      duration: 320,
      ease: "Cubic.easeOut",
      onComplete: () => spark.destroy(),
    });
  }
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
    /* 三日月斬撃 2連 (2撃目は反転) → 着弾 */
    playEffectAnim(scene, "slash", targetX, targetY, {
      scale: 9,
      frameMs: 70,
      tint: fx.color,
    });
    scene.time.delayedCall(140, () => {
      playEffectAnim(scene, "slash", targetX, targetY, {
        scale: 9,
        frameMs: 70,
        tint: fx.light,
        flipX: true,
      });
    });
    scene.time.delayedCall(320, () => {
      impactAnim(scene, targetX, targetY, fx, 6);
      onImpact();
    });
    return;
  }

  if (fx.style === "multi") {
    for (let i = 0; i < 3; i++) {
      scene.time.delayedCall(i * 150, () => {
        playEffectAnim(
          scene,
          "hit",
          targetX + (i - 1) * 28,
          targetY + (i % 2 === 0 ? 14 : -16),
          { scale: 5, frameMs: 70, tint: fx.color },
        );
      });
    }
    scene.time.delayedCall(3 * 150, onImpact);
    return;
  }

  if (fx.style === "bigburst") {
    scene.cameras.main.flash(220, 255, 190, 140);
    scene.cameras.main.shake(260, 0.012);
    playEffectAnim(scene, "explosion", targetX, targetY, { scale: 13, frameMs: 95 });
    scene.time.delayedCall(280, onImpact);
    return;
  }

  /* orb: 回転しながら山なりに飛ぶ魔法弾 + 尾を引く残光 */
  const startX = GAME_WIDTH / 2;
  const startY = GAME_HEIGHT - 170;
  const orbScale = fx.orbScale ?? 5;
  const glow = scene.add
    .circle(startX, startY, orbScale * 3.4, fx.color, 0.3)
    .setDepth(27);
  const orb = playEffectAnimLoop(scene, "orb", startX, startY, {
    scale: orbScale,
    frameMs: 90,
    tint: fx.color,
    depth: 29,
  });
  let trailTick = 0;
  scene.tweens.addCounter({
    from: 0,
    to: 1,
    duration: 450,
    ease: "Sine.easeIn",
    onUpdate: (tween) => {
      const t = tween.getValue() ?? 0;
      const x = startX + (targetX - startX) * t;
      const y = startY + (targetY - startY) * t - Math.sin(Math.PI * t) * 130;
      orb.setPosition(x, y);
      orb.setAngle(t * 540);
      glow.setPosition(x, y);
      trailTick += 1;
      if (trailTick % 3 === 0) {
        const dot = scene.add
          .circle(x, y, orbScale * 1.6, fx.color, 0.45)
          .setDepth(26);
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
      orb.destroy();
      glow.destroy();
      impactAnim(scene, targetX, targetY, fx, 8);
      onImpact();
    },
  });
}

/* orb 用: フレームをループ再生し続ける (破棄は呼び出し側) */
function playEffectAnimLoop(
  scene: Scene,
  name: keyof typeof EFFECT_ART,
  x: number,
  y: number,
  opts: EffectAnimOpts,
): Phaser.GameObjects.Image {
  const frames = EFFECT_ART[name].length;
  const img = scene.add
    .image(x, y, effectTextureKey(name, 0))
    .setDepth(opts.depth ?? 29)
    .setScale(opts.scale ?? 6);
  if (opts.tint !== undefined) img.setTint(opts.tint);
  const step = (i: number) => {
    if (!img.active) return;
    img.setTexture(effectTextureKey(name, i % frames));
    scene.time.delayedCall(opts.frameMs ?? 90, () => step(i + 1));
  };
  step(0);
  return img;
}

/* 物理攻撃: 白い三日月斬撃 */
export function playSlashFx(scene: Scene, x: number, y: number): void {
  playEffectAnim(scene, "slash", x, y, { scale: 9, frameMs: 60 });
}

/* 敵の攻撃: 画面手前 (プレイヤー側) に赤いツメあと */
export function playEnemyAttackFx(scene: Scene): void {
  playEffectAnim(scene, "claw", GAME_WIDTH / 2, GAME_HEIGHT - 210, {
    scale: 10,
    frameMs: 110,
  });
}

/* 回復: みどりのきらめきが舞い上がる + やわらかい輪 */
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
  for (let i = 0; i < 6; i++) {
    const x = cx - 130 + hashNoise(i + 300) * 260;
    const y = cy + 10 + hashNoise(i + 330) * 30;
    scene.time.delayedCall(i * 90, () => {
      const spark = playEffectAnim(scene, "sparkle", x, y, {
        scale: 4 + Math.round(hashNoise(i) * 2),
        frameMs: 140,
        tint: 0x8cf5a2,
      });
      scene.tweens.add({
        targets: spark,
        y: y - 60 - hashNoise(i) * 40,
        duration: 420,
        ease: "Sine.easeOut",
      });
    });
  }
}

/* 守りの呪文: たてのスプライト + 青い輪がひろがる */
export function playBuffFx(scene: Scene): void {
  const cx = GAME_WIDTH / 2;
  const cy = GAME_HEIGHT - 195;
  playEffectAnim(scene, "shield", cx, cy, { scale: 8, frameMs: 160 });
  const ring = scene.add
    .circle(cx, cy, 36)
    .setStrokeStyle(6, 0x6fb8ff, 0.8)
    .setDepth(28);
  scene.tweens.add({
    targets: ring,
    scale: 2.4,
    alpha: 0,
    duration: 540,
    ease: "Sine.easeOut",
    onComplete: () => ring.destroy(),
  });
}

/* 勝利のきらめき (金のスパークルが舞い上がる) */
export function spawnVictorySparkles(scene: Scene): void {
  for (let i = 0; i < 12; i++) {
    const x = GAME_WIDTH * 0.25 + hashNoise(i + 200) * GAME_WIDTH * 0.5;
    const y = GAME_HEIGHT * 0.45 + hashNoise(i + 230) * 60;
    scene.time.delayedCall(i * 70, () => {
      const spark = playEffectAnim(scene, "sparkle", x, y, {
        scale: 4 + Math.round(hashNoise(i) * 3),
        frameMs: 170,
        tint: 0xffe066,
      });
      scene.tweens.add({
        targets: spark,
        y: y - 80 - hashNoise(i) * 50,
        duration: 500,
        ease: "Sine.easeOut",
      });
    });
  }
}
