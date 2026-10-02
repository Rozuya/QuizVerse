import { Q, VF, MU, GU } from '../helper.mjs';

export default [
  // ---------------------------------------------------------------- GRAMMAIRE (20)
  Q('francais', 'grammaire', 'facile', 'Quel est le pluriel du mot cheval ?', ['Chevaux', 'Chevals', 'Chevalx', 'Cheveaux'], 0,
    'Les mots en -al prennent un x au pluriel, sauf quelques mots particuliers.', ['pluriel', 'grammaire', 'chevaux']),

  Q('francais', 'grammaire', 'facile', 'Quel est le feminin du mot roi ?', ['Reine', 'Roie', 'Roine', 'Ree'], 0,
    'Le feminin de roi est reine, avec un e accentue sur la deuxieme syllabe.', ['feminin', 'roi', 'reine']),

  Q('francais', 'grammaire', 'facile', 'Dans la phrase Les enfants jouent, que vaut le mot les ?',
    ['Un article defini', 'Un pronom personnel', 'Un determinant possessif', 'Un adverbe'], 0,
    'Les est un article defini au pluriel, de meme forme qu\'au singulier.', ['article', 'determinant', 'grammaire']),

  Q('francais', 'grammaire', 'facile', 'Dans Je bois un cafe, quel est le complement d\'objet direct ?',
    ['Un cafe', 'Boire', 'Je', 'Tres'], 0,
    'Le complement d\'objet direct repond a la question quoi ou qui apres le verbe.', ['complement', 'objet direct', 'phrase']),

  Q('francais', 'grammaire', 'facile', 'Comment appelle-t-on l\'accord du nom avec son article et son adjectif ?',
    ['La concordance', 'La conjugaison', 'La derivation', 'La substitution'], 0,
    'La concordance designe l\'accord des mots entre eux dans une meme phrase.', ['concordance', 'accord', 'grammaire']),

  Q('francais', 'grammaire', 'moyen', 'Comment s\'appelle l\'ensemble des formes d\'un meme verbe ?',
    ['La conjugaison', 'La declinaison', 'Le radical', 'La derivation'], 0,
    'La conjugaison regroupe les formes verbales des personnes et des temps.', ['conjugaison', 'verbe', 'grammaire']),

  Q('francais', 'grammaire', 'facile', 'Quel est le pluriel du mot ciel ?', ['Ciels', 'Ciel', 'Cieux', 'Ciex'], 0,
    'Le pluriel de ciel est ciels, la forme cieux restant un mot savant.', ['pluriel', 'ciel', 'grammaire']),

  Q('francais', 'grammaire', 'facile', 'Devant un nom masculin en voyelle, comment devient l\'adjectif beau ?',
    ['Bel', 'Beau', 'Beaux', 'Belle'], 0,
    'Devant un nom masculin en voyelle, beau devient bel : un bel homme.', ['adjectif', 'beau', 'accord']),

  Q('francais', 'grammaire', 'facile', 'Quel est le pluriel du mot travail ?', ['Travaux', 'Travails', 'Travailes', 'Travail'], 0,
    'Les mots en -ail font leur pluriel en -aux : un travail, des travaux.', ['pluriel', 'travail', 'grammaire']),

  Q('francais', 'grammaire', 'moyen', 'Dans la phrase Le vent souffle, quel est le sujet reel ?',
    ['Le vent', 'La fenetre', 'Le souffle', 'La porte'], 0,
    'Le sujet reel exprime l\'action, meme s\'il est differe du sujet apparent.', ['sujet', 'proposition', 'grammaire']),

  Q('francais', 'grammaire', 'difficile', 'Quel est le pluriel du mot bail ?', ['Baux', 'Baies', 'Bails', 'Balles'], 0,
    'Le bail, qui donne bailleur et preneur, fait baux au pluriel.', ['pluriel', 'bail', 'grammaire']),

  Q('francais', 'grammaire', 'difficile', 'Quel temps employe-t-on apres si dans une proposition hypothetique ?',
    ['L\'imparfait', 'Le present', 'Le futur simple', 'Le passe simple'], 0,
    'L\'imparfait exprime la condition et le conditionnel la consequence.', ['temps', 'si', 'grammaire']),

  Q('francais', 'grammaire', 'difficile', 'Quel est le pluriel du mot oeil ?', ['Yeux', 'Oels', 'Ocils', 'Oeils'], 0,
    'Le pluriel de oeil est yeux, avec un y suivi d\'un x.', ['pluriel', 'oeil', 'grammaire']),

  VF('francais', 'grammaire', 'facile', 'Dans Les enfants jouent, le mot les est un article défini.', true,
    'Les est bien l\'article défini pluriel, chargé de déterminer le nom.', ['article', 'determinant', 'grammaire']),

  VF('francais', 'grammaire', 'facile', 'Le féminin de roi est reine.', true,
    'La forme féminine de roi porte un e accentué sur la deuxième syllabe.', ['feminin', 'roi', 'accord']),

  VF('francais', 'grammaire', 'moyen',
    'Un participe passé employé avec avoir s\'accorde avec le sujet placé avant le verbe.', true,
    'Lorsque le sujet est placé devant, le participe passé s\'accorde avec lui.', ['participe passe', 'accord', 'grammaire']),

  VF('francais', 'grammaire', 'facile', 'Dans Si j\'avais su, je serais venu, l\'imparfait exprime la condition.', true,
    'L\'imparfait pose la condition, le conditionnel exprime la conséquence.', ['temps', 'conditionnel', 'grammaire']),

  VF('francais', 'grammaire', 'expert',
    'Avec avoir, le participe passé s\'accorde avec le complément d\'objet direct placé avant lui.', true,
    'Le complément d\'objet direct placé avant le verbe déclenche l\'accord.', ['participe passe', 'accord', 'expert']),

  MU('francais', 'grammaire', 'moyen', 'Coche les pluriels correctement formés.',
    ['chevaux', 'chevals', 'ciels', 'travaux'], [0, 2, 3],
    'Les mots en -al et en -ail prennent un x au pluriel, sauf le mot ciel.', ['pluriel', 'accord', 'grammaire']),

  MU('francais', 'grammaire', 'difficile', 'Coche les affirmations exactes sur les pluriels irréguliers.',
    ['Le pluriel de oeil est yeux.', 'Le pluriel de bail est baux.',
      'Le pluriel de ciel est cieux.', 'Devant un nom masculin en voyelle, beau devient bel.'], [0, 1, 3],
    'Le ciel fait ciels au pluriel, la forme cieux étant réservée à l\'usage littéraire.', ['pluriel', 'accord', 'grammaire']),

  // ---------------------------------------------------------------- ORTHOGRAPHE (18)
  Q('francais', 'orthographe', 'facile', 'Dans Je vais à Paris, comment s\'écrit le mot du lieu ?',
    ['à', 'a', 'â', 'á'], 0,
    'Le à accent grave introduit un lieu, tandis que a est le verbe avoir.', ['accent grave', 'a', 'orthographe']),

  Q('francais', 'orthographe', 'facile', 'Quel accent distingue le mot interrogatif où du mot ou ?',
    ['Un accent grave', 'Un accent aigu', 'Un circonflexe', 'Un tréma'], 0,
    'Où porte un accent grave quand il introduit une question.', ['ou', 'accent', 'orthographe']),

  Q('francais', 'orthographe', 'facile', 'Comment s\'écrit le mot qui signifie également ?',
    ['aussi', 'ausi', 'auce', 'auxsi'], 0,
    'Le mot aussi s\'écrit avec deux s et se prononce avec un s final.', ['aussi', 'double s', 'orthographe']),

  Q('francais', 'orthographe', 'facile', 'Quel est le pluriel du mot plusieurs ?',
    ['plusieurs', 'plusieur', 'plusieures', 'plusieurss'], 0,
    'Les mots plusieurs et quelques restent invariables au pluriel.', ['pluriel', 'invariable', 'orthographe']),

  Q('francais', 'orthographe', 'facile', 'Quelle est la différence entre son et sont ?',
    ['Son est un déterminant possessif, sont est le verbe être',
      'Son est le verbe être, sont est un adverbe',
      'Les deux sont des verbes', 'Son est un adverbe, sont est un nom'], 0,
    'Son indique une appartenance, tandis que sont est une forme du verbe être.', ['homophones', 'son', 'orthographe']),

  Q('francais', 'orthographe', 'difficile', 'Comment s\'écrit le féminin pluriel du mot tranquille ?',
    ['tranquilles', 'tranquile', 'tranquilleses', 'tranquis'], 0,
    'Le mot tranquille forme son pluriel avec un s final : tranquilles.', ['accord', 'feminin', 'orthographe']),

  Q('francais', 'orthographe', 'difficile', 'Quel mot s\'écrit avec un tréma pour éviter un hiatus ?',
    ['aiguë', 'aigue', 'aigué', 'aigüe'], 0,
    'Le tréma placé sur le e de aiguë évite la rencontre de deux voyelles.', ['trema', 'hiatus', 'orthographe']),

  Q('francais', 'orthographe', 'difficile', 'Comment s\'écrit le pluriel du mot corail ?',
    ['coraux', 'corailles', 'corails', 'coraus'], 0,
    'Le pluriel de corail est coraux, avec un x comme dans cerveau.', ['pluriel', 'corail', 'orthographe']),

  Q('francais', 'orthographe', 'expert', 'Quel mot est correctement orthographié ?',
    ['excellemment', 'excélement', 'excelllementt', 'excelllement'], 0,
    'Excellemment s\'écrit avec deux l et un e accentué à l\'initiale.', ['orthographe', 'adverbe', 'expert']),

  Q('francais', 'orthographe', 'expert', 'Comment s\'écrit le pluriel du mot maître ?',
    ['maîtres', 'maîtress', 'maistres', 'maitres'], 0,
    'Le pluriel de maître est maîtres, avec un i circonflexe et un s.', ['pluriel', 'maitre', 'orthographe']),

  VF('francais', 'orthographe', 'facile', 'Dans Son sac est bleu, le mot son s\'écrit sans accent.', true,
    'Le déterminant possessif son ne porte aucun accent, contrairement à sont.', ['son', 'accent', 'orthographe']),

  VF('francais', 'orthographe', 'facile', 'Le mot où ne prend pas d\'accent quand il signifie l\'alternative.', true,
    'Sans accent, ou introduit une alternative : chocolat ou café.', ['ou', 'ou', 'accent']),

  VF('francais', 'orthographe', 'moyen', 'Le participe passé s\'accorde avec le complément d\'objet direct placé avant lui.', true,
    'Les lettres qu\'elle a envoyées portent un accord avec leur complément.', ['participe passe', 'accord', 'orthographe']),

  VF('francais', 'orthographe', 'expert',
    'Dans Elle a mangé la pomme, le participe passé mangé ne s\'accorde pas.', true,
    'Le complément d\'objet direct suit le verbe, donc le participe reste invariable.', ['participe passe', 'accord', 'expert']),

  VF('francais', 'orthographe', 'moyen', 'Le mot pays reste invariable au pluriel : des pays.', true,
    'Un pays, des pays : ce nom est invariable en nombre.', ['pluriel', 'pays', 'orthographe']),

  MU('francais', 'orthographe', 'moyen', 'Coche les phrases correctement orthographiées.',
    ['Où es-tu ?', 'Ou es-tu ?', 'C\'est bon à manger', 'C\'est bon à mangé'], [0, 2],
    'Où interrogatif porte l\'accent grave, et à précède ici un infinitif.', ['accent grave', 'phrase', 'orthographe']),

  MU('francais', 'orthographe', 'difficile', 'Coche les graphies correctes.',
    ['maitres', 'maîtres', 'cielx', 'oeils'], [0, 1],
    'Le pluriel de oeil est yeux et ciel fait ciels : ces deux graphies sont fausses.', ['pluriel', 'accent', 'orthographe']),

  GU('francais', 'orthographe', 'moyen',
    'Devine le mot : adverbe de deux lettres signifiant à cette heure-ci, écrit avec un accent grave.',
    ['ci', 'maintenant', 'tout à l\'heure', 'jamais'], 0,
    'L\'accent grave est indispensable dans ci, sans quoi le mot disparaît.', ['accent grave', 'devine', 'mot'], 'C\'est un mot de deux lettres.'),

  // ---------------------------------------------------------------- LITTERATURE CLASSIQUE (20)
  Q('francais', 'classique', 'facile', 'Qui a écrit la pièce Le Misanthrope ?',
    ['Molière', 'Racine', 'Corneille', 'La Fontaine'], 0,
    'Le Misanthrope, de 1667, met en scène Alceste,ernel du caractère.', ['moliere', 'theatre', 'classique']),

  Q('francais', 'classique', 'facile', 'Qui a écrit la pièce Le Cid ?',
    ['Corneille', 'Racine', 'Molière', 'Pradon'], 0,
    'Le Cid, Corneillien de 1637, met en scène le triomphe de l\'amour.', ['corneille', 'theatre', 'cid']),

  Q('francais', 'classique', 'facile', 'Quel auteur est célèbre pour ses fables ?',
    ['La Fontaine', 'Molière', 'Boileau', 'Ronsard'], 0,
    'Jean de La Fontaine publie ses Fables entre 1668 et 1694.', ['fontaine', 'fable', 'classique']),

  Q('francais', 'classique', 'facile', 'Qui a écrit le roman Les Misérables ?',
    ['Victor Hugo', 'Balzac', 'Zola', 'Maupassant'], 0,
    'Les Misérables, paru en 1862, raconte la vie de Jean Valjean.', ['victor hugo', 'roman', 'classique']),

  Q('francais', 'classique', 'moyen', 'Qui a écrit le conte Candide ?',
    ['Voltaire', 'Diderot', 'Rousseau', 'Montesquieu'], 0,
    'Candide, publié en 1759, tourne en dérision l\'optimisme de Leibniz.', ['voltaire', 'conte', 'classique']),

  Q('francais', 'classique', 'moyen', 'Quelle pièce de Molière met en scène le séducteur Dom Juan ?',
    ['Dom Juan', 'Le Misanthrope', 'Tartuffe', 'L\'Avare'], 0,
    'Dom Juan, de 1662, est la plus célèbre pièce de Molière.', ['moliere', 'dom juan', 'theatre']),

  Q('francais', 'classique', 'moyen', 'Quel ouvrage de Rousseau défend la volonté générale ?',
    ['Le Contrat social', 'Émile', 'La Nouvelle Héloïse', 'Discours sur les sciences'], 0,
    'Le Contrat social, de 1762, contient la formule de la volonté générale.', ['rousseau', 'contrat social', 'classique']),

  Q('francais', 'classique', 'facile', 'Sous quel pseudonyme Aurore Dupin a-t-elle publié ses romans ?',
    ['George Sand', 'Madame de Staël', 'George Eliot', 'Colette'], 0,
    'George Sand est le pseudonyme d\'Amantine Dupin, femme de lettres.', ['george sand', 'pseudonyme', 'classique']),

  Q('francais', 'classique', 'difficile', 'Qui a écrit le roman Manon Lescaut ?',
    ['L\'abbé Prévost', 'Laclos', 'Rousseau', 'Marivaux'], 0,
    'L\'abbé Prévost publie Manon Lescaut en 1731, roman d\'amour et deprovin.', ['manon lescaut', 'roman', 'classique']),

  Q('francais', 'classique', 'difficile', 'Qui a écrit La Chartreuse de Parme ?',
    ['Stendhal', 'Balzac', 'Dumas', 'Mérimée'], 0,
    'La Chartreuse de Parme, de 1839, est un chef-d\'oeuvre du romantisme.', ['stendhal', 'roman', 'classique']),

  Q('francais', 'classique', 'expert', 'Qui a écrit le roman Germinal ?',
    ['Zola', 'Maupassant', 'Huysmans', 'Mirbeau'], 0,
    'Germinal, de 1885, décrit la vie des mineurs du nord de la France.', ['zola', 'germinal', 'classique']),

  VF('francais', 'classique', 'facile', 'Phèdre est une pièce de Jean Racine.', true,
    'Phèdre, représentée en 1677, est l\'une des plus célèbres tragédies.', ['racine', 'theatre', 'classique']),

  VF('francais', 'classique', 'facile', 'La Comédie-Française a été fondée en 1680 sous le nom de Troupe du Roi.', true,
    'Louis XIV transforme en 1680 la troupe de Molière en troupe officielle.', ['comedie francaise', 'theatre', 'classique']),

  VF('francais', 'classique', 'facile', 'Racine a écrit Andromaque et Bérénice.', true,
    'Ces deux tragédies marquent tout le théâtre classique du XVIIe siècle.', ['racine', 'tragedie', 'classique']),

  VF('francais', 'classique', 'difficile', 'La Henriade de Voltaire est un poème épique.', true,
    'Ce long poème en alexandrins raconte la guerre contre les Turcs.', ['voltaire', 'poeme', 'classique']),

  VF('francais', 'classique', 'moyen', 'Georges de Scudéry a été reçue à l\'Académie française.', true,
    'Elle est l\'une des premières femmes reçues à un fauteuil en 1603.', ['scudery', 'academie', 'classique']),

  MU('francais', 'classique', 'moyen', 'Coche les associations auteur-oeuvre exactes.',
    ['Molière — Tartuffe', 'Racine — Le Cid', 'Corneille — Les Misérables', 'La Fontaine — Le Misanthorpe'], [0, 1],
    'Le Cid est de Corneille et Le Misanthrope est de Molière, non de La Fontaine.', ['auteur', 'oeuvre', 'classique']),

  MU('francais', 'classique', 'difficile', 'Coche les affirmations exactes.',
    ['Le Contrat social est de Rousseau.', 'Candide est de Voltaire.',
      'Manon Lescaut est de l\'abbé Prévost.', 'Eugénie Grandet est de Stendhal.'], [0, 1, 2],
    'Eugénie Grandet est de Balzac et non de Stendhal.', ['auteur', 'roman', 'classique']),

  GU('francais', 'classique', 'moyen', 'Devine l\'auteur : il a écrit Tartuffe, Dom Juan et L\'Avare.',
    ['Molière', 'Racine', 'Corneille', 'La Fontaine'], 0,
    'Molière est le seul auteur à avoir écrit ces trois grandes pièces.', ['moliere', 'devine', 'auteur'], 'Il vivait au XVIIe siècle.'),

  GU('francais', 'classique', 'expert',
    'Devine l\'auteur : sa Recherche en sept volumes raconte la mémoire et le temps.',
    ['Marcel Proust', 'Anatole France', 'Romain Rolland', 'André Gide'], 0,
    'Proust laisse inachevé son roman consacré à la mémoire et au temps.', ['proust', 'devine', 'auteur'], 'Son style a fondé le XXe siècle.'),

  // ---------------------------------------------------------------- ETYMOLOGIE (16)
  Q('francais', 'etymologie', 'facile', 'De quelle langue vient le mot français restaurant ?',
    ['Du latin', 'De l\'italien', 'De l\'allemand', 'De l\'espagnol'], 0,
    'Le latin restaurare, rétablir, a donné le français restaurant.', ['etymologie', 'restaurant', 'latin']),

  Q('francais', 'etymologie', 'facile', 'De quelle langue le français a-t-il emprunté le mot café ?',
    ['Du turc', 'De l\'italien', 'De l\'espagnol', 'De l\'allemand'], 0,
    'C\'est un emprunt au turc kahve, lui-même issu de l\'arabe.', ['etymologie', 'cafe', 'emprunt']),

  Q('francais', 'etymologie', 'facile', 'Que signifie le préfixe latin bi- ?',
    ['Deux', 'Bien', 'Hors', 'Entre'], 0,
    'Le latin bis signifie deux, comme dans bissextile ou bilingue.', ['etymologie', 'prefixe', 'latin']),

  Q('francais', 'etymologie', 'moyen', 'De quelle langue vient le mot orange ?',
    ['De l\'arabe', 'De l\'italien', 'Du grec', 'Du portugais'], 0,
    'Le mot vient de l\'arabe naranj, lui-même emprunté au persan.', ['etymologie', 'orange', 'emprunt']),

  Q('francais', 'etymologie', 'moyen', 'De quelle langue vient le mot jardin ?',
    ['Du germanique', 'Du latin', 'De l\'italien', 'Du slave'], 0,
    'Le germanique gart signifie enclos, d\'où le français jardin.', ['etymologie', 'jardin', 'emprunt']),

  Q('francais', 'etymologie', 'moyen', 'De quelle langue vient le mot kiosque ?',
    ['De l\'arabe', 'Du persan', 'Du turc', 'Du grec'], 0,
    'Le français emprunte kiosque à l\'arabe, via le turc kiosk.', ['etymologie', 'kiosque', 'emprunt']),

  Q('francais', 'etymologie', 'difficile', 'Que désignait à l\'origine le mot parasite ?',
    ['Celui qui mange à la table d\'autrui', 'Celui qui voyage sans billet',
      'Celui qui change de religion', 'Celui qui écrit des vers'], 0,
    'Le grec parasitos désigne celui qui mange à la table d\'un autre.', ['etymologie', 'parasite', 'grec']),

  Q('francais', 'etymologie', 'difficile', 'Que signifie le préfixe grec a- employé dans azote ?',
    ['Sans', 'Avec', 'Contre', 'Deux'], 0,
    'Le grec a privatif se combine avec zoe, vie, pour dire sans vie.', ['etymologie', 'azote', 'grec']),

  Q('francais', 'etymologie', 'expert', 'Que signifie le grec sunagogê, dans le mot synagogue ?',
    ['Une assemblée', 'Un sacrifice', 'Un prophète', 'Une prière'], 0,
    'Le grec sunagogê désigne le lieu où la communauté se réunit.', ['etymologie', 'synagogue', 'grec']),

  VF('francais', 'etymologie', 'facile', 'Le mot carrosse est un emprunt à l\'italien.', true,
    'Le français emprunte carrosse à l\'italien carrozzo, la charrette.', ['etymologie', 'carrosse', 'emprunt']),

  VF('francais', 'etymologie', 'facile', 'Le préfixe grec a- signifie sans.', true,
    'On le retrouve dans atype, apathie ou anonyme.', ['etymologie', 'prefixe', 'grec']),

  VF('francais', 'etymologie', 'moyen', 'Le mot assassin vient de l\'arabe et désignait un consommateur de haschich.', true,
    'Les Assassins, secte du Levant, sont à l\'origine du mot français.', ['etymologie', 'assassin', 'arabe']),

  VF('francais', 'etymologie', 'expert', 'Le mot algorithme vient du nom latinisé d\'un savant persan.', true,
    'Le latin médiéval Algoritmi vient d\'Al-Kwarizmi, auteur du Livre des chiffres.', ['etymologie', 'algorithme', 'expert']),

  MU('francais', 'etymologie', 'moyen', 'Coche les emprunts de langue exacts.',
    ['kiosque — arabe', 'carrosse — italien', 'sushi — espagnol', 'voyage — latin'], [0, 1, 3],
    'Le mot sushi est un emprunt au japonais et non à l\'espagnol.', ['etymologie', 'emprunt', 'langue']),

  MU('francais', 'etymologie', 'difficile', 'Coche les etymologies exactes.',
    ['Restaurant vient du latin restaurare.', 'Mot vient de l\'ancien français.',
      'Orange vient de l\'italien.', 'Algorithme vient du nom d\'Al-Kwarizmi.'], [0, 1, 3],
    'Le mot orange vient de l\'arabe et non de l\'italien.', ['etymologie', 'latin', 'origine']),

  GU('francais', 'etymologie', 'moyen',
    'Devine le mot : du latin festum, ce mot désigne aujourd\'hui un repas de fête somptueux.',
    ['Le festin', 'Le banquet', 'Le repas', 'La fête'], 0,
    'Le latin festum a donné le français festin, repas de gala.', ['festin', 'devine', 'mot'], 'On le sert lors des grandes occasions.'),

  // ---------------------------------------------------------------- EXPRESSIONS (12)
  Q('francais', 'expressions', 'facile', 'Que signifie l\'expression être au bout du rouleau ?',
    ['Être épuisé', 'Être très satisfait', 'Être en retard', 'Être en colère'], 0,
    'L\'image évoque un rouleau de papier entièrement consommé, donc usé.', ['expression', 'fatigue', 'sens']),

  Q('francais', 'expressions', 'facile', 'Que signifie avoir la dalle dans le langage courant ?',
    ['Être très affamé', 'Être très gai', 'Être paresseux', 'Être en colère'], 0,
    'La dalle désigne le ventre creux, donc avoir la dalle signifie avoir faim.', ['expression', 'faim', 'sens']),

  Q('francais', 'expressions', 'facile', 'Que signifie faire la sourde oreille ?',
    ['Faire semblant de ne pas entendre', 'Ne rien entendre du tout',
      'Écouter très attentivement', 'Changer de sujet brusquement'], 0,
    'On fait la sourde oreille quand on refuse délibérément d\'écouter.', ['expression', 'ecoute', 'sens']),

  Q('francais', 'expressions', 'facile', 'Que signifie être sur son trente-et-un ?',
    ['Être en pleine forme', 'Être en très mauvaise forme',
      'Être en retard', 'Être très occupé'], 0,
    'L\'épinière est en pleine forme quand elle est dans laiscard de trente et un.', ['expression', 'forme', 'sens']),

  Q('francais', 'expressions', 'difficile', 'À quel monde renvoie l\'expression noyer le poisson ?',
    ['À la pêche', 'À la chasse', 'À la navigation', 'À la cuisine'], 0,
    'L\'expression vient de la pêche : on noie le poisson pour l\'attraper.', ['expression', 'peche', 'origine']),

  Q('francais', 'expressions', 'difficile', 'Que signifie le proverbe latin Homo homini lupus ?',
    ['L\'homme est un loup pour l\'homme', 'L\'homme est un être fragile',
      'L\'homme vit en liberté', 'L\'homme fuit toujours'], 0,
    'Le proverbe latin signifie que les hommes se dégradent mutuellement.', ['expression', 'latin', 'proverbe']),

  VF('francais', 'expressions', 'facile', 'L\'expression avoir la tête ailleurs signifie être distrait.', true,
    'Avoir la tête ailleurs, c\'est penser à autre chose qu\'à ce qui se passe.', ['expression', 'distraction', 'sens']),

  VF('francais', 'expressions', 'moyen',
    'Faire d\'une pierre deux coups signifie obtenir deux effets avec un seul effort.', true,
    'Cette image vient de la pierre lancée deux fois avec un seul jet.', ['expression', 'efficacite', 'sens']),

  VF('francais', 'expressions', 'expert', 'L\'expression ouvrir la boîte de Pandore vient de la mythologie grecque.', true,
    'Pandore ouvrit le vase qui libéra tous les maux du monde.', ['expression', 'mythologie', 'origine']),

  MU('francais', 'expressions', 'moyen', 'Coche les expressions qui signifient être très fatigué.',
    ['Être au bout du rouleau', 'Être sur son trente-et-un',
      'Être sur les rotules', 'Prendre la parole'], [0, 2],
    'Être sur son trente-et-un signifie au contraire être en pleine forme.', ['expression', 'fatigue', 'sens']),

  MU('francais', 'expressions', 'difficile', 'Coche les expressions d\'origine latine.',
    ['Homo homini lupus', 'In vino veritas', 'Auf Wiedersehen', 'Manger comme un quatre'], [0, 1],
    'Auf Wiedersehen est allemand, manger comme un quatre est une image française.', ['expression', 'latin', 'origine']),

  GU('francais', 'expressions', 'moyen',
    'Devine l\'expression : elle signifie être au courant de tout ce qui se passe autour de soi.',
    ['Être au courant', 'Avoir l\'oreille fine', 'Être entre deux eaux', 'Avoir la main haute'], 0,
    'L\'expression vient de la navigation et du courant d\'une rivière.', ['expression', 'devine', 'information'], 'On l\'emploie pour parler d\'informations.'),

  // ---------------------------------------------------------------- LANGUES DU MONDE (10)
  Q('francais', 'langues', 'facile', 'Quelle est la langue officielle du Brésil ?',
    ['Le portugais', 'L\'espagnol', 'Le français', 'L\'italien'], 0,
    'Le Brésil, ancienne colonie portugaise, a pour langue officielle le portugais.', ['langue', 'bresil', 'officielle']),

  Q('francais', 'langues', 'facile', 'De quel alphabet dérive l\'alphabet cyrillique ?',
    ['De l\'alphabet grec', 'De l\'alphabet latin', 'De l\'alphabet arabe', 'De l\'alphabet runique'], 0,
    'L\'alphabet cyrillique a été créé au IXe siècle d\'après le grec.', ['alphabet', 'cyrillique', 'origine']),

  Q('francais', 'langues', 'facile', 'À quelle famille de langues appartient le hongrois ?',
    ['Finno-ougrienne', 'Indo-européenne', 'Sémitique', 'Altaïque'], 0,
    'Le hongrois n\'est pas indo-européen : il appartient à la famille finno-ougrienne.', ['hongrois', 'famille', 'langue']),

  Q('francais', 'langues', 'difficile', 'Quel roi coréen a fait créer l\'écriture hangeul au XVe siècle ?',
    ['Le roi Sejong', 'Le roi Gojong', 'Le roi Taejo', 'Le roi Sunjo'], 0,
    'Sejong fait créer le hangeul en 1443 pour l\'écriture du peuple.', ['hangeul', 'coree', 'ecriture']),

  Q('francais', 'langues', 'expert', 'Combien de systèmes d\'écriture compte la langue japonaise ?',
    ['Trois', 'Deux', 'Quatre', 'Cinq'], 0,
    'Le japonais combine les kanjis, les hiragana et les katakana.', ['japonais', 'ecriture', 'systeme']),

  VF('francais', 'langues', 'facile', 'L\'arabe s\'écrit et se lit de droite à gauche.', true,
    'L\'arabe se lit de droite à gauche, comme l\'hébreu et le persan.', ['arabe', 'ecriture', 'sens']),

  VF('francais', 'langues', 'moyen', 'Le swahili est une langue officielle de la Communauté d\'Afrique de l\'Est.', true,
    'Le swahili est la langue de plusieurs pays d\'Afrique orientale.', ['swahili', 'afrique', 'langue']),

  VF('francais', 'langues', 'expert', 'Le français et l\'espagnol appartiennent au groupe roman indo-européen.', true,
    'Ils descendent tous deux du latin populaire parlé dans l\'Empire romain.', ['francais', 'espagnol', 'famille']),

  MU('francais', 'langues', 'moyen', 'Coche les affirmations exactes sur les langues du monde.',
    ['Le hongrois n\'est pas une langue indo-européenne.', 'L\'espéranto a été créé par Zamenhof en 1887.',
      'L\'hangeul a été conçu au XVe siècle.', 'Le japonais s\'écrit avec cinq systèmes d\'écriture.'], [0, 1, 2],
    'Le japonais n\'emploie que trois systèmes d\'écriture : kanjis, hiragana et katakana.', ['langue', 'ecriture', 'histoire']),

  GU('francais', 'langues', 'moyen',
    'Devine la langue : langue officielle de la Communauté d\'Afrique de l\'Est, parlée par des dizaines de millions de personnes.',
    ['Le swahili', 'L\'amharique', 'Le haoussa', 'Le kinyarwanda'], 0,
    'Le swahili est la langue commune de plusieurs pays d\'Afrique orientale.', ['swahili', 'devine', 'langue'], 'On l\'appelle aussi kiswahili.'),
];