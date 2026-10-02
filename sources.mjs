/**
 * QuizVerse — sources documentaires (outil de développement)
 * ------------------------------------------------------------------------
 * Chaque question reçoit automatiquement des sources cliquables, affichées
 * après une bonne réponse ET après une mauvaise réponse.
 *
 * Principe : on n'invente jamais de référence. Deux types de sources :
 *   1. l'article de Wikipédia en français correspondant à l'univers ;
 *   2. une recherche Wikipédia sur le mot-clé principal de la question,
 *      qui fonctionne toujours même si l'article n'existe pas.
 *
 * Pour ajouter une source précise à une question précise, il suffit de
 * passer { opts: { sources: [...] } } au helper Q().
 */

/** Correspondance sous-catégorie -> article de Wikipédia français. */
export const SUB_SOURCES = {
  // --- Films & Séries ---
  hp: 'Harry Potter',
  marvel: 'Marvel Comics',
  dc: 'DC Comics',
  starwars: 'Star Wars',
  disney: 'Disney',
  pixar: 'Pixar Animation Studios',
  netflix: 'Netflix',
  seriesfr: 'Télévision en France',
  seriesus: 'Séries télévisées américaines',
  cultes: 'Film culte',
  animation: "Film d'animation",
  scifi: 'Science-fiction',
  horreur: "Film d'horreur",
  action: "Film d'action",
  comedie: 'Film comique',

  // --- Animés & Mangas ---
  dragonball: 'Dragon Ball',
  naruto: 'Naruto',
  onepiece: 'One Piece',
  bleach: 'Bleach',
  jujutsu: 'Jujutsu Kaisen',
  demonslayer: 'Demon Slayer',
  mha: 'My Hero Academia',
  hxh: 'Hunter × Hunter',
  aot: "L'Attaque des titans",
  pokemon: 'Pokémon',
  deathnote: 'Death Note',
  sololeveling: 'Solo Leveling',
  opm: 'One Punch Man',
  chainsaw: 'Chainsaw Man',
  jojo: "JoJo's Bizarre Adventure",

  // --- Sports ---
  football: 'Football',
  ucl: "Ligue des champions de l'UEFA",
  worldcup: 'Coupe du monde de football',
  liga: "Championnat d'Espagne de football",
  premierleague: "Championnat d'Angleterre de football",
  nba: 'National Basketball Association',
  basketball: 'Basket-ball',
  f1: 'Formule 1',
  motogp: 'MotoGP',
  tennis: 'Tennis',
  ufc: 'Ultimate Fighting Championship',
  boxe: 'Boxe',
  olympics: 'Jeux olympiques',

  // --- Jeux Vidéo ---
  minecraft: 'Minecraft',
  fortnite: 'Fortnite',
  gta: 'Grand Theft Auto',
  cod: 'Call of Duty',
  eafc: 'FIFA (série de jeux vidéo)',
  roblox: 'Roblox',
  nintendo: 'Nintendo',
  pokemongames: 'Pokémon (série de jeux vidéo)',
  playstation: 'PlayStation',
  xbox: 'Xbox',
  pcgaming: 'Jeu vidéo sur PC',
  retro: 'Rétrogaming',
  indie: 'Jeu vidéo indépendant',
  competitive: 'Esport',

  // --- Culture Générale ---
  histoire: 'Histoire',
  geographie: 'Géographie',
  capitales: 'Capitale',
  drapeaux: 'Drapeau',
  sciences: 'Science',
  technologie: 'Technologie',
  musique: 'Musique',
  cinema: 'Cinéma',
  litterature: 'Littérature',
  france: 'France',
  monde: 'Monde',
  internet: 'Internet',
  espace: 'Espace',
  nature: 'Nature',
  inventions: 'Invention',

  // --- Dessins animés & jeunesse ---
  miraculous: 'Miraculous, les aventures de Ladybug et Chat Noir',
  peppa: 'Peppa Pig',
  arthur: "Arthur (série télévisée d'Arthur)",
  disneychannel: 'Disney Channel',
  titeuf: 'Titeuf (bande dessinée)',
  klass: 'Klass (série télévisée)',
  cartoons: 'Dessin animé',

  // --- Maths & Logique ---
  calcul: 'Calcul',
  geometrie: 'Géométrie',
  probabilites: 'Probabilité',
  casse: 'Casse-tête',
  suites: 'Suite numérique',
  mathsculture: 'Mathématiques',

  // --- Jeux de Société & Cartes ---
  monopoly: 'Monopoly (jeu)',
  uno: 'Uno (jeu)',
  scrabble: 'Scrabble',
  echecs: 'Échecs',
  cartes: 'Carte à jouer',
  anciens: 'Jeu de société',
  moderne: 'Jeu de société',

  // --- Cuisine ---
  cuisinefr: 'Cuisine française',
  cuisineit: 'Cuisine italienne',
  cuisinejp: 'Cuisine japonaise',
  cuisineus: 'Cuisine américaine',
  cuisineworld: 'Gastronomie',
  techniques: 'Technique de cuisine',

  // --- Français & Langues ---
  grammaire: 'Grammaire',
  orthographe: 'Orthographe',
  classique: 'Littérature française',
  etymologie: 'Étymologie',
  expressions: 'Expression figée',
  langues: 'Langue',
};

export const WIKI = 'https://fr.wikipedia.org/wiki/';

export function wikiUrl(title) {
  return WIKI + encodeURIComponent(String(title).replace(/ /g, '_'));
}

export function wikiSearchUrl(term) {
  return 'https://fr.wikipedia.org/w/index.php?search=' + encodeURIComponent(String(term)) + '&title=Sp%C3%A9cial%3ARecherche&ns0=1';
}

/**
 * Construit la liste de sources d'une question.
 * @param {object} q question normalisée
 * @param {string} subLabel libellé de la sous-catégorie
 */
export function buildSources(q, subLabel) {
  const out = [];
  const seen = new Set();
  const add = (label, url) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push({ label, url });
  };

  // 1. Sources fournies à la main par l'auteur de la question
  (q.opts && Array.isArray(q.opts.sources) ? q.opts.sources : []).forEach(function (s) {
    if (typeof s === 'string') {
      if (/^https?:\/\//.test(s)) add(s, s);
      else add(s, wikiUrl(s));
    } else if (s && s.url) {
      add(s.label || s.url, s.url);
    }
  });

  // 2. Article Wikipédia de l'univers
  const article = SUB_SOURCES[q.sub];
  if (article) add('Wikipédia — ' + article, wikiUrl(article));
  else if (subLabel) add('Wikipédia — ' + subLabel, wikiUrl(subLabel));

  // 3. Recherche sur le mot-clé principal
  const kw = pickKeyword(q);
  if (kw) add('Wikipédia — recherche : ' + kw, wikiSearchUrl(kw));

  return out.slice(0, 4);
}

function pickKeyword(q) {
  const tags = (q.tags || []).filter(function (t) {
    return t && t.length > 2 && !['quelle', 'quel', 'comment', 'combien', 'pourquoi', 'vrai', 'faux', 'personnage'].includes(t);
  });
  if (tags.length) return tags[0];
  const m = /\b([A-Z][\w’'À-ÿ-]{2,})\b/.exec(q.text || '');
  return m ? m[1] : null;
}
