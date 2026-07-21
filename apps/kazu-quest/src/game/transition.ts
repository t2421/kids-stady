import type { Scene } from "phaser";

/*
 * シーン遷移用のフェード演出。
 * Phaser 4.2 ではカメラの fadeOut/fadeIn エフェクトが進行しない
 * (fadeEffect.progress が 0 のまま・完了イベントも発火しない) ため、
 * 画面を覆う黒矩形 + Tween で代替する。
 */

const FADE_MS = 250;

/* カメラのズーム・スクロールに関係なく画面全体を覆う矩形を作る */
function coverRect(scene: Scene, alpha: number) {
  const cam = scene.cameras.main;
  const view = cam.worldView;
  const w = (scene.scale.width / cam.zoom) * 2;
  const h = (scene.scale.height / cam.zoom) * 2;
  return scene.add
    .rectangle(view.centerX, view.centerY, w, h, 0x000000, 1)
    .setAlpha(alpha)
    .setDepth(1000);
}

export function fadeOutThen(scene: Scene, onDone: () => void): void {
  const rect = coverRect(scene, 0);
  scene.tweens.add({
    targets: rect,
    alpha: 1,
    duration: FADE_MS,
    onComplete: () => onDone(),
  });
}

export function fadeIn(scene: Scene): void {
  const rect = coverRect(scene, 1);
  scene.tweens.add({
    targets: rect,
    alpha: 0,
    duration: FADE_MS,
    onComplete: () => rect.destroy(),
  });
}
