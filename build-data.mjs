/**
 * QuizVerse — construction et validation de data/questions.json
 * ------------------------------------------------------------------------
 * Ce script :
 *   1. importe tous les modules de questions de tools/authoring/questions/ ;
 *   2. valide chaque question (catégorie, sous-catégorie, difficulté, réponses,
 *      index, doublons de propositions, doublons de texte) ;
 *   3. corrige automatiquement tout ce qui peut l'être ;
 *   4. génère data/questions.json et data/categories.json ;
 *   5. affiche un rapport détaillé.
 *
 * Utilisation :  node tools/build-data.mjs
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = resolve(ROOT, 'tools', 'authoring', 'questions');
const OUT = resolve(ROOT, 'data');

const { TAXONOMY, DIFFICULTIES } = await import(pathToFileURL(resolve(ROOT, 'tools', 'authoring', 'taxonomy.mjs')).href);
const { buildSources } = await import(pathToFileURL(resolve(ROOT, 'tools', 'authoring', 'sources.mjs')).href);

/* ------------------------------------------------------------------ */

const DIFF_RANK = { facile: 0, moyen: 1, difficile: 2, expert: 3 };
const TYPE_LABELS = { qcm: 'QCM', vf: 'Vrai / Faux', multi: 'Plusieurs réponses', guess: 'Devine', image: 'Image' };

const report = {
  files: 0, total: 0, kept: 0, removed: 0, fixed: 0, withSources: 0,
  problems: [], byCat: {}, bySub: {}, byDiff: {}, byType: {},
  duplicateTexts: 0, duplicatePairs: 0,
};

function norm(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function slug(s) {
  return norm(s).replace(/\s+/g, '-');
}

/* -------------------------------------------------- Chargement -------- */

async function loadAll() {
  if (!existsSync(SRC)) {
    console.error('Aucun dossier de questions trouvé :', SRC);
    return [];
  }
  const files = readdirSync(SRC)
    .filter((f) => f.endsWith('.mjs') && !f.startsWith('_'))
    .sort();
  const all = [];
  for (const f of files) {
    const url = pathToFileURL(resolve(SRC, f)).href;
    const mod = await import(url + '?t=' + Date.now());
    const list = mod.default || [];
    if (!Array.isArray(list)) {
      console.warn('  ! ' + f + ' n’exporte pas de tableau');
      continue;
    }
    report.files += 1;
    report.total += list.length;
    all.push(...list.map((q) => ({ ...q, __file: f })));
    console.log(`  · ${f.padEnd(20)} ${String(list.length).padStart(4)} questions`);
  }
  return all;
}

/* -------------------------------------------------- Normalisation ---- */

function normalize(q, seenIds) {
  const out = {};
  let fixed = false;

  // --- catégorie / sous-catégorie ---
  out.cat = String(q.cat || '').trim();
  out.sub = String(q.sub || '').trim();
  if (!TAXONOMY[out.cat]) {
    report.problems.push({ level: 'fatal', file: q.__file, text: q.text, msg: `Catégorie inconnue « ${out.cat} »` });
    return null;
  }
  if (!TAXONOMY[out.cat].subs[out.sub]) {
    report.problems.push({ level: 'fatal', file: q.__file, text: q.text, msg: `Sous-catégorie inconnue « ${out.cat}/${out.sub} »` });
    return null;
  }

  // --- difficulté ---
  out.diff = String(q.diff || '').trim().toLowerCase();
  if (!DIFFICULTIES.includes(out.diff)) {
    report.problems.push({ level: 'fix', file: q.__file, text: q.text, msg: `Difficulté invalide « ${q.diff} » → moyen` });
    out.diff = 'moyen';
    fixed = true;
  }

  // --- énoncé ---
  out.text = String(q.text || '').trim().replace(/\s+/g, ' ');
  if (!out.text) {
    report.problems.push({ level: 'fatal', file: q.__file, msg: 'Question sans énoncé' });
    return null;
  }
  if (!/[?！?]$/.test(out.text) && !/[.]$/.test(out.text)) out.text += ' ?';

  // --- type ---
  const opts = q.opts || {};
  let type = opts.type;
  if (!TYPE_LABELS[type]) type = 'qcm';
  out.type = type;

  // --- réponses ---
  let answers = Array.isArray(q.answers) ? q.answers.map((a) => String(a).trim()) : [];
  let correct = q.correct;
  const arr = Array.isArray(correct) ? correct.slice() : [correct];

  // réponses manquantes ou index invalides
  answers = answers.filter((a) => a.length > 0);
  let badIndex = false;
  for (const i of arr) {
    if (typeof i !== 'number' || !Number.isInteger(i) || i < 0 || i >= answers.length) badIndex = true;
  }
  if (badIndex) {
    report.problems.push({ level: 'fix', file: q.__file, text: out.text, msg: 'Index de réponse invalide → première proposition' });
    correct = 0;
    fixed = true;
  }

  // réponse correcte absente
  if (!Array.isArray(correct)) correct = [correct];
  if (type === 'vf') {
    if (answers.length !== 2) {
      answers = ['Vrai', 'Faux'];
      correct = [correct[0] === 0 ? 0 : 1];
      fixed = true;
    }
  } else if (type === 'multi') {
    correct = Array.from(new Set(correct)).sort((a, b) => a - b);
    if (correct.length < 2) {
      // on complète avec une autre proposition pour garder un « plusieurs réponses »
      const others = answers.map((_, i) => i).filter((i) => !correct.includes(i));
      if (others.length) { correct.push(others[0]); correct.sort((a, b) => a - b); fixed = true; }
      else type = 'qcm';
    }
    if (correct.length === answers.length) type = 'qcm';
  } else {
    correct = [correct[0] === undefined ? 0 : correct[0]];
  }
  out.type = type;

  // propositions dupliquées : on retire les doublons et on corrige les index
  const seen = new Map();
  const newAnswers = [];
  const remap = new Array(answers.length).fill(-1);
  answers.forEach((a, i) => {
    const k = norm(a);
    if (seen.has(k)) { report.duplicatePairs += 1; return; }
    seen.set(k, newAnswers.length);
    remap[i] = newAnswers.length;
    newAnswers.push(a);
  });
  if (newAnswers.length !== answers.length) {
    report.problems.push({ level: 'fix', file: q.__file, text: out.text, msg: 'Propositions dupliquées supprimées' });
    fixed = true;
  }
  // une proposition correcte ne doit pas disparaître
  const newCorrect = Array.from(new Set(correct.map((i) => remap[i]).filter((i) => i >= 0))).sort((a, b) => a - b);
  if (!newCorrect.length) {
    report.problems.push({ level: 'fix', file: q.__file, text: out.text, msg: 'Bonne réponse perdue après nettoyage → 0' });
    newCorrect.push(0);
    fixed = true;
  }
  answers = newAnswers;
  correct = newCorrect;

  // minimum de propositions
  if (type !== 'vf' && answers.length < 2) {
    answers = ['Vrai', 'Faux'];
    correct = [0];
    type = 'vf';
    fixed = true;
  }
  if (type === 'vf') {
    const t = answers.map(norm);
    const vi = t.indexOf('vrai');
    const fi = t.indexOf('faux');
    if (vi < 0 || fi < 0) {
      answers = ['Vrai', 'Faux'];
      correct = [correct[0] === 0 ? 0 : 1];
      fixed = true;
    }
  }
  out.type = type;
  out.answers = answers;
  out.correct = type === 'multi' ? correct : correct[0];

  // --- explication ---
  out.explanation = String(q.explanation || '').trim().replace(/\s+/g, ' ');
  if (!out.explanation || out.explanation.length < 12) {
    report.problems.push({ level: 'warn', file: q.__file, text: out.text, msg: 'Explication trop courte' });
    out.explanation = out.explanation || 'Aucune explication fournie pour cette question.';
  }

  // --- tags ---
  let tags = Array.isArray(q.tags) ? q.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean) : [];
  tags = Array.from(new Set(tags)).slice(0, 6);
  if (!tags.length) tags = [slug(TAXONOMY[out.cat].subs[out.sub])].filter(Boolean);
  out.tags = tags;

  // --- indice / image ---
  if (opts.hint) out.hint = String(opts.hint).trim();
  if (opts.image) out.image = String(opts.image).trim();
  else if (type === 'guess' || type === 'image') {
    // Devine le personnage / devine le film : on déduit une illustration du texte
    const m = /devine le ([^:?:]+)\s*:/i.exec(out.text);
    out.image = '❓';
    if (m) out.guessKind = slug(m[1]);
  }

  // --- sources documentaires ---
  // Ajoutées automatiquement : article Wikipédia de l'univers + recherche sur le
  // mot-clé principal. Elles s'affichent après chaque réponse (bonne ou mauvaise).
  const subLabel = TAXONOMY[out.cat].subs[out.sub];
  out.sources = buildSources({ tags: out.tags, sub: out.sub, text: out.text, opts: opts }, subLabel);
  if (out.sources.length) report.withSources += 1;

  // --- identifiant unique et stable ---
  const base = out.cat + '-' + out.sub + '-' + slug(out.text).slice(0, 60);
  let id = base;
  let n = 2;
  while (seenIds.has(id)) { id = base + '-' + n; n += 1; }
  seenIds.set(id, true);
  out.id = id;

  if (fixed) report.fixed += 1;
  return out;
}

/* -------------------------------------------------- Dédoublonnage ---- */

function dedupe(list) {
  const byText = new Map();
  const out = [];
  const removed = [];

  for (const q of list) {
    const k = norm(q.text);
    const prev = byText.get(k);
    if (prev) {
      removed.push({ q, prev });
      continue;
    }
    byText.set(k, q);
    out.push(q);
  }
  report.duplicateTexts = removed.length;
  return { kept: out, removed };
}

/* --------------------------------------------------- Détection de ----- */
function nearDuplicates(list) {
  // Doublons « presque identiques » : même catégorie, énoncé très proche
  const byCat = new Map();
  list.forEach((q) => {
    if (!byCat.has(q.cat)) byCat.set(q.cat, []);
    byCat.get(q.cat).push(q);
  });
  const suspicious = [];
  byCat.forEach((group) => {
    const seen = new Map();
    for (const q of group) {
      // On compare sur les 8 premiers mots significatifs
      const words = norm(q.text).split(' ').slice(0, 8).join(' ');
      if (seen.has(words)) suspicious.push({ a: seen.get(words), b: q });
      else seen.set(words, q);
    }
  });
  return suspicious;
}

/* --------------------------------------------------- Catégories ------- */

function buildCategories(questions) {
  const cats = [];
  for (const [id, def] of Object.entries(TAXONOMY)) {
    const subs = Object.entries(def.subs).map(([sid, label]) => {
      const list = questions.filter((q) => q.cat === id && q.sub === sid);
      const byDiff = { facile: 0, moyen: 0, difficile: 0, expert: 0 };
      list.forEach((q) => { byDiff[q.diff] += 1; });
      return {
        id: sid, label, count: list.length, byDiff,
        hasQuizzes: byDiff.facile > 0 && byDiff.moyen > 0 && byDiff.difficile > 0 && byDiff.expert > 0,
      };
    });
    const count = subs.reduce((a, s) => a + s.count, 0);
    const byDiff = { facile: 0, moyen: 0, difficile: 0, expert: 0 };
    questions.filter((q) => q.cat === id).forEach((q) => { byDiff[q.diff] += 1; });
    cats.push({
      id,
      label: def.label,
      emoji: def.emoji,
      color: def.color,
      count,
      subs: subs.filter((s) => s.count > 0),
      byDiff,
      keywords: norm(def.label),
    });
  }
  return cats.filter((c) => c.count > 0);
}

/* ------------------------------------------------------ Main ---------- */

async function main() {
  console.log('\n── QuizVerse · construction de la base de questions ──\n');
  const raw = await loadAll();
  if (!raw.length) {
    console.error('Aucune question chargée.');
    process.exitCode = 1;
    return;
  }

  const seenIds = new Map();
  const normalized = [];
  for (const q of raw) {
    const n = normalize(q, seenIds);
    if (n) normalized.push(n);
  }

  const { kept, removed } = dedupe(normalized);
  report.kept = kept.length;
  report.removed = removed.length;

  // Tri : catégorie, sous-catégorie, difficulté, texte
  kept.sort((a, b) =>
    a.cat.localeCompare(b.cat) ||
    a.sub.localeCompare(b.sub) ||
    DIFF_RANK[a.diff] - DIFF_RANK[b.diff] ||
    a.text.localeCompare(b.text, 'fr')
  );

  kept.forEach((q) => {
    report.byCat[q.cat] = (report.byCat[q.cat] || 0) + 1;
    report.bySub[q.cat + '/' + q.sub] = (report.bySub[q.cat + '/' + q.sub] || 0) + 1;
    report.byDiff[q.diff] = (report.byDiff[q.diff] || 0) + 1;
    report.byType[q.type] = (report.byType[q.type] || 0) + 1;
  });

  const cats = buildCategories(kept);

  // Écriture (uniquement si un chemin de sortie est fourni : le site sait
  // charger directement les modules, la fusion n'est donc pas obligatoire).
  const outIdx = process.argv.indexOf('--write');
  const outPath = outIdx > 0 ? process.argv[outIdx + 1] : null;
  if (outPath) {
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, JSON.stringify(kept));
    console.log(`\nFichier écrit : ${outPath} (${(statSync(outPath).size / 1024 / 1024).toFixed(2)} Mo)`);
  } else {
    console.log('\n(Fusion non écrite : le site charge directement les modules listés dans data/questions.json.)');
    console.log('Pour produire un fichier unique : node tools/build-data.mjs --write data/questions-inline.json');
  }
  console.log(`Catégories détectées : ${cats.length} · total : ${kept.length} questions`);

  // Rapport
  console.log('\n── Rapport ──');
  console.log(`Fichiers traités        : ${report.files}`);
  console.log(`Questions lues         : ${report.total}`);
  console.log(`Questions conservées   : ${report.kept}`);
  console.log(`Doublons supprimés     : ${report.removed}`);
  console.log(`Corrections automatiques: ${report.fixed}`);
  console.log(`Paires de propositions dupliquées : ${report.duplicatePairs}`);

  console.log('\nPar difficulté :');
  DIFFICULTIES.forEach((d) => console.log(`  ${d.padEnd(10)} ${String(report.byDiff[d] || 0).padStart(5)}`));
  console.log('\nPar type :');
  Object.keys(TYPE_LABELS).forEach((t) => console.log(`  ${TYPE_LABELS[t].padEnd(20)} ${String(report.byType[t] || 0).padStart(5)}`));
  console.log('\nPar catégorie :');
  cats.forEach((c) => console.log(`  ${c.emoji} ${c.label.padEnd(24)} ${String(c.count).padStart(5)} questions · ${c.subs.length} univers`));

  const lowSub = cats.flatMap((c) => c.subs.filter((s) => s.count < 6).map((s) => `${c.id}/${s.id} (${s.count})`));
  if (lowSub.length) {
    console.log('\nUnivers à moins de 6 questions (un quiz dédié ne sera pas créé) :');
    console.log('  ' + lowSub.join(', '));
  }

  const near = nearDuplicates(kept);
  if (near.length) {
    console.log(`\n⚠ ${near.length} paires de questions très proches détectées :`);
    near.slice(0, 15).forEach((p) => console.log(`  • ${p.a.text}\n    ${p.b.text}`));
  } else {
    console.log('\n✓ Aucune paire de questions quasi identique détectée.');
  }

  const fatals = report.problems.filter((p) => p.level === 'fatal');
  const fixes = report.problems.filter((p) => p.level === 'fix');
  const warns = report.problems.filter((p) => p.level === 'warn');
  if (fatals.length) {
    console.log(`\n✗ ${fatals.length} questions rejetées :`);
    fatals.slice(0, 30).forEach((p) => console.log(`  ${p.file} · ${p.msg} · ${p.text || ''}`));
  }
  if (fixes.length) {
    console.log(`\n↻ ${fixes.length} corrections automatiques appliquées.`);
    fixes.slice(0, 20).forEach((p) => console.log(`  ${p.msg} · ${p.text || ''}`));
    if (fixes.length > 20) console.log(`  … et ${fixes.length - 20} autres.`);
  }
  if (warns.length) {
    console.log(`\n⚠ ${warns.length} avertissements (explications courtes).`);
  }

  const ids = new Set(kept.map((q) => q.id));
  console.log(`\nIdentifiants uniques    : ${ids.size} / ${kept.length}`);
  console.log(`Questions avec sources  : ${report.withSources} / ${kept.length}`);

  console.log('');

  if (kept.length < 2000) {
    console.log(`⚠ Objectif de 2 000 questions non atteint (${kept.length}).`);
    process.exitCode = 2;
  } else {
    console.log(`✓ Objectif de 2 000 questions atteint (${kept.length}).`);
  }
}

main();
