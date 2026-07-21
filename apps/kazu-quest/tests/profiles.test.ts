import { beforeEach, describe, expect, it } from "vitest";
import { installLocalStorageStub } from "./localStorageStub";
import {
  AVATARS,
  INDEX_KEY,
  createProfile,
  deleteProfile,
  getActiveId,
  listProfiles,
  loadIndex,
  normalizeIndex,
  setActiveId,
} from "../src/lib/profiles";

const KEISAN_KEY = "kidsStudy.keisanShooter.profiles.v1";

let store: Map<string, string>;

beforeEach(() => {
  store = installLocalStorageStub();
});

describe("normalizeIndex", () => {
  it("returns empty index for garbage input", () => {
    expect(normalizeIndex(null)).toEqual({ activeId: null, profiles: [] });
    expect(normalizeIndex("x")).toEqual({ activeId: null, profiles: [] });
    expect(normalizeIndex({ profiles: "no" })).toEqual({
      activeId: null,
      profiles: [],
    });
  });

  it("fills missing name/avatar and drops broken entries", () => {
    const idx = normalizeIndex({
      activeId: "p1",
      profiles: [
        { id: "p1" },
        { id: "", name: "x" },
        null,
        { id: "p2", name: "ハナ", avatar: "🐱" },
      ],
    });
    expect(idx.profiles).toEqual([
      { id: "p1", name: "プレイヤー", avatar: AVATARS[0] },
      { id: "p2", name: "ハナ", avatar: "🐱" },
    ]);
    expect(idx.activeId).toBe("p1");
  });

  it("nulls dangling activeId", () => {
    const idx = normalizeIndex({ activeId: "ghost", profiles: [{ id: "p1" }] });
    expect(idx.activeId).toBeNull();
  });
});

describe("keisan legacy migration", () => {
  it("migrates once when the neutral key has never existed", () => {
    store.set(
      KEISAN_KEY,
      JSON.stringify({
        activeId: "pk1",
        profiles: [{ id: "pk1", name: "タロウ", avatar: "🐶" }],
      }),
    );
    const idx = loadIndex();
    expect(idx.profiles).toHaveLength(1);
    expect(idx.profiles[0].id).toBe("pk1");
    /* 移行結果が共通キーへ書かれる */
    expect(store.has(INDEX_KEY)).toBe(true);
    /* 旧キーは消さない */
    expect(store.has(KEISAN_KEY)).toBe(true);
  });

  it("does not resurrect after the neutral key exists (even empty)", () => {
    store.set(INDEX_KEY, JSON.stringify({ activeId: null, profiles: [] }));
    store.set(
      KEISAN_KEY,
      JSON.stringify({ activeId: "pk1", profiles: [{ id: "pk1" }] }),
    );
    expect(loadIndex().profiles).toHaveLength(0);
  });

  it("does not create the neutral key when legacy is empty", () => {
    store.set(KEISAN_KEY, JSON.stringify({ activeId: null, profiles: [] }));
    expect(loadIndex().profiles).toHaveLength(0);
    expect(store.has(INDEX_KEY)).toBe(false);
  });
});

describe("CRUD", () => {
  it("creates a profile, sets it active, and lists it", () => {
    const id = createProfile("ハナ", "🐱");
    expect(id).toMatch(/^p[a-z0-9]{7}$/);
    expect(getActiveId()).toBe(id);
    expect(listProfiles()).toEqual([{ id, name: "ハナ", avatar: "🐱" }]);
  });

  it("defaults empty name/avatar", () => {
    const id = createProfile("", "");
    expect(listProfiles()[0]).toEqual({
      id,
      name: "プレイヤー",
      avatar: AVATARS[0],
    });
  });

  it("switches active profile", () => {
    const a = createProfile("A", "🐱");
    const b = createProfile("B", "🐶");
    expect(getActiveId()).toBe(b);
    setActiveId(a);
    expect(getActiveId()).toBe(a);
  });

  it("deletes identity, clears active, and calls the app-data cleaner", () => {
    const id = createProfile("A", "🐱");
    const removed: string[] = [];
    deleteProfile(id, (pid) => removed.push(pid));
    expect(listProfiles()).toHaveLength(0);
    expect(getActiveId()).toBeNull();
    expect(removed).toEqual([id]);
  });
});
