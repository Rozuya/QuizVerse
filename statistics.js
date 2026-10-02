/* ==========================================================================
   QuizVerse — page Statistiques (graphiques SVG, aucune dépendance)
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});
  const U = QV.util;
  const el = U.el;
  const V = (QV.views = QV.views || {});

  V.statistiques = function () {
    const page = el('div.qv-page-enter');
    const st = QV.store.loadStats();
    const p = QV.xp.profile();
    const d = QV.xp.derived();
    const hist = QV.store.loadHistory();

    page.appendChild(el('div.page-head', null, [
      el('div.page-head__eyebrow', { text: '📊 STATISTIQUES' }),
      el('h1', { text: 'Mes statistiques' }),
      el('p.page-head__sub', { text: 'Toutes ces données sont calculées à partir de ton historique local. Rien n’est envoyé sur un serveur.' }),
    ]));

    if (!st.quizzes) {
      page.appendChild(QV.ui.emptyState('📊', 'Pas encore de statistiques', 'Termine un premier quiz et toutes tes statistiques apparaîtront ici : score, réussite, séries, XP et progression.',
        el('a.btn.btn--primary', { href: '#/surprise', text: 'Lancer mon premier quiz' })));
      return page;
    }

    /* ---- Chiffres clés ---- */
    page.appendChild(el('section.section', null, [
      el('div.grid.grid--stats', null, [
        QV.ui.stat('Taux de réussite', U.pct(d.accuracy, 1), st.correct + ' / ' + st.questions + ' réponses', '🎯'),
        QV.ui.stat('Questions réussies', U.num(st.correct), 'Bonnes réponses', '✅'),
        QV.ui.stat('Questions ratées', U.num(st.incorrect), 'Mauvaises réponses', '❌'),
        QV.ui.stat('Quiz terminés', U.num(st.quizzes), st.perfects + ' parfaits', '🎮'),
        QV.ui.stat('Temps moyen / question', U.duration(d.avgTime), 'Sur ' + U.duration(d.totalTime) + ' au total', '⏱️'),
        QV.ui.stat('Meilleure série', U.num(st.bestStreak), 'Réponses justes à la suite', '🔥'),
        QV.ui.stat('Meilleur score', st.bestScore + '<small>%</small>', U.num(st.bestScorePct) + ' points', '🏆'),
        QV.ui.stat('XP totale', U.num(p.xp), 'Niveau ' + d.level.level, '⭐'),
      ]),
    ]));

    /* ---- Anneau principal ---- */
    page.appendChild(el('section.section', null, [
      el('div.grid.grid--2', null, [
        el('div.panel', null, [
          el('div.panel__title', { text: '🎯 Réussite globale' }),
          el('div.row.row--tight', { style: { justifyContent: 'center', gap: '24px' } }, [
            QV.ui.ring(d.accuracy, U.pct(d.accuracy), 'Réussite', 130),
            el('div.stack.stack-3', { style: { flex: '1', minWidth: '170px' } }, [
              miniBar('✅ Bonnes', st.correct, st.questions, 'var(--green)'),
              miniBar('❌ Ratées', st.incorrect, st.questions, 'var(--red)'),
            ]),
          ]),
        ]),
        el('div.panel', null, [
          el('div.panel__title', { text: '🧠 Maîtrise des connaissances' }),
          el('div.row.row--tight', { style: { justifyContent: 'center', gap: '24px' } }, [
            QV.ui.ring(QV.mastery.summary().progress, U.pct(QV.mastery.summary().progress), 'Connues', 130),
            el('div.stack.stack-2', { style: { flex: '1', minWidth: '170px' } },
              QV.mastery.LEVELS.filter(function (l) { return l.id !== 'm-new'; }).map(function (l) {
                const c = QV.mastery.summary().counts[l.id] || 0;
                return miniBar(l.emoji + ' ' + l.label, c, QV.mastery.summary().total, l.color);
              })),
          ]),
        ]),
      ]),
    ]));

    /* ---- Progression XP dans le temps ---- */
    const days = Object.keys(st.byDay || {}).sort();
    if (days.length >= 2) {
      const xpPoints = days.map(function (k, i) {
        let acc = 0;
        for (let j = 0; j <= i; j++) acc += st.byDay[days[j]].xp;
        return { x: i, y: acc, label: k };
      });
      page.appendChild(el('section.section', null, [
        el('div.panel', null, [
          el('div.panel__title', { text: '⭐ Progression de l’XP cumulée' }),
          QV.ui.lineChart(xpPoints, { label: 'XP cumulés', height: 210 }),
          el('div.row.row--tight.mt-2', null, [
            el('span.text-xs.text-3', { text: days[0] }),
            el('span.grow'),
            el('span.text-xs.text-3', { text: 'Aujourd’hui : ' + U.num(st.byDay[days[days.length - 1]].xp) + ' XP' }),
          ]),
        ]),
      ]));
    }

    /* ---- Score par partie ---- */
    if (hist.length >= 2) {
      const pts = hist.slice(0, 40).reverse().map(function (h, i) {
        return { x: i, y: h.pct, label: h.title };
      });
      page.appendChild(el('section.section', null, [
        el('div.panel', null, [
          el('div.panel__title', { text: '📈 Progression du score (40 dernières parties)' }),
          QV.ui.lineChart(pts, { label: 'Score en pourcentage', height: 200, yMax: 100 }),
        ]),
      ]));
    }

    /* ---- XP par jour ---- */
    if (days.length >= 1) {
      const items = days.slice(-21).map(function (k) {
        return { label: k, short: k.slice(8) + '/' + k.slice(5, 7), y: st.byDay[k].xp, color: 'var(--accent)' };
      });
      page.appendChild(el('section.section', null, [
        el('div.panel', null, [
          el('div.panel__title', { text: '📅 XP gagné par jour' }),
          QV.ui.barChart(items, { label: 'XP par jour', height: 180 }),
        ]),
      ]));
    }

    /* ---- Par catégorie ---- */
    const catRows = QV.data.categories.map(function (c) {
      const prog = QV.xp.catProgress(c.id);
      return { cat: c, prog: prog };
    }).filter(function (r) { return r.prog.quizzes > 0; });

    page.appendChild(el('section.section', null, [
      el('div.panel', null, [
        el('div.panel__title', { text: '🗂️ Répartition par catégorie' }),
        catRows.length ? el('div.hbar', null, catRows.map(function (r) {
          return el('div.hbar__row', {
            style: { cursor: 'pointer' },
            onclick: function () { location.hash = '#/categorie/' + encodeURIComponent(r.cat.id); },
          }, [
            el('span.hbar__name', { text: r.cat.emoji + ' ' + r.cat.label }),
            el('div.bar', null, [el('i.bar__fill', { style: { width: r.prog.accuracy + '%', background: r.cat.color } })]),
            el('span.hbar__val', { text: Math.round(r.prog.accuracy) + '%' }),
          ]);
        })) : el('p.text-sm.text-3', { text: 'Aucune catégorie jouée.' }),
        catRows.length ? el('div.row.row--tight.mt-4', null, [
          el('span.pill.pill--green', { text: '🟢 ' + catRows.filter(function (r) { return r.prog.accuracy >= 80; }).length + ' catégories ≥ 80 %' }),
          el('span.pill.pill--yellow', { text: '🟡 ' + catRows.filter(function (r) { return r.prog.accuracy >= 50 && r.prog.accuracy < 80; }).length + ' entre 50 et 80 %' }),
          el('span.pill.pill--red', { text: '🔴 ' + catRows.filter(function (r) { return r.prog.accuracy < 50; }).length + ' sous 50 %' }),
        ]) : null,
      ]),
    ]));

    /* ---- Par difficulté ---- */
    const diffs = ['facile', 'moyen', 'difficile', 'expert'];
    const diffRows = diffs.map(function (df) {
      const r = (st.byDiff || {})[df] || { quizzes: 0, questions: 0, correct: 0 };
      return { diff: df, r: r, acc: r.questions ? (r.correct / r.questions) * 100 : 0 };
    });
    page.appendChild(el('section.section', null, [
      el('div.grid.grid--2', null, [
        el('div.panel', null, [
          el('div.panel__title', { text: '🎚️ Répartition par difficulté' }),
          el('div.hbar', null, diffRows.map(function (x) {
            return el('div.hbar__row', null, [
              el('span.hbar__name', { text: QV.data.DIFF_EMOJI[x.diff] + ' ' + QV.data.DIFF_LABEL[x.diff] }),
              el('div.bar', null, [el('i.bar__fill', { style: { width: x.acc + '%' } })]),
              el('span.hbar__val', { text: Math.round(x.acc) + '%' }),
            ]);
          })),
          el('div.divider'),
          el('dl.kv', null, [
            el('dt', { text: 'Quiz par difficulté' }), el('dd', { text: diffRows.map(function (x) { return x.r.quizzes; }).join(' / ') }),
            el('dt', { text: 'Questions par difficulté' }), el('dd', { text: diffRows.map(function (x) { return x.r.questions; }).join(' / ') }),
          ]),
        ]),
        el('div.panel', null, [
          el('div.panel__title', { text: '🎮 Modes de jeu' }),
          el('div.hbar', null, QV.quiz.MODES.map(function (m) {
            const n = (st.byMode || {})[m.id] || 0;
            const max = Math.max.apply(null, QV.quiz.MODES.map(function (x) { return (st.byMode || {})[x.id] || 0; }).concat([1]));
            return el('div.hbar__row', { style: { opacity: n ? '1' : '.45' } }, [
              el('span.hbar__name', { text: m.emoji + ' ' + m.label }),
              el('div.bar', null, [el('i.bar__fill', { style: { width: (n / max) * 100 + '%' } })]),
              el('span.hbar__val', { text: U.num(n) }),
            ]);
          })),
        ]),
      ]),
    ]));

    /* ---- Types de questions ---- */
    const types = st.byType || {};
    const typeKeys = Object.keys(types);
    if (typeKeys.length) {
      const LBL = QV.data.TYPE_LABELS;
      page.appendChild(el('section.section', null, [
        el('div.panel', null, [
          el('div.panel__title', { text: '🧩 Types de questions' }),
          el('div.hbar', null, typeKeys.map(function (t) {
            const acc = types[t].count ? (types[t].correct / types[t].count) * 100 : 0;
            return el('div.hbar__row', null, [
              el('span.hbar__name', { text: LBL[t] || t }),
              el('div.bar', null, [el('i.bar__fill', { style: { width: acc + '%' } })]),
              el('span.hbar__val', { text: types[t].correct + '/' + types[t].count }),
            ]);
          })),
        ]),
      ]));
    }

    /* ---- Univers ---- */
    const subRows = [];
    QV.data.categories.forEach(function (c) {
      QV.data.subsOf(c.id).forEach(function (s) {
        const rec = (st.bySub || {})[s.key];
        if (!rec || !rec.questions) return;
        subRows.push({
          cat: c, sub: s, rec: rec,
          acc: (rec.correct / rec.questions) * 100,
        });
      });
    });
    subRows.sort(function (a, b) { return b.acc - a.acc; });

    if (subRows.length) {
      page.appendChild(el('section.section', null, [
        el('div.panel', null, [
          el('div.panel__title', { text: '🏆 Meilleurs univers' }),
          el('div.hbar', null, subRows.slice(0, 8).map(function (r) {
            return el('div.hbar__row', null, [
              el('span.hbar__name', { text: r.cat.emoji + ' ' + r.sub.label }),
              el('div.bar', null, [el('i.bar__fill', { style: { width: r.acc + '%', background: 'var(--green)' } })]),
              el('span.hbar__val', { text: Math.round(r.acc) + '%' }),
            ]);
          })),
          el('div.divider'),
          el('div.panel__title', { text: '🔧 Univers à travailler' }),
          el('div.hbar', null, subRows.slice(-8).reverse().map(function (r) {
            return el('div.hbar__row', null, [
              el('span.hbar__name', { text: r.cat.emoji + ' ' + r.sub.label }),
              el('div.bar', null, [el('i.bar__fill', { style: { width: r.acc + '%', background: 'var(--red)' } })]),
              el('span.hbar__val', { text: Math.round(r.acc) + '%' }),
            ]);
          })),
        ]),
      ]));
    }

    /* ---- Niveaux ---- */
    page.appendChild(el('section.section', null, [
      el('div.panel', null, [
        el('div.panel__title', { text: '🎖️ Paliers de niveau' }),
        el('div.row.row--tight', null, [
          el('span.pill', { text: 'Niveau ' + d.level.level + ' · ' + QV.xp.levelRank(d.level.level) }),
          el('span.pill', { text: U.num(d.level.need) + ' XP pour le prochain niveau' }),
        ]),
        el('div.divider'),
        el('div.hbar', null, (function () {
          const rows = [];
          const start = Math.max(1, d.level.level - 2);
          for (let i = start; i <= d.level.level + 3 && i <= QV.xp.MAX_LEVEL; i++) {
            const total = QV.xp.totalXpForLevel(i);
            rows.push({ lvl: i, total: total, reached: p.xp >= total });
            rows.push({ sep: i });
          }
          const out = [];
          rows.forEach(function (r) {
            if (r.sep) return;
            out.push(el('div.hbar__row', null, [
              el('span.hbar__name', { text: 'Niveau ' + r.lvl + ' · ' + QV.xp.levelRank(r.lvl), style: r.reached ? { color: 'var(--text)', fontWeight: '800' } : {} }),
              el('div.bar', null, [el('i.bar__fill', { style: { width: r.reached ? '100%' : '0%' } })]),
              el('span.hbar__val', { text: U.num(r.total) + ' XP' }),
            ]));
          });
          return out;
        })()),
      ]),
    ]));

    /* ---- Activité (carte de chaleur) ---- */
    if (days.length) {
      page.appendChild(el('section.section', null, [
        el('div.panel', null, [
          el('div.panel__title', { text: '🗓️ Activité récente' }),
          heatmap(st.byDay),
        ]),
      ]));
    }

    return page;
  };

  function miniBar(label, value, total, color) {
    const pctv = total > 0 ? U.clamp((value / total) * 100, 0, 100) : 0;
    return el('div.stack.stack-2', null, [
      el('div.row.row--between', null, [
        el('span.text-sm.text-2', { text: label }),
        el('span.text-sm.fw-700', { text: U.num(value) }),
      ]),
      el('div.bar', null, [el('i.bar__fill', { style: { width: pctv + '%', background: color } })]),
    ]);
  }

  function heatmap(byDay) {
    const wrap = el('div');
    const days = Object.keys(byDay).sort();
    const max = Math.max.apply(null, days.map(function (k) { return byDay[k].xp; }).concat([1]));
    const cells = [];
    const start = new Date();
    start.setDate(start.getDate() - 90);
    for (let i = 0; i < 91; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = U.dayKey(d);
      const xp = (byDay[key] || {}).xp || 0;
      const lvl = xp === 0 ? 0 : xp > max * 0.66 ? 4 : xp > max * 0.33 ? 3 : xp > max * 0.12 ? 2 : 1;
      cells.push({ key: key, lvl: lvl, xp: xp });
    }
    const heat = el('div.heat', { role: 'img', 'aria-label': 'Activité des 91 derniers jours' });
    cells.forEach(function (c) {
      heat.appendChild(el('div.heat__cell', {
        dataset: { l: String(c.lvl) },
        title: c.key + ' : ' + U.num(c.xp) + ' XP',
      }));
    });
    wrap.appendChild(heat);
    const legend = [];
    for (let l = 0; l <= 4; l++) legend.push(el('div.heat__cell', { dataset: { l: String(l) } }));
    wrap.appendChild(el('div.row.row--tight.mt-3', null, [
      el('span.text-xs.text-3', { text: 'Moins' }),
    ].concat(legend, [
      el('span.text-xs.text-3', { text: 'Plus' }),
      el('span.grow'),
      el('span.text-xs.text-3', { text: days.length + ' jours actifs · ' + U.num(U.sum(days, function (k) { return byDay[k].xp; })) + ' XP' }),
    ])));
    return wrap;
  }

  QV.statistics = { heatmap: heatmap };
})(window);
