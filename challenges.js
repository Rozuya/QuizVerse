/* ==========================================================================
   QuizVerse — défis personnels (quotidiens, hebdomadaires, permanents)
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});
  const U = QV.util;
  const el = U.el;
  const V = (QV.views = QV.views || {});

  function list() {
    return QV.data.state.challenges || [];
  }

  function scopeKey(scope) {
    if (scope === 'daily') return U.dayKey();
    if (scope === 'weekly') return U.weekKey();
    return 'all';
  }

  function bucket(scope) {
    const all = QV.store.loadChallenges();
    const k = scopeKey(scope);
    if (!all[scope]) all[scope] = {};
    if (!all[scope][k]) all[scope][k] = {};
    return all[scope][k];
  }

  function save(all) { QV.store.saveChallenges(all); }

  /* ------------------------------------------------- Calcul de valeur -- */

  /**
   * Valeur atteinte pour un défi, dans la fenêtre de son périmètre.
   * @param {object} c défi
   * @returns {number}
   */
  function valueOf(c) {
    if (c.scope === 'permanent') return permanentValue(c);
    return windowValue(c, scopeWindow(c.scope));
  }

  function scopeWindow(scope) {
    const st = QV.store.loadStats();
    const days = [];
    if (scope === 'daily') return [U.dayKey()];
    if (scope === 'weekly') {
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(U.dayKey(d));
      }
      return days;
    }
    return Object.keys(st.byDay || {});
  }

  function sumDays(days, field) {
    const st = QV.store.loadStats();
    let t = 0;
    days.forEach(function (d) { if (st.byDay[d]) t += st.byDay[d][field] || 0; });
    return t;
  }

  function permanentValue(c) {
    const st = QV.store.loadStats();
    const p = QV.xp.profile();
    const hist = QV.store.loadHistory();
    switch (c.metric) {
      case 'quizzes': return st.quizzes;
      case 'questions': return st.questions;
      case 'correct': return st.correct;
      case 'xp': return p.xp;
      case 'perfect': return st.perfects;
      case 'badges': return Object.keys(QV.store.loadBadges()).length;
      case 'bestScore': return st.bestScore;
      case 'streak': return st.bestStreak;
      case 'playDays': return (p.playDays || []).length;
      case 'time': return st.timePlayed;
      case 'accuracy': return st.questions ? (st.correct / st.questions) * 100 : 0;
      case 'cat': return ((st.byCat || {})[c.cat] || {}).quizzes || 0;
      case 'catCorrect': return ((st.byCat || {})[c.cat] || {}).correct || 0;
      case 'catBest': return ((st.byCat || {})[c.cat] || {}).best || 0;
      case 'sub': return ((st.bySub || {})[c.cat + '/' + c.sub] || {}).quizzes || 0;
      case 'mode': return (st.byMode || {})[c.mode] || 0;
      case 'knowledge': return QV.mastery.summary().known;
      case 'mastered': return QV.mastery.summary().solid;
      case 'mistakesFixed': {
        const m = QV.store.loadMistakes();
        return Object.keys(m).filter(function (k) { return m[k].fixed; }).length;
      }
      case 'totalTime': {
        let t = 0;
        hist.forEach(function (h) { t += h.time || 0; });
        return t;
      }
      default: return 0;
    }
  }

  function windowValue(c, days) {
    const st = QV.store.loadStats();
    switch (c.metric) {
      case 'quizzes': return sumDays(days, 'quizzes');
      case 'questions': return sumDays(days, 'questions');
      case 'correct': return sumDays(days, 'correct');
      case 'xp': return sumDays(days, 'xp');
      case 'perfect': {
        let n = 0;
        days.forEach(function (d) {
          const b = st.byDay[d];
          if (b && b.quizzes && b.correct === b.questions && b.questions > 0) n++;
        });
        return n;
      }
      case 'bestScore': {
        let n = 0;
        days.forEach(function (d) {
          const b = st.byDay[d];
          if (b && b.quizzes && b.score > 0) n += b.score / b.quizzes;
        });
        return n;
      }
      case 'streak': {
        // Meilleure série de bonnes réponses sur la période
        let best = 0;
        const hist = QV.store.loadHistory();
        hist.forEach(function (h) {
          if (days.indexOf(h.day) >= 0) best = Math.max(best, h.bestStreak || 0);
        });
        return best;
      }
      case 'cat': {
        let n = 0;
        const hist = QV.store.loadHistory();
        hist.forEach(function (h) { if (days.indexOf(h.day) >= 0 && h.cat === c.cat) n++; });
        return n;
      }
      case 'mode': {
        let n = 0;
        const hist = QV.store.loadHistory();
        hist.forEach(function (h) { if (days.indexOf(h.day) >= 0 && h.mode === c.mode) n++; });
        return n;
      }
      case 'daily': {
        const d = QV.store.loadDaily();
        return days.filter(function (k) { return d[k]; }).length;
      }
      default: return 0;
    }
  }

  /* ------------------------------------------------------------ API --- */

  /** Tous les défis avec leur avancement. */
  function allWithProgress() {
    const groups = { daily: [], weekly: [], permanent: [] };
    list().forEach(function (c) {
      const v = valueOf(c);
      const b = bucket(c.scope);
      const state = b[c.id] || { done: false, claimed: false };
      groups[c.scope].push({
        def: c,
        value: v,
        goal: c.goal,
        pct: c.goal > 0 ? U.clamp((v / c.goal) * 100, 0, 100) : 0,
        complete: v >= c.goal,
        claimed: state.claimed,
        done: state.done,
      });
    });
    Object.keys(groups).forEach(function (k) {
      groups[k].sort(function (a, b) {
        if (a.claimed !== b.claimed) return a.claimed ? 1 : -1;
        if (a.complete !== b.complete) return a.complete ? 1 : -1;
        return (a.def.order || 0) - (b.def.order || 0);
      });
    });
    return groups;
  }

  /** Récompense d'un défi (XP ou badge). */
  function rewardOf(c) {
    if (c.reward && c.reward.badge) {
      const owned = QV.ownedBadges ? QV.ownedBadges() : {};
      return owned[c.reward.badge] ? null : c.reward;
    }
    return { xp: c.xp || 0 };
  }

  /** Récupère la récompense d'un défi terminé. */
  function claim(scope, id) {
    const c = list().filter(function (x) { return x.id === id; })[0];
    if (!c) return null;
    const v = valueOf(c);
    if (v < c.goal) return null;
    const all = QV.store.loadChallenges();
    if (!all[scope]) all[scope] = {};
    const k = scopeKey(scope);
    if (!all[scope][k]) all[scope][k] = {};
    const st = all[scope][k][id] || { done: false, claimed: false };
    if (st.claimed) return null;
    st.done = true;
    st.claimed = true;
    st.at = Date.now();
    all[scope][k][id] = st;
    // Nettoyage : on ne garde que les 30 dernières périodes
    const keys = Object.keys(all[scope]);
    if (keys.length > 30) keys.sort().slice(0, keys.length - 30).forEach(function (kk) { delete all[scope][kk]; });
    QV.store.saveChallenges(all);

    let result = { xp: 0, badge: null, leveledUp: false };
    if (c.xp) {
      const r = QV.xp.addXp(c.xp);
      result.xp = c.xp;
      result.leveledUp = !!(r && r.leveledUp);
      result.after = r && r.after;
    }
    if (c.reward && c.reward.badge) {
      const owned = QV.store.loadBadges();
      if (!owned[c.reward.badge]) {
        const def = (QV.data.state.achievements || []).filter(function (b) { return b.id === c.reward.badge; })[0];
        owned[c.reward.badge] = { at: Date.now(), name: def ? def.name : c.reward.badge, icon: def ? def.icon : '🏅', group: def ? def.group : 'Défis', xp: 0, fromChallenge: true };
        QV.store.saveBadges(owned);
        result.badge = def || { name: c.reward.badge, icon: '🏅' };
      }
    }
    QV.music.sfx(result.badge ? 'badge' : 'correct');
    return result;
  }

  /** Récompense automatiquement les défis terminés (utilisé en fin de partie). */
  function autoClaim(scope) {
    const groups = allWithProgress();
    const results = [];
    (groups[scope] || []).forEach(function (g) {
      if (g.complete && !g.claimed) {
        const r = claim(scope, g.def.id);
        if (r) results.push({ challenge: g.def, result: r });
      }
    });
    return results;
  }

  function pendingCount() {
    const g = allWithProgress();
    let n = 0;
    ['daily', 'weekly', 'permanent'].forEach(function (k) {
      (g[k] || []).forEach(function (c) { if (c.complete && !c.claimed) n++; });
    });
    return n;
  }

  /** Texte d'avancement lisible. */
  function valueLabel(c) {
    if (c.metric === 'xp') return U.num(valueOf(c)) + ' / ' + U.num(c.goal) + ' XP';
    if (c.metric === 'bestScore' || c.metric === 'accuracy' || c.metric === 'catBest') return U.pct(valueOf(c)) + ' sur ' + c.goal + '%';
    if (c.metric === 'time' || c.metric === 'totalTime') return U.duration(valueOf(c)) + ' / ' + U.duration(c.goal);
    return U.num(valueOf(c)) + ' / ' + U.num(c.goal);
  }

  /* ==================================================== PAGE DÉFIS ==== */

  V.defis = function () {
    const page = el('div.qv-page-enter');
    const groups = allWithProgress();
    const pending = pendingCount();

    page.appendChild(el('div.page-head', null, [
      el('div.page-head__eyebrow', { text: '🎯 DÉFIS' }),
      el('div.page-head__row', null, [
        el('div', null, [
          el('h1', { text: 'Défis personnels' }),
          el('p.page-head__sub', { text: 'Des objectifs quotidiens, hebdomadaires et permanents. Leur progression se met à jour automatiquement à chaque partie.' }),
        ]),
        pending ? el('a.btn.btn--primary', { href: '#/defis', text: pending + ' récompense' + (pending > 1 ? 's' : '') + ' à réclamer' }) : null,
      ]),
    ]));

    const scopes = [
      { id: 'daily', label: 'Défis quotidiens', emoji: '📅', desc: 'Se réinitialisent chaque jour à minuit.' },
      { id: 'weekly', label: 'Défis hebdomadaires', emoji: '🗓️', desc: 'Se réinitialisent chaque lundi.' },
      { id: 'permanent', label: 'Défis permanents', emoji: '🏔️', desc: 'Objectifs à long terme, une seule fois.' },
    ];

    scopes.forEach(function (sc) {
      const items = groups[sc.id] || [];
      if (!items.length) return;
      const done = items.filter(function (c) { return c.claimed; }).length;
      page.appendChild(el('section.section', null, [
        QV.ui.sectionHead(sc.label + ' · ' + done + '/' + items.length, null, null, sc.emoji),
        el('p.text-sm.text-3.mb-3', { text: sc.desc }),
        el('div.grid.grid--3', null, items.map(function (c) { return challengeCard(c, sc); })),
      ]));
    });

    if (!(groups.daily || []).length && !(groups.weekly || []).length && !(groups.permanent || []).length) {
      page.appendChild(QV.ui.emptyState('🎯', 'Aucun défi configuré', 'Le fichier data/challenges.json est vide.'));
    }

    page.appendChild(el('p.text-xs.text-3.text-center.mt-5', {
      text: 'Période actuelle : jour ' + scopeKey('daily') + ' · semaine ' + scopeKey('weekly'),
    }));

    return page;
  };

  function challengeCard(c, sc) {
    const def = c.def;
    const cls = c.claimed ? '.is-claimed' : (c.complete ? '.is-done' : '');
    const card = el('div.challenge-card' + cls, null, [
      def.xp ? el('span.challenge-card__reward', { text: '+' + U.num(def.xp) + ' XP' }) : null,
      el('div.challenge-card__head', null, [
        el('span.challenge-card__icon', { text: def.icon || '🎯', 'aria-hidden': 'true' }),
        el('div.grow', null, [
          el('div.challenge-card__name', { text: def.name }),
          el('div.challenge-card__desc', { text: def.desc }),
        ]),
      ]),
      el('div.row.row--between.text-xs', null, [
        el('span.text-3', { text: valueLabel(def) }),
        el('span.fw-700', { text: c.claimed ? '✅ Réclamé' : (c.complete ? '🎁 À réclamer' : Math.round(c.pct) + ' %') }),
      ]),
      el('div.bar' + (c.claimed ? '.bar--green' : (c.complete ? '' : '.bar--cyan')), null, [
        el('i.bar__fill', { style: { width: c.claimed ? '100%' : c.pct + '%' } }),
      ]),
      c.complete && !c.claimed
        ? el('button.btn.btn--primary.btn--sm', {
          type: 'button', text: 'Réclamer la récompense',
          onclick: function () { claimAndRefresh(sc.id, def.id); },
        })
        : null,
    ]);
    return card;
  }

  function claimAndRefresh(scope, id) {
    const r = claim(scope, id);
    if (!r) { QV.ui.toast('Déjà réclamé', '', 'info'); return; }
    const parts = [];
    if (r.xp) parts.push('+' + r.xp + ' XP');
    if (r.badge) parts.push('Badge ' + (r.badge.icon || '') + ' ' + r.badge.name);
    QV.ui.toast('Récompense obtenue', parts.join(' · '), 'xp', 4200);
    if (r.leveledUp) {
      setTimeout(function () {
        QV.ui.toast('Niveau supérieur !', 'Tu es maintenant niveau ' + r.after.level, 'xp', 4800);
        QV.music.sfx('levelup');
      }, 700);
    }
    QV.achievements.check();
    QV.app.render();
  }

  QV.challenges = {
    list: list,
    allWithProgress: allWithProgress,
    valueOf: valueOf,
    claim: claim,
    autoClaim: autoClaim,
    pendingCount: pendingCount,
    scopeKey: scopeKey,
    valueLabel: valueLabel,
  };
})(window);
