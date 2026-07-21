/*
 * きっずスタディ共通プロフィール索引の TypeScript 実装。
 * 正典は docs/save-data.md — vanilla 実装 (shared/js/profiles.js) と
 * 挙動を一致させること。client-only (SSR から呼ばない)。
 */

export interface Profile {
  id: string;
  name: string;
  avatar: string;
}

export interface ProfileIndex {
  activeId: string | null;
  profiles: Profile[];
}

export const INDEX_KEY = "kidsStudy.profiles.v1";
/* プロフィール共有化以前に けいさんシューター が使っていた索引キー。
   共通キーがまだ存在しない端末では、ここから一度だけ引き継ぐ。 */
const KEISAN_INDEX_KEY = "kidsStudy.keisanShooter.profiles.v1";

export const AVATARS = [
  "🦊", "🐱", "🐶", "🐰", "🐻", "🐼", "🦁", "🐸", "🐵", "🐧",
] as const;

export function readJSON(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ストレージが使えない環境ではメモリ上の値だけで続行する */
  }
}

function makeId(): string {
  return "p" + Math.random().toString(36).slice(2, 9);
}

export function normalizeIndex(raw: unknown): ProfileIndex {
  if (
    typeof raw !== "object" ||
    raw === null ||
    !Array.isArray((raw as { profiles?: unknown }).profiles)
  ) {
    return { activeId: null, profiles: [] };
  }
  const source = raw as { activeId?: unknown; profiles: unknown[] };
  const profiles: Profile[] = source.profiles
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
  let activeId = typeof source.activeId === "string" ? source.activeId : null;
  if (activeId && !profiles.some((p) => p.id === activeId)) {
    activeId = null;
  }
  return { activeId, profiles };
}

export function loadIndex(): ProfileIndex {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(INDEX_KEY);
  } catch {
    /* noop */
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
  saveIndex({
    activeId: id,
    profiles: [
      ...idx.profiles,
      { id, name: name || "プレイヤー", avatar: avatar || AVATARS[0] },
    ],
  });
  return id;
}

/* プロフィール本体 (名前+アバター) と、カズクエ自身の進行データだけを消す。
   他アプリの profileData には触らない (docs/save-data.md §2)。 */
export function deleteProfile(id: string, removeAppData?: (id: string) => void): void {
  const idx = loadIndex();
  saveIndex({
    activeId: idx.activeId === id ? null : idx.activeId,
    profiles: idx.profiles.filter((p) => p.id !== id),
  });
  removeAppData?.(id);
}
