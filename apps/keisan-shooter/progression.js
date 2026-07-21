/*
 * モンスターけいさんシューター: ゲームをまたいで貯まる成長要素 (プレイヤーレベル・ジェム・
 * モンスター図鑑) とアイテムの定義。localStorage に保存するので、遊ぶたびに強くなっていく。
 */
(function (global) {
  "use strict";

  /* プロフィール (名前+アバター) の管理は shared/js/profiles.js (KidsProfiles) に共通化した。
     このファイルにはけいさんシューター固有のゲーム進行データだけが残る。 */
  const LEGACY_STORAGE_KEY = "kidsStudy.keisanShooter.profile.v1";
  const AVATARS = KidsProfiles.AVATARS;

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

  const STORY_INTRO = "すうじおうこくに あらわれた モンスターたちが、だいじな こたえの すうじを ぜんぶ もっていってしまった!ぼうけんしゃの きみが、けいさんの ちからで もりから おしろまで すすんで、すうじを とりもどそう!";

  const STAGES = [
    { id: 1, name: "しずかなもり",     icon: "🌲", opMode: "add", carry: false, speedBase: 0.65, monsterCount: 3, clearTarget: 6,  boss: false,
      intro: "もりの いりぐちに、ちいさな モンスターたちが すうじを かくして いるみたい。かんたんな けいさんで やっつけよう!",
      clear: "もりの モンスターを やっつけた!つぎは あついさばくが まっているよ。" },
    { id: 2, name: "すなのさばく",     icon: "🏜️", opMode: "add", carry: true,  speedBase: 0.85, monsterCount: 3, clearTarget: 7,  boss: false,
      intro: "あつい すなの さばくには、たしざんが とくいな モンスターが たくさん!くりあがりに ちゅうい!",
      clear: "さばくを こえた!つぎは つめたい こおりの やまだ。" },
    { id: 3, name: "こおりのやま",     icon: "🏔️", opMode: "sub", carry: true,  speedBase: 0.95, monsterCount: 3, clearTarget: 7,  boss: false,
      intro: "こおりの やまでは、ひきざんモンスターが まちぶせしている!くりさがりを おもいだそう。",
      clear: "やまを のりこえた!つぎは くらい どうくつが まっている。" },
    { id: 4, name: "ようがんどうくつ", icon: "🌋", opMode: "mix", carry: true,  speedBase: 1.1,  monsterCount: 4, clearTarget: 8,  boss: false,
      intro: "まっくらな どうくつには、たしざんも ひきざんも まざった モンスターが すんでいる!",
      clear: "どうくつを ぬけだした!つぎは あらしの かいがんだ。" },
    { id: 5, name: "あらしのかいがん", icon: "🌊", opMode: "mix", carry: true,  speedBase: 1.3,  monsterCount: 4, clearTarget: 9,  boss: false,
      intro: "あらしの かいがんで、モンスターたちの スピードが ぐんと あがってきた!しゅうちゅう!",
      clear: "かいがんを つきやぶった!いよいよ さいごは モンスターじょうだ。" },
    { id: 6, name: "モンスターじょう", icon: "🏰", opMode: "mix", carry: true,  speedBase: 1.5,  monsterCount: 4, clearTarget: 10, boss: true,
      intro: "ここが さいごの おしろ。ボスモンスターが すうじの おうかんを もっている!たおして とりかえそう!",
      clear: "やった!ボスを たおして、すうじの おうかんを とりもどした!きみは りっぱな けいさんゆうしゃだ!" },
  ];

  const HISTORY_LIMIT = 30;

  function defaultProfile() {
    return {
      gems: 0,
      bestScore: 0,
      bestCombo: 0,
      defeated: {},
      goldDefeated: 0,
      clearedStages: [],
      unlockedStage: 1,
      totalCorrect: 0,
      totalWrong: 0,
      history: [],
    };
  }

  const readJSON = KidsProfiles.readJSON;
  const writeJSON = KidsProfiles.writeJSON;

  function normalizeProfileData(saved) {
    const base = defaultProfile();
    if (!saved || typeof saved !== "object") return base;
    return {
      gems: Number(saved.gems) || 0,
      bestScore: Number(saved.bestScore) || 0,
      bestCombo: Number(saved.bestCombo) || 0,
      defeated: Object.assign({}, base.defeated, saved.defeated),
      goldDefeated: Number(saved.goldDefeated) || 0,
      clearedStages: Array.isArray(saved.clearedStages) ? saved.clearedStages.slice() : [],
      unlockedStage: Number(saved.unlockedStage) || 1,
      totalCorrect: Number(saved.totalCorrect) || 0,
      totalWrong: Number(saved.totalWrong) || 0,
      history: Array.isArray(saved.history) ? saved.history.slice(-HISTORY_LIMIT) : [],
    };
  }

  function addHistoryEntry(profile, entry){
    profile.history.push(entry);
    if (profile.history.length > HISTORY_LIMIT) {
      profile.history.splice(0, profile.history.length - HISTORY_LIMIT);
    }
  }

  function profileDataKey(id) {
    return "kidsStudy.keisanShooter.profileData." + id;
  }

  /* 一度だけ: プレイヤー切り替え機能が無かった頃の単一セーブを、
     「プレイヤー1」として共通プロフィールに引き継ぐ */
  function migrateLegacySingleSave() {
    if (KidsProfiles.listProfiles().length > 0) return;
    const legacy = readJSON(LEGACY_STORAGE_KEY);
    if (!legacy) return;
    const id = KidsProfiles.createProfile("プレイヤー1", AVATARS[0]);
    writeJSON(profileDataKey(id), normalizeProfileData(legacy));
  }
  migrateLegacySingleSave();

  function listProfiles() {
    return KidsProfiles.listProfiles();
  }

  function getActiveId() {
    return KidsProfiles.getActiveId();
  }

  function setActiveId(id) {
    KidsProfiles.setActiveId(id);
  }

  function createProfile(name, avatar) {
    const id = KidsProfiles.createProfile(name, avatar);
    writeJSON(profileDataKey(id), defaultProfile());
    return id;
  }

  function deleteProfile(id) {
    KidsProfiles.deleteProfile(id);
    try {
      localStorage.removeItem(profileDataKey(id));
    } catch (e) {
      /* noop */
    }
  }

  function loadProfileData(id) {
    return normalizeProfileData(readJSON(profileDataKey(id)));
  }

  function saveProfileData(id, data) {
    writeJSON(profileDataKey(id), data);
  }

  function getStage(stageId) {
    return STAGES.find(function (s) { return s.id === stageId; }) || null;
  }

  function isStageUnlocked(profile, stageId) {
    return stageId <= (profile.unlockedStage || 1);
  }

  function markStageCleared(profile, stageId) {
    if (profile.clearedStages.indexOf(stageId) < 0) profile.clearedStages.push(stageId);
    profile.unlockedStage = Math.max(profile.unlockedStage || 1, stageId + 1);
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
    STAGES: STAGES,
    STORY_INTRO: STORY_INTRO,
    AVATARS: AVATARS,
    MAX_INVENTORY: MAX_INVENTORY,
    CONTINUE_COST: CONTINUE_COST,
    ITEM_TRADE_GEMS: ITEM_TRADE_GEMS,
    GOLDEN_CHANCE: GOLDEN_CHANCE,
    GOLDEN_MULTIPLIER: GOLDEN_MULTIPLIER,
    listProfiles: listProfiles,
    getActiveId: getActiveId,
    setActiveId: setActiveId,
    createProfile: createProfile,
    deleteProfile: deleteProfile,
    loadProfileData: loadProfileData,
    saveProfileData: saveProfileData,
    levelInfo: levelInfo,
    randomItemKey: randomItemKey,
    getStage: getStage,
    isStageUnlocked: isStageUnlocked,
    markStageCleared: markStageCleared,
    addHistoryEntry: addHistoryEntry,
  };
})(window);
