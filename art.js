/* ==========================================================================
   QuizVerse — illustrations vectorielles originales
   --------------------------------------------------------------------------
   Chaque univers reçoit une illustration thématique dédiée, dessinée en SVG
   à partir de formes simples et teintée avec la couleur de sa catégorie.

     • 100 % originales : aucune question de droits d'auteur ;
     • vectorielles : nettes du téléphone au grand écran 4K ;
     • 0 Ko de téléchargement : tout est calculé à l'affichage ;
     • aucune image externe, aucun réseau, fonctionne hors ligne.

   Chaque illustration est composée de :
     1. un fond dégradé dans la couleur de l'univers ;
     2. une texture géométrique discrète (motif déterministe par identifiant) ;
     3. une scène thématique (plan, ballon, manette, trophée…) ;
     4. une lueur et un halo pour la profondeur.
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});
  const U = QV.util;

  function rng(seed) {
    let a = (U.hashStr(String(seed)) >>> 0) || 7;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ================================================== TEXTURES DE FOND === */

  const TEXTURES = [
    function (r) {
      let s = '';
      for (let i = 0; i < 26; i++) {
        const x = r() * 160, y = r() * 90, rad = 0.5 + r() * 1.6;
        s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + rad.toFixed(1) + '"/>';
      }
      return { body: s, op: 0.5, sw: 0 };
    },
    function (r) {
      let s = '';
      for (let i = -7; i < 24; i++) {
        s += '<path d="M' + (i * 13) + ' 0 l13 13 M' + (i * 13) + ' 90 l13 -13"/>';
      }
      return { body: s, op: 0.22, sw: 1.1 };
    },
    function (r) {
      let s = '';
      for (let i = 1; i <= 7; i++) s += '<circle cx="80" cy="45" r="' + (i * 12) + '" fill="none"/>';
      return { body: s, op: 0.24, sw: 1.2 };
    },
    function (r) {
      let s = '';
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 11; col++) {
          const x = col * 15 + (row % 2 ? 7.5 : 0) + 4, y = row * 19 + 6, h = 5 + r() * 6;
          s += '<path d="M' + x.toFixed(1) + ' ' + (y + h).toFixed(1) + ' l' + (h * .9).toFixed(1) + ' -' + (h * 1.7).toFixed(1) + ' l' + (h * .9).toFixed(1) + ' ' + (h * 1.7).toFixed(1) + ' Z" fill="none"/>';
        }
      }
      return { body: s, op: 0.26, sw: 1 };
    },
    function (r) {
      let s = '';
      for (let i = 0; i < 7; i++) {
        let d = 'M0 ' + (10 + i * 12);
        for (let x = 0; x <= 160; x += 8) d += ' q4 ' + ((i % 2 ? -1 : 1) * (2 + r() * 3)).toFixed(1) + ' 8 0';
        s += '<path d="' + d + '" fill="none"/>';
      }
      return { body: s, op: 0.24, sw: 1.2 };
    },
    function (r) {
      let s = '';
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 10; col++) {
          const cx = col * 17 + (row % 2 ? 8.5 : 0) + 6, cy = row * 18 + 8, pts = [];
          for (let k = 0; k < 6; k++) pts.push((cx + 6.5 * Math.cos(k * Math.PI / 3)).toFixed(1) + ' ' + (cy + 6.5 * Math.sin(k * Math.PI / 3)).toFixed(1));
          s += '<polygon points="' + pts.join(' ') + '" fill="none"/>';
        }
      }
      return { body: s, op: 0.24, sw: 1 };
    },
    function (r) {
      let s = '';
      for (let y = 0; y < 9; y++) for (let x = 0; x < 16; x++) {
        if ((x + y) % 2) continue;
        const o = (r() * 3).toFixed(1);
        s += '<rect x="' + (x * 10 + o) + '" y="' + (y * 10 + o) + '" width="9" height="9" rx="1.6"/>';
      }
      return { body: s, op: 0.18, sw: 0 };
    },
    function (r) {
      let s = '';
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        s += '<path d="M80 45 L' + (80 + Math.cos(a) * 110).toFixed(1) + ' ' + (45 + Math.sin(a) * 64).toFixed(1) + '"/>';
      }
      return { body: s, op: 0.2, sw: 1 };
    },
    function (r) {
      let s = '';
      for (let y = 0; y < 7; y++) for (let x = 0; x < 14; x++) {
        const cx = x * 12 + 6, cy = y * 13 + 6, d = 3 + r() * 4;
        s += '<path d="M' + cx + ' ' + (cy - d) + ' L' + (cx + d) + ' ' + cy + ' L' + cx + ' ' + (cy + d) + ' L' + (cx - d) + ' ' + cy + ' Z"/>';
      }
      return { body: s, op: 0.2, sw: 0 };
    },
    function (r) {
      let s = '';
      for (let y = 0; y < 8; y++) for (let x = 0; x < 10; x++) {
        s += '<path d="M' + (x * 17 + y * 3) + ' ' + (y * 12 + 4) + ' l6 5 l-6 5" fill="none"/>';
      }
      return { body: s, op: 0.24, sw: 1.4 };
    },
  ];

  /* ============================================ SCÈNES THÉMATIQUES ====== */
  /* Chaque fonction reçoit la couleur et renvoie un fragment SVG en 160×90.
     Tout est centré, avec une lumière venant du haut à gauche.            */

  const S = {};

  S.space = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<circle cx="80" cy="45" r="26"/>'
      + '<circle cx="80" cy="45" r="26" fill="' + c + '" fill-opacity=".18" stroke="none"/>'
      + '<ellipse cx="80" cy="45" rx="42" ry="11" transform="rotate(-18 80 45)" stroke-opacity=".75"/>'
      + '<circle cx="126" cy="22" r="5" stroke-width="1.6"/>'
      + '<circle cx="30" cy="70" r="3.5" stroke-width="1.6"/>'
      + '<path d="M40 22 h10 M45 17 v10 M120 68 h9 M124.5 63.5 v9" stroke-width="1.6" stroke-opacity=".7"/>'
      + '</g>';
  };

  S.film = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<rect x="42" y="24" width="76" height="46" rx="6"/>'
      + '<path d="M42 34 h76"/>'
      + '<path d="M46 24 l6 10 M56 24 l6 10 M66 24 l6 10 M76 24 l6 10 M86 24 l6 10 M96 24 l6 10 M106 24 l6 10" stroke-width="1.8"/>'
      + '<path d="M68 46 l22 6 l-22 10 Z" fill="' + c + '" fill-opacity=".35" stroke-width="1.6"/>'
      + '<path d="M48 62 h20 M112 44 h4 M112 50 h4" stroke-width="1.6" stroke-opacity=".7"/>'
      + '</g>';
  };

  S.anime = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<circle cx="80" cy="45" r="24" stroke-opacity=".55"/>'
      + '<path d="M80 8 v10 M80 72 v10 M43 45 h10 M107 45 h10 M54 19 l7 7 M99 64 l7 7 M106 19 l-7 7 M61 64 l-7 7" stroke-width="1.8" stroke-opacity=".7"/>'
      + '<path d="M64 46 q16 -20 32 0 q-16 12 -32 0 Z" fill="' + c + '" fill-opacity=".35" stroke-width="1.8"/>'
      + '<circle cx="80" cy="43" r="6" fill="' + c + '" fill-opacity=".65" stroke="none"/>'
      + '<circle cx="80" cy="43" r="2.6" fill="#08080f" stroke="none"/>'
      + '</g>';
  };

  S.tv = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<rect x="46" y="26" width="68" height="44" rx="8"/>'
      + '<rect x="55" y="34" width="36" height="28" rx="3" fill="' + c + '" fill-opacity=".2" stroke-width="1.6"/>'
      + '<circle cx="103" cy="42" r="4" stroke-width="1.6"/>'
      + '<circle cx="103" cy="55" r="4" stroke-width="1.6"/>'
      + '<path d="M66 26 L58 14 M94 26 L102 14"/>'
      + '<path d="M74 70 v6 M86 70 v6 M64 76 h32" stroke-width="2"/>'
      + '</g>';
  };

  S.gamepad = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M52 44 q0 -18 28 -18 q28 0 28 18 q0 20 -12 20 q-8 0 -16 -12 q-8 12 -16 12 q-12 0 -12 -20 Z" fill="' + c + '" fill-opacity=".14"/>'
      + '<path d="M62 38 v12 M56 44 h12" stroke-width="2.4"/>'
      + '<circle cx="100" cy="40" r="3" fill="' + c + '" fill-opacity=".7" stroke="none"/>'
      + '<circle cx="107" cy="47" r="3" fill="' + c + '" fill-opacity=".7" stroke="none"/>'
      + '<path d="M74 46 h14" stroke-width="2.2"/>'
      + '</g>';
  };

  S.cartridge = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M54 26 h52 v30 q0 8 -8 8 h-36 q-8 0 -8 -8 Z" fill="' + c + '" fill-opacity=".14"/>'
      + '<rect x="66" y="20" width="28" height="10" rx="2" stroke-width="1.8"/>'
      + '<rect x="64" y="34" width="32" height="16" rx="2" stroke-width="1.6" stroke-opacity=".7"/>'
      + '<path d="M50 26 h8 M102 26 h8" stroke-width="2"/>'
      + '<circle cx="74" cy="78" r="3" fill="' + c + '" fill-opacity=".6" stroke="none"/>'
      + '<circle cx="86" cy="78" r="3" fill="' + c + '" fill-opacity=".6" stroke="none"/>'
      + '</g>';
  };

  S.ball = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<circle cx="80" cy="45" r="26" fill="' + c + '" fill-opacity=".14"/>'
      + '<path d="M80 27 l12 9 l-5 15 h-14 l-5 -15 Z" fill="' + c + '" fill-opacity=".5" stroke-width="1.6"/>'
      + '<path d="M92 36 l13 -4 M92 54 l13 4 M80 66 v11 M68 51 l-13 4 M68 39 l-13 -4" stroke-width="1.8"/>'
      + '<path d="M62 30 q10 8 8 16 M98 30 q-10 8 -8 16 M62 60 q10 -8 8 -16 M98 60 q-10 -8 -8 -16" stroke-width="1.4" stroke-opacity=".6"/>'
      + '</g>';
  };

  S.trophy = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M62 22 h36 v16 q0 18 -18 18 q-18 0 -18 -18 Z" fill="' + c + '" fill-opacity=".2"/>'
      + '<path d="M62 28 h-10 q0 14 12 14 M98 28 h10 q0 14 -12 14" stroke-width="1.8"/>'
      + '<path d="M80 56 v10 M70 74 h20 l-2 -8 h-16 Z" fill="' + c + '" fill-opacity=".2" stroke-width="1.8"/>'
      + '<path d="M80 22 v-6" stroke-width="1.8"/>'
      + '</g>';
  };

  S.car = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M36 54 q2 -12 14 -14 l10 -12 q3 -4 9 -4 h22 q6 0 9 4 l10 12 q12 2 14 14 v4 h-88 Z" fill="' + c + '" fill-opacity=".16"/>'
      + '<path d="M64 30 h32 l8 10 h-48 Z" stroke-width="1.8" stroke-opacity=".8"/>'
      + '<path d="M28 58 h104" stroke-width="1.8"/>'
      + '<circle cx="52" cy="62" r="10" fill="#08080f"/>'
      + '<circle cx="52" cy="62" r="4" fill="' + c + '" fill-opacity=".6" stroke="none"/>'
      + '<circle cx="108" cy="62" r="10" fill="#08080f"/>'
      + '<circle cx="108" cy="62" r="4" fill="' + c + '" fill-opacity=".6" stroke="none"/>'
      + '<path d="M104 40 h14 v6" stroke-width="1.6" stroke-opacity=".7"/>'
      + '</g>';
  };

  S.motorbike = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<circle cx="52" cy="60" r="12"/>'
      + '<circle cx="110" cy="60" r="12"/>'
      + '<path d="M52 60 l22 -18 h20 l16 18 M74 42 l-6 -12 h-12 M96 42 h-8" />'
      + '<path d="M40 48 h-12 M118 44 l14 -6" stroke-width="1.8"/>'
      + '<path d="M66 52 h28" stroke-width="2"/>'
      + '</g>';
  };

  S.basket = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<circle cx="80" cy="45" r="26" fill="' + c + '" fill-opacity=".14"/>'
      + '<path d="M80 19 v52 M54 45 h52 M61 29 q19 16 38 0 M61 61 q19 -16 38 0" stroke-width="1.8"/>'
      + '<path d="M80 19 a26 26 0 0 1 22 12" stroke-width="2.4"/>'
      + '</g>';
  };

  S.glove = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M58 62 q-8 -22 6 -30 q10 -6 18 4 q4 5 8 2 l16 -8 q10 -4 12 6 q2 8 -6 12 l-14 8 q-8 5 -6 14 Z" fill="' + c + '" fill-opacity=".18"/>'
      + '<path d="M62 44 q6 -4 12 2 M70 38 q6 -3 11 3 M80 36 q6 -2 10 5" stroke-width="1.8"/>'
      + '<path d="M56 62 h44 l-6 12 h-32 Z" fill="' + c + '" fill-opacity=".24" stroke-width="1.8"/>'
      + '</g>';
  };

  S.medal = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M64 18 l16 26 l16 -26 M64 18 l16 26 M96 18 l-16 26" stroke-opacity=".85"/>'
      + '<circle cx="80" cy="58" r="20" fill="' + c + '" fill-opacity=".18"/>'
      + '<circle cx="80" cy="58" r="13" stroke-width="1.6" stroke-opacity=".7"/>'
      + '<path d="M80 48 l3.4 7 l7.6 1 l-5.5 5.4 l1.3 7.6 l-6.8 -3.6 l-6.8 3.6 l1.3 -7.6 l-5.5 -5.4 l7.6 -1 Z" fill="' + c + '" fill-opacity=".55" stroke-width="1.4"/>'
      + '</g>';
  };

  S.rings = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2.6" stroke-opacity=".9">'
      + '<circle cx="54" cy="36" r="13"/><circle cx="80" cy="36" r="13"/><circle cx="106" cy="36" r="13"/>'
      + '<circle cx="67" cy="58" r="13"/><circle cx="93" cy="58" r="13"/>'
      + '</g>'
      + '<path d="M40 76 h80" stroke="' + c + '" stroke-width="2" stroke-opacity=".45"/>';
  };

  S.globe = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<circle cx="80" cy="45" r="27" fill="' + c + '" fill-opacity=".12"/>'
      + '<ellipse cx="80" cy="45" rx="11" ry="27" stroke-width="1.6" stroke-opacity=".8"/>'
      + '<path d="M55 34 h50 M55 56 h50" stroke-width="1.6" stroke-opacity=".8"/>'
      + '<path d="M53 45 h54" stroke-width="1.4" stroke-opacity=".5"/>'
      + '<circle cx="96" cy="34" r="3.5" fill="' + c + '" fill-opacity=".8" stroke="none"/>'
      + '<circle cx="66" cy="58" r="3" fill="' + c + '" fill-opacity=".6" stroke="none"/>'
      + '</g>';
  };

  S.flag = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M50 16 v62" stroke-width="2.6"/>'
      + '<path d="M50 20 h58 q-8 10 0 20 q-8 10 0 20 h-58 Z" fill="' + c + '" fill-opacity=".22"/>'
      + '<path d="M50 20 v40" stroke-width="2.6"/>'
      + '<path d="M74 30 v20 M92 30 v20" stroke-width="1.8" stroke-opacity=".7"/>'
      + '<path d="M36 78 h28" stroke-width="2.4"/>'
      + '</g>';
  };

  S.atom = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<circle cx="80" cy="45" r="6" fill="' + c + '" fill-opacity=".6"/>'
      + '<ellipse cx="80" cy="45" rx="34" ry="13"/>'
      + '<ellipse cx="80" cy="45" rx="34" ry="13" transform="rotate(60 80 45)"/>'
      + '<ellipse cx="80" cy="45" rx="34" ry="13" transform="rotate(-60 80 45)"/>'
      + '<circle cx="114" cy="45" r="3" fill="' + c + '" fill-opacity=".8" stroke="none"/>'
      + '</g>';
  };

  S.chip = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<rect x="54" y="24" width="52" height="42" rx="6" fill="' + c + '" fill-opacity=".14"/>'
      + '<rect x="68" y="34" width="24" height="22" rx="3" stroke-width="1.8"/>'
      + '<path d="M62 24 v-8 M76 24 v-8 M90 24 v-8 M104 24 v-8 M62 66 v8 M76 66 v8 M90 66 v8 M104 66 v8" stroke-width="1.8"/>'
      + '<path d="M54 34 h-8 M54 45 h-8 M54 56 h-8 M106 34 h8 M106 45 h8 M106 56 h8" stroke-width="1.8"/>'
      + '</g>';
  };

  S.vinyl = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<circle cx="72" cy="45" r="26" fill="' + c + '" fill-opacity=".14"/>'
      + '<circle cx="72" cy="45" r="18" stroke-width="1.4" stroke-opacity=".7"/>'
      + '<circle cx="72" cy="45" r="9" stroke-width="1.4" stroke-opacity=".7"/>'
      + '<circle cx="72" cy="45" r="3" fill="' + c + '" fill-opacity=".8" stroke="none"/>'
      + '<path d="M94 34 l18 -14 l6 6 l-18 14 Z" fill="' + c + '" fill-opacity=".2" stroke-width="1.6"/>'
      + '<circle cx="116" cy="24" r="4" fill="' + c + '" fill-opacity=".5" stroke="none"/>'
      + '</g>';
  };

  S.book = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M80 32 q-14 -10 -30 -6 v40 q16 -4 30 6 Z" fill="' + c + '" fill-opacity=".16"/>'
      + '<path d="M80 32 q14 -10 30 -6 v40 q-16 -4 -30 6 Z" fill="' + c + '" fill-opacity=".16"/>'
      + '<path d="M80 32 v40"/>'
      + '<path d="M60 38 h12 M60 46 h12 M88 38 h12 M88 46 h12" stroke-width="1.5" stroke-opacity=".7"/>'
      + '</g>';
  };

  S.pen = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M50 70 L96 26 l10 10 L60 80 Z" fill="' + c + '" fill-opacity=".18"/>'
      + '<path d="M50 70 l-4 14 l14 -4" stroke-width="1.8"/>'
      + '<path d="M88 34 l10 10" stroke-width="1.6" stroke-opacity=".7"/>'
      + '<path d="M96 26 l4 -4 q4 -4 8 0 q4 4 0 8 l-4 4" stroke-width="1.8"/>'
      + '<path d="M46 40 h16 M46 48 h10" stroke-width="1.6" stroke-opacity=".5"/>'
      + '</g>';
  };

  S.brain = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M80 22 q-20 -2 -26 14 q-14 4 -10 18 q-8 10 4 18 q10 8 26 4" fill="' + c + '" fill-opacity=".14"/>'
      + '<path d="M80 22 q20 -2 26 14 q14 4 10 18 q8 10 -4 18 q-10 8 -26 4" fill="' + c + '" fill-opacity=".14"/>'
      + '<path d="M80 22 v54" stroke-width="1.8"/>'
      + '<path d="M66 36 q8 4 6 12 M94 36 q-8 4 -6 12 M64 54 q8 -4 8 -12 M96 54 q-8 -4 -8 -12" stroke-width="1.5" stroke-opacity=".65"/>'
      + '</g>';
  };

  S.chess = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M68 74 h24 l-3 -8 h-18 Z" fill="' + c + '" fill-opacity=".2"/>'
      + '<path d="M70 66 q-4 -10 2 -16 q-6 -8 4 -14 q4 -8 10 -2 q10 -4 12 6 q8 6 2 12 q4 8 -2 14" stroke-width="2"/>'
      + '<circle cx="80" cy="32" r="3" fill="' + c + '" fill-opacity=".7" stroke="none"/>'
      + '<path d="M72 74 h16" stroke-width="2.4"/>'
      + '<path d="M60 78 h40" stroke-width="2.4"/>'
      + '</g>';
  };

  S.cards = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<rect x="44" y="26" width="26" height="38" rx="4" transform="rotate(-14 57 45)" fill="' + c + '" fill-opacity=".14"/>'
      + '<rect x="66" y="22" width="28" height="42" rx="4" fill="' + c + '" fill-opacity=".2"/>'
      + '<path d="M80 32 l3 7 l7 1 l-5 5 l1 7 l-6 -4 l-6 4 l1 -7 l-5 -5 l7 -1 Z" fill="' + c + '" fill-opacity=".5" stroke-width="1.4"/>'
      + '<rect x="90" y="26" width="26" height="38" rx="4" transform="rotate(14 103 45)" fill="' + c + '" fill-opacity=".14"/>'
      + '</g>';
  };

  S.dice = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<rect x="42" y="30" width="34" height="34" rx="7" fill="' + c + '" fill-opacity=".16" transform="rotate(-8 59 47)"/>'
      + '<rect x="82" y="30" width="34" height="34" rx="7" fill="' + c + '" fill-opacity=".2" transform="rotate(9 99 47)"/>'
      + '<circle cx="55" cy="40" r="2.6" fill="' + c + '" fill-opacity=".8" stroke="none"/>'
      + '<circle cx="55" cy="54" r="2.6" fill="' + c + '" fill-opacity=".8" stroke="none"/>'
      + '<circle cx="92" cy="40" r="2.6" fill="' + c + '" fill-opacity=".8" stroke="none"/>'
      + '<circle cx="106" cy="40" r="2.6" fill="' + c + '" fill-opacity=".8" stroke="none"/>'
      + '<circle cx="99" cy="47" r="2.6" fill="' + c + '" fill-opacity=".8" stroke="none"/>'
      + '<circle cx="92" cy="54" r="2.6" fill="' + c + '" fill-opacity=".8" stroke="none"/>'
      + '<circle cx="106" cy="54" r="2.6" fill="' + c + '" fill-opacity=".8" stroke="none"/>'
      + '</g>';
  };

  S.chef = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M58 44 q-14 -4 -12 -16 q2 -12 16 -12 q2 -8 12 -8 q8 0 12 6 q6 -8 14 -4 q10 4 8 16 q10 4 8 14 q-2 8 -12 8 Z" fill="' + c + '" fill-opacity=".2"/>'
      + '<path d="M58 44 h44 v20 q0 6 -6 6 h-32 q-6 0 -6 -6 Z" fill="' + c + '" fill-opacity=".12"/>'
      + '<path d="M70 58 h20" stroke-width="1.6" stroke-opacity=".6"/>'
      + '</g>';
  };

  S.pizza = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M80 22 L44 70 h72 Z" fill="' + c + '" fill-opacity=".16"/>'
      + '<path d="M80 22 L62 70 M80 22 L98 70 M44 58 h72" stroke-width="1.6" stroke-opacity=".6"/>'
      + '<circle cx="80" cy="34" r="3.4" fill="' + c + '" fill-opacity=".7" stroke="none"/>'
      + '<circle cx="60" cy="52" r="3.4" fill="' + c + '" fill-opacity=".7" stroke="none"/>'
      + '<circle cx="100" cy="52" r="3.4" fill="' + c + '" fill-opacity=".7" stroke="none"/>'
      + '<circle cx="80" cy="64" r="3.4" fill="' + c + '" fill-opacity=".7" stroke="none"/>'
      + '</g>';
  };

  S.rocket = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M80 14 q16 14 16 34 v16 h-32 v-16 q0 -20 16 -34 Z" fill="' + c + '" fill-opacity=".18"/>'
      + '<circle cx="80" cy="40" r="7" stroke-width="1.8"/>'
      + '<path d="M64 52 l-10 12 v12 l10 -8 Z M96 52 l10 12 v12 l-10 -8 Z" fill="' + c + '" fill-opacity=".16" stroke-width="1.8"/>'
      + '<path d="M74 68 q6 12 12 0" fill="' + c + '" fill-opacity=".35" stroke-width="1.6"/>'
      + '<path d="M80 76 q5 8 0 10 q-5 -2 0 -10" fill="' + c + '" fill-opacity=".5" stroke="none"/>'
      + '</g>';
  };

  S.diamond = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M56 26 h48 l14 18 l-38 32 l-38 -32 Z" fill="' + c + '" fill-opacity=".18"/>'
      + '<path d="M56 26 l24 50 l24 -50 M42 44 h76 M56 26 l-8 18 h64 l-8 -18" stroke-width="1.6" stroke-opacity=".7"/>'
      + '<path d="M80 76 L104 44" stroke-width="1.4" stroke-opacity=".45"/>'
      + '</g>';
  };

  S.robot = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<rect x="52" y="30" width="56" height="38" rx="10" fill="' + c + '" fill-opacity=".14"/>'
      + '<circle cx="70" cy="46" r="5" fill="' + c + '" fill-opacity=".7" stroke="none"/>'
      + '<circle cx="90" cy="46" r="5" fill="' + c + '" fill-opacity=".7" stroke="none"/>'
      + '<path d="M68 58 q12 8 24 0" stroke-width="1.8"/>'
      + '<path d="M80 30 v-10 M74 20 h12" stroke-width="1.8"/>'
      + '<path d="M52 44 h-8 M108 44 h8" stroke-width="1.8"/>'
      + '<path d="M62 68 v6 M98 68 v6" stroke-width="1.8" stroke-opacity=".7"/>'
      + '</g>';
  };

  S.sword = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M112 18 L58 72 l-8 4 l4 -8 L108 14 Z" fill="' + c + '" fill-opacity=".16"/>'
      + '<path d="M62 66 l14 14" stroke-width="2"/>'
      + '<path d="M56 68 l-14 14 M50 62 l-14 14" stroke-width="2.4"/>'
      + '<path d="M44 76 l14 14" stroke-width="2.4"/>'
      + '<circle cx="58" cy="70" r="3" fill="' + c + '" fill-opacity=".7" stroke="none"/>'
      + '</g>';
  };

  S.clock = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<circle cx="80" cy="48" r="26" fill="' + c + '" fill-opacity=".12"/>'
      + '<circle cx="80" cy="48" r="26" stroke-width="2.4"/>'
      + '<path d="M80 32 v16 h14" stroke-width="2.4"/>'
      + '<path d="M80 12 v6 M80 78 v6 M44 48 h6 M110 48 h6" stroke-width="2" stroke-opacity=".7"/>'
      + '</g>';
  };

  S.map = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M40 24 l26 -8 l28 8 l26 -8 v52 l-26 8 l-28 -8 l-26 8 Z" fill="' + c + '" fill-opacity=".14"/>'
      + '<path d="M66 16 v52 M94 24 v52" stroke-width="1.6" stroke-opacity=".6"/>'
      + '<path d="M94 40 a9 9 0 1 1 0 .1 Z" fill="' + c + '" fill-opacity=".5" stroke-width="1.6"/>'
      + '<path d="M88 54 l-6 12 h12 Z" fill="' + c + '" fill-opacity=".5" stroke="none"/>'
      + '</g>';
  };

  S.palette = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M80 22 q-32 0 -32 24 q0 14 14 18 q6 2 6 -4 q0 -6 8 -6 q14 0 18 -8 q4 -8 -2 -16 q-4 -8 -12 -8 Z" fill="' + c + '" fill-opacity=".16"/>'
      + '<circle cx="66" cy="40" r="4" fill="' + c + '" fill-opacity=".7" stroke="none"/>'
      + '<circle cx="82" cy="36" r="4" fill="' + c + '" fill-opacity=".7" stroke="none"/>'
      + '<circle cx="96" cy="42" r="4" fill="' + c + '" fill-opacity=".7" stroke="none"/>'
      + '<circle cx="62" cy="56" r="4" fill="' + c + '" fill-opacity=".7" stroke="none"/>'
      + '</g>';
  };

  S.math = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<rect x="40" y="24" width="80" height="42" rx="6" fill="' + c + '" fill-opacity=".12"/>'
      + '<path d="M62 34 h12 M68 34 v14 M82 46 h12 M64 48 l16 -14" stroke-width="2.2"/>'
      + '<circle cx="102" cy="36" r="2.6" fill="' + c + '" fill-opacity=".8" stroke="none"/>'
      + '<circle cx="102" cy="50" r="2.6" fill="' + c + '" fill-opacity=".8" stroke="none"/>'
      + '<path d="M56 74 h48" stroke-width="2.4"/>'
      + '</g>';
  };

  S.crown = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M46 62 L38 30 l20 14 l22 -22 l22 22 l20 -14 l-8 32 Z" fill="' + c + '" fill-opacity=".2"/>'
      + '<path d="M46 62 h68" stroke-width="2.4"/>'
      + '<circle cx="58" cy="54" r="3" fill="' + c + '" fill-opacity=".8" stroke="none"/>'
      + '<circle cx="80" cy="54" r="3.4" fill="' + c + '" fill-opacity=".8" stroke="none"/>'
      + '<circle cx="102" cy="54" r="3" fill="' + c + '" fill-opacity=".8" stroke="none"/>'
      + '</g>';
  };

  S.paw = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M80 74 q-22 -8 -22 -22 q0 -12 22 -12 q22 0 22 12 q0 14 -22 22 Z" fill="' + c + '" fill-opacity=".2"/>'
      + '<ellipse cx="56" cy="38" rx="7" ry="9" fill="' + c + '" fill-opacity=".45"/>'
      + '<ellipse cx="72" cy="30" rx="7" ry="9" fill="' + c + '" fill-opacity=".45"/>'
      + '<ellipse cx="88" cy="30" rx="7" ry="9" fill="' + c + '" fill-opacity=".45"/>'
      + '<ellipse cx="104" cy="38" rx="7" ry="9" fill="' + c + '" fill-opacity=".45"/>'
      + '</g>';
  };

  S.puzzle = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<path d="M44 34 h16 a5 5 0 1 1 10 0 h16 a5 5 0 1 1 10 0 h16 v16 a5 5 0 1 0 0 10 v16 h-16 a5 5 0 1 0 -10 0 h-16 a5 5 0 1 0 -10 0 h-16 v-16 a5 5 0 1 1 0 -10 Z" fill="' + c + '" fill-opacity=".16"/>'
      + '</g>';
  };

  /* ========================================== CATALOGUE DES ILLUSTRATIONS */
  /* sous-catégorie -> scène. Une scène pour plusieurs univers proches.  */

  const SCENES = {
    // Animés & Mangas
    dragonball: 'anime', naruto: 'anime', onepiece: 'anime', bleach: 'anime',
    jujutsu: 'anime', demonslayer: 'anime', mha: 'anime', hxh: 'anime',
    aot: 'anime', pokemon: 'paw', deathnote: 'book', sololeveling: 'diamond',
    opm: 'crown', chainsaw: 'sword', jojo: 'crown',

    // Films & Séries
    hp: 'book', marvel: 'diamond', dc: 'shield', starwars: 'rocket', disney: 'crown',
    pixar: 'puzzle', netflix: 'tv', seriesfr: 'tv', seriesus: 'tv',
    cultes: 'film', animation: 'anime', scifi: 'rocket', horreur: 'ghost', action: 'sword', comedie: 'palette',

    // Sports
    football: 'ball', ucl: 'trophy', worldcup: 'trophy', liga: 'ball',
    premierleague: 'ball', nba: 'basket', basketball: 'basket', f1: 'car',
    motogp: 'motorbike', tennis: 'ball', ufc: 'glove', boxe: 'glove', olympics: 'rings',

    // Jeux Vidéo
    minecraft: 'cube', fortnite: 'shield', gta: 'car', cod: 'crosshair',
    eafc: 'ball', roblox: 'cube', nintendo: 'gamepad', pokemongames: 'paw',
    playstation: 'gamepad', xbox: 'gamepad', pcgaming: 'chip', retro: 'chip',
    indie: 'puzzle', competitive: 'trophy',

    // Culture Générale
    histoire: 'column', geographie: 'globe', capitales: 'map', drapeaux: 'flag',
    sciences: 'atom', technologie: 'robot', musique: 'vinyl', cinema: 'film',
    litterature: 'book', france: 'column', monde: 'globe', internet: 'globe',
    espace: 'rocket', nature: 'leaf', inventions: 'chip',

    // Jeunesse
    miraculous: 'diamond', peppa: 'paw', arthur: 'book', disneychannel: 'star',
    titeuf: 'palette', cartoons: 'star',

    // Maths
    calcul: 'math', geometrie: 'cube', probabilites: 'dice', casse: 'puzzle',
    suites: 'math', mathsculture: 'math',

    // Jeux de société
    monopoly: 'dice', uno: 'cards', scrabble: 'letters', echecs: 'chess',
    cartes: 'cards', anciens: 'chess', moderne: 'dice',

    // Cuisine
    cuisinefr: 'chef', cuisineit: 'pizza', cuisinejp: 'bowl', cuisineus: 'burger',
    cuisineworld: 'chef', techniques: 'knife',

    // Français
    grammaire: 'pen', orthographe: 'letters', classique: 'book', etymologie: 'book',
    expressions: 'quote', langues: 'globe',
  };

  /* Scènes complémentaires définies à la volée (alias d'existing + nouvelles) */
  const EXTRA = {
    shield: function (c) {
      return '<g fill="none" stroke="' + c + '" stroke-width="2">'
        + '<path d="M80 16 l26 10 v22 q0 24 -26 32 q-26 -8 -26 -32 v-22 Z" fill="' + c + '" fill-opacity=".2"/>'
        + '<path d="M80 16 v64" stroke-width="1.6" stroke-opacity=".6"/>'
        + '<path d="M68 46 l9 9 l17 -19" stroke-width="2.6"/>'
        + '</g>';
    },
    ghost: function (c) {
      return '<g fill="none" stroke="' + c + '" stroke-width="2">'
        + '<path d="M80 18 q-26 0 -26 24 v32 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6 v-32 q0 -24 -26 -24 Z" fill="' + c + '" fill-opacity=".16"/>'
        + '<circle cx="70" cy="44" r="4.5" fill="' + c + '" fill-opacity=".7" stroke="none"/>'
        + '<circle cx="90" cy="44" r="4.5" fill="' + c + '" fill-opacity=".7" stroke="none"/>'
        + '<path d="M72 58 q8 6 16 0" stroke-width="2"/>'
        + '</g>';
    },
    cube: function (c) {
      return '<g fill="none" stroke="' + c + '" stroke-width="2">'
        + '<path d="M80 16 l28 14 v32 l-28 14 l-28 -14 v-32 Z" fill="' + c + '" fill-opacity=".14"/>'
        + '<path d="M52 30 l28 14 l28 -14 M80 44 v32" stroke-width="1.6" stroke-opacity=".7"/>'
        + '<path d="M66 39 h28 M66 47 h28 M66 55 h28" stroke-width="1.4" stroke-opacity=".5"/>'
        + '</g>';
    },
    crosshair: function (c) {
      return '<g fill="none" stroke="' + c + '" stroke-width="2">'
        + '<circle cx="80" cy="45" r="22" stroke-width="2"/>'
        + '<circle cx="80" cy="45" r="6" stroke-width="2"/>'
        + '<path d="M80 12 v14 M80 64 v14 M47 45 h14 M99 45 h14" stroke-width="2.4"/>'
        + '<path d="M58 23 l-6 -6 M102 23 l6 -6 M58 67 l-6 6 M102 67 l6 6" stroke-width="1.6" stroke-opacity=".6"/>'
        + '</g>';
    },
    column: function (c) {
      return '<g fill="none" stroke="' + c + '" stroke-width="2">'
        + '<path d="M50 24 h60 M54 24 v8 M66 24 v8 M80 24 v8 M94 24 v8 M106 24 v8" stroke-width="1.8"/>'
        + '<path d="M50 34 h60 M46 40 h68 v30 h-68 Z" fill="' + c + '" fill-opacity=".14" stroke-width="1.8"/>'
        + '<path d="M60 40 v30 M74 40 v30 M88 40 v30 M102 40 v30" stroke-width="1.4" stroke-opacity=".55"/>'
        + '<path d="M46 70 h68 M50 74 h60" stroke-width="2"/>'
        + '</g>';
    },
    leaf: function (c) {
      return '<g fill="none" stroke="' + c + '" stroke-width="2">'
        + '<path d="M110 22 q-42 0 -56 30 q-10 22 8 30 q22 10 36 -8 q16 -20 12 -52 Z" fill="' + c + '" fill-opacity=".18"/>'
        + '<path d="M52 74 q22 -26 58 -50" stroke-width="1.8"/>'
        + '<path d="M68 62 q-6 -10 -2 -18 M82 50 q-4 -12 2 -20 M60 70 q8 -4 12 -12" stroke-width="1.5" stroke-opacity=".7"/>'
        + '</g>';
    },
    star: function (c) {
      return '<g fill="none" stroke="' + c + '" stroke-width="2">'
        + '<path d="M80 16 l12 26 l28 4 l-20 20 l5 28 l-25 -14 l-25 14 l5 -28 l-20 -20 l28 -4 Z" fill="' + c + '" fill-opacity=".2"/>'
        + '<circle cx="36" cy="24" r="2.6" fill="' + c + '" fill-opacity=".7" stroke="none"/>'
        + '<circle cx="126" cy="30" r="2.2" fill="' + c + '" fill-opacity=".6" stroke="none"/>'
        + '<circle cx="124" cy="68" r="2.6" fill="' + c + '" fill-opacity=".7" stroke="none"/>'
        + '</g>';
    },
    letters: function (c) {
      return '<g fill="none" stroke="' + c + '" stroke-width="2">'
        + '<rect x="44" y="26" width="20" height="20" rx="4" fill="' + c + '" fill-opacity=".35"/>'
        + '<rect x="70" y="26" width="20" height="20" rx="4" fill="' + c + '" fill-opacity=".2"/>'
        + '<rect x="96" y="26" width="20" height="20" rx="4" fill="' + c + '" fill-opacity=".35"/>'
        + '<rect x="44" y="52" width="20" height="20" rx="4" fill="' + c + '" fill-opacity=".2"/>'
        + '<rect x="70" y="52" width="20" height="20" rx="4" fill="' + c + '" fill-opacity=".35"/>'
        + '<rect x="96" y="52" width="20" height="20" rx="4" fill="' + c + '" fill-opacity=".2"/>'
        + '</g>';
    },
    quote: function (c) {
      return '<g fill="none" stroke="' + c + '" stroke-width="2">'
        + '<path d="M44 30 h72 q6 0 6 6 v30 q0 6 -6 6 h-40 l-14 12 v-12 h-18 q-6 0 -6 -6 v-30 q0 -6 6 -6 Z" fill="' + c + '" fill-opacity=".14"/>'
        + '<path d="M62 46 q-6 0 -6 6 v6 h12 v-12 M96 46 q-6 0 -6 6 v6 h12 v-12" stroke-width="2"/>'
        + '</g>';
    },
    bowl: function (c) {
      return '<g fill="none" stroke="' + c + '" stroke-width="2">'
        + '<path d="M36 48 h88 q0 22 -24 26 h-40 q-24 -4 -24 -26 Z" fill="' + c + '" fill-opacity=".16"/>'
        + '<path d="M56 42 q10 -12 24 -2 M78 38 q12 -8 20 4" stroke-width="1.8" stroke-opacity=".7"/>'
        + '<path d="M30 74 h100" stroke-width="2.4"/>'
        + '<path d="M60 30 v-8 M80 28 v-8 M100 30 v-8" stroke-width="1.8" stroke-opacity=".6"/>'
        + '</g>';
    },
    burger: function (c) {
      return '<g fill="none" stroke="' + c + '" stroke-width="2">'
        + '<path d="M44 40 q0 -18 36 -18 q36 0 36 18 Z" fill="' + c + '" fill-opacity=".2"/>'
        + '<path d="M44 48 h72 M44 58 h72" stroke-width="2.4"/>'
        + '<path d="M46 66 h68 q-4 12 -14 12 h-40 q-10 0 -14 -12 Z" fill="' + c + '" fill-opacity=".16"/>'
        + '<circle cx="62" cy="28" r="1.8" fill="' + c + '" fill-opacity=".8" stroke="none"/>'
        + '<circle cx="84" cy="24" r="1.8" fill="' + c + '" fill-opacity=".8" stroke="none"/>'
        + '<circle cx="100" cy="30" r="1.8" fill="' + c + '" fill-opacity=".8" stroke="none"/>'
        + '</g>';
    },
    knife: function (c) {
      return '<g fill="none" stroke="' + c + '" stroke-width="2">'
        + '<path d="M40 62 l52 -46 q8 6 4 14 l-42 38 Z" fill="' + c + '" fill-opacity=".18"/>'
        + '<path d="M40 62 l-6 14 h14 Z" fill="' + c + '" fill-opacity=".3"/>'
        + '<path d="M66 40 l12 10" stroke-width="1.6" stroke-opacity=".6"/>'
        + '<path d="M30 78 h40" stroke-width="2.4"/>'
        + '<circle cx="120" cy="34" r="3" fill="' + c + '" fill-opacity=".6" stroke="none"/>'
        + '</g>';
    },
  };
  Object.keys(EXTRA).forEach(function (k) { S[k] = EXTRA[k]; });

  const FALLBACK = 'spark';

  S.spark = function (c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="2">'
      + '<circle cx="80" cy="45" r="20" fill="' + c + '" fill-opacity=".16"/>'
      + '<circle cx="80" cy="45" r="9" fill="' + c + '" fill-opacity=".3"/>'
      + '<path d="M80 14 v12 M80 64 v12 M49 45 h12 M99 45 h12 M58 23 l8 8 M94 59 l8 8 M102 23 l-8 8 M66 59 l-8 8" stroke-width="2" stroke-opacity=".8"/>'
      + '</g>';
  };

  /* ==================================================== RENDU COMPLET === */

  /**
   * Illustration SVG.
   * @param {object} o { id, color, scene, className, density }
   */
  function svg(o) {
    const id = 'q' + U.hashStr(String(o.id)).toString(36);
    const c = o.color || '#7c5cff';
    const scene = S[o.scene] ? o.scene : FALLBACK;
    const r = rng(o.id + '|tex');
    const t = TEXTURES[(U.hashStr(String(o.id)) + 7) % TEXTURES.length](r);

    return '<svg class="qv-art ' + (o.className || '') + '" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" '
      + 'xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" role="presentation">'
      + '<defs>'
      + '<linearGradient id="bg' + id + '" x1="0" y1="0" x2="1" y2="1">'
      + '<stop offset="0%" stop-color="' + c + '" stop-opacity=".34"/>'
      + '<stop offset="52%" stop-color="' + c + '" stop-opacity=".10"/>'
      + '<stop offset="100%" stop-color="#08080f" stop-opacity="0"/></linearGradient>'
      + '<radialGradient id="spot' + id + '" cx="28%" cy="10%" r="86%">'
      + '<stop offset="0%" stop-color="#ffffff" stop-opacity=".20"/>'
      + '<stop offset="70%" stop-color="#ffffff" stop-opacity="0"/></radialGradient>'
      + '<linearGradient id="base' + id + '" x1="0" y1="0" x2="0" y2="1">'
      + '<stop offset="0%" stop-color="#0b0b16" stop-opacity=".25"/>'
      + '<stop offset="100%" stop-color="#08080f" stop-opacity=".95"/></linearGradient>'
      + '</defs>'
      + '<rect width="160" height="90" fill="#07070f"/>'
      + '<rect width="160" height="90" fill="url(#bg' + id + ')"/>'
      + '<g fill="' + c + '" stroke="' + c + '" opacity="' + t.op + '" stroke-width="' + (t.sw || 0) + '">' + t.body + '</g>'
      + '<g transform="translate(0,2)">' + S[scene](c) + '</g>'
      + '<rect width="160" height="90" fill="url(#spot' + id + ')"/>'
      + '<rect width="160" height="90" fill="url(#base' + id + ')"/>'
      + '</svg>';
  }

  /** Scène d'un univers (cat/sub). */
  function sceneFor(sub) {
    return SCENES[sub] || FALLBACK;
  }

  /** Illustration d'une catégorie : scène = scène dominante de ses univers. */
  function categoryScene(cat) {
    const subs = cat.subs || [];
    const counts = {};
    subs.forEach(function (s) {
      const sc = SCENES[s.id] || FALLBACK;
      counts[sc] = (counts[sc] || 0) + (s.count || 1);
    });
    let best = FALLBACK, n = -1;
    Object.keys(counts).forEach(function (k) { if (counts[k] > n) { n = counts[k]; best = k; } });
    return best;
  }

  /** Illustration de catégorie. */
  function catArt(cat, opts) {
    const o = opts || {};
    return svg({
      id: 'cat-' + cat.id,
      color: cat.color,
      scene: categoryScene(cat),
      className: 'cat-art' + (o.className ? ' ' + o.className : ''),
    });
  }

  /** Illustration d'univers. */
  function subArt(cat, sub, opts) {
    const o = opts || {};
    return svg({
      id: 'sub-' + cat.id + '-' + sub.id,
      color: cat.color,
      scene: sceneFor(sub.id),
      className: 'sub-art' + (o.className ? ' ' + o.className : ''),
    });
  }

  /** Vignette de quiz. */
  function thumb(quiz) {
    return svg({
      id: 'q-' + quiz.id,
      color: quiz.color,
      scene: (quiz.sub && sceneFor(quiz.sub)) || 'spark',
      className: 'quiz-thumb',
    });
  }

  QV.art = {
    svg: svg,
    catArt: catArt,
    subArt: subArt,
    thumb: thumb,
    sceneFor: sceneFor,
    categoryScene: categoryScene,
    scenes: Object.keys(S),
    textures: TEXTURES.length,
  };
})(window);
