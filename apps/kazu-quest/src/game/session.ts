/*
 * 実行中のゲームセッション (アクティブプロフィール + セーブデータ)。
 * シーン間で共有するランタイム状態。localStorage への書き出しは
 * autosave() 経由 (transfer時・戦闘終了時・メニュー閉時に呼ぶ)。
 */

import { getActiveId } from "../lib/profiles";
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

/* プロフィール未選択でも遊べるようにする (進行はメモリ上のみ) */
export function ensureSession(): void {
  if (state.profileId === null) {
    const active = getActiveId();
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
