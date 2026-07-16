/*
 * kids-stady 共通効果音エンジン (Web Audio の素振り部分だけを共通化)
 * 個々の効果音 (シュート音・正解音など) はゲームごとに tone() を組み合わせて作る。
 * classic <script> として読み込む前提 (file:// でもモジュール解決エラーが出ないように)。
 */
(function (global) {
  "use strict";

  function createKidsAudio() {
    let actx = null;

    function init() {
      if (!actx) {
        try {
          actx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
          /* Web Audio 非対応環境では無音のまま続行する */
        }
      }
      if (actx && actx.state === "suspended") actx.resume();
    }

    function tone(freq, dur, type, vol, when) {
      if (!actx) return;
      const t = actx.currentTime + (when || 0);
      const o = actx.createOscillator();
      const g = actx.createGain();
      o.type = type || "square";
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(vol || 0.15, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g);
      g.connect(actx.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    }

    return { init: init, tone: tone };
  }

  global.KidsAudio = createKidsAudio;
})(window);
