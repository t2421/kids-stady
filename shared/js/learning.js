/* 自動生成: shared/learning-core から npm run gen:learning で生成。直接編集しない */
(() => {
  // ../../shared/learning-core/learning.ts
  function readJSON(key2) {
    try {
      if (typeof localStorage === "undefined") return null;
      const raw = localStorage.getItem(key2);
      return raw == null ? null : JSON.parse(raw);
    } catch {
      return null;
    }
  }
  function writeJSON(key2, value) {
    try {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem(key2, JSON.stringify(value));
    } catch {
    }
  }
  function removeKey(key2) {
    try {
      if (typeof localStorage === "undefined") return;
      localStorage.removeItem(key2);
    } catch {
    }
  }
  var LEARNING_MS_LIMIT = 20;
  var LEARNING_DAILY_LIMIT = 60;
  function key(profileId) {
    return "kidsStudy.learning.v1." + profileId;
  }
  function emptyLog() {
    return { version: 1, skills: {}, daily: {} };
  }
  function toCount(v) {
    const n = typeof v === "number" && Number.isFinite(v) ? Math.floor(v) : 0;
    return n > 0 ? n : 0;
  }
  function normalizeLog(raw) {
    const base = emptyLog();
    if (typeof raw !== "object" || raw === null) return base;
    const obj = raw;
    const skills = {};
    if (typeof obj.skills === "object" && obj.skills !== null) {
      for (const [id, v] of Object.entries(obj.skills)) {
        if (typeof v !== "object" || v === null) continue;
        const s = v;
        skills[id] = {
          app: typeof s.app === "string" ? s.app : "unknown",
          c: toCount(s.c),
          w: toCount(s.w),
          ms: Array.isArray(s.ms) ? s.ms.filter((n) => typeof n === "number" && n >= 0).slice(-LEARNING_MS_LIMIT) : [],
          lastTs: toCount(s.lastTs)
        };
      }
    }
    const daily = {};
    if (typeof obj.daily === "object" && obj.daily !== null) {
      for (const [date, v] of Object.entries(obj.daily)) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
        if (typeof v !== "object" || v === null) continue;
        const d = v;
        daily[date] = { c: toCount(d.c), w: toCount(d.w) };
      }
    }
    return { version: 1, skills, daily };
  }
  function loadLearning(profileId) {
    return normalizeLog(readJSON(key(profileId)));
  }
  function removeLearning(profileId) {
    removeKey(key(profileId));
  }
  function dateKey(ts) {
    const d = new Date(ts);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  }
  function trimDaily(daily) {
    const dates = Object.keys(daily).sort();
    if (dates.length <= LEARNING_DAILY_LIMIT) return daily;
    const keep = new Set(dates.slice(-LEARNING_DAILY_LIMIT));
    const out = {};
    for (const d of dates) if (keep.has(d)) out[d] = daily[d];
    return out;
  }
  function recordLearning(profileId, app, skillId, correct, elapsedMs, now = Date.now()) {
    const log = loadLearning(profileId);
    const prev = log.skills[skillId] ?? { app, c: 0, w: 0, ms: [], lastTs: 0 };
    const ms = elapsedMs > 0 ? [...prev.ms, Math.round(elapsedMs)].slice(-LEARNING_MS_LIMIT) : prev.ms;
    const skills = {
      ...log.skills,
      [skillId]: {
        app,
        c: prev.c + (correct ? 1 : 0),
        w: prev.w + (correct ? 0 : 1),
        ms,
        lastTs: now
      }
    };
    const dk = dateKey(now);
    const day = log.daily[dk] ?? { c: 0, w: 0 };
    const daily = trimDaily({
      ...log.daily,
      [dk]: { c: day.c + (correct ? 1 : 0), w: day.w + (correct ? 0 : 1) }
    });
    const next = { version: 1, skills, daily };
    writeJSON(key(profileId), next);
    return next;
  }
  function skillReports(log) {
    return Object.entries(log.skills).map(([skillId, s]) => {
      const attempts = s.c + s.w;
      const timed = s.ms.filter((n) => n > 0);
      const avgMs = timed.length ? Math.round(timed.reduce((a, b) => a + b, 0) / timed.length) : 0;
      let trendMs = 0;
      if (timed.length >= 6) {
        const half = Math.floor(timed.length / 2);
        const first = timed.slice(0, half);
        const second = timed.slice(half);
        const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
        trendMs = Math.round(avg(second) - avg(first));
      }
      return {
        skillId,
        app: s.app,
        attempts,
        accuracy: attempts ? Math.round(s.c / attempts * 100) : 0,
        avgMs,
        trendMs
      };
    });
  }
  function weakSkills(log, minAttempts = 5, limit = 3) {
    return skillReports(log).filter((r) => r.attempts >= minAttempts).sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts).slice(0, limit);
  }
  function recentDaily(log, days, now = Date.now()) {
    const out = [];
    for (let i = days - 1; i >= 0; i--) {
      const dk = dateKey(now - i * 864e5);
      const d = log.daily[dk] ?? { c: 0, w: 0 };
      out.push({ date: dk, c: d.c, w: d.w });
    }
    return out;
  }

  // ../../shared/learning-core/vanilla-learning-entry.ts
  globalThis.KidsLearning = {
    /* 既存API (keisan-shooter 互換) */
    load: (profileId) => loadLearning(profileId),
    record: (profileId, app, skillId, correct, elapsedMs) => recordLearning(profileId, app, skillId, correct, elapsedMs),
    remove: (profileId) => removeLearning(profileId),
    /* 分析ヘルパ (静的アプリでも成績表示を作れるように公開) */
    skillReports,
    weakSkills,
    recentDaily
  };
})();
