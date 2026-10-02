/**
 * QuizVerse — audit fonctionnel (outil de développement)
 *
 * Parcourt toutes les routes du site dans un navigateur et vérifie :
 *   • absence d'erreur JavaScript ;
 *   • présence d'un contenu réellement rendu (pas une page d'erreur) ;
 *   • absence de bouton mort (liens et boutons sans gestionnaire) ;
 *   • fichiers manquants (404).
 *
 * Utilisation : ouvrir le site puis ouvrir tools/dev/audit.html
 */

export const ROUTES = [
  ['/', 'Accueil'],
  ['/explorer', 'Explorer'],
  ['/explorer?tab=difficiles', 'Explorer · difficiles'],
  ['/explorer?tab=experts', 'Explorer · experts'],
  ['/explorer?tab=favoris', 'Explorer · favoris'],
  ['/explorer?tab=reprendre', 'Explorer · reprendre'],
  ['/explorer?tab=reco', 'Explorer · pour toi'],
  ['/categories', 'Catégories'],
  ['/categorie/animes', 'Catégorie · Animés'],
  ['/categorie/sports', 'Catégorie · Sports'],
  ['/univers/animes/dragonball', 'Univers · Dragon Ball'],
  ['/quiz/q-animes-dragonball-facile', 'Fiche quiz'],
  ['/quiz-du-jour', 'Quiz du jour'],
  ['/aleatoire', 'Quiz aléatoire'],
  ['/surprise', 'Surprends-moi'],
  ['/creer-mon-quiz', 'Créer mon quiz'],
  ['/creer-mon-quiz?preset=weak', 'Créer mon quiz · lacunes'],
  ['/mes-erreurs', 'Mes erreurs'],
  ['/mes-connaissances', 'Mes connaissances'],
  ['/profil', 'Mon profil'],
  ['/titres', 'Titres'],
  ['/statistiques', 'Statistiques'],
  ['/badges', 'Badges'],
  ['/defis', 'Défis'],
  ['/historique', 'Historique'],
  ['/favoris', 'Favoris'],
  ['/parametres', 'Paramètres'],
  ['/recherche?q=dragon', 'Recherche'],
  ['/aide', 'Aide'],
  ['/credits', 'Crédits'],
  ['/resultats', 'Résultats'],
  ['/route-inexistante', 'Page inconnue (attendu 404 interne)'],
];
