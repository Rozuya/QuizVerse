import { Q, VF, MU, GU } from '../helper.mjs';

export default [
  // ---------------------------------------------------------------- CUISINE FRANCAISE (20)
  Q('cuisine', 'cuisinefr', 'facile', 'De quelle ville française est originaire le cassoulet ?',
    ['Castelnaudary', 'Carcassonne', 'Nimes', 'Avignon'], 0,
    'Le cassoulet est la spécialité de Castelnaudary, dans le département de l\'Aude.', ['cassoulet', 'languedoc', 'specialite']),

  Q('cuisine', 'cuisinefr', 'facile', 'De quel lait est fait le camembert ?',
    ['De lait de vache', 'De lait de brebis', 'De lait de chevre', 'De lait de melange'], 0,
    'Le camembert est un fromage a pate molle au lait de vache produit en Normandie.', ['camembert', 'fromage', 'normandie']),

  Q('cuisine', 'cuisinefr', 'facile', 'Quel fromage sert a la fondue savoyarde ?',
    ['Le reblochon', 'Le comte', 'Le roquefort', 'Le brie'], 0,
    'La fondue savoyarde se prepare au reblochon, un fromage affine au lait de vache.', ['fondue', 'reblochon', 'savoye']),

  Q('cuisine', 'cuisinefr', 'facile', 'La choucroute garnie est une specialite de quelle region ?',
    ['L\'Alsace', 'La Bretagne', 'La Provence', 'Le Bearn'], 0,
    'La choucroute est un plat alsacien a base de chou fermente et de saucisses.', ['choucroute', 'alsace', 'specialite']),

  Q('cuisine', 'cuisinefr', 'facile', 'Quelle boisson anisee est emblematique de Marseille ?',
    ['Le pastis', 'Le calvados', 'La benedictine', 'Le kir'], 0,
    'Le pastis, melange d\'anise et de licorice, est la boisson du sud de la France.', ['pastis', 'marseille', 'boisson']),

  Q('cuisine', 'cuisinefr', 'moyen', 'Quelle ville est surnommee la capitale de la gastronomie ?',
    ['Lyon', 'Bordeaux', 'Paris', 'Marseille'], 0,
    'Lyon tient ce titre grace a ses bouchons et a sa grande ecole hoteliere.', ['lyon', 'gastronomie', 'ville']),

  Q('cuisine', 'cuisinefr', 'moyen', 'Quel mets est une specialite lyonnaise ?',
    ['La quenelle', 'La bouillabaisse', 'Le cassoulet', 'La tourtiere'], 0,
    'La quenelle est une preparation de viande ou de poisson de forme oblongue.', ['quenelle', 'lyon', 'specialite']),

  Q('cuisine', 'cuisinefr', 'difficile', 'Dans quelle region est produit le fromage Comte ?',
    ['Franche-Comte', 'Normandie', 'Bretagne', 'Aquitaine'], 0,
    'Le Comte est produit dans le massif du Jura, a cheval sur le Jura et la Savoie.', ['comte', 'fromage', 'jura']),

  Q('cuisine', 'cuisinefr', 'facile', 'La bouillabaisse est une specialite de quel pays ?',
    ['La France', 'L\'Italie', 'L\'Espagne', 'La Grece'], 0,
    'La bouillabaisse est une soupe de poissons provençale née a Marseille.', ['bouillabaisse', 'provence', 'soupe']),

  Q('cuisine', 'cuisinefr', 'facile', 'Comment s\'appelle un ragoût de boeuf mijote avec des legumes ?',
    ['Le pot-au-feu', 'Le cassoulet', 'Le flan', 'La blanquette'], 0,
    'Le pot-au-feu tire son nom de son recipient en fonte et non de son contenu.', ['pot au feu', 'boeuf', 'ragoût']),

  Q('cuisine', 'cuisinefr', 'expert', 'Quelle volaille beneficie de l\'appellation AOP en Bresse ?',
    ['Le poulet de Bresse', 'Le canard de Challans', 'La pintade du Gers', 'Le d\'oie de Vendée'], 0,
    'Le poulet de Bresse est la seule volailleimmune a la contamination de la maladie.', ['poulet de bresse', 'aop', 'volaille']),

  Q('cuisine', 'cuisinefr', 'expert', 'Quelle charcuterie de Vire est une saucisse assaisonnee au piment ?',
    ['L\'andouille de Vire', 'Le saucisson de Toulouse', 'Le boudin de Nevers', 'Le cervelas'], 0,
    'L\'andouille de Vire est une specialite charcutiere de Normandie au piment.', ['andouille', 'normandie', 'charcuterie']),

  VF('cuisine', 'cuisinefr', 'facile', 'La choucroute garnie est une specialite alsacienne.', true,
    'Ce plat au chou fermente et aux sausages est emblematique de l\'Alsace.', ['choucroute', 'alsace', 'specialite']),

  VF('cuisine', 'cuisinefr', 'facile', 'Le camembert est un fromage au lait de vache.', true,
    'A l\'inverse du Roquefort, le camembert n\'est pas un fromage au lait de brebis.', ['camembert', 'fromage', 'lait']),

  VF('cuisine', 'cuisinefr', 'moyen', 'Le boeuf bourguignon est un plat de Bourgogne.', true,
    'Ce ragoût de boeuf au vin rouge est servi avec des pates ou des pommes.', ['boeuf bourguignon', 'bourgogne', 'ragoût']),

  VF('cuisine', 'cuisinefr', 'moyen', 'Le Roquefort est un fromage au lait de brebis.', true,
    'Le Roquefort est affine dans les caves du Larzac, contrairement au camembert.', ['roquefort', 'fromage', 'brebis']),

  VF('cuisine', 'cuisinefr', 'difficile', 'Le cassoulet est une specialite de Castelnaudary.', true,
    'La ville de Castelnaudary revendique ce plat a base de haricots blancs.', ['cassoulet', 'castelnaudary', 'specialite']),

  MU('cuisine', 'cuisinefr', 'moyen', 'Coche les plats qui sont des recettes francaises.',
    ['Le cassoulet', 'La pasta carbonara', 'La bouillabaisse', 'Le boeuf bourguignon'], [0, 2, 3],
    'La pasta carbonara est italienne, les trois autres recettes sont francaises.', ['cuisine francaise', 'plats', 'specialites']),

  MU('cuisine', 'cuisinefr', 'difficile', 'Coche les affirmations exactes sur les fromages francais.',
    ['Le camembert est au lait de vache.', 'Le Roquefort est au lait de brebis.',
      'Le reblochon est au lait de chevre.', 'Le brie est toujours au lait de brebis.'], [0, 1],
    'Le reblochon est au lait de vache et le brie se fabrique indifféremment avec du lait de vache.', ['fromage', 'lait', 'cuisine francaise']),

  GU('cuisine', 'cuisinefr', 'moyen',
    'Devine le plat : ragoût de haricots blancs, de saucisses et de morceaux de magret de canard.',
    ['Le cassoulet', 'La bouillabaisse', 'Le pot-au-feu', 'La quenelle'], 0,
    'Le cassoulet est servi croustillant et traditionnellement briqueté au bois.', ['cassoulet', 'devine', 'plat'], 'Il vient du sud de la France.'),

  // ---------------------------------------------------------------- CUISINE ITALIENNE (16)
  Q('cuisine', 'cuisineit', 'facile', 'Dans quelle ville italienne est nee la pizza ?', ['Naples', 'Rome', 'Milan', 'Florence'], 0,
    'La pizzanapolitaine est nee a Naples, ou elle est toujours cue au feu de bois.', ['pizza', 'naples', 'origine']),

  Q('cuisine', 'cuisineit', 'facile', 'Que rappellent les couleurs de la pizza Margherita ?',
    ['Le drapeau italien', 'Le drapeau francais', 'Le drapeau grec', 'Le drapeau espagnol'], 0,
    'Rouge, blanc et vert rappellent le drapeau italien et les couleurs de l\'Italie.', ['margherita', 'couleurs', 'pizza']),

  Q('cuisine', 'cuisineit', 'facile', 'Quel fromage entre dans la pizza napolitaine ?',
    ['La mozzarella', 'Le cheddar', 'Le gorgonzola', 'Le parmesan'], 0,
    'La mozzarella fond en filamentsstrom est la base des pizzas napolitaines.', ['pizza', 'mozzarella', 'naples']),

  Q('cuisine', 'cuisineit', 'facile', 'Quelle ville est celebre pour son pesto au basilic ?',
    ['Genees', 'Bologne', 'Naples', 'Venise'], 0,
    'Le pesto de Genes se prepare au basilic frais, a l\'ail, aux pignons et au pecorino.', ['pesto', 'genes', 'basilic']),

  Q('cuisine', 'cuisineit', 'difficile', 'Quel plat de Bologne est un ragoût de viande servi avec des pates ?',
    ['La sauce bolognaise', 'La carbonara', 'Le risotto', 'Le tiramisu'], 0,
    'La sauce bolognaise, ou ragù, se sert avec des pates longues comme les tagliatelle.', ['bologne', 'rague', 'pates']),

  Q('cuisine', 'cuisineit', 'moyen', 'Dans quelle region se trouve Parme, berceau du parmesan ?',
    ['L\'Emilie-Romagne', 'La Toscane', 'Le Piedmont', 'La Sicile'], 0,
    'Le parmigiano-reggiano est produit en Emilie-Romagne autour de Parme.', ['parme', 'parmesan', 'region']),

  Q('cuisine', 'cuisineit', 'moyen', 'Quelle pâtisserie de Naples est faite de strates de pate feuilletee et de creme ?',
    ['La sfogliatella', 'La baba', 'Le cannolo', 'Le cornetto'], 0,
    'La sfogliatella napolitaine a une croûte feuilletée et un coeur de ricotta.', ['sfogliatella', 'naples', 'patisserie']),

  Q('cuisine', 'cuisineit', 'expert', 'Quel plat milanais est un jarret de veau braise aux legumes ?',
    ['L\'osso buco', 'La porchetta', 'La cotoletta', 'Il risotto'], 0,
    'L\'osso buco se sert avec le risotto alla milanese et sa sauge.', ['osso buco', 'milan', 'viande']),

  Q('cuisine', 'cuisineit', 'expert', 'Quelle especialite italienne est une galette de mais cuite puis grillee ?',
    ['La polenta', 'La focaccia', 'Le panzerotto', 'La piadina'], 0,
    'La polenta est a base de semoule de mais et se sert chaude ou grillée.', ['polenta', 'mais', 'specialite']),

  VF('cuisine', 'cuisineit', 'facile', 'La pizza Margherita associe tomate, mozzarella et basilic.', true,
    'Ses couleurs rappellent le drapeau italien, d\'ou son nom de Margherita.', ['margherita', 'pizza', 'ingredients']),

  VF('cuisine', 'cuisineit', 'facile', 'La mozzarella di bufala est un fromage au lait de bufflonne.', true,
    'Elle se distingue de la mozzarella de vache par son goût plus prononcé.', ['mozzarella', 'bufflonne', 'fromage']),

  VF('cuisine', 'cuisineit', 'moyen', 'Le tiramisu est un dessert au mascarpone, au cacao et au cafe.', true,
    "Le tiramisu est un gateau froid trempe de biscuits au cafe.", ['tiramisu', 'mascarpone', 'dessert']),

  VF('cuisine', 'cuisineit', 'difficile', 'La pizza quattro stagioni combine quatre garnitures differentes.', true,
    'Ses quatre quartiers rappellent les quatre saisons de l\'annee.', ['quattro stagioni', 'pizza', 'ingredients']),

  MU('cuisine', 'cuisineit', 'moyen', 'Coche les recettes qui sont italiennes.',
    ['La pizza', 'Le sashimi', 'Les pates', 'Le gumbo'], [0, 2],
    'Le sashimi est japonais et le gumbo est une soupe du sud des Etats-Unis.', ['cuisine italienne', 'specialites', 'plats']),

  MU('cuisine', 'cuisineit', 'difficile', 'Coche les affirmations exactes sur la cuisine italienne.',
    ['La pizza est nee a Naples.', 'Le pesto est lie a la ville de Genes.',
      'Le tiramisu est une specialite napolitaine.', 'La polenta est preparee avec du ble.'], [0, 1],
    'Le tiramisu est d\'origine venitienne et la polenta se prepare avec du mais.', ['cuisine italienne', 'origine', 'ingredients']),

  GU('cuisine', 'cuisineit', 'moyen',
    'Devine le plat : couches de biscuits imbibes de cafe, de creme au mascarpone et de cacao.',
    ['Le tiramisu', 'La panna cotta', 'Le zabaglione', 'La gelato'], 0,
    'Le tiramisu se sert tres frais et se nomme litteralement la bouffee qui emporte.', ['tiramisu', 'devine', 'dessert'], 'C\'est un dessert italien.'),

  // ---------------------------------------------------------------- CUISINE JAPONAISE (16)
  Q('cuisine', 'cuisinejp', 'facile', 'Quel plat est compose de riz vineigre et de poisson cru ?',
    ['Le sushi', 'Le ramen', 'Le soba', 'Le tempura'], 0,
    'Le sushi est ne au Japon, ou le riz vineigre se nomme shari.', ['sushi', 'riz', 'poisson']),

  Q('cuisine', 'cuisinejp', 'facile', 'Comment appelle-t-on les boulettes de riz triangulaires sous une feuille d\'algue ?',
    ['Les onigiri', 'Les makis', 'Les gyoza', 'Les temaki'], 0,
    'Un onigiri est un triangle de riz serre dans une feuille de nori.', ['onigiri', 'riz', 'algue']),

  Q('cuisine', 'cuisinejp', 'facile', 'Quel plat se prepare avec des fines nouilles de sarrasin ?',
    ['Le soba', 'L\'udon', 'Le ramen', 'Le yakisoba'], 0,
    'Le soba est une pâte de sarrasin servie froide avec sauce de soja.', ['soba', 'sarrasin', 'nouilles']),

  Q('cuisine', 'cuisinejp', 'facile', 'Quelle algue sert a envelopper les makis ?',
    ['Le nori', 'Le kombu', 'Le wakamé', 'Le fucusa'], 0,
    'Le nori est une algue marine sechee, employee dans de nombreux plats.', ['nori', 'algue', 'maki']),

  Q('cuisine', 'cuisinejp', 'moyen', 'Quel condiment vert et piquant accompagne les sashimis ?',
    ['Le wasabi', 'La sauce soja', 'Le shoyu', 'Le mirin'], 0,
    'Le wasabi releve le poisson cru, mais on le consomme en tres petite dose.', ['wasabi', 'sashimi', 'condiment']),

  Q('cuisine', 'cuisinejp', 'difficile', 'Comment s\'appellent les raviolis japonais cuits a la vapeur ?',
    ['Les gyoza', 'Les ravioli', 'Les nems', 'Les samosas'], 0,
    "Les gyoza, d'origine chinoise, se distinguent par leur peau fine et translucide.", ['gyoza', 'ravioli', 'vapeur']),

  Q('cuisine', 'cuisinejp', 'moyen', 'Quelle soupe est faite de tofu, d\'algues et de pate de soja fermentee ?',
    ['Le miso soup', 'Le ramen', 'Le soba', 'L\'udon'], 0,
    'Le miso, fermented soybean paste, est la base de nombreuses soupes japonaises.', ['miso', 'soupe', 'tofu']),

  Q('cuisine', 'cuisinejp', 'difficile', 'Quel plat est considere comme la cuisine japonaise la plus raffinee ?',
    ['Le kaiseki', 'Le sukiyaki', 'Le yoshoku', 'Le bento'], 0,
    'Le kaiseki est un repas de plusieurs services, saisonnier et très dynamique.', ['kaiseki', 'raffine', 'cuisine japonaise']),

  Q('cuisine', 'cuisinejp', 'expert', 'Quel alcool de riz distille est traditionnel a Okinawa ?',
    ['L\'awamori', 'Le shochu', 'Le sake', 'Le happoshu'], 0,
    'L\'awamori est le spiritueux le plus consomme a Okinawa et dans le sud du Japon.', ['awamori', 'okinawa', 'alcool']),

  VF('cuisine', 'cuisinejp', 'facile', 'Le sashimi se compose de poisson cru sans riz.', true,
    'Le sashimi est du poisson tranché très fin, alors que le sushi contient du riz.', ['sashimi', 'poisson', 'riz']),

  VF('cuisine', 'cuisinejp', 'facile', 'Le riz est la base de la alimentation japonaise.', true,
    'Le riz represente encore la plus grande part des calories consommees au Japon.', ['riz', 'alimentation', 'japon']),

  VF('cuisine', 'cuisinejp', 'moyen', 'Le teriyaki est une sauce de soja sucree servant a napper les brochettes.', true,
    'Le teriyaki est l\'une des sauces les plus populaires de la cuisine japonaise.', ['teriyaki', 'sauce', 'brochette']),

  VF('cuisine', 'cuisinejp', 'difficile', 'Le matcha est un the vert en poudre utilise dans la ceremonie du the.', true,
    'Le matcha est batto dans une coupe pour obtenir une mousse verte.', ['matcha', 'the', 'ceremonie']),

  MU('cuisine', 'cuisinejp', 'moyen', 'Coche les recettes japonaises.',
    ['Le soba', 'Le tiramisu', 'Le gyoza', 'Le wasabi'], [0, 2],
    'Le tiramisu est italien et le wasabi est un condiment et non un plat.', ['cuisine japonaise', 'plats', 'specialites']),

  MU('cuisine', 'cuisinejp', 'difficile', 'Coche les affirmations exactes sur la cuisine japonaise.',
    ['Le sashimi contient du riz.', 'Le onigiri est une boulette de riz.',
      'Le kaiseki est un repas raffine.', 'Le sake se boit glacé dans de grandes tasses.'], [1, 2],
    'Le sashimi se compose de poisson seul et le sake se boit traditionnellement tiede.', ['cuisine japonaise', 'riz', 'boisson']),

  GU('cuisine', 'cuisinejp', 'moyen',
    'Devine le plat : rouleau de riz et d\'algue nori garni de poisson et de legumes.',
    ['Le maki sushi', 'Le onigiri', 'Le gyoza', 'Le soba'], 0,
    'Le maki se coupe en rondelles et se plonge dans la sauce soja.', ['maki', 'devine', 'sushi'], 'On le mange avec des baguettes.'),

  // ---------------------------------------------------------------- CUISINE AMERICaine (16)
  Q('cuisine', 'cuisineus', 'facile', 'Quel dessert est traditionnellement servi au Thanksgiving ?',
    ['La pumpkin pie', 'La key lime pie', 'La pecan pie', 'L\'apple pie'], 0,
    'La pumpkin pie, tarte a la citrouille, ouvre le repas traditionnel de Thanksgiving.', ['thanksgiving', 'pumpkin pie', 'dessert']),

  Q('cuisine', 'cuisineus', 'facile', 'Quelle boisson gazeuse a ete creee dans une pharmacie americaine en 1886 ?',
    ['Le coca-cola', 'Le Pepsi', 'Le Dr Pepper', 'Le Sprite'], 0,
    'John Pemberton a compose le coca-cola a Atlanta, comme remede contre les maux de tete.', ['coca cola', '1886', 'boisson']),

  Q('cuisine', 'cuisineus', 'facile', 'Quel plat est prepare avec des pates courtes et du fromage fondu ?',
    ['Le mac and cheese', 'Les spatzles', 'Le risotto', 'La polenta'], 0,
    'Le mac and cheese, dit el macaroni cheese, est une specialite americaine tres populaire.', ['mac and cheese', 'pates', 'fromage']),

  Q('cuisine', 'cuisineus', 'facile', 'Quelle speciality americaine est faite de grains de mais frits et assaisonnes ?',
    ['Les corn chips', 'Les popcorn', 'Les pretzels', 'Les crackers'], 0,
    'Les corn chips, frits au mais, sont differs des chips de pommes de terre.', ['corn chips', 'mais', 'snack']),

  Q('cuisine', 'cuisineus', 'facile', 'Quelle viande sert-on dans la plupart des familles au Thanksgiving ?',
    ['La dinde', 'Le poulet roti', 'Le boeuf braise', 'L\'oie'], 0,
    'La dinde roast de la campagne americaine fait partie de l\'assiette de Thanksgiving.', ['thanksgiving', 'dinde', 'viande']),

  Q('cuisine', 'cuisineus', 'moyen', 'Quel plat tex-mex est un rague de viande hachee servi dans un bol ?',
    ['Le chili con carne', 'Le burrito', 'Les nachos', 'La quesadilla'], 0,
    'Le chili con carne mêle viande hachee, haricots rouges, mais et tomates.', ['chili con carne', 'tex mex', 'viande']),

  Q('cuisine', 'cuisineus', 'expert', 'Quel sandwich de La Nouvelle-Orleans est fait de crevettes et de sauce piquante ?',
    ['Le shrimp po-boy', 'Le cheesesteak', 'Le Reuben', 'Le banh mi'], 0,
    "Le po-boy vient de la tradition du poor boy, de tres bon marche.", ['po boy', 'crevettes', 'sandwich']),

  Q('cuisine', 'cuisineus', 'difficile', 'Quel sandwich americain associe pain de mie, fromage, cornichon et moutarde ?',
    ['Le Reuben', 'Le grilled cheese', 'Le cheeseburger', 'Le hot dog'], 0,
    'Le Reuben, d\'origine-rows passerelle new-yorkaise, se chauffe au four.', ['reuben', 'sandwich', 'fromage']),

  Q('cuisine', 'cuisineus', 'difficile', 'Quel gateau americain en couches, imbib e de cafe et couvert de glaçage, vient du Sud ?',
    ['Le carrot cake', 'Le cheesecake', 'Le brownie', 'Le banana bread'], 0,
    'Le carrot cake est un cake aux carottes et aux epices, souvent glace au cream cheese.', ['carrot cake', 'gateau', 'sud']),

  VF('cuisine', 'cuisineus', 'facile', 'Le Thanksgiving americain est celebre le quatrieme jeudi de novembre.', true,
    'Ce jour-la est un jour ferie federal aux Etats-Unis depuis 1941.', ['thanksgiving', 'novembre', 'fete']),

  VF('cuisine', 'cuisineus', 'facile', 'Le mac and cheese est un plat de pates au fromage.', true,
    'Il se prepare soit avec du cheddar rape, soit avec du fromage américain en tranches.', ['mac and cheese', 'pates', 'fromage']),

  VF('cuisine', 'cuisineus', 'moyen', 'La key lime pie est une tarte americaine au citron vert.', true,
    'Sa croute est faite de biscuits secs et sa garniture au citron.', ['key lime pie', 'citron', 'tarte']),

  VF('cuisine', 'cuisineus', 'difficile', 'Les hush puppies sont des beignets de mais frits.', true,
    'Ils se servent en accompagnement du poisson frit dans le Sud.', ['hush puppies', 'mais', 'beignet']),

  MU('cuisine', 'cuisineus', 'moyen', 'Coche les recettes americaines.',
    ['Le mac and cheese', 'Le cassoulet', 'Les hush puppies', 'Le chili con carne'], [0, 2, 3],
    'Le cassoulet est un plat du sud de la France, les trois autres sont americains.', ['cuisine americaine', 'plats', 'specialites']),

  MU('cuisine', 'cuisineus', 'difficile', 'Coche les affirmations exactes sur la cuisine americaine.',
    ['Le coca-cola a ete cree en 1886.', 'Le Thanksgiving a lieu en novembre.', 'La pumpkin pie est un dessert.',
      'Le Reuben est un sandwich au poisson.'], [0, 1, 2],
    'Le Reuben est un sandwich au boeufsale et non au poisson.', ['cuisine americaine', 'histoire', 'plats']),

  GU('cuisine', 'cuisineus', 'moyen',
    'Devine le plat : pain de mie, boeuf fume, fromage fondu, cornichon et moutarde.',
    ['Le Reuben', 'Le grilled cheese', 'Le cheeseburger', 'Le hot dog'], 0,
    'Le Reuben est un classique de la cuisine casual americaine.', ['reuben', 'devine', 'sandwich'], 'On le sert chaud et grille.'),

  // ---------------------------------------------------------------- GASTRONOMIE MONDIALE (16)
  Q('cuisine', 'cuisineworld', 'facile', 'Quel plat mexicain se mange dans une feuille de mais ou sur une tortilla ?',
    ['La taco', 'Le burrito', 'La tamale', 'La salsa'], 0,
    'La taco est garnie de viande, de salade et de salsa, puis escurtee.', ['taco', 'mexique', 'specialite']),

  Q('cuisine', 'cuisineworld', 'facile', 'Quelle soupe espagnole se sert froide en ete ?',
    ['Le gazpacho', 'Le salmorejo', 'La fabada', 'Le pisto'], 0,
    'Le gazpacho est mixe et servi glace, ce qui rafraichit la chaleur andalouse.', ['gazpacho', 'espagne', 'soupe']),

  Q('cuisine', 'cuisineworld', 'facile', 'Quel plat coreen est un bol de riz melange avec des legumes et un oeuf ?',
    ['Le bibimbap', 'Le bulgogi', 'Le tteokbokki', 'Le kimchi'], 0,
    "Le bibimbap se sert dans un bol en inox avec tous ses ingredients melanges.", ['bibimbap', 'coree', 'riz']),

  Q('cuisine', 'cuisineworld', 'facile', 'Quelle soupe thailandaise est epicée et contient du lait de coco ?',
    ['Le tom yum', 'Le pho', 'Le ramen', 'Le pad thaï'], 0,
    'Le tom yum est une soupe claire au galanga, au citron vert et aux herbes.', ['tom yum', 'thailande', 'soupe']),

  Q('cuisine', 'cuisineworld', 'moyen', 'Quel plat du Maroc est un rague de poulet, d\'olives et d\'amandes ?',
    ['Le tagine', 'Le couscous', 'La pastilla', 'La harira'], 0,
    'Le tagine se cuit lentement dans une tagine en terre cuite.', ['tagine', 'maroc', 'raguet']),

  Q('cuisine', 'cuisineworld', 'moyen', 'Quelle soupe vietnamienne de nouilles de riz au boeuf est un symbole national ?',
    ['Le pho', 'Le bun cha', 'Le ca phe sua', 'Le goi cuon'], 0,
    'Le pho se consomme au petit dejeuner, avec du basilic, du lime et du pousses.', ['pho', 'vietnam', 'soupe']),

  Q('cuisine', 'cuisineworld', 'moyen', 'Quel plat indonesien est un riz saute accompagne de satay ?',
    ['Le nasi goreng', 'Le rendang', 'Le gado gado', 'Le nasi uduk'], 0,
    'Le nasi goreng est un plat national, accompagne de serie et de satay.', ['nasi goreng', 'indonesie', 'riz']),

  Q('cuisine', 'cuisineworld', 'expert', 'Quel plat du nord de l\'Inde est un curry de poulet au beurre et aux creme ?',
    ['Le butter chicken', 'Le biryani', 'Le chana masala', 'Le palak paneer'], 0,
    'Le butter chicken a ete cree a Delhi puis exporte dans le monde entier.', ['butter chicken', 'inde', 'curry']),

  Q('cuisine', 'cuisineworld', 'difficile', 'De quelle cereale est fait le couscous ?',
    ['De ble dur', 'De riz', 'D\'orge', 'De mais'], 0,
    'Le couscous est prepare avec de la semoule de ble dur et de l\'eau.', ['couscous', 'ble', 'cereale']),

  VF('cuisine', 'cuisineworld', 'facile', 'Le pad thaï est un plat de nouilles de riz thailandaises.', true,
    'Ses nouilles de riz sont sautees avec des crevettes, un oeuf et des cacahuètes.', ['pad thaï', 'nouilles', 'thailande']),

  VF('cuisine', 'cuisineworld', 'facile', 'Le houmous est une preparation du Moyen-Orient a base de pois chiches.', true,
    'Il se consomme froid, emulsifie avec de l\'huile d\'olive et du tahini.', ['houmous', 'moyen orient', 'pois chiches']),

  VF('cuisine', 'cuisineworld', 'moyen', 'La paella est une especialite espagnole.', true,
    "La paella se prepare dans un large plat et melange riz, fruits de mer et legumes.", ['paella', 'espagne', 'riz']),

  VF('cuisine', 'cuisineworld', 'difficile', 'Le bibimbap est un plat coréen servi dans un bol.', true,
    'Ses ingredients sont melanges juste avant de manger.', ['bibimbap', 'coree', 'bol']),

  MU('cuisine', 'cuisineworld', 'moyen', 'Coche les recettes asiatiques.',
    ['Le pho', 'Le cassoulet', 'Le bibimbap', 'Le pad thaï'], [0, 2, 3],
    'Le cassoulet est un plat du sud de la France et non un plat asiatique.', ['cuisine asiatique', 'plats', 'specialites']),

  MU('cuisine', 'cuisineworld', 'difficile', 'Coche les affirmations exactes sur la gastronomie mondiale.',
    ['Le couscous est a base de ble dur.', 'La paella est une especialite espagnole.',
      'Le sushi est une specialite chinoise.', 'Le houmous est libanais.'], [0, 1, 3],
    'Le sushi est une specialite japonaise et le houmous est libanais ou levantin.', ['gastronomie mondiale', 'origine', 'plats']),

  GU('cuisine', 'cuisineworld', 'moyen',
    'Devine le plat : nouilles de riz sautees, crevettes, oeuf, cacahuetes et sauce de tamarin.',
    ['Le pad thaï', 'Le pho', 'Le ramen', 'Le tom yum'], 0,
    'Le pad thaï se mange avec des cgemporary baguettes et un citron.', ['pad thaï', 'devine', 'nouilles'], 'C\'est un plat thaïlandais.'),

  // ---------------------------------------------------------------- TECHNIQUES CULINAIRES (12)
  Q('cuisine', 'techniques', 'facile', 'Quelle technique consiste a cuire lentement dans un peu de liquide ?',
    ['Le braisage', 'L\'ebullition', 'La friteuse', 'Le grillage'], 0,
    "Le braisage laisse ensuite le temps a l'aliment d'absorber les saveurs.", ['braisage', 'cuisson', 'technique']),

  Q('cuisine', 'techniques', 'facile', 'Comment appelle-t-on la concentration d\'une sauce par evaporation ?',
    ['La reduction', 'La mouture', 'L\'emulsion', 'La macération'], 0,
    'La reduction concentre le gout en faisant evaporer l\'eau de la sauce.', ['reduction', 'sauce', 'technique']),

  Q('cuisine', 'techniques', 'facile', 'Comment appelle-t-on la cuisson d\'un aliment dans une grande quantité d\'eau bouillante ?',
    ['L\'ebullition', 'Le pochage', 'L\'etuve', 'La braise'], 0,
    'L\'ebullition se fait a gros bouillons, contrairement au pochage a feu doux.', ['ebullition', 'cuisson', 'eau']),

  Q('cuisine', 'techniques', 'difficile', 'Comment s\'appelle la couche de farine ou de chapelure qui protege un aliment frit ?',
    ['La panure', 'La sauce', 'La croûte', 'La brume'], 0,
    'La panure isole la chair de l\'huile et donne du croustillant.', ['panure', 'frite', 'technique']),

  Q('cuisine', 'techniques', 'expert', 'Comment s\'appelle la cuisson d\'un aliment dans un sac scelle a temperature controlee ?',
    ['La cuisson sous vide', 'La cuisson en papillote', 'La cuisson a la vapeur', 'La cuisson au bain-marie'], 0,
    'La cuisson sous vide chauffe tres precisement un aliment scelle sous vide.', ['cuisson sous vide', 'temperature', 'technique']),

  Q('cuisine', 'techniques', 'difficile', 'Comment appelle-t-on la preparation d\'un aliment en petits morceaux tres fins ?',
    ['Le hachage', 'Le julienne', 'Le brunoise', 'Le chiffonade'], 0,
    'Le julienne et le brunoise sont deux coupes precises, fines ou tres fines.', ['hachage', 'coupe', 'technique']),

  VF('cuisine', 'techniques', 'facile', 'La mise en place consiste a preparer tous les ingredients avant de cuisiner.', true,
    'Sans mise en place, chaque ingredient demande une interruption en plein service.', ['mise en place', 'preparation', 'technique']),

  VF('cuisine', 'techniques', 'facile', 'Le pochage consiste a cuire un aliment dans un liquide a feu doux.', true,
    'Le pochage, aussi appele cuisson a l\'etouffee, preserve le jus de l\'aliment.', ['pochage', 'cuisson', 'feu doux']),

  VF('cuisine', 'techniques', 'difficile', 'La lyophilisation consiste a congeler puis a deshydrater sous vide.', true,
    'La lyo (« solution ») et philie (« aimer ») decrivent ce procede de sechage.', ['lyophilisation', 'sechage', 'technique']),

  MU('cuisine', 'techniques', 'moyen', 'Coche les techniques culinaires.',
    ['La mise en place', 'Le flambage', 'Le braisage', 'La meduse'], [0, 2],
    'Le flambage est une technique de cuisson, pas une meduse qui ne peut pas l\'etre.', ['technique', 'cuisson', 'gastronomie']),

  MU('cuisine', 'techniques', 'difficile', 'Coche les affirmations exactes sur les techniques.',
    ['Une emulsion melange deux liquides non miscibles.', 'La reduction augmente le volume de la sauce.',
      'Le bain-marie permet une cuisson a temperature douce.', 'Une sauce a la moutarde n\'est pas une emulsion.'], [0, 2],
    'La reduction diminue le volume et une sauce a la moutarde est bien une emulsion.', ['technique', 'emulsion', 'reduction']),

  GU('cuisine', 'techniques', 'moyen',
    'Devine la technique : le chef verse du cognac dans la poele et l\'enflamme quelques secondes.',
    ['Le flambage', 'Le pochage', 'L\'infusion', 'La reduction'], 0,
    'Le flambage rejette l\'alcool et donne au plat une note sucree.', ['flambage', 'devine', 'technique'], 'On l\'utilise avec les crepes.'),
];