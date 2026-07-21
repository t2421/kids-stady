/*
 * きっずスタディ共通のプレイヤープロフィール (名前+アバター) 管理。
 * 兄弟それぞれが同じ端末で遊べるよう、複数プロフィールを localStorage に保存し、
 * 全アプリで同じ一覧を共有する。各アプリのゲーム進行データは
 * 「kidsStudy.<アプリ名>.profileData.<プロフィールid>」に各アプリが独自に保存する。
 *
 * ストレージ契約の正典は docs/save-data.md。TypeScript 実装
 * (apps/mathematics/src/lib/profiles.ts) と挙動を一致させること。
 */
(function (global) {
  "use strict";

  var INDEX_KEY = "kidsStudy.profiles.v1";
  /* プロフィール共有化以前に けいさんシューター が使っていた索引キー。
     共通キーがまだ存在しない端末では、ここから一度だけ引き継ぐ。 */
  var KEISAN_INDEX_KEY = "kidsStudy.keisanShooter.profiles.v1";

  var AVATARS = ["🦊", "🐱", "🐶", "🐰", "🐻", "🐼", "🦁", "🐸", "🐵", "🐧"];

  function readJSON(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (e) {
      return null;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* ストレージが使えない環境ではメモリ上の値だけで続行する */
    }
  }

  function makeId() {
    return "p" + Math.random().toString(36).slice(2, 9);
  }

  function normalizeIndex(raw) {
    if (!raw || !Array.isArray(raw.profiles)) return { activeId: null, profiles: [] };
    var profiles = raw.profiles.filter(function (p) {
      return p && typeof p.id === "string" && p.id;
    }).map(function (p) {
      return {
        id: p.id,
        name: typeof p.name === "string" && p.name ? p.name : "プレイヤー",
        avatar: typeof p.avatar === "string" && p.avatar ? p.avatar : AVATARS[0],
      };
    });
    var activeId = typeof raw.activeId === "string" ? raw.activeId : null;
    if (activeId && !profiles.some(function (p) { return p.id === activeId; })) {
      activeId = null;
    }
    return { activeId: activeId, profiles: profiles };
  }

  function loadIndex() {
    var stored = null;
    try {
      stored = localStorage.getItem(INDEX_KEY);
    } catch (e) {
      /* noop */
    }

    /* 引き継ぎは「共通キーが一度も作られていない」ときだけ行う。
       空の一覧 (全プロフィール削除済み) を旧データで復活させてはいけない。 */
    if (stored === null) {
      var legacy = normalizeIndex(readJSON(KEISAN_INDEX_KEY));
      if (legacy.profiles.length > 0) {
        writeJSON(INDEX_KEY, legacy);
        return legacy;
      }
      return { activeId: null, profiles: [] };
    }

    var parsed = null;
    try {
      parsed = JSON.parse(stored);
    } catch (e) {
      parsed = null;
    }
    return normalizeIndex(parsed);
  }

  function saveIndex(idx) {
    writeJSON(INDEX_KEY, idx);
  }

  function listProfiles() {
    return loadIndex().profiles.slice();
  }

  function getActiveId() {
    return loadIndex().activeId;
  }

  function setActiveId(id) {
    var idx = loadIndex();
    idx.activeId = id;
    saveIndex(idx);
  }

  function createProfile(name, avatar) {
    var idx = loadIndex();
    var id = makeId();
    idx.profiles.push({
      id: id,
      name: name || "プレイヤー",
      avatar: avatar || AVATARS[0],
    });
    idx.activeId = id;
    saveIndex(idx);
    return id;
  }

  /* プロフィール本体 (名前+アバター) だけを消す。
     各アプリのゲーム進行データ (kidsStudy.<app>.profileData.<id>) の掃除は
     削除を実行したアプリの責務 (他アプリのデータは残るが、小さなJSONなので許容)。 */
  function deleteProfile(id) {
    var idx = loadIndex();
    idx.profiles = idx.profiles.filter(function (p) { return p.id !== id; });
    if (idx.activeId === id) idx.activeId = null;
    saveIndex(idx);
  }

  global.KidsProfiles = {
    AVATARS: AVATARS,
    readJSON: readJSON,
    writeJSON: writeJSON,
    listProfiles: listProfiles,
    getActiveId: getActiveId,
    setActiveId: setActiveId,
    createProfile: createProfile,
    deleteProfile: deleteProfile,
  };
})(typeof window !== "undefined" ? window : globalThis);
