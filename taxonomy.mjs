/**
 * QuizVerse — taxonomie de référence (outil de développement).
 * Ce fichier définit TOUTES les catégories et sous-catégories autorisées.
 * Toute question dont la catégorie ou la sous-catégorie n'est pas listée ici
 * sera rejetée par le validateur.
 */

export const DIFFICULTIES = ['facile', 'moyen', 'difficile', 'expert'];

export const TAXONOMY = {
  films: {
    label: 'Films & Séries',
    emoji: '\u{1F3AC}',
    color: '#f43f5e',
    subs: {
      hp: 'Harry Potter',
      marvel: 'Marvel',
      dc: 'DC Comics',
      starwars: 'Star Wars',
      disney: 'Disney',
      pixar: 'Pixar',
      netflix: 'Netflix',
      seriesfr: 'Séries françaises',
      seriesus: 'Séries américaines',
      cultes: 'Films cultes',
      animation: 'Films d\u2019animation',
      scifi: 'Science-Fiction',
      horreur: 'Horreur',
      action: 'Action',
      comedie: 'Comédie',
    },
  },
  animes: {
    label: 'Animés & Mangas',
    emoji: '\u{1F365}',
    color: '#f59e0b',
    subs: {
      dragonball: 'Dragon Ball',
      naruto: 'Naruto',
      onepiece: 'One Piece',
      bleach: 'Bleach',
      jujutsu: 'Jujutsu Kaisen',
      demonslayer: 'Demon Slayer',
      mha: 'My Hero Academia',
      hxh: 'Hunter x Hunter',
      aot: 'Attack on Titan',
      pokemon: 'Pokémon',
      deathnote: 'Death Note',
      sololeveling: 'Solo Leveling',
      opm: 'One Punch Man',
      chainsaw: 'Chainsaw Man',
      jojo: "JoJo's Bizarre Adventure",
    },
  },
  sports: {
    label: 'Sports',
    emoji: '\u26BD',
    color: '#22c55e',
    subs: {
      football: 'Football',
      ucl: 'Ligue des Champions',
      worldcup: 'Coupe du Monde',
      liga: 'Liga',
      premierleague: 'Premier League',
      nba: 'NBA',
      basketball: 'Basketball',
      f1: 'Formule 1',
      motogp: 'MotoGP',
      tennis: 'Tennis',
      ufc: 'UFC',
      boxe: 'Boxe',
      olympics: 'Jeux Olympiques',
    },
  },
  gaming: {
    label: 'Jeux Vidéo',
    emoji: '\u{1F3AE}',
    color: '#8b5cf6',
    subs: {
      minecraft: 'Minecraft',
      fortnite: 'Fortnite',
      gta: 'GTA',
      cod: 'Call of Duty',
      eafc: 'EA Sports FC',
      roblox: 'Roblox',
      nintendo: 'Nintendo',
      pokemongames: 'Jeux Pokémon',
      playstation: 'PlayStation',
      xbox: 'Xbox',
      pcgaming: 'PC Gaming',
      retro: 'Jeux rétro',
      indie: 'Jeux indépendants',
      competitive: 'Jeux compétitifs',
    },
  },
  culture: {
    label: 'Culture Générale',
    emoji: '\u{1F30D}',
    color: '#0ea5e9',
    subs: {
      histoire: 'Histoire',
      geographie: 'Géographie',
      capitales: 'Capitales du monde',
      drapeaux: 'Drapeaux',
      sciences: 'Sciences',
      technologie: 'Technologie',
      musique: 'Musique',
      cinema: 'Cinéma',
      litterature: 'Littérature',
      france: 'La France',
      monde: 'Le Monde',
      internet: 'Internet',
      espace: 'Espace',
      nature: 'Nature',
      inventions: 'Inventions',
    },
  },
  dessins: {
    label: 'Dessins Animés & Jeunesse',
    emoji: '\u{1F9F8}',
    color: '#ec4899',
    subs: {
      miraculous: 'Miraculous',
      peppa: 'Peppa Pig',
      arthur: 'Arthur',
      disneychannel: 'Disney Channel',
      titeuf: 'Titeuf',
      klass: 'Klass',
      cartoons: 'Cartoon classics',
    },
  },
  maths: {
    label: 'Maths & Logique',
    emoji: '\u{1F4A8}',
    color: '#14b8a6',
    subs: {
      calcul: 'Calcul',
      geometrie: 'Géométrie',
      probabilites: 'Probabilités',
      casse: 'Casse-tête',
      suites: 'Suites numériques',
      mathsculture: 'Culture maths',
    },
  },
  jeux: {
    label: 'Jeux de Société & Cartes',
    emoji: '\u{1F3B2}',
    color: '#eab308',
    subs: {
      monopoly: 'Monopoly',
      uno: 'UNO',
      scrabble: 'Scrabble',
      echecs: 'Échecs',
      cartes: 'Cartes à jouer',
      anciens: 'Jeux anciens',
      moderne: 'Jeux modernes',
    },
  },
  cuisine: {
    label: 'Cuisine & Gastronomie',
    emoji: '\u{1F355}',
    color: '#ef4444',
    subs: {
      cuisinefr: 'Cuisine française',
      cuisineit: 'Cuisine italienne',
      cuisinejp: 'Cuisine japonaise',
      cuisineus: 'Cuisine américaine',
      cuisineworld: 'Gastronomie mondiale',
      techniques: 'Techniques culinaires',
    },
  },
  francais: {
    label: 'Français & Langues',
    emoji: '\u270D\uFE0F',
    color: '#a855f7',
    subs: {
      grammaire: 'Grammaire',
      orthographe: 'Orthographe',
      classique: 'Littérature classique',
      etymologie: 'Étymologie',
      expressions: 'Expressions',
      langues: 'Langues du monde',
    },
  },
};

/** Liste à plat des (cat, sub) valides. */
export function flatSubs() {
  const out = [];
  for (const [cat, def] of Object.entries(TAXONOMY)) {
    for (const sub of Object.keys(def.subs)) out.push({ cat, sub, label: def.subs[sub] });
  }
  return out;
}
