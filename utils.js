/* ==========================================================================
   QuizVerse — utilitaires globaux
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});

  /* ---------------------------------------------------------------- DOM -- */

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /**
   * Crée un élément.
   * el('div.card', { id: 'x' }, [ child1, 'texte' ])
   */
  function el(spec, attrs, children) {
    const m = /^([a-zA-Z0-9-]+)?((?:[.#][\w-]+)*)$/.exec(spec) || [];
    const tag = m[1] || 'div';
    const node = document.createElement(tag);
    if (m[2]) {
      m[2].split(/(?=[.#])/).forEach((tok) => {
        if (tok[0] === '.') node.classList.add(tok.slice(1));
        else if (tok[0] === '#') node.id = tok.slice(1);
      });
    }
    if (attrs) {
      for (const k in attrs) {
        const v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'html') node.innerHTML = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
        else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === 'dataset') Object.assign(node.dataset, v);
        else node.setAttribute(k, v === true ? '' : v);
      }
    }
    if (children !== undefined && children !== null) {
      // Aplatissement récursif : on peut passer des tableaux imbriqués.
      const list = [];
      (function push(value) {
        if (value === null || value === undefined || value === false || value === '') return;
        if (Array.isArray(value)) { value.forEach(push); return; }
        list.push(value);
      })(children);
      list.forEach((c) => {
        node.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
      });
    }
    return node;
  }

  /** Échappe une chaîne pour un usage HTML sûr. */
  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** Délègue un listener sur un conteneur. */
  function delegate(root, evt, sel, handler) {
    root.addEventListener(evt, function (e) {
      const t = e.target.closest(sel);
      if (t && root.contains(t)) handler.call(t, e, t);
    });
  }

  /* ------------------------------------------------------------- Aléatoire */

  /** Générateur pseudo-aléatoire déterministe (mulberry32) — pour les quiz du jour. */
  function makeRng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Hash simple d'une chaîne -> entier 32 bits. */
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /** Mélange (Fisher-Yates) avec RNG optionnel. */
  function shuffle(arr, rng) {
    const a = arr.slice();
    const r = rng || Math.random;
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function pick(arr, n, rng) {
    return shuffle(arr, rng).slice(0, n);
  }

  function randomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  /* ------------------------------------------------------------- Formatage */

  const NBSP = ' ';

  function num(n) {
    if (n === null || n === undefined || isNaN(n)) return '0';
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  }

  function pct(n, digits) {
    if (!isFinite(n)) return '0' + NBSP + '%';
    return (Math.round(n * Math.pow(10, digits || 0)) / Math.pow(10, digits || 0)) + NBSP + '%';
  }

  function duration(seconds) {
    seconds = Math.max(0, Math.round(seconds || 0));
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h) return h + NBSP + 'h' + NBSP + String(m).padStart(2, '0');
    if (m) return m + NBSP + 'min' + NBSP + String(s).padStart(2, '0');
    return s + NBSP + 's';
  }

  function clock(seconds) {
    seconds = Math.max(0, Math.ceil(seconds || 0));
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  function dateLong(ts) {
    const d = new Date(ts);
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  function dateTime(ts) {
    const d = new Date(ts);
    return dateLong(ts) + ' à ' + String(d.getHours()).padStart(2, '0') + 'h' + String(d.getMinutes()).padStart(2, '0');
  }

  function timeAgo(ts) {
    const diff = (Date.now() - ts) / 1000;
    if (diff < 60) return "à l'instant";
    if (diff < 3600) return 'il y a ' + Math.floor(diff / 60) + ' min';
    if (diff < 86400) return 'il y a ' + Math.floor(diff / 3600) + ' h';
    if (diff < 2592000) return 'il y a ' + Math.floor(diff / 86400) + ' j';
    return dateLong(ts);
  }

  /* -------------------------------------------------------------- Divers -- */

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function debounce(fn, ms) {
    let t;
    return function () {
      const args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(() => fn.apply(self, args), ms || 150);
    };
  }

  /** Normalise pour la recherche : minuscules, sans accents. */
  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /** Slug d'identifiant. */
  function slug(s) {
    return norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  /** Clé de jour au format AAAA-MM-JJ (heure locale). */
  function dayKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /** Numéro de semaine ISO simplifié (suffisant pour les défis). */
  function weekKey(d) {
    d = new Date(d || Date.now());
    const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = (t.getDay() + 6) % 7;
    t.setDate(t.getDate() - day + 3);
    const firstThursday = new Date(t.getFullYear(), 0, 4);
    const fday = (firstThursday.getDay() + 6) % 7;
    firstThursday.setDate(firstThursday.getDate() - fday + 3);
    const week = 1 + Math.round((t - firstThursday) / (7 * 86400000));
    return t.getFullYear() + '-W' + String(week).padStart(2, '0');
  }

  function deepClone(o) {
    if (o === null || typeof o !== 'object') return o;
    try { return JSON.parse(JSON.stringify(o)); } catch (e) { return o; }
  }

  /** Groupe un tableau par clé. */
  function groupBy(arr, fn) {
    const out = {};
    for (const item of arr) {
      const k = fn(item);
      (out[k] = out[k] || []).push(item);
    }
    return out;
  }

  function sum(arr, fn) {
    let t = 0;
    for (const i of arr) t += fn ? fn(i) : i;
    return t;
  }

  function unique(arr) {
    return Array.from(new Set(arr));
  }

  /** Animation de confettis légère, sans dépendance. */
  function confetti(host, opts) {
    const o = opts || {};
    const colors = o.colors || ['#7c5cff', '#22d3ee', '#f472b6', '#facc15', '#34d399', '#fb7185'];
    const count = o.count || 46;
    const layer = el('div.confetti-layer', { 'aria-hidden': 'true' });
    for (let i = 0; i < count; i++) {
      const p = el('i.confetti');
      const size = 6 + Math.random() * 8;
      p.style.cssText = [
        'left:' + (Math.random() * 100) + '%',
        'width:' + size + 'px',
        'height:' + (size * (Math.random() < 0.4 ? 1.8 : 1)) + 'px',
        'background:' + colors[(Math.random() * colors.length) | 0],
        'border-radius:' + (Math.random() < 0.5 ? '50%' : '2px'),
        '--dx:' + (Math.random() * 160 - 80) + 'px',
        '--rot:' + (Math.random() * 900 - 450) + 'deg',
        'animation-delay:' + (Math.random() * 0.45).toFixed(2) + 's',
        'animation-duration:' + (1.5 + Math.random() * 1.4).toFixed(2) + 's',
      ].join(';');
      layer.appendChild(p);
    }
    host.appendChild(layer);
    setTimeout(() => layer.remove(), 3600);
  }

  QV.util = {
    $, $$, el, esc, delegate,
    makeRng, hashStr, shuffle, pick, randomInt,
    num, pct, duration, clock, dateLong, dateTime, timeAgo,
    clamp, debounce, norm, slug, dayKey, weekKey, deepClone, groupBy, sum, unique,
    confetti, NBSP,
  };
})(window);
