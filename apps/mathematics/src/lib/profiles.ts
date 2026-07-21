/*
 * 全アプリ共有のプレイヤープロフィール (名前+アバター)。
 * ストレージ契約の正典は docs/save-data.md。
 * vanilla 実装 (shared/js/profiles.js) と挙動を一致させること。
 */

export interface Profile {
  id: string;
  name: string;
  avatar: string;
}

interface ProfileIndex {
  activeId: string | null;
  profiles: Profile[];
}

const INDEX_KEY = "kidsStudy.profiles.v1";
/* プロフィール共有化以前に けいさんシューター が使っていた索引キー。
   共通キーがまだ存在しない端末では、ここから一度だけ引き継ぐ。 */
const KEISAN_INDEX_KEY = "kidsStudy.keisanShooter.profiles.v1";

export const AVATARS = [
  "🦊",
  "🐱",
  "🐶",
  "🐰",
  "🐻",
  "🐼",
  "🦁",
  "🐸",
  "🐵",
  "🐧",
] as const;

function storage(): Storage | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function readJSON(key: string): unknown {
  try {
    const raw = storage()?.getItem(key);
    return raw == null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    storage()?.setItem(key, JSON.stringify(value));
  } catch {
    /* ストレージが使えない環境ではメモリ上の値だけで続行する */
  }
}

export function removeKey(key: string): void {
  try {
    storage()?.removeItem(key);
  } catch {
    /* noop */
  }
}

function makeId(): string {
  return "p" + Math.random().toString(36).slice(2, 9);
}

function normalizeIndex(raw: unknown): ProfileIndex {
  if (typeof raw !== "object" || raw === null) {
    return { activeId: null, profiles: [] };
  }
  const obj = raw as { activeId?: unknown; profiles?: unknown };
  if (!Array.isArray(obj.profiles)) return { activeId: null, profiles: [] };

  const profiles: Profile[] = obj.profiles
    .filter(
      (p): p is { id: string; name?: unknown; avatar?: unknown } =>
        typeof p === "object" &&
        p !== null &&
        typeof (p as { id?: unknown }).id === "string" &&
        (p as { id: string }).id !== "",
    )
    .map((p) => ({
      id: p.id,
      name: typeof p.name === "string" && p.name ? p.name : "プレイヤー",
      avatar: typeof p.avatar === "string" && p.avatar ? p.avatar : AVATARS[0],
    }));

  let activeId = typeof obj.activeId === "string" ? obj.activeId : null;
  if (activeId && !profiles.some((p) => p.id === activeId)) activeId = null;
  return { activeId, profiles };
}

function loadIndex(): ProfileIndex {
  let stored: string | null = null;
  try {
    stored = storage()?.getItem(INDEX_KEY) ?? null;
  } catch {
    stored = null;
  }

  /* 引き継ぎは「共通キーが一度も作られていない」ときだけ行う。
     空の一覧 (全プロフィール削除済み) を旧データで復活させてはいけない。 */
  if (stored === null) {
    const legacy = normalizeIndex(readJSON(KEISAN_INDEX_KEY));
    if (legacy.profiles.length > 0) {
      writeJSON(INDEX_KEY, legacy);
      return legacy;
    }
    return { activeId: null, profiles: [] };
  }

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(stored);
  } catch {
    parsed = null;
  }
  return normalizeIndex(parsed);
}

function saveIndex(idx: ProfileIndex): void {
  writeJSON(INDEX_KEY, idx);
}

export function listProfiles(): Profile[] {
  return loadIndex().profiles.slice();
}

export function getActiveId(): string | null {
  return loadIndex().activeId;
}

export function setActiveId(id: string): void {
  const idx = loadIndex();
  saveIndex({ ...idx, activeId: id });
}

export function createProfile(name: string, avatar: string): string {
  const idx = loadIndex();
  const id = makeId();
  const profile: Profile = {
    id,
    name: name || "プレイヤー",
    avatar: avatar || AVATARS[0],
  };
  saveIndex({ activeId: id, profiles: [...idx.profiles, profile] });
  return id;
}

/* プロフィール本体 (名前+アバター) だけを消す。
   このアプリのゲーム進行データの掃除は呼び出し側 (save.ts の removeSave) と
   セットで行うこと。他アプリのデータは残るが契約上許容 (docs/save-data.md)。 */
export function deleteProfile(id: string): void {
  const idx = loadIndex();
  saveIndex({
    activeId: idx.activeId === id ? null : idx.activeId,
    profiles: idx.profiles.filter((p) => p.id !== id),
  });
}
