/*
 * きっずスタディ共通のプレイヤープロフィール (名前+アバター) — 全アプリ共通基盤の【正典ソース】。
 * キー: kidsStudy.profiles.v1 (契約は docs/save-data.md §1)。
 *
 * 兄弟それぞれが同じ端末で遊べるよう、複数プロフィールを localStorage に保存し、
 * 全アプリで同じ一覧を共有する。各アプリのゲーム進行データは
 * 「kidsStudy.<アプリ名>.profileData.<プロフィールid>」に各アプリが独自に保存する
 * (= 共有するのはプロフィール本体だけで、ゲームの中身は共有しない)。
 *
 * 利用方法:
 * - Next系アプリ (mathematics / kazu-quest): src/lib/profiles.ts が再エクスポートしている
 * - 静的アプリ (keisan-shooter): shared/js/profiles.js を <script> で読む。
 *   これは本ファイルから `npm run gen:profiles` (apps/mathematics) で生成した
 *   バンドルであり、直接編集してはならない。
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

/* ---- storage (自己完結: localStorage が無い環境=SSR でも落ちない) ---- */

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

/* ---- 索引の読み書き ---- */

export function normalizeIndex(raw: unknown): ProfileIndex {
  if (typeof raw !== "object" || raw === null) {
    return { activeId: null, profiles: [] };
  }
  const source = raw as { activeId?: unknown; profiles?: unknown };
  if (!Array.isArray(source.profiles)) return { activeId: null, profiles: [] };

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
  if (activeId && !profiles.some((p) => p.id === activeId)) activeId = null;
  return { activeId, profiles };
}

export function loadIndex(): ProfileIndex {
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

/* ---- CRUD ---- */

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

/*
 * プロフィール本体 (名前+アバター) を消す。
 * 呼び出したアプリ自身の進行データの掃除は removeAppData に渡すこと。
 * 他アプリの profileData には触らない (残るが小さなJSONなので契約上許容 —
 * docs/save-data.md §2)。
 */
export function deleteProfile(
  id: string,
  removeAppData?: (id: string) => void,
): void {
  const idx = loadIndex();
  saveIndex({
    activeId: idx.activeId === id ? null : idx.activeId,
    profiles: idx.profiles.filter((p) => p.id !== id),
  });
  removeAppData?.(id);
}
