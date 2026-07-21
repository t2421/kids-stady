import { Events } from "phaser";

/*
 * React コンポーネントと Phaser シーンの間のイベントバス。
 * 直接参照は禁止し、必ずここを経由する (docs/mathematics-design-plan.md 参照)。
 *
 * 主なイベント (実装が進んだら追記):
 * - "current-scene-ready" (scene) : シーン起動完了
 */
export const EventBus = new Events.EventEmitter();

if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as unknown as { __eventBus?: unknown }).__eventBus = EventBus;
}
