/* ==========================================================================
   QuizVerse — recommandations personnalisées (100 % locales)
   --------------------------------------------------------------------------
   Tout est calculé à partir des données du joueur stockées dans son
   navigateur : historique, statistiques, maîtrise, favoris, erreurs.
   Aucune donnée n'est envoyée sur un serveur.
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});
  const U = QV.util;

  /**
   * Retourne une liste de recommandations classées par pertinence.
   * @param {number} limit
   */
  function build(limit) {
    const st = QV.store.loadStats();
    const p = QV.xp.profile();
    const hist = QV.store.loadHistory();
    const out = [];
    const cats = QV.data.categories;

    const played = Object.keys(st.byCat || {});
    const isNewbie = st.quizzes < 3;

    /* 1. Parcours de bienvenue ---------------------------------------- */
    if (isNewbie) {
      const starters = [
        { title: 'Première mission', text: 'Termine un quiz de 10 questions pour débloquer ton premier badge et 150 XP.', href: '#/surprise', icon: '🚀' },
        { title: 'Choisis ton univers', text: 'Parcours les catégories pour trouver le monde qui te parle.', href: '#/categories', icon: '🧭' },
        { title: 'Quiz du jour', text: 'Un quiz tout neuf t’attend chaque jour, avec une récompense unique.', href: '#/quiz-du-jour', icon: '📅' },
      ];
      starters.forEach(function (s, i) {
        out.push({ kind: 'onboard', title: s.title, text: s.text, href: s.href, icon: s.icon, score: 100 - i });
      });
      return out.slice(0, limit || 5);
    }

    /* 2. Montée en difficulté sur les univers maîtrisés ----------------- */
    const masteredSubs = [];
    cats.forEach(function (cat) {
      QV.data.subsOf(cat.id).forEach(function (s) {
        const sum = QV.mastery.subSummary(cat.id, s.id);
        const pool = sum.perfect + sum.mastered + sum.known + sum.learning + sum.never + sum.fresh;
        if (pool < 6) return;
        const solid = (sum.perfect + sum.mastered) / pool;
        const knowledge = (sum.perfect + sum.mastered + sum.known) / pool;
        masteredSubs.push({ cat: cat, sub: s, solid: solid, knowledge: knowledge, pool: pool });
      });
    });
    masteredSubs.sort(function (a, b) { return (b.solid + b.knowledge) - (a.solid + a.knowledge); });

    masteredSubs.slice(0, 6).forEach(function (m) {
      const cur = ((st.bySub && st.bySub[m.cat.id + '/' + m.sub.id]) || {}).best || 0;
      const order = ['facile', 'moyen', 'difficile', 'expert'];
      const nextDiff = order[Math.min(3, order.indexOf(bestDiffOf(m)) + 1)] || 'expert';
      if (m.solid < 0.55) return;
      const quiz = QV.data.quizzes.filter(function (q) { return q.cat === m.cat.id && q.sub === m.sub.id && q.diff === nextDiff; })[0];
      if (!quiz) return;
      out.push({
        kind: 'levelup',
        title: 'Tu maîtrises ' + m.sub.label + '. Pousse plus loin.',
        text: 'Tu as ' + U.pct(m.solid) + ' de questions maîtrisées sur « ' + m.sub.label + ' ». Un quiz ' + QV.data.DIFF_LABEL[nextDiff].toLowerCase() + ' t’attend (ton record : ' + (cur ? cur + ' %' : 'aucun') + ').',
        href: '#/quiz/' + encodeURIComponent(quiz.id),
        icon: m.cat.emoji,
        score: 90 + m.solid * 20,
      });
    });

    /* 3. Renforcer les univers faibles --------------------------------- */
    cats.forEach(function (cat) {
      const prog = QV.xp.catProgress(cat.id);
      if (!prog.quizzes) return;
      if (prog.accuracy >= 55) return;
      const quiz = QV.data.quizzes.filter(function (q) { return q.cat === cat.id && q.diff === 'facile'; })[0]
        || QV.data.quizzes.filter(function (q) { return q.cat === cat.id; })[0];
      if (!quiz) return;
      out.push({
        kind: 'weak',
        title: cat.label + ' : encore un effort',
        text: 'Ton taux de réussite sur ' + cat.label + ' est de ' + U.pct(prog.accuracy) + '. Un quiz facile pour consolider les bases.',
        href: '#/quiz/' + encodeURIComponent(quiz.id),
        icon: '🎯',
        score: 85,
      });
    });

    /* 4. Mes erreurs à retravailler ------------------------------------- */
    const mistakes = QV.mastery.mistakesList({ includeFixed: false });
    if (mistakes.length >= 3) {
      out.push({
        kind: 'mistakes',
        title: mistakes.length + ' questions à retravailler',
        text: 'Tu asRecently raté ' + mistakes.length + ' questions. Rejoue uniquement celles-ci pour ancrer tes acquis.',
        href: '#/mes-erreurs',
        icon: '🔁',
        score: 95 + Math.min(10, mistakes.length / 4),
      });
    }

    /* 5. Connaissances à consolider ------------------------------------ */
    const weak = QV.mastery.questionsByLevel('m-learning').concat(QV.mastery.questionsByLevel('m-never'));
    if (weak.length >= 5) {
      out.push({
        kind: 'weakq',
        title: 'Consolide tes connaissances',
        text: weak.length + ' questions sont classées « à apprendre » ou « jamais réussies ». Un quiz ciblé sur ces questions.',
        href: '#/creer-mon-quiz?preset=weak',
        icon: '🧠',
        score: 88,
      });
    }

    /* 6. Variété : univers jamais joués --------------------------------- */
    const unseen = cats.filter(function (c) { return !(st.byCat && st.byCat[c.id]); });
    if (unseen.length) {
      const pickCat = unseen[Math.floor(Math.random() * unseen.length)];
      out.push({
        kind: 'discover',
        title: 'Découvre ' + pickCat.label,
        text: pickCat.subs.length + ' univers et ' + QV.data.questionsIn(pickCat.id, null, null).length + ' questions t’attendent. Unknown territory.',
        href: '#/categorie/' + encodeURIComponent(pickCat.id),
        icon: pickCat.emoji,
        score: 80,
      });
    }

    /* 7. Reprendre un quiz récent --------------------------------------- */
    const recent = hist.filter(function (h) { return h.kind === 'quiz'; }).slice(0, 3);
    if (recent.length) {
      const h = recent[0];
      out.push({
        kind: 'replay',
        title: 'Reprendre : ' + h.title,
        text: 'Tu as obtenu ' + h.pct + ' % ' + U.timeAgo(h.at) + '. Un nouveau passage pour dépasser ton record ?',
        href: h.quizId ? '#/quiz/' + encodeURIComponent(h.quizId) : '#/historique',
        icon: '⏪',
        score: 70,
      });
    }

    /* 8. Difficulté supérieure à son niveau ---------------------------- */
    const lvl = QV.xp.levelInfo(p.xp);
    if (lvl.level >= 5 && played.length) {
      out.push({
        kind: 'challenge',
        title: 'Niveau ' + lvl.level + ' — releve le niveau',
        text: 'Tu as ' + U.num(st.correct) + ' bonnes réponses au total. Un quiz expert sur un univers déjà commencé ?',
        href: '#/explorer?tab=difficile',
        icon: '🔥',
        score: 60,
      });
    }

    out.sort(function (a, b) { return b.score - a.score; });

    // Dédoublonnage par titre
    const seenTitles = {};
    const dedup = [];
    out.forEach(function (r) {
      if (seenTitles[r.title]) return;
      seenTitles[r.title] = 1;
      dedup.push(r);
    });
    return dedup.slice(0, limit || 6);
  }

  function bestDiffOf(m) {
    const st = QV.store.loadStats();
    const c = (st.bySub && st.bySub[m.cat.id + '/' + m.sub.id]) || { quizzes: 0 };
    if (!c.quizzes) return null;
    const pool = QV.data.questionsIn(m.cat.id, m.sub.id, null);
    let best = 'facile', bestScore = -1;
    ['facile', 'moyen', 'difficile', 'expert'].forEach(function (d) {
      const n = pool.filter(function (q) { return q.diff === d; }).length;
      if (n >= 3 && n > bestScore) { bestScore = n; best = d; }
    });
    return best;
  }

  /** Message d'accueil personnalisé. */
  function greeting() {
    const st = QV.store.loadStats();
    const p = QV.xp.profile();
    const lvl = QV.xp.levelInfo(p.xp);
    const h = new Date().getHours();
    const part = h < 5 ? 'Bonne nuit' : h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
    const name = p.pseudo ? ' ' + p.pseudo : '';
    if (st.quizzes === 0) return part + name + ' — prêt pour ta première partie ?';
    return part + name + ' · niveau ' + lvl.level + ' · ' + U.num(st.correct) + ' bonnes réponses';
  }

  QV.recommend = { build: build, greeting: greeting };
})(window);
