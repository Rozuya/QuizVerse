/* ==========================================================================
   QuizVerse — quiz du jour
   --------------------------------------------------------------------------
   Un quiz différent chaque jour, calculé de façon déterministe à partir de
   la date : le même jour donne toujours le même quiz, sur tous les appareils.
   La récompense n'est versée qu'une fois par jour.
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});
  const U = QV.util;

  const COUNT = 10;

  /** Identifiant du jour courant. */
  function today() {
    return U.dayKey();
  }

  /** Graine déterministe pour la date. */
  function seedFor(day) {
    return U.hashStr('quizverse-daily-' + day);
  }

  /** Métadonnées du quiz du jour. */
  function meta() {
    const day = today();
    const seed = seedFor(day);
    const rng = U.makeRng(seed);
    const pool = QV.data.questions;
    if (!pool || !pool.length) return null;

    // Difficulté du jour : cycle de 7 jours
    const dayIdx = new Date().getDay();
    const diffCycle = ['facile', 'facile', 'moyen', 'moyen', 'difficile', 'difficile', 'expert'][dayIdx];
    const poolDiff = pool.filter(function (q) { return q.diff === diffCycle; });
    const usePool = poolDiff.length >= COUNT ? poolDiff : pool;

    // Univers du jour : 3 catégories tirées au sort
    const cats = U.unique(usePool.map(function (q) { return q.cat; }));
    const chosen = U.pick(cats, Math.min(3, cats.length), rng);
    const catPool = usePool.filter(function (q) { return chosen.indexOf(q.cat) >= 0; });
    const src = catPool.length >= COUNT ? catPool : usePool;

    const questions = U.pick(src, Math.min(COUNT, src.length), rng);
    const rec = QV.store.loadDaily();
    const entry = rec[day] || null;

    return {
      day: day,
      seed: seed,
      difficulty: diffCycle,
      categories: chosen,
      categoryLabels: chosen.map(function (c) { const cat = QV.data.cat(c); return cat ? cat.label : c; }),
      count: questions.length,
      rewardXp: 150 + questions.length * 12,
      record: entry,
      played: !!entry,
    };
  }

  /** Questions du quiz du jour. */
  function questions() {
    const day = today();
    const rec = QV.store.loadDaily();
    const saved = rec[day];
    if (saved && saved.qids && saved.qids.length) {
      const qs = saved.qids.map(function (id) { return QV.data.byId.get(id); }).filter(Boolean);
      if (qs.length >= 3) return qs;
    }
    const m = meta();
    if (!m) return [];
    const rng = U.makeRng(m.seed);
    const pool = QV.data.questions.filter(function (q) { return q.diff === m.difficulty; });
    const src = pool.length >= COUNT ? pool : QV.data.questions;
    const cats = m.categories;
    const catPool = src.filter(function (q) { return cats.indexOf(q.cat) >= 0; });
    const chosen = U.pick(catPool.length >= COUNT ? catPool : src, Math.min(COUNT, src.length), rng);
    freeze(chosen);
    return chosen;
  }

  /**
   * Fige le tirage du jour dès que le joueur commence.
   * Ainsi, si de nouvelles questions sont publiées dans la journée,
   * le quiz du jour ne change pas pour ceux qui ont déjà joué.
   */
  function freeze(qs) {
    const day = today();
    const rec = QV.store.loadDaily();
    if (rec[day] && rec[day].qids && rec[day].qids.length) return;
    const m = meta();
    rec[day] = {
      day: day,
      startedAt: Date.now(),
      qids: (qs || []).map(function (q) { return q.id; }),
      difficulty: m ? m.difficulty : 'moyen',
    };
    const keys = Object.keys(rec).sort();
    if (keys.length > 120) {
      keys.slice(0, keys.length - 120).forEach(function (k) { if (!rec[k].at) delete rec[k]; });
    }
    QV.store.saveDaily(rec);
  }

  /** Identifiant de config pour le moteur de quiz. */
  function config() {
    return { kind: 'daily', seed: seedFor(today()), count: COUNT, diff: 'mixte', mode: 'classique', quizId: 'quiz-du-jour', title: 'Quiz du jour' };
  }

  /** Enregistre la partie du jour et verse la récompense (une seule fois). */
  function complete(res) {
    const day = today();
    const rec = QV.store.loadDaily();
    const already = !!(rec[day] && rec[day].at);
    if (!already) {
      rec[day] = rec[day] || { day: day, qids: [], startedAt: Date.now() };
      rec[day].day = day;
      rec[day].qids = (res.questions || []).map(function (q) { return q.id; });
      rec[day].at = Date.now();
      rec[day].score = res.score;
      rec[day].pct = res.pct;
      rec[day].correct = res.correct;
      rec[day].answered = res.answered;
      rec[day].time = res.totalTime;
      rec[day].claimed = false;
    } else {
      rec[day].replays = (rec[day].replays || 0) + 1;
      if (res.pct > (rec[day].pct || 0)) {
        rec[day].bestPct = res.pct;
        rec[day].bestScore = res.score;
      }
      rec[day].replaysLast = Date.now();
    }
    // Purge : on garde 120 jours
    const keys = Object.keys(rec).sort();
    if (keys.length > 120) keys.slice(0, keys.length - 120).forEach(function (k) { if (!rec[k].at) delete rec[k]; });
    QV.store.saveDaily(rec);
    QV.achievements.bumpFlag('daily');
    return !already;
  }

  /** Record personnel du jour (ou le meilleur si rejoué). */
  function bestToday() {
    const rec = QV.store.loadDaily();
    const e = rec[today()];
    if (!e || !e.at) return null;
    return Math.max(e.pct || 0, e.bestPct || 0);
  }

  /** Vrai si le quiz du jour a été terminé (et pas seulement commencé). */
  function isPlayed() {
    const e = QV.store.loadDaily()[today()];
    return !!(e && e.at);
  }

  /** Nombre de quiz du jour joués (pour les séries). */
  function daysPlayed() {
    const rec = QV.store.loadDaily();
    return Object.keys(rec).filter(function (k) { return rec[k] && rec[k].at; }).length;
  }

  /** Prochaine rotation du quiz du jour (dans moins de X). */
  function msUntilTomorrow() {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    return next.getTime() - now.getTime();
  }

  /** Série de jours consécutifs où le quiz du jour a été joué. */
  function streak() {
    const rec = QV.store.loadDaily();
    let n = 0;
    const d = new Date();
    for (let i = 0; i < 400; i++) {
      const key = U.dayKey(d);
      if (rec[key]) n++;
      else if (i > 0) break;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }

  /** Récompense supplémentaire tous les 3 jours consécutifs. */
  function bonusFor(streakDays) {
    if (streakDays > 0 && streakDays % 3 === 0) return { xp: 100 * (streakDays / 3), label: 'Série de ' + streakDays + ' jours' };
    return null;
  }

  QV.daily = {
    COUNT: COUNT,
    today: today,
    meta: meta,
    questions: questions,
    freeze: freeze,
    config: config,
    complete: complete,
    bestToday: bestToday,
    isPlayed: isPlayed,
    daysPlayed: daysPlayed,
    msUntilTomorrow: msUntilTomorrow,
    streak: streak,
    bonusFor: bonusFor,
    seedFor: seedFor,
  };
})(window);
