/**
 * QuizVerse — petit serveur statique local (outil de développement)
 *
 * Sert le dossier du projet sur http://localhost:8000 afin de tester le site
 * exactement comme il le sera sur GitHub Pages.
 *
 * Utilisation :
 *   node tools/serve.mjs          → http://localhost:8000
 *   node tools/serve.mjs 3000     → http://localhost:3000
 *
 * Aucune dépendance, aucun package à installer.
 */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PORT = Number(process.argv[2]) || 8000;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.webmanifest': 'application/manifest+json',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath.endsWith('/')) urlPath += 'index.html';

    let filePath = join(ROOT, normalize(urlPath).replace(/^(\.\.[\\/])+/, ''));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    let info = await stat(filePath).catch(() => null);
    if (info && info.isDirectory()) {
      filePath = join(filePath, 'index.html');
      info = await stat(filePath).catch(() => null);
    }
    if (!info) {
      // Repli sur 404.html comme GitHub Pages
      const fallback = join(ROOT, '404.html');
      const body = await readFile(fallback);
      res.writeHead(404, { 'Content-Type': TYPES['.html'] }).end(body);
      return;
    }

    const body = await readFile(filePath);
    const type = TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': body.length,
      // En développement on évite tout cache navigateur (GitHub Pages gère le sien).
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    });
    res.end(body);
  } catch (err) {
    res.writeHead(500).end('Erreur serveur : ' + err.message);
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('  QuizVerse est servi en local :');
  console.log('');
  console.log('  ➜  http://localhost:' + PORT + '/');
  console.log('');
  console.log('  Arrête le serveur avec Ctrl + C.');
  console.log('');
});
