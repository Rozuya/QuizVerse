/* ==========================================================================
   QuizVerse — vues principales
   Accueil · Explorer · Catégories · Catégorie · Recherche · Aide · Crédits
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});
  const U = QV.util;
  const el = U.el;
  const V = (QV.views = QV.views || {});

  /* ========================================================== ACCUEIL == */

  V.home = function () {
    const p = QV.xp.profile();
    const st = QV.store.loadStats();
    const lvl = QV.xp.levelInfo(p.xp);
    const totalQ = QV.data.questions.length;
    const totalCats = QV.data.categories.length;
    const totalSubs = U.sum(QV.data.categories, function (c) { return (c.subs || []).length; });
    const daily = QV.daily.meta();
    const favs = QV.store.loadFavorites();
    const favCats = QV.store.loadFavoriteCategories();
    const hist = QV.store.loadHistory();

    const page = el('div.qv-page-enter');

    /* ---- Hero ---- */
    const hero = el('section.hero', null, [
      el('div.hero__grid', null, [
        el('div', null, [
          el('div.page-head__eyebrow', { text: '⚡ Plateforme de quiz 100 % solo' }),
          el('h1.hero__title', null, [
            document.createTextNode('TESTE TES '),
            el('span.line2.grad-text', { text: 'CONNAISSANCES.' }),
          ]),
          el('p.hero__sub', { text: 'Des milliers de questions. Des centaines d’univers. Joue, progresse et découvre jusqu’où tu peux aller.' }),
          el('div.hero__cta', null, [
            el('a.btn.btn--primary.btn--lg', { href: '#/surprise', text: '▶ Commencer un quiz' }),
            el('a.btn.btn--ghost.btn--lg', { href: '#/aleatoire', text: '🎲 Quiz aléatoire' }),
          ]),
          el('div.hero__stats', null, [
            el('div.hero__stat', null, [el('b', { text: U.num(totalQ) }), el('span', { text: 'Questions' })]),
            el('div.hero__stat', null, [el('b', { text: String(totalCats) }), el('span', { text: 'Catégories' })]),
            el('div.hero__stat', null, [el('b', { text: String(totalSubs) }), el('span', { text: 'Univers' })]),
            el('div.hero__stat', null, [el('b', { text: String(QV.data.quizzes.length) }), el('span', { text: 'Quiz' })]),
          ]),
        ]),
        el('div.hero__art', { 'aria-hidden': 'true' }, QV.data.categories.slice(0, 9).map(function (c) {
          return el('button.hero__tile', {
            type: 'button',
            title: c.label,
            style: { '--tile-color': c.color },
            onclick: function () { location.hash = '#/categorie/' + encodeURIComponent(c.id); },
          }, [
            el('span.hero__tile__art', { html: QV.art.catArt(c) }),
            el('span.hero__tile__emoji', { text: c.emoji }),
          ]);
        })),
      ]),
    ]);
    page.appendChild(hero);

    /* ---- Bandeau du joueur ---- */
    if (st.quizzes > 0) {
      const badges = Object.keys(QV.store.loadBadges()).length;
      const acc = st.questions ? Math.round((st.correct / st.questions) * 100) : 0;
      page.appendChild(el('section.section', null, [
        el('div.home-strip', null, [
          miniStat('🎮', U.num(st.quizzes), 'Quiz joués', '#/historique'),
          miniStat('🎯', acc + '%', 'Réussite', '#/statistiques'),
          miniStat('🔥', U.num(st.bestStreak), 'Meilleure série', '#/statistiques'),
          miniStat('🏅', U.num(badges), 'Badges', '#/badges'),
          miniStat('⚡', U.num(lvl.into) + '/' + U.num(lvl.need), 'XP niveau ' + lvl.level, '#/profil'),
        ]),
      ]));
    }

    /* ---- Accès rapides ---- */
    page.appendChild(el('section.section', null, [
      el('div.quick-grid', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(190px,100%), 1fr))', gap: '10px' } }, [
        quickCard('🎯', 'Quiz aléatoire', 'Mélange tout', '#/aleatoire'),
        quickCard('🎁', 'Surprends-moi', 'QuizVerse choisit', '#/surprise'),
        quickCard('📅', 'Quiz du jour', daily && daily.played ? 'Déjà joué' : 'Nouveau chaque jour', '#/quiz-du-jour'),
        quickCard('🔁', 'Mes erreurs', 'Retravailler mes échecs', '#/mes-erreurs'),
        quickCard('🧠', 'Mes connaissances', 'Suivi de la maîtrise', '#/mes-connaissances'),
        quickCard('🎯', 'Défis', QV.challenges.pendingCount() + ' à réclamer', '#/defis'),
        quickCard('🏗️', 'Créer mon quiz', 'Choisis tout', '#/creer-mon-quiz'),
        quickCard('⭐', 'Mes favoris', favs.length + ' quiz', '#/favoris'),
      ]),
    ]));

    /* ---- Catégories ---- */
    const catSection = el('section.section', null, [
      QV.ui.sectionHead('Explorer par univers', '#/categories', 'Toutes les catégories', '🗂️'),
      el('div.grid.grid--cats.qv-stagger', null, QV.data.categories.map(function (c) { return QV.ui.catCard(c); })),
    ]);
    page.appendChild(catSection);

    /* ---- Bandeau marquee ---- */
    const subs = [];
    QV.data.categories.forEach(function (c) {
      QV.data.subsOf(c.id).forEach(function (s) { subs.push(s.label); });
    });
    if (subs.length) {
      const track = el('div.marquee__track', { 'aria-hidden': 'true' });
      const line = subs.concat(subs).join(' ✦ ');
      track.appendChild(el('div.marquee__item', { text: line }));
      page.appendChild(el('section.section', { style: { marginBottom: '18px' } }, [el('div.marquee', null, [track])]));
    }

    /* ---- Quiz du jour ---- */
    if (daily) {
      const done = !!daily.played;
      page.appendChild(el('section.section', null, [
        el('div.cta-panel', null, [
          el('div.page-head__eyebrow', { text: '📅 QUIZ DU JOUR', style: { justifyContent: 'center' } }),
          el('h2.cta-panel__title', { text: done ? 'Tu as déjà joué aujourd’hui' : 'Un nouveau quiz t’attend' }),
          el('p.cta-panel__text', {
            text: 'Questions : ' + daily.count + ' · Difficulté : ' + QV.data.DIFF_LABEL[daily.difficulty] +
              ' · Récompense : ' + U.num(daily.rewardXp) + ' XP · ' + daily.categoryLabels.join(', '),
          }),
          el('div.btn-row.btn-row--center', null, [
            el('a.btn.btn--primary', { href: '#/quiz-du-jour', text: done ? 'Rejouer le quiz du jour' : 'Jouer au quiz du jour' }),
            daily.record ? el('a.btn.btn--ghost', { href: '#/historique', text: 'Mon résultat : ' + daily.record.pct + ' %' }) : null,
          ]),
        ]),
      ]));
    }

    /* ---- Recommandations ---- */
    const recos = QV.recommend.build(6);
    if (recos.length) {
      page.appendChild(el('section.section', null, [
        QV.ui.sectionHead('Pour toi', '#/statistiques', 'Mes statistiques', '✨'),
        el('div.grid.grid--3', null, recos.map(function (r) {
          return el('a.card.card--hover', { href: r.href, style: { display: 'block' } }, [
            el('div.row.row--tight.mb-2', null, [el('span', { text: r.icon, style: { fontSize: '1.4rem' } })]),
            el('h4.mb-0', { text: r.title }),
            el('p.text-sm.text-2.mb-0.mt-2', { text: r.text }),
          ]);
        })),
      ]));
    }

    /* ---- Reprendre ---- */
    const recent = hist.slice(0, 6);
    if (recent.length) {
      page.appendChild(el('section.section', null, [
        QV.ui.sectionHead('Reprendre une partie', '#/historique', 'Tout l’historique', '⏪'),
        el('div.grid.grid--quiz', null, recent.filter(function (h) { return h.quizId && QV.data.quiz(h.quizId); }).slice(0, 4).map(function (h) {
          const q = QV.data.quiz(h.quizId);
          const card = QV.ui.quizCard(q);
          card.querySelector('.quiz-card__foot').firstChild.textContent = h.pct + ' % · ' + U.timeAgo(h.at);
          return card;
        })),
      ]));
    }

    /* ---- Sélection du jour ---- */
    const picks = featured();
    page.appendChild(el('section.section', null, [
      QV.ui.sectionHead('Sélection du jour', '#/explorer', 'Explorer', '🔥'),
      el('div.grid.grid--quiz.qv-stagger', null, picks.map(function (q) { return QV.ui.quizCard(q); })),
    ]));

    /* ---- Badges ---- */
    const owned = QV.store.loadBadges();
    const recentBadges = Object.keys(owned).map(function (id) { return owned[id]; })
      .sort(function (a, b) { return b.at - a.at; }).slice(0, 8);
    if (recentBadges.length) {
      page.appendChild(el('section.section', null, [
        QV.ui.sectionHead('Derniers badges', '#/badges', 'Tous les badges', '🏅'),
        el('div.grid.grid--badges', null, recentBadges.map(function (b) {
          return el('a.badge-tile.is-unlocked', { href: '#/badges' }, [
            el('span.badge-tile__icon', { text: b.icon || '🏅' }),
            el('span.badge-tile__name', { text: b.name }),
            el('span.badge-tile__date', { text: U.timeAgo(b.at) }),
          ]);
        })),
      ]));
    }

    /* ---- CTA final ---- */
    page.appendChild(el('section.section', null, [
      el('div.cta-panel', null, [
        el('h2.cta-panel__title', { text: 'Prêt à monter en puissance ?' }),
        el('p.cta-panel__text', { text: 'Ton profil, tes statistiques, tes badges et tout ton historique sont sauvegardés uniquement dans ton navigateur. Aucune connexion, aucun compte, aucune donnée envoyée.' }),
        el('div.btn-row.btn-row--center', null, [
          el('a.btn.btn--primary', { href: '#/surprise', text: 'Lancer un quiz' }),
          el('a.btn.btn--ghost', { href: '#/creer-mon-quiz', text: 'Créer mon quiz' }),
        ]),
      ]),
    ]));

    return page;
  };

  function miniStat(icon, value, label, href) {
    return el('a.mini-stat', { href: href, style: { color: 'inherit' } }, [
      el('span.mini-stat__icon', { text: icon, 'aria-hidden': 'true' }),
      el('div', null, [el('div.mini-stat__v', { text: String(value) }), el('div.mini-stat__l', { text: label })]),
    ]);
  }

  function quickCard(icon, title, sub, href) {
    return el('a.card.card--hover.quick-card', {
      href: href,
      style: { display: 'flex', gap: '12px', alignItems: 'center', padding: '14px 16px' },
    }, [
      el('div', { text: icon, style: { fontSize: '1.5rem' }, 'aria-hidden': 'true' }),
      el('div', null, [el('div', { text: title, style: { fontWeight: '700', fontSize: '.9rem' } }), el('div.text-xs.text-3', { text: sub })]),
    ]);
  }

  function featured() {
    const st = QV.store.loadStats();
    const quizzes = QV.data.quizzes.slice();
    const played = st.byCat || {};
    // On privilégie les catégories peu jouées puis on mélange
    const scored = quizzes.map(function (q) {
      const c = played[q.cat] || { quizzes: 0 };
      return { q: q, s: (10 - Math.min(9, c.quizzes)) + (q.diff === 'moyen' ? 3 : 0) + Math.random() * 4 };
    });
    scored.sort(function (a, b) { return b.s - a.s; });
    return U.pick(scored.slice(0, 40), 8).map(function (x) { return x.q; });
  }

  /* ======================================================== EXPLORER == */

  const EXPLORE_TABS = [
    { id: 'populaires', label: 'Populaires', emoji: '🔥' },
    { id: 'nouveaux', label: 'Nouveaux', emoji: '✨' },
    { id: 'rapides', label: 'Rapides', emoji: '⚡' },
    { id: 'difficiles', label: 'Difficiles', emoji: '🧠' },
    { id: 'experts', label: 'Experts', emoji: '🔴' },
    { id: 'aleatoires', label: 'Aléatoires', emoji: '🎲' },
    { id: 'favoris', label: 'Favoris', emoji: '⭐' },
    { id: 'reprendre', label: 'Reprendre', emoji: '⏪' },
    { id: 'reco', label: 'Pour toi', emoji: '✨' },
  ];

  V.explorer = function (params, query) {
    const tab = (query && query.tab && EXPLORE_TABS.some(function (t) { return t.id === query.tab; })) ? query.tab : 'populaires';
    const cat = (query && query.cat) || '';
    const diff = (query && query.diff) || '';
    const page = el('div.qv-page-enter');

    page.appendChild(el('div.page-head', null, [
      el('div.page-head__eyebrow', { text: '🧭 EXPLORER' }),
      el('h1', { text: 'Explorer' }),
      el('p.page-head__sub', { text: 'Parcours tous les quiz de QuizVerse : populaires, rapides, difficiles, experts, aléatoires, tes favoris et tes recommandations.' }),
    ]));

    const tabsBar = el('div.tabs', { role: 'tablist' });
    EXPLORE_TABS.forEach(function (t) {
      const b = el('button.tab', {
        type: 'button', role: 'tab', 'aria-selected': t.id === tab ? 'true' : 'false',
        text: t.emoji + ' ' + t.label,
        onclick: function () { setQuery({ tab: t.id }); },
      });
      tabsBar.appendChild(b);
    });
    page.appendChild(tabsBar);

    // Filtres
    const filters = el('div.filters');
    const catWrap = el('div.filters__group');
    catWrap.appendChild(el('span.filters__label', { text: 'Catégorie' }));
    const allChip = el('button.chip.chip--sm', {
      type: 'button', 'aria-pressed': cat ? 'false' : 'true', text: 'Toutes',
      onclick: function () { setQuery({ cat: '' }); },
    });
    catWrap.appendChild(allChip);
    QV.data.categories.forEach(function (c) {
      catWrap.appendChild(el('button.chip.chip--sm', {
        type: 'button', 'aria-pressed': cat === c.id ? 'true' : 'false', text: c.emoji + ' ' + c.label,
        onclick: function () { setQuery({ cat: c.id }); },
      }));
    });
    filters.appendChild(catWrap);

    const diffWrap = el('div.filters__group');
    diffWrap.appendChild(el('span.filters__label', { text: 'Difficulté' }));
    diffWrap.appendChild(el('button.chip.chip--sm', {
      type: 'button', 'aria-pressed': diff ? 'false' : 'true', text: 'Toutes',
      onclick: function () { setQuery({ diff: '' }); },
    }));
    ['facile', 'moyen', 'difficile', 'expert'].forEach(function (d) {
      diffWrap.appendChild(el('button.chip.chip--sm', {
        type: 'button', 'aria-pressed': diff === d ? 'true' : 'false',
        text: QV.data.DIFF_EMOJI[d] + ' ' + QV.data.DIFF_LABEL[d],
        onclick: function () { setQuery({ diff: d }); },
      }));
    });
    filters.appendChild(diffWrap);
    page.appendChild(filters);

    function setQuery(patch) {
      const q = Object.assign({}, query || {}, patch);
      const keys = Object.keys(q).filter(function (k) { return q[k]; });
      location.hash = '#/explorer' + (keys.length ? '?' + keys.map(function (k) { return k + '=' + encodeURIComponent(q[k]); }).join('&') : '');
    }

    const body = el('div');
    page.appendChild(body);
    renderTab(body, tab, cat, diff);
    return page;
  };

  function renderTab(body, tab, cat, diff) {
    body.innerHTML = '';
    let list = QV.data.quizzes.slice();

    if (cat) list = list.filter(function (q) { return q.cat === cat || q.cat === '*'; });
    if (diff) list = list.filter(function (q) { return q.diff === diff; });

    const st = QV.store.loadStats();

    switch (tab) {
      case 'populaires': {
        const scored = list.map(function (q) {
          const c = (st.byCat || {})[q.cat] || { quizzes: 0 };
          return { q: q, s: c.quizzes * 10 + (q.type === 'sub' ? 3 : 0) };
        });
        scored.sort(function (a, b) { return b.s - a.s; });
        list = scored.slice(0, 24).map(function (x) { return x.q; });
        break;
      }
      case 'nouveaux':
        list = U.shuffle(list).slice(0, 24);
        break;
      case 'rapides':
        list = U.shuffle(list.filter(function (q) { return q.diff === 'facile' || q.diff === 'moyen'; })).slice(0, 24);
        break;
      case 'difficiles':
        list = list.filter(function (q) { return q.diff === 'difficile'; });
        break;
      case 'experts':
        list = list.filter(function (q) { return q.diff === 'expert'; });
        break;
      case 'aleatoires':
        list = U.shuffle(list).slice(0, 24);
        break;
      case 'favoris': {
        const favs = QV.store.loadFavorites();
        list = favs.map(function (id) { return QV.data.quiz(id); }).filter(Boolean);
        if (cat) list = list.filter(function (q) { return q.cat === cat; });
        if (diff) list = list.filter(function (q) { return q.diff === diff; });
        break;
      }
      case 'reprendre': {
        const hist = QV.store.loadHistory().filter(function (h) { return h.quizId; });
        const ids = U.unique(hist.map(function (h) { return h.quizId; }));
        list = ids.map(function (id) { return QV.data.quiz(id); }).filter(Boolean);
        if (cat) list = list.filter(function (q) { return q.cat === cat; });
        break;
      }
      case 'reco': {
        const recos = QV.recommend.build(10);
        const ids = recos.map(function (r) {
          const m = /#\/quiz\/(.+)$/.exec(r.href || '');
          return m ? decodeURIComponent(m[1]) : null;
        }).filter(Boolean);
        list = U.unique(ids).map(function (id) { return QV.data.quiz(id); }).filter(Boolean);
        break;
      }
    }

    if (!list.length) {
      body.appendChild(QV.ui.emptyState(
        tab === 'favoris' ? '⭐' : '🔍',
        tab === 'favoris' ? 'Aucun favori pour le moment' : 'Aucun quiz ne correspond',
        tab === 'favoris' ? 'Ajoute des quiz en favori avec l’étoile sur les cartes pour les retrouver ici.' : 'Essaie de changer de catégorie ou de difficulté.',
        el('a.btn.btn--primary', { href: '#/explorer', text: 'Voir tous les quiz' })
      ));
      return;
    }

    body.appendChild(el('p.text-sm.text-3.mb-3', { text: list.length + ' quiz affiché' + (list.length > 1 ? 's' : '') + ' · ' + catLabel(cat) }));
    body.appendChild(el('div.grid.grid--quiz.qv-stagger', null, list.map(function (q) { return QV.ui.quizCard(q); })));
  }

  function catLabel(cat) {
    if (!cat) return 'toutes catégories';
    if (cat === '*') return 'toutes catégories';
    const c = QV.data.cat(cat);
    return c ? c.label : cat;
  }

  /* ====================================================== CATÉGORIES == */

  V.categories = function () {
    const page = el('div.qv-page-enter');
    const totalQ = QV.data.questions.length;

    page.appendChild(el('div.page-head', null, [
      el('div.page-head__eyebrow', { text: '🗂️ CATÉGORIES' }),
      el('div.page-head__row', null, [
        el('div', null, [
          el('h1', { text: 'Toutes les catégories' }),
          el('p.page-head__sub', { text: U.num(totalQ) + ' questions réparties sur ' + QV.data.categories.length + ' grandes catégories et leurs univers.' }),
        ]),
        el('div.searchbox', { style: { flexBasis: '260px' } }, [
          el('span.searchbox__icon', { text: '⌕', 'aria-hidden': 'true' }),
          el('input.input#cat-search', { type: 'search', placeholder: 'Filtrer les catégories…', 'aria-label': 'Filtrer les catégories' }),
        ]),
      ]),
    ]));

    const grid = el('div.grid.grid--cats.qv-stagger');
    const cards = [];
    QV.data.categories.forEach(function (c) {
      const node = QV.ui.catCard(c);
      cards.push({ node: node, label: U.norm(c.label) });
      grid.appendChild(node);
    });
    page.appendChild(grid);

    const favCats = QV.store.loadFavoriteCategories();
    if (favCats.length) {
      page.appendChild(el('section.section.mt-6', null, [
        QV.ui.sectionHead('Mes catégories favorites', '#/favoris', 'Mes favoris', '⭐'),
        el('div.row', null, favCats.map(function (id) {
          const c = QV.data.cat(id);
          if (!c) return null;
          return el('a.pill.pill--accent', { href: '#/categorie/' + encodeURIComponent(id) }, [
            el('span', { text: c.emoji }), document.createTextNode(c.label),
          ]);
        }).filter(Boolean)),
      ]));
    }

    const input = page.querySelector('#cat-search');
    input.addEventListener('input', function () {
      const v = U.norm(input.value);
      cards.forEach(function (c) {
        c.node.style.display = !v || c.label.indexOf(v) >= 0 ? '' : 'none';
      });
    });

    return page;
  };

  /* ====================================================== CATÉGORIE === */

  V.categorie = function (params) {
    const cat = QV.data.cat(params.id);
    const page = el('div.qv-page-enter');
    if (!cat) {
      page.appendChild(QV.ui.emptyState('❓', 'Catégorie introuvable', 'Cette catégorie n’existe pas ou a été supprimée.', el('a.btn.btn--primary', { href: '#/categories', text: 'Voir les catégories' })));
      return page;
    }

    const st = QV.store.loadStats();
    const prog = QV.xp.catProgress(cat.id);
    const sum = QV.mastery.catSummary(cat.id);
    const subs = QV.data.subsOf(cat.id);
    const favCats = QV.store.loadFavoriteCategories();
    const isFav = favCats.indexOf(cat.id) >= 0;
    const quizzes = QV.data.quizzesOf(cat.id);

    page.appendChild(el('div.page-head', null, [
      el('a.section__link', { href: '#/categories', text: '← Toutes les catégories' }),
    ]));

    page.appendChild(el('section.cat-banner', {
      style: { '--cat-color': cat.color },
    }, [
      el('span.cat-banner__art', { html: QV.art.catArt(cat, { className: 'cat-art--banner' }) }),
      el('div.cat-banner__inner', null, [
        el('div.cat-banner__emoji', { text: cat.emoji, 'aria-hidden': 'true' }),
        el('div.grow', { style: { minWidth: '240px' } }, [
          el('h1.cat-banner__title', { text: cat.label }),
          el('p.cat-banner__sub', {
            text: subs.length + ' univers · ' + prog.pool + ' questions' + (prog.quizzes ? ' · ' + prog.quizzes + ' quiz joués' : ''),
          }),
        ]),
        el('div.btn-row', null, [
          el('button.btn.btn--ghost.btn--sm', {
            type: 'button',
            text: isFav ? '★ Favori' : '☆ Favori',
            onclick: function () { QV.app.toggleFavoriteCategory(cat.id); QV.app.render(); },
          }),
          el('a.btn.btn--primary', { href: '#/creer-mon-quiz?cat=' + cat.id, text: 'Créer un quiz ici' }),
        ]),
      ]),
    ]));

    // Statistiques de progression façon « DRAGON BALL »
    page.appendChild(el('section.section', null, [
      el('div.grid.grid--stats', null, [
        QV.ui.stat('Questions maîtrisées', U.num(sum.perfect + sum.mastered) + '<small> / ' + U.num(prog.pool) + '</small>', '🔵🟢 parfaites + maîtrisées', '🧠'),
        QV.ui.stat('Taux de réussite', prog.accuracy ? U.pct(prog.accuracy) : '—', prog.answered + ' questions répondues', '🎯'),
        QV.ui.stat('Meilleur score', prog.best ? prog.best + '<small>%</small>' : '—', 'Sur ' + cat.label, '🏆'),
        QV.ui.stat('Maîtrise', prog.mastery ? U.pct(prog.mastery, 0) : '0<small>%</small>', 'Part de la base acquise', '📚'),
        QV.ui.stat('Quiz joués', U.num(prog.quizzes), 'Dans cette catégorie', '🎮'),
        QV.ui.stat('Jamais réussies', U.num(sum.never), 'À retravailler', '🔴'),
      ]),
    ]));

    // Barre de maîtrise globale
    const bar = el('div.panel', null, [
      el('div.row.row--between.mb-3', null, [
        el('strong', { text: 'Progression sur ' + cat.label }),
        el('span.pill.pill--accent', { text: U.pct(prog.mastery) }),
      ]),
      el('div.stack.stack-2', null, [
        masteryBar('🔵 Parfectes', sum.perfect, prog.pool, 'var(--cyan)'),
        masteryBar('🟢 Maîtrisées', sum.mastered, prog.pool, 'var(--green)'),
        masteryBar('🟡 Connues', sum.known, prog.pool, 'var(--yellow)'),
        masteryBar('🟠 À apprendre', sum.learning, prog.pool, '#fb923c'),
        masteryBar('🔴 Jamais réussies', sum.never, prog.pool, 'var(--red)'),
        masteryBar('⚪ Jamais vues', sum.fresh, prog.pool, 'var(--text-3)'),
      ]),
    ]);
    page.appendChild(el('section.section', null, [bar]));

    // Univers
    page.appendChild(el('section.section', null, [
      QV.ui.sectionHead('Univers de ' + cat.label, null, null, '🎯'),
      el('div.sub-grid', null, subs.map(function (s) {
        const subSum = QV.mastery.subSummary(cat.id, s.id);
        const solid = subSum.perfect + subSum.mastered;
        const rec = (st.bySub || {})[cat.id + '/' + s.id];
        return el('button.sub-card', {
          type: 'button',
          onclick: function () { location.hash = '#/univers/' + encodeURIComponent(cat.id) + '/' + encodeURIComponent(s.id); },
        }, [
          el('div.grow', null, [
            el('div.sub-card__name', { text: s.label }),
            el('div.sub-card__count', { text: s.count + ' questions' + (rec ? ' · record ' + rec.best + '%' : '') }),
          ]),
          el('span.sub-card__mastery', {
            text: s.count ? Math.round((solid / s.count) * 100) + '%' : '0%',
            style: { color: 'var(--accent-2)' },
          }),
        ]);
      })),
    ]));

    // Quiz
    page.appendChild(el('section.section', null, [
      QV.ui.sectionHead('Quiz disponibles', null, null, '🎮'),
      el('div.grid.grid--quiz.qv-stagger', null, quizzes.map(function (q) { return QV.ui.quizCard(q); })),
    ]));

    return page;
  };

  function masteryBar(label, value, total, color) {
    return el('div.hbar__row', null, [
      el('span.hbar__name', { text: label }),
      el('div.bar', null, [el('i.bar__fill', { style: { width: (total ? (value / total) * 100 : 0) + '%', background: color } })]),
      el('span.hbar__val', { text: U.num(value) }),
    ]);
  }

  /* ========================================================= UNIVERS == */

  V.univers = function (params) {
    const cat = QV.data.cat(params.cat);
    const sub = QV.data.sub(params.cat, params.sub);
    const page = el('div.qv-page-enter');
    if (!cat || !sub) {
      page.appendChild(QV.ui.emptyState('❓', 'Univers introuvable', 'Cet univers n’existe pas.', el('a.btn.btn--primary', { href: '#/categories', text: 'Voir les catégories' })));
      return page;
    }

    const st = QV.store.loadStats();
    const key = cat.id + '/' + sub.id;
    const rec = (st.bySub || {})[key] || { quizzes: 0, questions: 0, correct: 0, best: 0 };
    const sum = QV.mastery.subSummary(cat.id, sub.id);
    const quizzes = QV.data.quizzesOf(cat.id).filter(function (q) { return q.sub === sub.id; });
    const acc = rec.questions ? (rec.correct / rec.questions) * 100 : 0;
    const solid = sum.perfect + sum.mastered;

    page.appendChild(el('div.page-head', null, [
      el('a.section__link', { href: '#/categorie/' + encodeURIComponent(cat.id), text: '← ' + cat.label }),
      el('h1', { style: { marginTop: '10px' }, text: sub.label }),
      el('p.page-head__sub', { text: sub.count + ' questions · ' + rec.quizzes + ' quiz joués' + (rec.best ? ' · record ' + rec.best + ' %' : '') }),
    ]));

    page.appendChild(el('section.section', null, [
      el('div.grid.grid--stats', null, [
        QV.ui.stat('Questions maîtrisées', U.num(solid) + '<small> / ' + U.num(sub.count) + '</small>', 'Maîtrise complète', '🧠'),
        QV.ui.stat('Taux de réussite', rec.questions ? U.pct(acc) : '—', rec.questions + ' réponses', '🎯'),
        QV.ui.stat('Meilleur score', rec.best ? rec.best + '<small>%</small>' : '—', 'Record personnel', '🏆'),
        QV.ui.stat('Maîtrise', sub.count ? U.pct((solid / sub.count) * 100) : '0<small>%</small>', 'De la base acquise', '📚'),
        QV.ui.stat('Parfaites', U.num(sum.perfect), 'Réussies du 1er coup', '🔵'),
        QV.ui.stat('À apprendre', U.num(sum.learning + sum.never), 'À retravailler', '🟠'),
      ]),
    ]));

    page.appendChild(el('section.section', null, [
      el('div.panel', null, [
        el('div.row.row--between.mb-3', null, [
          el('strong', { text: 'Maîtrise de ' + sub.label }),
          el('span.pill.pill--accent', { text: sub.count ? Math.round((solid / sub.count) * 100) + ' %' : '0 %' }),
        ]),
        el('div.stack.stack-2', null, [
          masteryBar('🔵 Parfaites', sum.perfect, sub.count, 'var(--cyan)'),
          masteryBar('🟢 Maîtrisées', sum.mastered, sub.count, 'var(--green)'),
          masteryBar('🟡 Connues', sum.known, sub.count, 'var(--yellow)'),
          masteryBar('🟠 À apprendre', sum.learning, sub.count, '#fb923c'),
          masteryBar('🔴 Jamais réussies', sum.never, sub.count, 'var(--red)'),
          masteryBar('⚪ Jamais vues', sum.fresh, sub.count, 'var(--text-3)'),
        ]),
        el('div.btn-row.mt-4', null, [
          el('a.btn.btn--primary.btn--sm', { href: '#/mes-connaissances?sub=' + encodeURIComponent(key), text: 'Voir mes connaissances' }),
          el('a.btn.btn--ghost.btn--sm', { href: '#/creer-mon-quiz?sub=' + encodeURIComponent(key), text: 'Quiz sur mesure' }),
        ]),
      ]),
    ]));

    page.appendChild(el('section.section', null, [
      QV.ui.sectionHead('Quiz de ' + sub.label, null, null, '🎮'),
      quizzes.length
        ? el('div.grid.grid--quiz.qv-stagger', null, quizzes.map(function (q) { return QV.ui.quizCard(q); }))
        : QV.ui.emptyState('🚧', 'Aucun quiz dédié', 'Ce univers est trop petit pour un quiz dédié : utilise le quiz sur mesure.'),
    ]));

    return page;
  };

  /* ====================================================== RECHERCHE === */

  V.recherche = function (params, query) {
    const q = (query && query.q) || '';
    const page = el('div.qv-page-enter');
    page.appendChild(el('div.page-head', null, [
      el('a.section__link', { href: '#/', text: '← Accueil' }),
      el('h1', { style: { marginTop: '10px' }, text: 'Recherche' }),
      el('div.searchbox.mt-3', { style: { flexBasis: '100%', maxWidth: '520px' } }, [
        el('span.searchbox__icon', { text: '⌕', 'aria-hidden': 'true' }),
        el('input.input#rq', { type: 'search', value: q, placeholder: 'Dragon Ball, football, espace…', 'aria-label': 'Rechercher' }),
      ]),
    ]));

    const body = el('div.mt-4');
    page.appendChild(body);

    function run(term) {
      body.innerHTML = '';
      if (!term || !term.trim()) {
        body.appendChild(QV.ui.emptyState('🔍', 'Que veux-tu chercher ?', 'Tape un univers, une catégorie, un film, un joueur, un pays…'));
        return;
      }
      const res = QV.data.search(term, 40);
      if (!res.length) {
        body.appendChild(QV.ui.emptyState('🤷', 'Aucun résultat pour « ' + term + ' »', 'Essaie un mot plus court, ou utilise les catégories.'));
        return;
      }
      const byKind = U.groupBy(res, function (r) { return r.kind; });
      const labels = { cat: 'Catégories', sub: 'Univers', quiz: 'Quiz' };
      Object.keys(labels).forEach(function (kind) {
        const items = byKind[kind];
        if (!items || !items.length) return;
        body.appendChild(el('section.section', null, [
          QV.ui.sectionHead(labels[kind] + ' (' + items.length + ')', null, null, kind === 'cat' ? '🗂️' : kind === 'sub' ? '🎯' : '🎮'),
          kind === 'quiz'
            ? el('div.grid.grid--quiz.qv-stagger', null, items.map(function (i) { return QV.ui.quizCard(QV.data.quiz(i.id)); }).filter(Boolean))
            : el('div.sub-grid', null, items.map(function (i) {
              return el('button.sub-card', {
                type: 'button',
                onclick: function () {
                  location.hash = i.kind === 'cat'
                    ? '#/categorie/' + encodeURIComponent(i.id)
                    : '#/univers/' + encodeURIComponent(i.id);
                },
              }, [
                el('span', { text: i.emoji }),
                el('div.grow', null, [
                  el('div.sub-card__name', { html: highlight(i.label, term) }),
                  el('div.sub-card__count', { text: i.sub || catLabel(i.catId) }),
                ]),
              ]);
            })),
        ]));
      });
    }

    run(q);
    const input = page.querySelector('#rq');
    input.addEventListener('input', U.debounce(function () {
      const term = input.value;
      history.replaceState(null, '', '#/recherche?q=' + encodeURIComponent(term));
      run(term);
    }, 180));
    return page;
  };

  function highlight(text, term) {
    const t = U.norm(text);
    const n = U.norm(term);
    let idx = t.indexOf(n);
    if (idx < 0 || !n) return U.esc(text);
    let out = '';
    let i = 0;
    while (idx >= 0) {
      out += U.esc(text.slice(i, idx)) + '<mark>' + U.esc(text.slice(idx, idx + n.length)) + '</mark>';
      i = idx + n.length;
      idx = t.indexOf(n, i);
    }
    out += U.esc(text.slice(i));
    return out;
  }

  /* =========================================================== AIDE ==== */

  V.aide = function () {
    const page = el('div.qv-main.qv-main--narrow.qv-page-enter');
    page.appendChild(el('div.page-head', null, [
      el('div.page-head__eyebrow', { text: '❓ AIDE' }),
      el('h1', { text: 'Comment jouer sur QuizVerse ?' }),
      el('p.page-head__sub', { text: 'QuizVerse fonctionne entièrement dans ton navigateur : pas de compte, pas de serveur, pas de connexion.' }),
    ]));

    const blocks = [
      ['🚀 Démarrer', 'Depuis l’accueil, clique sur Commencer un quiz ou Quiz aléatoire. Tu peux aussi choisir un univers précis dans les catégories.'],
      ['🎮 Les modes', 'Classique, rapide, long, expert, chrono, survie, infini, parfait, aléatoire, mix, quiz du jour et surprise. Chaque mode a ses règles.'],
      ['⚡ XP et niveaux', 'Chaque bonne réponse donne de l’XP. Le score dépend de la difficulté, de ta rapidité et de ta série. Un score parfait donne un gros bonus.'],
      ['🏅 Badges et titres', 'Les badges se débloquent automatiquement quand tu remplis leur condition. Les titres se débloquent eux aussi : choisis celui qui te ressemble dans Mon profil.'],
      ['📊 Statistiques', 'La page Statistiques montre ta progression, tes points forts, tes points faibles et tes graphiques d’évolution.'],
      ['🔁 Mes erreurs', 'Toutes les questions que tu as ratées sont conservées. Rejoue-les autant de fois que nécessaire : elles passent en « corrigées ».'],
      ['🎵 Musique', 'Le lecteur en bas à gauche contrôle la musique : lecture, pause, piste suivante, volume. Clique d’abord sur n’importe quel élément du site pour activer l’audio.'],
      ['💾 Sauvegarde', 'Tout est sauvegardé dans ton navigateur (localStorage). Ne vide pas les données du site, sinon ta progression disparaît. Tu peux exporter une sauvegarde dans Paramètres.'],
      ['⌨️ Raccourcis', 'Appuie sur / pour la recherche, 1-4 pour choisir une réponse, Entrée pour valider ou passer à la question suivante, Échap pour quitter un quiz.'],
      ['♿ Accessibilité', 'Navigation complète au clavier, focus visible, contrastes lisibles et option Réduire les animations dans les paramètres.'],
    ];

    const grid = el('div.grid.grid--2');
    blocks.forEach(function (b) {
      grid.appendChild(el('div.panel', null, [
        el('h4', { text: b[0] }),
        el('p.text-sm.text-2.mb-0', { text: b[1] }),
      ]));
    });
    page.appendChild(grid);

    page.appendChild(el('div.btn-row.mt-5', null, [
      el('a.btn.btn--primary', { href: '#/parametres', text: 'Ouvrir les paramètres' }),
      el('a.btn.btn--ghost', { href: '#/creer-mon-quiz', text: 'Créer mon quiz' }),
    ]));

    return page;
  };

  /* ========================================================= CRÉDITS == */

  V.credits = function () {
    const page = el('div.qv-main.qv-main--narrow.qv-page-enter');
    page.appendChild(el('div.page-head', null, [
      el('div.page-head__eyebrow', { text: '🎼 CRÉDITS' }),
      el('h1', { text: 'Crédits &amp; licence' }),
    ]));

    const panels = [
      ['🎵 Musique', 'Les six pistes de QuizVerse (menu, quiz-1, quiz-2, intense, victory, perfect) et tous les effets sonores sont générés sur mesure pour ce projet par un synthétiseur écrit spécifiquement dans le dossier tools/audio. Elles sont donc originales et libres de droits pour ce projet.'],
      ['🖼️ Identité visuelle', 'Le logo, les avatars, les icônes et les illustrations sont des SVG générés dans le projet. Aucune image externe n’est utilisée.'],
      ['🧠 Contenu', 'Les questions sont rédigées spécifiquement pour QuizVerse et relues automatiquement : doublons, index de réponse invalides et catégories inexistantes sont détectés par l’outil de validation.'],
      ['🛠️ Technologie', 'Site statique en HTML, CSS et JavaScript vanilla, sans framework, sans dépendance externe, sans serveur. Compatible GitHub Pages.'],
      ['🔒 Vie privée', 'Aucune donnée n’est envoyée sur un serveur. Profil, XP, badges, historique et statistiques restent dans le localStorage de ton navigateur.'],
      ['📄 Licence', 'Code : MIT (voir LICENSE). QuizVerse est un projet indépendant, sans compte à créer et sans service tiers.'],
    ];
    const grid = el('div.grid.grid--2');
    panels.forEach(function (p) {
      grid.appendChild(el('div.panel', null, [
        el('h4', { text: p[0] }),
        el('p.text-sm.text-2.mb-0', { text: p[1] }),
      ]));
    });
    page.appendChild(grid);
    return page;
  };
})(window);
