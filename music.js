/* ==========================================================================
   QuizVerse — lecteur musical intégré
   --------------------------------------------------------------------------
   • La musique est synthétisée par le navigateur (voir js/audio.js) :
     aucune piste n'est téléchargée, aucun serveur audio n'est utilisé.
   • Le navigateur bloque l'audio avant une interaction : le lecteur attend
     le premier clic / clavier / tactile avant de démarrer.
   • Préférences sauvegardées dans localStorage (via QV.store).
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});
  const U = QV.util;

  /* ------------------------------------------------------------- Pistes */

  const PLAYLIST = [
    { id: 'menu', title: 'Nebula', mood: 'Menu', emoji: '🌌' },
    { id: 'quiz-1', title: 'Pulse Grid', mood: 'Quiz', emoji: '⚡' },
    { id: 'quiz-2', title: 'Circuit Flow', mood: 'Quiz', emoji: '🎛️' },
  ];

  const INTENSE = { id: 'intense', title: 'Overdrive', mood: 'Difficile', emoji: '🔥' };
  const VICTORY = { id: 'victory', title: 'Triumph', mood: 'Résultats', emoji: '🏆' };
  const PERFECT = { id: 'perfect', title: 'Ascension', mood: 'Parfait', emoji: '🌟' };

  const CONTEXTS = {
    menu: { playlist: [PLAYLIST[0]], loop: true },
    quiz: { playlist: [PLAYLIST[1], PLAYLIST[2]], loop: true },
    quizHard: { track: INTENSE, loop: true },
    results: { track: VICTORY, loop: true },
    perfect: { track: PERFECT, loop: true },
  };

  /* ------------------------------------------------------------- État */

  const m = {
    ctx: null, source: null, gain: null,
    unlocked: false,
    settings: null,
    trackIndex: 0,
    context: 'menu',
    current: PLAYLIST[0],
    playing: false,
    wantPlay: false,
    nodes: {},
    preparing: false,
  };

  /* ------------------------------------------------------ Initialisation */

  function init() {
    m.nodes = {
      player: document.getElementById('music-player'),
      title: document.getElementById('music-title'),
      toggle: document.getElementById('music-toggle'),
      prev: document.getElementById('music-prev'),
      next: document.getElementById('music-next'),
      mute: document.getElementById('music-mute'),
      vol: document.getElementById('music-vol'),
      volval: document.getElementById('music-volval'),
      expand: document.getElementById('music-expand'),
      expandBtn: document.getElementById('music-expand-btn'),
      headerBtn: document.getElementById('music-btn'),
      progress: document.getElementById('music-progress'),
    };

    m.settings = QV.store.loadSettings();
    applySettings();
    bindNodes();
    listenFirstInteraction();
    renderLabel();

    // Pré-calcule les pistes pendant que le joueur lit la page d'accueil :
    // la lecture démarrera ensuite instantanément.
    setTimeout(function () {
      if (!QV.audio || !QV.audio.supported()) return;
      QV.audio.preload(['menu', 'quiz-1', 'quiz-2'], function () {
        QV.audio.preload(['intense']);
      });
    }, 500);
  }

  function bindNodes() {
    const n = m.nodes;
    if (!n.toggle) return;

    n.toggle.addEventListener('click', function () {
      unlock();
      if (m.playing) pause(); else play();
    });

    if (n.headerBtn) n.headerBtn.addEventListener('click', function () {
      unlock();
      const s = QV.store.loadSettings();
      s.music = !s.music;
      QV.store.saveSettings(s);
      m.settings = s;
      applySettings();
      if (s.music) { unlock(); play(); } else { pause(); }
      QV.ui.toast(s.music ? 'Musique activée' : 'Musique coupée', m.current.emoji + ' ' + m.current.title + ' · ' + m.current.mood, 'info', 2000);
    });

    if (n.prev) n.prev.addEventListener('click', function () { unlock(); step(-1); });
    if (n.next) n.next.addEventListener('click', function () { unlock(); step(1); });

    if (n.mute) n.mute.addEventListener('click', function () {
      const s = QV.store.loadSettings();
      s.muted = !s.muted;
      QV.store.saveSettings(s);
      m.settings = s;
      applySettings();
    });

    if (n.vol) n.vol.addEventListener('input', function () {
      const s = QV.store.loadSettings();
      s.musicVolume = U.clamp(Number(n.vol.value) / 100, 0, 1);
      if (s.musicVolume > 0) s.muted = false;
      QV.store.saveSettings(s);
      m.settings = s;
      applySettings();
    });
    if (n.vol) n.vol.addEventListener('change', function () {
      QV.ui.toast('Volume de la musique', U.pct(m.settings.musicVolume), 'info', 1400);
    });

    if (n.expandBtn) n.expandBtn.addEventListener('click', function () {
      if (n.expand.hasAttribute('hidden')) n.expand.removeAttribute('hidden');
      else n.expand.setAttribute('hidden', '');
    });

    const main = n.player && n.player.querySelector('.music-player__main');
    if (main) {
      main.addEventListener('click', function (e) {
        if (e.target.closest('button')) return;
        if (global.innerWidth <= 560) {
          if (n.player.classList.contains('is-mini')) n.player.classList.remove('is-mini');
          else if (n.player.classList.contains('is-open')) n.player.classList.remove('is-open');
          else n.player.classList.add('is-open');
        }
      });
    }
  }

  function listenFirstInteraction() {
    if (m.unlocked) return;
    const once = function () {
      m.unlocked = true;
      unlock();
      ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
        document.removeEventListener(ev, once, true);
      });
      if (m.wantPlay) play();
      renderLabel();
    };
    ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
      document.addEventListener(ev, once, { capture: true, passive: true });
    });
  }

  /** Autorise l'audio (politique autoplay des navigateurs). */
  function unlock() {
    if (!QV.audio || !QV.audio.supported()) {
      if (!shownUnsupported) {
        shownUnsupported = true;
        QV.ui && QV.ui.toast('Audio non disponible', 'Ton navigateur ne prend pas en charge le Web Audio.', 'info', 3200);
      }
      return false;
    }
    QV.audio.resume();
    return true;
  }

  let shownUnsupported = false;

  /* --------------------------------------------------------- Réglages */

  function targetVolume() {
    const s = m.settings || QV.store.loadSettings();
    if (!s.music || s.muted) return 0;
    return U.clamp(s.musicVolume, 0, 1) * 0.7;
  }

  function applySettings() {
    const s = m.settings || QV.store.loadSettings();
    m.settings = s;
    const n = m.nodes;
    if (n.vol) n.vol.value = Math.round(s.musicVolume * 100);
    if (n.volval) n.volval.textContent = Math.round(s.musicVolume * 100) + '%';
    if (n.mute) {
      n.mute.textContent = (s.muted || s.musicVolume === 0) ? '🔇' : '🔊';
      n.mute.setAttribute('aria-pressed', s.muted ? 'true' : 'false');
      n.mute.setAttribute('aria-label', s.muted ? 'Rétablir le son' : 'Couper le son');
    }
    if (n.headerBtn) {
      n.headerBtn.textContent = s.music ? '♪' : '♪̶';
      n.headerBtn.setAttribute('aria-pressed', s.music ? 'true' : 'false');
      n.headerBtn.setAttribute('aria-label', s.music ? 'Couper la musique' : 'Activer la musique');
    }
    updateToggle();
    setGain(targetVolume());
  }

  function setGain(v) {
    if (!m.gain || !m.ctx) return;
    try {
      m.gain.gain.cancelScheduledValues(m.ctx.currentTime);
      m.gain.gain.setTargetAtTime(v, m.ctx.currentTime, 0.06);
    } catch (e) { /* ignoré */ }
  }

  /* ------------------------------------------------------ Lecture */

  function playlistFor(ctxName) {
    const ctx = CONTEXTS[ctxName] || CONTEXTS.menu;
    return ctx.playlist || (ctx.track ? [ctx.track] : PLAYLIST);
  }

  function startSource(track) {
    if (!unlock()) return;
    const ctx = QV.audio.resume();
    if (!ctx) return;

    const cached = QV.audio.get(track.id);
    if (cached) { attach(track, cached); return; }

    // La piste n'est pas encore calculée : on prépare sans bloquer l'écran.
    preparing(track);
    QV.audio.renderTrackAsync(track.id, function (data) {
      if (!data) {
        preparing(false);
        QV.ui.toast('Musique indisponible', 'La synthèse audio a échoué sur cet appareil.', 'error', 3200);
        return;
      }
      preparing(false);
      attach(track, data);
    });
  }

  function attach(track, data) {
    const ctx = QV.audio.resume();
    if (!ctx) return;
    stopSource(true);
    if (!data || !data.length) return;

    let buffer;
    try {
      buffer = ctx.createBuffer(1, data.length, QV.audio.SR);
      buffer.copyToChannel(data, 0);
    } catch (e) {
      console.warn('[QuizVerse] Lecture impossible', e);
      return;
    }

    if (!m.gain) m.gain = ctx.createGain();
    m.gain.gain.value = 0;
    try { m.gain.connect(ctx.destination); } catch (e) { /* déjà connecté */ }

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    src.connect(m.gain);
    try { src.start(0); } catch (e) { /* ignoré */ }

    m.source = src;
    m.current = track;
    m.playing = true;
    renderLabel();
    setGain(targetVolume());
    if (m.nodes.player) m.nodes.player.classList.add('is-playing');
    updateToggle();
    animateProgress(buffer.duration);
  }

  function preparing(track) {
    const p = m.nodes.player;
    if (!p) return;
    if (track) {
      p.classList.add('is-preparing');
      const t = m.nodes.title;
      if (t) t.textContent = '⏳ ' + (track.emoji || '') + (track.title || '') + ' — préparation…';
      updateToggle();
    } else {
      p.classList.remove('is-preparing');
      renderLabel();
    }
  }

  function animateProgress(duration) {
    const bar = m.nodes.progress;
    if (!bar) return;
    bar.classList.remove('is-running');
    void bar.offsetWidth; // relance l'animation CSS
    bar.style.animationDuration = (duration || 40) + 's';
    bar.classList.add('is-running');
  }

  function resetProgress() {
    const bar = m.nodes.progress;
    if (!bar) return;
    bar.classList.remove('is-running');
    bar.style.width = '0%';
  }

  function stopSource(silent) {
    if (m.source) {
      try { m.source.stop(); } catch (e) { /* ignoré */ }
      try { m.source.disconnect(); } catch (e) { /* ignoré */ }
      m.source = null;
    }
    if (!silent) resetProgress();
  }

  function play() {
    const s = QV.store.loadSettings();
    if (!s.music) { s.music = true; QV.store.saveSettings(s); m.settings = s; applySettings(); }
    m.wantPlay = true;
    startSource(currentTrack());
  }

  function pause() {
    m.wantPlay = false;
    stopSource();
    m.playing = false;
    if (m.nodes.player) m.nodes.player.classList.remove('is-playing');
    updateToggle();
  }

  function toggle() {
    if (m.playing) pause(); else play();
  }

  function currentTrack() {
    const list = playlistFor(m.context);
    return list[m.trackIndex % list.length] || PLAYLIST[0];
  }

  function step(dir) {
    const list = playlistFor(m.context);
    if (list.length <= 1) {
      m.trackIndex = 0;
      if (m.wantPlay || !m.playing) startSource(list[0]);
      return;
    }
    m.trackIndex = ((m.trackIndex + dir) % list.length + list.length) % list.length;
    startSource(list[m.trackIndex]);
  }

  /** Change le contexte musical (menu / quiz / résultats / parfait). */
  function setContext(ctxName, opts) {
    const o = opts || {};
    const next = ctxName || 'menu';
    if (m.context === next && !o.force) return;
    m.context = next;
    const list = playlistFor(next);
    if (list.indexOf(m.current) < 0) {
      m.trackIndex = Math.max(0, list.indexOf(currentTrack()));
      if (list.indexOf(m.current) < 0) m.trackIndex = 0;
    }
    m.current = list[m.trackIndex % list.length] || list[0];
    renderLabel();
    const s = m.settings || QV.store.loadSettings();
    if (s.music && !s.muted && (m.playing || m.unlocked)) startSource(m.current);
  }

  function renderLabel() {
    const n = m.nodes;
    if (!n.title) return;
    n.title.textContent = m.current.emoji + ' ' + m.current.title;
    n.title.title = m.current.mood + ' — ' + m.current.title;
  }

  function updateToggle() {
    const n = m.nodes.toggle;
    if (!n) return;
    n.textContent = m.playing ? '⏸' : '▶';
    n.setAttribute('aria-label', m.playing ? 'Mettre la musique en pause' : 'Lire la musique');
  }

  /** Effets sonores. */
  function sfx(name) {
    const s = m.settings || QV.store.loadSettings();
    if (!s || !s.sfx || s.sfxVolume <= 0) return;
    if (!QV.audio || !QV.audio.supported()) return;
    QV.audio.resume();
    QV.audio.playSfx(name);
  }

  QV.music = {
    init: init,
    play: play,
    pause: pause,
    toggle: toggle,
    step: step,
    setContext: setContext,
    applySettings: applySettings,
    reloadSettings: function () { m.settings = QV.store.loadSettings(); applySettings(); },
    sfx: sfx,
    unlock: unlock,
    warmup: function () { /* le pré-chargement est lancé dans init() */ },
    get settings() { return m.settings; },
    get currentTitle() { return m.current.title; },
    get currentMood() { return m.current.mood; },
    get playing() { return m.playing; },
    PLAYLIST: PLAYLIST,
    INTENSE: INTENSE,
    VICTORY: VICTORY,
    PERFECT: PERFECT,
    CONTEXTS: CONTEXTS,
  };
})(window);
