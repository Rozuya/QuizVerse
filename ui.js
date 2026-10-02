/* ==========================================================================
   QuizVerse — interface : toasts, modales, en-tête, recherche, composants
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});
  const U = QV.util;
  const el = U.el, $ = U.$, esc = U.esc;

  /* =============================================================== TOASTS */

  let toastHost = null;

  function toast(title, text, type, ms) {
    toastHost = toastHost || document.getElementById('toasts');
    if (!toastHost) return;
    const icons = { success: '✅', error: '⚠️', info: '💡', xp: '✨', badge: '🏅' };
    const node = el('div.toast' + (type ? '.toast--' + type : ''), null, [
      el('span.toast__icon', { text: icons[type] || '•', 'aria-hidden': 'true' }),
      el('div.toast__body', null, [
        el('div.toast__title', { text: title }),
        text ? el('div.toast__text', { text: text }) : null,
      ]),
    ]);
    toastHost.appendChild(node);
    const life = ms || (type === 'badge' || type === 'xp' ? 5200 : 3600);
    setTimeout(function () {
      node.classList.add('is-leaving');
      setTimeout(function () { node.remove(); }, 300);
    }, life);
    // Empêche l'empilement infini
    while (toastHost.children.length > 5) toastHost.firstChild.remove();
  }

  /* =============================================================== MODALE */

  let modalStack = [];

  /**
   * modal({ title, html, actions:[{label, kind, onClick, close}], onOpen })
   */
  function modal(opts) {
    const host = document.getElementById('modal');
    const box = document.getElementById('modal-box');
    if (!host || !box) return null;
    const o = opts || {};

    const instance = {
      close: function () {
        const idx = modalStack.indexOf(instance);
        if (idx >= 0) modalStack.splice(idx, 1);
        if (!modalStack.length) {
          host.hidden = true;
          box.innerHTML = '';
          document.body.style.overflow = '';
        } else {
          const top = modalStack[modalStack.length - 1];
          box.innerHTML = top._html;
          bind();
        }
      },
      _html: '',
      box: box,
    };

    function build() {
      box.innerHTML = '';
      box.appendChild(el('div.stack.stack-3', null, [
        o.title ? el('h3.modal__title', { id: 'modal-title', text: o.title }) : null,
        o.html ? (o.html instanceof Node ? o.html : el('div.modal__text', { html: o.html })) : null,
        o.text ? el('p.modal__text', { text: o.text }) : null,
        o.node || null,
      ]));
      const actions = o.actions || [{ label: 'Fermer', kind: 'ghost' }];
      const bar = el('div.modal__actions');
      actions.forEach(function (a) {
        const b = el('button.btn' + (a.kind ? '.btn--' + a.kind : '.btn--ghost'), { type: 'button', text: a.label });
        b.addEventListener('click', function () {
          let keep = false;
          if (typeof a.onClick === 'function') keep = a.onClick(instance) === false;
          if (!keep && a.close !== false) instance.close();
        });
        bar.appendChild(b);
      });
      box.appendChild(bar);
      instance._html = box.innerHTML;
    }

    function bind() {
      const actions = (o.actions || [{ label: 'Fermer' }]);
      const btns = box.querySelectorAll('.modal__actions .btn');
      btns.forEach(function (b, i) {
        b.addEventListener('click', function () {
          const a = actions[i];
          if (!a) return;
          let keep = false;
          if (typeof a.onClick === 'function') keep = a.onClick(instance) === false;
          if (!keep && a.close !== false) instance.close();
        });
      });
      if (typeof o.onOpen === 'function') o.onOpen(instance);
      const focusable = box.querySelector('input, button, select, textarea');
      if (focusable) setTimeout(function () { focusable.focus(); }, 40);
    }

    build();
    modalStack.push(instance);
    host.hidden = false;
    document.body.style.overflow = 'hidden';
    bind();
    return instance;
  }

  function confirmDialog(title, text, confirmLabel, danger) {
    return new Promise(function (resolve) {
      let done = false;
      modal({
        title: title,
        text: text,
        actions: [
          { label: 'Annuler', kind: 'ghost', onClick: function () { done = true; resolve(false); } },
          { label: confirmLabel || 'Confirmer', kind: danger ? 'danger' : 'primary', onClick: function () { done = true; resolve(true); } },
        ],
      });
      const host = document.getElementById('modal');
      const obs = new MutationObserver(function () {
        if (host.hidden && !done) { done = true; obs.disconnect(); resolve(false); }
      });
      obs.observe(host, { attributes: true, attributeFilter: ['hidden'] });
    });
  }

  /* ========================================================= AVATARS SVG */

  const AVATAR_PALETTE = ['#7c5cff', '#22d3ee', '#f472b6', '#facc15', '#34d399', '#fb7185', '#a78bfa', '#38bdf8', '#fb923c', '#4ade80'];

  /** Génère un avatar SVG déterministe à partir d'un identifiant. */
  function avatarSvg(id, size) {
    const known = (QV.data && QV.data.state && QV.data.state.avatars) || [];
    const found = known.filter(function (a) { return a.id === id; })[0];
    const style = found ? (found.style || 1) : (U.hashStr(id) % 6) + 1;
    const c1 = found ? found.c1 : AVATAR_PALETTE[U.hashStr(id + 'a') % AVATAR_PALETTE.length];
    const c2 = found ? found.c2 : AVATAR_PALETTE[U.hashStr(id + 'b') % AVATAR_PALETTE.length];
    const s = size || 96;
    const inner = AVATAR_SHAPES[style] || AVATAR_SHAPES[1];
    return '<svg viewBox="0 0 100 100" width="' + s + '" height="' + s + '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Avatar">'
      + '<defs><linearGradient id="g' + U.hashStr(id) + '" x1="0" y1="0" x2="1" y2="1">'
      + '<stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs>'
      + '<rect width="100" height="100" fill="#0b0b18"/>'
      + '<g fill="url(#g' + U.hashStr(id) + ')" stroke="rgba(255,255,255,.18)" stroke-width="1.5">' + inner + '</g>'
      + '</svg>';
  }

  const AVATAR_SHAPES = {
    1: '<circle cx="50" cy="50" r="26"/><circle cx="50" cy="50" r="38" fill="none" stroke-width="3"/><circle cx="50" cy="50" r="10" fill="rgba(0,0,0,.35)"/>',
    2: '<path d="M50 14 L84 34 L84 66 L50 86 L16 66 L16 34 Z"/><path d="M50 32 L68 43 L68 61 L50 72 L32 61 L32 43 Z" fill="rgba(0,0,0,.3)" stroke="none"/>',
    3: '<rect x="16" y="16" width="68" height="68" rx="18"/><rect x="32" y="32" width="36" height="36" rx="10" fill="rgba(0,0,0,.3)" stroke="none"/><circle cx="72" cy="28" r="7" fill="rgba(255,255,255,.5)" stroke="none"/>',
    4: '<path d="M50 12 C68 12 82 28 82 46 C82 66 66 84 50 88 C34 84 18 66 18 46 C18 28 32 12 50 12 Z"/><circle cx="40" cy="44" r="6" fill="rgba(0,0,0,.45)" stroke="none"/><circle cx="60" cy="44" r="6" fill="rgba(0,0,0,.45)" stroke="none"/><path d="M40 62 Q50 70 60 62" fill="none" stroke="rgba(0,0,0,.4)" stroke-width="4"/>',
    5: '<polygon points="50,10 84,50 50,90 16,50"/><polygon points="50,28 68,50 50,72 32,50" fill="rgba(0,0,0,.3)" stroke="none"/>',
    6: '<circle cx="50" cy="50" r="30"/><path d="M20 50 H80 M50 20 V80" stroke="rgba(255,255,255,.35)" stroke-width="2.5"/><circle cx="50" cy="50" r="12" fill="rgba(0,0,0,.35)" stroke="none"/>',
    7: '<path d="M22 78 L22 44 L50 22 L78 44 L78 78 Z"/><rect x="38" y="56" width="24" height="22" rx="4" fill="rgba(0,0,0,.35)" stroke="none"/><circle cx="50" cy="38" r="5" fill="rgba(255,255,255,.6)" stroke="none"/>',
    8: '<path d="M50 12 C72 12 88 30 88 50 C88 70 72 88 50 88 C28 88 12 70 12 50 C12 30 28 12 50 12 Z" fill="none" stroke-width="7"/><circle cx="50" cy="50" r="20"/><circle cx="50" cy="50" r="7" fill="rgba(255,255,255,.65)" stroke="none"/>',
    9: '<path d="M50 14 L62 42 L92 42 L68 60 L78 88 L50 71 L22 88 L32 60 L8 42 L38 42 Z"/><circle cx="50" cy="50" r="8" fill="rgba(0,0,0,.4)" stroke="none"/>',
    10: '<rect x="18" y="18" width="64" height="64" rx="32"/><path d="M32 58 Q50 30 68 58" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="4"/><circle cx="36" cy="40" r="5" fill="rgba(0,0,0,.4)" stroke="none"/><circle cx="64" cy="40" r="5" fill="rgba(0,0,0,.4)" stroke="none"/>',
  };

  function avatarNode(id, cls) {
    const n = el('span', { class: cls || '' });
    n.innerHTML = avatarSvg(id);
    return n;
  }

  /* ======================================================= COMPOSANTS UI */

  function diffBadge(diff) {
    const D = QV.data.DIFF_LABEL;
    return el('span.diff.diff--' + diff, { title: 'Difficulté : ' + (D[diff] || diff) }, [
      el('i.diff__dot'), document.createTextNode(QV.data.DIFF_EMOJI[diff] + ' ' + (D[diff] || diff)),
    ]);
  }

  function bar(value, max, kind) {
    const pctv = max > 0 ? U.clamp((value / max) * 100, 0, 100) : 0;
    return el('div.bar' + (kind ? '.bar--' + kind : ''), {
      role: 'progressbar', 'aria-valuenow': Math.round(pctv), 'aria-valuemin': '0', 'aria-valuemax': '100',
    }, [el('i.bar__fill', { style: { width: pctv + '%' } })]);
  }

  let svgDefsDone = false;
  function ring(pctValue, label, sub, size) {
    if (!svgDefsDone) {
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      defs.setAttribute('width', '0'); defs.setAttribute('height', '0');
      defs.style.position = 'absolute';
      defs.innerHTML = '<defs><linearGradient id="qvGrad" x1="0" y1="0" x2="1" y2="1">'
        + '<stop offset="0%" stop-color="var(--accent)"/><stop offset="100%" stop-color="var(--cyan)"/></linearGradient></defs>';
      document.body.appendChild(defs);
      svgDefsDone = true;
    }
    const p = U.clamp(pctValue, 0, 100);
    const r = 45, c = 2 * Math.PI * r;
    const node = el('div.ring', {
      style: { '--p': p, '--sz': (size || 92) + 'px' },
      role: 'img', 'aria-label': (sub ? sub + ' : ' : '') + Math.round(p) + ' %',
    });
    node.innerHTML = '<svg viewBox="0 0 100 100" aria-hidden="true">'
      + '<circle class="ring__track" cx="50" cy="50" r="' + r + '" pathLength="100"></circle>'
      + '<circle class="ring__bar" cx="50" cy="50" r="' + r + '" pathLength="100"></circle></svg>';
    node.appendChild(el('div.ring__label', { text: label !== undefined ? label : Math.round(p) + '%' }));
    if (sub) node.appendChild(el('div.ring__sub', { text: sub }));
    return node;
  }

  function stat(label, value, hint, icon, extraClass) {
    return el('div.stat' + (extraClass ? '.' + extraClass : ''), null, [
      el('div.stat__label', null, [icon ? el('span', { text: icon, 'aria-hidden': 'true' }) : null, document.createTextNode(label)]),
      el('div.stat__value', { html: String(value) }),
      hint ? el('div.stat__hint', { text: hint }) : null,
    ]);
  }

  function emptyState(icon, title, text, actionNode) {
    return el('div.empty-state', null, [
      el('div.empty-state__icon', { text: icon, 'aria-hidden': 'true' }),
      el('div.empty-state__title', { text: title }),
      text ? el('p.empty-state__text', { text: text }) : null,
      actionNode || null,
    ]);
  }

  function sectionHead(title, linkHref, linkLabel, icon) {
    return el('div.section__head', null, [
      el('h2.section__title', null, [icon ? el('span', { text: icon, 'aria-hidden': 'true' }) : null, document.createTextNode(title)]),
      linkHref ? el('a.section__link', { href: linkHref, text: (linkLabel || 'Voir tout') + ' →' }) : null,
    ]);
  }

  /* ------------------------------------------------------ Cartes quiz -- */

  function quizCard(quiz, opts) {
    const o = opts || {};
    const st = QV.store.loadStats();
    const favs = QV.store.loadFavorites();
    const isFav = favs.indexOf(quiz.id) >= 0;
    const best = (st.byCat && st.byCat[quiz.cat] && st.byCat[quiz.cat].best) || 0;
    const played = (st.byCat && st.byCat[quiz.cat] && st.byCat[quiz.cat].quizzes) || 0;

    const card = el('button.quiz-card', {
      type: 'button',
      dataset: { quizId: quiz.id },
      style: { '--cat-color': quiz.color || 'var(--accent)' },
      'aria-label': quiz.title + ' — ' + quiz.subLabel,
      onclick: function (e) {
        if (e.target.closest('.quiz-card__fav')) return;
        location.hash = '#/quiz/' + encodeURIComponent(quiz.id);
      },
    });

    card.appendChild(el('span.quiz-card__art', { html: QV.art.thumb(quiz) }));
    card.appendChild(el('span.quiz-card__body', null, [
      el('div.quiz-card__top', null, [
        el('div.quiz-card__icon', { text: quiz.emoji || '✨', 'aria-hidden': 'true' }),
        el('div.grow', null, [
          el('div.quiz-card__title', { text: quiz.title }),
          el('div.quiz-card__sub', { text: quiz.subLabel || '' }),
        ]),
      ]),
      el('div.row.row--tight', null, [
        diffBadge(quiz.diff),
        el('span.pill', { text: '📚 ' + quiz.pool }),
      ]),
      el('div.quiz-card__foot', null, [
        el('span', { text: played ? best + ' % de mieux' : 'Jamais joué' }),
        el('span', { text: quiz.type === 'global' ? 'Mix global' : (quiz.type === 'cat' ? 'Mix catégorie' : 'Univers dédié') }),
      ]),
    ]));

    const fav = el('button.quiz-card__fav' + (isFav ? '.is-on' : ''), {
      type: 'button',
      'aria-label': isFav ? 'Retirer des favoris' : 'Ajouter aux favoris',
      'aria-pressed': isFav ? 'true' : 'false',
      title: isFav ? 'Retirer des favoris' : 'Ajouter aux favoris',
      text: isFav ? '★' : '☆',
      onclick: function (e) {
        e.stopPropagation();
        QV.app.toggleFavorite(quiz.id);
      },
    });
    card.appendChild(fav);
    if (o.eager) card.classList.add('qv-anim-in');
    return card;
  }

  /* ---------------------------------------------------- Cartes univers -- */

  function catCard(cat, opts) {
    const o = opts || {};
    const st = QV.store.loadStats();
    const s = (st.byCat && st.byCat[cat.id]) || { quizzes: 0, best: 0 };
    const all = QV.data.questionsIn(cat.id, null, null);
    const node = el('button.cat-card', {
      type: 'button',
      style: { '--cat-color': cat.color || 'var(--accent)' },
      'aria-label': cat.label + ', ' + all.length + ' questions',
      onclick: function () { location.hash = '#/categorie/' + encodeURIComponent(cat.id); },
    });
    node.appendChild(el('span.cat-card__art', { html: QV.art.catArt(cat) }));
    node.appendChild(el('span.cat-card__body', null, [
      el('div.row.row--between', null, [
        el('div.cat-card__emoji', { text: cat.emoji, 'aria-hidden': 'true' }),
        s.quizzes ? el('span.pill.pill--accent', { text: s.best + '%' }) : el('span.pill', { text: all.length + ' Q' }),
      ]),
      el('div.cat-card__name', { text: cat.label }),
      el('div.cat-card__meta', null, [
        el('span', { text: (cat.subs || []).length + ' univers' }),
        el('span', { text: all.length + ' questions' }),
      ]),
      el('div.cat-card__bar', null, [bar(s.quizzes ? s.best : 0, 100, 'cyan')]),
      el('div.text-xs.text-3', { text: s.quizzes ? s.quizzes + ' partie' + (s.quizzes > 1 ? 's' : '') + ' jouée' + (s.quizzes > 1 ? 's' : '') : (o.hint || 'Découvrir les quiz') }),
    ]));
    return node;
  }

  /* ------------------------------------------------- Graphiques simples -- */

  /** Graphique en ligne (SVG) à partir de points {x, y}. */
  function lineChart(points, opts) {
    const o = opts || {};
    const w = 640, h = o.height || 200;
    const pad = { t: 14, r: 12, b: 26, l: 34 };
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.setAttribute('class', 'chart');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', o.label || 'Graphique');

    if (!points.length) return el('div.text-sm.text-3.text-center', { text: 'Pas encore de données.' });

    const xs = points.map(function (p) { return p.x; });
    const ys = points.map(function (p) { return p.y; });
    const xMin = Math.min.apply(null, xs), xMax = Math.max.apply(null, xs);
    const yMin = o.yMin !== undefined ? o.yMin : 0;
    const yMax = o.yMax !== undefined ? o.yMax : Math.max.apply(null, ys) * 1.12 || 1;
    const px = function (v) { return pad.l + ((v - xMin) / ((xMax - xMin) || 1)) * (w - pad.l - pad.r); };
    const py = function (v) { return h - pad.b - ((v - yMin) / ((yMax - yMin) || 1)) * (h - pad.t - pad.b); };

    const ns = 'http://www.w3.org/2000/svg';
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('class', 'chart__grid');
    const rows = 4;
    for (let i = 0; i <= rows; i++) {
      const yv = yMin + ((yMax - yMin) * i) / rows;
      const l = document.createElementNS(ns, 'line');
      l.setAttribute('x1', pad.l); l.setAttribute('x2', w - pad.r);
      l.setAttribute('y1', py(yv)); l.setAttribute('y2', py(yv));
      g.appendChild(l);
      const tx = document.createElementNS(ns, 'text');
      tx.setAttribute('class', 'chart__label');
      tx.setAttribute('x', pad.l - 6); tx.setAttribute('y', py(yv) + 3);
      tx.setAttribute('text-anchor', 'end');
      tx.textContent = Math.round(yv);
      g.appendChild(tx);
    }
    svg.appendChild(g);

    const d = points.map(function (p, i) { return (i ? 'L' : 'M') + px(p.x).toFixed(1) + ' ' + py(p.y).toFixed(1); }).join(' ');
    const area = document.createElementNS(ns, 'path');
    area.setAttribute('class', 'chart__area');
    area.setAttribute('d', d + ' L' + px(xMax).toFixed(1) + ' ' + (h - pad.b) + ' L' + px(xMin).toFixed(1) + ' ' + (h - pad.b) + ' Z');
    svg.appendChild(area);

    const line = document.createElementNS(ns, 'path');
    line.setAttribute('class', 'chart__line');
    if (o.color) line.style.stroke = o.color;
    line.setAttribute('d', d);
    svg.appendChild(line);

    points.forEach(function (p, i) {
      if (points.length > 26 && i % Math.ceil(points.length / 26) !== 0 && i !== points.length - 1) return;
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('class', 'chart__dot');
      if (o.color) c.style.stroke = o.color;
      c.setAttribute('cx', px(p.x)); c.setAttribute('cy', py(p.y)); c.setAttribute('r', '3.4');
      const t = document.createElementNS(ns, 'title');
      t.textContent = (p.label || '') + ' : ' + p.y;
      c.appendChild(t);
      svg.appendChild(c);
    });

    if (o.xLabels) {
      o.xLabels.forEach(function (lb) {
        const tx = document.createElementNS(ns, 'text');
        tx.setAttribute('class', 'chart__label');
        tx.setAttribute('x', px(lb.x)); tx.setAttribute('y', h - 8);
        tx.setAttribute('text-anchor', 'middle');
        tx.textContent = lb.text;
        svg.appendChild(tx);
      });
    }
    return svg;
  }

  /** Histogramme vertical. */
  function barChart(items, opts) {
    const o = opts || {};
    const w = 640, h = o.height || 180;
    const pad = { t: 12, r: 10, b: 30, l: 32 };
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    svg.setAttribute('class', 'chart');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', o.label || 'Histogramme');
    const max = Math.max.apply(null, items.map(function (i) { return i.y; }).concat([1])) * 1.1;
    const bw = (w - pad.l - pad.r) / Math.max(1, items.length);
    items.forEach(function (it, i) {
      const bh = ((h - pad.t - pad.b) * it.y) / max;
      const r = document.createElementNS(ns, 'rect');
      r.setAttribute('class', 'chart__bar');
      r.setAttribute('x', pad.l + i * bw + bw * 0.18);
      r.setAttribute('y', h - pad.b - bh);
      r.setAttribute('width', bw * 0.64);
      r.setAttribute('height', Math.max(0, bh));
      r.setAttribute('rx', '3');
      if (it.color) r.style.fill = it.color;
      const t = document.createElementNS(ns, 'title');
      t.textContent = it.label + ' : ' + it.y;
      r.appendChild(t);
      svg.appendChild(r);
      if (it.short) {
        const tx = document.createElementNS(ns, 'text');
        tx.setAttribute('class', 'chart__label');
        tx.setAttribute('x', pad.l + i * bw + bw / 2);
        tx.setAttribute('y', h - 10);
        tx.setAttribute('text-anchor', 'middle');
        tx.textContent = it.short;
        svg.appendChild(tx);
      }
    });
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('class', 'chart__grid');
    [0, 0.5, 1].forEach(function (f) {
      const yv = max * f;
      const l = document.createElementNS(ns, 'line');
      l.setAttribute('x1', pad.l); l.setAttribute('x2', w - pad.r);
      l.setAttribute('y1', h - pad.b - (h - pad.t - pad.b) * f);
      l.setAttribute('y2', h - pad.b - (h - pad.t - pad.b) * f);
      g.appendChild(l);
      const tx = document.createElementNS(ns, 'text');
      tx.setAttribute('class', 'chart__label');
      tx.setAttribute('x', pad.l - 6); tx.setAttribute('y', h - pad.b - (h - pad.t - pad.b) * f + 3);
      tx.setAttribute('text-anchor', 'end');
      tx.textContent = Math.round(yv);
      g.appendChild(tx);
    });
    svg.appendChild(g);
    return svg;
  }

  /**
   * Bloc « Sources » affiché après chaque réponse (bonne ou mauvaise).
   * @param {object} q question
   * @param {object} [opts] { compact: bool }
   */
  function sourcesNode(q, opts) {
    const o = opts || {};
    const list = (q && Array.isArray(q.sources) ? q.sources : []).filter(function (s) { return s && s.url; });
    const wrap = el('div.sources' + (o.compact ? '.sources--compact' : ''));
    if (!list.length) return wrap;

    wrap.appendChild(el('div.sources__title', null, [
      el('span', { text: '📚', 'aria-hidden': 'true' }),
      document.createTextNode('Sources et pour aller plus loin'),
    ]));

    const ul = el('ul.sources__list');
    list.forEach(function (s) {
      const host = String(s.url).replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
      ul.appendChild(el('li', null, [
        el('a.sources__link', {
          href: s.url,
          target: '_blank',
          rel: 'noopener noreferrer',
          title: s.url,
        }, [
          el('span.sources__badge', { text: '↗', 'aria-hidden': 'true' }),
          el('span.sources__label', { text: s.label || s.url }),
          el('span.sources__host', { text: host }),
        ]),
      ]));
    });
    wrap.appendChild(ul);

    wrap.appendChild(el('p.sources__note', {
      text: 'Les sources sont proposées pour approfondir : elles ne donnent pas forcément la réponse, elles permettent de vérifier et de comprendre.',
    }));
    return wrap;
  }

  /* ========================================================== EXPOSITION */

  QV.ui = {
    toast: toast,
    modal: modal,
    confirm: confirmDialog,
    avatarSvg: avatarSvg,
    avatarNode: avatarNode,
    diffBadge: diffBadge,
    bar: bar,
    ring: ring,
    stat: stat,
    emptyState: emptyState,
    sectionHead: sectionHead,
    quizCard: quizCard,
    catCard: catCard,
    lineChart: lineChart,
    barChart: barChart,
    sourcesNode: sourcesNode,
    AVATAR_PALETTE: AVATAR_PALETTE,
  };
})(window);
