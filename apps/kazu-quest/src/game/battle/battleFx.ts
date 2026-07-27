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

/* ダメージ数字がふわっと浮かんで消える */
export function spawnDamagePopup(
  scene: Scene,
  x: number,
  y: number,
  text: string,
  color = "#ffffff",
): void {
  const popup = scene.add
    .text(x, y, text, {
      fontFamily: "sans-serif",
      fontSize: "40px",
      fontStyle: "bold",
      color,
      stroke: "#101018",
      strokeThickness: 8,
    })
    .setOrigin(0.5)
    .setDepth(30)
    .setScale(1.25);
  scene.tweens.add({
    targets: popup,
    y: y - 52,
    scale: 1,
    alpha: { from: 1, to: 0 },
    duration: 750,
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
