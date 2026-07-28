/*
 * フィールド操作のタイミング定数。
 * E2E (e2e/smoke.spec.ts の stepOnce) が「キー押下時間 < STEP_MS なら
 * 1タップ=1歩」という前提でここを参照するため、Phaser 非依存の
 * このモジュールに分離している。値を変えると E2E の歩行タイミングも追従する。
 */

/* 1歩の移動 tween にかかる時間 */
export const STEP_MS = 150;

/* イベント終了直後の誤操作を防ぐクールダウン (壁時計で判定) */
export const INTERACT_COOLDOWN_MS = 200;
