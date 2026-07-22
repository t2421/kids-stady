import type { Scene } from "phaser";

/*
 * シーン遷移用のフェード演出。
 * Phaser 4.2 ではカメラの fadeOut/fadeIn エフェクトが進行しない
 * (fadeEffect.progress が 0 のまま・完了イベントも発火しない) ため、
 * 画面を覆う黒矩形 + Tween で代替する。
 *
 * さらに、負荷が高い環境では tween の onComplete 自体が発火しない
 * ことがある (E2Eで観測: 遷移が永遠に完了せずソフトロック)。
 * 遷移コールバックは壁時計の setTimeout を保険にして必ず1回実行する。
 */

const FADE_MS = 250;
const WATCHDOG_EXTRA_MS = 300;

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
  let fired = false;
  const fire = () => {
    if (fired) return;
    fired = true;
    rect.setAlpha(1); /* 演出が途中でも遷移前に画面を隠し切る */
    onDone();
  };
  scene.tweens.add({
    targets: rect,
    alpha: 1,
    duration: FADE_MS,
    onComplete: fire,
  });
  setTimeout(fire, FADE_MS + WATCHDOG_EXTRA_MS);
}

export function fadeIn(scene: Scene): void {
  const rect = coverRect(scene, 1);
  let fired = false;
  const clear = () => {
    if (fired) return;
    fired = true;
    rect.destroy();
  };
  scene.tweens.add({
    targets: rect,
    alpha: 0,
    duration: FADE_MS,
    onComplete: clear,
  });
  /* tween が完了しなくても黒画面が残らないようにする */
  setTimeout(clear, FADE_MS + WATCHDOG_EXTRA_MS);
}
