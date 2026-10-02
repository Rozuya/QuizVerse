/* ==========================================================================
   QuizVerse — vues personnelles
   Historique · Favoris · Mes erreurs · Mes connaissances
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});
  const U = QV.util;
  const el = U.el;
  const V = (QV.views = QV.views || {});

  /* ======================================================== HISTORIQUE == */

  V.historique = function (params, query) {
    const page = el('div.qv-page-enter');
    let hist = QV.store.loadHistory();
    let filter = (query && query.mode) || 'all';

    page.appendChild(el('div.page-head', null, [
      el('div.page-head__eyebrow', { text: '🕘 HISTORIQUE' }),
      el('div.page-head__row', null, [
        el('div', null, [
          el('h1', { text: 'Mon historique' }),
          el('p.page-head__sub', { text: hist.length + ' partie' + (hist.length > 1 ? 's' : '') + ' enregistrée' + (hist.length > 1 ? 's' : '') + ' dans ce navigateur.' }),
        ]),
        hist.length ? el('button.btn.btn--ghost.btn--sm', {
          type: 'button', text: '🗑️ Tout effacer', onclick: clearAll,
        }) : null,
      ]),
    ]));

    if (!hist.length) {
      page.appendChild(QV.ui.emptyState('🕘', 'Aucune partie pour le moment', 'Lance ton premier quiz : il apparaîtra ici avec son score, son temps et ton XP.',
        el('a.btn.btn--primary', { href: '#/surprise', text: 'Lancer un quiz' })));
      return page;
    }

    const tabs = el('div.tabs', { role: 'tablist' });
    [
      { id: 'all', label: 'Tout' },
      { id: 'quiz', label: 'Quiz' },
      { id: 'daily', label: 'Quiz du jour' },
      { id: 'mistakes', label: 'Mes erreurs' },
      { id: 'custom', label: 'Personnalisés' },
      { id: 'perfect', label: 'Parfaits' },
    ].forEach(function (t) {
      tabs.appendChild(el('button.tab', {
        type: 'button', role: 'tab', 'aria-selected': filter === t.id ? 'true' : 'false', text: t.label,
        onclick: function () {
          const q = Object.assign({}, query || {}, { mode: t.id === 'all' ? '' : t.id });
          location.hash = '#/historique' + (q.mode ? '?mode=' + q.mode : '');
        },
      }));
    });
    page.appendChild(tabs);

    const body = el('div');
    page.appendChild(body);
    render(body, hist, filter);

    function render(host, list, f) {
      host.innerHTML = '';
      let items = list.slice();
      if (f === 'quiz') items = items.filter(function (h) { return h.kind === 'quiz' && !h.quizId; });
      if (f === 'daily') items = items.filter(function (h) { return h.kind === 'daily'; });
      if (f === 'mistakes') items = items.filter(function (h) { return h.kind === 'mistakes'; });
      if (f === 'custom') items = items.filter(function (h) { return h.kind === 'custom' || h.kind === 'weak' || h.kind === 'random'; });
      if (f === 'perfect') items = items.filter(function (h) { return h.perfect; });
      if (!items.length) {
        host.appendChild(QV.ui.emptyState('🔍', 'Aucun résultat dans cette catégorie', 'Change d’onglet pour voir tes autres parties.'));
        return;
      }

      const table = el('table.data');
      table.appendChild(el('thead', null, [el('tr', null, [
        el('th', { text: 'Date' }),
        el('th', { text: 'Quiz' }),
        el('th', { text: 'Catégorie' }),
        el('th', { text: 'Mode' }),
        el('th.num', { text: 'Score' }),
        el('th.num', { text: '%' }),
        el('th.num', { text: 'Temps' }),
        el('th', { text: '' }),
      ])]));

      const tbody = el('tbody');
      items.forEach(function (h) {
        const cat = QV.data.cat(h.cat);
        const canReplay = !!h.quizId && !!QV.data.quiz(h.quizId);
        tbody.appendChild(el('tr', null, [
          el('td', { text: U.dateTime(h.at) }),
          el('td', null, [
            el('strong', { text: (h.emoji || '✨') + ' ' + h.title }),
            el('div.text-xs.text-3', { text: U.timeAgo(h.at) + ' · ' + U.num(h.xp) + ' XP' }),
          ]),
          el('td', { text: cat ? cat.label : (h.subIds && h.subIds.length ? U.unique(h.subIds.map(function (k) { return k.split('/')[1]; })).slice(0, 2).join(', ') : 'Mixte') }),
          el('td', null, [el('span.pill', { text: QV.quiz.mode(h.mode).emoji + ' ' + QV.quiz.mode(h.mode).label })]),
          el('td.num', { text: U.num(h.score) }),
          el('td.num', null, [el('strong', { text: h.pct + ' %', style: { color: h.pct >= 80 ? 'var(--green)' : h.pct >= 50 ? 'var(--yellow)' : 'var(--red)' } })]),
          el('td.num', { text: U.duration(h.time) }),
          el('td', null, [
            el('div.list-item__actions', null, [
              canReplay ? el('button.btn.btn--sm.btn--soft', {
                type: 'button', text: 'Rejouer',
                onclick: function () {
                  QV.app.startQuiz({
                    kind: 'quiz', quizId: h.quizId, title: h.title, emoji: h.emoji,
                    cat: h.cat, sub: h.sub, diff: h.diff, count: h.answered || 10,
                    mode: h.mode, explicitDiff: true, explicitCount: true,
                  });
                },
              }) : null,
              h.wrong > 0 ? el('button.btn.btn--sm.btn--ghost', {
                type: 'button', text: 'Erreurs',
                onclick: function () { location.hash = '#/mes-erreurs'; },
              }) : null,
            ]),
          ]),
        ]));
      });
      table.appendChild(tbody);
      host.appendChild(el('div.table-wrap', null, [table]));

      // Statistiques rapides sur la période affichée
      const best = items.reduce(function (a, h) { return h.pct > a ? h.pct : a; }, 0);
      const avg = items.reduce(function (a, h) { return a + h.pct; }, 0) / items.length;
      host.appendChild(el('div.grid.grid--stats.mt-4', null, [
        QV.ui.stat('Parties', U.num(items.length), 'Dans cette vue', '🎮'),
        QV.ui.stat('Meilleur %', best + '<small>%</small>', 'Record de la sélection', '🏆'),
        QV.ui.stat('Moyenne', Math.round(avg) + '<small>%</small>', 'Sur la sélection', '📊'),
        QV.ui.stat('XP gagnés', U.num(U.sum(items, function (h) { return h.xp; })), 'Cumul de la sélection', '⭐'),
      ]));
    }

    function clearAll() {
      QV.ui.confirm('Effacer tout l’historique ?', 'Cette action est définitive. Tes statistiques et badges seront conservés.', 'Effacer', true)
        .then(function (ok) {
          if (!ok) return;
          QV.store.saveHistory([]);
          QV.ui.toast('Historique effacé', 'Tu peux continuer à jouer normalement.', 'info');
          QV.app.render();
        });
    }

    return page;
  };

  /* ========================================================== FAVORIS == */

  V.favoris = function () {
    const page = el('div.qv-page-enter');
    const favs = QV.store.loadFavorites();
    const favCats = QV.store.loadFavoriteCategories();

    page.appendChild(el('div.page-head', null, [
      el('div.page-head__eyebrow', { text: '⭐ MES FAVORIS' }),
      el('h1', { text: 'Mes favoris' }),
      el('p.page-head__sub', { text: 'Tes quiz et catégories enregistrés en favori, pour y accéder en un clic.' }),
    ]));

    page.appendChild(el('section.section', null, [
      QV.ui.sectionHead('Catégories favorites (' + favCats.length + ')', null, null, '🗂️'),
      favCats.length
        ? el('div.grid.grid--cats', null, favCats.map(function (id) {
          const c = QV.data.cat(id);
          if (!c) return null;
          const st = QV.store.loadStats();
          const rec = (st.byCat || {})[id] || { quizzes: 0, best: 0 };
          return el('div.card', null, [
            el('div.row.row--between', null, [
              el('div.row.row--tight', null, [
                el('span', { text: c.emoji, style: { fontSize: '1.5rem' } }),
                el('strong', { text: c.label }),
              ]),
              el('button.btn.btn--sm.btn--danger', {
                type: 'button', text: 'Retirer',
                onclick: function () { QV.app.toggleFavoriteCategory(id); QV.app.render(); },
              }),
            ]),
            el('div.text-xs.text-3.mt-2', { text: rec.quizzes ? rec.quizzes + ' quiz joués · record ' + rec.best + ' %' : 'Jamais jouée' }),
            el('a.btn.btn--sm.btn--soft.mt-3', { href: '#/categorie/' + encodeURIComponent(id), text: 'Ouvrir la catégorie' }),
          ]);
        }).filter(Boolean))
        : el('p.text-sm.text-3', { text: 'Aucune catégorie favorite. Ajoute-en une depuis la page d’une catégorie.' }),
    ]));

    page.appendChild(el('section.section', null, [
      QV.ui.sectionHead('Quiz favoris (' + favs.length + ')', null, null, '⭐'),
      favs.length
        ? el('div.grid.grid--quiz.qv-stagger', null, favs.map(function (id) { return QV.data.quiz(id); }).filter(Boolean).map(function (q) { return QV.ui.quizCard(q); }))
        : QV.ui.emptyState('☆', 'Aucun quiz favori', 'Clique sur l’étoile d’une carte de quiz pour l’ajouter ici.',
          el('a.btn.btn--primary', { href: '#/explorer', text: 'Explorer les quiz' })),
    ]));

    return page;
  };

  /* ======================================================= MES ERREURS == */

  V.mesErreurs = function (params, query) {
    const page = el('div.qv-page-enter');
    const all = QV.mastery.mistakesList({});
    const active = all.filter(function (x) { return !x.entry.fixed; });
    const fixed = all.filter(function (x) { return x.entry.fixed; });
    let show = (query && query.v === 'corrigees') ? 'fixed' : 'active';
    let catFilter = (query && query.cat) || '';

    page.appendChild(el('div.page-head', null, [
      el('div.page-head__eyebrow', { text: '🔁 MES ERREURS' }),
      el('div.page-head__row', null, [
        el('div', null, [
          el('h1', { text: 'Mes erreurs' }),
          el('p.page-head__sub', { text: active.length + ' question' + (active.length > 1 ? 's' : '') + ' à retravailler · ' + fixed.length + ' corrigée' + (fixed.length > 1 ? 's' : '') + '.' }),
        ]),
        active.length >= 3 ? el('div.btn-row', null, [
          el('button.btn.btn--primary', {
            type: 'button', text: '▶ Rejouer mes erreurs',
            onclick: function () {
              QV.app.startQuiz({ kind: 'mistakes', diff: 'mixte', count: Math.min(30, active.length), mode: 'classique', title: 'Mes erreurs', emoji: '🔁', color: '#fb7185' });
            },
          }),
        ]) : null,
      ]),
    ]));

    if (!all.length) {
      page.appendChild(QV.ui.emptyState('🎯', 'Aucune erreur enregistrée', 'Chaque question que tu rates est automatiquement sauvegardée ici. Rejoue-les pour ancrer tes acquis.',
        el('a.btn.btn--primary', { href: '#/surprise', text: 'Lancer un quiz' })));
      return page;
    }

    const tabs = el('div.tabs', { role: 'tablist' });
    [
      { id: 'active', label: 'À retravailler (' + active.length + ')' },
      { id: 'fixed', label: 'Corrigées (' + fixed.length + ')' },
    ].forEach(function (t) {
      tabs.appendChild(el('button.tab', {
        type: 'button', role: 'tab', 'aria-selected': show === t.id ? 'true' : 'false', text: t.label,
        onclick: function () {
          location.hash = '#/mes-erreurs' + (t.id === 'fixed' ? '?v=corrigees' : '');
        },
      }));
    });
    page.appendChild(tabs);

    // Filtre catégorie
    const cats = U.unique(all.map(function (x) { return x.question.cat; }));
    if (cats.length > 1) {
      const chips = el('div.filters');
      const g = el('div.filters__group');
      g.appendChild(el('span.filters__label', { text: 'Catégorie' }));
      g.appendChild(el('button.chip.chip--sm', {
        type: 'button', 'aria-pressed': catFilter ? 'false' : 'true', text: 'Toutes',
        onclick: function () { go(''); },
      }));
      cats.forEach(function (cid) {
        const c = QV.data.cat(cid);
        g.appendChild(el('button.chip.chip--sm', {
          type: 'button', 'aria-pressed': catFilter === cid ? 'true' : 'false', text: (c ? c.emoji + ' ' + c.label : cid),
          onclick: function () { go(cid); },
        }));
      });
      chips.appendChild(g);
      page.appendChild(chips);
    }

    function go(cid) {
      const q = [];
      if (show === 'fixed') q.push('v=corrigees');
      if (cid) q.push('cat=' + encodeURIComponent(cid));
      location.hash = '#/mes-erreurs' + (q.length ? '?' + q.join('&') : '');
    }

    const list = (show === 'fixed' ? fixed : active).filter(function (x) { return !catFilter || x.question.cat === catFilter; });

    if (!list.length) {
      page.appendChild(QV.ui.emptyState('✅', show === 'fixed' ? 'Aucune question corrigée' : 'Aucune erreur à retravailler', 'Continue à jouer pour alimenter cette liste.'));
      return page;
    }

    const listNode = el('div.stack.stack-3');
    list.slice(0, 120).forEach(function (item) {
      const q = item.question;
      const cat = QV.data.cat(q.cat);
      const sub = QV.data.sub(q.cat, q.sub);
      const lvl = QV.mastery.levelOf(QV.mastery.get(q.id));
      const m = QV.mastery.meta(lvl);
      listNode.appendChild(el('div.card', null, [
        el('div.row.row--between.mb-2', null, [
          el('div.row.row--tight', null, [
            el('span.pill', { text: cat ? cat.emoji + ' ' + cat.label : q.cat }),
            el('span.pill', { text: (sub ? sub.label : q.sub) }),
            QV.ui.diffBadge(q.diff),
          ]),
          el('span.mastery-dot.' + lvl, { text: m.emoji + ' ' + m.label }),
        ]),
        el('h4.mb-2', { text: q.text }),
        el('div.row.row--tight.mb-2', null, [
          el('span.text-sm', { html: '<strong style="color:var(--green)">Bonne réponse :</strong> ' + U.esc(q.answers[QV.quiz.correctIndexes(q)[0]]) }),
        ]),
        item.entry.chosen && item.entry.chosen.length ? el('div.text-sm.text-3', { html: '<strong>Tes erreurs :</strong> ' + U.esc(item.entry.chosen.map(function (i) { return q.answers[i]; }).join(' · ')) }) : null,
        q.explanation ? el('p.text-sm.text-2.mt-2.mb-0', { text: 'Pourquoi : ' + q.explanation }) : null,
        q.tags && q.tags.length ? el('div.row.row--tight.mt-2', null, q.tags.slice(0, 5).map(function (t) { return el('span.tag', { text: '#' + t }); })) : null,
        QV.ui.sourcesNode(q, { compact: true }),
        el('div.row.row--between.mt-3', null, [
          el('span.text-xs.text-3', { text: 'Raté ' + item.entry.times + ' fois · ' + U.timeAgo(item.entry.last) + (item.entry.fixed ? ' · corrigée' : '') }),
          el('button.btn.btn--sm.btn--soft', {
            type: 'button', text: '🔁 Rejouer cette question',
            onclick: function () {
              QV.app.startQuiz({
                kind: 'custom', cats: [q.cat], subs: [q.cat + '/' + q.sub], diff: 'mixte', count: 1,
                only: [q.id], mode: 'classique', title: 'Question ciblée', emoji: '🎯',
              });
            },
          }),
        ]),
      ]));
    });
    page.appendChild(listNode);
    if (list.length > 120) page.appendChild(el('p.text-xs.text-3.text-center.mt-3', { text: 'Affichage limité aux 120 premières questions.' }));

    return page;
  };

  /* ================================================== MES CONNAISSANCES == */

  V.mesConnaissances = function (params, query) {
    const page = el('div.qv-main.qv-page-enter');
    const sum = QV.mastery.summary();
    let level = (query && query.lvl) || 'all';
    let cat = (query && query.cat) || '';
    let sub = (query && query.sub) || '';
    let search = '';

    page.appendChild(el('div.page-head', null, [
      el('div.page-head__eyebrow', { text: '🧠 MES CONNAISSANCES' }),
      el('h1', { text: 'Mes connaissances' }),
      el('p.page-head__sub', { text: 'Chaque question a un niveau de maîtrise qui évolue avec tes réponses. Vert et bleu = acquises. Rouge et orange = à retravailler.' }),
    ]));

    // Synthèse
    const panel = el('div.panel.mb-4', null, [
      el('div.row.row--between.mb-3', null, [
        el('strong', { text: 'Base de connaissances QuizVerse' }),
        el('span.pill.pill--accent', { text: U.pct(sum.progress) }),
      ]),
      el('div.bar.bar--lg', null, [el('i.bar__fill', { style: { width: sum.progress + '%' } })]),
      el('div.row.row--tight.mt-3', null, QV.mastery.LEVELS.filter(function (l) { return l.id !== 'm-new'; }).map(function (l) {
        return el('span.pill', { text: l.emoji + ' ' + l.label + ' : ' + U.num(sum.counts[l.id] || 0) });
      })),
      el('div.row.row--tight.mt-2', null, [
        el('span.text-xs.text-3', { text: U.num(sum.seen) + ' questions déjà vues sur ' + U.num(sum.total) + ' · ' + U.num(sum.known) + ' connues · ' + U.num(sum.solid) + ' maîtrisées.' }),
      ]),
    ]);
    page.appendChild(panel);

    // Actions rapides
    const weakCount = (sum.counts['m-never'] || 0) + (sum.counts['m-learning'] || 0);
    page.appendChild(el('div.btn-row.mb-4', null, [
      el('button.btn.btn--primary', {
        type: 'button', text: '🎯 Quiz sur mes lacunes',
        disabled: weakCount < 2,
        onclick: function () {
          QV.app.startQuiz({ kind: 'weak', diff: 'mixte', count: Math.min(30, weakCount), mode: 'classique', title: 'Mes connaissances à consolider', emoji: '🧠' });
        },
      }),
      el('button.btn.btn--ghost', {
        type: 'button', text: '🔁 Rejouer mes erreurs',
        disabled: QV.mastery.mistakesList({ includeFixed: false }).length < 2,
        onclick: function () {
          QV.app.startQuiz({ kind: 'mistakes', diff: 'mixte', count: 20, mode: 'classique', title: 'Mes erreurs', emoji: '🔁' });
        },
      }),
      el('a.btn.btn--ghost', { href: '#/creer-mon-quiz', text: '🏗️ Créer mon quiz' }),
    ]));

    // Filtres
    const filters = el('div.filters');
    const lvlGroup = el('div.filters__group');
    lvlGroup.appendChild(el('span.filters__label', { text: 'Niveau' }));
    [{ id: 'all', e: '🌐', l: 'Tous' }].concat(QV.mastery.LEVELS.map(function (l) { return { id: l.id, e: l.emoji, l: l.label }; }))
      .forEach(function (l) {
        lvlGroup.appendChild(el('button.chip.chip--sm', {
          type: 'button', 'aria-pressed': level === l.id ? 'true' : 'false', text: l.e + ' ' + l.l,
          onclick: function () { go({ lvl: l.id === 'all' ? '' : l.id }); },
        }));
      });
    filters.appendChild(lvlGroup);

    const catGroup = el('div.filters__group');
    catGroup.appendChild(el('span.filters__label', { text: 'Catégorie' }));
    catGroup.appendChild(el('button.chip.chip--sm', {
      type: 'button', 'aria-pressed': cat ? 'false' : 'true', text: 'Toutes',
      onclick: function () { go({ cat: '', sub: '' }); },
    }));
    QV.data.categories.forEach(function (c) {
      catGroup.appendChild(el('button.chip.chip--sm', {
        type: 'button', 'aria-pressed': cat === c.id ? 'true' : 'false', text: c.emoji + ' ' + c.label,
        onclick: function () { go({ cat: c.id, sub: '' }); },
      }));
    });
    filters.appendChild(catGroup);

    filters.appendChild(el('div.searchbox', { style: { flexBasis: '190px', marginLeft: 'auto' } }, [
      el('span.searchbox__icon', { text: '⌕' }),
      el('input.input#k-search', { type: 'search', placeholder: 'Filtrer par texte…', 'aria-label': 'Filtrer les questions' }),
    ]));
    page.appendChild(filters);

    function go(patch) {
      const q = Object.assign({ lvl: level, cat: cat, sub: sub }, patch);
      const parts = [];
      if (q.lvl && q.lvl !== 'all') parts.push('lvl=' + q.lvl);
      if (q.cat) parts.push('cat=' + encodeURIComponent(q.cat));
      if (q.sub) parts.push('sub=' + encodeURIComponent(q.sub));
      location.hash = '#/mes-connaissances' + (parts.length ? '?' + parts.join('&') : '');
    }

    const body = el('div');
    page.appendChild(body);

    function render() {
      body.innerHTML = '';
      const f = { cat: cat, sub: sub, diff: (query && query.diff) || '' };
      let questions;
      if (level === 'all') {
        questions = QV.data.questions.filter(function (q) {
          if (f.cat && q.cat !== f.cat) return false;
          if (f.sub && q.cat + '/' + q.sub !== f.sub) return false;
          return true;
        });
      } else {
        questions = QV.mastery.questionsByLevel(level, f);
      }
      if (search) {
        const n = U.norm(search);
        questions = questions.filter(function (q) {
          return U.norm(q.text).indexOf(n) >= 0 || (q.tags || []).some(function (t) { return U.norm(t).indexOf(n) >= 0; });
        });
      }

      if (!questions.length) {
        body.appendChild(QV.ui.emptyState('🧠', 'Aucune question dans cette sélection', 'Change de niveau de maîtrise ou de catégorie.'));
        return;
      }

      body.appendChild(el('p.text-sm.text-3.mb-3', { text: U.num(questions.length) + ' question' + (questions.length > 1 ? 's' : '') }));

      const table = el('table.data');
      table.appendChild(el('thead', null, [el('tr', null, [
        el('th', { text: 'Question' }),
        el('th', { text: 'Univers' }),
        el('th', { text: 'Difficulté' }),
        el('th.num', { text: 'Tentatives' }),
        el('th', { text: 'Maîtrise' }),
      ])]));
      const tbody = el('tbody');
      questions.slice(0, 200).forEach(function (q) {
        const rec = QV.mastery.get(q.id);
        const lvlId = QV.mastery.levelOf(rec);
        const m = QV.mastery.meta(lvlId);
        const sub = QV.data.sub(q.cat, q.sub);
        tbody.appendChild(el('tr', null, [
          el('td', { text: q.text, style: { maxWidth: '420px' } }),
          el('td', { text: sub ? sub.label : q.sub }),
          el('td', null, [QV.ui.diffBadge(q.diff)]),
          el('td.num', { text: rec ? rec.attempts + ' (' + rec.correct + '✅)' : '—' }),
          el('td', null, [el('span.mastery-dot.' + lvlId, { text: m.emoji + ' ' + m.label })]),
        ]));
      });
      table.appendChild(tbody);
      body.appendChild(el('div.table-wrap', null, [table]));
      if (questions.length > 200) body.appendChild(el('p.text-xs.text-3.text-center.mt-3', { text: 'Affichage limité aux 200 premières questions.' }));
    }

    page.querySelector('#k-search').addEventListener('input', U.debounce(function (e) {
      search = e.target.value;
      render();
    }, 200));

    render();
    return page;
  };
})(window);
