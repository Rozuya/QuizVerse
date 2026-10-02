import { Q, VF, MU, GU } from '../helper.mjs';

export default [
  // ---------------------------------------------------------------- CALCUL (20)
  Q('maths', 'calcul', 'facile', 'Combien font 12 × 8 ?', ['96', '84', '108', '72'], 0,
    '12 × 8 = 96 : on multiplie 12 par 8, ou 8 par 10 moins 8.', ['calcul', 'multiplication', 'entiers']),

  Q('maths', 'calcul', 'facile', 'Combien font 25 % de 200 ?', ['50', '40', '25', '20'], 0,
    "25 % de 200 vaut 200 divisé par 4, soit 50.", ['calcul', 'pourcentage', 'pourcentage']),

  Q('maths', 'calcul', 'facile', 'Combien font 144 ÷ 12 ?', ['12', '14', '16', '11'], 0,
    '144 ÷ 12 = 12 car 12 × 12 = 144.', ['calcul', 'division', 'entiers']),

  Q('maths', 'calcul', 'moyen', 'Combien font (3 + 4) × (5 - 2) ?', ['21', '14', '24', '18'], 0,
    'On calcule d\'abord 3 + 4 = 7 et 5 - 2 = 3, puis 7 × 3 = 21.', ['calcul', 'priorite', 'operations']),

  Q('maths', 'calcul', 'facile', 'Combien font 15 % de 80 ?', ['12', '8', '15', '10'], 0,
    '10 % de 80 vaut 8, donc 15 % de 80 valent 8 + 4 = 12.', ['calcul', 'pourcentage', 'centaine']),

  Q('maths', 'calcul', 'facile', 'Combien font 1,5 × 8 ?', ['12', '10,5', '13,5', '11'], 0,
    '1,5 × 8 = (15 ÷ 10) × 8 = 120 ÷ 10 = 12.', ['calcul', 'decimal', 'multiplication']),

  Q('maths', 'calcul', 'facile', 'Combien font 2,5 × 2,5 ?', ['6,25', '5', '6,5', '5,5'], 0,
    '2,5 × 2,5 = 25 ÷ 4 = 6,25.', ['calcul', 'decimal', 'aire']),

  Q('maths', 'calcul', 'moyen', 'Combien de minutes font 3 h 45 ?', ['225', '215', '235', '180'], 0,
    '3 h valent 180 minutes et 45 minutes s\'ajoutent, soit 225 minutes.', ['calcul', 'conversion', 'temps']),

  Q('maths', 'calcul', 'moyen', 'Un pull coûte 45 € et il est remisé de 20 %. Quel est son prix ?',
    ['36 €', '39 €', '33 €', '42 €'], 0,
    '20 % de 45 € valent 9 €, donc 45 - 9 = 36 €.', ['calcul', 'pourcentage', 'prix']),

  Q('maths', 'calcul', 'difficile', 'Combien font 2/3 + 1/6 ?', ['5/6', '7/12', '3/8', '2/5'], 0,
    '2/3 = 4/6, donc 4/6 + 1/6 = 5/6.', ['calcul', 'fraction', 'addition']),

  Q('maths', 'calcul', 'difficile', 'Un train parcourt 240 km en 2 heures. Quelle est sa vitesse moyenne ?',
    ['120 km/h', '80 km/h', '160 km/h', '60 km/h'], 0,
    'La vitesse moyenne vaut la distance divisée par le temps : 240 ÷ 2 = 120 km/h.', ['calcul', 'vitesse', 'moyenne']),

  VF('maths', 'calcul', 'facile', '7 × 8 = 56.', true,
    '7 × 8 = 56, car 7 × 4 = 28 et il faut doubler pour obtenir 56.', ['calcul', 'multiplication', 'entiers']),

  VF('maths', 'calcul', 'facile', '1,5 + 1,5 = 3.', true,
    'La somme de deux 1,5 vaut exactement 3.', ['calcul', 'decimal', 'addition']),

  VF('maths', 'calcul', 'facile', '3,2 + 1,85 = 5,05.', true,
    '3,20 + 1,85 = 5,05 en alignant les virgules.', ['calcul', 'decimal', 'addition']),

  VF('maths', 'calcul', 'difficile', '0,5 × 0,5 = 0,25.', true,
    '0,5 × 0,5 = 25 ÷ 100 = 0,25.', ['calcul', 'decimal', 'multiplication']),

  VF('maths', 'calcul', 'facile', '10 % de 250 valent 25.', true,
    '10 % de 250 valent 250 ÷ 10, soit 25.', ['calcul', 'pourcentage', 'centaine']),

  MU('maths', 'calcul', 'moyen', 'Parmi ces calculs, lesquels sont exacts ?',
    ['8 × 7 = 56', '9 × 6 = 53', '100 ÷ 4 = 25', '7 × 12 = 85'], [0, 2],
    '8 × 7 font bien 56 et 100 ÷ 4 font 25, tandis que 9 × 6 font 54 et 7 × 12 font 84.', ['calcul', 'verifier', 'operations']),

  MU('maths', 'calcul', 'difficile', 'Coche les calculs exacts.',
    ['1 000 − 1 = 999', '2 × 2 000 = 5 000', '50 % de 50 = 20', '10 % de 90 = 9'], [0, 2],
    '999 et 9 sont justes, mais 2 × 2 000 font 4 000 et la moitié de 50 vaut 25.', ['calcul', 'verifier', 'operations']),

  GU('maths', 'calcul', 'moyen',
    'Devine le mathématicien : savant persan du IXe siècle dont le nom latinisé a donné le mot algorithme.',
    ['Al-Kwarizmi', 'Omar Khayyam', 'Al-Kashi', 'Abu Kamil'], 0,
    'Al-Kwarizmi est l\'auteur du Livre des chiffres indiens, à l\'origine du terme algorithme.', ['al-kwarizmi', 'algorithme', 'devine']),

  GU('maths', 'calcul', 'difficile',
    'Devine le mathématicien : surnommé le prince des mathématiciens, il publie les Disquisitiones en 1801.',
    ['Carl Friedrich Gauss', 'Leonhard Euler', 'Niels Abel', 'Joseph Liouville'], 0,
    'Gauss publie ses Disquisitiones arithmeticae en 1801, à l\'âge de 20 ans.', ['gauss', 'disquisitiones', 'devine']),

  // ---------------------------------------------------------------- GEOMETRIE (18)
  Q('maths', 'geometrie', 'facile', 'Combien de côtés possède un hexagone ?', ['6', '5', '7', '8'], 0,
    'Un hexagone possède six côtés, d\'où son nom formé du grec hexa, six.', ['geometrie', 'polygone', 'cotes']),

  Q('maths', 'geometrie', 'facile', 'Un rectangle mesure 4 cm sur 9 cm. Quelle est son aire ?',
    ['36 cm²', '13 cm²', '40 cm²', '45 cm²'], 0,
    'L\'aire d\'un rectangle vaut longueur × largeur, donc 9 × 4 = 36 cm².', ['geometrie', 'aire', 'rectangle']),

  Q('maths', 'geometrie', 'facile', 'Un carré a un côté de 7 cm. Quel est son périmètre ?',
    ['28 cm', '49 cm', '14 cm', '21 cm'], 0,
    'Le périmètre d\'un carré vaut quatre fois le côté, donc 4 × 7 = 28 cm.', ['geometrie', 'perimetre', 'carre']),

  Q('maths', 'geometrie', 'moyen', 'Dans un triangle rectangle, que valent les deux autres angles ensemble ?',
    ['90°', '180°', '270°', '45°'], 0,
    'La somme des angles d\'un triangle vaut 180°, il reste donc 180° - 90° = 90°.', ['geometrie', 'triangle', 'angles']),

  Q('maths', 'geometrie', 'facile', 'Quel est le volume d\'un cube de côté 3 ?', ['27', '9', '18', '12'], 0,
    'Le volume d\'un cube vaut côté au cube, donc 3 × 3 × 3 = 27.', ['geometrie', 'volume', 'cube']),

  Q('maths', 'geometrie', 'expert', 'Quel est le périmètre d\'un cercle de diamètre 10 cm ? (π ≈ 3,14)',
    ['31,4 cm', '30 cm', '28 cm', '32 cm'], 0,
    'Le périmètre vaut π × diamètre, donc 3,14 × 10 = 31,4 cm.', ['geometrie', 'cercle', 'perimetre']),

  Q('maths', 'geometrie', 'moyen', 'Combien de diagonales possède un pentagone ?', ['5', '7', '8', '10'], 0,
    'Chaque sommet se relie à 2 sommets non voisins, donc 5 × 2 ÷ 2 = 5 diagonales.', ['geometrie', 'diagonale', 'polygone']),

  Q('maths', 'geometrie', 'difficile', 'Combien vaut la diagonale d\'un carré de côté 3 cm ?',
    ['4,24 cm', '4,5 cm', '5,2 cm', '3,6 cm'], 0,
    'La diagonale vaut la racine de 3² + 3², soit √18 ≈ 4,24 cm.', ['geometrie', 'diagonale', 'carre']),

  Q('maths', 'geometrie', 'difficile', 'Un polygone possède 9 côtés. Combien compte-t-il de diagonales ?',
    ['27', '36', '18', '45'], 0,
    'Le nombre de diagonales vaut n(n - 3) ÷ 2, donc 9 × 6 ÷ 2 = 27.', ['geometrie', 'diagonale', 'polygone']),

  Q('maths', 'geometrie', 'difficile',
    'Un rectangle a un périmètre de 36 cm et une longueur de 12 cm. Quelle est sa largeur ?',
    ['6 cm', '8 cm', '12 cm', '4 cm'], 0,
    'La largeur vaut 36 ÷ 2 - 12, soit 18 - 12 = 6 cm.', ['geometrie', 'perimetre', 'rectangle']),

  VF('maths', 'geometrie', 'facile', 'Les trois angles d\'un triangle équilatéral mesurent 60° chacun.', true,
    'Un triangle équilatéral est équiangle et 180° ÷ 3 = 60° par angle.', ['geometrie', 'triangle', 'angles']),

  VF('maths', 'geometrie', 'facile', 'L\'aire d\'un carré de côté 5 cm vaut 25 cm².', true,
    'L\'aire d\'un carré vaut côté au carré, donc 5 × 5 = 25 cm².', ['geometrie', 'aire', 'carre']),

  VF('maths', 'geometrie', 'moyen', 'Un losange est un parallélogramme dont les quatre côtés sont égaux.', true,
    'Le losange est bien un parallélogramme dont les quatre côtés ont la même longueur.', ['geometrie', 'losange', 'quadrilatere']),

  VF('maths', 'geometrie', 'moyen', 'L\'aire d\'un triangle se calcule en multipliant la base par la hauteur.', false,
    'L\'aire d\'un triangle vaut la base fois la hauteur divisée par deux.', ['geometrie', 'aire', 'triangle']),

  MU('maths', 'geometrie', 'moyen', 'Coche les affirmations exactes de géométrie.',
    ['Un triangle équilatère a trois côtés égaux.', 'Un losange a quatre angles égaux.',
      'L\'aire d\'un cercle vaut π fois le rayon au carré.', 'Un pavé droit est un cube.'], [0, 2],
    'Un losange n\'a que des angles opposés égaux, et un pavé droit n\'est un cube que s\'il est regular.', ['geometrie', 'formes', 'aire']),

  MU('maths', 'geometrie', 'difficile', 'Coche les résultats exacts.',
    ['Un rectangle de 3 sur 4 a une aire de 12.', 'Un triangle de base 8 et hauteur 5 a une aire de 40.',
      'Un cercle de rayon 2 a un diamètre de 4.', 'Un carré de côté 5 a un périmètre de 25.'], [0, 2],
    'L\'aire du triangle vaut 8 × 5 ÷ 2 = 20 et le périmètre du carré vaut 4 × 5 = 20.', ['geometrie', 'calcul', 'formes']),

  GU('maths', 'geometrie', 'moyen',
    'Devine le mathématicien : l\'un des sept sages de la Grèce, célèbre pour son théorème sur les angles.',
    ['Thalès de Milet', 'Euclide', 'Pythagore', 'Apollonius de Perga'], 0,
    'Thalès de Milet démontre que un angle inscrit est la moitié de l\'angle central.', ['thales', 'grece', 'devine']),

  GU('maths', 'geometrie', 'difficile',
    'Devine le mathématicien : il a mesuré la circonférence de la Terre à l\'aide d\'une ombre.',
    ['Ératosthène', 'Archimède', 'Ptolémée', 'Héron d\'Alexandrie'], 0,
    'Ératosthène compare l\'ombre d\'un obélisque à celle d\'Alexandrie pour en déduire la Terre.', ['eratosthene', 'terre', 'devine']),

  // ---------------------------------------------------------------- PROBABILITES (16)
  Q('maths', 'probabilites', 'facile', 'On lance une pièce équilibrée. Quelle est la probabilité d\'obtenir pile ?',
    ['1/2', '1/4', '1/3', '2/3'], 0, 'Une pièce équilibrée donne deux issues également probables.', ['probabilite', 'piece', 'lancers']),

  Q('maths', 'probabilites', 'facile', 'On lance un dé. Quelle est la probabilité d\'obtenir un 6 ?',
    ['1/6', '1/3', '1/12', '5/6'], 0, 'Le dé montre 6 faces et une seule porte le 6.', ['probabilite', 'de', 'lancers']),

  Q('maths', 'probabilites', 'facile', 'On tire une carte dans un jeu de 32 cartes. Quelle est la probabilité de tirer un roi ?',
    ['1/8', '1/32', '1/4', '1/16'], 0, 'Un jeu de 32 cartes contient 4 rois, donc 4 ÷ 32 = 1/8.', ['probabilite', 'cartes', 'fraction']),

  Q('maths', 'probabilites', 'facile', 'Avec deux dés, quelle est la probabilité d\'obtenir deux 6 ?',
    ['1/36', '2/36', '6/36', '1/12'], 0, 'Il y a 36 combinaisons possibles et une seule donne deux 6.', ['probabilite', 'des', 'de']),

  Q('maths', 'probabilites', 'moyen',
    'Une urne contient 3 boules rouges et 5 bleues. Quelle est la probabilité de tirer une boule bleue ?',
    ['5/8', '3/8', '1/2', '2/5'], 0, 'Il y a 8 boules au total dont 5 bleues, donc 5 ÷ 8.', ['probabilite', 'urne', 'fraction']),

  Q('maths', 'probabilites', 'facile', 'On lance une pièce deux fois. Quelle est la probabilité d\'obtenir deux piles d\'affilée ?',
    ['1/4', '1/2', '1/3', '3/4'], 0, 'Chaque pile vaut 1/2, donc les deux piles valent 1/2 × 1/2 = 1/4.', ['probabilite', 'piece', 'independance']),

  Q('maths', 'probabilites', 'facile', 'Comment s\'écrit la probabilité 0,75 sous forme de fraction ?',
    ['3/4', '2/3', '4/5', '7/10'], 0, '0,75 = 75/100 = 3/4 une fois la fraction simplifiée.', ['probabilite', 'fraction', 'decimal']),

  Q('maths', 'probabilites', 'moyen',
    'Une classe compte 20 élèves dont 5 aiment les maths. Quelle est la probabilité qu\'un élève choisi au hasard n\'aime pas les maths ?',
    ['3/4', '1/4', '2/3', '1/2'], 0, '15 élèves sur 20 n\'aiment pas les maths, donc 15 ÷ 20 = 3/4.', ['probabilite', 'classe', 'fraction']),

  Q('maths', 'probabilites', 'difficile', 'Avec un dé puis une pièce, combien de résultats sont possibles ?',
    ['12', '6', '24', '36'], 0, 'Six faces multipliées par deux pièces donnent 6 × 2 = 12 résultats.', ['probabilite', 'combinatoire', 'lancers']),

  VF('maths', 'probabilites', 'facile', 'La probabilité d\'un événement impossible vaut 0.', true,
    'Un événement qui ne peut pas se produire a une probabilité nulle.', ['probabilite', 'definition', 'evenement']),

  VF('maths', 'probabilites', 'facile', 'La probabilité d\'un événement certain vaut 1.', true,
    'Un événement qui se produit toujours a une probabilité égale à 1.', ['probabilite', 'definition', 'evenement']),

  VF('maths', 'probabilites', 'moyen', 'Sur une roue à 6 cases équitables, chaque résultat a une probabilité de 1/6.', true,
    'Les 6 cases ont la même chance, donc chacune vaut 1 ÷ 6.', ['probabilite', 'roue', 'equitable']),

  VF('maths', 'probabilites', 'difficile', 'Deux événements complémentaires ont des probabilités dont la somme vaut 1.', true,
    'Si deux événements se produisent nécessairement l\'un ou l\'autre, leurs probabilités s\'additionnent à 1.', ['probabilite', 'evenements', 'complementaire']),

  MU('maths', 'probabilites', 'moyen', 'Coche les probabilités exactes.',
    ['Probabilité de pile avec une pièce = 1/2', 'Probabilité d\'un 6 avec un dé = 1/6',
      'Probabilité d\'un 5 avec un dé = 1/5', 'Probabilité d\'un roi dans 32 cartes = 8/32'], [0, 1, 2],
    'Un jeu de 32 cartes ne contient que 4 rois, donc la dernière probabilité vaut 4 ÷ 32.', ['probabilite', 'verifier', 'fractions']),

  MU('maths', 'probabilites', 'difficile', 'Parmi ces événements, repère ceux dont la probabilité vaut 1/2.',
    ['Sur 2 dés, la somme 12 a une probabilité de 1/36', 'Dans 10 pulls dont 3 bleus, la probabilité de tirer un bleu vaut 3/10',
      'Tirer une carte rouge d\'un jeu de 32 a une probabilité de 8/32',
      'Lancer 3 fois une pièce et obtenir 3 piles a une probabilité de 1/8'], [0, 1, 3],
    'La moitié seulement du jeu de 32 cartes est rouge, soit 16 ÷ 32 et non 8 ÷ 32.', ['probabilite', 'verifier', 'cartes']),

  GU('maths', 'probabilites', 'moyen',
    'Devine le mathématicien : avec son frère, il a posé au XVIIe siècle les fondements du calcul des probabilités.',
    ['Blaise Pascal', 'Gottfried Leibniz', 'René Descartes', 'Pierre de Fermat'], 0,
    'Pascal et Fermat ont Correspondence sur le problème des points en 1654.', ['pascal', 'probabilite', 'devine']),

  // ---------------------------------------------------------------- CASSE-TETE (16)
  Q('maths', 'casse', 'facile', 'Je suis un animal au long cou qui broute les arbres les plus hauts. Qui suis-je ?',
    ['La girafe', 'Le flamant rose', 'Le lémur', 'Le dromadaire'], 0,
    'La girafe est le plus grand animal terrestre et sa langue atteint les feuilles les plus hautes.', ['casse tete', 'animal', 'enigme']),

  Q('maths', 'casse', 'facile', 'Je suis un animal marin, le plus grand de tous les poissons. Qui suis-je ?',
    ['Le requin-baleine', 'Le cachalot', 'Le thon', 'La raie manta'], 0,
    'Le requin-baleine peut dépasser 15 mètres et se nourrit de krill et de plancton.', ['casse tete', 'animal', 'mer']),

  Q('maths', 'casse', 'facile',
    'Je pousse sur un arbre, je suis jaune ou vert, et l\'on me claque dessus pour en manger la pulpe. Qui suis-je ?',
    ['La pomme', 'La poire', 'La pêche', 'L\'ananas'], 0,
    'La pomme est un fruit à pépins que l\'on peut croquer directement.', ['casse tete', 'fruit', 'enigme']),

  Q('maths', 'casse', 'facile', 'Je suis un nombre. Si tu m\'ajoutes 5, tu obtiens 12. Combien suis-je ?',
    ['7', '17', '6', '8'], 0, 'Il suffit de soustraire 5 à 12, soit 12 - 5 = 7.', ['casse tete', 'nombre', 'equation']),

  Q('maths', 'casse', 'facile', 'Mon double vaut 18 et je ne suis pas pair. Combien suis-je ?',
    ['9', '6', '12', '15'], 0, 'La moitié de 18 est 9, et 9 est bien un nombre impair.', ['casse tete', 'nombre', 'impair']),

  Q('maths', 'casse', 'moyen', 'Je suis le seul métal liquide à température ambiante. Quel métal suis-je ?',
    ['Le mercure', 'Le plomb', 'L\'étain', 'Le zinc'], 0,
    'Le mercure reste liquide à 20 degrés, contrairement à tous les autres métaux courants.', ['casse tete', 'metal', 'liquide']),

  Q('maths', 'casse', 'facile', 'Je suis le plus grand océan de la planète. Quel est mon nom ?',
    ['Le Pacifique', 'L\'Atlantique', 'L\'Indien', 'L\'Arctique'], 0,
    'Le Pacifique couvre à lui seul environ un tiers de la surface du globe.', ['casse tete', 'ocean', 'geographie']),

  Q('maths', 'casse', 'moyen', 'Je suis la plus grande île de la Méditerranée. Quelle suis-je ?',
    ['La Sicile', 'La Corse', 'La Crète', 'Chypre'], 0,
    'Avec près de 25 000 km², la Sicile dépasse la Corse et la Crète.', ['casse tete', 'ile', 'mediterranee']),

  Q('maths', 'casse', 'difficile',
    'Je suis un nombre premier compris entre 40 et 50, et la somme de mes deux chiffres vaut 7. Combien suis-je ?',
    ['43', '47', '45', '49'], 0, 'Seul 43 est premier entre 40 et 50 et 4 + 3 vaut bien 7.', ['casse tete', 'nombre premier', 'enigme']),

  VF('maths', 'casse', 'facile', 'Mêler du jaune et du bleu donne du vert.', true,
    'Le jaune et le bleu sont des couleurs primaires dont le mélange produit du vert.', ['casse tete', 'couleur', 'melange']),

  VF('maths', 'casse', 'facile', 'La Sicile est la plus grande île de la Méditerranée.', true,
    'La Sicile est la plus grande île méditerranéenne, devant la Corse et la Sardaigne.', ['casse tete', 'ile', 'mediterranee']),

  VF('maths', 'casse', 'moyen', 'Le plus grand océan de la planète est le Pacifique.', true,
    'Le Pacifique est l\'océan le plus vaste et le plus profond du monde.', ['casse tete', 'ocean', 'geographie']),

  VF('maths', 'casse', 'difficile', 'Le plus grand nombre premier à deux chiffres est 97.', true,
    '91, 93, 95 et 99 sont composés, seul 97 reste premier après 89.', ['casse tete', 'nombre premier', 'nombre']),

  MU('maths', 'casse', 'facile', 'Coche les nombres premiers parmi les suivants.',
    ['7', '9', '13', '21'], [0, 2],
    '7 et 13 n\'ont aucun diviseur autre que 1, tandis que 9 = 3 × 3 et 21 = 3 × 7.', ['casse tete', 'nombre premier', 'diviseur']),

  MU('maths', 'casse', 'expert', 'Coche les affirmations exactes au sujet des nombres premiers.',
    ['17 est un nombre premier.', '21 est un nombre premier.', '1 n\'est pas un nombre premier.', '9 est un nombre premier.'], [0, 2],
    '21 et 9 sont composés, tandis que 17 est premier et que 1 n\'est ni premier ni composé.', ['casse tete', 'nombre premier', 'definition']),

  GU('maths', 'casse', 'moyen', 'Devine le nombre : je suis le plus petit nombre premier supérieur à 100.',
    ['101', '103', '97', '113'], 0,
    '101 n\'est divisible ni par 2, ni par 3, ni par 5, ni par 7, c\'est donc le premier.', ['casse tete', 'nombre premier', 'devine']),

  // ---------------------------------------------------------------- SUITES NUMERIQUES (14)
  Q('maths', 'suites', 'facile', 'Quel est le 6e terme de la suite 1, 2, 3, 4, ... ?', ['6', '5', '7', '8'], 0,
    'La suite des entiers naturels : le 6e terme est 6.', ['suite', 'entiers', 'terme']),

  Q('maths', 'suites', 'facile', 'Quel est le 10e terme de la suite 2, 4, 6, 8, ... ?', ['20', '18', '22', '24'], 0,
    'On ajoute 2 à chaque terme, donc le 10e terme vaut 2 × 10 = 20.', ['suite', 'progression', 'terme']),

  Q('maths', 'suites', 'facile', 'Quel est le 8e terme de la suite 5, 10, 15, 20, ... ?', ['40', '35', '45', '50'], 0,
    'On ajoute 5 à chaque terme, donc le 8e terme vaut 5 × 8 = 40.', ['suite', 'progression', 'terme']),

  Q('maths', 'suites', 'facile', 'Quel est le 7e terme de la suite 1, 4, 9, 16, 25, ... ?', ['49', '36', '64', '48'], 0,
    'Ce sont les carrés des entiers : le 7e terme vaut 7 au carré, soit 49.', ['suite', 'carres', 'terme']),

  Q('maths', 'suites', 'facile', 'Quel est le 15e terme de la suite 3, 6, 9, 12, ... ?', ['45', '48', '42', '36'], 0,
    'On ajoute 3 à chaque terme, donc le 15e terme vaut 3 × 15 = 45.', ['suite', 'progression', 'terme']),

  Q('maths', 'suites', 'facile', 'Quel est le 8e terme de la suite 1, 2, 4, 8, ... ?', ['128', '256', '64', '120'], 0,
    'Chaque terme est le double du précédent : 1, 2, 4, 8, 16, 32, 64 puis 128.', ['suite', 'geometrique', 'terme']),

  Q('maths', 'suites', 'facile', 'Quel est le 6e terme de la suite 2, 3, 5, 7, 11, ... ?', ['13', '17', '12', '15'], 0,
    'Ce sont les nombres premiers dans l\'ordre : le 6e est 13.', ['suite', 'nombre premier', 'terme']),

  Q('maths', 'suites', 'difficile', 'Quel est le 8e terme de la suite 1, 2, 4, 7, 11, 16, ... ?', ['29', '28', '31', '27'], 0,
    'Les différences augmentent de 1 : +1, +2, +3, +4, +5, +6 puis +7, donc 22 + 7 = 29.', ['suite', 'differences', 'terme']),

  Q('maths', 'suites', 'expert', 'Quel est le 6e terme de la suite 1, 2, 6, 24, 120, ... ?', ['720', '600', '144', '360'], 0,
    'Ce sont les factorielles : chaque terme est le produit des entiers jusqu\'à lui, 6! = 720.', ['suite', 'factorielle', 'terme']),

  VF('maths', 'suites', 'facile', 'La suite 1, 1, 2, 3, 5, 8 est une suite de Fibonacci.', true,
    'Chaque terme est la somme des deux précédents dans cette suite célèbre.', ['suite', 'fibonacci', 'terme']),

  VF('maths', 'suites', 'moyen', 'Une suite arithmétique est une suite où la différence entre deux termes consécutifs est constante.', true,
    'C\'est la définition exacte d\'une progression arithmétique.', ['suite', 'arithmetique', 'definition']),

  VF('maths', 'suites', 'difficile', 'Dans la suite 1, 2, 4, 7, 11, 16, les différences augmentent de 1 à chaque fois.', true,
    'Les différences valent 1, 2, 3, 4 puis 5 : la suite est croissante et non arithmétique.', ['suite', 'differences', 'suite croissante']),

  MU('maths', 'suites', 'moyen', 'Coche les suites arithmétiques.',
    ['2, 4, 6, 8', '1, 4, 9, 16', '5, 10, 15, 20', '3, 5, 8, 12'], [0, 2],
    'Les différences y valent toujours 2 et 5, alors que 1, 4, 9, 16 et 3, 5, 8, 12 ne sont pas régulières.', ['suite', 'arithmetique', 'differences']),

  GU('maths', 'suites', 'moyen', 'Devine le mathématicien : il donne son nom à la suite 1, 1, 2, 3, 5, 8.',
    ['Fibonacci', 'Euclide', 'Al-Kwarizmi', 'Archimède'], 0,
    'Leonardo Fibonacci a décrit cette suite au XIIIe siècle dans son Livre des abaques.', ['fibonacci', 'suite', 'devine']),

  // ---------------------------------------------------------------- CULTURE MATHS (12)
  Q('maths', 'mathsculture', 'facile',
    'Quel mathématicien grec est célèbre pour le théorème sur les côtés d\'un triangle rectangle ?',
    ['Pythagore', 'Euclide', 'Thalès', 'Archimède'], 0,
    'Le théorème de Pythagore relie le carré de l\'hypoténuse à la somme des carrés des deux autres côtés.', ['pythagore', 'theoreme', 'triangle']),

  Q('maths', 'mathsculture', 'facile', 'Combien vaut π arrondi à deux décimales ?', ['3,14', '3,41', '2,71', '4,14'], 0,
    'Le rapport de la circonférence au diamètre d\'un cercle vaut environ 3,14159.', ['pi', 'nombre', 'cercle']),

  Q('maths', 'mathsculture', 'moyen',
    'Quel mathématicien grec a fondé l\'école d\'Alexandrie et a écrit les Éléments ?',
    ['Euclide', 'Archimède', 'Ptolémée', 'Apollonius'], 0,
    'Les Éléments d\'Euclide sont le texte fondateur de la géométrie pendant vingt siècles.', ['euclide', 'elements', 'grece']),

  Q('maths', 'mathsculture', 'moyen',
    'Quel mathématicien français du XVIIe siècle est célèbre pour son dernier théorème sur les nombres premiers ?',
    ['Pierre de Fermat', 'Blaise Pascal', 'René Descartes', 'Girard Desargues'], 0,
    'Fermat note dans son marge qu\'aucun théorème n\'est plus illustre que celui des nombres premiers.', ['fermat', 'theoreme', 'nombre premier']),

  Q('maths', 'mathsculture', 'difficile', 'Comment appelle-t-on le plus grand commun diviseur de 12 et de 18 ?',
    ['Le PGCD', 'Le PPCM', 'Le PGDC', 'Le PPMC'], 0,
    'Les diviseurs communs de 12 et 18 sont 1, 2, 3 et 6 : le plus grand est 6.', ['pgcd', 'diviseur', 'arithmetique']),

  Q('maths', 'mathsculture', 'difficile', 'Comment s\'appelle la relation qui relie les angles d\'un triangle à ses côtés ?',
    ['La loi des cosinus', 'La loi des sinus', 'Le théorème de Thalès', 'L\'inégalité triangulaire'], 0,
    'La loi des cosinus donne le côté en fonction des deux autres et du cosinus de l\'angle opposé.', ['loi des cosinus', 'triangle', 'geometrie']),

  Q('maths', 'mathsculture', 'expert', 'Combien de nombres premiers contient l\'intervalle de 1 à 20 ?',
    ['8', '7', '9', '10'], 0, 'Ce sont 2, 3, 5, 7, 11, 13, 17 et 19, soit 8 nombres premiers.', ['nombre premier', 'intervalle', 'entiers']),

  VF('maths', 'mathsculture', 'expert', 'Archimède a notamment déterminé le volume d\'une sphère.', true,
    'Archimède établit que le volume de la sphère vaut les deux tiers de son cylindre circumscrit.', ['archimede', 'sphere', 'volume']),

  VF('maths', 'mathsculture', 'expert', 'Le nombre d\'or vaut environ 1,618.', true,
    'Le nombre d\'or est la racine positive de x² - x - 1, soit environ 1,618034.', ['nombre d or', 'irrationnel', 'nombre']),

  VF('maths', 'mathsculture', 'expert', 'Le triangle de Pascal est utilisé pour calculer des probabilités.', true,
    'Les coefficients de la ligne n du triangle de Pascal correspondent aux probabilités du lancer de pièces.', ['pascal', 'probabilite', 'triangle']),

  MU('maths', 'mathsculture', 'moyen', 'Coche les mathématiciens de l\'Antiquité grecque.',
    ['Archimède', 'Euclide', 'Pythagore', 'Nicolas Copernic'], [0, 1, 2],
    'Archimède, Euclide et Pythagore sont grecs, tandis que Copernic est un astronome polonais du XVIe siècle.', ['mathematicien', 'antiquite', 'grece']),

  GU('maths', 'mathsculture', 'moyen', 'Devine le mathématicien : il aurait crié Eureka en sortant de son bain.',
    ['Archimède', 'Euclide', 'Pythagore', 'Ératosthène'], 0,
    'La légende d\'Archimède et de son Eureka court depuis l\'Antiquité dans toutes les langues.', ['archimede', 'eureka', 'devine']),
];