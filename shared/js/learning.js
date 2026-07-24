/*
 * ゲーム横断の共有学習ログ (vanilla版)。
 * キー: kidsStudy.learning.v1.<プロフィールid>。契約の正典は docs/save-data.md。
 * TypeScript 実装 (apps/mathematics/src/lib/learning.ts) と挙動を一致させること。
 *
 * 使い方 (静的アプリから):
 *   KidsLearning.record(profileId, "keisan-shooter", "ks_add_carry", true, 0);
 *   (解答時間が計測できない場合は elapsedMs に 0 を渡す)
 */
(function (global) {
  "use strict";

  var MS_LIMIT = 20;
  var DAILY_LIMIT = 60;

  function key(profileId) {
    return "kidsStudy.learning.v1." + profileId;
  }

  function readJSON(k) {
    try {
      return JSON.parse(localStorage.getItem(k));
    } catch (e) {
      return null;
    }
  }

  function writeJSON(k, value) {
    try {
      localStorage.setItem(k, JSON.stringify(value));
    } catch (e) {
      /* ストレージが使えない環境ではあきらめる */
    }
  }

  function toCount(v) {
    var n = typeof v === "number" && isFinite(v) ? Math.floor(v) : 0;
    return n > 0 ? n : 0;
  }

  function normalize(raw) {
    var base = { version: 1, skills: {}, daily: {} };
    if (!raw || typeof raw !== "object") return base;
    if (raw.skills && typeof raw.skills === "object") {
      Object.keys(raw.skills).forEach(function (id) {
        var s = raw.skills[id];
        if (!s || typeof s !== "object") return;
        base.skills[id] = {
          app: typeof s.app === "string" ? s.app : "unknown",
          c: toCount(s.c),
          w: toCount(s.w),
          ms: Array.isArray(s.ms)
            ? s.ms.filter(function (n) { return typeof n === "number" && n >= 0; }).slice(-MS_LIMIT)
            : [],
          lastTs: toCount(s.lastTs),
        };
      });
    }
    if (raw.daily && typeof raw.daily === "object") {
      Object.keys(raw.daily).forEach(function (date) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
        var d = raw.daily[date];
        if (!d || typeof d !== "object") return;
        base.daily[date] = { c: toCount(d.c), w: toCount(d.w) };
      });
    }
    return base;
  }

  function dateKey(ts) {
    var d = new Date(ts);
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    if (m.length < 2) m = "0" + m;
    if (day.length < 2) day = "0" + day;
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function trimDaily(daily) {
    var dates = Object.keys(daily).sort();
    if (dates.length <= DAILY_LIMIT) return daily;
    var out = {};
    dates.slice(-DAILY_LIMIT).forEach(function (d) { out[d] = daily[d]; });
    return out;
  }

  function load(profileId) {
    return normalize(readJSON(key(profileId)));
  }

  function record(profileId, app, skillId, correct, elapsedMs) {
    if (!profileId) return null;
    var log = load(profileId);
    var now = Date.now();
    var prev = log.skills[skillId] || { app: app, c: 0, w: 0, ms: [], lastTs: 0 };
    var ms = prev.ms;
    if (elapsedMs > 0) ms = prev.ms.concat([Math.round(elapsedMs)]).slice(-MS_LIMIT);
    log.skills[skillId] = {
      app: app,
      c: prev.c + (correct ? 1 : 0),
      w: prev.w + (correct ? 0 : 1),
      ms: ms,
      lastTs: now,
    };
    var dk = dateKey(now);
    var day = log.daily[dk] || { c: 0, w: 0 };
    log.daily[dk] = { c: day.c + (correct ? 1 : 0), w: day.w + (correct ? 0 : 1) };
    log.daily = trimDaily(log.daily);
    writeJSON(key(profileId), log);
    return log;
  }

  global.KidsLearning = {
    load: load,
    record: record,
  };
})(typeof window !== "undefined" ? window : globalThis);
