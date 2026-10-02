/* ==========================================================================
   QuizVerse — XP, niveaux, titres, profil et agrégation des statistiques
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});
  const U = QV.util;

  /* --------------------------------------------------------- Niveaux -- */

  /** XP requis pour passer du niveau n au niveau n+1. */
  function xpForLevel(n) {
    return Math.round(140 * Math.pow(n, 1.44));
  }

  /** XP cumulé nécessaire pour atteindre le niveau n. */
  function totalXpForLevel(n) {
    let t = 0;
    for (let i = 1; i < n; i++) t += xpForLevel(i);
    return t;
  }

  const MAX_LEVEL = 100;

  function levelInfo(xp) {
    let lvl = 1;
    let acc = 0;
    while (lvl < MAX_LEVEL) {
      const need = xpForLevel(lvl);
      if (acc + need > xp) break;
      acc += need;
      lvl++;
    }
    const need = xpForLevel(lvl);
    const into = xp - acc;
    return {
      level: lvl,
      xp: xp,
      into: into,
      need: need,
      total: acc,
      progress: need > 0 ? U.clamp((into / need) * 100, 0, 100) : 100,
      max: lvl >= MAX_LEVEL,
    };
  }

  const LEVEL_TIERS = [
    { min: 1, name: 'Novice' },
    { min: 5, name: 'Apprenti' },
    { min: 10, name: 'Quizzeur' },
    { min: 20, name: 'Connaisseur' },
    { min: 32, name: 'Expert' },
    { min: 48, name: 'Virtuose' },
    { min: 65, name: 'Maître' },
    { min: 85, name: 'Légende' },
  ];

  function levelRank(level) {
    let r = LEVEL_TIERS[0];
    for (let i = 0; i < LEVEL_TIERS.length; i++) if (level >= LEVEL_TIERS[i].min) r = LEVEL_TIERS[i];
    return r.name;
  }

  /* ------------------------------------------------------------- XP -- */

  const DIFF_XP = { facile: 10, moyen: 16, difficile: 26, expert: 42 };

  /**
   * Calcule le XP gagné pour une question.
   * @param {object} o { correct, diff, timeMs, limitMs, streak, mode, isFirstTry }
   */
  function xpForAnswer(o) {
    if (!o.correct) return o.mode === 'survie' || o.mode === 'infini' ? 1 : 0;
    let xp = DIFF_XP[o.diff] || 12;
    // Bonus de rapidité (jusqu'à +60 %)
    if (o.limitMs) {
      const ratio = U.clamp(1 - o.timeMs / o.limitMs, 0, 1);
      xp += Math.round(xp * ratio * 0.6);
    } else if (o.timeMs && o.timeMs < 8000) {
      xp += Math.round(xp * 0.25);
    }
    // Bonus de série
    const s = o.streak || 1;
    if (s >= 3) xp += Math.round(xp * Math.min(0.5, (s - 2) * 0.06));
    // Bonus de mode
    if (o.mode === 'chrono') xp = Math.round(xp * 1.15);
    if (o.mode === 'survie') xp = Math.round(xp * 1.25);
    if (o.mode === 'infini') xp = Math.round(xp * 1.2);
    if (o.mode === 'perfect') xp = Math.round(xp * 1.3);
    if (o.isFirstTry) xp += 3;
    return Math.max(5, Math.round(xp));
  }

  /** Bonus de fin de partie. */
  function endBonus(res) {
    let xp = 0;
    const parts = [];
    if (res.correct === res.answered && res.answered > 0) {
      const b = Math.round(res.score * 0.35 + 120);
      xp += b; parts.push({ label: 'Partie parfaite', xp: b });
    } else if (res.pct >= 80) {
      const b = Math.round(res.pct * 1.4);
      xp += b; parts.push({ label: 'Score ≥ 80 %', xp: b });
    } else if (res.pct >= 50) {
      const b = Math.round(res.pct * 0.6);
      xp += b; parts.push({ label: 'Score ≥ 50 %', xp: b });
    }
    if (res.bestStreak >= 10) {
      const b = res.bestStreak * 6; xp += b; parts.push({ label: 'Série de ' + res.bestStreak, xp: b });
    }
    if (res.mode === 'survie' && res.streak >= 10) {
      const b = res.streak * 10; xp += b; parts.push({ label: 'Survie longue', xp: b });
    }
    if (res.answered >= 20) {
      const b = 40; xp += b; parts.push({ label: 'Quiz ≥ 20 questions', xp: b });
    }
    return { xp: xp, parts: parts };
  }

  /* ------------------------------------------------------- Profil -- */

  function profile() {
    return QV.store.loadProfile();
  }

  function saveProfile(p) {
    QV.store.saveProfile(p);
    QV.app && QV.app.refreshChrome && QV.app.refreshChrome();
  }

  function addXp(amount) {
    if (!amount) return null;
    const p = profile();
    const before = levelInfo(p.xp);
    p.xp += amount;
    const after = levelInfo(p.xp);
    saveProfile(p);
    return { before: before, after: after, gained: amount, leveledUp: after.level > before.level };
  }

  function spendXp(amount) {
    const p = profile();
    if (p.xp < amount) return false;
    p.xp -= amount;
    saveProfile(p);
    return true;
  }

  /* -------------------------------------------------------- Titres -- */

  function titlesList() {
    return QV.data.state.titles || [];
  }

  function titleUnlocked(t, p, st) {
    if (!t.cond) return true;
    return QV.achievements.evalCondition(t.cond, p, st);
  }

  function unlockedTitles() {
    const p = profile(), st = QV.store.loadStats();
    return titlesList().filter(function (t) { return titleUnlocked(t, p, st); });
  }

  function setTitle(id) {
    const list = unlockedTitles();
    const found = list.filter(function (t) { return t.id === id; })[0];
    if (!found) return false;
    const p = profile();
    p.title = id;
    saveProfile(p);
    return true;
  }

  /* --------------------------------------------------- Statistiques -- */

  function bump(obj, key, field, by) {
    if (!obj[key]) obj[key] = { quizzes: 0, questions: 0, correct: 0, best: 0 };
    if (field) obj[key][field] = (obj[key][field] || 0) + (by === undefined ? 1 : by);
  }

  /**
   * Enregistre une partie terminée dans les statistiques.
   * @returns {object} statistiques à jour
   */
  function recordResult(res) {
    const st = QV.store.loadStats();
    const day = U.dayKey();

    st.quizzes += 1;
    st.questions += res.answered;
    st.correct += res.correct;
    st.incorrect += res.wrong;
    st.timePlayed += Math.round(res.totalTime / 1000);
    st.bestStreak = Math.max(st.bestStreak, res.bestStreak || 0);
    if (res.pct > st.bestScore) { st.bestScore = res.pct; st.bestScorePct = res.score; }
    if (res.answered > 0 && res.correct === res.answered) st.perfects += 1;

    // Par catégorie
    bump(st.byCat, res.cat, null);
    st.byCat[res.cat].quizzes += 1;
    st.byCat[res.cat].questions += res.answered;
    st.byCat[res.cat].correct += res.correct;
    st.byCat[res.cat].best = Math.max(st.byCat[res.cat].best || 0, res.pct);

    // Par univers
    const subs = res.subIds && res.subIds.length ? res.subIds : (res.sub ? [res.sub] : []);
    subs.forEach(function (k) {
      if (!st.bySub[k]) st.bySub[k] = { quizzes: 0, questions: 0, correct: 0, best: 0 };
      st.bySub[k].questions += res.answered;
      st.bySub[k].correct += res.correct;
      st.bySub[k].best = Math.max(st.bySub[k].best || 0, res.pct);
    });
    if (res.cat) {
      subs.forEach(function (k) {
        if (st.bySub[k]) st.bySub[k].quizzes += 1;
      });
    }

    // Par difficulté
    if (!st.byDiff[res.diff]) st.byDiff[res.diff] = { quizzes: 0, questions: 0, correct: 0 };
    st.byDiff[res.diff].quizzes += 1;
    st.byDiff[res.diff].questions += res.answered;
    st.byDiff[res.diff].correct += res.correct;

    // Par mode
    st.byMode[res.mode] = (st.byMode[res.mode] || 0) + 1;

    // Par jour
    if (!st.byDay[day]) st.byDay[day] = { xp: 0, correct: 0, questions: 0, quizzes: 0, score: 0, time: 0 };
    st.byDay[day].xp += res.xp;
    st.byDay[day].correct += res.correct;
    st.byDay[day].questions += res.answered;
    st.byDay[day].quizzes += 1;
    st.byDay[day].score += res.score;
    st.byDay[day].time += Math.round(res.totalTime / 1000);

    QV.store.saveStats(st);

    // Jours de jeu
    const p = profile();
    if (p.playDays.indexOf(day) < 0) {
      p.playDays.push(day);
      if (p.playDays.length > 400) p.playDays.shift();
    }
    p.totalTime = (p.totalTime || 0) + Math.round(res.totalTime / 1000);
    saveProfile(p);

    return st;
  }

  /** Dérivés utiles pour l'affichage. */
  function derived() {
    const st = QV.store.loadStats();
    const p = profile();
    const acc = st.questions > 0 ? (st.correct / st.questions) * 100 : 0;
    const avgTime = st.questions > 0 ? st.timePlayed / st.questions : 0;
    const mastery = QV.mastery.summary();
    return {
      accuracy: acc,
      avgTime: avgTime,
      totalTime: st.timePlayed,
      level: levelInfo(p.xp),
      badges: Object.keys(QV.store.loadBadges()).length,
      streak: U.dayKey() === lastDay(st) ? currentDayStreak(st) : 0,
      mastery: mastery,
    };
  }

  function lastDay(st) {
    const keys = Object.keys(st.byDay || {}).sort();
    return keys.length ? keys[keys.length - 1] : null;
  }

  function currentDayStreak(st) {
    let streak = 0;
    const d = new Date();
    for (let i = 0; i < 400; i++) {
      const key = U.dayKey(d);
      if (st.byDay && st.byDay[key]) streak++;
      else if (i > 0) break;
      else if (i === 0) { /* aujourd'hui pas encore joué : on ne casse pas la série */ }
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  /** Progression globale par univers (catégorie + sous-catégorie). */
  function catProgress(catId) {
    const st = QV.store.loadStats();
    const c = st.byCat[catId] || { quizzes: 0, questions: 0, correct: 0, best: 0 };
    const pool = QV.data.questionsIn(catId, null, null);
    const mastered = pool.filter(function (q) {
      const m = QV.mastery.get(q.id);
      return m && (m.level === 'm-mastered' || m.level === 'm-perfect');
    }).length;
    return {
      catId: catId,
      quizzes: c.quizzes,
      answered: c.questions,
      correct: c.correct,
      best: c.best || 0,
      accuracy: c.questions ? (c.correct / c.questions) * 100 : 0,
      pool: pool.length,
      mastered: mastered,
      mastery: pool.length ? (mastered / pool.length) * 100 : 0,
    };
  }

  QV.xp = {
    xpForLevel: xpForLevel,
    totalXpForLevel: totalXpForLevel,
    levelInfo: levelInfo,
    levelRank: levelRank,
    MAX_LEVEL: MAX_LEVEL,
    xpForAnswer: xpForAnswer,
    endBonus: endBonus,
    DIFF_XP: DIFF_XP,
    profile: profile,
    saveProfile: saveProfile,
    addXp: addXp,
    spendXp: spendXp,
    titlesList: titlesList,
    unlockedTitles: unlockedTitles,
    titleUnlocked: titleUnlocked,
    setTitle: setTitle,
    recordResult: recordResult,
    derived: derived,
    catProgress: catProgress,
  };
})(window);
