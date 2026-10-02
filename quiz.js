/* ==========================================================================
   QuizVerse — moteur de quiz (modes solo)
   --------------------------------------------------------------------------
   Aucun multijoueur, aucun serveur : le moteur est entièrement local.
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});
  const U = QV.util;

  /* ------------------------------------------------------------ MODES */

  const MODES = [
    { id: 'classique', label: 'Classique', emoji: '🎯', desc: 'Le quiz standard, sans contrainte de temps.', icon: '🎯', context: 'quiz' },
    { id: 'rapide', label: 'Rapide', emoji: '⚡', desc: '5 questions, le format éclair.', count: 5, icon: '⚡', context: 'quiz' },
    { id: 'long', label: 'Long', emoji: '📚', desc: '20 ou 30 questions pour un vrai marathon.', count: 20, icon: '📚', context: 'quiz' },
    { id: 'expert', label: 'Expert', emoji: '🧠', desc: 'Uniquement des questions difficiles et expert.', forceDiff: 'expert', icon: '🧠', context: 'quizHard' },
    { id: 'chrono', label: 'Chrono', emoji: '⏱️', desc: 'Temps limité pour répondre à chaque question.', timed: true, icon: '⏱️', context: 'quiz' },
    { id: 'survie', label: 'Survie', emoji: '💀', desc: 'Une seule erreur et la partie est terminée.', icon: '💀', context: 'quizHard' },
    { id: 'infini', label: 'Infini', emoji: '♾️', desc: 'Autant de questions que tu veux, jusqu’à la première erreur.', icon: '♾️', context: 'quizHard' },
    { id: 'parfait', label: 'Parfait', emoji: '💎', desc: 'Objectif 100 %. Une erreur et c’est perdu.', icon: '💎', context: 'quiz' },
    { id: 'aleatoire', label: 'Aléatoire', emoji: '🎲', desc: 'Questions, difficultés et univers tirés au hasard.', icon: '🎲', context: 'quiz' },
    { id: 'mix', label: 'Mix', emoji: '🌀', desc: 'Un mélange de plusieurs catégories.', icon: '🌀', context: 'quiz' },
    { id: 'quotidien', label: 'Quiz du jour', emoji: '📅', desc: 'Un nouveau quiz chaque jour, une seule récompense.', icon: '📅', context: 'quiz' },
    { id: 'surprise', label: 'Surprise', emoji: '🎁', desc: 'QuizVerse choisit tout pour toi.', icon: '🎁', context: 'quiz' },
  ];

  function mode(id) {
    return MODES.filter(function (m) { return m.id === id; })[0] || MODES[0];
  }

  /* ------------------------------------------------------------ SCORE */

  const BASE_POINTS = { facile: 100, moyen: 150, difficile: 220, expert: 320 };
  const MODE_MULT = { survie: 1.25, chrono: 1.15, infini: 1.2, parfait: 1.3, quotidien: 1.1 };

  /* ---------------------------------------------------------- ÉTAT */

  let run = null;
  let timerId = null;
  let tickHandlers = [];

  function emit() {
    tickHandlers.forEach(function (h) { try { h(run); } catch (e) { console.warn(e); } });
  }

  function onUpdate(fn) { tickHandlers.push(fn); return function () { tickHandlers = tickHandlers.filter(function (h) { return h !== fn; }); }; }

  /** État courant (null si aucune partie). */
  function state() { return run; }

  /**
   * Démarre une partie.
   * @param {object} cfg { kind, quizId, sub, diff, count, mode, timePerQuestion, cats, subs, types, title, seed, quizTitle }
   */
  function start(cfg) {
    const c = Object.assign({}, cfg);

    if (c.mode === 'quotidien') {
      c.kind = 'daily';
      c.seed = QV.daily.seedFor(QV.daily.today());
    }

    /* ---- Mode « surprise » : tout est choisi automatiquement ---- */
    if (c.mode === 'surprise' && !c.explicit) {
      const allCats = U.unique(QV.data.questions.map(function (q) { return q.cat; }));
      const nCats = U.randomInt(1, 4);
      const chosen = U.pick(allCats, Math.min(nCats, allCats.length));
      c.cats = chosen;
      c.diff = U.pick(['facile', 'moyen', 'moyen', 'difficile', 'difficile', 'expert']);
      c.count = U.pick([5, 10, 10, 10, 15, 20, 30]);
      c.mode = U.pick(['classique', 'classique', 'chrono', 'survie', 'rapide', 'mix']);
      c.explicit = true;
      c.title = 'Quiz surprise';
    }
    if (c.mode === 'rapide' && !c.explicitCount) c.count = 5;
    if (c.mode === 'long' && !c.explicitCount) c.count = 20;
    if (c.mode === 'mix' && !c.cats && !c.subs) {
      const cats = U.unique(QV.data.questions.map(function (q) { return q.cat; }));
      c.cats = U.pick(cats, Math.min(4, cats.length));
    }
    if (c.mode === 'expert' && !c.explicitDiff) c.diff = 'expert';
    if (c.mode === 'aleatoire' && !c.explicitDiff) c.diff = 'mixte';
    if (c.diff === 'aleatoire') c.diff = 'mixte';

    const m = Object.assign({}, mode(c.mode));
    if (m.timed && !c.timePerQuestion) {
      c.timePerQuestion = c.diff === 'expert' ? 25 : c.diff === 'difficile' ? 30 : 40;
    }
    if (m.forceDiff && !c.explicitDiff) c.diff = m.forceDiff;


    const built = QV.data.buildRun(c);
    if (!built || !built.questions.length) {
      return { error: 'Aucune question disponible pour cette configuration.' };
    }

    const settings = QV.store.loadSettings();
    const total = (m.id === 'infini') ? built.questions.length : c.count;

    run = {
      cfg: c,
      mode: m.id,
      modeDef: m,
      seed: built.seed,
      pool: [],
      poolSize: built.available,
      questions: [],
      queue: built.questions.slice(),
      index: -1,
      current: null,
      selected: [],
      locked: false,
      startedAt: Date.now(),
      questionStartedAt: 0,
      correct: 0,
      wrong: 0,
      partial: 0,
      answered: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      xp: 0,
      timePerQuestion: c.timePerQuestion || 0,
      remaining: c.timePerQuestion || 0,
      infinite: m.id === 'infini',
      total: total,
      history: [],
      typeStats: [],
      subIds: [],
      fastest: 0,
      timedOut: false,
      comesBack: false,
      survivorWins: 0,
      infiniBest: 0,
      timed: !!m.timed,
      settings: settings,
      over: false,
      cat: c.cat || (c.kind === 'quiz' && c.quizId ? (QV.data.quiz(c.quizId) || {}).cat : (c.cats && c.cats.length === 1 ? c.cats[0] : (c.kind === 'custom' ? (c.cats && c.cats[0]) || (c.subs && c.subs[0] ? c.subs[0].split('/')[0] : null) : null))),
      sub: c.sub || (c.kind === 'custom' && c.subs && c.subs.length === 1 ? c.subs[0].split('/')[1] : null),
      title: c.title || (c.quizId ? (QV.data.quiz(c.quizId) || {}).title : null) || (c.kind === 'daily' ? 'Quiz du jour' : c.kind === 'mistakes' ? 'Mes erreurs' : c.kind === 'weak' ? 'Mes connaissances' : c.kind === 'custom' ? 'Quiz personnalisé' : 'Quiz aléatoire'),
      emoji: c.emoji || (c.quizId ? (QV.data.quiz(c.quizId) || {}).emoji : '✨'),
      color: c.color || (c.quizId ? (QV.data.quiz(c.quizId) || {}).color : 'var(--accent)'),
    };

    // On mémorise toutes les questions du tirage pour pouvoir les rejouer en infini
    run.queue = built.questions.slice();

    if (run.infinite) {
      // File sans fin : on pioche dans le pool complet
      const poolAll = QV.data.resolveQuiz(c);
      run.queue = U.shuffle(poolAll);
      if (!run.queue.length) run.queue = built.questions.slice();
    }

    switchMusic(run.modeDef.context, run.cfg);
    advance();
    return run;
  }

  function switchMusic(ctx, cfg) {
    if (!QV.music) return;
    if (!cfg.music) return;
    QV.music.setContext(ctx || 'quiz');
  }

  /* ------------------------------------------------- Avance / réponse */

  function advance() {
    if (!run) return null;
    if (run.index >= run.total - 1 && !run.infinite) {
      finish('complete');
      return null;
    }
    run.index += 1;
    let q = run.queue[run.index];
    if (!q && run.infinite) {
      // On pioche une nouvelle question au hasard dans le pool
      q = QV.data.state.questions[Math.floor(Math.random() * QV.data.state.questions.length)];
      run.queue[run.index] = q;
    }
    if (!q) { finish('complete'); return null; }
    run.current = q;
    run.selected = [];
    run.locked = false;
    run.timedOut = false;
    run.questionStartedAt = now();
    run.remaining = run.timed ? run.timePerQuestion : 0;
    if (run.subIds.indexOf(q.cat + '/' + q.sub) < 0) run.subIds.push(q.cat + '/' + q.sub);
    startTimer();
    emit();
    return q;
  }

  function now() {
    return (global.performance && global.performance.now) ? global.performance.now() : Date.now();
  }

  function startTimer() {
    stopTimer();
    if (!run || !run.timed) return;
    const t0 = now();
    timerId = setInterval(function () {
      if (!run || run.locked || run.over) { stopTimer(); return; }
      run.remaining = Math.max(0, run.timePerQuestion - (now() - t0) / 1000);
      if (run.remaining <= 0) {
        stopTimer();
        timeout();
      }
      emit();
    }, 100);
  }

  function stopTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  /** Temps dépassé : la question est comptée comme ratée. */
  function timeout() {
    if (!run || run.locked) return;
    run.timedOut = true;
    applyAnswer(null, true);
  }

  function correctIndexes(q) {
    return Array.isArray(q.correct) ? q.correct.slice() : [q.correct];
  }

  /**
   * Sélectionne une réponse (QCM / VF) ou bascule une réponse (multi).
   */
  function select(idx) {
    if (!run || run.locked || run.over) return null;
    const q = run.current;
    if (q.type === 'multi') {
      const i = run.selected.indexOf(idx);
      if (i >= 0) run.selected.splice(i, 1); else run.selected.push(idx);
      emit();
      return { toggled: true, needsConfirm: true };
    }
    return applyAnswer(idx, false);
  }

  /** Valide une question à plusieurs réponses. */
  function confirm() {
    if (!run || run.locked || run.over) return null;
    if (!run.selected.length) return null;
    return applyAnswer(run.selected.slice(), false);
  }

  function applyAnswer(selection, isTimeout) {
    if (!run || run.locked || run.over) return null;
    const q = run.current;
    stopTimer();
    run.locked = true;
    const timeMs = Math.round(now() - run.questionStartedAt);

    const corr = correctIndexes(q);
    let verdict; // 'correct' | 'partial' | 'wrong' | 'timeout'

    if (isTimeout || selection === null) {
      verdict = 'timeout';
    } else {
      const sel = Array.isArray(selection) ? selection.slice() : [selection];
      const hasWrong = sel.some(function (i) { return corr.indexOf(i) < 0; });
      const allRight = sel.length === corr.length && corr.every(function (i) { return sel.indexOf(i) >= 0; });
      const someRight = sel.some(function (i) { return corr.indexOf(i) >= 0; });
      if (hasWrong) verdict = 'wrong';
      else if (allRight) verdict = 'correct';
      else if (someRight) verdict = 'partial';
      else verdict = 'wrong';
    }

    run.answered += 1;
    const isFirstTry = !run.history.some(function (h) { return h.qid === q.id; });

    let gained = 0;
    if (verdict === 'correct' || verdict === 'partial') {
      const factor = verdict === 'partial' ? 0.5 : 1;
      run.streak += 1;
      run.bestStreak = Math.max(run.bestStreak, run.streak);
      if (verdict === 'correct') run.correct += 1; else run.partial += 1;
      if (run.streak === 5) run.comesBack = true;

      const base = BASE_POINTS[q.diff] || 150;
      let speed = 1;
      if (run.timed) speed = 1 + U.clamp(1 - timeMs / (run.timePerQuestion * 1000), 0, 1) * 0.6;
      else if (timeMs < 9000) speed = 1 + (1 - timeMs / 9000) * 0.3;
      const streakBonus = run.streak >= 3 ? 1 + Math.min(0.6, (run.streak - 2) * 0.07) : 1;
      const mult = MODE_MULT[run.mode] || 1;
      gained = Math.round(base * speed * streakBonus * mult * factor);

      run.score += gained;
      run.xp += QV.xp.xpForAnswer({
        correct: verdict === 'correct',
        diff: q.diff,
        timeMs: timeMs,
        limitMs: run.timed ? run.timePerQuestion * 1000 : 0,
        streak: run.streak,
        mode: run.mode,
        isFirstTry: isFirstTry,
      }) * (verdict === 'partial' ? 0.5 : 1);

      if (!run.fastest || timeMs < run.fastest) run.fastest = timeMs;
    } else {
      run.wrong += 1;
      run.streak = 0;
      QV.mastery.recordMistake(q, selection === null ? null : (Array.isArray(selection) ? selection[0] : selection));
      if (isFirstTry === false) QV.mastery.fixMistake(q.id);
    }

    // Maîtrise
    QV.mastery.record(q.id, verdict === 'correct' || verdict === 'partial', isFirstTry);

    // Statistiques par type
    const ts = run.typeStats.filter(function (t) { return t.type === q.type; })[0];
    if (ts) { ts.count += 1; if (verdict === 'correct' || verdict === 'partial') ts.correct += 1; }
    else run.typeStats.push({ type: q.type, count: 1, correct: (verdict === 'correct' || verdict === 'partial') ? 1 : 0 });

    const entry = {
      qid: q.id,
      question: q,
      selected: selection === null ? [] : (Array.isArray(selection) ? selection.slice() : [selection]),
      correctIdx: corr,
      verdict: verdict,
      gained: gained,
      timeMs: timeMs,
      isFirstTry: isFirstTry,
    };
    run.history.push(entry);

    emit();
    return entry;
  }

  function next() {
    if (!run || run.over) return null;
    const q = run.current;
    const stopped = checkEnd();
    if (stopped) return null;
    return advance();
  }

  function checkEnd() {
    const m = run.modeDef;
    if (m.id === 'survie' && run.wrong >= 1) { run.survivorWins = run.streak; finish('survie'); return true; }
    if (m.id === 'infini' && run.wrong >= 1) { run.infiniBest = run.correct; finish('infini'); return true; }
    if (m.id === 'parfait' && run.wrong >= 1) { finish('parfait'); return true; }
    if (!run.infinite && run.index >= run.total - 1) { finish('complete'); return true; }
    return false;
  }

  /* -------------------------------------------------------- FIN DE PARTIE */

  function finish(reason) {
    if (!run || run.over) return null;
    stopTimer();
    run.over = true;
    run.reason = reason || 'quit';
    run.endedAt = Date.now();
    run.totalTime = run.endedAt - run.startedAt;

    const answered = run.answered;
    const pct = answered > 0 ? Math.round((run.correct / answered) * 100) : 0;

    const bonus = QV.xp.endBonus({
      correct: run.correct,
      answered: answered,
      pct: pct,
      score: run.score,
      bestStreak: run.bestStreak,
      mode: run.mode,
    });
    run.bonus = bonus;
    run.xp += bonus.xp;
    run.pct = pct;

    const catId = run.cat;
    const subId = run.sub;
    const res = {
      kind: run.cfg.kind || 'quiz',
      quizId: run.cfg.quizId || null,
      title: run.title,
      emoji: run.emoji,
      cat: catId,
      sub: subId,
      subIds: run.subIds.slice(),
      diff: run.cfg.diff && run.cfg.diff !== 'mixte' ? run.cfg.diff : dominantDiff(),
      mode: run.mode,
      count: run.total,
      answered: answered,
      correct: run.correct,
      wrong: run.wrong,
      partial: run.partial,
      score: run.score,
      pct: pct,
      xp: run.xp,
      time: Math.round(run.totalTime / 1000),
      totalTime: run.totalTime,
      avgTime: answered > 0 ? run.totalTime / answered : 0,
      bestStreak: run.bestStreak,
      perfect: answered > 0 && run.correct === answered,
      reason: run.reason,
      history: run.history,
      typeStats: run.typeStats,
      fastest: run.fastest,
      comesBack: run.comesBack,
      survivorWins: run.survivorWins,
      infiniBest: run.infiniBest,
      at: Date.now(),
      day: U.dayKey(),
    };
    run.result = res;

    // ---- Sauvegardes ----
    const stBefore = QV.store.loadStats();
    QV.xp.addXp(run.xp);
    QV.xp.recordResult(res);

    // Classement personnel par quiz
    const hist = QV.store.loadHistory();
    hist.unshift(res);
    QV.store.saveHistory(hist);

    // Récompense quiz du jour
    let dailyFirst = false;
    if (run.cfg.kind === 'daily') dailyFirst = QV.daily.complete(res);

    // Défis
    res.challenges = [];
    ['daily', 'weekly'].forEach(function (scope) {
      const claimed = QV.challenges.autoClaim(scope);
      claimed.forEach(function (c) { res.challenges.push({ scope: scope, def: c.challenge, result: c.result }); });
    });

    // Badges
    QV.achievements.trackRun(res);
    const newly = QV.achievements.check();
    res.badges = newly.filter(function (b) { return b.id; });

    // Bonus de série quiz du jour
    const ds = QV.daily.streak();
    res.dailyStreak = ds;
    const db = QV.daily.bonusFor(ds);
    if (db && dailyFirst) {
      const r = QV.xp.addXp(db.xp);
      res.dailyBonus = db;
      res.dailyBonusXp = db.xp;
      res.dailyLevelUp = r && r.leveledUp;
    }

    // Musique de fin
    if (QV.music) {
      if (res.perfect) QV.music.setContext('perfect');
      else QV.music.setContext('results');
      QV.music.sfx(res.perfect ? 'perfect' : (pct >= 50 ? 'victory' : 'wrong'));
    }

    emit();
    return res;
  }

  function dominantDiff() {
    const counts = {};
    run.history.forEach(function (h) { counts[h.question.diff] = (counts[h.question.diff] || 0) + 1; });
    let best = 'moyen', n = -1;
    Object.keys(counts).forEach(function (d) { if (counts[d] > n) { n = counts[d]; best = d; } });
    return best;
  }

  /** Abandon voluntary. */
  function abort() {
    if (!run) return null;
    if (run.answered === 0) { run.over = true; run = null; stopTimer(); return null; }
    return finish('quit');
  }

  /** Vide l'état sans enregistrer de résultat (annulation). */
  function discard() {
    stopTimer();
    run = null;
  }

  function progress() {
    if (!run) return 0;
    return run.infinite ? 0 : U.clamp((run.index / Math.max(1, run.total)) * 100, 0, 100);
  }

  QV.quiz = {
    MODES: MODES,
    mode: mode,
    BASE_POINTS: BASE_POINTS,
    start: start,
    state: state,
    onUpdate: onUpdate,
    select: select,
    confirm: confirm,
    next: next,
    advance: advance,
    finish: finish,
    abort: abort,
    discard: discard,
    progress: progress,
    correctIndexes: correctIndexes,
    isRunning: function () { return !!run; },
  };
})(window);
