/*
 * マップの雰囲気演出。
 * 洞くつ (theme === "cave") では画面を闇でおおい、勇者の周囲だけ
 * 松明の明かりのように照らす。明かりはゆっくり明滅する。
 */
import type { Scene } from "phaser";
import type Phaser from "phaser";

const DARKNESS_KEY = "fx-cave-darkness";
/* テクスチャは一辺 1024px。マップ (最大 320px 程度) を常に覆いきれる */
const DARKNESS_SIZE = 1024;

/* 中心が透明で外へむかって暗くなる放射グラデーションを一度だけ生成する */
function ensureDarknessTexture(scene: Scene): void {
  if (scene.textures.exists(DARKNESS_KEY)) return;
  const canvas = scene.textures.createCanvas(
    DARKNESS_KEY,
    DARKNESS_SIZE,
    DARKNESS_SIZE,
  );
  if (!canvas) return;
  const ctx = canvas.context;
  const half = DARKNESS_SIZE / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, "rgba(6, 8, 18, 0)");
  grad.addColorStop(0.07, "rgba(6, 8, 18, 0)");
  grad.addColorStop(0.16, "rgba(6, 8, 18, 0.45)");
  grad.addColorStop(0.3, "rgba(6, 8, 18, 0.82)");
  grad.addColorStop(0.5, "rgba(6, 8, 18, 0.94)");
  grad.addColorStop(1, "rgba(6, 8, 18, 0.97)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, DARKNESS_SIZE, DARKNESS_SIZE);
  canvas.refresh();
}

/*
 * 闇のオーバーレイを作って返す。呼び出し側が毎フレーム
 * setPosition でプレイヤーに追従させる (FieldScene.update)。
 */
export function createCaveDarkness(
  scene: Scene,
  x: number,
  y: number,
): Phaser.GameObjects.Image {
  ensureDarknessTexture(scene);
  const overlay = scene.add.image(x, y, DARKNESS_KEY).setDepth(40);
  /* 松明のゆらめき: 明かりの輪がわずかに伸び縮みする */
  scene.tweens.add({
    targets: overlay,
    scaleX: 1.06,
    scaleY: 1.06,
    duration: 900,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
  return overlay;
}
