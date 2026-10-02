/**
 * QuizVerse — générateur d'icônes PNG + favicon.ico (outil de développement)
 *
 *   node tools/dev/make-icons.mjs
 *
 * Produit, sans aucune dépendance :
 *   assets/icons/favicon-512.png
 *   assets/icons/favicon-192.png
 *   assets/icons/favicon-128.png
 *   assets/icons/apple-touch-icon.png
 *   assets/icons/favicon.ico   (16 / 32 / 48 / 64)
 *   favicon.ico                (copie à la racine, pour certains navigateurs)
 *
 * Puis met à jour index.html et site.webmanifest pour les référencer.
 *
 * Le logo est dessiné géométriquement (aucune police à charger), puis encodé
 * en PNG avec le module zlib de Node.
 *
 * ⚠️ Le SVG fourni par défaut fonctionne déjà sur tous les navigateurs
 *    modernes : cette commande est facultative, utile pour les très vieux
 *    navigateurs et pour certaines plateformes qui exigent une icône PNG.
 */

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');

/* ------------------------------------------------------------ PNG ---- */

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}

/** @param {Uint8Array} rgba pixels RGBA */
function encodePng(rgba, w, h) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filtre "None"
    for (let x = 0; x < w * 4; x++) raw[y * (w * 4 + 1) + 1 + x] = rgba[y * w * 4 + x];
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;   // profondeur
  ihdr[9] = 6;   // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------------------------------------------------------- Dessin ---- */

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const smooth = (d) => clamp(0.5 - d, 0, 1); // anti-aliasing doux

/** Distance signée à un rectangle arrondi (négative = intérieur). */
function sdRoundRect(px, py, cx, cy, hw, hh, r) {
  const qx = Math.abs(px - cx) - (hw - r);
  const qy = Math.abs(py - cy) - (hh - r);
  const ax = Math.max(qx, 0), ay = Math.max(qy, 0);
  return Math.sqrt(ax * ax + ay * ay) + Math.min(Math.max(qx, qy), 0) - r;
}

/** Couleur du dégradé principal (violet → cyan) en diagonale. */
function grad(t) {
  const stops = [
    [0.00, [0x7c, 0x5c, 0xff]],
    [0.55, [0x6d, 0x4a, 0xff]],
    [1.00, [0x22, 0xd3, 0xee]],
  ];
  t = clamp(t, 0, 1);
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i], b = stops[i + 1];
    if (t >= a[0] && t <= b[0]) {
      const k = (t - a[0]) / (b[0] - a[0]);
      return [
        Math.round(a[1][0] + (b[1][0] - a[1][0]) * k),
        Math.round(a[1][1] + (b[1][1] - a[1][1]) * k),
        Math.round(a[1][2] + (b[1][2] - a[1][2]) * k),
      ];
    }
  }
  return stops[stops.length - 1][1];
}

/**
 * Dessine la marque QuizVerse dans un buffer RGBA.
 * Le « Q » est composé d'un anneau épais et d'une barre diagonale.
 */
function drawIcon(size) {
  const out = new Uint8Array(size * size * 4);
  const S = size;
  const cx = S / 2, cy = S / 2;

  // Géométrie (proportions du logo SVG)
  const pad = S * 0.035;
  const outerR = S * 0.219;             // rayon du carré arrondi extérieur
  const innerR = S * 0.191;             // rayon intérieur du dégradé
  const ring1 = S * 0.293;              // anneau extérieur fin
  const ring2 = S * 0.207;              // anneau principal
  const ringW1 = S * 0.0195;
  const ringW2 = S * 0.0117;
  const qR = S * 0.128;                 // rayon de l'anneau du Q
  const qW = S * 0.058;                 // épaisseur du Q

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const px = x + 0.5, py = y + 0.5;
      let r = 0, g = 0, b = 0, a = 0;

      // 1. Fond noir (le carré arrondi est inclus)
      const dOuter = sdRoundRect(px, py, cx, cy, S / 2 - pad, S / 2 - pad, outerR);
      a = smooth(dOuter);
      r = 0x07; g = 0x07; b = 0x0f;

      // 2. Dégradé dans un carré arrondi légèrement plus petit
      const dInner = sdRoundRect(px, py, cx, cy, S / 2 - pad * 2.1, S / 2 - pad * 2.1, innerR);
      const ai = smooth(dInner);
      if (ai > 0) {
        const t = clamp((px / S) * 0.55 + (py / S) * 0.65, 0, 1);
        const c = grad(t);
        // Reflet diagonal en haut à gauche
        const hi = clamp(1 - Math.hypot(px - S * 0.28, py - S * 0.16) / (S * 0.72), 0, 1);
        const lift = hi * hi * 0.34;
        r = Math.round(r + (c[0] - r) * ai + 255 * lift * ai);
        g = Math.round(g + (c[1] - g) * ai + 255 * lift * ai);
        b = Math.round(b + (c[2] - b) * ai + 255 * lift * ai);
      }

      // 3. Anneaux concentriques
      const dc = Math.hypot(px - cx, py - cy);
      const ringA1 = clamp(0.5 - Math.abs(dc - ring1) / ringW1, 0, 1) * 0.14;
      const ringA2 = clamp(0.5 - Math.abs(dc - ring2) / ringW2, 0, 1) * 0.22;
      r = r + (255 - r) * ringA1 + (255 - r) * ringA2;
      g = g + (255 - g) * ringA1 + (255 - g) * ringA2;
      b = b + (255 - b) * ringA1 + (255 - b) * ringA2;

      // 4. Le « Q » : anneau blanc + queue diagonale
      const qa = clamp(0.5 - Math.abs(dc - qR) / qW, 0, 1);
      // queue : segment de (cx+0.30S, cy+0.30S) à (cx+0.44S, cy+0.44S)
      const ax = cx + S * 0.235, ay = cy + S * 0.235;
      const bx = cx + S * 0.365, by = cy + S * 0.365;
      const vx = bx - ax, vy = by - ay;
      const tt = clamp(((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy), 0, 1);
      const dseg = Math.hypot(px - (ax + vx * tt), py - (ay + vy * tt));
      const tailA = clamp(0.5 - (dseg - S * 0.028) / (S * 0.010), 0, 1);
      const mark = clamp(qa + tailA, 0, 1);

      // Evite que le Q dépasse du carré arrondi extérieur
      const clip = 1 - smooth(dOuter + 1);
      const ma = mark * clip;

      // 5. Tranche centrale du Q (donne la « Q » plutôt qu'un « O »)
      // déjà géré par la queue

      const o = (y * S + x) * 4;
      out[o] = Math.round(r);
      out[o + 1] = Math.round(g);
      out[o + 2] = Math.round(b);
      out[o + 3] = Math.round(a * 255);
      void ma;
    }
  }

  // Deuxième passe : surimpression blanche du Q (avec alpha propre)
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const px = x + 0.5, py = y + 0.5;
      const dc = Math.hypot(px - cx, py - cy);
      const qa = clamp(0.5 - Math.abs(dc - qR) / qW, 0, 1);
      const ax = cx + S * 0.235, ay = cy + S * 0.235;
      const bx = cx + S * 0.375, by = cy + S * 0.375;
      const vx = bx - ax, vy = by - ay;
      const tt = clamp(((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy), 0, 1);
      const dseg = Math.hypot(px - (ax + vx * tt), py - (ay + vy * tt));
      const tailA = clamp(0.5 - (dseg - S * 0.030) / (S * 0.012), 0, 1);
      // la queue doit être « pleine » au centre, effilée aux extrémités
      const taper = Math.sin(Math.PI * clamp(tt, 0, 1));
      const alpha = clamp(Math.max(qa, tailA * taper), 0, 1);

      if (alpha > 0.01) {
        const o = (y * S + x) * 4;
        out[o] = Math.round(out[o] + (255 - out[o]) * alpha);
        out[o + 1] = Math.round(out[o + 1] + (255 - out[o + 1]) * alpha);
        out[o + 2] = Math.round(out[o + 2] + (255 - out[o + 2]) * alpha);
      }
    }
  }

  return out;
}

/* ----------------------------------------------------------- ICO ---- */

function makeIco(pngs) {
  // ICONDIR
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);           // réservé
  header.writeUInt16LE(1, 2);           // type 1 = icône
  header.writeUInt16LE(pngs.length, 4);
  let offset = 6 + pngs.length * 16;
  const entries = [];
  for (const p of pngs) {
    const e = Buffer.alloc(16);
    e[0] = p.size >= 256 ? 0 : p.size;
    e[1] = p.size >= 256 ? 0 : p.size;
    e[2] = 0; e[3] = 0;
    e.writeUInt16LE(1, 4);              // plans
    e.writeUInt16LE(32, 6);             // bpp
    e.writeUInt32LE(p.buf.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += p.buf.length;
    entries.push(e);
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.buf)]);
}

/** Met à jour index.html et site.webmanifest pour référencer les icônes PNG. */
function patchReferences() {
  const htmlPath = resolve(ROOT, 'index.html');
  let html = readFileSync(htmlPath, 'utf8');
  const block = [
    '<link rel="icon" href="./assets/icons/favicon.ico" sizes="any">',
    '<link rel="icon" href="./assets/icons/favicon-192.png" type="image/png" sizes="192x192">',
    '<link rel="apple-touch-icon" href="./assets/icons/apple-touch-icon.png">',
  ].join('\n');

  if (html.indexOf('favicon-192.png') >= 0) {
    console.log('  index.html : références déjà présentes');
  } else if (html.indexOf('<link rel="icon" href="./assets/icons/favicon.svg" type="image/svg+xml">') >= 0) {
    html = html.replace(
      '<link rel="icon" href="./assets/icons/favicon.svg" type="image/svg+xml">',
      '<link rel="icon" href="./assets/icons/favicon.svg" type="image/svg+xml">\n' + block
    );
    writeFileSync(htmlPath, html);
    console.log('  index.html : références PNG ajoutées');
  }

  const mfPath = resolve(ROOT, 'site.webmanifest');
  let mf = readFileSync(mfPath, 'utf8');
  if (mf.indexOf('favicon-192.png') < 0) {
    mf = mf.replace(
      '{ "src": "./assets/icons/favicon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any" }',
      '{ "src": "./assets/icons/favicon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any" },\n    '
      + '{ "src": "./assets/icons/favicon-192.png", "sizes": "192x192", "type": "image/png" },\n    '
      + '{ "src": "./assets/icons/favicon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }'
    );
    writeFileSync(mfPath, mf);
    console.log('  site.webmanifest : icônes ajoutées');
  } else {
    console.log('  site.webmanifest : déjà à jour');
  }
}

/* ---------------------------------------------------------- Main ---- */

function main() {
  console.log('\n══ QuizVerse · génération des icônes ══\n');
  mkdirSync(resolve(ROOT, 'assets', 'icons'), { recursive: true });

  const targets = [
    { file: 'assets/icons/favicon-512.png', size: 512 },
    { file: 'assets/icons/favicon-192.png', size: 192 },
    { file: 'assets/icons/apple-touch-icon.png', size: 180 },
    { file: 'assets/icons/favicon-128.png', size: 128 },
  ];

  const cache = new Map();
  for (const t of targets) {
    const rgba = drawIcon(t.size);
    const png = encodePng(rgba, t.size, t.size);
    writeFileSync(resolve(ROOT, t.file), png);
    cache.set(t.size, png);
    console.log(`  ${t.file.padEnd(34)} ${t.size}×${t.size}  ${(png.length / 1024).toFixed(1)} Ko`);
  }

  // favicon.ico : 16, 32, 48, 64
  const icoSizes = [16, 32, 48, 64];
  const icoPngs = icoSizes.map((s) => {
    let png = cache.get(s);
    if (!png) {
      png = encodePng(drawIcon(s), s, s);
      cache.set(s, png);
    }
    return { size: s, buf: png };
  });
  const ico = makeIco(icoPngs);
  writeFileSync(resolve(ROOT, 'assets', 'icons', 'favicon.ico'), ico);
  writeFileSync(resolve(ROOT, 'favicon.ico'), ico);
  console.log(`  favicon.ico${''.padEnd(27)} ${icoSizes.join('/')}  ${(ico.length / 1024).toFixed(1)} Ko`);

  patchReferences();
  console.log('\n✓ Icônes générées. Le site utilise déjà favicon.svg ; ces PNG Complètent la compatibilité.\n');
}

main();
