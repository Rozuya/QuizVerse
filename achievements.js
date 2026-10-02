/* ==========================================================================
   QuizVerse — badges (succès) et moteur d'évaluation des conditions
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});
  const U = QV.util;
  const el = U.el;
  const V = (QV.views = QV.views || {});

  /* -------------------------------------------------------- Évaluateur */

  const OPS = {
    '>=': function (a, b) { return a >= b; },
    '>': function (a, b) { return a > b; },
    '<=': function (a, b) { return a <= b; },
    '<': function (a, b) { return a < b; },
    '==': function (a, b) { return a === b; },
  };

  function statValue(st, p, name) {
    switch (name) {
      case 'xp': return p.xp;
      case 'level': return QV.xp.levelInfo(p.xp).level;
      case 'quizzes': return st.quizzes;
      case 'questions': return st.questions;
      case 'correct': return st.correct;
      case 'incorrect': return st.incorrect;
      case 'accuracy': return st.questions ? (st.correct / st.questions) * 100 : 0;
      case 'perfects': return st.perfects;
      case 'bestStreak': return st.bestStreak;
      case 'bestScore': return st.bestScore;
      case 'timePlayed': return st.timePlayed;
      case 'badges': return Object.keys(QV.store.loadBadges()).length;
      case 'playDays': return (p.playDays || []).length;
      case 'mistakesFixed': return Object.keys(QV.store.loadMistakes()).filter(function (k) { return QV.store.loadMistakes()[k].fixed; }).length;
      case 'knowledge': { const s = QV.mastery.summary(); return s.known; }
      case 'mastered': { const s = QV.mastery.summary(); return s.solid; }
      case 'masteredRatio': { const s = QV.mastery.summary(); return s.progress; }
      case 'categoriesPlayed': return Object.keys(st.byCat || {}).length;
      case 'categoriesMastered': {
        const ids = Object.keys(st.byCat || {});
        let n = 0;
        ids.forEach(function (c) {
          const prog = QV.xp.catProgress(c);
          if (prog.pool && prog.mastery / prog.pool >= 0.8) n++;
        });
        return n;
      }
      default: return st[name] || 0;
    }
  }

  function catValue(st, catId, op) {
    const c = (st.byCat && st.byCat[catId]) || { quizzes: 0, correct: 0, questions: 0, best: 0 };
    if (op === 'mastery') {
      const p = QV.xp.catProgress(catId);
      return p.pool ? (p.mastered / p.pool) * 100 : 0;
    }
    if (op === 'accuracy') return c.questions ? (c.correct / c.questions) * 100 : 0;
    return c[op] !== undefined ? c[op] : 0;
  }

  function subValue(st, catId, subId, op) {
    const key = catId + '/' + subId;
    const c = (st.bySub && st.bySub[key]) || { quizzes: 0, correct: 0, questions: 0, best: 0 };
    if (op === 'mastery') {
      const s = QV.mastery.subSummary(catId, subId);
      const pool = s.perfect + s.mastered + s.known + s.learning + s.never + s.fresh;
      return pool ? ((s.perfect + s.mastered) / pool) * 100 : 0;
    }
    if (op === 'accuracy') return c.questions ? (c.correct / c.questions) * 100 : 0;
    return c[op] !== undefined ? c[op] : 0;
  }

  function conditionText(cond) {
    const N = QV.util.num;
    switch (cond.k) {
      case 'stat': {
        const L = {
          xp: 'XP', level: 'Niveau', quizzes: 'Quiz terminés', questions: 'Questions répondues',
          correct: 'Bonnes réponses', incorrect: 'Mauvaises réponses', accuracy: 'Taux de réussite',
          perfects: 'Scores parfaits', bestStreak: 'Meilleure série', bestScore: 'Meilleur score (%)',
          timePlayed: 'Temps de jeu (s)', badges: 'Badges', playDays: 'Jours de jeu',
          knowledge: 'Questions connues', mastered: 'Questions maîtrisées',
          masteredRatio: 'Connaissances (%)', categoriesPlayed: 'Catégories jouées',
          categoriesMastered: 'Catégories maîtrisées', mistakesFixed: 'Erreurs corrigées',
        };
        return (L[cond.stat] || cond.stat) + ' ' + (cond.op || '>=') + ' ' + N(cond.v);
      }
      case 'cat': {
        const c = QV.data.cat(cond.cat);
        const L = { quizzes: 'quiz sur', accuracy: '% de réussite sur', mastery: '% de maîtrise sur', best: '% de record sur' };
        return (cond.v) + ' ' + (L[cond.op] || cond.op) + ' ' + (c ? c.label : cond.cat);
      }
      case 'sub': {
        const s = QV.data.sub(cond.cat, cond.sub);
        const L = { quizzes: 'quiz sur', accuracy: '% de réussite sur', mastery: '% de maîtrise sur', best: '% de record sur' };
        return (cond.v) + ' ' + (L[cond.op] || cond.op) + ' ' + (s ? s.label : cond.sub);
      }
      case 'mode': {
        const M = QV.quiz.MODES;
        const m = M.filter(function (x) { return x.id === cond.mode; })[0];
        return 'Jouer ' + cond.v + ' fois le mode ' + (m ? m.label : cond.mode);
      }
      case 'type': {
        const T = { vf: 'vrai/faux', multi: 'plusieurs réponses', guess: 'devine', image: 'image', qcm: 'QCM' };
        return 'Répondre juste à ' + cond.v + ' questions ' + (T[cond.type] || cond.type);
      }
      case 'diff': {
        const D = QV.data.DIFF_LABEL;
        return 'Terminer ' + cond.v + ' quiz ' + (D[cond.diff] || cond.diff);
      }
      case 'special': {
        const S = {
          perfect: 'Obtenir un score parfait',
          speedrun: 'Répondre juste en moins de 4 secondes',
          survivor: 'Survivre à 15 questions d’affilée',
          comeback: 'Réussir 5 questions d’affilée après une erreur',
          marathon: 'Terminer un quiz de 30 questions ou plus',
          daily: 'Terminer le quiz du jour',
          dailyStreak: 'Jouer au quiz du jour ' + (cond.v || 7) + ' jours d’affilée',
          survivor10: 'Terminer le mode Survie avec 10 bonnes réponses',
          infini20: 'Atteindre 20 questions en mode Infini',
          chrono: 'Gagner un quiz en mode Chrono',
          night: 'Jouer un quiz entre 0 h et 5 h du matin',
          comeback5: 'Enchaîner 5 bonnes réponses après une erreur',
          allCats: 'Jouer dans toutes les catégories',
          tenCats: 'Jouer dans 10 catégories différentes',
          fiftyBadges: 'Débloquer 50 badges',
          perfectDaily: 'Réussir le quiz du jour à 100 %',
          hardMode: 'Terminer un quiz en mode expert',
          mixed: 'Terminer un quiz avec au moins 5 univers différents',
        };
        return S[cond.special] || cond.special;
      }
      default: return JSON.stringify(cond);
    }
  }

  /**
   * Évalue une condition.
   * @param {object} cond
   * @param {object} [p] profil
   * @param {object} [st] statistiques
   */
  function evalCondition(cond, p, st) {
    if (!cond) return true;
    p = p || QV.xp.profile();
    st = st || QV.store.loadStats();
    st.flags = st.flags || {};
    const op = OPS[cond.op || '>='] || OPS['>='];

    switch (cond.k) {
      case 'stat': {
        const v = statValue(st, p, cond.stat);
        return op(v, cond.v);
      }
      case 'cat': return op(catValue(st, cond.cat, cond.op || 'quizzes'), cond.v);
      case 'sub': return op(subValue(st, cond.cat, cond.sub, cond.op || 'quizzes'), cond.v);
      case 'mode': return op((st.byMode && st.byMode[cond.mode]) || 0, cond.v);
      case 'type': {
        const t = (st.byType && st.byType[cond.type]) || { count: 0, correct: 0 };
        return op(cond.op === 'count' ? t.count : t.correct, cond.v);
      }
      case 'diff': return op((st.byDiff && st.byDiff[cond.diff] && st.byDiff[cond.diff].quizzes) || 0, cond.v);
      case 'special': return op(st.flags[cond.special] || 0, cond.v === undefined ? 1 : cond.v);
      case 'and': return cond.all.every(function (c) { return evalCondition(c, p, st); });
      case 'or': return cond.any.some(function (c) { return evalCondition(c, p, st); });
      default: return false;
    }
  }

  /* ------------------------------------------------------ Suivi flags */

  function setFlag(name, value) {
    const st = QV.store.loadStats();
    st.flags = st.flags || {};
    if (value === undefined) st.flags[name] = (st.flags[name] || 0) + 1;
    else st.flags[name] = value;
    QV.store.saveStats(st);
  }

  function bumpFlag(name, by) {
    const st = QV.store.loadStats();
    st.flags = st.flags || {};
    st.flags[name] = (st.flags[name] || 0) + (by === undefined ? 1 : by);
    QV.store.saveStats(st);
  }

  function flag(name) {
    const st = QV.store.loadStats();
    return (st.flags && st.flags[name]) || 0;
  }

  /** Journalise le résultat d'une partie (types de questions, drapeaux). */
  function trackRun(res) {
    const st = QV.store.loadStats();
    st.byType = st.byType || {};
    (res.typeStats || []).forEach(function (t) {
      if (!st.byType[t.type]) st.byType[t.type] = { count: 0, correct: 0 };
      st.byType[t.type].count += t.count;
      st.byType[t.type].correct += t.correct;
    });
    QV.store.saveStats(st);

    if (res.correct === res.answered && res.answered > 0) bumpFlag('perfect');
    if (res.fastest !== undefined && res.fastest > 0 && res.fastest < 4000 && res.correct > 0) bumpFlag('speedrun');
    if (res.bestStreak >= 15) bumpFlag('survivor');
    if (res.survivorWins >= 10) bumpFlag('survivor10');
    if (res.infiniBest >= 20) bumpFlag('infini20');
    if (res.answered >= 30) bumpFlag('marathon');
    if (res.mode === 'chrono' && res.answered > 0) bumpFlag('chrono');
    if (res.mode === 'expert' || res.diff === 'expert') bumpFlag('hardMode');
    if (res.comesBack) bumpFlag('comeback5');
    const h = new Date().getHours();
    if (h < 5) bumpFlag('night');
    const distinctSubs = res.subIds ? U.unique(res.subIds).length : 0;
    if (distinctSubs >= 5) bumpFlag('mixed');

    const catsPlayed = Object.keys(QV.store.loadStats().byCat || {}).length;
    if (catsPlayed >= 10) bumpFlag('tenCats');
    const totalCats = QV.data.categories.length;
    if (catsPlayed >= totalCats) bumpFlag('allCats');
  }

  /* -------------------------------------------------- Déblocage badges */

  /**
   * Vérifie tous les badges et débloque ceux dont la condition est remplie.
   * @returns {Array} badges nouvellement débloqués
   */
  function check(flags) {
    const p = QV.xp.profile();
    const st = QV.store.loadStats();
    const owned = QV.store.loadBadges();
    const list = QV.data.state.achievements || [];
    const newly = [];

    list.forEach(function (b) {
      if (owned[b.id]) return;
      let ok = false;
      try { ok = evalCondition(b.cond, p, st); } catch (e) { ok = false; }
      if (!ok) return;
      owned[b.id] = { at: Date.now(), name: b.name, icon: b.icon, group: b.group, xp: b.xp || 0 };
      newly.push(b);
    });

    if (newly.length) {
      QV.store.saveBadges(owned);
      let xpTotal = 0;
      newly.forEach(function (b) { xpTotal += b.xp || 0; });
      if (xpTotal > 0) {
        const r = QV.xp.addXp(xpTotal);
        newly.push({ _xpTotal: xpTotal, _levelUp: r && r.leveledUp, _after: r && r.after });
      }
      newly.forEach(function (b) {
        if (b._xpTotal) return;
        QV.music.sfx('badge');
        QV.ui.toast('Badge débloqué : ' + b.name, b.desc + (b.xp ? ' · +' + b.xp + ' XP' : ''), 'badge', 5600);
      });
    }
    return newly;
  }

  function ownedMap() {
    return QV.store.loadBadges();
  }

  function progressOf(b, p, st) {
    // Progression approximative pour l'affichage (0-100)
    const c = b.cond;
    if (!c) return 100;
    p = p || QV.xp.profile(); st = st || QV.store.loadStats();
    let cur = 0, goal = c.v || 1;
    switch (c.k) {
      case 'stat': cur = statValue(st, p, c.stat); break;
      case 'cat': cur = catValue(st, c.cat, c.op || 'quizzes'); break;
      case 'sub': cur = subValue(st, c.cat, c.sub, c.op || 'quizzes'); break;
      case 'mode': cur = (st.byMode && st.byMode[c.mode]) || 0; break;
      case 'type': cur = ((st.byType || {})[c.type] || { count: 0, correct: 0 })[c.op === 'count' ? 'count' : 'correct']; break;
      case 'diff': cur = ((st.byDiff || {})[c.diff] || { quizzes: 0 }).quizzes; break;
      case 'special': cur = (st.flags || {})[c.special] || 0; break;
      default: return 100;
    }
    return goal > 0 ? U.clamp((cur / goal) * 100, 0, 100) : 100;
  }

  /* ================================================== PAGE DES BADGES == */

  V.badges = function () {
    const page = el('div.qv-page-enter');
    const all = QV.data.state.achievements || [];
    const owned = QV.store.loadBadges();
    const p = QV.xp.profile();
    const st = QV.store.loadStats();
    const unlocked = all.filter(function (b) { return owned[b.id]; });
    const groups = {};
    all.forEach(function (b) {
      const g = b.group || 'Divers';
      if (!groups[g]) groups[g] = [];
      groups[g].push(b);
    });
    const groupOrder = ['Progression', 'Volume', 'Séries', 'Perfection', 'Vitesse', 'Spécialiste', 'Exploration', 'Maîtrise', 'Divers'];

    page.appendChild(el('div.page-head', null, [
      el('div.page-head__eyebrow', { text: '🏅 BADGES' }),
      el('div.page-head__row', null, [
        el('div', null, [
          el('h1', { text: 'Mes badges' }),
          el('p.page-head__sub', { text: unlocked.length + ' badge' + (unlocked.length > 1 ? 's' : '') + ' débloqué' + (unlocked.length > 1 ? 's' : '') + ' sur ' + all.length + '. Chaque badge donne aussi de l’XP.' }),
        ]),
        el('span.pill.pill--accent', { text: U.pct(all.length ? (unlocked.length / all.length) * 100 : 0) }),
      ]),
    ]));

    page.appendChild(el('div.panel.mb-5', null, [
      el('div.bar.bar--lg', null, [el('i.bar__fill', { style: { width: (all.length ? (unlocked.length / all.length) * 100 : 0) + '%' } })]),
    ]));

    if (!all.length) {
      page.appendChild(QV.ui.emptyState('🏅', 'Aucun badge configuré', 'Le fichier data/achievements.json est vide.'));
      return page;
    }

    Object.keys(groups).sort(function (a, b) {
      const ia = groupOrder.indexOf(a), ib = groupOrder.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    }).forEach(function (g) {
      const list = groups[g];
      const got = list.filter(function (b) { return owned[b.id]; }).length;
      page.appendChild(el('section.section', null, [
        QV.ui.sectionHead(g + ' · ' + got + '/' + list.length, null, null, '🏅'),
        el('div.grid.grid--badges.qv-stagger', null, list.map(function (b) {
          const own = owned[b.id];
          const prog = QV.achievements.progressOf(b, p, st);
          const tile = el('div.badge-tile' + (own ? '.is-unlocked' : '.is-locked'), {
            tabindex: '0', role: 'button', 'aria-label': b.name + ' : ' + b.desc,
          }, [
            b.xp ? el('span.badge-tile__xp', { text: '+' + b.xp }) : null,
            el('span.badge-tile__icon', { text: b.icon, 'aria-hidden': 'true' }),
            el('span.badge-tile__name', { text: b.name }),
            own ? el('span.badge-tile__date', { text: U.dateLong(own.at) }) : null,
          ]);
          const open = function () { showBadge(b, own, prog); };
          tile.addEventListener('click', open);
          tile.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
          return tile;
        })),
      ]));
    });

    return page;
  };

  function showBadge(b, own, prog) {
    QV.ui.modal({
      title: b.icon + ' ' + b.name,
      html: '<p>' + U.esc(b.desc) + '</p>'
        + '<p class="text-sm"><strong>Condition :</strong> ' + U.esc(conditionText(b.cond)) + '</p>'
        + (b.xp ? '<p class="text-sm"><strong>Récompense :</strong> +' + b.xp + ' XP</p>' : '')
        + (own
          ? '<p class="text-sm" style="color:var(--green)">✅ Débloqué le ' + U.esc(U.dateLong(own.at)) + '</p>'
          : '<p class="text-sm text-3">🔒 Verrouillé · progression : ' + Math.round(prog) + ' %</p>'),
      node: own ? null : el('div.bar.mt-3', null, [el('i.bar__fill', { style: { width: Math.round(prog) + '%' } })]),
      actions: [{ label: 'Fermer', kind: 'ghost' }],
    });
  }

  QV.achievements = {
    evalCondition: evalCondition,
    conditionText: conditionText,
    statValue: statValue,
    check: check,
    ownedMap: ownedMap,
    progressOf: progressOf,
    setFlag: setFlag,
    bumpFlag: bumpFlag,
    flag: flag,
    trackRun: trackRun,
  };
})(window);
