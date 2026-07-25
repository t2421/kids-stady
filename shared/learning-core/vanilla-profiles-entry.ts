/*
 * 静的アプリ向けIIFEバンドルのエントリ。
 * `npm run gen:profiles` (apps/mathematics) が shared/js/profiles.js に出力する。
 * グローバルAPI: window.KidsProfiles (keisan-shooter が読む既存の形を維持)
 */

import {
  AVATARS,
  createProfile,
  deleteProfile,
  getActiveId,
  listProfiles,
  readJSON,
  setActiveId,
  writeJSON,
} from "./profiles";

declare const globalThis: { KidsProfiles?: unknown } & Record<string, unknown>;

globalThis.KidsProfiles = {
  AVATARS,
  readJSON,
  writeJSON,
  listProfiles,
  getActiveId,
  setActiveId,
  createProfile,
  deleteProfile,
};
