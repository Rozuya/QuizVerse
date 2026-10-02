/**
 * QuizVerse — fabrication du ZIP de publication (outil de développement)
 *
 *   node tools/dev/make-zip.mjs [chemin-de-sortie.zip]
 *
 * Crée une archive ZIP propre contenant le projet complet, prête à être
 * envoyée sur GitHub : chemins relatifs, dossier QuizVerse/ à la racine,
 * aucun fichier temporaire, aucun cache, aucune donnée personnelle.
 *
 * L'archive est écrite avec un encodeur ZIP minimal intégré (zlib + en-têtes
 * PKZIP) : aucune dépendance à installer.
 */

import { readdirSync, statSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { deflateRawSync, crc32 as zlibCrc32 } from 'node:zlib';
import { dirname, resolve, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const PREFIX = 'QuizVerse/';

/* ------------------------------------------------------- À EXCLURE ---- */

const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.github', '.idea', '.vscode', '.cache', 'dist', '.temp']);

const EXCLUDE_FILES = new Set([
  '.DS_Store', 'Thumbs.db', 'desktop.ini',
  'npm-debug.log', 'yarn-error.log',
]);

const EXCLUDE_PATTERNS = [
  /\.log$/i, /\.tmp$/i, /\.bak$/i, /\.swp$/i, /\.orig$/i, /^~\$/,
  /^\._/,                 // macOS
  /^_/,                   // fichiers de travail des outils d'authoring
  /check.*\.m?js$/i, /^fix\.m?js$/i, /^patch.*\.c?js$/i, /^stats-.*\.m?js$/i,
  /^expl-check\.m?js$/i, /^probe\./i, /^verify-/i,
  /~$/,
];

function excluded(name, isDir) {
  if (isDir) return EXCLUDE_DIRS.has(name);
  if (EXCLUDE_FILES.has(name)) return true;
  return EXCLUDE_PATTERNS.some((re) => re.test(name));
}

/* ------------------------------------------------------- PARCOURS ----- */

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (excluded(name, st.isDirectory())) continue;
    if (st.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

/* -------------------------------------------------- ENCODEUR ZIP ------ */

function dosDateTime(d) {
  const time = ((d.getHours() & 31) << 11) | ((d.getMinutes() & 63) << 5) | ((d.getSeconds() / 2) & 31);
  const date = (((d.getFullYear() - 1980) & 127) << 9) | (((d.getMonth() + 1) & 15) << 5) | (d.getDate() & 31);
  return { time, date };
}

function crc32(buf) {
  // zlib expose crc32 depuis Node 20 ; sinon on retombe sur une table.
  if (typeof zlibCrc32 === 'function') return zlibCrc32(buf) >>> 0;
  let c, table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function buildZip(entries) {
  const chunks = [];
  const central = [];
  let offset = 0;

  for (const e of entries) {
    const nameBuf = Buffer.from(PREFIX + e.name, 'utf8');
    const raw = e.data;
    const deflated = deflateRawSync(raw, { level: 9 });
    // On ne compresse que si cela réduit réellement la taille.
    const useDeflate = deflated.length < raw.length;
    const body = useDeflate ? deflated : raw;
    const method = useDeflate ? 8 : 0;
    const crc = crc32(raw);
    const { time, date } = dosDateTime(e.mtime);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);            // version nécessaire
    local.writeUInt16LE(0x0800, 6);        // drapeau : nom de fichier en UTF-8
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);

    chunks.push(local, nameBuf, body);

    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);              // version d'écriture
    cd.writeUInt16LE(20, 6);              // version nécessaire
    cd.writeUInt16LE(0x0800, 8);
    cd.writeUInt16LE(method, 10);
    cd.writeUInt16LE(time, 12);
    cd.writeUInt16LE(date, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(body.length, 20);
    cd.writeUInt32LE(raw.length, 24);
    cd.writeUInt16LE(nameBuf.length, 28);
    cd.writeUInt16LE(0, 30);              // extra
    cd.writeUInt16LE(0, 32);              // commentaire
    cd.writeUInt16LE(0, 34);              // disque
    cd.writeUInt16LE(0, 36);              // attributs internes
    cd.writeUInt32LE(0o644 << 16, 38);    // attributs externes
    cd.writeUInt32LE(offset, 42);
    central.push(Buffer.concat([cd, nameBuf]));

    offset += local.length + nameBuf.length + body.length;
  }

  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return { buffer: Buffer.concat([...chunks, centralBuf, end]), count: entries.length };
}

/* ------------------------------------------------------------ MAIN ---- */

const outArg = process.argv[2]
  ? resolve(process.argv[2])
  : join(ROOT, 'QuizVerse-GitHub.zip');

console.log('\n══ QuizVerse · fabrication de l\'archive de publication ══\n');

const files = walk(ROOT);
const entries = files.map((f) => {
  const st = statSync(f);
  return {
    name: relative(ROOT, f).split(sep).join('/'),
    data: readFileSync(f),
    mtime: st.mtime,
  };
});

// Contrôles de sécurité avant d'écrire l'archive
const required = ['index.html', '404.html', 'README.md', 'LICENSE', '.nojekyll',
  'site.webmanifest', 'data/questions.json', 'data/categories.json', 'css/style.css'];
const names = new Set(entries.map((e) => e.name));
const missing = required.filter((r) => !names.has(r));
if (missing.length) {
  console.error('✗ Fichiers obligatoires absents du projet : ' + missing.join(', '));
  process.exit(1);
}

for (const e of entries) {
  if (/(^|\/)(node_modules|\.git)\//.test(e.name)) {
    console.error('✗ Fichier interdit dans l\'archive : ' + e.name);
    process.exit(1);
  }
}

const { buffer, count } = buildZip(entries);
mkdirSync(dirname(outArg), { recursive: true });
writeFileSync(outArg, buffer);

const rawSize = entries.reduce((a, e) => a + e.data.length, 0);
console.log('  Fichiers inclus   : ' + count);
console.log('  Taille non compressée : ' + (rawSize / 1024 / 1024).toFixed(2) + ' Mo');
console.log('  Taille de l\'archive : ' + (buffer.length / 1024 / 1024).toFixed(2) + ' Mo');
console.log('  Archive écrite     : ' + outArg);
console.log('');

console.log('  Contenu :');
const groups = {};
entries.forEach((e) => {
  const g = e.name.includes('/') ? e.name.split('/')[0] : '(racine)';
  groups[g] = (groups[g] || 0) + 1;
});
Object.keys(groups).sort().forEach((g) => console.log('    ' + g.padEnd(22) + groups[g] + ' fichier(s)'));

console.log('\n  Fichiers racine :');
entries.filter((e) => !e.name.includes('/')).forEach((e) => console.log('    ' + e.name));
console.log('');
