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
 * - "profile-ready" {id}   : プロフィール確定 (ProfileGate → TitleMenu)
 * - "title-ready"          : TitleScene 表示 (Phaser → TitleMenu を出す)
 * - "title-start"          : タイトルメニューの開始操作 (React → TitleScene が冒険開始)
 * - "show-stats" / "stats-closed" : せいせき オーバーレイの開閉
 */
export const EventBus = new Events.EventEmitter();
