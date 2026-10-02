/* ==========================================================================
   QuizVerse — vues de jeu
   Fiche quiz · Écran de jeu · Résultats · Quiz du jour · Aléatoire ·
   Surprends-moi · Créer mon quiz
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});
  const U = QV.util;
  const el = U.el;
  const V = (QV.views = QV.views || {});

  const COUNTS = [5, 10, 20, 30, 50];

  /* ====================================================== FICHE QUIZ === */

  V.quiz = function (params) {
    const quiz = QV.data.quiz(params.id);
    if (!quiz) {
      return el('div.qv-page-enter', null, [QV.ui.emptyState('❓', 'Quiz introuvable', 'Ce quiz n’existe pas ou a été retiré.', el('a.btn.btn--primary', { href: '#/explorer', text: 'Explorer les quiz' }))]);
    }
    return setupPage({ quiz: quiz });
  };

  /**
   * Page de configuration commune (fiche quiz, quiz du jour, aléatoire…).
   */
  function setupPage(opts) {
    const o = opts || {};
    const quiz = o.quiz || null;
    const settings = QV.store.loadSettings();
    const page = el('div.qv-main.qv-main--narrow.qv-page-enter');

    const cfg = {
      kind: o.kind || (quiz ? 'quiz' : 'custom'),
      quizId: quiz ? quiz.id : null,
      cat: quiz ? quiz.cat : (o.cat || null),
      sub: o.sub !== undefined ? o.sub : (quiz ? quiz.sub : null),
      diff: quiz ? quiz.diff : (o.diff || settings.defaultDifficulty),
      count: o.count || settings.defaultQuestions,
      mode: o.mode || 'classique',
      timePerQuestion: o.timePerQuestion || 30,
      cats: o.cats || null,
      subs: o.subs || null,
      types: o.types || null,
      title: o.title || (quiz ? quiz.title : 'Quiz personnalisé'),
      emoji: o.emoji || (quiz ? quiz.emoji : '✨'),
      color: o.color || (quiz ? quiz.color : 'var(--accent)'),
      seed: o.seed,
    };
    // Quiz du jour : difficulté et compte imposés
    if (o.kind === 'daily') {
      cfg.diff = 'mixte';
      cfg.count = QV.daily.COUNT;
      cfg.explicitDiff = true;
      cfg.explicitCount = true;
      cfg.seed = QV.daily.seedFor(QV.daily.today());
    }

    /* ---- En-tête ---- */
    const head = el('div.page-head');
    if (o.backHref) head.appendChild(el('a.section__link', { href: o.backHref, text: '← ' + (o.backLabel || 'Retour') }));
    head.appendChild(el('div.row.row--tight', { style: { marginTop: '10px' } }, [
      el('span', { text: cfg.emoji, style: { fontSize: '2rem' } }),
      el('h1', { text: cfg.title, style: { marginBottom: '0' } }),
    ]));
    if (quiz && quiz.description) head.appendChild(el('p.page-head__sub.mt-2', { text: quiz.description }));
    page.appendChild(head);

    /* ---- Statistiques personnelles ---- */
    if (quiz) {
      const st = QV.store.loadStats();
      const key = quiz.sub ? quiz.cat + '/' + quiz.sub : quiz.cat;
      const rec = quiz.sub ? ((st.bySub || {})[key] || {}) : ((st.byCat || {})[quiz.cat] || {});
      const hist = QV.store.loadHistory().filter(function (h) { return h.quizId === quiz.id; });
      const sum = quiz.sub ? QV.mastery.subSummary(quiz.cat, quiz.sub) : QV.mastery.catSummary(quiz.cat);
      const poolSize = quiz.pool || 0;

      page.appendChild(el('section.section', null, [
        el('div.grid.grid--stats', null, [
          QV.ui.stat('Meilleur score', rec.best ? rec.best + '<small>%</small>' : '—', 'Record personnel', '🏆'),
          QV.ui.stat('Taux de réussite', rec.questions ? U.pct((rec.correct / rec.questions) * 100) : '—', rec.questions + ' réponses', '🎯'),
          QV.ui.stat('Parties jouées', U.num(hist.length), 'Dans ce quiz', '🎮'),
          QV.ui.stat('Progression', poolSize ? U.pct(((sum.perfect + sum.mastered) / poolSize) * 100) : '0<small>%</small>', 'Questions maîtrisées', '📈'),
        ]),
      ]));

      const played = hist.length;
      page.appendChild(el('div.row.row--tight.mb-4', null, [
        el('span.pill', { text: '🗂️ ' + (QV.data.cat(quiz.cat) || {}).label }),
        el('span.pill', { text: '📚 ' + quiz.pool + ' questions' }),
        QV.ui.diffBadge(quiz.diff),
        el('span.pill' + (played ? '.pill--green' : ''), { text: played ? '✅ Déjà joué ' + played + ' fois' : '🆕 Jamais joué' }),
      ]));
    }

    /* ---- Options ---- */
    const options = el('div.stack.stack-5');

    // Nombre de questions
    options.appendChild(optionBlock('📝 Nombre de questions', 'countWrap'));
    const countWrap = el('div.segmented.segmented--full');
    COUNTS.forEach(function (c) {
      const avail = quiz ? Math.min(c, quiz.pool) : c;
      countWrap.appendChild(el('button.chip', {
        type: 'button', 'aria-pressed': cfg.count === c ? 'true' : 'false',
        dataset: { opt: 'count', val: String(c) },
        disabled: quiz ? avail < c : false,
        text: c + ' questions' + (quiz && avail < c ? ' (max ' + avail + ')' : ''),
        onclick: function () { cfg.count = c; cfg.explicitCount = true; sync(); },
      }));
    });
    options.lastChild.appendChild(countWrap);

    // Difficulté
    if (!(o.kind === 'daily')) {
      options.appendChild(optionBlock('🎚️ Difficulté', 'diffWrap'));
      const diffWrap = el('div.segmented.segmented--full');
      const diffs = [
        { id: 'facile', label: '🟢 Facile' },
        { id: 'moyen', label: '🟡 Moyen' },
        { id: 'difficile', label: '🟠 Difficile' },
        { id: 'expert', label: '🔴 Expert' },
        { id: 'mixte', label: '🎲 Aléatoire' },
      ];
      diffs.forEach(function (d) {
        diffWrap.appendChild(el('button.chip', {
          type: 'button', 'aria-pressed': cfg.diff === d.id ? 'true' : 'false', text: d.label,
          dataset: { opt: 'diff', val: d.id },
          onclick: function () { cfg.diff = d.id; cfg.explicitDiff = true; cfg.mode = (cfg.mode === 'expert' ? 'classique' : cfg.mode); sync(); },
        }));
      });
      options.lastChild.appendChild(diffWrap);
    }

    // Modes
    options.appendChild(optionBlock('🎮 Mode de jeu', 'modeWrap'));
    const modeWrap = el('div.grid.grid--3');
    QV.quiz.MODES.forEach(function (m) {
      if (o.kind === 'daily' && m.id !== 'quotidien' && m.id !== 'classique') return;
      modeWrap.appendChild(el('button.chip', {
        type: 'button',
        'aria-pressed': cfg.mode === m.id ? 'true' : 'false',
        dataset: { opt: 'mode', val: m.id },
        style: { justifyContent: 'flex-start', textAlign: 'left', padding: '11px 14px', height: '100%' },
        onclick: function () { applyMode(m); sync(); },
      }, [
        el('span', null, [
          el('strong', { text: m.emoji + ' ' + m.label, style: { display: 'block' } }),
          el('span.text-xs.text-3', { text: m.desc }),
        ]),
      ]));
    });
    options.lastChild.appendChild(modeWrap);

    // Temps par question
    const timeBlock = optionBlock('⏱️ Temps par question', 'timeWrap');
    const timeWrap = el('div.row');
    [10, 15, 20, 30, 45, 60].forEach(function (t) {
      timeWrap.appendChild(el('button.chip.chip--sm', {
        type: 'button', 'aria-pressed': cfg.timePerQuestion === t ? 'true' : 'false', text: t + ' s',
        dataset: { opt: 'time', val: String(t) },
        onclick: function () { cfg.timePerQuestion = t; sync(); },
      }));
    });
    timeBlock.appendChild(timeWrap);
    options.appendChild(timeBlock);

    page.appendChild(options);

    function applyMode(m) {
      cfg.mode = m.id;
      if (m.id === 'rapide') { cfg.count = 5; cfg.explicitCount = true; }
      if (m.id === 'long') { cfg.count = 20; cfg.explicitCount = true; }
      if (m.id === 'expert') { cfg.diff = 'expert'; cfg.explicitDiff = true; }
      if (m.id === 'aleatoire') { cfg.diff = 'mixte'; cfg.explicitDiff = true; }
    }

    function sync() {
      const chips = page.querySelectorAll('[data-opt]');
      chips.forEach(function (c) {
        const key = c.getAttribute('data-opt');
        const val = c.getAttribute('data-val');
        if (key === 'count') c.setAttribute('aria-pressed', cfg.count === Number(val) ? 'true' : 'false');
        if (key === 'diff') c.setAttribute('aria-pressed', cfg.diff === val ? 'true' : 'false');
        if (key === 'mode') c.setAttribute('aria-pressed', cfg.mode === val ? 'true' : 'false');
        if (key === 'time') c.setAttribute('aria-pressed', cfg.timePerQuestion === Number(val) ? 'true' : 'false');
      });
      preview.textContent = describe(cfg, quiz);
      const needsTime = cfg.mode === 'chrono';
      timeBlock.style.display = needsTime ? '' : 'none';
    }

    /* ---- Aperçu + lancement ---- */
    const preview = el('p.text-sm.text-2.mb-0');
    const summary = el('div.cta-panel.mt-5', null, [
      el('h3', { text: 'Résumé de la partie', style: { marginBottom: '6px' } }),
      preview,
      el('div.btn-row.btn-row--center.mt-4', null, [
        el('button.btn.btn--primary.btn--lg#start-btn', { type: 'button', text: '▶ Commencer' }),
      ]),
    ]);
    page.appendChild(summary);

    page.querySelector('#start-btn').addEventListener('click', function () {
      QV.app.startQuiz(cfg);
    });

    // Marque les attributs de synchronisation
    sync();
    return page;
  }

  function optionBlock(title, id) {
    return el('div', null, [el('div.field__label', { text: title, id: id })]);
  }

  function describe(cfg, quiz) {
    const m = QV.quiz.mode(cfg.mode);
    const parts = [];
    parts.push(m.emoji + ' Mode ' + m.label + (cfg.mode === 'chrono' ? ' (' + cfg.timePerQuestion + ' s/question)' : ''));
    parts.push(cfg.count + ' questions');
    parts.push('Difficulté : ' + (cfg.diff === 'mixte' ? 'aléatoire' : QV.data.DIFF_LABEL[cfg.diff]));
    if (quiz) parts.push(quiz.pool + ' questions disponibles');
    return parts.join(' · ');
  }

  /* ====================================================== QUIZ DU JOUR == */

  V.quizDuJour = function () {
    const m = QV.daily.meta();
    if (!m) return el('div', null, [QV.ui.emptyState('📅', 'Quiz du jour indisponible', 'Aucune question chargée.')]);
    const rec = QV.store.loadDaily()[QV.daily.today()];
    const played = !!(rec && rec.at);
    const streak = QV.daily.streak();
    const bonus = QV.daily.bonusFor(streak);

    const page = el('div.qv-page-enter');
    page.appendChild(el('div.cta-panel', null, [
      el('div.page-head__eyebrow', { text: '📅 QUIZ DU JOUR', style: { justifyContent: 'center' } }),
      el('h1', { text: 'Quiz du jour' }),
      el('p.page-head__sub', {
        style: { margin: '0 auto 20px', maxWidth: '58ch' },
        text: 'Un nouveau quiz chaque jour, identique pour tout le monde. Le tirage est calculé à partir de la date directement dans ton navigateur : rien à mettre à jour, rien à télécharger, cela change tout seul à minuit.',
      }),
      el('div.grid.grid--stats', { style: { textAlign: 'left', marginBottom: '22px' } }, [
        QV.ui.stat('Questions', String(m.count), 'Dans le quiz du jour', '📝'),
        QV.ui.stat('Difficulté', QV.data.DIFF_LABEL[m.difficulty], 'Difficulté du jour', '🎚️'),
        QV.ui.stat('Récompense', U.num(m.rewardXp) + '<small> XP</small>', 'Une fois par jour', '✨'),
        QV.ui.stat('Mon résultat', played ? U.pct(Math.max(rec.pct || 0, rec.bestPct || 0)) : '—', played ? U.timeAgo(rec.at) : 'Pas encore joué', '🏆'),
        QV.ui.stat('Série', U.num(streak) + '<small> j</small>', bonus ? bonus.label : 'Jours consécutifs', '🔥'),
      ]),
      el('p.text-sm.text-2', { text: 'Univers du jour : ' + m.categoryLabels.join(' · ') }),
      el('p.text-xs.text-3#daily-countdown', { text: 'Prochain quiz dans ' + U.duration(QV.daily.msUntilTomorrow() / 1000) }),
      el('div.btn-row.btn-row--center.mt-4', null, [
        el('button.btn.btn--primary.btn--lg', {
          type: 'button',
          text: played ? 'Rejouer le quiz du jour' : 'Jouer au quiz du jour',
          onclick: function () { QV.app.startQuiz({ kind: 'daily', mode: 'classique', count: QV.daily.COUNT, diff: 'mixte', title: 'Quiz du jour', emoji: '📅', seed: QV.daily.seedFor(QV.daily.today()) }); },
        }),
      ]),
    ]));

    // Compte à rebours réel vers la rotation du lendemain
    (function tick() {
      const node = document.getElementById('daily-countdown');
      if (!node || !document.body.contains(node)) return;
      const left = QV.daily.msUntilTomorrow();
      const h = Math.floor(left / 3600000);
      const mn = Math.floor((left % 3600000) / 60000);
      const s = Math.floor((left % 60000) / 1000);
      node.textContent = '🔄 Nouveau quiz dans ' + h + ' h ' + String(mn).padStart(2, '0') + ' min ' + String(s).padStart(2, '0') + ' s';
      setTimeout(tick, 1000);
    })();

    return page;
  };

  /* ======================================================== ALÉATOIRE == */

  V.aleatoire = function () {
    return setupPage({
      kind: 'quiz',
      title: 'Quiz aléatoire',
      emoji: '🎲',
      color: '#22d3ee',
      backHref: '#/',
      backLabel: 'Accueil',
      cat: '*',
      diff: 'mixte',
      count: QV.store.loadSettings().defaultQuestions,
      mode: 'classique',
    });
  };

  V.surprise = function () {
    return setupPage({
      kind: 'quiz',
      title: '🎲 Surprends-moi',
      emoji: '🎁',
      color: '#f472b6',
      backHref: '#/',
      backLabel: 'Accueil',
      diff: 'mixte',
      count: 10,
      mode: 'surprise',
      explicit: true,
    });
  };

  /* ================================================== CRÉER MON QUIZ === */

  V.creerMonQuiz = function (params, query) {
    const page = el('div.qv-main.qv-main--narrow.qv-page-enter');
    const settings = QV.store.loadSettings();
    const sel = {
      cats: [],
      subs: [],
      diff: settings.defaultDifficulty,
      count: settings.defaultQuestions,
      types: [],
      mode: 'classique',
      timePerQuestion: 30,
      preset: (query && query.preset) || '',
    };

    if (query && query.cat) { sel.cats = [query.cat]; }
    if (query && query.sub) { sel.subs = [query.sub]; sel.cats = [query.sub.split('/')[0]]; }
    if (sel.preset === 'weak') {
      sel.preset = 'weak';
    }

    page.appendChild(el('div.page-head', null, [
      el('div.page-head__eyebrow', { text: '🏗️ MODE PERSONNALISÉ' }),
      el('h1', { text: 'Créer mon quiz' }),
      el('p.page-head__sub', { text: 'Choisis exactement ce que tu veux : catégories, univers, difficulté, nombre de questions, types de questions, temps et mode. Tout est généré à partir de la base locale.' }),
    ]));

    /* -- Présélections -- */
    page.appendChild(el('section.section', null, [
      el('div.row.row--tight', null, [
        el('span.text-sm.text-3', { text: 'Démarrage rapide :' }),
        el('button.chip.chip--sm', {
          type: 'button', text: '⚡ Réviser mes erreurs',
          onclick: function () { location.hash = '#/mes-erreurs'; },
        }),
        el('button.chip.chip--sm', {
          type: 'button', text: '🧠 Mes connaissances faibles',
          onclick: function () { startPreset('weak'); },
        }),
        el('button.chip.chip--sm', {
          type: 'button', text: '🌌 Tout mélanger',
          onclick: function () { sel.cats = []; sel.subs = []; sel.diff = 'mixte'; sync(); },
        }),
      ]),
    ]));

    /* -- Catégories -- */
    const catSection = el('div.panel');
    catSection.appendChild(el('div.panel__title', { text: '🗂️ Catégories (au moins une, ou toutes si vide)' }));
    const catChips = el('div.segmented');
    QV.data.categories.forEach(function (c) {
      const b = el('button.chip', {
        type: 'button', 'aria-pressed': 'false',
        text: c.emoji + ' ' + c.label,
        onclick: function () {
          const i = sel.cats.indexOf(c.id);
          if (i >= 0) sel.cats.splice(i, 1); else sel.cats.push(c.id);
          sync();
        },
      });
      b.dataset.cat = c.id;
      catChips.appendChild(b);
    });
    catSection.appendChild(catChips);
    page.appendChild(el('section.section', null, [catSection]));

    /* -- Univers -- */
    const subSection = el('div.panel');
    subSection.appendChild(el('div.panel__title', { text: '🎯 Univers (optionnel, plus précis que les catégories)' }));
    const subChips = el('div.segmented');
    QV.data.categories.forEach(function (c) {
      const wrap = el('div', { style: { display: 'contents' } });
      const subs = QV.data.subsOf(c.id);
      if (!subs.length) return;
      wrap.appendChild(el('div.text-xs.text-3', { text: c.emoji + ' ' + c.label, style: { width: '100%', margin: '8px 0 2px', fontWeight: '700' } }));
      subs.forEach(function (s) {
        const b = el('button.chip.chip--sm', {
          type: 'button', 'aria-pressed': 'false', text: s.label + ' (' + s.count + ')',
          onclick: function () {
            const i = sel.subs.indexOf(s.key);
            if (i >= 0) sel.subs.splice(i, 1); else { sel.subs.push(s.key); if (sel.cats.indexOf(c.id) < 0) sel.cats.push(c.id); }
            sync();
          },
        });
        b.dataset.sub = s.key;
        subChips.appendChild(b);
      });
    });
    subSection.appendChild(subChips);
    page.appendChild(el('section.section', null, [subSection]));

    /* -- Difficulté / questions / mode / temps / types -- */
    const panel = el('div.panel.stack.stack-5');

    const diffBlock = el('div');
    diffBlock.appendChild(el('div.field__label', { text: '🎚️ Difficulté' }));
    const diffSeg = el('div.segmented');
    [{ id: 'facile', l: '🟢 Facile' }, { id: 'moyen', l: '🟡 Moyen' }, { id: 'difficile', l: '🟠 Difficile' }, { id: 'expert', l: '🔴 Expert' }, { id: 'mixte', l: '🎲 Mélange' }].forEach(function (d) {
      const b = el('button.chip', {
        type: 'button', text: d.l,
        onclick: function () { sel.diff = d.id; sync(); },
      });
      b.dataset.diff = d.id;
      diffSeg.appendChild(b);
    });
    diffBlock.appendChild(diffSeg);
    panel.appendChild(diffBlock);

    const cntBlock = el('div');
    cntBlock.appendChild(el('div.field__label', { text: '📝 Nombre de questions' }));
    const cntSeg = el('div.segmented');
    COUNTS.forEach(function (c) {
      const b = el('button.chip', {
        type: 'button', text: String(c),
        onclick: function () { sel.count = c; sync(); },
      });
      b.dataset.count = String(c);
      cntSeg.appendChild(b);
    });
    cntBlock.appendChild(cntSeg);
    panel.appendChild(cntBlock);

    const typeBlock = el('div');
    typeBlock.appendChild(el('div.field__label', { text: '🧩 Types de questions (aucun = tous)' }));
    const typeSeg = el('div.segmented');
    ['qcm', 'vf', 'multi', 'guess', 'image'].forEach(function (t) {
      const count = (QV.data.state.byType && QV.data.state.byType[t] && QV.data.state.byType[t].length) || 0;
      const b = el('button.chip', {
        type: 'button',
        text: (QV.data.TYPE_LABELS[t] || t) + (count ? ' (' + count + ')' : ''),
        disabled: count === 0,
        title: count === 0 ? 'Aucun univers ne propose ce type pour l’instant' : '',
        onclick: function () {
          const i = sel.types.indexOf(t);
          if (i >= 0) sel.types.splice(i, 1); else sel.types.push(t);
          sync();
        },
      });
      b.dataset.type = t;
      typeSeg.appendChild(b);
    });
    typeBlock.appendChild(typeSeg);
    panel.appendChild(typeBlock);

    const modeBlock = el('div');
    modeBlock.appendChild(el('div.field__label', { text: '🎮 Mode de jeu' }));
    const modeSeg = el('div.segmented');
    QV.quiz.MODES.filter(function (m) { return m.id !== 'quotidien' && m.id !== 'surprise'; }).forEach(function (m) {
      const b = el('button.chip.chip--sm', {
        type: 'button', text: m.emoji + ' ' + m.label, title: m.desc,
        onclick: function () { sel.mode = m.id; sync(); },
      });
      b.dataset.mode = m.id;
      modeSeg.appendChild(b);
    });
    modeBlock.appendChild(modeSeg);
    panel.appendChild(modeBlock);

    const timeBlock = el('div');
    timeBlock.appendChild(el('div.field__label', { text: '⏱️ Temps par question (mode chrono)' }));
    const timeSeg = el('div.segmented');
    [10, 15, 20, 30, 45, 60].forEach(function (t) {
      const b = el('button.chip.chip--sm', {
        type: 'button', text: t + ' s',
        onclick: function () { sel.timePerQuestion = t; sync(); },
      });
      b.dataset.time = String(t);
      timeSeg.appendChild(b);
    });
    timeBlock.appendChild(timeSeg);
    panel.appendChild(timeBlock);

    page.appendChild(el('section.section', null, [panel]));

    const summary = el('div.cta-panel');
    const info = el('p.text-sm.text-2');
    summary.appendChild(info);
    summary.appendChild(el('div.btn-row.btn-row--center.mt-4', null, [
      el('button.btn.btn--primary.btn--lg', {
        type: 'button', id: 'build-start', text: '🎯 Créer mon quiz',
        onclick: function () {
          QV.app.startQuiz({
            kind: sel.preset === 'weak' ? 'weak' : 'custom',
            cats: sel.cats, subs: sel.subs, diff: sel.diff, count: sel.count,
            types: sel.types, mode: sel.mode, timePerQuestion: sel.timePerQuestion,
            explicitDiff: true, explicitCount: true,
            title: sel.preset === 'weak' ? 'Mes connaissances à consolider' : 'Mon quiz personnalisé',
            emoji: '🏗️', color: '#a855f7',
          });
        },
      }),
    ]));
    page.appendChild(summary);

    function startPreset(kind) {
      QV.app.startQuiz({ kind: 'weak', diff: 'mixte', count: Math.min(30, sel.count || 20), mode: 'classique', title: 'Mes connaissances à consolider', emoji: '🧠' });
    }

    function availableCount() {
      const cfg = { kind: sel.preset === 'weak' ? 'weak' : 'custom', cats: sel.cats, subs: sel.subs, diff: sel.diff, types: sel.types };
      return QV.data.resolveQuiz(cfg).length;
    }

    function sync() {
      page.querySelectorAll('[data-cat]').forEach(function (b) { b.setAttribute('aria-pressed', sel.cats.indexOf(b.dataset.cat) >= 0 ? 'true' : 'false'); });
      page.querySelectorAll('[data-sub]').forEach(function (b) { b.setAttribute('aria-pressed', sel.subs.indexOf(b.dataset.sub) >= 0 ? 'true' : 'false'); });
      page.querySelectorAll('[data-diff]').forEach(function (b) { b.setAttribute('aria-pressed', sel.diff === b.dataset.diff ? 'true' : 'false'); });
      page.querySelectorAll('[data-count]').forEach(function (b) { b.setAttribute('aria-pressed', sel.count === Number(b.dataset.count) ? 'true' : 'false'); });
      page.querySelectorAll('[data-type]').forEach(function (b) { b.setAttribute('aria-pressed', sel.types.indexOf(b.dataset.type) >= 0 ? 'true' : 'false'); });
      page.querySelectorAll('[data-mode]').forEach(function (b) { b.setAttribute('aria-pressed', sel.mode === b.dataset.mode ? 'true' : 'false'); });
      page.querySelectorAll('[data-time]').forEach(function (b) { b.setAttribute('aria-pressed', sel.timePerQuestion === Number(b.dataset.time) ? 'true' : 'false'); });
      timeBlock.style.display = sel.mode === 'chrono' ? '' : 'none';

      const avail = availableCount();
      const m = QV.quiz.mode(sel.mode);
      let label;
      if (sel.preset === 'weak') label = 'Quiz sur tes questions à retravailler';
      else if (!sel.cats.length && !sel.subs.length) label = 'Toutes les catégories';
      else {
        const names = sel.subs.length
          ? sel.subs.map(function (k) { const s = QV.data.sub(k.split('/')[0], k.split('/')[1]); return s ? s.label : k; }).slice(0, 3).join(', ')
          : sel.cats.map(function (c) { const x = QV.data.cat(c); return x ? x.label : c; }).slice(0, 3).join(', ');
        label = (sel.subs.length ? 'Univers : ' : 'Catégories : ') + names + (sel.cats.length > 3 ? '…' : '');
      }
      info.textContent = label + ' · ' + sel.count + ' questions · ' + (sel.diff === 'mixte' ? 'difficulté mélangée' : QV.data.DIFF_LABEL[sel.diff])
        + ' · mode ' + m.label + ' · ' + U.num(avail) + ' questions disponibles dans ce choix.';
      const btn = page.querySelector('#build-start');
      btn.disabled = avail < 1;
    }

    sync();
    return page;
  };

  /* ==================================================== ÉCRAN DE JEU == */

  let unsubscribe = null;
  let keyHandler = null;

  V.jouer = function () {
    const run = QV.quiz.state();
    if (!run || run.over) {
      // La partie vient de se terminer : on bascule sur l'écran des résultats.
      if (run && run.result) {
        location.replace('#/resultats');
        return el('div', null, [el('div.loader', null, [el('div.loader__ring', { 'aria-hidden': 'true' }), el('p.loader__text', { text: 'Calcul de ton score…' })])]);
      }
      return el('div', null, [
        el('div.qv-main', null, [
          QV.ui.emptyState('🎮', 'Aucune partie en cours', 'Tu as quitté le quiz ou la page a été rechargée. Lance une nouvelle partie.',
            el('a.btn.btn--primary', { href: '#/surprise', text: 'Lancer un quiz' })),
        ]),
      ]);
    }

    document.body.classList.add('is-quizzing');
    const page = el('div.qv-main.quiz-screen.qv-page-enter');
    page.id = 'quiz-screen';

    /* ---- Barre du haut ---- */
    const countNode = el('div.quiz-topbar__count');
    const barNode = el('div.quiz-topbar__bar');
    const timerNode = el('div.quiz-topbar__timer', { style: { display: 'none' } });
    const scoreNode = el('div.quiz-topbar__score');
    const topbar = el('div.quiz-topbar', null, [
      el('button.icon-btn', { type: 'button', 'aria-label': 'Quitter le quiz', title: 'Quitter (Échap)', text: '✕', onclick: confirmQuit }),
      countNode, barNode, timerNode, scoreNode,
    ]);
    page.appendChild(topbar);

    const cardHost = el('div');
    page.appendChild(cardHost);

    let lastQid = null;
    let feedbackDone = false;

    function render() {
      const r = QV.quiz.state();
      if (!r) return;
      if (r.over) { location.replace('#/resultats'); return; }

      countNode.innerHTML = 'Question ' + (r.index + 1) + ' <span>/ ' + (r.infinite ? '∞' : r.total) + '</span>';
      barNode.innerHTML = '';
      barNode.appendChild(QV.ui.bar(r.index + (r.locked ? 1 : 0), r.infinite ? Math.max(10, r.index + 1) : r.total, 'cyan'));
      scoreNode.textContent = U.num(r.score) + ' pts · ' + U.num(r.xp) + ' XP';

      if (r.timed) {
        timerNode.style.display = '';
        timerNode.className = 'quiz-topbar__timer' + (r.remaining <= 5 ? ' is-urgent' : (r.remaining > r.timePerQuestion * 0.6 ? ' is-safe' : ''));
        timerNode.textContent = '⏱ ' + U.clock(r.remaining);
      } else {
        timerNode.style.display = 'none';
      }

      if (r.current && r.current.id !== lastQid) {
        lastQid = r.current.id;
        feedbackDone = false;
        renderQuestion(r);
      }
      if (r.locked && !feedbackDone) {
        feedbackDone = true;
        renderFeedback(r);
      } else if (!r.locked && r.current && r.current.type === 'multi') {
        syncMulti(r);
      }
    }

    function syncMulti(r) {
      U.$$('.answer', cardHost).forEach(function (b, i) {
        const on = r.selected.indexOf(i) >= 0;
        b.classList.toggle('is-selected', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      const mc = cardHost.querySelector('#multi-confirm');
      if (mc) mc.disabled = !r.selected.length;
    }

    function renderQuestion(r) {
      const q = r.current;
      cardHost.innerHTML = '';
      const card = el('div.question-card.qv-enter');

      card.appendChild(el('div.question-card__meta', null, [
        QV.ui.diffBadge(q.diff),
        el('span.pill', { text: (QV.data.cat(q.cat) || {}).emoji + ' ' + ((QV.data.sub(q.cat, q.sub) || {}).label || '') }),
        el('span.pill', { text: r.modeDef.emoji + ' ' + r.modeDef.label }),
        r.streak >= 3 ? el('span.quiz-streak', { text: '🔥 ' + r.streak }) : null,
        el('span.pill.pill--accent', { text: U.num(QV.xp.DIFF_XP[q.diff] || 12) + ' XP' }),
      ]));

      if (q.type === 'image' && q.image) {
        card.appendChild(el('div.question-card__art', { 'aria-hidden': 'true', text: q.image }));
      } else if (q.type === 'guess' && q.image) {
        card.appendChild(el('div.question-card__art', { 'aria-hidden': 'true', text: q.image }));
      }

      card.appendChild(el('h2.question-card__text', { text: q.text }));

      if (q.type === 'guess' && q.hint) {
        card.appendChild(el('div.question-card__hint', { text: '💡 Indice : ' + q.hint }));
      }

      const answers = el('div.answers' + (q.answers.length <= 2 ? '.answers--2' : ''));
      q.answers.forEach(function (a, i) {
        const b = el('button.answer', {
          type: 'button',
          dataset: { idx: String(i) },
          onclick: function () {
            QV.music.sfx('click');
            QV.quiz.select(i);
          },
        }, [
          el('span.answer__key', { text: String(i + 1) }),
          el('span.answer__text', { text: a }),
          el('span.answer__mark', { 'aria-hidden': 'true' }),
        ]);
        answers.appendChild(b);
      });
      card.appendChild(answers);

      if (q.type === 'multi') {
        card.appendChild(el('p.multi-hint', { text: '🔹 Plusieurs réponses sont correctes : sélectionne-les puis valide.' }));
        card.appendChild(el('button.btn.btn--primary.mt-3#multi-confirm', {
          type: 'button', text: 'Valider ma sélection',
          onclick: function () { QV.music.sfx('click'); QV.quiz.confirm(); },
        }));
      }

      cardHost.appendChild(card);
      focusFirst();
    }

    function focusFirst() {
      const a = cardHost.querySelector('.answer');
      if (a) a.focus({ preventScroll: true });
    }

    function renderFeedback(r) {
      const q = r.current;
      const last = r.history[r.history.length - 1];
      if (!last) return;
      const answersEl = cardHost.querySelector('.answers');
      if (!answersEl) return;
      const corr = QV.quiz.correctIndexes(q);

      answersEl.classList.add('is-locked');
      U.$$('.answer', answersEl).forEach(function (b, i) {
        b.disabled = true;
        const mark = b.querySelector('.answer__mark');
        if (corr.indexOf(i) >= 0) {
          b.classList.add('is-correct');
          b.classList.add('qv-pop');
          mark.textContent = '✓';
          if (last.selected.indexOf(i) < 0) b.classList.add('is-missed');
        } else if (last.selected.indexOf(i) >= 0) {
          b.classList.add('is-wrong');
          b.classList.add('qv-shake');
          mark.textContent = '✕';
        } else {
          b.classList.add('is-dim');
        }
      });

      // Bouton de validation des réponses multiples
      const mc = cardHost.querySelector('#multi-confirm');
      if (mc) mc.remove();

      const ok = last.verdict === 'correct';
      const part = last.verdict === 'partial';
      const timeout = last.verdict === 'timeout';
      const title = timeout ? 'Temps écoulé !' : ok ? 'Bonne réponse !' : part ? 'Partiellement correct' : 'Mauvaise réponse';
      const cls = ok ? 'ok' : part ? 'part' : 'ko';
      const icon = ok ? '🎉' : part ? '🤔' : '💔';
      const correctText = corr.map(function (i) { return q.answers[i]; }).join(' · ');
      const yourText = last.selected.length ? last.selected.map(function (i) { return q.answers[i]; }).join(' · ') : 'Aucune réponse';

      /* --- Explication : toujours affichée, bonne ou mauvaise réponse --- */
      const body = el('div.grow');
      body.appendChild(el('div.answer-check__title.' + cls, { text: title }));
      if (ok || part) {
        body.appendChild(el('div.answer-check__text', { html: '<strong>Réponse :</strong> ' + U.esc(correctText) }));
      } else {
        body.appendChild(el('div.answer-check__text', { html: '<strong>Ta réponse :</strong> ' + U.esc(yourText) }));
        body.appendChild(el('div.answer-check__text', { html: '<strong>Bonne réponse :</strong> ' + U.esc(correctText) }));
      }
      body.appendChild(el('div.answer-check__text.mt-2', null, [
        el('strong', { text: (ok || part ? 'Pourquoi c’est juste : ' : 'Pourquoi : ') }),
        document.createTextNode(q.explanation || 'Pas d’explication fournie pour cette question.'),
      ]));

      /* --- Détail : tags, temps, XP --- */
      const metaBits = [];
      if (q.tags && q.tags.length) metaBits.push('Mots-clés : ' + q.tags.join(', '));
      metaBits.push('Temps : ' + U.duration(last.timeMs / 1000));
      if (last.gained) metaBits.push('+' + U.num(last.gained) + ' points');
      body.appendChild(el('div.answer-check__meta', { text: metaBits.join('  ·  ') }));

      if (last.gained) body.appendChild(el('span.answer-check__xp', { text: '+' + U.num(last.gained) + ' points' }));

      /* --- Sources : pour les bonnes ET les mauvaises réponses --- */
      body.appendChild(QV.ui.sourcesNode(q));

      const check = el('div.answer-check.qv-scale-in', null, [
        el('span.answer-check__icon', { text: icon, 'aria-hidden': 'true' }),
        body,
      ]);

      const nextBtn = el('button.btn.btn--primary#next-btn', {
        type: 'button',
        text: isLast(r) ? 'Voir mes résultats →' : 'Question suivante →',
        onclick: function () { QV.music.sfx('click'); QV.quiz.next(); },
      });

      const actions = el('div.quiz-actions', null, [
        el('span.text-xs.text-3', { text: 'Raccourci : ' + String.fromCharCode(187) + ' ou Entrée' }),
        el('div.quiz-actions__right', null, [nextBtn]),
      ]);

      cardHost.querySelector('.question-card').appendChild(check);
      cardHost.querySelector('.question-card').appendChild(actions);
      setTimeout(function () { nextBtn.focus({ preventScroll: true }); }, 60);

      // Sons
      if (last.verdict === 'timeout') QV.music.sfx('wrong');
      else if (ok) QV.music.sfx('correct');
      else QV.music.sfx('wrong');

      // Mode parfait / survie : fin immédiate
      const m = r.modeDef;
      if ((m.id === 'survie' || m.id === 'infini' || m.id === 'parfait') && last.verdict !== 'correct' && last.verdict !== 'partial') {
        nextBtn.textContent = 'Voir le résultat →';
      }
    }

    function isLast(r) {
      if (r.infinite) return false;
      return r.index >= r.total - 1;
    }

    function confirmQuit() {
      const r = QV.quiz.state();
      if (!r) return;
      const settings = QV.store.loadSettings();
      if (r.answered === 0 || !settings.confirmBeforeQuit) {
        doQuit();
        return;
      }
      QV.ui.modal({
        title: 'Quitter la partie ?',
        text: 'Tu as répondu à ' + r.answered + ' question' + (r.answered > 1 ? 's' : '') + '. Les résultats de cette partie seront quand même enregistrés.',
        actions: [
          { label: 'Continuer le quiz', kind: 'ghost' },
          { label: 'Quitter', kind: 'danger', onClick: doQuit },
        ],
      });
    }

    function doQuit() {
      QV.quiz.abort();
      document.body.classList.remove('is-quizzing');
      QV.music.setContext('menu');
      location.hash = '#/resultats';
    }

    /* ---- Clavier ---- */
    function onKey(e) {
      const r = QV.quiz.state();
      if (!r) return;
      if (e.key === 'Escape') { e.preventDefault(); confirmQuit(); return; }
      if (e.key === 'Enter') {
        e.preventDefault();
        const nb = document.getElementById('next-btn');
        if (nb) { QV.music.sfx('click'); QV.quiz.next(); }
        else if (r.current && r.current.type === 'multi' && r.selected.length) { QV.quiz.confirm(); }
        return;
      }
      if (['1', '2', '3', '4', '5', '6'].indexOf(e.key) >= 0) {
        const idx = Number(e.key) - 1;
        const btn = cardHost.querySelector('.answer[data-idx="' + idx + '"]');
        if (btn && !btn.disabled) { e.preventDefault(); QV.music.sfx('click'); QV.quiz.select(idx); }
        return;
      }
    }
    document.removeEventListener('keydown', keyHandler, true);
    document.addEventListener('keydown', onKey, true);
    keyHandler = onKey;
    if (unsubscribe) unsubscribe();
    unsubscribe = QV.quiz.onUpdate(render);

    render();
    return page;
  };

  /* ======================================================== RÉSULTATS == */

  V.resultats = function (params, query) {
    const run = QV.quiz.state();
    document.body.classList.remove('is-quizzing');
    const res = run && run.result;

    if (!res) {
      return el('div.qv-main', null, [
        QV.ui.emptyState('📊', 'Aucun résultat à afficher', 'Termine un quiz pour voir ton score, ton XP et tes statistiques.',
          el('a.btn.btn--primary', { href: '#/surprise', text: 'Lancer un quiz' })),
      ]);
    }

    const page = el('div.qv-main.results.qv-page-enter');
    const verdict = verdictOf(res);

    // Confettis si bon score
    if (res.pct >= 60 && document.documentElement.getAttribute('data-motion') !== 'off') {
      U.confetti(document.body, { count: res.perfect ? 90 : 46 });
    }

    page.appendChild(el('div.results__verdict', null, [
      el('div.page-head__eyebrow', { text: '🏁 RÉSULTATS', style: { justifyContent: 'center' } }),
      el('span', { text: verdict.emoji, style: { fontSize: '3rem' }, 'aria-hidden': 'true' }),
    ]));
    page.appendChild(el('h1.results__title', { text: verdict.title }));
    page.appendChild(el('p.results__sub', { text: verdict.text }));

    page.appendChild(el('div.results__big.qv-pop', { text: res.pct + '%' }));
    page.appendChild(el('div.results__score', null, [
      el('span.results__scorepoints', { text: U.num(res.score) + ' points' }),
      el('span.pill.pill--accent', { text: '⭐ ' + res.xp + ' XP gagnés' }),
      QV.data.DIFF_LABEL[res.diff] ? QV.ui.diffBadge(res.diff) : null,
      el('span.pill', { text: QV.quiz.mode(res.mode).emoji + ' ' + QV.quiz.mode(res.mode).label }),
    ]));

    // Barre de niveau
    const p = QV.xp.profile();
    const lvl = QV.xp.levelInfo(p.xp);
    page.appendChild(el('div.panel.mt-5', null, [
      el('div.row.row--between.mb-3', null, [
        el('div.row.row--tight', null, [
          el('div.level-badge', { id: 'level-badge' }, [el('b', { text: String(lvl.level) }), el('span', { text: 'Niveau' })]),
          el('div', null, [
            el('strong', { text: QV.xp.levelRank(lvl.level) }),
            el('div.text-xs.text-3', { text: U.num(lvl.into) + ' / ' + U.num(lvl.need) + ' XP · ' + U.pct(lvl.progress) }),
          ]),
        ]),
        el('span.pill.pill--accent', { text: U.num(p.xp) + ' XP au total' }),
      ]),
      el('div.bar.bar--lg.xp-bar', null, [el('i.bar__fill', { style: { width: lvl.progress + '%' } })]),
    ]));

    if (res.badges && res.badges.length) {
      page.appendChild(el('section.section', null, [
        el('div.win-banner', null, [
          el('span.win-banner__icon', { text: '🏅', 'aria-hidden': 'true' }),
          el('div.grow', null, [
            el('div.win-banner__title', { text: res.badges.length + ' badge' + (res.badges.length > 1 ? 's' : '') + ' débloqué' + (res.badges.length > 1 ? 's' : '') + ' !' }),
            el('div.win-banner__text', { text: res.badges.map(function (b) { return b.icon + ' ' + b.name; }).join(' · ') }),
          ]),
        ]),
      ]));
    }

    if (res.challenges && res.challenges.length) {
      page.appendChild(el('section.section', null, [
        el('div.win-banner', { style: { background: 'linear-gradient(120deg, rgba(34,211,238,.14), rgba(124,92,255,.1))', borderColor: 'rgba(34,211,238,.32)' } }, [
          el('span.win-banner__icon', { text: '🎯', 'aria-hidden': 'true' }),
          el('div.grow', null, [
            el('div.win-banner__title', { text: res.challenges.length + ' défi' + (res.challenges.length > 1 ? 's' : '') + ' validé' + (res.challenges.length > 1 ? 's' : '') + ' !' }),
            el('div.win-banner__text', { text: res.challenges.map(function (c) { return c.def.icon + ' ' + c.def.name + ' (+' + (c.result.xp || 0) + ' XP)'; }).join(' · ') }),
          ]),
        ]),
      ]));
    }

    if (res.dailyBonus) {
      page.appendChild(el('section.section', null, [
        el('div.win-banner', null, [
          el('span.win-banner__icon', { text: '🔥', 'aria-hidden': 'true' }),
          el('div.grow', null, [
            el('div.win-banner__title', { text: res.dailyBonus.label + ' !' }),
            el('div.win-banner__text', { text: 'Bonus de fidélité du quiz du jour : +' + U.num(res.dailyBonusXp) + ' XP' }),
          ]),
        ]),
      ]));
    }

    // Détails
    page.appendChild(el('section.section', null, [
      el('div.grid.grid--stats', null, [
        QV.ui.stat('Bonnes réponses', U.num(res.correct), 'Sur ' + res.answered + ' questions', '✅'),
        QV.ui.stat('Mauvaises réponses', U.num(res.wrong), res.partial ? res.partial + ' partielles' : '', '❌'),
        QV.ui.stat('Taux de réussite', U.pct(res.pct), res.perfect ? 'Partie parfaite' : '', '🎯'),
        QV.ui.stat('Temps total', U.duration(res.time), 'Moyenne ' + U.duration(res.avgTime / 1000) + '/question', '⏱️'),
        QV.ui.stat('Série maximale', U.num(res.bestStreak), 'Bonnes réponses d’affilée', '🔥'),
        QV.ui.stat('XP gagnés', U.num(res.xp), res.bonus && res.bonus.parts.length ? res.bonus.parts.map(function (b) { return b.label; }).join(', ') : 'Score et réponses', '⭐'),
      ]),
    ]));

    // Répartition par type
    if (res.typeStats && res.typeStats.length) {
      const LBL = { qcm: 'QCM', vf: 'Vrai / Faux', multi: 'Plusieurs réponses', guess: 'Devine', image: 'Image' };
      page.appendChild(el('section.section', null, [
        el('div.panel', null, [
          el('div.panel__title', { text: '🧩 Répartition par type de question' }),
          el('div.hbar', null, res.typeStats.map(function (t) {
            const good = t.count ? Math.round((t.correct / t.count) * 100) : 0;
            return el('div.hbar__row', null, [
              el('span.hbar__name', { text: LBL[t.type] || t.type }),
              el('div.bar', null, [el('i.bar__fill', { style: { width: good + '%' } })]),
              el('span.hbar__val', { text: t.correct + '/' + t.count }),
            ]);
          })),
        ]),
      ]));
    }

    // Corrections
    const review = el('div.review');
    res.history.forEach(function (h, i) {
      const q = h.question;
      const ok = h.verdict === 'correct';
      const part = h.verdict === 'partial';
      const item = el('div.review__item.' + (ok ? 'ok' : 'ko'), null, [
        el('div.review__q', { text: (i + 1) + '. ' + q.text }),
        el('div.review__line' + (ok ? '.ok' : '.ko'), null, [
          el('b', { text: h.verdict === 'timeout' ? 'Temps' : 'Ta réponse' }),
          el('span', { text: h.selected.length ? h.selected.map(function (x) { return q.answers[x]; }).join(' · ') : 'Aucune réponse' }),
        ]),
        ok ? null : el('div.review__line.ok', null, [
          el('b', { text: 'Bonne' }),
          el('span', { text: h.correctIdx.map(function (x) { return q.answers[x]; }).join(' · ') }),
        ]),
        q.explanation ? el('div.review__exp', null, [
          el('strong', { text: ok ? 'Pourquoi c’est juste : ' : 'Pourquoi : ' }),
          document.createTextNode(q.explanation),
        ]) : null,
        q.tags && q.tags.length ? el('div.review__tags', null, q.tags.slice(0, 5).map(function (t) {
          return el('span.tag', { text: '#' + t });
        })) : null,
        QV.ui.sourcesNode(q, { compact: true }),
      ]);
      review.appendChild(item);
    });
    page.appendChild(el('section.section', null, [
      QV.ui.sectionHead('Correction détaillée', null, null, '📝'),
      review,
    ]));

    // Actions
    const actions = el('div.btn-row.btn-row--center.mt-5', null, [
      res.quizId ? el('a.btn.btn--primary', { href: '#/resultats?replay=1', text: '🔁 Rejouer' }) : el('a.btn.btn--primary', { href: '#/surprise', text: '🔁 Rejouer un quiz' }),
      res.wrong > 0 ? el('a.btn.btn--ghost', { href: '#/mes-erreurs', text: '🔁 Revoir mes erreurs' }) : null,
      el('a.btn.btn--ghost', { href: '#/statistiques', text: '📊 Statistiques' }),
      el('a.btn.btn--ghost', { href: '#/explorer', text: '🧭 Explorer' }),
    ]);
    page.appendChild(actions);

    page.appendChild(el('p.text-xs.text-3.text-center.mt-4', { text: 'Partie enregistrée dans ton historique · ' + U.dateTime(res.at) }));

    // Rejouer
    if (query && query.replay === '1') {
      setTimeout(function () {
        QV.app.startQuiz({
          kind: res.kind, quizId: res.quizId, title: res.title, emoji: res.emoji,
          cat: res.cat, sub: res.sub, diff: res.diff, count: res.answered || 10,
          mode: res.mode, explicitDiff: true, explicitCount: true,
        });
      }, 60);
    }

    return page;
  };

  function verdictOf(res) {
    if (res.perfect) return { emoji: '💎', title: 'PARFAIT !', text: 'Sans faute. Aucun quiz ne fait mieux que ça.' };
    if (res.pct >= 90) return { emoji: '🏆', title: 'Exceptionnel !', text: 'Une maîtrise presque parfaite de cet univers.' };
    if (res.pct >= 75) return { emoji: '🌟', title: 'Excellent !', text: 'Tu connais très bien ton sujet. Le niveau expert t’attend.' };
    if (res.pct >= 60) return { emoji: '👍', title: 'Bien joué !', text: 'Bonne performance. Travaille tes erreurs pour progresser.' };
    if (res.pct >= 40) return { emoji: '💪', title: 'Pas mal !', text: 'C’est un bon début. Revois tes erreurs puis réessaie.' };
    if (res.answered > 0) return { emoji: '📚', title: 'À travailler', text: 'Pas de panique : « Mes erreurs » et le mode facile vont t’aider.' };
    return { emoji: '🤷', title: 'Partie abandonnée', text: 'Aucun résultat à enregistrer.' };
  }
})(window);
