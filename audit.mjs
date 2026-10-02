/**
 * QuizVerse — audit des pages (outil de développement)
 *
 * À ouvrir depuis index.html dans la console, ou via :
 *   node tools/dev/audit.mjs   (via un petit script Node + Playwright/CDP)
 *
 * Le plus simple : coller le contenu de AUDIT_SCRIPT dans la console du site.
 * Il vérifie chaque route, collecte les erreurs et signale les boutons morts.
 */

export const AUDIT_SCRIPT = `
(async () => {
  const ROUTES = [
    '/', '/explorer', '/explorer?tab=difficiles', '/explorer?tab=experts',
    '/explorer?tab=favoris', '/explorer?tab=reprendre', '/explorer?tab=reco',
    '/categories', '/categorie/animes', '/categorie/sports', '/categorie/gaming',
    '/categorie/culture', '/categorie/films', '/categorie/dessins', '/categorie/cuisine',
    '/categorie/francais', '/categorie/jeux', '/categorie/maths',
    '/univers/animes/dragonball', '/univers/sports/f1', '/univers/culture/histoire',
    '/quiz/q-animes-dragonball-facile', '/quiz-du-jour', '/aleatoire', '/surprise',
    '/creer-mon-quiz', '/creer-mon-quiz?preset=weak', '/mes-erreurs', '/mes-connaissances',
    '/profil', '/titres', '/statistiques', '/badges', '/defis', '/historique',
    '/favoris', '/parametres', '/recherche?q=dragon', '/recherche?q=zzzzzz',
    '/aide', '/credits', '/resultats', '/introuvable'
  ];

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const report = [];
  let consoleErrors = [];
  const origError = console.error;
  console.error = function (...a) { consoleErrors.push(a.map(String).join(' ')); origError.apply(console, a); };
  window.addEventListener('error', e => consoleErrors.push('window.error: ' + e.message));

  for (const route of ROUTES) {
    consoleErrors = [];
    location.hash = '#' + route;
    await sleep(220);
    const main = document.getElementById('main');
    const html = main ? main.innerHTML : '';
    const renderError = html.indexOf('Erreur d\\u2019affichage') >= 0 || html.indexOf('Erreur d\\'affichage') >= 0;
    const loadError = html.indexOf('Impossible de charger les donn') >= 0;
    const title = (main && main.querySelector('h1,h2,.empty-state__title'))
      ? main.querySelector('h1,h2,.empty-state__title').textContent.slice(0, 40) : '(vide)';
    const dead = [];
    if (main) {
      main.querySelectorAll('button').forEach(b => {
        if (!b.onclick && !b.dataset.onclick && b.getAttribute('onclick') === null && !b.closest('form')) {
          // un bouton sans gestionnaire : autorisé uniquement si disabled
          if (!b.disabled) dead.push((b.textContent || b.getAttribute('aria-label') || '?').trim().slice(0, 28));
        }
      });
    }
    report.push({ route, len: html.length, renderError, loadError, title, dead: dead.slice(0, 5), errors: consoleErrors.slice(0, 2) });
  }
  console.error = origError;
  console.table(report);
  const bad = report.filter(r => r.renderError || r.loadError || r.errors.length || r.dead.length || r.len < 300);
  console.log('%cAudit terminé — ' + report.length + ' routes, ' + bad.length + ' problème(s)', 'font:700 15px system-ui;color:' + (bad.length ? '#fb7185' : '#34d399'));
  if (bad.length) console.table(bad);
  return bad;
})()
`;
