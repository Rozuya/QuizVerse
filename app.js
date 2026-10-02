/* ==========================================================================
   QuizVerse — application : routeur, chrome de l'interface, démarrage
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});
  const U = QV.util;
  const el = U.el;
  const $ = U.$;

  /* ========================================================= ROUTES ==== */

  const ROUTES = [
    { re: /^\/?$/, view: 'home', nav: '/' },
    { re: /^\/explorer$/, view: 'explorer', nav: '/explorer' },
    { re: /^\/categories$/, view: 'categories', nav: '/categories' },
    { re: /^\/categorie\/([^/?]+)$/, view: 'categorie', nav: '/categories', keys: ['id'] },
    { re: /^\/univers\/([^/?]+)\/([^/?]+)$/, view: 'univers', nav: '/categories', keys: ['cat', 'sub'] },
    { re: /^\/quiz\/([^/?]+)$/, view: 'quiz', nav: '/explorer', keys: ['id'] },
    { re: /^\/jouer$/, view: 'jouer', nav: null },
    { re: /^\/resultats$/, view: 'resultats', nav: null },
    { re: /^\/quiz-du-jour$/, view: 'quizDuJour', nav: null },
    { re: /^\/aleatoire$/, view: 'aleatoire', nav: null },
    { re: /^\/surprise$/, view: 'surprise', nav: null },
    { re: /^\/creer-mon-quiz$/, view: 'creerMonQuiz', nav: null },
    { re: /^\/mes-erreurs$/, view: 'mesErreurs', nav: null },
    { re: /^\/mes-connaissances$/, view: 'mesConnaissances', nav: null },
    { re: /^\/profil$/, view: 'profil', nav: '/profil' },
    { re: /^\/statistiques$/, view: 'statistiques', nav: '/statistiques' },
    { re: /^\/badges$/, view: 'badges', nav: '/badges' },
    { re: /^\/titres$/, view: 'titres', nav: '/profil' },
    { re: /^\/defis$/, view: 'defis', nav: '/defis' },
    { re: /^\/historique$/, view: 'historique', nav: null },
    { re: /^\/favoris$/, view: 'favoris', nav: null },
    { re: /^\/parametres$/, view: 'parametres', nav: '/parametres' },
    { re: /^\/recherche$/, view: 'recherche', nav: null },
    { re: /^\/aide$/, view: 'aide', nav: null },
    { re: /^\/credits$/, view: 'credits', nav: null },
  ];

  function parseHash() {
    let raw = location.hash.replace(/^#/, '') || '/';
    let path = raw, query = {};
    const qi = raw.indexOf('?');
    if (qi >= 0) {
      path = raw.slice(0, qi);
      raw.slice(qi + 1).split('&').forEach(function (kv) {
        if (!kv) return;
        const i = kv.indexOf('=');
        const k = decodeURIComponent(i < 0 ? kv : kv.slice(0, i));
        const v = i < 0 ? '' : decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' '));
        query[k] = v;
      });
    }
    if (path.charAt(0) !== '/') path = '/' + path;
    return { path: path, query: query, raw: raw };
  }

  function matchRoute(path) {
    for (let i = 0; i < ROUTES.length; i++) {
      const r = ROUTES[i];
      const m = r.re.exec(path);
      if (m) {
        const params = {};
        if (r.keys) r.keys.forEach(function (k, idx) { params[k] = decodeURIComponent(m[idx + 1] || ''); });
        return { route: r, params: params };
      }
    }
    return null;
  }

  /* ======================================================== CHROME ==== */

  let mainEl = null;

  function refreshChrome() {
    // Avatar de l'en-tête
    const host = document.getElementById('header-avatar');
    if (host) {
      host.innerHTML = QV.ui.avatarSvg(QV.profile.currentAvatar(), 38);
    }
    // Nav active
    const r = parseHash();
    const found = matchRoute(r.path);
    const active = found ? found.route.nav : null;
    U.$$('#qv-nav a').forEach(function (a) {
      a.classList.toggle('is-active', !!active && a.getAttribute('data-nav') === active);
    });
  }

  function render() {
    const parsed = parseHash();
    const found = matchRoute(parsed.path);
    const scrollY = global.scrollY;

    if (!found) {
      renderNotFound(parsed.path);
      return;
    }

    const view = QV.views[found.route.view];
    if (typeof view !== 'function') {
      renderNotFound(parsed.path);
      return;
    }

    // Nettoyage d'une partie en cours si on quitte l'écran de jeu
    if (found.route.view !== 'jouer' && found.route.view !== 'resultats' && QV.quiz.isRunning() && !QV.quiz.state().over) {
      QV.quiz.discard();
    }

    let node;
    try {
      node = view(found.params, parsed.query);
    } catch (err) {
      console.error('[QuizVerse] Erreur de rendu de la vue ' + found.route.view, err);
      node = el('div.qv-main', null, [
        QV.ui.emptyState('⚠️', 'Erreur d’affichage', 'Cette page n’a pas pu s’afficher : ' + (err && err.message ? err.message : err),
          el('a.btn.btn--primary', { href: '#/', text: 'Retour à l’accueil' })),
      ]);
    }

    mainEl.innerHTML = '';
    mainEl.scrollTop = 0;
    if (node.classList && node.classList.contains('qv-main')) {
      mainEl.appendChild(node);
    } else {
      const wrap = el('div.qv-main', { id: 'main-wrap' });
      wrap.appendChild(node);
      mainEl.appendChild(wrap);
    }
    const host = mainEl.firstChild;

    // Musique selon la page
    if (QV.music) {
      if (found.route.view === 'jouer') QV.music.setContext('quiz');
      else QV.music.setContext('menu');
    }

    refreshChrome();
    updateTitle(parsed.path);

    if (found.route.view !== 'jouer') global.scrollTo(0, Math.min(scrollY, 60));
    else global.scrollTo(0, 0);

    // Focus accessibilité
    if (found.route.view !== 'jouer' && host) {
      const h = host.querySelector('h1');
      if (h) h.setAttribute('tabindex', '-1');
    }
  }

  function renderNotFound(path) {
    mainEl.innerHTML = '';
    mainEl.appendChild(el('div.qv-main', null, [
      QV.ui.emptyState('🧭', 'Page introuvable', 'L’adresse « ' + path + ' » ne correspond à aucune page de QuizVerse.',
        el('div.btn-row.btn-row--center', null, [
          el('a.btn.btn--primary', { href: '#/', text: 'Retour à l’accueil' }),
          el('a.btn.btn--ghost', { href: '#/explorer', text: 'Explorer les quiz' }),
        ])),
    ]));
    refreshChrome();
  }

  const TITLES = {
    '/': 'Accueil',
    '/explorer': 'Explorer',
    '/categories': 'Catégories',
    '/profil': 'Mon profil',
    '/statistiques': 'Statistiques',
    '/badges': 'Badges',
    '/defis': 'Défis',
    '/parametres': 'Paramètres',
    '/jouer': 'Quiz en cours',
    '/resultats': 'Résultats',
  };

  function updateTitle(path) {
    const t = TITLES[path] || 'QuizVerse';
    document.title = path === '/' ? 'QuizVerse — Teste tes connaissances' : t + ' · QuizVerse — Teste tes connaissances';
  }

  /* ==================================================== ACCÈS RAPIDES == */

  function startQuiz(cfg) {
    const settings = QV.store.loadSettings();
    const finalCfg = Object.assign({}, cfg);
    if (finalCfg.mode === 'surprise' || !finalCfg.mode) finalCfg.mode = finalCfg.mode || 'classique';
    finalCfg.music = settings.quizMusicEnabled !== false;
    if (finalCfg.mode === 'chrono' && !finalCfg.timePerQuestion) {
      finalCfg.timePerQuestion = finalCfg.diff === 'expert' ? 25 : finalCfg.diff === 'difficile' ? 30 : 40;
    }
    if (finalCfg.diff === 'difficile' || finalCfg.diff === 'expert') {
      finalCfg.music = true;
    }

    // Mode surprise : on choisit tout automatiquement puis on démarre direct
    if (finalCfg.mode === 'surprise') {
      finalCfg.explicit = true;
    }

    const res = QV.quiz.start(finalCfg);
    if (!res || res.error) {
      QV.ui.toast('Impossible de démarrer', (res && res.error) || 'Aucune question disponible.', 'error', 4200);
      return;
    }
    // Petite animation d'entrée
    location.hash = '#/jouer';
    QV.app.render();
    QV.music.sfx('click');
  }
  /* ======================================================= FAVORIS ==== */

  function toggleFavorite(quizId) {
    const favs = QV.store.loadFavorites();
    const i = favs.indexOf(quizId);
    if (i >= 0) {
      favs.splice(i, 1);
      QV.store.saveFavorites(favs);
      QV.ui.toast('Retiré des favoris', '', 'info', 1600);
    } else {
      favs.unshift(quizId);
      QV.store.saveFavorites(favs);
      QV.music.sfx('correct');
      QV.ui.toast('Ajouté aux favoris', '', 'success', 1600);
    }
    refreshFavIcons();
  }

  function toggleFavoriteCategory(catId) {
    const favs = QV.store.loadFavoriteCategories();
    const i = favs.indexOf(catId);
    if (i >= 0) {
      favs.splice(i, 1);
      QV.ui.toast('Catégorie retirée', '', 'info', 1600);
    } else {
      favs.push(catId);
      QV.ui.toast('Catégorie ajoutée aux favoris', '', 'success', 1600);
    }
    QV.store.saveFavoriteCategories(favs);
  }

  function refreshFavIcons() {
    const favs = QV.store.loadFavorites();
    U.$$('.quiz-card[data-quiz-id]').forEach(function (card) {
      const btn = card.querySelector('.quiz-card__fav');
      if (!btn) return;
      const on = favs.indexOf(card.getAttribute('data-quiz-id')) >= 0;
      btn.classList.toggle('is-on', on);
      btn.textContent = on ? '★' : '☆';
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label', on ? 'Retirer des favoris' : 'Ajouter aux favoris');
      btn.title = on ? 'Retirer des favoris' : 'Ajouter aux favoris';
    });
  }

  /* ==================================================== RECHERCHE ====== */

  function initSearch() {
    const input = document.getElementById('search-input');
    const box = document.getElementById('search-suggestions');
    if (!input || !box) return;

    let activeIndex = -1;
    let items = [];

    function close() {
      box.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      activeIndex = -1;
    }

    function render(term) {
      items = QV.data.search(term, 9);
      box.innerHTML = '';
      if (!term.trim()) { close(); return; }
      box.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      if (!items.length) {
        box.appendChild(el('div.suggestions__empty', {
          text: 'Aucun résultat pour « ' + term + ' ». Essaie « Dragon Ball », « football » ou « espace ».',
        }));
        return;
      }
      items.forEach(function (it, i) {
        const row = el('button.suggestions__item', {
          type: 'button', role: 'option', 'aria-selected': 'false',
          onclick: function () { go(it); },
        }, [
          el('span.em', { text: it.emoji, 'aria-hidden': 'true' }),
          el('span', { html: hl(it.label, term) }),
          el('span.sub', { text: kindLabel(it) }),
        ]);
        row.dataset.idx = String(i);
        box.appendChild(row);
      });
      box.appendChild(el('button.suggestions__item', {
        type: 'button', role: 'option',
        onclick: function () {
          close();
          input.value = term;
          location.hash = '#/recherche?q=' + encodeURIComponent(term);
        },
      }, [
        el('span.em', { text: '🔎' }),
        el('span', { text: 'Voir tous les résultats pour « ' + term + ' »' }),
      ]));
    }

    function kindLabel(it) {
      if (it.kind === 'cat') return 'Catégorie';
      if (it.kind === 'sub') return (QV.data.cat(it.catId) || {}).label || 'Univers';
      return 'Quiz';
    }

    function go(it) {
      close();
      input.blur();
      if (it.kind === 'cat') location.hash = '#/categorie/' + encodeURIComponent(it.id);
      else if (it.kind === 'sub') location.hash = '#/univers/' + encodeURIComponent(it.id);
      else location.hash = '#/quiz/' + encodeURIComponent(it.id);
    }

    function hl(text, term) {
      const t = U.norm(text), n = U.norm(term);
      const idx = t.indexOf(n);
      if (idx < 0 || !n) return U.esc(text);
      return U.esc(text.slice(0, idx)) + '<mark>' + U.esc(text.slice(idx, idx + n.length)) + '</mark>' + U.esc(text.slice(idx + n.length));
    }

    input.addEventListener('input', U.debounce(function () { render(input.value); }, 110));
    input.addEventListener('focus', function () { if (input.value.trim()) render(input.value); });

    input.addEventListener('keydown', function (e) {
      const rows = U.$$('.suggestions__item', box);
      if (e.key === 'Escape') { close(); input.blur(); return; }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && rows[activeIndex]) { rows[activeIndex].click(); return; }
        close();
        location.hash = '#/recherche?q=' + encodeURIComponent(input.value);
        input.blur();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!rows.length) return;
        activeIndex += e.key === 'ArrowDown' ? 1 : -1;
        if (activeIndex < 0) activeIndex = rows.length - 1;
        if (activeIndex >= rows.length) activeIndex = 0;
        rows.forEach(function (r, i) {
          r.classList.toggle('is-active', i === activeIndex);
          r.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
        });
        rows[activeIndex].scrollIntoView({ block: 'nearest' });
      }
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.searchbox')) close();
    });

    // Raccourci /
    document.addEventListener('keydown', function (e) {
      const settings = QV.store.loadSettings();
      if (!settings.keyboardShortcuts) return;
      const tag = (document.activeElement && document.activeElement.tagName) || '';
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });
  }

  /* ===================================================== NAV MOBILE ==== */

  function initNav() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('qv-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '✕' : '☰';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      }
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('#qv-nav') && !e.target.closest('#nav-toggle')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      }
    });
  }

  /* ================================================== HEADER SCROLL ==== */

  function initHeaderScroll() {
    const header = document.getElementById('qv-header');
    if (!header) return;
    const onScroll = function () {
      header.classList.toggle('is-scrolled', global.scrollY > 8);
    };
    global.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ================================================ FIRST-RUN ONBOARD == */

  function maybeOnboard() {
    if (QV.store.get(QV.store.KEYS.ONBOARDED, false)) return;
    QV.store.set(QV.store.KEYS.ONBOARDED, true);
    const st = QV.store.loadStats();
    if (st.quizzes > 0) return;
    setTimeout(function () {
      QV.ui.modal({
        title: 'Bienvenue sur QuizVerse 👋',
        html: '<p>QuizVerse est une plateforme de quiz <strong>100 % solo</strong> : pas de compte, pas de serveur, pas de multijoueur. Tout se passe dans ton navigateur.</p>'
          + '<ul><li><strong>' + U.num(QV.data.questions.length) + '</strong> questions à explorer</li>'
          + '<li><strong>' + QV.data.categories.length + '</strong> catégories, <strong>' + U.num(QV.data.quizzes.length) + '</strong> quiz</li>'
          + '<li>De l’<strong>XP</strong>, des <strong>niveaux</strong>, des <strong>badges</strong> et des <strong>défis</strong></li>'
          + '<li>Ta progression est sauvegardée localement</li></ul>'
          + '<p class="text-xs text-3">Astuce : clique sur n’importe quel bouton du site pour activer la musique 🎵</p>',
        actions: [
          { label: 'Plus tard', kind: 'ghost' },
          { label: '🎮 Premier quiz', kind: 'primary', onClick: function () { location.hash = '#/surprise'; } },
        ],
      });
    }, 900);
  }

  /* ========================================================= BOOT ===== */

  function boot() {
    mainEl = document.getElementById('main');
    QV.store.ensureVersion();

    // Réglages appliqués avant tout
    QV.settings.applyTheme(QV.store.loadSettings().theme);
    QV.settings.applyMotion();

    QV.data.load()
      .then(function () {
        QV.music.init();
        initSearch();
        initNav();
        initHeaderScroll();

        // Bouton thème
        const tb = document.getElementById('theme-btn');
        if (tb) tb.addEventListener('click', function () {
          QV.settings.cycleTheme();
          QV.music.reloadSettings();
        });

        // Bouton profil
        const ab = document.getElementById('avatar-btn');
        if (ab) ab.addEventListener('click', function () { location.hash = '#/profil'; });

        global.addEventListener('hashchange', render);
        if (!location.hash) location.hash = '#/';
        else render();

        refreshChrome();
        maybeOnboard();
        QV.music.warmup();

        console.info('%cQuizVerse', 'font:700 18px system-ui;color:#7c5cff', '— ' + U.num(QV.data.questions.length) + ' questions chargées · prêt.');
      })
      .catch(function (err) {
        console.error('[QuizVerse] Démarrage impossible', err);
      });
  }

  QV.app = {
    render: render,
    refreshChrome: refreshChrome,
    startQuiz: startQuiz,
    toggleFavorite: toggleFavorite,
    toggleFavoriteCategory: toggleFavoriteCategory,
    routes: ROUTES,
    parseHash: parseHash,
    boot: boot,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
