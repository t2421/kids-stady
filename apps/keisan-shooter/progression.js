/*
 * モンスターけいさんシューター: ゲームをまたいで貯まる成長要素 (プレイヤーレベル・ジェム・
 * モンスター図鑑) とアイテムの定義。localStorage に保存するので、遊ぶたびに強くなっていく。
 */
(function (global) {
  "use strict";

  const STORAGE_KEY = "kidsStudy.keisanShooter.profile.v1";

  const LEVELS = [
    { need: 0,    title: "けいさんみならい" },
    { need: 60,   title: "けいさんにんじゃ" },
    { need: 150,  title: "けいさんはかせ" },
    { need: 300,  title: "けいさんマスター" },
    { need: 550,  title: "けいさんチャンピオン" },
    { need: 900,  title: "けいさんレジェンド" },
    { need: 1400, title: "けいさんの神" },
  ];

  const ITEM_DEFS = {
    blast:  { icon: "💥", name: "ばくはつショット", desc: "いまの もんだいを いっしゅんでクリア!" },
    shield: { icon: "🛡️", name: "まもりのたて",     desc: "つぎに ハートが へるのを 1かい まもる" },
    slow:   { icon: "🐌", name: "スローモード",     desc: "10びょう モンスターがゆっくりに なる" },
  };
  const ITEM_KEYS = Object.keys(ITEM_DEFS);
  const MAX_INVENTORY = 3;
  const CONTINUE_COST = 30;
  const ITEM_TRADE_GEMS = 15;
  const GOLDEN_CHANCE = 0.12;
  const GOLDEN_MULTIPLIER = 3;

  const SPECIES_INFO = {
    slime:    { icon: "🟢", name: "スライム" },
    dragon:   { icon: "🐉", name: "ドラゴン" },
    bat:      { icon: "🦇", name: "こうもり" },
    skeleton: { icon: "💀", name: "がいこつ" },
  };

  function defaultProfile() {
    return {
      gems: 0,
      bestScore: 0,
      bestCombo: 0,
      defeated: {},
      goldDefeated: 0,
    };
  }

  function loadProfile() {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      saved = null;
    }
    const base = defaultProfile();
    if (!saved || typeof saved !== "object") return base;
    return {
      gems: Number(saved.gems) || 0,
      bestScore: Number(saved.bestScore) || 0,
      bestCombo: Number(saved.bestCombo) || 0,
      defeated: Object.assign({}, base.defeated, saved.defeated),
      goldDefeated: Number(saved.goldDefeated) || 0,
    };
  }

  function saveProfile(profile) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      /* ストレージが使えない環境ではメモリ上の値だけで続行する */
    }
  }

  function levelInfo(gems) {
    let idx = 0;
    for (let i = 0; i < LEVELS.length; i++) {
      if (gems >= LEVELS[i].need) idx = i;
    }
    const current = LEVELS[idx];
    const next = LEVELS[idx + 1] || null;
    const progress = next ? (gems - current.need) / (next.need - current.need) : 1;
    return {
      level: idx + 1,
      title: current.title,
      gems: gems,
      nextNeed: next ? next.need : null,
      progress: Math.max(0, Math.min(1, progress)),
    };
  }

  function randomItemKey() {
    return ITEM_KEYS[Math.floor(Math.random() * ITEM_KEYS.length)];
  }

  global.Progression = {
    LEVELS: LEVELS,
    ITEM_DEFS: ITEM_DEFS,
    SPECIES_INFO: SPECIES_INFO,
    MAX_INVENTORY: MAX_INVENTORY,
    CONTINUE_COST: CONTINUE_COST,
    ITEM_TRADE_GEMS: ITEM_TRADE_GEMS,
    GOLDEN_CHANCE: GOLDEN_CHANCE,
    GOLDEN_MULTIPLIER: GOLDEN_MULTIPLIER,
    loadProfile: loadProfile,
    saveProfile: saveProfile,
    levelInfo: levelInfo,
    randomItemKey: randomItemKey,
  };
})(window);
