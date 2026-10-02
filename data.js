/* ==========================================================================
   QuizVerse — chargement des données et index
   --------------------------------------------------------------------------
   Les données sont des fichiers locaux chargés avec des chemins RELATIFS,
   ce qui fonctionne à la fois sur GitHub Pages (https://user.github.io/QuizVerse/)
   et sur un serveur local (node tools/serve.mjs).

   data/questions.json décrit où se trouvent les questions :
     • format "modules" : une liste de fichiers .mjs exportant un tableau ;
     • format "inline"  : { "questions": [ ... ] } dans le fichier lui-même.

   Chaque question est normalisée au chargement : identifiant unique, type,
   propositions dédoublonnées, index de réponse vérifiés, sources ajoutées.
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});
  const U = QV.util;

  const DIFFS = ['facile', 'moyen', 'difficile', 'expert'];
  const TYPE_LABELS = { qcm: 'QCM', vf: 'Vrai / Faux', multi: 'Plusieurs réponses', guess: 'Devine / Image', image: 'Image' };
  const DIFF_LABEL = { facile: 'Facile', moyen: 'Moyen', difficile: 'Difficile', expert: 'Expert' };
  const DIFF_EMOJI = { facile: '🟢', moyen: '🟡', difficile: '🟠', expert: '🔴' };

  const state = {
    questions: [], categories: [], achievements: [], challenges: [],
    titles: [], avatars: [], quizzes: [],
    validSubs: {},
    byId: new Map(), byCat: new Map(), bySub: new Map(), byCatSub: new Map(), byDiff: new Map(),
    catsById: new Map(), subsById: new Map(), subsByCat: new Map(),
    quizById: new Map(), quizzesByCat: new Map(),
    searchIndex: [], loaded: false,
    stats: { total: 0, duplicates: 0, fixed: 0, rejected: 0, withSources: 0, files: 0 },
  };

  const BASE = './data/';

  function fetchJson(name) {
    return fetch(BASE + name, { cache: 'no-cache' }).then(function (res) {
      if (!res.ok) throw new Error('Fichier introuvable : data/' + name + ' (' + res.status + ')');
      return res.json();
    });
  }

  /* ==================================================== NORMALISATION === */

  function normKey(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function slugify(s) {
    return normKey(s).replace(/\s+/g, '-').slice(0, 70);
  }

  /** Émoji d'illustration par univers, pour les questions « devine ». */
  const CAT_EMOJI = {
    animes: '🥋', films: '🎬', sports: '🏅', gaming: '🎮', culture: '🌍',
    dessins: '🧸', maths: '🧮', jeux: '🎲', cuisine: '🍕', francais: '✍️',
  };

  /** Normalise une question brute. Retourne null si elle est inutilisable. */
  function normalize(raw, catsById, stats, idSet) {
    const opts = raw.opts || {};
    const out = {};

    out.cat = String(raw.cat || '').trim();
    out.sub = String(raw.sub || '').trim();
    const cat = catsById.get(out.cat);
    if (!cat || !(cat.subs || []).some(function (s) { return s.id === out.sub; })) {
      stats.rejected += 1;
      if (stats.rejected <= 8) console.warn('[QuizVerse] Question ignorée : catégorie inconnue', out.cat + '/' + out.sub);
      return null;
    }
    const subLabel = (cat.subs.filter(function (s) { return s.id === out.sub; })[0] || {}).label || out.sub;

    out.diff = String(raw.diff || '').trim().toLowerCase();
    if (DIFFS.indexOf(out.diff) < 0) { out.diff = 'moyen'; stats.fixed += 1; }

    out.text = String(raw.text || '').trim().replace(/\s+/g, ' ');
    if (!out.text) { stats.rejected += 1; return null; }
    if (!/[?？.]$/.test(out.text)) out.text += ' ?';

    let type = TYPE_LABELS[opts.type] ? opts.type : 'qcm';

    // --- réponses ---
    let answers = (Array.isArray(raw.answers) ? raw.answers : []).map(function (a) { return String(a).trim(); });
    let correct = Array.isArray(raw.correct) ? raw.correct.slice() : [raw.correct];

    answers = answers.filter(function (a) { return a.length > 0; });
    const hasBad = correct.some(function (i) { return typeof i !== 'number' || !Number.isInteger(i) || i < 0 || i >= answers.length; });
    if (hasBad) { correct = [0]; stats.fixed += 1; }

    if (type === 'vf' && answers.length !== 2) {
      const wasTrue = correct[0] === 0;
      answers = ['Vrai', 'Faux'];
      correct = [wasTrue ? 0 : 1];
      stats.fixed += 1;
    }
    if (type === 'multi') {
      correct = correct.filter(function (i, k) { return correct.indexOf(i) === k; }).sort(function (a, b) { return a - b; });
      if (correct.length < 2) type = 'qcm';
      if (correct.length >= answers.length) type = 'qcm';
    } else {
      correct = [correct[0] === undefined ? 0 : correct[0]];
    }

    // --- propositions dupliquées ---
    const seen = {};
    const newAnswers = [];
    const remap = [];
    answers.forEach(function (a) {
      const k = normKey(a);
      if (seen[k] !== undefined) { remap.push(-1); stats.fixed += 1; return; }
      seen[k] = newAnswers.length;
      remap.push(newAnswers.length);
      newAnswers.push(a);
    });
    let newCorrect = correct.map(function (i) { return remap[i]; })
      .filter(function (i) { return i >= 0; })
      .filter(function (i, k, arr) { return arr.indexOf(i) === k; })
      .sort(function (a, b) { return a - b; });
    if (!newCorrect.length) { newCorrect = [0]; stats.fixed += 1; }
    answers = newAnswers;

    if (answers.length < 2) {
      answers = ['Vrai', 'Faux'];
      newCorrect = [0];
      type = 'vf';
      stats.fixed += 1;
    }
    if (type === 'vf') {
      const t = answers.map(normKey);
      if (t.indexOf('vrai') < 0 || t.indexOf('faux') < 0) {
        const wasTrue = t.indexOf('oui') >= 0 || t.indexOf('yes') >= 0;
        answers = ['Vrai', 'Faux'];
        newCorrect = [wasTrue ? 0 : 1];
        stats.fixed += 1;
      }
    }
    if (type === 'multi' && newCorrect.length < 2) type = 'qcm';

    out.type = type;
    out.answers = answers;
    out.correct = type === 'multi' ? newCorrect : newCorrect[0];

    out.explanation = String(raw.explanation || '').trim().replace(/\s+/g, ' ');
    if (!out.explanation) out.explanation = 'Aucune explication n’a encore été fournie pour cette question.';

    let tags = (Array.isArray(raw.tags) ? raw.tags : []).map(function (t) { return String(t).trim().toLowerCase(); })
      .filter(Boolean).filter(function (t, i, a) { return a.indexOf(t) === i; }).slice(0, 6);
    if (!tags.length) tags = [slugify(subLabel)];
    out.tags = tags;

    if (opts.hint) out.hint = String(opts.hint).trim();
    if (opts.image) out.image = String(opts.image).trim();
    if (type === 'guess' || type === 'image') {
      if (!out.image) out.image = (opts.emoji || CAT_EMOJI[out.cat] || '❔');
      const m = /devine\s+(?:le|la|l')?\s*([^:?:]+)\s*:/i.exec(out.text);
      if (m) out.guessKind = m[1].trim();
    }

    out.sources = QV.sources.buildSources(out, subLabel, opts.sources);
    if (out.sources.length) state.stats.withSources += 1;

    // --- identifiant unique ---
    const base = out.cat + '-' + out.sub + '-' + slugify(out.text);
    let id = base, n = 2;
    while (idSet[id]) { id = base + '-' + n; n += 1; }
    idSet[id] = 1;
    out.id = id;
    return out;
  }

  /* ==================================================== INDEXATION ====== */

  /** Compte les questions de chaque univers (à faire avant le catalogue). */
  function computeCounts() {
    state.catsById = new Map(state.categories.map(function (c) { return [c.id, c]; }));
    state.subsById = new Map();
    state.subsByCat = new Map();
    state.categories.forEach(function (cat) {
      const list = [];
      (cat.subs || []).forEach(function (s) {
        const key = cat.id + '/' + s.id;
        const pool = state.bySub.get(key) || [];
        const byDiff = { facile: 0, moyen: 0, difficile: 0, expert: 0 };
        pool.forEach(function (q) { byDiff[q.diff] += 1; });
        s.count = pool.length;
        s.byDiff = byDiff;
        list.push({ id: s.id, label: s.label, key: key, count: pool.length, byDiff: byDiff });
        state.subsById.set(key, { catId: cat.id, subId: s.id, label: s.label, key: key, count: pool.length });
      });
      state.subsByCat.set(cat.id, list.filter(function (s) { return s.count > 0; }));
      cat.count = state.byCat.has(cat.id) ? state.byCat.get(cat.id).length : 0;
      cat.byDiff = { facile: 0, moyen: 0, difficile: 0, expert: 0 };
      (state.byCat.get(cat.id) || []).forEach(function (q) { cat.byDiff[q.diff] += 1; });
    });
  }

  /** Index principal : les questions d'abord. */
  function indexQuestions() {
    state.byId = new Map(); state.byCat = new Map(); state.bySub = new Map();
    state.byCatSub = new Map(); state.byDiff = new Map();

    state.questions.forEach(function (q) {
      state.byId.set(q.id, q);
      if (!state.byCat.has(q.cat)) state.byCat.set(q.cat, []);
      state.byCat.get(q.cat).push(q);
      const key = q.cat + '/' + q.sub;
      if (!state.bySub.has(key)) state.bySub.set(key, []);
      state.bySub.get(key).push(q);
      if (!state.byCatSub.has(q.cat)) state.byCatSub.set(q.cat, new Map());
      const m = state.byCatSub.get(q.cat);
      if (!m.has(q.sub)) m.set(q.sub, []);
      m.get(q.sub).push(q);
      if (!state.byDiff.has(q.diff)) state.byDiff.set(q.diff, []);
      state.byDiff.get(q.diff).push(q);
    });
  }

  /** Index du catalogue de quiz et recherche plein texte. */
  function finishIndexes() {
    state.quizById = new Map();
    state.quizzesByCat = new Map();
    state.quizzes.forEach(function (q) {
      state.quizById.set(q.id, q);
      const key = q.cat === '*' ? '*' : q.cat;
      if (!state.quizzesByCat.has(key)) state.quizzesByCat.set(key, []);
      state.quizzesByCat.get(key).push(q);
    });

    buildSearchIndex();
  }

  function buildSearchIndex() {
    const idx = [];
    state.categories.forEach(function (cat) {
      idx.push({ kind: 'cat', id: cat.id, label: cat.label, emoji: cat.emoji, color: cat.color, weight: 3, search: U.norm(cat.label) });
      (cat.subs || []).forEach(function (s) {
        if (!s.count) return;
        idx.push({ kind: 'sub', id: cat.id + '/' + s.id, catId: cat.id, label: s.label, emoji: cat.emoji, color: cat.color, weight: 2, search: U.norm(s.label + ' ' + cat.label) });
      });
    });
    state.quizzes.forEach(function (q) {
      const cat = state.catsById.get(q.cat);
      idx.push({
        kind: 'quiz', id: q.id, catId: q.cat, label: q.title, sub: q.subLabel || '',
        emoji: cat ? cat.emoji : '✨', color: cat ? cat.color : '#7c5cff', weight: 1,
        search: U.norm(q.title + ' ' + (q.subLabel || '')),
      });
    });
    state.searchIndex = idx;
  }

  /* ================================================= CATALOGUE QUIZ ==== */

  const DESC = {
    facile: 'Les fondamentaux pour se mettre en route',
    moyen: 'Le format idéal pour progresser',
    difficile: 'Pour ceux qui connaissent déjà leur univers',
    expert: 'La toute dernière difficulté',
  };

  function buildQuizCatalogue() {
    const out = [];
    state.categories.forEach(function (cat) {
      (cat.subs || []).forEach(function (s) {
        if (!s.count) return;
        DIFFS.forEach(function (diff) {
          const pool = (state.bySub.get(cat.id + '/' + s.id) || []).filter(function (q) { return q.diff === diff; });
          if (!pool.length) return;
          out.push({
            id: 'q-' + cat.id + '-' + s.id + '-' + diff,
            cat: cat.id, sub: s.id, diff: diff, type: 'sub',
            title: s.label + ' ' + DIFF_LABEL[diff],
            subLabel: cat.label,
            emoji: cat.emoji, color: cat.color,
            description: DESC[diff] + ' · ' + pool.length + ' question' + (pool.length > 1 ? 's' : '') + ' sur « ' + s.label + ' ».',
            pool: pool.length,
          });
        });
      });

      const catAll = state.byCat.get(cat.id) || [];
      if (catAll.length >= 10) {
        [['moyen', ['facile', 'moyen']], ['difficile', ['moyen', 'difficile']]].forEach(function (pair) {
          const pool = catAll.filter(function (q) { return pair[1].indexOf(q.diff) >= 0; });
          if (pool.length < 8) return;
          out.push({
            id: 'q-' + cat.id + '-mix-' + pair[0],
            cat: cat.id, sub: null, diff: pair[0], type: 'cat',
            title: cat.label + ' — Mix ' + DIFF_LABEL[pair[0]],
            subLabel: cat.label + ' · tous les univers',
            emoji: cat.emoji, color: cat.color,
            description: 'Un mélange de questions issues de tous les univers « ' + cat.label + ' ».',
            pool: pool.length,
          });
        });
      }
    });

    if (state.questions.length >= 40) {
      out.push({
        id: 'q-all-mix', cat: '*', sub: null, diff: 'moyen', type: 'global',
        title: 'QuizVerse Mix', subLabel: 'Toutes les catégories',
        emoji: '🌌', color: '#7c5cff',
        description: 'Le grand mélange : des questions tirées de tous les univers de QuizVerse.',
        pool: state.questions.length,
      });
    }
    state.quizzes = out;
    return out;
  }

  /* ======================================================= CHARGEMENT === */

  function loadQuestionsModule(desc, catsById) {
    const files = Array.isArray(desc.files) ? desc.files : [];
    if (!files.length) return Promise.resolve([]);
    return Promise.all(files.map(function (f) {
      const url = new URL(f, document.baseURI).href;
      return import(/* webpackIgnore: true */ url).then(function (mod) {
        state.stats.files += 1;
        return Array.isArray(mod.default) ? mod.default : [];
      }).catch(function (err) {
        console.warn('[QuizVerse] Module de questions non chargé :', f, err && err.message);
        return [];
      });
    })).then(function (lists) { return [].concat.apply([], lists); });
  }

  function load() {
    const boot = document.getElementById('boot-loader');
    const setMsg = function (m) { if (boot) { const p = boot.querySelector('.loader__text'); if (p) p.textContent = m; } };
    setMsg('Chargement des catégories…');

    return Promise.all([
      fetchJson('questions.json').then(function (d) { return d; }),
      fetchJson('categories.json').then(function (d) { return d; }),
      fetchJson('achievements.json').then(function (d) { return Array.isArray(d) ? d : (d.achievements || []); }),
      fetchJson('challenges.json').then(function (d) { return Array.isArray(d) ? d : (d.challenges || []); }),
      fetchJson('titles.json').then(function (d) { return Array.isArray(d) ? d : (d.titles || []); }),
      fetchJson('avatars.json').then(function (d) { return Array.isArray(d) ? d : (d.avatars || []); }),
    ]).then(function (r) {
      const qdesc = r[0];
      state.categories = (Array.isArray(r[1]) ? r[1] : (r[1].categories || [])) || [];
      state.achievements = r[2];
      state.challenges = r[3];
      state.titles = r[4];
      state.avatars = r[5];

      state.catsById = new Map(state.categories.map(function (c) { return [c.id, c]; }));
      state.validSubs = {};
      state.categories.forEach(function (c) {
        (c.subs || []).forEach(function (s) { state.validSubs[c.id + '/' + s.id] = true; });
      });

      setMsg('Chargement des questions…');
      const rawPromise = (qdesc && qdesc.format === 'inline' && Array.isArray(qdesc.questions))
        ? Promise.resolve(qdesc.questions)
        : loadQuestionsModule(qdesc || {}, state.catsById);

      return rawPromise.then(function (raw) {
        setMsg('Vérification de la base…');
        // Sous-catégories explicitement exclues (contenu non suffisamment documenté)
        const excluded = {};
        ((qdesc && qdesc.exclude) || []).forEach(function (k) { excluded[k.join('/')] = 1; });
        if (Object.keys(excluded).length) {
          raw = raw.filter(function (q) { return !excluded[String(q.cat) + '/' + String(q.sub)]; });
        }

        const idSet = {};
        const seenText = {};
        const normalized = [];
        raw.forEach(function (q) {
          const n = normalize(q, state.catsById, state.stats, idSet);
          if (!n) return;
          const key = normKey(n.text);
          if (seenText[key]) { state.stats.duplicates += 1; return; }
          seenText[key] = 1;
          normalized.push(n);
        });

        // Tri : catégorie, univers, difficulté, énoncé
        const rank = { facile: 0, moyen: 1, difficile: 2, expert: 3 };
        normalized.sort(function (a, b) {
          return a.cat.localeCompare(b.cat) || a.sub.localeCompare(b.sub)
            || rank[a.diff] - rank[b.diff] || a.text.localeCompare(b.text, 'fr');
        });

        state.questions = normalized;
        state.stats.total = normalized.length;
        state.categories = state.categories.filter(function (c) {
          return state.questions.some(function (q) { return q.cat === c.id; });
        });
        state.catsById = new Map(state.categories.map(function (c) { return [c.id, c]; }));

        setMsg('Construction des index…');
        indexQuestions();
        computeCounts();
        buildQuizCatalogue();
        finishIndexes();
        state.loaded = true;

        console.info(
          '%cQuizVerse%c ' + state.stats.total + ' questions · ' + state.categories.length + ' catégories · '
          + state.quizzes.length + ' quiz · ' + state.stats.withSources + ' questions sourcées'
          + (state.stats.duplicates ? ' · ' + state.stats.duplicates + ' doublons retirés' : '')
          + (state.stats.fixed ? ' · ' + state.stats.fixed + ' corrections appliquées' : '')
          + (state.stats.rejected ? ' · ' + state.stats.rejected + ' rejetées' : ''),
          'font:700 14px system-ui;color:#7c5cff', 'color:#8f93b8'
        );
        return state;
      });
    }).catch(function (err) {
      console.error('[QuizVerse] Erreur de chargement des données :', err);
      showFatal(err);
      throw err;
    });
  }

  function showFatal(err) {
    const main = document.getElementById('main');
    if (!main) return;
    const isFile = location.protocol === 'file:';
    main.innerHTML = '';
    main.appendChild(el('div.qv-main', null, [
      el('div.empty-state', null, [
        el('div.empty-state__icon', { text: '⚠️' }),
        el('div.empty-state__title', { text: 'Impossible de charger les données' }),
        el('p.empty-state__text', {
          text: isFile
            ? 'QuizVerse a besoin d’un serveur web pour lire ses fichiers de données. Ouvre le site via GitHub Pages, ou lance un petit serveur local (voir le README).'
            : 'Un fichier de données est introuvable ou illisible. Vérifie que les dossiers « data/ » et « tools/authoring/questions/ » sont bien présents à côté de index.html.',
        }),
        isFile
          ? el('pre.card.card--flat.text-xs', { style: { textAlign: 'left', overflowX: 'auto', padding: '14px' }, text: 'cd chemin/vers/QuizVerse\nnpx serve .\n\n# ou, avec Node déjà installé :\nnode tools/serve.mjs' })
          : el('p.text-xs.text-3', { text: String(err && err.message ? err.message : err) }),
        el('a.btn.btn--ghost.mt-4', { href: '#/', text: 'Réessayer' }),
      ]),
    ]));
  }

  /* =========================================================== API ====== */

  QV.data = {
    state: state,
    load: load,
    TYPE_LABELS: TYPE_LABELS,
    DIFF_LABEL: DIFF_LABEL,
    DIFF_EMOJI: DIFF_EMOJI,
    DIFFS: DIFFS,

    get questions() { return state.questions; },
    get categories() { return state.categories; },
    get quizzes() { return state.quizzes; },

    cat: function (id) { return state.catsById.get(id) || null; },
    sub: function (catId, subId) { return state.subsById.get(catId + '/' + subId) || null; },
    subsOf: function (catId) { return state.subsByCat.get(catId) || []; },
    quiz: function (id) { return state.quizById.get(id) || null; },
    quizzesOf: function (catId) { return (state.quizzesByCat.get(catId) || []).slice(); },

    questionsIn: function (catId, subId, diff) {
      let pool = subId ? (state.bySub.get(catId + '/' + subId) || []) : (state.byCat.get(catId) || []);
      if (diff && diff !== 'mixte' && diff !== 'aleatoire') pool = pool.filter(function (q) { return q.diff === diff; });
      return pool;
    },

    resolveQuiz: function (cfg) {
      let pool = [];
      if (cfg.only && cfg.only.length) {
        pool = cfg.only.map(function (id) { return state.byId.get(id); }).filter(Boolean);
      } else if (cfg.kind === 'quiz' && cfg.quizId) {
        const q = state.quizById.get(cfg.quizId);
        if (q) {
          if (q.cat === '*') pool = state.questions.slice();
          else pool = q.sub ? (state.bySub.get(q.cat + '/' + q.sub) || []) : (state.byCat.get(q.cat) || []);
          if (q.diff && q.diff !== 'mixte' && q.cat !== '*') pool = pool.filter(function (x) { return x.diff === q.diff; });
          else if (q.diff === 'mixte' && q.cat !== '*') pool = (state.byCat.get(q.cat) || []).filter(function (x) { return x.diff !== 'expert'; });
        }
      } else if (cfg.kind === 'custom') {
        const seen = {};
        (cfg.cats || []).forEach(function (c) { if (!seen[c]) { seen[c] = 1; pool = pool.concat(state.byCat.get(c) || []); } });
        (cfg.subs || []).forEach(function (k) { if (!seen[k]) { seen[k] = 1; pool = pool.concat(state.bySub.get(k) || []); } });
      } else if (cfg.kind === 'mistakes') {
        const mist = QV.store.loadMistakes();
        pool = Object.keys(mist).map(function (id) { return state.byId.get(id); }).filter(Boolean);
      } else if (cfg.kind === 'daily') {
        pool = QV.daily.questions();
      } else if (cfg.kind === 'weak') {
        const m = QV.mastery.all();
        const weakIds = Object.keys(m).filter(function (id) {
          const v = m[id];
          return v && v.seen && v.level !== 'm-mastered' && v.level !== 'm-perfect';
        });
        pool = U.pick(weakIds, 400).map(function (id) { return state.byId.get(id); }).filter(Boolean);
        if (!pool.length) pool = state.questions.slice();
      } else {
        pool = state.questions.slice();
      }

      const min = Math.min(3, cfg.count || 5);
      if (cfg.diff && cfg.diff !== 'mixte' && cfg.diff !== 'aleatoire') {
        const filtered = pool.filter(function (q) { return q.diff === cfg.diff; });
        if (filtered.length >= min) pool = filtered;
      }
      if (cfg.types && cfg.types.length) {
        const filtered = pool.filter(function (q) { return cfg.types.indexOf(q.type) >= 0; });
        if (filtered.length >= min) pool = filtered;
      }
      return pool;
    },

    buildRun: function (cfg) {
      const pool = QV.data.resolveQuiz(cfg);
      if (!pool.length) return null;
      const seed = (cfg.seed === undefined || cfg.seed === null) ? Math.floor(Math.random() * 0xffffffff) : cfg.seed;
      const rng = U.makeRng(seed);
      const want = U.clamp(cfg.count || 10, 1, Math.max(1, pool.length));
      const chosen = (cfg.mode === 'infini' || cfg.mode === 'survie') ? U.shuffle(pool) : U.pick(pool, want, rng);
      return { seed: seed, poolSize: pool.length, available: pool.length, questions: chosen };
    },

    search: function (query, limit) {
      const q = U.norm(query).trim();
      if (!q) return [];
      const terms = q.split(/\s+/).filter(Boolean);
      const results = [];
      for (let i = 0; i < state.searchIndex.length; i++) {
        const item = state.searchIndex[i];
        let score = 0, all = true;
        for (let t = 0; t < terms.length; t++) {
          const pos = item.search.indexOf(terms[t]);
          if (pos < 0) { all = false; break; }
          score += item.weight * (pos === 0 ? 14 : pos < 4 ? 9 : 5);
          if (item.label.toLowerCase().indexOf(terms[t]) === 0) score += 12;
        }
        if (all) results.push({ item: item, score: score + item.weight * 4 });
      }
      results.sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return a.item.label.localeCompare(b.item.label, 'fr');
      });
      return results.slice(0, limit || 12).map(function (r) { return r.item; });
    },
  };
})(window);
