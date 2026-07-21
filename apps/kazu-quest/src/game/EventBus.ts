import { Events } from "phaser";

/*
 * React コンポーネントと Phaser シーンの間のイベントバス。
 * 直接参照は禁止し、必ずここを経由する (docs/kazu-quest-design-plan.md B4 参照)。
 *
 * 主なイベント (実装が進んだら追記):
 * - "current-scene-ready" (scene)                       : シーン起動完了
 * - "math-prompt"  {requestId, skillId, timeLimitMs, context} : Phaser→React 出題依頼
 * - "math-result"  {requestId, correct, timedOut, elapsedMs}  : React→Phaser 解答結果
 * - "open-spell-test" {spellId} / "spell-test-finished" {spellId, passed}
 */
export const EventBus = new Events.EventEmitter();
