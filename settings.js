/* ==========================================================================
   QuizVerse — paramètres, thèmes, sauvegarde et réinitialisation
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});
  const U = QV.util;
  const el = U.el;
  const V = (QV.views = QV.views || {});

  const THEMES = [
    { id: 'dark', label: 'Dark', emoji: '🌙', desc: 'Sombre équilibré, confort optimal' },
    { id: 'amoled', label: 'AMOLED', emoji: '⚫', desc: 'Noir profond pour OLED' },
    { id: 'light', label: 'Light', emoji: '☀️', desc: 'Clair et lisible en plein jour' },
    { id: 'neon', label: 'Neon', emoji: '💡', desc: 'Cyberpunk rose et turquoise' },
    { id: 'cyber', label: 'Cyber', emoji: '🛰️', desc: 'Bleu nuit et jaune technique' },
  ];

  /* -------------------------------------------------------- THÈMES ---- */

  function applyTheme(id) {
    const allowed = THEMES.map(function (t) { return t.id; });
    const theme = allowed.indexOf(id) >= 0 ? id : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'light' ? '#f4f5fb' : (theme === 'amoled' ? '#000000' : '#07070f'));
    }
    const s = QV.store.loadSettings();
    s.theme = theme;
    QV.store.saveSettings(s);
    return theme;
  }

  function applyMotion() {
    const s = QV.store.loadSettings();
    document.documentElement.setAttribute('data-motion', s.reduceMotion ? 'off' : 'on');
  }

  function cycleTheme() {
    const s = QV.store.loadSettings();
    const idx = THEMES.findIndex(function (t) { return t.id === s.theme; });
    const next = THEMES[(idx + 1) % THEMES.length];
    applyTheme(next.id);
    QV.music.reloadSettings();
    QV.ui.toast('Thème : ' + next.label, next.desc, 'info', 1600);
    return next.id;
  }

  /* --------------------------------------------------------- PAGE ----- */

  V.parametres = function () {
    const page = el('div.qv-main.qv-main--narrow.qv-page-enter');
    const s = QV.store.loadSettings();

    page.appendChild(el('div.page-head', null, [
      el('div.page-head__eyebrow', { text: '⚙️ PARAMÈTRES' }),
      el('h1', { text: 'Paramètres' }),
      el('p.page-head__sub', { text: 'Tout est stocké dans ton navigateur. Ces réglages n’affectent que cet appareil.' }),
    ]));

    /* ---- Thème ---- */
    page.appendChild(el('section.section', null, [
      el('div.panel', null, [
        el('div.panel__title', { text: '🎨 Thème visuel' }),
        el('div.grid.grid--5', { style: { gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px,100%), 1fr))' } }, THEMES.map(function (t) {
          return el('button.title-card', {
            type: 'button', 'aria-pressed': s.theme === t.id ? 'true' : 'false',
            onclick: function () {
              applyTheme(t.id);
              U.$$('.title-card[data-theme-id]').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
              this.setAttribute('aria-pressed', 'true');
              QV.ui.toast('Thème : ' + t.label, '', 'success', 1400);
            },
            dataset: { themeId: t.id },
          }, [
            el('div', { text: t.emoji, style: { fontSize: '1.5rem' } }),
            el('div.title-card__name', { text: t.label }),
            el('div.title-card__cond', { text: t.desc }),
          ]);
        })),
      ]),
    ]));

    /* ---- Musique ---- */
    const musicPanel = el('div.panel');
    musicPanel.appendChild(el('div.panel__title', { text: '🎵 Musique' }));
    musicPanel.appendChild(switchRow('Musique activée', 'Lecture automatique après le premier clic sur le site.', s.music, function (v) {
      const st = QV.store.loadSettings(); st.music = v; QV.store.saveSettings(st);
      QV.music.reloadSettings();
      if (v) QV.music.play(); else QV.music.pause();
    }));
    musicPanel.appendChild(switchRow('Couper le son', 'Coupe la musique sans arrêter la lecture.', s.muted, function (v) {
      const st = QV.store.loadSettings(); st.muted = v; QV.store.saveSettings(st);
      QV.music.reloadSettings();
    }));
    musicPanel.appendChild(el('div.field.mt-3', null, [
      el('label.field__label', { for: 'set-vol', text: 'Volume de la musique' }),
      el('div.row', null, [
        el('input.range', {
          id: 'set-vol', type: 'range', min: '0', max: '100', step: '1', value: String(Math.round(s.musicVolume * 100)),
          oninput: function () {
            const st = QV.store.loadSettings();
            st.musicVolume = U.clamp(Number(this.value) / 100, 0, 1);
            if (st.musicVolume > 0) st.muted = false;
            QV.store.saveSettings(st);
            QV.music.reloadSettings();
            const out = document.getElementById('set-vol-val');
            if (out) out.textContent = this.value + '%';
          },
        }),
        el('span.text-sm.fw-700', { id: 'set-vol-val', text: Math.round(s.musicVolume * 100) + '%', style: { minWidth: '46px', textAlign: 'right' } }),
      ]),
    ]));
    musicPanel.appendChild(el('div.field', null, [
      el('label.field__label', { for: 'set-track', text: 'Morceau préféré (menu)' }),
      el('select.select', {
        id: 'set-track',
        onchange: function () {
          const st = QV.store.loadSettings();
          st.musicTrack = Number(this.value);
          QV.store.saveSettings(st);
          QV.ui.toast('Piste sélectionnée', QV.music.PLAYLIST[Number(this.value)].title, 'info', 1600);
        },
      }, QV.music.PLAYLIST.map(function (t, i) {
        return el('option', { value: String(i), selected: (s.musicTrack || 0) === i ? true : null, text: t.emoji + ' ' + t.title + ' · ' + t.mood });
      })),
    ]));
    musicPanel.appendChild(el('div.divider'));
    musicPanel.appendChild(el('div.panel__title', { text: '🎼 Pistes disponibles' }));
    musicPanel.appendChild(el('div.list', null, QV.music.PLAYLIST.map(function (t) {
      const playing = QV.music.currentTitle === t.title;
      return el('div.list-item', null, [
        el('div.list-item__icon', { text: t.emoji }),
        el('div.list-item__body', null, [
          el('div.list-item__title', { text: t.title }),
          el('div.list-item__sub', { text: t.mood + (playing ? ' · en cours' : '') }),
        ]),
        el('button.btn.btn--sm.btn--ghost', {
          type: 'button', text: playing ? '▶ Lecture' : 'Écouter',
          onclick: function () {
            const st = QV.store.loadSettings(); st.music = true; QV.store.saveSettings(st);
            QV.music.play();
            QV.music.setContext('quiz', { force: true, autoplay: true });
            QV.ui.toast('Lecture de ' + t.title, t.mood, 'info', 1600);
          },
        }),
      ]);
    })));
    page.appendChild(el('section.section', null, [musicPanel]));

    /* ---- Sons ---- */
    const sfxPanel = el('div.panel');
    sfxPanel.appendChild(el('div.panel__title', { text: '🔊 Effets sonores' }));
    sfxPanel.appendChild(switchRow('Effets sonores activés', 'Clics, bonnes réponses, badges, victoire…', s.sfx, function (v) {
      const st = QV.store.loadSettings(); st.sfx = v; QV.store.saveSettings(st);
      QV.music.reloadSettings();
      if (v) QV.music.sfx('correct');
    }));
    sfxPanel.appendChild(el('div.field.mt-3', null, [
      el('label.field__label', { for: 'set-sfxvol', text: 'Volume des effets' }),
      el('div.row', null, [
        el('input.range', {
          id: 'set-sfxvol', type: 'range', min: '0', max: '100', step: '1', value: String(Math.round(s.sfxVolume * 100)),
          oninput: function () {
            const st = QV.store.loadSettings();
            st.sfxVolume = U.clamp(Number(this.value) / 100, 0, 1);
            QV.store.saveSettings(st);
            QV.music.reloadSettings();
            const out = document.getElementById('set-sfxvol-val');
            if (out) out.textContent = this.value + '%';
          },
        }),
        el('span.text-sm.fw-700', { id: 'set-sfxvol-val', text: Math.round(s.sfxVolume * 100) + '%', style: { minWidth: '46px', textAlign: 'right' } }),
      ]),
    ]));
    sfxPanel.appendChild(el('div.field', null, [
      el('div.field__label', { text: 'Tester les sons' }),
      el('div.row.row--tight', null, [
        ['click', 'Clic'], ['correct', 'Bonne réponse'], ['wrong', 'Mauvaise réponse'],
        ['tick', 'Chrono'], ['levelup', 'Niveau supérieur'], ['badge', 'Badge'],
        ['victory', 'Victoire'], ['perfect', 'Parfait'],
      ].map(function (b) {
        return el('button.chip.chip--sm', {
          type: 'button', text: b[1],
          onclick: function () { QV.music.sfx(b[0]); },
        });
      })),
    ]));
    page.appendChild(el('section.section', null, [sfxPanel]));

    /* ---- Jeu ---- */
    const gamePanel = el('div.panel');
    gamePanel.appendChild(el('div.panel__title', { text: '🎮 Préférences de jeu' }));
    gamePanel.appendChild(el('div.field', null, [
      el('div.field__label', { text: 'Difficulté par défaut' }),
      el('div.segmented', null, ['facile', 'moyen', 'difficile', 'expert'].map(function (d) {
        return el('button.chip', {
          type: 'button', 'aria-pressed': s.defaultDifficulty === d ? 'true' : 'false',
          text: QV.data.DIFF_EMOJI[d] + ' ' + QV.data.DIFF_LABEL[d],
          onclick: function () {
            const st = QV.store.loadSettings(); st.defaultDifficulty = d; QV.store.saveSettings(st);
            U.$$('.chip', this.parentNode).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
            this.setAttribute('aria-pressed', 'true');
          },
        });
      })),
    ]));
    gamePanel.appendChild(el('div.field', null, [
      el('div.field__label', { text: 'Nombre de questions par défaut' }),
      el('div.segmented', null, [5, 10, 20, 30, 50].map(function (c) {
        return el('button.chip', {
          type: 'button', 'aria-pressed': s.defaultQuestions === c ? 'true' : 'false', text: String(c),
          onclick: function () {
            const st = QV.store.loadSettings(); st.defaultQuestions = c; QV.store.saveSettings(st);
            U.$$('.chip', this.parentNode).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
            this.setAttribute('aria-pressed', 'true');
          },
        });
      })),
    ]));
    gamePanel.appendChild(el('div.field', null, [
      el('div.field__label', { text: 'Passage automatique à la question suivante' }),
      el('div.segmented', null, [
        { v: false, l: 'Manuel' }, { v: true, l: 'Automatique' },
      ].map(function (o) {
        return el('button.chip', {
          type: 'button', 'aria-pressed': s.autoNext === o.v ? 'true' : 'false', text: o.l,
          onclick: function () {
            const st = QV.store.loadSettings(); st.autoNext = o.v; QV.store.saveSettings(st);
            U.$$('.chip', this.parentNode).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
            this.setAttribute('aria-pressed', 'true');
          },
        });
      })),
    ]));
    gamePanel.appendChild(switchRow('Afficher l’explication après chaque réponse', 'Recommandé pour progresser.', s.showExplanationAlways, function (v) {
      const st = QV.store.loadSettings(); st.showExplanationAlways = v; QV.store.saveSettings(st);
    }));
    gamePanel.appendChild(switchRow('Demander confirmation avant de quitter un quiz', 'Évite les parties abandonnées par accident.', s.confirmBeforeQuit, function (v) {
      const st = QV.store.loadSettings(); st.confirmBeforeQuit = v; QV.store.saveSettings(st);
    }));
    page.appendChild(el('section.section', null, [gamePanel]));

    /* ---- Accessibilité ---- */
    const a11y = el('div.panel');
    a11y.appendChild(el('div.panel__title', { text: '♿ Accessibilité' }));
    a11y.appendChild(switchRow('Réduire les animations', 'Supprime les transitions, les confettis et les halos animés.', s.reduceMotion, function (v) {
      const st = QV.store.loadSettings(); st.reduceMotion = v; QV.store.saveSettings(st);
      applyMotion();
    }));
    a11y.appendChild(switchRow('Raccourcis clavier', '1-4 pour répondre, Entrée pour valider, / pour la recherche, Échap pour quitter.', s.keyboardShortcuts, function (v) {
      const st = QV.store.loadSettings(); st.keyboardShortcuts = v; QV.store.saveSettings(st);
    }));
    a11y.appendChild(el('p.text-xs.text-3.mt-3.mb-0', { text: 'Astuce : si ton système est réglé sur « réduire les animations », QuizVerse le détecte automatiquement.' }));
    page.appendChild(el('section.section', null, [a11y]));

    /* ---- Sauvegarde ---- */
    const savePanel = el('div.panel');
    savePanel.appendChild(el('div.panel__title', { text: '💾 Sauvegarde locale' }));
    savePanel.appendChild(el('p.text-sm.text-2', { text: 'Ta progression est stockée dans ce navigateur via localStorage. Exporte un fichier de sauvegarde pour la transférer sur un autre appareil ou la conserver.' }));
    savePanel.appendChild(el('div.row.row--tight.mt-3', null, [
      el('button.btn.btn--soft', { type: 'button', text: '⬇️ Exporter ma sauvegarde', onclick: exportSave }),
      el('button.btn.btn--ghost', { type: 'button', text: '⬆️ Importer une sauvegarde', onclick: importSave }),
    ]));
    savePanel.appendChild(el('div.divider'));
    savePanel.appendChild(el('dl.kv', null, [
      el('dt', { text: 'Clés stockées' }), el('dd', { text: U.num(QV.store.keys().length) }),
      el('dt', { text: 'Espace utilisé' }), el('dd', { text: (QV.store.usage() / 1024).toFixed(1) + ' Ko' }),
      el('dt', { text: 'Version des données' }), el('dd', { text: QV.store.get('version', '—') }),
    ]));
    page.appendChild(el('section.section', null, [savePanel]));

    /* ---- Zone sensible ---- */
    const danger = el('div.panel', { style: { borderColor: 'rgba(251,113,133,.35)' } });
    danger.appendChild(el('div.panel__title', { text: '⚠️ Zone sensible' }));
    danger.appendChild(el('div.switch', null, [
      el('div.switch__body', null, [
        el('div.switch__title', { text: 'Réinitialiser toute la progression' }),
        el('div.switch__desc', { text: 'Efface profil, XP, badges, titres, historique, favoris, erreurs, défis et statistiques. Irréversible.' }),
      ]),
      el('button.btn.btn--danger', { type: 'button', text: 'Tout réinitialiser', onclick: resetAll }),
    ]));
    danger.appendChild(el('div.switch', null, [
      el('div.switch__body', null, [
        el('div.switch__title', { text: 'Effacer seulement l’historique' }),
        el('div.switch__desc', { text: 'Supprime la liste des parties jouées sans toucher au reste.' }),
      ]),
      el('button.btn.btn--ghost', { type: 'button', text: 'Effacer', onclick: function () {
        QV.ui.confirm('Effacer l’historique ?', 'Tes statistiques et badges seront conservés.', 'Effacer', true).then(function (ok) {
          if (!ok) return;
          QV.store.saveHistory([]);
          QV.ui.toast('Historique effacé', '', 'success');
          QV.app.render();
        });
      } }),
    ]));
    page.appendChild(el('section.section', null, [danger]));

    page.appendChild(el('p.text-xs.text-3.text-center', {
      text: 'QuizVerse ' + (QV.store.get('version', '1.0.0')) + ' · Site statique · Aucune donnée envoyée sur un serveur',
    }));

    return page;
  };

  /* --------------------------------------------------- COMPOSANTS ------ */

  function switchRow(title, desc, checked, onChange) {
    const input = el('input', { type: 'checkbox', checked: checked ? true : null });
    input.addEventListener('change', function () { onChange(this.checked); });
    return el('label.switch', null, [
      el('div.switch__body', null, [
        el('div.switch__title', { text: title }),
        desc ? el('div.switch__desc', { text: desc }) : null,
      ]),
      input,
      el('span.switch__track', { 'aria-hidden': 'true' }),
    ]);
  }

  function exportSave() {
    const payload = QV.store.exportAll();
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: 'quizverse-sauvegarde-' + U.dayKey() + '.json' });
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 500);
    QV.ui.toast('Sauvegarde exportée', 'Conserve ce fichier en lieu sûr.', 'success');
  }

  function importSave() {
    const input = el('input', { type: 'file', accept: 'application/json,.json', style: { display: 'none' } });
    document.body.appendChild(input);
    input.addEventListener('change', function () {
      const file = input.files && input.files[0];
      if (!file) { input.remove(); return; }
      const reader = new FileReader();
      reader.onload = function () {
        try {
          const payload = JSON.parse(reader.result);
          const n = QV.store.importAll(payload);
          QV.ui.toast('Sauvegarde importée', n + ' données restaurées. Rechargement…', 'success', 2600);
          applyTheme(QV.store.loadSettings().theme);
          applyMotion();
          setTimeout(function () { location.reload(); }, 900);
        } catch (e) {
          QV.ui.toast('Import impossible', e.message || 'Fichier invalide', 'error', 4200);
        } finally {
          input.remove();
        }
      };
      reader.readAsText(file);
    });
    input.click();
  }

  function resetAll() {
    QV.ui.confirm(
      'Réinitialiser toute la progression ?',
      'Ton pseudo, ton XP, tes niveaux, tes badges, tes titres, ton historique, tes favoris, tes erreurs et tes statistiques seront définitivement effacés. Cette action est irréversible.',
      'Tout effacer',
      true
    ).then(function (ok) {
      if (!ok) return;
      QV.store.resetEverything();
      QV.ui.toast('Progression réinitialisée', 'Rechargement de l’application…', 'info', 2200);
      setTimeout(function () { location.reload(); }, 800);
    });
  }

  QV.settings = {
    THEMES: THEMES,
    applyTheme: applyTheme,
    applyMotion: applyMotion,
    cycleTheme: cycleTheme,
    exportSave: exportSave,
    importSave: importSave,
  };
})(window);
