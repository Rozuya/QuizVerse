/* ==========================================================================
   QuizVerse — profil, avatars, titres et tableau de bord personnel
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});
  const U = QV.util;
  const el = U.el;
  const V = (QV.views = QV.views || {});

  /* ------------------------------------------------------------ AVATARS */

  function avatars() {
    return QV.data.state.avatars || [];
  }

  function avatarList() { return avatars(); }

  function currentAvatar() {
    const p = QV.xp.profile();
    return p.avatar || 'avatar-orbit';
  }

  function setAvatar(id) {
    const p = QV.xp.profile();
    p.avatar = id;
    QV.xp.saveProfile(p);
    return true;
  }

  /* -------------------------------------------------------------- PAGE */

  V.profil = function () {
    const page = el('div.qv-page-enter');
    const p = QV.xp.profile();
    const st = QV.store.loadStats();
    const d = QV.xp.derived();
    const lvl = d.level;
    const badges = QV.store.loadBadges();
    const badgeCount = Object.keys(badges).length;
    const totalBadges = (QV.data.state.achievements || []).length;
    const mastery = QV.mastery.summary();
    const hist = QV.store.loadHistory();

    /* ---- Carte d'identité ---- */
    const identity = el('div.panel.mb-5', null, [
      el('div.row.row--tight', { style: { gap: '20px', flexWrap: 'wrap' } }, [
        el('div.avatar-140', null, [el('div', { id: 'avatar-preview', html: QV.ui.avatarSvg(currentAvatar(), 140) })]),
        el('div.grow', { style: { minWidth: '240px' } }, [
          el('div.row.row--tight', null, [
            el('h1', { id: 'pseudo-display', text: p.pseudo || 'Joueur anonyme', style: { marginBottom: '0' } }),
            el('button.icon-btn', { type: 'button', 'aria-label': 'Modifier le pseudo', title: 'Modifier', text: '✎', onclick: editPseudo }),
          ]),
          el('div.row.row--tight.mt-2', null, [
            el('span.pill.pill--accent', { text: '🏅 ' + (QV.xp.titlesList().filter(function (t) { return t.id === p.title; })[0] || { label: 'Débutant' }).label }),
            el('span.pill', { text: QV.xp.levelRank(lvl.level) }),
            el('span.pill', { text: '📅 ' + U.dateLong(p.createdAt) }),
          ]),
          el('div.mt-3', null, [
            el('div.row.row--between.mb-2', null, [
              el('strong', { text: 'Niveau ' + lvl.level }),
              el('span.text-sm.text-2', { text: U.num(lvl.into) + ' / ' + U.num(lvl.need) + ' XP' }),
            ]),
            el('div.bar.bar--lg.xp-bar', { role: 'progressbar', 'aria-valuenow': Math.round(lvl.progress), 'aria-valuemin': '0', 'aria-valuemax': '100' }, [
              el('i.bar__fill', { style: { width: lvl.progress + '%' } }),
            ]),
            el('div.text-xs.text-3.mt-2', { text: U.num(p.xp) + ' XP au total' + (lvl.max ? ' · niveau maximum atteint' : ' · encore ' + U.num(lvl.need - lvl.into) + ' XP avant le niveau ' + (lvl.level + 1)) }),
          ]),
        ]),
        el('div.level-badge', { id: 'level-badge' }, [
          el('b', { text: String(lvl.level) }),
          el('span', { text: 'Niveau' }),
        ]),
      ]),
    ]);
    page.appendChild(identity);

    /* ---- Statistiques principales ---- */
    page.appendChild(el('section.section', null, [
      el('div.grid.grid--stats', null, [
        QV.ui.stat('Quiz joués', U.num(st.quizzes), 'Parties terminées', '🎮'),
        QV.ui.stat('Questions répondues', U.num(st.questions), U.num(st.correct) + ' bonnes', '❓'),
        QV.ui.stat('Bonnes réponses', U.num(st.correct), st.incorrect + ' mauvaises', '✅'),
        QV.ui.stat('Taux de réussite', d.accuracy ? U.pct(d.accuracy) : '—', 'Moyenne générale', '🎯'),
        QV.ui.stat('Meilleur score', st.bestScore ? st.bestScore + '<small>%</small>' : '—', U.num(st.bestScorePct) + ' points', '🏆'),
        QV.ui.stat('Meilleure série', U.num(st.bestStreak), 'Bonnes réponses d’affilée', '🔥'),
        QV.ui.stat('Temps total', U.duration(d.totalTime), 'Temps de jeu', '⏱️'),
        QV.ui.stat('Badges', badgeCount + '<small> / ' + totalBadges + '</small>', 'Badges débloqués', '🏅'),
        QV.ui.stat('XP totale', U.num(p.xp), 'Expérience cumulée', '⭐'),
        QV.ui.stat('Quiz parfaits', U.num(st.perfects), 'Parties à 100 %', '💎'),
        QV.ui.stat('Jours joués', U.num((p.playDays || []).length), 'Jours différents', '📅'),
        QV.ui.stat('Connaissances', U.num(mastery.known) + '<small> / ' + U.num(mastery.total) + '</small>', U.pct(mastery.progress) + ' de la base', '🧠'),
      ]),
    ]));

    /* ---- Avatars ---- */
    page.appendChild(el('section.section', null, [
      QV.ui.sectionHead('Mon avatar', null, null, '🎨'),
      el('div.panel', null, [
        el('p.text-sm.text-2', { text: 'Choisis ton avatar : il t’accompagne partout dans QuizVerse et n’est stocké que dans ton navigateur.' }),
        el('div.grid.grid--avatars.mt-3#avatar-grid', null, avatarList().map(function (a) {
          const b = el('button.avatar-option', {
            type: 'button', 'aria-pressed': a.id === currentAvatar() ? 'true' : 'false',
            title: a.label, 'aria-label': a.label,
            html: QV.ui.avatarSvg(a.id, 96),
            onclick: function () {
              setAvatar(a.id);
              U.$$('#avatar-grid .avatar-option').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
              b.setAttribute('aria-pressed', 'true');
              const prev = document.getElementById('avatar-preview');
              if (prev) prev.innerHTML = QV.ui.avatarSvg(a.id, 140);
              QV.app.refreshChrome();
              QV.music.sfx('click');
              QV.ui.toast('Avatar mis à jour', a.label, 'success', 1800);
            },
          });
          return b;
        })),
      ]),
    ]));

    /* ---- Titres ---- */
    const allTitles = QV.xp.titlesList();
    const unlocked = QV.xp.unlockedTitles();
    page.appendChild(el('section.section', null, [
      QV.ui.sectionHead('Mes titres', null, null, '🏷️'),
      el('div.panel', null, [
        el('p.text-sm.text-2.mb-3', { text: unlocked.length + ' titre' + (unlocked.length > 1 ? 's' : '') + ' débloqué' + (unlocked.length > 1 ? 's' : '') + ' sur ' + allTitles.length + '. Clique sur un titre pour l’équiper.' }),
        el('div.grid.grid--3', { style: { gridTemplateColumns: 'repeat(auto-fill, minmax(min(170px,100%), 1fr))' } }, allTitles.map(function (t) {
          const isUnlocked = !!unlocked.filter(function (x) { return x.id === t.id; })[0];
          const equipped = p.title === t.id;
          return el('button.title-card' + (isUnlocked ? '' : '.is-locked'), {
            type: 'button',
            'aria-pressed': equipped ? 'true' : 'false',
            disabled: !isUnlocked,
            onclick: function () {
              if (!isUnlocked) { QV.ui.toast('Titre verrouillé', QV.achievements.conditionText(t.cond), 'info'); return; }
              QV.xp.setTitle(t.id);
              U.$$('.title-card').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
              this.setAttribute('aria-pressed', 'true');
              QV.app.refreshChrome();
              QV.ui.toast('Titre équipé : ' + t.label, '', 'success', 1800);
            },
          }, [
            el('div.title-card__name', { text: t.icon + ' ' + t.label }),
            el('div.title-card__cond', { text: isUnlocked ? (equipped ? 'Équipé' : 'Disponible') : QV.achievements.conditionText(t.cond) }),
          ]);
        })),
      ]),
    ]));

    /* ---- Badges récents ---- */
    const recent = Object.keys(badges).map(function (id) { return badges[id]; })
      .sort(function (a, b) { return b.at - a.at; }).slice(0, 12);
    page.appendChild(el('section.section', null, [
      QV.ui.sectionHead('Badges récents', '#/badges', 'Tous les badges (' + badgeCount + '/' + totalBadges + ')', '🏅'),
      recent.length
        ? el('div.grid.grid--badges', null, recent.map(function (b) {
          return el('a.badge-tile.is-unlocked', { href: '#/badges' }, [
            el('span.badge-tile__icon', { text: b.icon || '🏅' }),
            el('span.badge-tile__name', { text: b.name }),
            el('span.badge-tile__date', { text: U.dateLong(b.at) }),
          ]);
        }))
        : el('p.text-sm.text-3', { text: 'Aucun badge pour le moment. Ton premier quiz t’en débloquera un.' }),
    ]));

    /* ---- Dossier de sauvegarde ---- */
    page.appendChild(el('section.section', null, [
      QV.ui.sectionHead('Données & sauvegarde', '#/parametres', 'Paramètres', '💾'),
      el('div.panel', null, [
        el('dl.kv', null, [
          el('dt', { text: 'Parties enregistrées' }), el('dd', { text: U.num(hist.length) }),
          el('dt', { text: 'Espace utilisé' }), el('dd', { text: (QV.store.usage() / 1024).toFixed(1) + ' Ko' }),
          el('dt', { text: 'Stockage' }), el('dd', { text: QV.store.available ? 'localStorage' : 'Mémoire (session)' }),
          el('dt', { text: 'Questions en base' }), el('dd', { text: U.num(QV.data.questions.length) }),
        ]),
        el('p.text-xs.text-3.mt-3.mb-0', { text: '⚠️ Ces données sont stockées uniquement dans ce navigateur. Si tu vides les données du site ou utilises un autre appareil, tu ne les retrouveras pas. Exporte une sauvegarde depuis Paramètres → Sauvegarde.' }),
      ]),
    ]));

    return page;
  };

  function editPseudo() {
    const p = QV.xp.profile();
    const input = el('input.input', { type: 'text', maxlength: '24', value: p.pseudo || '', placeholder: 'Ton pseudo', 'aria-label': 'Pseudo' });
    QV.ui.modal({
      title: 'Modifier mon pseudo',
      node: el('div', null, [
        el('p.text-sm.text-2', { text: 'Ce pseudo n’est visible que par toi : aucun compte, aucun serveur.' }),
        input,
      ]),
      actions: [
        { label: 'Annuler', kind: 'ghost' },
        {
          label: 'Enregistrer', kind: 'primary', onClick: function () {
            const v = input.value.trim().slice(0, 24);
            p.pseudo = v;
            QV.xp.saveProfile(p);
            QV.app.refreshChrome();
            QV.ui.toast('Pseudo mis à jour', v || 'Joueur anonyme', 'success', 1800);
            QV.app.render();
          },
        },
      ],
    });
  }

  /* --------------------------------------------------------- TITRES ---- */

  V.titres = function () {
    const page = el('div.qv-page-enter');
    page.appendChild(el('div.page-head', null, [
      el('div.page-head__eyebrow', { text: '🏷️ TITRES' }),
      el('h1', { text: 'Mes titres' }),
      el('p.page-head__sub', { text: 'Chaque titre se débloque automatiquement quand tu remplis sa condition. Équipe celui que tu préfères.' }),
    ]));
    const unlocked = QV.xp.unlockedTitles();
    const all = QV.xp.titlesList();
    page.appendChild(el('div.grid.grid--3', null, all.map(function (t) {
      const isUnlocked = !!unlocked.filter(function (x) { return x.id === t.id; })[0];
      const prog = QV.achievements.progressOf({ cond: t.cond }, QV.xp.profile(), QV.store.loadStats());
      return el('div.title-card' + (isUnlocked ? '' : '.is-locked'), {
        onclick: function () {
          if (!isUnlocked) { QV.ui.toast('Titre verrouillé', QV.achievements.conditionText(t.cond), 'info'); return; }
          QV.xp.setTitle(t.id);
          QV.app.refreshChrome();
          QV.app.render();
        },
      }, [
        el('div.title-card__name', { text: t.icon + ' ' + t.label }),
        el('div.title-card__cond', { text: isUnlocked ? 'Débloqué' : QV.achievements.conditionText(t.cond) }),
        isUnlocked ? null : el('div.bar.mt-2', null, [el('i.bar__fill', { style: { width: prog + '%' } })]),
      ]);
    })));
    return page;
  };

  QV.profile = {
    avatarList: avatarList,
    currentAvatar: currentAvatar,
    setAvatar: setAvatar,
    editPseudo: editPseudo,
  };
})(window);
