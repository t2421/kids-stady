/* 自動生成: shared/learning-core から npm run gen:profiles で生成。直接編集しない */
(() => {
  // ../../shared/learning-core/profiles.ts
  var INDEX_KEY = "kidsStudy.profiles.v1";
  var KEISAN_INDEX_KEY = "kidsStudy.keisanShooter.profiles.v1";
  var AVATARS = [
    "\u{1F98A}",
    "\u{1F431}",
    "\u{1F436}",
    "\u{1F430}",
    "\u{1F43B}",
    "\u{1F43C}",
    "\u{1F981}",
    "\u{1F438}",
    "\u{1F435}",
    "\u{1F427}"
  ];
  function storage() {
    try {
      if (typeof localStorage === "undefined") return null;
      return localStorage;
    } catch {
      return null;
    }
  }
  function readJSON(key) {
    try {
      const raw = storage()?.getItem(key);
      return raw == null ? null : JSON.parse(raw);
    } catch {
      return null;
    }
  }
  function writeJSON(key, value) {
    try {
      storage()?.setItem(key, JSON.stringify(value));
    } catch {
    }
  }
  function makeId() {
    return "p" + Math.random().toString(36).slice(2, 9);
  }
  function normalizeIndex(raw) {
    if (typeof raw !== "object" || raw === null) {
      return { activeId: null, profiles: [] };
    }
    const source = raw;
    if (!Array.isArray(source.profiles)) return { activeId: null, profiles: [] };
    const profiles = source.profiles.filter(
      (p) => typeof p === "object" && p !== null && typeof p.id === "string" && p.id !== ""
    ).map((p) => ({
      id: p.id,
      name: typeof p.name === "string" && p.name ? p.name : "\u30D7\u30EC\u30A4\u30E4\u30FC",
      avatar: typeof p.avatar === "string" && p.avatar ? p.avatar : AVATARS[0]
    }));
    let activeId = typeof source.activeId === "string" ? source.activeId : null;
    if (activeId && !profiles.some((p) => p.id === activeId)) activeId = null;
    return { activeId, profiles };
  }
  function loadIndex() {
    let stored = null;
    try {
      stored = storage()?.getItem(INDEX_KEY) ?? null;
    } catch {
      stored = null;
    }
    if (stored === null) {
      const legacy = normalizeIndex(readJSON(KEISAN_INDEX_KEY));
      if (legacy.profiles.length > 0) {
        writeJSON(INDEX_KEY, legacy);
        return legacy;
      }
      return { activeId: null, profiles: [] };
    }
    let parsed = null;
    try {
      parsed = JSON.parse(stored);
    } catch {
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
    const idx = loadIndex();
    saveIndex({ ...idx, activeId: id });
  }
  function createProfile(name, avatar) {
    const idx = loadIndex();
    const id = makeId();
    saveIndex({
      activeId: id,
      profiles: [
        ...idx.profiles,
        { id, name: name || "\u30D7\u30EC\u30A4\u30E4\u30FC", avatar: avatar || AVATARS[0] }
      ]
    });
    return id;
  }
  function deleteProfile(id, removeAppData) {
    const idx = loadIndex();
    saveIndex({
      activeId: idx.activeId === id ? null : idx.activeId,
      profiles: idx.profiles.filter((p) => p.id !== id)
    });
    removeAppData?.(id);
  }

  // ../../shared/learning-core/vanilla-profiles-entry.ts
  globalThis.KidsProfiles = {
    AVATARS,
    readJSON,
    writeJSON,
    listProfiles,
    getActiveId,
    setActiveId,
    createProfile,
    deleteProfile
  };
})();
