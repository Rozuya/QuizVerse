/* ==========================================================================
   QuizVerse — stockage local (100 % navigateur)
   --------------------------------------------------------------------------
   Toutes les données du joueur restent sur son appareil (localStorage).
   Rien n'est jamais envoyé sur un serveur.
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});
  const PREFIX = 'quizverse:';
  const VERSION = '1.0.0';

  let memoryFallback = null;
  let available = true;

  try {
    const k = PREFIX + '__test';
    global.localStorage.setItem(k, '1');
    global.localStorage.removeItem(k);
  } catch (e) {
    available = false;
    memoryFallback = {};
    console.warn('[QuizVerse] localStorage indisponible, bascule en mémoire volatile pour cette session.');
  }

  const store = {
    available: available,

    /** Valeur par défaut si la clé est absente. */
    get(key, fallback) {
      try {
        const raw = available ? global.localStorage.getItem(PREFIX + key) : memoryFallback[key];
        if (raw === null || raw === undefined) return fallback;
        return JSON.parse(raw);
      } catch (e) {
        console.warn('[QuizVerse] Lecture impossible pour "' + key + '"', e);
        return fallback;
      }
    },

    set(key, value) {
      const raw = JSON.stringify(value);
      try {
        if (available) global.localStorage.setItem(PREFIX + key, raw);
        else memoryFallback[key] = raw;
        return true;
      } catch (e) {
        console.warn('[QuizVerse] Écriture impossible pour "' + key + '"', e);
        return false;
      }
    },

    remove(key) {
      try {
        if (available) global.localStorage.removeItem(PREFIX + key);
        else delete memoryFallback[key];
      } catch (e) { /* ignoré */ }
    },

    /** Toutes les clés du préfixe. */
    keys() {
      const out = [];
      try {
        if (available) {
          for (let i = 0; i < global.localStorage.length; i++) {
            const k = global.localStorage.key(i);
            if (k && k.indexOf(PREFIX) === 0) out.push(k.slice(PREFIX.length));
          }
        } else {
          out.push.apply(out, Object.keys(memoryFallback));
        }
      } catch (e) { /* ignoré */ }
      return out;
    },

    clearAll() {
      this.keys().forEach((k) => this.remove(k));
    },

    /** Taille approximative utilisée, en octets. */
    usage() {
      let total = 0;
      this.keys().forEach((k) => {
        const v = available ? global.localStorage.getItem(PREFIX + k) : memoryFallback[k];
        total += (k.length + (v ? v.length : 0)) * 2; // UTF-16
      });
      return total;
    },
  };

  /* ------------------------------------------------------------------ Clés */

  const KEYS = {
    VERSION: 'version',
    PROFILE: 'profile',
    STATS: 'stats',
    HISTORY: 'history',
    MASTERY: 'mastery',
    MISTAKES: 'mistakes',
    FAVORITES: 'favorites',
    FAV_CATS: 'favoriteCategories',
    BADGES: 'badges',
    CHALLENGES: 'challenges',
    SETTINGS: 'settings',
    DAILY: 'daily',
    ONBOARDED: 'onboarded',
  };

  /* ------------------------------------------------------------ Profil -- */

  const DEFAULT_PROFILE = {
    pseudo: '',
    avatar: 'avatar-orbit',
    title: ' Debutant'.trim(),
    createdAt: 0,
    xp: 0,
    level: 1,
    levelXp: 0,
    totalTime: 0,
    playDays: [],
  };

  /* --------------------------------------------------------- Statistiques */

  const DEFAULT_STATS = {
    quizzes: 0,
    questions: 0,
    correct: 0,
    incorrect: 0,
    bestScore: 0,        // meilleur pourcentage
    bestScorePct: 0,
    bestStreak: 0,
    perfects: 0,
    timePlayed: 0,
    replays: 0,
    byCat: {},           // catId -> { quizzes, correct, questions, best }
    bySub: {},           // catId/subId -> { quizzes, correct, questions, best }
    byDiff: {},          // diff -> { quizzes, correct, questions }
    byMode: {},          // mode -> nombre de parties
    byType: {},          // type -> { count, correct }
    byDay: {},           // AAAA-MM-JJ -> { xp, correct, questions, quizzes, score }
  };

  /* ------------------------------------------------------------ Paramètres */

  const DEFAULT_SETTINGS = {
    theme: 'dark',
    music: true,
    musicVolume: 0.45,
    muted: false,
    musicTrack: null,        // index de la piste Menu
    sfx: true,
    sfxVolume: 0.7,
    animations: true,
    reduceMotion: false,
    defaultDifficulty: 'moyen',
    defaultQuestions: 10,
    showExplanationAlways: true,
    keyboardShortcuts: true,
    autoNext: false,
    autoNextDelay: 2,
    quizMusicEnabled: true,
    confirmBeforeQuit: true,
  };

  /* --------------------------------------------------------------- Lecture */

  store.ensureVersion = function () {
    const v = store.get(KEYS.VERSION, null);
    if (v !== VERSION) {
      store.set(KEYS.VERSION, VERSION);
      return true;
    }
    return false;
  };

  store.loadProfile = function () {
    const p = store.get(KEYS.PROFILE, null);
    const out = Object.assign({}, DEFAULT_PROFILE, p || {});
    if (!out.createdAt) out.createdAt = Date.now();
    return out;
  };
  store.saveProfile = function (p) { store.set(KEYS.PROFILE, p); };
  store.resetProfile = function () { store.set(KEYS.PROFILE, Object.assign({}, DEFAULT_PROFILE, { createdAt: Date.now() })); };

  store.loadStats = function () {
    return Object.assign({}, DEFAULT_STATS, store.get(KEYS.STATS, null) || {});
  };
  store.saveStats = function (s) { store.set(KEYS.STATS, s); };
  store.resetStats = function () { store.set(KEYS.STATS, QV.util.deepClone(DEFAULT_STATS)); };

  store.loadSettings = function () {
    const s = Object.assign({}, DEFAULT_SETTINGS, store.get(KEYS.SETTINGS, null) || {});
    s.defaultQuestions = QV.util.clamp(parseInt(s.defaultQuestions, 10) || 10, 5, 50);
    s.musicVolume = QV.util.clamp(Number(s.musicVolume), 0, 1);
    s.sfxVolume = QV.util.clamp(Number(s.sfxVolume), 0, 1);
    return s;
  };
  store.saveSettings = function (s) { store.set(KEYS.SETTINGS, s); };

  store.loadHistory = function () {
    const h = store.get(KEYS.HISTORY, null);
    return Array.isArray(h) ? h : [];
  };
  store.saveHistory = function (h) { store.set(KEYS.HISTORY, h.slice(0, 400)); };

  store.loadBadges = function () {
    const b = store.get(KEYS.BADGES, null);
    return (b && typeof b === 'object') ? b : {};
  };
  store.saveBadges = function (b) { store.set(KEYS.BADGES, b); };

  store.loadChallenges = function () {
    const c = store.get(KEYS.CHALLENGES, null);
    return (c && typeof c === 'object') ? c : {};
  };
  store.saveChallenges = function (c) { store.set(KEYS.CHALLENGES, c); };

  store.loadDaily = function () {
    const d = store.get(KEYS.DAILY, null);
    return (d && typeof d === 'object') ? d : {};
  };
  store.saveDaily = function (d) { store.set(KEYS.DAILY, d); };

  store.loadMastery = function () {
    const m = store.get(KEYS.MASTERY, null);
    return (m && typeof m === 'object') ? m : {};
  };
  store.saveMastery = function (m) { store.set(KEYS.MASTERY, m); };

  store.loadMistakes = function () {
    const m = store.get(KEYS.MISTAKES, null);
    return (m && typeof m === 'object') ? m : {};
  };
  store.saveMistakes = function (m) { store.set(KEYS.MISTAKES, m); };

  store.loadFavorites = function () {
    const f = store.get(KEYS.FAVORITES, null);
    return Array.isArray(f) ? f : [];
  };
  store.saveFavorites = function (f) { store.set(KEYS.FAVORITES, f); };

  store.loadFavoriteCategories = function () {
    const f = store.get(KEYS.FAV_CATS, null);
    return Array.isArray(f) ? f : [];
  };
  store.saveFavoriteCategories = function (f) { store.set(KEYS.FAV_CATS, f); };

  /* ------------------------------------------------------ Export / Import -- */

  store.exportAll = function () {
    const out = { __quizverse: VERSION, exportedAt: new Date().toISOString(), data: {} };
    store.keys().forEach((k) => { out.data[k] = store.get(k, null); });
    return out;
  };

  store.importAll = function (payload) {
    if (!payload || payload.__quizverse === undefined || typeof payload.data !== 'object') {
      throw new Error('Fichier de sauvegarde invalide : ce n’est pas une sauvegarde QuizVerse.');
    }
    store.clearAll();
    Object.keys(payload.data).forEach((k) => store.set(k, payload.data[k]));
    store.ensureVersion();
    return Object.keys(payload.data).length;
  };

  store.resetEverything = function () {
    store.clearAll();
    store.ensureVersion();
  };

  QV.store = store;
  QV.store.KEYS = KEYS;
  QV.store.DEFAULTS = {
    profile: DEFAULT_PROFILE,
    stats: DEFAULT_STATS,
    settings: DEFAULT_SETTINGS,
  };
})(window);
