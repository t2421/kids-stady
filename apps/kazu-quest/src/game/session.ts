/*
 * 実行中のゲームセッション (アクティブプロフィール + セーブデータ)。
 * シーン間で共有するランタイム状態。localStorage への書き出しは
 * autosave() 経由 (transfer時・戦闘終了時・メニュー閉時に呼ぶ)。
 */

import { AVATARS, createProfile, getActiveId } from "../lib/profiles";
import type { SaveData } from "../lib/save";
import { defaultSave, loadSave, persistSave } from "../lib/save";
import { addPlaytime } from "../lib/playtime";
import { initMasteryFromFlags } from "../lib/mastery";
import { writeMasterySnapshot } from "../lib/sharedMasteryLog";

interface SessionState {
  profileId: string | null;
  save: SaveData;
}

const state: SessionState = {
  profileId: null,
  save: defaultSave(),
};

/*
 * タイトル画面 (プロフィール確定後) に呼ぶ。ここで一度だけ既存プレイヤーの
 * mastery 巻き戻し防止 (initMasteryFromFlags) を適用する — 冪等なので毎回
 * 呼んでも安全だが、getSave() 側では呼ばない (呼び出しのたびに走らせない)
 */
export function startSession(profileId: string | null): void {
  state.profileId = profileId;
  state.save = profileId ? loadSave(profileId) : defaultSave();
  state.save = initMasteryFromFlags(state.save);
}

/*
 * アクティブプロフィールでセッションを開始する。
 * プロフィールが1つもなければデフォルトを自動作成する —
 * これが無いと進行がメモリ上だけになり、リロードで習得呪文まで消えてしまう。
 * (プロフィール選択・切替UIは M10 で追加予定)
 */
export function ensureSession(): void {
  if (state.profileId === null) {
    let active = getActiveId();
    if (!active) {
      active = createProfile("ゆうしゃ", AVATARS[0]);
    }
    startSession(active);
  }
}

export function getProfileId(): string | null {
  return state.profileId;
}

export function getSave(): SaveData {
  return state.save;
}

export function updateSave(updater: (save: SaveData) => SaveData): SaveData {
  state.save = updater(state.save);
  return state.save;
}

/*
 * LP-11b (3): mastery の共有ログへの書き出しもここに集約する。専用の呼び出し口を
 * 増やすと呼び忘れが起きるため、セーブ全体の書き出しタイミング (autosave) と揃えた
 * (呼び出し頻度は元々 transfer時・戦闘終了時・メニュー閉時など粗いので許容できる)
 */
export function autosave(): void {
  if (state.profileId) {
    persistSave(state.profileId, state.save);
    writeMasterySnapshot(state.profileId, state.save);
  }
}

/* ---------- プレイ時間 ---------- */

/*
 * タブが隠れている間は加算しない。Phaser はバックグラウンドで update を
 * 止めるが、復帰の1フレームで巨大な delta が来る (addPlaytime の clamp と二重の保険)。
 * Node (Vitest) には document が無いので、その場合は常に「表示中」扱い。
 */
let playtimePaused = false;
let visibilityGuardInstalled = false;

function ensureVisibilityGuard(): void {
  if (visibilityGuardInstalled || typeof document === "undefined") return;
  visibilityGuardInstalled = true;
  playtimePaused = document.hidden;
  document.addEventListener("visibilitychange", () => {
    playtimePaused = document.hidden;
  });
}

/* Field/Battle の update(time, delta) から毎フレーム呼ぶ。書き出しは autosave() 任せ */
export function tickPlaytime(deltaMs: number): void {
  ensureVisibilityGuard();
  if (playtimePaused) return;
  state.save = addPlaytime(state.save, deltaMs);
}
