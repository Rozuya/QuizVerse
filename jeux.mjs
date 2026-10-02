import { Q, VF, MU, GU } from '../helper.mjs';

export default [
  // ---------------------------------------------------------------- MONOPOLY (18)
  Q('jeux', 'monopoly', 'facile', 'Combien de cases comporte le plateau classique du Monopoly ?', ['40', '32', '60', '100'], 0,
    'Le plateau classique du Monopoly est un carré de 40 cases.', ['monopoly', 'plateau', 'cases']),

  Q('jeux', 'monopoly', 'facile', 'Qui a inventé le jeu dont le Monopoly est une adaptation ?', ['Elizabeth Magie', 'Charles Darrow', 'Waddingtons', 'Parker Brothers'], 0,
    "Elizabeth Magie inventa en 1904 The Landlord's Game, dont le Monopoly dérive.", ['monopoly', 'inventeur', 'histoire']),

  Q('jeux', 'monopoly', 'facile', 'Combien d\'argent reçoit un joueur qui passe par la case Départ ?', ['200 M$', '100 M$', '150 M$', '50 M$'], 0,
    'Passer par la case Départ rapporte 200 M$ au joueur qui y passe.', ['monopoly', 'depart', 'argent']),

  Q('jeux', 'monopoly', 'moyen', 'Que faut-il avoir pour bâtir un hôtel sur un groupe de Pandemic ?', ['Une maison sur chaque terrain du groupe', 'Deux maisons sur un seul terrain', 'Une carte Chance', 'Rien, c\'est automatique'], 0,
    'Il faut posseder tous les terrains d\'une couleur et y batir une maison chacun.', ['monopoly', 'construction', 'hotel']),

  Q('jeux', 'monopoly', 'moyen', 'Combien de tours doit faire un joueur en prison avant d\'être libéré par les dés ?', ['Trois', 'Un', 'Cinq', 'Dix'], 0,
    'Le jeton de prison autorise trois tentatives avec les dés avant de payer pour sortir.', ['monopoly', 'prison', 'regle']),

  Q('jeux', 'monopoly', 'moyen', 'Que se passe-t-il si un joueur tombe sur la case Simple visite de la prison ?', ['Il lance les dés et avance', 'Il paie une amende de 50 M$', 'Il reste en prison', 'Il double sa fortune'], 0,
    'La case prison sert aussi de simple visite : le joueur lance les dés et avance normalement.', ['monopoly', 'prison', 'regle']),

  MU('jeux', 'monopoly', 'moyen', 'Coche les affirmations exactes au sujet du plateau de Monopoly.',
    ['La case Départ verse 200 M$ à chaque passage.', 'Il existe des cases de prison sur le plateau.',
      'Les cartes Caisse de communauté existent.', 'Le loyer des gares est un montant fixe.'], [0, 1, 2],
    'Le loyer des gares double à chaque gare possédée : il n\'est donc pas fixe.', ['monopoly', 'plateau', 'case']),

  Q('jeux', 'monopoly', 'difficile', 'En quelle année Charles Brace Darrow a-t-il mis au point la version moderne du Monopoly ?', ['1935', '1904', '1929', '1948'], 0,
    'Charles Brace Darrow adapte le jeu de Magie en 1935, en y ajoutant les cases Départ et Prison.', ['monopoly', 'histoire', 'darrow']),

  Q('jeux', 'monopoly', 'difficile', 'Que doit faire un joueur qui ne peut plus payer ses dettes ?', ['Louer ou hypothéquer ses biens', 'Passer son tour', 'Être éliminé définitivement', 'Recevoir un prêt du banquier'], 0,
    'En cas de faillite, le joueurvend ses biens au banquier avant de sortir de la partie.', ['monopoly', 'faillite', 'dette']),

  VF('jeux', 'monopoly', 'facile', 'Le Monopoly est né d\'un jeu qui s\'appelait The Landlord\'s Game.', true,
    'The Landlord\'s Game d\'Elizabeth Magie précède de plusieurs décennies le Monopoly moderne.', ['monopoly', 'origine', 'histoire']),

  VF('jeux', 'monopoly', 'facile', 'Obtenir trois doubles consécutifs envoie le joueur directement en prison.', true,
    'La règle des trois doubles consécutifs est l\'une des plus célèbres du Monopoly.', ['monopoly', 'regle', 'prison']),

  VF('jeux', 'monopoly', 'facile', 'On peut bâtir des maisons sur les cases des gares.', false,
    'Il est interdit de construire quoi que ce soit sur les gares, les ports et les aéroports.', ['monopoly', 'gare', 'construction']),

  VF('jeux', 'monopoly', 'facile', 'Le Monopoly classique se joue de deux à six joueurs.', true,
    'La boîte indique une partie de deux à six joueurs, ce qui permet toutes les configurations.', ['monopoly', 'joueurs', 'regle']),

  VF('jeux', 'monopoly', 'difficile', 'Les joueurs ont le droit d\'échanger leurs propriétés entre eux.', true,
    'Les échanges sont autorisés tant que les deux joueurs-detiennentessus des biens correspondants.', ['monopoly', 'echange', 'regle']),

  VF('jeux', 'monopoly', 'difficile', 'Le plateau classique du Monopoly comporte 40 cases.', true,
    'Le tour complet compte 40 cases, dont la case Départ et la case Prison.', ['monopoly', 'plateau', 'cases']),

  MU('jeux', 'monopoly', 'moyen', 'Coche les règles du Monopoly.',
    ['Trois doubles consécutifs envoient en prison.', 'Un double permet de rejouer.', 'On peut bâtir des maisons sur une gare.', 'La case Départ rapporte 200 M$'], [0, 1, 3],
    'On rejoue après un double, mais aucune construction n\'est possible sur les gares.', ['monopoly', 'regle', 'prison']),

  MU('jeux', 'monopoly', 'difficile', 'Coche les affirmations exactes au sujet du Monopoly.',
    ['Le jeu vient d\'un jeu d\'Elizabeth Magie.', 'Le plateau a 40 cases.', 'Les hotels remplacent les maisons.',
      'La compagnie des chemins de fer possède des gares colorées.'], [0, 1, 2, 3],
    'Le jeu derive bien de The Landlord\'s Game, a 40 cases, des hôtels et des gares colorées.', ['monopoly', 'regle', 'plateau']),

  GU('jeux', 'monopoly', 'moyen', 'Devine le jeu : jeu de plateau mondial où l\'on achète des villes pour en tirer un loyer.',
    ['Le Monopoly', 'Le Uno', 'Le Cluedo', 'Le Risk'], 0,
    'Créé dans les années 1930, le Monopoly est le jeu de Immobilier le plus vendu au monde.', ['monopoly', 'plateau', 'devine'], 'Sa case Départ vaut 200 M$.'),

  // ---------------------------------------------------------------- UNO (16)
  Q('jeux', 'uno', 'facile', 'Combien de cartes contient un jeu UNO classique ?', ['108', '54', '100', '120'], 0,
    'Le jeu classique compte 100 cartes de couleur et 8 jokers, soit 108 cartes.', ['uno', 'cartes', 'jeu']),

  Q('jeux', 'uno', 'facile', 'Combien de couleurs différentes possède un jeu UNO ?', ['4', '3', '5', '6'], 0,
    'Les quatre couleurs sont le jaune, le rouge, le vert et le bleu.', ['uno', 'couleurs', 'cartes']),

  Q('jeux', 'uno', 'facile', 'Combien de cartes reçoit chaque joueur au début de la partie ?', ['7', '5', '10', '3'], 0,
    'Chaque joueur reçoit sept cartes, puis le premier joueur en tire deux.', ['uno', 'cartes', 'regle']),

  Q('jeux', 'uno', 'expert', 'En quelle année le jeu UNO a-t-il été créé ?', ['1971', '1985', '1963', '1992'], 0,
    'UNO a été inventé en 1971 par l\'Américain Merle Robbins.', ['uno', 'histoire', 'creation']),

  Q('jeux', 'uno', 'facile', 'Comment s\'appelle la carte qui permet de changer de couleur ?', ['Le joker', 'La carte passe', 'L\'inverseur', 'La carte plus deux'], 0,
    'Le joker, appelé changement de couleur, permet de choisir n\'importe quelle couleur.', ['uno', 'joker', 'regle']),

  Q('jeux', 'uno', 'facile', 'Que fait la carte Puiser deux ?', ['L\'adversaire tire deux cartes et passe son tour', 'Elle change la couleur', 'Elle inverse le jeu', 'Elle permet de jouer deux fois'], 0,
    'La carte Puiser deux oblige le joueur suivant à prendre deux cartes et à passer.', ['uno', 'action', 'pioche']),

  Q('jeux', 'uno', 'facile', 'Quand doit-on annoncer UNO ?', ['Quand il ne reste qu\'une carte en main', 'Au début de chaque tour', 'À chaque pioche', 'Uniquement en fin de partie'], 0,
    'Il faut annoncer UNO au moment où l\'on pose son avant-dernière carte.', ['uno', 'regle', 'annonce']),

  MU('jeux', 'uno', 'moyen', 'Coche les règles de pioche au jeu UNO.',
    ['Si aucune carte ne peut être jouée, on pioche une carte.', 'Le joueur qui ne peut rien jouer passe son tour.',
      'On pioche deux cartes quand on n\'a plus de lettre en main.', 'On repioche autant de fois que nécessaire.'], [0, 1],
    'Une seule carte se pioche quand rien n\'est jouable, sinon le tour passe normalement.', ['uno', 'pioche', 'regle']),

  Q('jeux', 'uno', 'expert', 'Quelle entreprise a racheté les droits du jeu UNO ?', ['Mattel', 'Hasbro', 'Winning Moves', 'Ravensburger'], 0,
    'Mattel a acquis les droits du jeu UNO en 1992 auprès de la famille Robbins.', ['uno', 'mattel', 'histoire']),

  VF('jeux', 'uno', 'facile', 'Le jeu UNO a été créé par Merle Robbins.', true,
    'Merle Robbins, enseignant américain, a inventé UNO en 1971 à Las Vegas.', ['uno', 'createur', 'robbins']),

  VF('jeux', 'uno', 'facile', 'Le premier joueur doit piocher deux cartes au début de la partie.', true,
    'Après la distribution de sept cartes, le premier joueur en pioche deux.', ['uno', 'regle', 'pioche']),

  VF('jeux', 'uno', 'facile', 'On ne peut jouer une carte que sur une couleur ou une valeur identique.', true,
    'Les cartes de couleur ne se posent que sur la même couleur ou le même nombre.', ['uno', 'regle', 'couleur']),

  VF('jeux', 'uno', 'facile', 'Le jeu UNO a été inventé aux États-Unis.', true,
    'UNO est né en 1971 aux États-Unis avant d\'être commercialisé dans le monde entier.', ['uno', 'origine', 'histoire']),

  VF('jeux', 'uno', 'difficile', 'Une partie d\'UNO se joue avec les quatre couleurs jaune, rouge, vert et bleu.', true,
    'Chaque couleur est représentée par un jeu de cartes numérotées et d\'actions.', ['uno', 'couleurs', 'regle']),

  MU('jeux', 'uno', 'moyen', 'Coche les règles d\'UNO.',
    ['Chaque joueur reçoit sept cartes.', 'Le joker change la couleur.', 'Trois doubles envoient en prison.',
      'La carte Puiser deux fait piocher deux cartes à l\'adversaire.'], [0, 1, 3],
    'La règle des trois doubles appartient au Monopoly et non au jeu UNO.', ['uno', 'regle', 'cartes']),

  GU('jeux', 'uno', 'moyen', 'Devine le jeu : jeu de cartes américain né en 1971 fondé sur les couleurs et les nombres.',
    ['UNO', 'Le Skip', 'Le Dobble', 'Jungle Speed'], 0,
    'UNO reste fidèle à son nom, une syllabe qui rappelle le un et la zeugma.', ['uno', 'cartes', 'devine'], 'On y crie UNO à la fin.'),

  // ---------------------------------------------------------------- SCRABBLE (18)
  Q('jeux', 'scrabble', 'facile', 'Combien de jetons contient un jeu de Scrabble ?', ['102', '100', '120', '90'], 0,
    'Le jeu complet comprend 102 jetons de lettres, sans joker.', ['scrabble', 'jeton', 'jeu']),

  Q('jeux', 'scrabble', 'facile', 'Quelle valeur ont les lettres K, Q, W, X, Y et Z ?', ['10 points', '8 points', '5 points', '1 point'], 0,
    "Ces six lettres sont les plus VALABLES du Scrabble français, à dix points chacune.", ['scrabble', 'lettre', 'valeur']),

  Q('jeux', 'scrabble', 'facile', 'Que gagne-t-on en posant une lettre sur une case bleue ?', ['Le double de la lettre', 'Le triple de la lettre', 'Le double du mot entier', 'Rien de particulier'], 0,
    'Les cases bleues doublent la valeur de la lettre qui y est posée.', ['scrabble', 'case bleue', 'double']),

  VF('jeux', 'scrabble', 'facile', 'La case centrale du damier vaut un double mot.', true,
    'La case rose centrale compte double pour chaque mot qui la traverse.', ['scrabble', 'damier', 'double mot']),

  Q('jeux', 'scrabble', 'facile', 'Combien de cases compte le damier du Scrabble ?', ['225', '144', '256', '100'], 0,
    'Le damier est carré et mesure 15 cases sur 15, soit 225 cases.', ['scrabble', 'damier', 'case']),

  Q('jeux', 'scrabble', 'facile', 'Quelle valeur vaut la lettre J dans le Scrabble français ?', ['8 points', '10 points', '4 points', '1 point'], 0,
    'Le J est l\'une des rares lettres à huit points.', ['scrabble', 'lettre', 'valeur']),

  Q('jeux', 'scrabble', 'facile', 'Que rapporte une case rouge du damier ?', ['Le triple de la lettre', 'Le double de la lettre', 'Le double du mot entier', 'Le quadruple du mot entier'], 0,
    'Les cases rouges sont les cases de triple lettre.', ['scrabble', 'case rouge', 'triple']),

  Q('jeux', 'scrabble', 'moyen', 'Que gagne-t-on en posant un mot entier sur une case de double mot ?', ['Le double de tous les points du mot', 'Le triple de tous les points', 'Rien, c\'est décoratif', 'Une lettre gratuite'], 0,
    'Les cases de double mot multiplient le score total du mot par deux.', ['scrabble', 'double mot', 'score']),

  Q('jeux', 'scrabble', 'moyen', 'Que fait un joueur quand il n\'a plus de lettre en main ?', ['Il échange une lettre contre une autre tirée au hasard', 'Il pioche autant de lettres qu\'il veut', 'Il passe son tour', 'Il abandonne la partie'], 0,
    'Chaque échange se fait en reposant une lettre et en tirant une au hasard.', ['scrabble', 'echange', 'regle']),

  Q('jeux', 'scrabble', 'difficile', 'Quel est le nombre maximal de lettres que peut compter un mot posé sur le damier ?', ['15', '14', '16', '17'], 0,
    'Un mot peut parcourir toute la longueur du damier, soit 15 lettres.', ['scrabble', 'damier', 'mot']),

  MU('jeux', 'scrabble', 'difficile', 'Coche les calculs de score exacts au Scrabble.',
    ['Un mot de 10 points posé sur un double mot vaut 20 points.',
      'Une lettre de 2 points posée sur une case rouge vaut 6 points.',
      'Une lettre de 2 points posée sur une case bleue vaut 2 points.',
      'Un mot de 10 points posé sur une case rouge vaut 20 points.'], [0, 1],
    'La case rouge triple seulement la lettre : un mot entier n\'y est pas multiplié.', ['scrabble', 'score', 'case']),

  Q('jeux', 'scrabble', 'difficile', 'Valant 10 points au total, combien vaut un mot posé sur une case de double mot ?', ['20 points', '30 points', '15 points', '10 points'], 0,
    'Un mot de 10 points posé sur un double mot rapporte 20 points.', ['scrabble', 'double mot', 'score']),

  Q('jeux', 'scrabble', 'expert', 'Les lettres D, G et J se prononcent de la même façon que quelles lettres ?', ['F, K et S', 'T, V et Z', 'B, P et M', 'N, R et L'], 0,
    'En français, le D, le G et le J gardent leur valeur phonétique normale.', ['scrabble', 'lettre', 'prononciation']),

  VF('jeux', 'scrabble', 'facile', 'Dans le Scrabble français, il n\'y a pas de joker.', true,
    'La version française du Scrabble se joue avec 102 lettres sans case vide.', ['scrabble', 'joker', 'regle']),

  VF('jeux', 'scrabble', 'facile', 'Un mot doit être posé de gauche à droite ou de haut en bas.', true,
    'On ne peut poser un mot ni en diagonale ni à l\'envers.', ['scrabble', 'regle', 'orientation']),

  VF('jeux', 'scrabble', 'expert', 'Dans le Scrabble français, on peut poser une lettre sur une lettre déjà jouée.', false,
    'La version française interdit formellement de recouvrir une lettre déjà placée.', ['scrabble', 'regle', 'lettre']),

  MU('jeux', 'scrabble', 'moyen', 'Coche les règles du Scrabble.',
    ['Le damier compte 225 cases.', 'Les cases rouges triplent la lettre.', 'Le J vaut 8 points.',
      'On peut poser un mot en diagonale.'], [0, 1, 2],
    'Les mots se posent uniquement horizontalement ou verticalement, jamais en diagonale.', ['scrabble', 'regle', 'damier']),

  GU('jeux', 'scrabble', 'moyen', 'Devine le jeu : jeu de lettres sur damier où l\'on compose des mots pour marquer des points.',
    ['Le Scrabble', 'Le Boggle', 'Le Motus', 'Le Blokus'], 0,
    'Le Scrabble repose sur un damier, des jetons de lettres et un lexique imposé.', ['scrabble', 'lettres', 'devine'], 'Sa case centrale vaut double mot.'),

  // ---------------------------------------------------------------- ECHECS (22)
  Q('jeux', 'echecs', 'facile', 'Combien de cases comporte l\'échiquier ?', ['64', '36', '100', '48'], 0,
    'L\'échiquier est un carré de 8 cases sur 8, soit 64 cases.', ['echecs', 'plateau', 'case']),

  Q('jeux', 'echecs', 'facile', 'Combien de pions chaque joueur possède-t-il au départ ?', ['8', '16', '6', '10'], 0,
    'Chaque camp démarre avec huit pions placés sur la deuxième rangée.', ['echecs', 'pion', 'piece']),

  Q('jeux', 'echecs', 'facile', 'Quelle est la seule pièce qui ne se déplace qu\'en diagonale ?', ['Le fou', 'La tour', 'Le cavalier', 'La dame'], 0,
    'Le fou glisse en diagonale et ne change jamais de couleur de case.', ['echecs', 'fou', 'piece']),

  Q('jeux', 'echecs', 'facile', 'Quelle est la pièce la plus puissante aux échecs ?', ['La dame', 'La tour', 'Le roi', 'Le cavalier'], 0,
    'La dame se déplace dans toutes les directions, comme la tour et le fou réunis.', ['echecs', 'dame', 'piece']),

  Q('jeux', 'echecs', 'moyen', 'Comment s\'appelle le déplacement qui consiste à mettre le roi à l\'abri derrière la tour ?', ['Le petit roque', 'Le grand roque', 'Le fou', 'La promotion'], 0,
    'Le petit roque est permis si le roi et la tour n\'ont jamais été bougés.', ['echecs', 'roque', 'regle']),

  Q('jeux', 'echecs', 'facile', 'Sur quelle case un cavalier peut-il se déplacer ?', ['Deux cases en L', 'Trois cases en ligne droite', 'Cinq cases en diagonale', 'N\'importe laquelle'], 0,
    'Le cavalier se déplace d\'une case en ligne et de deux en colonne, en forme de L.', ['echecs', 'cavalier', 'deplacement']),

  MU('jeux', 'echecs', 'moyen', 'Coche les déplacements du cavalier.',
    ['Le cavalier se déplace en forme de L.', 'Le cavalier atteint au plus huit cases.',
      'Le cavalier peut se déplacer de trois cases en ligne droite.', 'Le cavalier change de couleur à chaque coup.'], [0, 1],
    'Le cavalier ne se déplace ni en ligne droite de trois cases ni en diagonale.', ['echecs', 'cavalier', 'deplacement']),

  Q('jeux', 'echecs', 'moyen', 'Comment s\'appelle la situation où le roi est attaqué sans qu\'aucune pièce ne puisse le défendre ?', ['L\'échec et mat', 'Le pat', 'La nulle', 'La promotion'], 0,
    'L\'échec et mat met fin à la partie : le joueur qui subit le mat a perdu.', ['echecs', 'echec et mat', 'partie']),

  Q('jeux', 'echecs', 'moyen', 'Quelle est la définition exacte du pat ?', ['Le roi n\'est plus en échec mais n\'a aucun coup légal', 'Le roi est capturé', 'Un cavalier vient d\'être promu', 'Le roi passe son tour'], 0,
    'Au pat, le joueur doit passer son tour et la partie est alors nulle.', ['echecs', 'pat', 'regle']),

  Q('jeux', 'echecs', 'difficile', 'Combien vaut un pion dans l\'évaluation d\'un pion en promotion ?', ['3 points', '1 point', '5 points', '10 points'], 0,
    'Le cavalier, la tour et la dame valent environ trois pions de progression.', ['echecs', 'pion', 'evaluation']),

  Q('jeux', 'echecs', 'difficile', 'Que devient un pion qui atteint la dernière rangée ?', ['Il se transforme en une autre pièce', 'Il reste un pion', 'Il disparaît de l\'échiquier', 'Il recule d\'une case'], 0,
    'La promotion est obligatoire : le pion devient dame, tour, fou ou cavalier.', ['echecs', 'promotion', 'pion']),

  Q('jeux', 'echecs', 'difficile', 'Combien de fous doit-il rester à un joueur pour avoir le droit de roquer ?', ['Les deux fous', 'Un seul fou', 'Les deux tours', 'Le nombre n\'importe pas'], 0,
    'Le roque exige que roi et tour n\'aient jamais bougé et que les cases soient libres.', ['echecs', 'roque', 'fou']),

  Q('jeux', 'echecs', 'difficile', 'Que signifie la notation 0-1 au bas d\'une grille d\'échecs ?', ['Les noirs ont gagné', 'Les blancs ont gagné', 'La partie est nulle', 'La partie est interrompue'], 0,
    'Le score s\'écrit avec le nombre du joueur gagnant en premier : 1-0 pour les blancs, 0-1 pour les noirs.', ['echecs', 'notation', 'score']),

  Q('jeux', 'echecs', 'expert', 'En combien de coups au minimum peut-on mater depuis la position initiale ?', ['2', '3', '4', '5'], 0,
    'Aucun mat n\'est possible en un coup : le plus rapide est un mat en deux coups.', ['echecs', 'mat', 'strategie']),

  Q('jeux', 'echecs', 'expert', 'Combien de positions différentes sont possibles selon les comptages classiques ?', ['Environ 10 puissance 44', 'Environ 10 puissance 20', 'Environ 10 puissance 100', 'Environ 10 puissance 12'], 0,
    'Shannon a estimé à 10 puissance 44 le nombre de positions possibles du jeu.', ['echecs', 'combinatoire', 'positions']),

  VF('jeux', 'echecs', 'facile', 'Chaque joueur possède deux tours, deux fous, deux cavaliers, un roi et une dame.', true,
    'Chaque camp compte seize pièces : huit pions et huit pièces de valeur.', ['echecs', 'piece', 'debut']),

  VF('jeux', 'echecs', 'moyen', 'Le roi peut être mis en échec par l\'adversaire, qui doit ensuite y répondre.', true,
    'Mettre en échec est permis ; seul le roi mis en échec doit être protégé.', ['echecs', 'echec', 'regle']),

  VF('jeux', 'echecs', 'facile', 'La dame se déplace d\'une case en diagonale exactement comme le fou.', true,
    'Comme le fou, la dame se déplace autant de cases qu\'elle veut en diagonale.', ['echecs', 'dame', 'deplacement']),

  VF('jeux', 'echecs', 'expert', 'Un coup qui expose son propre roi à l\'échec est interdit.', true,
    'Cette interdiction définit précisément la légalité d\'un coup aux échecs.', ['echecs', 'regle', 'legitimite']),

  MU('jeux', 'echecs', 'moyen', 'Coche les règles des échecs.',
    ['Un coup légal ne peut pas exposer son roi.', 'La tour se déplace en ligne droite.', 'Le pion se déplace en diagonale.',
      'Le fou change de couleur de case lorsqu\'il se déplace.'], [0, 1],
    'Le pion avance tout droit et le fou reste toujours sur la même couleur de case.', ['echecs', 'regle', 'deplacement']),

  MU('jeux', 'echecs', 'difficile', 'Coche les affirmations exactes au sujet des fins de partie.',
    ['Le pat est un résultat nul.', 'L\'échec et mat termine la partie.', 'Un roi capturé peut être sauvé.',
      'La tour est plus forte que la dame.'], [0, 1],
    'Un roi en échec et mat est perdu définitivement et la dame vaut plus que la tour.', ['echecs', 'fin de partie', 'mat']),

  GU('jeux', 'echecs', 'moyen', 'Devine le jeu : jeu de stratégie sur un damier de 64 cases avec seize pièces de chaque côté.',
    ['Les échecs', 'Les dames', 'Le Go', 'Le Othello'], 0,
    'Les échecs se jouent à deux sur un damier de huit cases sur huit.', ['echecs', 'echiquier', 'devine'], 'Deux rois et deux dames sont en jeu.'),

  // ---------------------------------------------------------------- CARTES A JOUER (16)
  Q('jeux', 'cartes', 'facile', 'Combien de cartes contient un jeu français avec ses deux jokers ?', ['54', '52', '56', '48'], 0,
    'Le jeu français compte 52 cartes plus deux jokers, soit 54 cartes.', ['cartes', 'jeu', 'nombre']),

  Q('jeux', 'cartes', 'facile', 'Combien de cartes contient une famille de cartes ?', ['13', '12', '14', '10'], 0,
    'Une famille réunit l\'as plus les quatre figures plus neuf cartes de deux à dix.', ['cartes', 'famille', 'nombre']),

  Q('jeux', 'cartes', 'moyen', 'Combien de cartes compte le tarot de Marseille ?', ['78', '56', '72', '52'], 0,
    'Le tarot de Marseille compte 78 cartes, dont 22 arcanes majeurs.', ['cartes', 'tarot', 'nombre']),

  Q('jeux', 'cartes', 'facile', 'Combien d\'arcanes majeurs compte le tarot ?', ['22', '21', '23', '28'], 0,
    'Les arcanes majeurs vont de 0 à XXI, soit 22 cartes.', ['cartes', 'tarot', 'arcane']),

  Q('jeux', 'cartes', 'moyen', 'Combien de cartes component le commun au poker ?', ['5', '2', '7', '1'], 0,
    'Au poker, cinq cartes sont communes et chacun reçoit deux cartes privées.', ['cartes', 'poker', 'commun']),

  Q('jeux', 'cartes', 'moyen', 'Comment appelle-t-on les deux cartes que le joueur garde pour lui au poker ?', ['Les cartes privées', 'Les cartes communes', 'Le communal', 'Les cartes de banque'], 0,
    'Chacun possède deux cartes cachées, les autres étant posées au centre de la table.', ['cartes', 'poker', 'carte privee']),

  MU('jeux', 'cartes', 'moyen', 'Coche les combinaisons exactes au poker.',
    ['La quinte flush est la plus forte combinaison.', 'Le carré vient juste après la quinte flush.',
      'La couleur vaut plus que la quinte flush.', 'Le full associe trois cartes et une paire.'], [0, 1, 3],
    'La couleur vient après le carré et bien avant la quinte flush.', ['cartes', 'poker', 'combinaison']),

  Q('jeux', 'cartes', 'facile', 'Combien de cartes contient le jeu utilisé à la belote ?', ['32', '52', '78', '36'], 0,
    'La belote se joue avec un jeu de 32 cartes, du sept au as.', ['cartes', 'belote', 'jeu']),

  Q('jeux', 'cartes', 'moyen', 'Comment appelle-t-on les cartes restantes après la distribution aux quatre joueurs ?', ['Le talon', 'La donne', 'La manche', 'Le rebut'], 0,
    'Le talon est le paquet de cartes qui reste au centre de la table.', ['cartes', 'talon', 'distribution']),

  Q('jeux', 'cartes', 'difficile', 'Quel est le nom de la carte de tarot représentant la balance ?', ['La Justice', 'La Force', 'La Tempérance', 'Le Monde'], 0,
    'L\'arcane majeur de la Justice figure une femme tenant une balance.', ['cartes', 'tarot', 'justice']),

  VF('jeux', 'cartes', 'facile', 'Un jeu français comprend quatre familles : cœur, carreau, pique et trèfle.', true,
    'Ces quatre familles sont communes à la plupart des jeux de cartes français.', ['cartes', 'famille', 'jeu']),

  VF('jeux', 'cartes', 'facile', 'La couleur, au poker, réunit cinq cartes de même couleur, quel que soit le rang.', true,
    'C\'est précisément la définition de la couleur au poker.', ['cartes', 'poker', 'couleur']),

  VF('jeux', 'cartes', 'moyen', 'Le tarot de Marseille comporte quatre familles de 56 cartes.', true,
    'Les quatre familles, appelées pique, cœur, coupe et denier, totalisent 56 cartes.', ['cartes', 'tarot', 'famille']),

  VF('jeux', 'cartes', 'difficile', 'À la belote, chaque joueur reçoit huit cartes.', true,
    'Un joueur garde huit cartes en main et joue avec les quatre restantes.', ['cartes', 'belote', 'cartes']),

  MU('jeux', 'cartes', 'moyen', 'Coche les affirmations exactes au sujet des cartes à jouer.',
    ['Un jeu français compte 52 cartes.', 'Le poker utilise cinq cartes communes.', 'Le tarot compte 78 cartes.',
      'La belote se joue avec un jeu de 32 cartes.'], [0, 1, 2, 3],
    'Ces quatre faits sont exacts et concernent les jeux de cartes traditionnels.', ['cartes', 'poker', 'tarot']),

  GU('jeux', 'cartes', 'moyen', 'Devine le jeu : jeu de 78 cartes utilisé en divination, composé de 22 arcanes majeurs et de quatre familles.',
    ['Le tarot', 'La belote', 'Le piquet', 'Le crib'], 0,
    'Le tarot se reconnaît à ses 22 arcanes majeurs, du Fou à Le Monde.', ['cartes', 'tarot', 'devine'], 'On y compte les familles coupe, denier, épée et bâton.'),

  // ---------------------------------------------------------------- JEUX ANCIENS (12)
  Q('jeux', 'anciens', 'facile', 'Combien de cartes utilise le jeu de 500 ?', ['32', '52', '40', '78'], 0,
    'Le jeu de 500 se joue avec un jeu de 32 cartes, du sept au as.', ['anciens', '500', 'cartes']),

  Q('jeux', 'anciens', 'expert', 'Quel jeu américain de 1883 se joue sur un damier de 64 cases ?', ['Le Reversi', 'Les Dames', 'Le Backgammon', 'Le Go'], 0,
    'Inventé en 1883, le Reversi se joue avec des pons à deux faces et se retourne.', ['anciens', 'reversi', 'damier']),

  Q('jeux', 'anciens', 'moyen', 'Quel est le nom des pièces rondes utilisées au backgammon ?', ['Les dames', 'Les pions coniques', 'Les dés', 'Les cartes'], 0,
    'Au backgammon, chaque joueur possède quinze dames et deux dés.', ['anciens', 'backgammon', 'piece']),

  Q('jeux', 'anciens', 'moyen', 'Sur quelle cible se joue le jeu de fléchettes traditionnel ?', ['Une cible à vingt secteurs', 'Un terrain de football', 'Un ring', 'Une table de billard'], 0,
    'La cible de fléchettes est divisée en vingt secteurs concentriques numérotés de 1 à 20.', ['anciens', 'flechettes', 'cible']),

  Q('jeux', 'anciens', 'facile', 'Quel sport consiste à glisser des pierres sur une glace pour marquer des buts ?', ['Le curling', 'Le hockey sur glace', 'La rink hockey', 'Le patinage artistique'], 0,
    'Le curling oppose deux équipes de quatre joueurs qui placent des pierres de granit.', ['anciens', 'curling', 'sport']),

  Q('jeux', 'anciens', 'difficile', 'De quel continent provient le jeu de mancala ?', ['L\'Afrique', 'L\'Asie', 'L\'Europe', 'L\'Amérique'], 0,
    'Les jeux de mancala se pratiquent dans toute l\'Afrique depuis des siècles.', ['anciens', 'mancala', 'origine']),

  Q('jeux', 'anciens', 'difficile', 'Dans quel pays ancien a-t-on retrouvé des représentations du senet ?', ['En Égypte', 'En Grèce', 'À Rome', 'En Perse'], 0,
    'Le senet figure sur plusieurs tombes et figurines de l\'Égypte antique.', ['anciens', 'senet', 'egypte']),

  Q('jeux', 'anciens', 'difficile', 'Sur combien de lignes se joue une partie de go au Japon ?', ['19', '13', '15', '9'], 0,
    'Le goban japonais mesure dix-neuf lignes de côté.', ['anciens', 'go', 'goban']),

  Q('jeux', 'anciens', 'expert', 'Au Reversi, combien de pions chaque joueur possède-t-il au départ ?', ['4', '2', '8', '12'], 0,
    'Quatre pions sont placés au centre du damier, deux de chaque couleur.', ['anciens', 'reversi', 'pion']),

  VF('jeux', 'anciens', 'moyen', 'Les boules du jeu provençal sont en cuir, contrairement à celles de la pétanque.', true,
    'La pétanque se joue avec des boules d\'acier, le provençal avec des boules de cuir.', ['anciens', 'petanque', 'boule']),

  VF('jeux', 'anciens', 'moyen', 'Le jeu de l\'oie se joue sur un parcours jalonné de pièges.', true,
    'Le parcours de l\'oie comporte des cases pièges qui renvoient le joueur en arrière.', ['anciens', 'jeu de l oie', 'parcours']),

  GU('jeux', 'anciens', 'moyen', 'Devine le jeu : jeu de cartes traditionnel français à quatre joueurs, avec plis et figure obligatoire.',
    ['La belote', 'Le poker', 'La girafe', 'L\'écureuil'], 0,
    'À la belote, il faut figurer à l\'arrivée pour comptabiliser ses points.', ['anciens', 'belote', 'devine'], 'Chaque joueur garde huit cartes en main.'),

  // ---------------------------------------------------------------- JEUX MODERNES (10)
  Q('jeux', 'moderne', 'facile', 'Qui a inventé le Rubik\'s Cube ?', ['Erno Rubik', 'Piet Hein', 'Werner Rummelsburg', 'László Bíró'], 0,
    'Erno Rubik, professeur hongrois, conçoit le cube en 1974.', ['moderne', 'rubik s cube', 'inventeur']),

  Q('jeux', 'moderne', 'facile', 'En quelle année a été créé le Rubik\'s Cube ?', ['1974', '1981', '1969', '1990'], 0,
    'Le Rubik\'s Cube apparaît en 1974, avant un succès commercial dans les années 1980.', ['moderne', 'rubik s cube', 'date']),

  Q('jeux', 'moderne', 'facile', 'Combien de cartes contient un jeu de Dobble classique ?', ['55', '50', '60', '57'], 0,
    'Le Dobble classique compte 55 cartes portant huit symboles chacun.', ['moderne', 'dobble', 'cartes']),

  Q('jeux', 'moderne', 'expert', 'Qui est le créateur du jeu de société Citadelles ?', ['Bruno Faidutti', 'Klaus Teuber', 'Reiner Knizia', 'Uwe Rosenberg'], 0,
    'Bruno Faidutti est un historien français des jeux et l\'auteur de Citadelles.', ['moderne', 'citadelles', 'createur']),

  Q('jeux', 'moderne', 'moyen', 'De quoi se compose la main d\'un joueur dans le jeu Sushi Go ?', ['De cartes de sushi', 'De tuiles de ville', 'De dés', 'De cartes à jouer classiques'], 0,
    'Sushi Go repose entièrement sur des cartes portant des sashimis de toutes sortes.', ['moderne', 'sushi go', 'cartes']),

  Q('jeux', 'moderne', 'difficile', 'Quel jeu allemand de placement de tuiles, créé par Uwe Rosenberg, repose sur cinq ressources ?', ['Village', 'Carcassonne', 'Catan', 'Puerto Rico'], 0,
    'Dans Village, on place des tuiles pour exploiter bois, argile, pierre, blé et minerai.', ['moderne', 'village', 'tuiles']),

  Q('jeux', 'moderne', 'expert', 'En quelle année Klaus Teuber a-t-il créé le jeu Catan ?', ['1995', '1985', '1999', '2001'], 0,
    'Catan paraît en 1995 et déclenche une vague de jeux de plateau européens.', ['moderne', 'catan', 'date']),

  VF('jeux', 'moderne', 'facile', 'Le Rubik\'s Cube classique est constitué de 26 petits cubes mobiles.', true,
    'Le cube est composé d\'un noyau fixe et de vingt-six cubies mobiles.', ['moderne', 'rubik s cube', 'pieces']),

  VF('jeux', 'moderne', 'expert', 'Le jeu Panique au bord repose sur des informations cachées.', true,
    'Les joueurs cachent leurs ressources et devinent celles des adversaires.', ['moderne', 'panique au bord', 'cache cache']),

  GU('jeux', 'moderne', 'moyen', 'Devine le jeu : jeu de cartes où deux cartes partagent toujours au moins un symbole.',
    ['Le Dobble', 'Le Uno', 'Le Jungle Speed', 'Le Sushi Go'], 0,
    'Le Dobble a été conçu en 2009 par l\'éditeur Zygomatic.', ['moderne', 'dobble', 'devine'], 'Chaque carte porte huit symboles.'),
];