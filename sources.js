/* ==========================================================================
   QuizVerse — sources documentaires
   --------------------------------------------------------------------------
   Chaque question reçoit automatiquement des sources cliquables, affichées
   après une bonne réponse ET après une mauvaise réponse, afin d'aider le
   joueur à comprendre et à vérifier.

   Principe : on n'invente jamais de référence.
     1. l'article de Wikipédia en français correspondant à l'univers ;
     2. une recherche Wikipédia sur le mot-clé principal de la question
        (fonctionne toujours, même si l'article dédié n'existe pas) ;
     3. les sources fournies à la main par l'auteur de la question.
   ========================================================================== */
(function (global) {
  'use strict';

  const QV = (global.QV = global.QV || {});

  /** Sous-catégorie -> article de Wikipédia en français. */
  const SUB_SOURCES = {
    // Films & Séries
    hp: 'Harry Potter', marvel: 'Marvel Comics', dc: 'DC Comics', starwars: 'Star Wars',
    disney: 'Disney', pixar: 'Pixar Animation Studios', netflix: 'Netflix',
    seriesfr: 'Télévision en France', seriesus: 'Séries télévisées américaines',
    cultes: 'Film culte', animation: "Film d'animation", scifi: 'Science-fiction',
    horreur: "Film d'horreur", action: "Film d'action", comedie: 'Film comique',

    // Animés & Mangas
    dragonball: 'Dragon Ball', naruto: 'Naruto', onepiece: 'One Piece', bleach: 'Bleach',
    jujutsu: 'Jujutsu Kaisen', demonslayer: 'Demon Slayer', mha: 'My Hero Academia',
    hxh: 'Hunter × Hunter', aot: "L'Attaque des titans", pokemon: 'Pokémon',
    deathnote: 'Death Note', sololeveling: 'Solo Leveling', opm: 'One Punch Man',
    chainsaw: 'Chainsaw Man', jojo: "JoJo's Bizarre Adventure",

    // Sports
    football: 'Football', ucl: "Ligue des champions de l'UEFA",
    worldcup: 'Coupe du monde de football', liga: "Championnat d'Espagne de football",
    premierleague: "Championnat d'Angleterre de football",
    nba: 'National Basketball Association', basketball: 'Basket-ball',
    f1: 'Formule 1', motogp: 'MotoGP', tennis: 'Tennis',
    ufc: 'Ultimate Fighting Championship', boxe: 'Boxe', olympics: 'Jeux olympiques',

    // Jeux Vidéo
    minecraft: 'Minecraft', fortnite: 'Fortnite', gta: 'Grand Theft Auto',
    cod: 'Call of Duty', eafc: 'FIFA (série de jeux vidéo)', roblox: 'Roblox',
    nintendo: 'Nintendo', pokemongames: 'Pokémon (série de jeux vidéo)',
    playstation: 'PlayStation', xbox: 'Xbox', pcgaming: 'Jeu vidéo sur PC',
    retro: 'Rétrogaming', indie: 'Jeu vidéo indépendant', competitive: 'Esport',

    // Culture Générale
    histoire: 'Histoire', geographie: 'Géographie', capitales: 'Capitale',
    drapeaux: 'Drapeau', sciences: 'Science', technologie: 'Technologie',
    musique: 'Musique', cinema: 'Cinéma', litterature: 'Littérature',
    france: 'France', monde: 'Monde', internet: 'Internet', espace: 'Espace',
    nature: 'Nature', inventions: 'Invention',

    // Dessins animés & jeunesse
    miraculous: 'Miraculous, les aventures de Ladybug et Chat Noir',
    peppa: 'Peppa Pig', arthur: "Arthur (série télévisée d'Arthur)",
    disneychannel: 'Disney Channel', titeuf: 'Titeuf (bande dessinée)',
    klass: 'Klass (série télévisée)', cartoons: 'Dessin animé',

    // Maths & Logique
    calcul: 'Calcul', geometrie: 'Géométrie', probabilites: 'Probabilité',
    casse: 'Casse-tête', suites: 'Suite numérique', mathsculture: 'Mathématiques',

    // Jeux de Société & Cartes
    monopoly: 'Monopoly (jeu)', uno: 'Uno (jeu)', scrabble: 'Scrabble',
    echecs: 'Échecs', cartes: 'Carte à jouer', anciens: 'Jeu de société',
    moderne: 'Jeu de société',

    // Cuisine
    cuisinefr: 'Cuisine française', cuisineit: 'Cuisine italienne',
    cuisinejp: 'Cuisine japonaise', cuisineus: 'Cuisine américaine',
    cuisineworld: 'Gastronomie', techniques: 'Technique de cuisine',

    // Français & Langues
    grammaire: 'Grammaire', orthographe: 'Orthographe',
    classique: 'Littérature française', etymologie: 'Étymologie',
    expressions: 'Expression figée', langues: 'Langue',
  };

  const WIKI = 'https://fr.wikipedia.org/wiki/';

  function wikiUrl(title) {
    return WIKI + encodeURIComponent(String(title).replace(/ /g, '_'));
  }

  function wikiSearchUrl(term) {
    return 'https://fr.wikipedia.org/w/index.php?search=' + encodeURIComponent(String(term))
      + '&title=Sp%C3%A9cial%3ARecherche&ns0=1';
  }

  const STOPWORDS = ['quelle', 'quel', 'quelles', 'quels', 'comment', 'combien', 'pourquoi',
    'vrai', 'faux', 'personnage', 'film', 'anime', 'serie', 'série', 'jeu', 'quelle est'];

  function pickKeyword(q) {
    const tags = (q.tags || []).filter(function (t) {
      return t && t.length > 2 && STOPWORDS.indexOf(t) < 0;
    });
    if (tags.length) return tags[0];
    const m = /\b([A-ZÀ-Ÿ][\w’'À-ÿ-]{2,})\b/.exec(q.text || '');
    return m ? m[1] : null;
  }

  /**
   * Construit la liste de sources d'une question.
   * @param {object} q question normalisée (tags, sub, text)
   * @param {string} subLabel libellé lisible de la sous-catégorie
   * @param {Array}  [custom] sources fournies par l'auteur
   */
  function buildSources(q, subLabel, custom) {
    const out = [];
    const seen = {};
    function add(label, url) {
      if (!url || seen[url]) return;
      seen[url] = 1;
      out.push({ label: label, url: url });
    }

    (Array.isArray(custom) ? custom : []).forEach(function (s) {
      if (typeof s === 'string') {
        if (/^https?:\/\//i.test(s)) add(s, s);
        else add('Wikipédia — ' + s, wikiUrl(s));
      } else if (s && s.url) {
        add(s.label || s.url, s.url);
      }
    });

    const article = SUB_SOURCES[q.sub];
    if (article) add('Wikipédia — ' + article, wikiUrl(article));
    else if (subLabel) add('Wikipédia — ' + subLabel, wikiUrl(subLabel));

    // Recherche de approfondissement : seulement si elle apporte quelque chose
    // de nouveau par rapport à l'article ci-dessus.
    const kw = pickKeyword(q);
    if (kw) {
      const nk = norm(kw);
      const already = norm(article || subLabel || '');
      const covered = !!already && (already.indexOf(nk) >= 0 || nk.indexOf(already) >= 0);
      if (!covered) add('Wikipédia — « ' + kw + ' »', wikiSearchUrl(kw));
    }

    return out.slice(0, 4);
  }

  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  }

  QV.sources = {
    SUB_SOURCES: SUB_SOURCES,
    buildSources: buildSources,
    wikiUrl: wikiUrl,
    wikiSearchUrl: wikiSearchUrl,
  };
})(window);
