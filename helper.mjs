/**
 * QuizVerse — helper d'authoring (outil de développement uniquement)
 * Ce fichier n'est PAS chargé par le site. Il sert à fabriquer data/questions.json.
 */

/**
 * Q(cat, sub, diff, text, answers, correct, explanation, tags, opts)
 *
 * @param {string} cat        identifiant de catégorie (voir taxonomy.mjs)
 * @param {string} sub        identifiant de sous-catégorie (voir taxonomy.mjs)
 * @param {string} diff       'facile' | 'moyen' | 'difficile' | 'expert'
 * @param {string} text       énoncé de la question
 * @param {string[]} answers  liste des propositions (2 à 6)
 * @param {number|number[]} correct index (ou indexS) de la ou des bonnes réponses
 * @param {string} explanation explication affichée après la réponse
 * @param {string[]} tags     mots-clés (optionnel mais recommandé)
 * @param {object} opts       { type: 'qcm'|'vf'|'multi'|'guess'|'image', hint: '...', image: '🧠',
 *                              sources: ['Titre Wikipédia', 'https://...'] }
 *
 * `sources` : si tu fournis des sources explicites, elles s'afficheront après
 * la réponse (bonne ou mauvaise) en plus des sources automatiques.
 */
export function Q(cat, sub, diff, text, answers, correct, explanation, tags = [], opts = {}) {
  return { cat, sub, diff, text, answers, correct, explanation, tags, opts: opts || {} };
}

/** Vrai / Faux — answers = ['Vrai','Faux'] */
export function VF(cat, sub, diff, text, isTrue, explanation, tags = []) {
  return Q(cat, sub, diff, text, ['Vrai', 'Faux'], isTrue ? 0 : 1, explanation, tags, { type: 'vf' });
}

/** Plusieurs réponses — correct = tableau d'index */
export function MU(cat, sub, diff, text, answers, correctIdxs, explanation, tags = []) {
  return Q(cat, sub, diff, text, answers, correctIdxs, explanation, tags, { type: 'multi' });
}

/** Devine (personnage / film / série / joueur / anime) — la réponse est le nom du personnage */
export function GU(cat, sub, diff, clue, answers, correct, explanation, tags = [], hint = '') {
  return Q(cat, sub, diff, clue, answers, correct, explanation, tags, { type: 'guess', hint });
}
