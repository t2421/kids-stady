/*
 * 実行中のゲームセッション (アクティブプロフィール + セーブデータ)。
 * シーン間で共有するランタイム状態。localStorage への書き出しは
 * autosave() 経由 (transfer時・戦闘終了時・メニュー閉時に呼ぶ)。
 */

import { AVATARS, createProfile, getActiveId } from "../lib/profiles";
import type { SaveData } from "../lib/save";
import { defaultSave, loadSave, persistSave } from "../lib/save";

interface SessionState {
  profileId: string | null;
  save: SaveData;
}

const state: SessionState = {
  profileId: null,
  save: defaultSave(),
};

/* タイトル画面 (プロフィール確定後) に呼ぶ */
export function startSession(profileId: string | null): void {
  state.profileId = profileId;
  state.save = profileId ? loadSave(profileId) : defaultSave();
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

export function getSave(): SaveData {
  return state.save;
}

export function updateSave(updater: (save: SaveData) => SaveData): SaveData {
  state.save = updater(state.save);
  return state.save;
}

export function autosave(): void {
  if (state.profileId) {
    persistSave(state.profileId, state.save);
  }
}
