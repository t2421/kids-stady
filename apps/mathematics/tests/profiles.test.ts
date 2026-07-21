import { beforeEach, describe, expect, it } from "vitest";
import { installLocalStorage } from "./localStorageMock";
import {
  AVATARS,
  createProfile,
  deleteProfile,
  getActiveId,
  listProfiles,
  setActiveId,
} from "../src/lib/profiles";

const INDEX_KEY = "kidsStudy.profiles.v1";
const KEISAN_KEY = "kidsStudy.keisanShooter.profiles.v1";

describe("profiles: 基本操作", () => {
  beforeEach(() => installLocalStorage());

  it("初期状態は空", () => {
    expect(listProfiles()).toEqual([]);
    expect(getActiveId()).toBeNull();
  });

  it("作成するとアクティブになり、削除で外れる", () => {
    const id = createProfile("たろう", "🐶");
    expect(getActiveId()).toBe(id);
    expect(listProfiles()).toHaveLength(1);
    expect(listProfiles()[0]).toEqual({ id, name: "たろう", avatar: "🐶" });

    deleteProfile(id);
    expect(listProfiles()).toEqual([]);
    expect(getActiveId()).toBeNull();
  });

  it("空の名前・アバターはデフォルトで補完される", () => {
    createProfile("", "");
    expect(listProfiles()[0].name).toBe("プレイヤー");
    expect(listProfiles()[0].avatar).toBe(AVATARS[0]);
  });

  it("setActiveId で切り替えられる", () => {
    const a = createProfile("A", "🐱");
    const b = createProfile("B", "🐰");
    expect(getActiveId()).toBe(b);
    setActiveId(a);
    expect(getActiveId()).toBe(a);
  });
});

describe("profiles: 旧keisan索引からの移行", () => {
  const legacy = {
    activeId: "pabc1234",
    profiles: [
      { id: "pabc1234", name: "はなこ", avatar: "🐰" },
      { id: "pdef5678", name: "じろう", avatar: "🐸" },
    ],
  };

  it("共通キーが不在なら移行し、idと旧キーを保存する", () => {
    installLocalStorage({ [KEISAN_KEY]: JSON.stringify(legacy) });
    expect(listProfiles().map((p) => p.id)).toEqual(["pabc1234", "pdef5678"]);
    expect(getActiveId()).toBe("pabc1234");
    expect(localStorage.getItem(INDEX_KEY)).not.toBeNull();
    expect(localStorage.getItem(KEISAN_KEY)).not.toBeNull();
  });

  it("共通キーが空一覧で存在するなら再移行しない (削除済み復活防止)", () => {
    installLocalStorage({
      [INDEX_KEY]: JSON.stringify({ activeId: null, profiles: [] }),
      [KEISAN_KEY]: JSON.stringify(legacy),
    });
    expect(listProfiles()).toEqual([]);
  });

  it("共通キーがJSON破損なら空扱い (キー存在=移行しない)", () => {
    installLocalStorage({
      [INDEX_KEY]: "{{{broken",
      [KEISAN_KEY]: JSON.stringify(legacy),
    });
    expect(listProfiles()).toEqual([]);
  });
});

describe("profiles: 正規化", () => {
  it("不正な要素の除去・欠損フィールドの補完・迷子のactiveIdをnull化", () => {
    installLocalStorage({
      [INDEX_KEY]: JSON.stringify({
        activeId: "ghost",
        profiles: [{ id: "pok11111", name: "", avatar: null }, { notId: true }, null],
      }),
    });
    const ps = listProfiles();
    expect(ps).toHaveLength(1);
    expect(ps[0]).toEqual({ id: "pok11111", name: "プレイヤー", avatar: "🦊" });
    expect(getActiveId()).toBeNull();
  });
});
