/* ==========================================================================
   QuizVerse — maîtrise des connaissances (système de niveau par question)
   --------------------------------------------------------------------------
   🔴 Jamais réussie   m-never
   🟠 À apprendre      m-learning
   🟡 Connue          m-known
   🟢 Maîtrisée       m-mastered
   🔵 Parfaite        m-perfect
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});
  const U = QV.util;

  const LEVELS = [
    { id: 'm-perfect', label: 'Parfaite', emoji: '🔵', color: 'var(--cyan)', desc: 'Réussie du premier coup, plusieurs fois.' },
    { id: 'm-mastered', label: 'Maîtrisée', emoji: '🟢', color: 'var(--green)', desc: 'Réussie régulièrement avec au moins 80 % de réussite.' },
    { id: 'm-known', label: 'Connue', emoji: '🟡', color: 'var(--yellow)', desc: 'Tu la connais mais ce n’est pas encore automatique.' },
    { id: 'm-learning', label: 'À apprendre', emoji: '🟠', color: '#fb923c', desc: 'Quelques erreurs, il faut la retravailler.' },
    { id: 'm-never', label: 'Jamais réussie', emoji: '🔴', color: 'var(--red)', desc: 'Jamais trouvée, ou uniquement ratée.' },
    { id: 'm-new', label: 'Jamais vue', emoji: '⚪', color: 'var(--text-3)', desc: 'Question que tu n’as encore jamais rencontrée.' },
  ];

  function all() {
    return QV.store.loadMastery();
  }

  function get(qid) {
    return all()[qid] || null;
  }

  function levelOf(rec) {
    if (!rec || !rec.seen) return 'm-new';
    const a = rec.attempts || 0;
    const c = rec.correct || 0;
    const ft = rec.firstTry || 0;
    if (c === 0) return 'm-never';
    const acc = a ? c / a : 0;
    if (ft >= 2 && acc >= 0.9) return 'm-perfect';
    if (acc >= 0.8 && a >= 2) return 'm-mastered';
    if (acc >= 0.5 || c >= 2) return 'm-known';
    return 'm-learning';
  }

  const LEVEL_META = {};
  LEVELS.forEach(function (l) { LEVEL_META[l.id] = l; });

  function meta(id) {
    return LEVEL_META[id] || LEVEL_META['m-new'];
  }

  /**
   * Enregistre la réponse à une question.
   * @param {string} qid
   * @param {boolean} correct
   * @param {boolean} firstTry  première rencontre avec cette question
   */
  function record(qid, correct, firstTry) {
    const map = all();
    let r = map[qid];
    if (!r) {
      r = { seen: 0, attempts: 0, correct: 0, wrong: 0, firstTry: 0, streak: 0, best: 0, last: 0 };
      map[qid] = r;
    }
    r.seen += 1;
    r.attempts += 1;
    r.last = Date.now();
    if (correct) {
      r.correct += 1;
      r.streak += 1;
      r.best = Math.max(r.best, r.streak);
      if (firstTry) r.firstTry += 1;
    } else {
      r.wrong += 1;
      r.streak = 0;
    }
    QV.store.saveMastery(map);
    return { rec: r, level: levelOf(r), before: firstTry ? 'm-new' : null };
  }

  /* --------------------------------------------------------- Erreurs -- */

  function recordMistake(question, chosenIdx) {
    const map = QV.store.loadMistakes();
    const entry = map[question.id] || { times: 0, last: 0, chosen: [], fixed: false };
    entry.times += 1;
    entry.last = Date.now();
    entry.fixed = false;
    if (chosenIdx !== undefined && chosenIdx !== null && entry.chosen.indexOf(chosenIdx) < 0) {
      entry.chosen.push(chosenIdx);
    }
    map[question.id] = entry;
    QV.store.saveMistakes(map);
  }

  /** Marque une erreur comme corrigée (réussie depuis « Mes erreurs »). */
  function fixMistake(qid) {
    const map = QV.store.loadMistakes();
    if (map[qid]) {
      map[qid].fixed = true;
      map[qid].fixedAt = Date.now();
      QV.store.saveMistakes(map);
    }
  }

  function mistakesList(opts) {
    const o = opts || {};
    const map = QV.store.loadMistakes();
    const ids = Object.keys(map).filter(function (id) {
      const e = map[id];
      if (!e || !e.times) return false;
      if (o.includeFixed === false && e.fixed) return false;
      if (o.cat && (QV.data.byId.get(id) || {}).cat !== o.cat) return false;
      return true;
    });
    ids.sort(function (a, b) { return (map[b].last || 0) - (map[a].last || 0); });
    const byId = QV.data.state.byId;
    return ids.map(function (id) {
      const q = byId.get(id);
      return q ? { question: q, entry: map[id] } : null;
    }).filter(Boolean);
  }

  function clearMistakes() {
    QV.store.saveMistakes({});
  }

  /* ------------------------------------------------------- Résumés -- */

  function summary() {
    const map = all();
    const counts = { 'm-perfect': 0, 'm-mastered': 0, 'm-known': 0, 'm-learning': 0, 'm-never': 0, 'm-new': 0 };
    let seen = 0;
    Object.keys(map).forEach(function (id) {
      const l = levelOf(map[id]);
      counts[l] = (counts[l] || 0) + 1;
      seen += 1;
    });
    const total = QV.data.questions.length;
    counts['m-new'] += Math.max(0, total - seen);
    const known = counts['m-perfect'] + counts['m-mastered'] + counts['m-known'];
    return {
      counts: counts,
      total: total,
      seen: seen,
      known: known,
      solid: counts['m-perfect'] + counts['m-mastered'],
      progress: total ? (known / total) * 100 : 0,
    };
  }

  /** Statistiques de maîtrise pour une catégorie. */
  function catSummary(catId) {
    const map = all();
    const pool = QV.data.questionsIn(catId, null, null);
    const c = { perfect: 0, mastered: 0, known: 0, learning: 0, never: 0, fresh: 0 };
    pool.forEach(function (q) {
      const rec = map[q.id];
      const l = levelOf(rec);
      if (l === 'm-perfect') c.perfect++;
      else if (l === 'm-mastered') c.mastered++;
      else if (l === 'm-known') c.known++;
      else if (l === 'm-learning') c.learning++;
      else if (l === 'm-never') c.never++;
      else c.fresh++;
    });
    return c;
  }

  /** Statistiques de maîtrise pour un univers (cat/sub). */
  function subSummary(catId, subId) {
    const map = all();
    const pool = QV.data.questionsIn(catId, subId, null);
    const c = { perfect: 0, mastered: 0, known: 0, learning: 0, never: 0, fresh: 0 };
    pool.forEach(function (q) {
      const rec = map[q.id];
      const l = levelOf(rec);
      if (l === 'm-perfect') c.perfect++;
      else if (l === 'm-mastered') c.mastered++;
      else if (l === 'm-known') c.known++;
      else if (l === 'm-learning') c.learning++;
      else if (l === 'm-never') c.never++;
      else c.fresh++;
    });
    return c;
  }

  /** Questions triées par niveau de maîtrise. */
  function questionsByLevel(levelId, filters) {
    const f = filters || {};
    const map = all();
    let pool = QV.data.questions.slice();
    if (f.cat) pool = pool.filter(function (q) { return q.cat === f.cat; });
    if (f.sub) pool = pool.filter(function (q) { return q.cat === f.sub.split('/')[0] && q.sub === f.sub.split('/')[1]; });
    if (f.diff) pool = pool.filter(function (q) { return q.diff === f.diff; });
    if (levelId === 'm-new') return pool.filter(function (q) { return !map[q.id]; });
    return pool.filter(function (q) { return levelOf(map[q.id]) === levelId; });
  }

  QV.mastery = {
    LEVELS: LEVELS,
    meta: meta,
    levelOf: levelOf,
    get: get,
    all: all,
    record: record,
    summary: summary,
    catSummary: catSummary,
    subSummary: subSummary,
    questionsByLevel: questionsByLevel,
    recordMistake: recordMistake,
    fixMistake: fixMistake,
    mistakesList: mistakesList,
    clearMistakes: clearMistakes,
  };
})(window);
