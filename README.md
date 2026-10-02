# QuizVerse

### **QuizVerse — Teste tes connaissances**

**QuizVerse** est une plateforme de quiz **100 % solo**, pensée pour une seule personne sur son
navigateur : pas de compte, pas de connexion, pas de serveur, pas de multijoueur.
Tout fonctionne **localement**, et le site est un **site statique** prêt à être publié sur
**GitHub Pages**.

| | |
|---|---|
| 🧠 Questions | **2 520 questions** (objectif dépassé) |
| 🗂️ Catégories | **10 grandes catégories · 103 univers** |
| 🎮 Quiz | **420+ quiz** générés automatiquement |
| 🏅 Badges | **72 badges** |
| 🏷️ Titres | **24 titres** à débloquer et à équiper |
| 🎯 Défis | **39 défis** (quotidiens, hebdomadaires, permanents) |
| 🎮 Modes de jeu | **12 modes** |
| 🎵 Musique | **6 musiques + 8 effets sonores**, synthétisés dans le navigateur |
| 🔒 Serveur | **aucun** |
| 💾 Sauvegarde | **localStorage**, exportable en un fichier |

---

## 📑 Sommaire

1. [Ce que fait QuizVerse](#1--ce-que-fait-quizverse)
2. [Démarrage rapide](#2--démarrage-rapide)
3. [COMMENT METTRE QUIZVERSE SUR GITHUB](#3--comment-mettre-quizverse-sur-github)
4. [Structure du projet](#4--structure-du-projet)
5. [Ajouter des questions](#5--ajouter-des-questions)
6. [Ajouter ou modifier une catégorie](#6--ajouter-ou-modifier-une-catégorie)
7. [Comment la sauvegarde fonctionne](#7--comment-la-sauvegarde-fonctionne)
8. [Comment fonctionne la musique](#8--comment-fonctionne-la-musique)
9. [Accessibilité et responsive](#9--accessibilité-et-responsive)
10. [Limites du fonctionnement local](#10--limites-du-fonctionnement-local)
11. [FAQ](#11--faq)

---

## 1. Ce que fait QuizVerse

### Jouer

- **12 modes de jeu** : Classique, Rapide (5 questions), Long (20–30), Expert, Chrono (temps limité),
  Survie (1 erreur = fini), Infini (jusqu'à la première erreur), Parfait (objectif 100 %),
  Aléatoire, Mix (plusieurs catégories), Quiz du jour, Surprends-moi.
- **5 formats** : 5, 10, 20, 30 ou 50 questions.
- **4 difficultés** : 🟢 Facile · 🟡 Moyen · 🟠 Difficile · 🔴 Expert.
- **6 types de questions** : QCM, Vrai/Faux, plusieurs réponses, devine le personnage / le film /
  l'anime / le joueur, question illustrée.
- **Mode personnalisé** : tu choisis exactement les catégories, les univers, la difficulté,
  le nombre de questions, les types, le temps et le mode.

### Après chaque réponse

Que la réponse soit **juste ou fausse**, QuizVerse affiche :

- le verdict (bonne / mauvaise / partielle / temps écoulé) ;
- **ta réponse** et **la bonne réponse** ;
- une **explication détaillée** : *pourquoi* c'est juste (ou pourquoi la bonne réponse est la bonne) ;
- les **mots-clés** et le temps que tu as mis ;
- les **sources cliquables** (Wikipédia en français) pour comprendre et vérifier.

### Progresser

- **XP et niveaux** (jusqu'au niveau 100) : le score dépend de la difficulté, de ta rapidité et de ta série.
- **72 badges** qui se débloquent automatiquement.
- **24 titres** à débloquer, et tu choisis celui qui te plaît.
- **Statistiques** détaillées avec graphiques : XP cumulé, score par partie, XP par jour, répartition
  par catégorie, par difficulté, par mode, par type de question, carte d'activité.
- **Progression par univers** : questions maîtrisées, taux de réussite, meilleur score, niveau de maîtrise.
- **Système de maîtrise** : 🔵 Parfaite · 🟢 Maîtrisée · 🟡 Connue · 🟠 À apprendre · 🔴 Jamais réussie.
- **Mes erreurs** : toutes les questions ratées sont conservées et rejouables.
- **Mes connaissances** : la page complète de suivi de la maîtrise.
- **Historique** complet (date, heure, quiz, mode, score, %, temps) avec bouton **REJOUER**.
- **Favoris** : quiz et catégories.
- **Défis** quotidiens, hebdomadaires et permanents, avec récompense à réclamer.
- **Quiz du jour** : un quiz différent chaque jour, une seule récompense par jour.
- **Recommandations** calculées uniquement à partir de tes données locales.

### Personnaliser

- **5 thèmes** : Dark · AMOLED · Light · Neon · Cyber (mémorisé).
- **25 avatars** vectoriels (gaming, futuristes, animaux, robots, symboles, abstraits).
- **Pseudo** et **titre** freely choice.
- Réglage du volume de la musique, des effets sonores, réduction des animations.

---

## 2. Démarrage rapide

QuizVerse a besoin d'être servi par un petit serveur web (c'est le cas sur GitHub Pages).

### Avec Node.js (recommandé)

Aucune installation supplémentaire, le serveur est fourni :

```bash
cd QuizVerse
node tools/serve.mjs
```

Puis ouvre **<http://localhost:8000>**.

> Pour changer de port : `node tools/serve.mjs 3000`

### Avec npx (si Node est installé)

```bash
npx serve .
```

### Avec Python

```bash
python -m http.server 8000
```

> ⚠️ **Pourquoi pas un double-clic sur `index.html` ?**
> En ouvrant le fichier directement (`file://`), le navigateur interdit à JavaScript de lire les
> données locales, et le site affiche un message d'explication. C'est un comportement du navigateur,
> pas un bug : QuizVerse doit passer par un serveur (GitHub Pages, ou le petit serveur ci-dessus).

---

## 3. COMMENT METTRE QUIZVERSE SUR GITHUB

Voici la marche à suivre, étape par étape, même sans connaître Git.

### Étape 1 — Créer un compte GitHub (si besoin)

Va sur **<https://github.com/signup>** et crée un compte gratuit.

### Étape 2 — Créer le dépôt

1. Sur GitHub, clique sur le bouton **+** en haut à droite, puis **New repository**.
2. Nom du dépôt, par exemple : `QuizVerse`
3. ⚠️ **Coche « Public »** (obligatoire pour que GitHub Pages soit gratuit).
4. ⚠️ **Décoche** « Add a README file » (le README est déjà dans le ZIP).
5. Clique **Create repository**.

### Étape 3 — Envoyer les fichiers

La méthode la plus simple, sans installer Git :

1. Sur la page de ton dépôt vide, clique sur le lien
   **uploading an existing file**.
2. Clique sur **choose your files**.
3. **Sélectionne tout le contenu du dossier `QuizVerse`** :
   - Astuce : dans la fenêtre de sélection, clique une fois sur le dossier `QuizVerse`
     pour entrer dedans, puis fais **Ctrl + A** pour tout sélectionner.
   - ⚠️ Sélectionne bien le **contenu** du dossier, pas le dossier lui-même :
     `index.html`, `404.html`, `css/`, `js/`, `data/`, `tools/`, `assets/`, `README.md`, `LICENSE`.
4. En bas, clique **Commit changes**.

Si tu as Git installé, la méthode équivalente en ligne de commande est :

```bash
cd chemin/vers/QuizVerse
git init
git add .
git commit -m "QuizVerse v1"
git branch -M main
git remote add origin https://github.com/TON-NOM/QuizVerse.git
git push -u origin main
```

### Étape 4 — Activer GitHub Pages

1. Dans ton dépôt, clique sur l'onglet **Settings** (en haut).
2. Dans le menu de gauche, clique sur **Pages**.
3. Dans **Build and deployment** :
   - **Source** : choisis **Deploy from a branch**
   - **Branch** : choisis **main** (et laisse le dossier **/ (root)**)
4. Clique **Save**.
5. Attends 1 à 2 minutes. GitHub affiche ensuite un bandeau vert
   *« Your site is live at … »*.

### Étape 5 — Ouvrir le site

Clique sur le lien affiché, il ressemble à :

```
https://TON-NOM.github.io/QuizVerse/
```

🎉 **C'est tout.** Le site est en ligne, fonctionnel, et se met à jour automatiquement :
à chaque fois que tu pushes une modification sur `main`, GitHub redéploie le site.

### Étape 6 — Mettre à jour le site plus tard

Tu n'as rien à refaire côté configuration. Il suffit de renvoyer les fichiers modifiés
(`git push`) : GitHub Pages republie le site tout seul.

### Nom de domaine personnalisé (facultatif)

Dans **Settings → Pages**, tu peux indiquer un domaine personnalisé pour avoir
`https://quizverse.tondomaine.fr` au lieu de `https://TON-NOM.github.io/QuizVerse/`.
⚠️ Tous les chemins du projet sont **relatifs** : le site continuera de fonctionner tel quel.

---

## 4. Structure du projet

```
QuizVerse/
├── index.html                 Point d'entrée du site
├── 404.html                   Page d'erreur (obligatoire pour GitHub Pages)
├── README.md                  Ce fichier
├── LICENSE                    Licence MIT + notes sur la musique et les données
├── .nojekyll                  Indispensable pour GitHub Pages
├── .gitignore                 Fichiers ignorés par Git
├── robots.txt                 Autorisation des moteurs de recherche
├── sitemap.xml                Plan du site
├── site.webmanifest           Icônes et nom de l'application
│
├── assets/
│   ├── icons/favicon.svg      Favicon (vectoriel)
│   └── images/og-image.svg    Image de partage réseaux sociaux
│
├── css/
│   ├── themes.css             Les 5 thèmes (variables CSS)
│   ├── style.css              Composants et mise en page
│   ├── animations.css         Animations + mode « réduire les animations »
│   └── responsive.css         Adaptation mobile / tablette / desktop
│
├── data/
│   ├── questions.json         Où se trouvent les questions (voir §5)
│   ├── categories.json        Les 10 catégories et leurs 103 univers
│   ├── achievements.json      Les 72 badges
│   ├── challenges.json        Les 39 défis
│   ├── titles.json            Les 24 titres
│   └── avatars.json           Les 25 avatars
│
├── js/
│   ├── utils.js               Utilitaires (création d'éléments, formats, aléatoire)
│   ├── sources.js             Sources documentaires affichées après chaque réponse
│   ├── art.js                 Illustrations vectorielles originales
│   ├── storage.js             Sauvegarde locale (localStorage)
│   ├── data.js                Chargement, vérification et indexation des questions
│   ├── ui.js                  Toasts, modales, cartes, graphiques, sources
│   ├── audio.js               Moteur de synthèse musicale (Web Audio)
│   ├── audio-worker.js        Worker : génère la musique sans figer l'écran
│   ├── music.js               Lecteur musical (lecture, pause, pistes, volume)
│   ├── xp.js                  XP, niveaux, titres, statistiques
│   ├── mastery.js             Maîtrise par question + registre des erreurs
│   ├── achievements.js        Moteur de badges + page Badges
│   ├── challenges.js          Moteur de défis + page Défis
│   ├── recommend.js           Recommandations personnalisées
│   ├── daily.js               Quiz du jour
│   ├── quiz.js                Moteur de quiz (12 modes, score, minuterie)
│   ├── profile.js             Profil, avatars, titres
│   ├── statistics.js          Statistiques et graphiques
│   ├── settings.js            Paramètres, thèmes, export / import / réinitialisation
│   ├── views-core.js          Accueil, Explorer, Catégories, Recherche, Aide, Crédits
│   ├── views-quiz.js          Fiche quiz, écran de jeu, résultats, quiz du jour
│   ├── views-me.js            Historique, Favoris, Mes erreurs, Mes connaissances
│   └── app.js                 Routeur, en-tête, recherche, démarrage
│
└── tools/                     Outils de développement (inutiles en production,
                                mais utiles pour ajouter du contenu et évoluer)
    ├── serve.mjs              Petit serveur local
    ├── build-data.mjs         Vérification complète de la base de questions
    ├── authoring/
    │   ├── helper.mjs         Helpers d'écriture (Q, VF, MU, GU)
    │   ├── taxonomy.mjs       Liste officielle des catégories et univers
    │   ├── sources.mjs        Correspondance univers → article Wikipédia
    │   └── questions/*.mjs    Les banques de questions (2 520 questions)
    ├── audio/generate-audio.mjs  Export MP3 des musiques (facultatif)
    └── dev/                   Outils d'inspection (fabrique d'icônes, contrôle
                               responsive, routes)
```

---

## 5. Ajouter des questions

### 🧰 Les outils de contrôle

Aucune de ces commandes n'est nécessaire pour utiliser le site, mais elles sont utiles quand tu
modifies le projet. Elles ne demandent que **Node.js**, sans rien installer.

| Commande | Ce qu'elle contrôle |
|---|---|
| `node tools/serve.mjs` | Sert le site en local sur <http://localhost:8000> |
| `node tools/build-data.mjs` | Analyse toute la base : doublons, index invalides, répartition, questions trop proches |
| `node tools/dev/quality-check.mjs` | Syntaxe JS, validité JSON, caractères parasites, fichiers manquants |
| `node tools/dev/link-check.mjs` | Chemins absolus, liens internes, ressources chargées, requêtes externes |
| `node tools/dev/make-icons.mjs` | Génère les favicons PNG/ICO et les déclare dans `index.html` (facultatif) |
| `node tools/dev/make-zip.mjs` | Recrée une archive de publication propre |

Les questions sont rangées par **fichier**, un par grand ensemble d'univers, dans
`tools/authoring/questions/`. Chaque fichier est un module JavaScript qui **exporte un tableau
de questions**.

### 5.1 Créer ou modifier un fichier

Ouvre (ou crée) un fichier dans `tools/authoring/questions/`, par exemple
`tools/authoring/questions/mes-univers.mjs` :

```js
import { Q, VF, MU, GU } from '../helper.mjs';

export default [
  Q(
    'animes', 'dragonball', 'facile',
    "Quel est le nom du fils de Goku et de Chi-Chi ?",
    ["Gohan", "Goten", "Trunks", "Pan"],
    0,
    "Gohan est le fils aîné de Goku et Chi-Chi, né à la fin de la saga de Namek.",
    ["goku", "chi-chi", "famille"]
  ),

  VF(
    'sports', 'football', 'moyen',
    "Un joueur peut être remplacé cinq fois lors d'une rencontre de Coupe du Monde.",
    false,
    "La limite est de trois remplacements, et cinq dans les prolongations selon les règles récentes."
  ),

  MU(
    'culture', 'capitales', 'difficile',
    "Lesquelles de ces villes sont des capitales de pays ?",
    ["Tokyo", "Lyon", "Ottawa", "Séoul"],
    [0, 2, 3],
    "Tokyo est la capitale du Japon, Ottawa celle du Canada et Séoul celle de Corée du Sud.",
    ["capitales", "géographie"]
  ),

  GU(
    'films', 'marvel', 'moyen',
    "Devine le personnage : un génie des sciences, mentor de Spider-Man.",
    ["Tony Stark", "Bruce Banner", "Charles Xavier", "Reed Richards"],
    0,
    "Tony Stark est le génie des sciences et le mentor de Spider-Man dans l'univers Marvel.",
    ["iron man", "marvel"],
    "Il porte une armure rouge et or et est le patron de Stark Industries."
  ),
];
```

> Ces exemples sont directement copiables : ils utilisent exactement la même syntaxe que les
> fichiers de questions existants.

### 5.2 Les quatre helpers

| Helper | Rôle | Paramètres |
|---|---|---|
| `Q(cat, sub, diff, texte, réponses, bonneRéponse, explication, tags, options)` | QCM classique | `bonneRéponse` = index (0-3) |
| `VF(cat, sub, diff, texte, estVrai, explication, tags)` | Vrai / Faux | `estVrai` = `true` ou `false` |
| `MU(cat, sub, diff, texte, réponses, bonnesRéponses, explication, tags)` | Plusieurs bonnes réponses | `bonnesRéponses` = tableau d'index |
| `GU(cat, sub, diff, énigme, réponses, bonneRéponse, explication, tags, indice)` | Devine le personnage / le film | `énigme` commence par `Devine le personnage : …` |

### 5.3 Règles à respecter

- `cat` et `sub` doivent exister dans `tools/authoring/taxonomy.mjs`
  (par exemple `('animes', 'dragonball')`).
- `diff` vaut exactement `facile`, `moyen`, `difficile` ou `expert`.
- Les propositions doivent être **toutes différentes** les unes des autres.
- Jamais de « Toutes les autres réponses » ni de « Aucune de ces réponses ».
- L'explication doit contenir une vraie information, en une phrase de 15 à 25 mots.
- 3 à 6 mots-clés en minuscules.
- Pas de « `< > ` ni de guillemets français à l'intérieur des chaînes (utilise l'apostrophe `'`).
- Écris des faits dont tu es sûr : QuizVerse n'invente pas, il vérifie.

### 5.4 Déclarer le nouveau fichier

Ajoute son chemin dans `data/questions.json`, dans la liste `files` :

```json
{
  "format": "modules",
  "files": [
    "tools/authoring/questions/animes-a.mjs",
    "tools/authoring/questions/mes-univers.mjs"
  ]
}
```

C'est tout : le quiz est immédiatement disponible dans le site, avec son propre quota de
questions par difficulté.

### 5.5 Vérifier la base

```bash
node tools/build-data.mjs
```

Le script affiche le nombre de questions par catégorie, par difficulté et par type, supprime
les doublons, corrige les index de réponse invalides et signale les paires de questions trop
proches.

Pour regrouper toute la base dans un seul fichier JSON :

```bash
node tools/build-data.mjs --write data/questions-inline.json
```

…puis remplacer le contenu de `data/questions.json` par :

```json
{ "format": "inline", "questions": [ … ] }
```

### 5.6 Les sources s'ajoutent automatiquement

Chaque question reçoit automatiquement deux sources cliquables (article Wikipédia de l'univers +
recherche sur le mot-clé principal), affichées après **chaque** réponse, juste ou fausse.
Pour ajouter des sources précises à une question précise, passe-les dans les options :

```js
Q('animes', 'dragonball', 'moyen', '…', ['A','B','C','D'], 0, '…', ['goku'],
  { sources: ['Dragon Ball', 'https://www.crunchyroll.com/fr/dragons-balls'] })
```

---

## 6. Ajouter ou modifier une catégorie

1. **Ouvre `tools/authoring/taxonomy.mjs`** et ajoute l'entrée :

```js
animes: {
  label: 'Animés & Mangas',
  emoji: '🍥',
  color: '#f59e0b',
  subs: {
    dragonball: 'Dragon Ball',
    monunivers: 'Mon univers',     // ← nouveau
  },
},
```

2. **Ouvre `data/categories.json`** et ajoute le même univers dans la catégorie voulue :

```json
{ "id": "monunivers", "label": "Mon univers" }
```

3. **Ajoute l'illustration** (facultatif mais recommandé) dans `js/art.js` :
   dans `SCENES`, ajoute `monunivers: 'spark',` pour utiliser une illustration existante.

4. **Ajoute la source** (facultatif) dans `js/sources.js` et dans `tools/authoring/sources.mjs` :

```js
monunivers: 'Nom de l’article Wikipédia',
```

5. **Ajoute les questions** (§5) et relance `node tools/build-data.mjs`.

La nouvelle catégorie apparaît immédiatement : le nombre de questions est recalculé au chargement.

---

## 7. Comment la sauvegarde fonctionne

Tout est stocké dans le **`localStorage`** de ton navigateur, avec le préfixe `quizverse:` :

| Clé | Contenu |
|---|---|
| `profile` | Pseudo, avatar, titre, XP, niveau, jours de jeu |
| `stats` | Statistiques globales, par catégorie, univers, difficulté, mode, type, jour |
| `history` | Historique des parties (400 dernières) |
| `mastery` | Niveau de maîtrise de chaque question |
| `mistakes` | Questions ratées, avec date et nombre de tentatives |
| `favorites` / `favoriteCategories` | Favoris |
| `badges` | Badges débloqués et date de déblocage |
| `challenges` | Défis réclamés |
| `daily` | Quiz du jour, séries, records |
| `settings` | Thème, volumes, préférences |

### Points importants

- ✅ **Rien ne quitte ton navigateur.** Aucune donnée n'est envoyée sur un serveur.
- ⚠️ **La sauvegarde dépend du navigateur et de l'appareil.** Si tu changes d'ordinateur, de
  navigateur, ou si tu ouvres QuizVerse en navigation privée, tu repars de zéro.
- ⚠️ **Ne vide pas les données du site** (menu du navigateur → « Données du site → Effacer »),
  sinon la progression est perdue.
- ✅ **Paramètres → Exporter ma sauvegarde** télécharge un fichier `.json` à conserver.
- ✅ **Paramètres → Importer une sauvegarde** le restaure (sur n'importe quel appareil).
- ✅ **Paramètres → Tout réinitialiser** efface définitivement tout.

---

## 8. Comment fonctionne la musique

Les musiques et les effets sonores de QuizVerse sont **créés pour ce projet** : ils sont
**synthétisés par le navigateur** au moyen d'un moteur audio écrit pour l'occasion
(`js/audio.js`).

Conséquences :

- 🎵 **6 pistes** : `Nebula` (menu, calme), `Pulse Grid` et `Circuit Flow` (quiz, dynamiques mais
  discrètes), `Overdrive` (difficulté, intense), `Triumph` (résultats), `Ascension` (score parfait).
- 🔔 **8 effets sonores** : clic, bonne réponse, mauvaise réponse, niveau supérieur, badge,
  victoire, parfait, tick du chrono.
- 🧠 **Musique adaptée au contexte** : calme dans le menu, dynamique pendant le quiz, plus intense
  sur les questions difficiles, musique de victoire à la fin.
- 📴 **Aucun fichier audio à télécharger** : le site est beaucoup plus léger et fonctionne hors ligne.
- © **Aucune musique existante n'est utilisée** : aucune question de droits d'auteur.

### Comment ça marche

- Les tables d'ondes sont précalculées une fois, puis les notes sont synthétisées note par note.
- La génération se fait dans un **Web Worker** (`js/audio-worker.js`) pour ne jamais figer l'écran.
  Un petit indicateur « préparation » s'affiche le temps de calculer une piste.
- Les premières pistes sont calculées en arrière-plan pendant que tu lis la page d'accueil :
  la lecture démarre ensuite instantanément.

### Autoplay : pourquoi faut-il cliquer une fois ?

Tous les navigateurs bloquent l'audio tant que l'utilisateur n'a pas interagi avec la page
(règle d'autoplay). C'est pourquoi :
- le bouton **♪** de l'en-tête active la musique ;
- le bouton **▶** du mini-lecteur démarre la lecture ;
- le premier clic n'importe où débloque le son.

### Réglages

**Paramètres → Musique** : activer / couper, volume, piste préférée, test de chaque effet.
Le lecteur **♫ QuizVerse Music** reste accessible en bas de l'écran : précédent, lecture/pause,
suivant, sourdine, volume, nom du morceau. Tout est mémorisé.

### Exporter les pistes en MP3 (facultatif)

Si tu préfères disposer de fichiers audio :

```bash
npm install @breezystack/lamejs
node tools/audio/generate-audio.mjs
```

Les fichiers `.mp3` sont alors écrits dans `assets/audio/`. Ce n'est **pas nécessaire** pour faire
fonctionner QuizVerse.

---

## 9. Accessibilité et responsive

- 📱 **Mobile** (320 px et plus), tablette, laptop, desktop et très grands écrans : la mise en page
  s'adapte automatiquement ; le menu se replie en icône hamburger, le lecteur musical devient une
  barre compacte, les grilles passent en colonne unique.
- ⌨️ **Clavier** : navigation complète au clavier, focus toujours visible.
  Raccourcis : `/` recherche · `1`–`6` choisir une réponse · `Entrée` valider ou suivant ·
  `Échap` quitter le quiz.
- 🎨 **Contrastes** : chaque thème a été vérifié pour rester lisible.
- ✨ **Réduire les animations** : Paramètres → Accessibilité. Le réglage détecte aussi
  automatiquement la préférence système « réduire les animations ».
- 🧠 **Focus** : à chaque changement de page, le titre principal reçoit le focus.

---

## 10. Limites du fonctionnement local

QuizVerse est **100 % local**. Cela signifie que :

- ❌ **Aucune synchronisation entre appareils.** Ta progression ne se suit pas d'un téléphone à un
  ordinateur. Il faut exporter/importer la sauvegarde.
- ❌ **Aucun classement mondial, aucun ami, aucun chat, aucun multijoueur** — c'est voulu :
  QuizVerse est un jeu solo.
- ❌ **Pas de compte, pas de mot de passe, pas de « mot de passe oublié ».**
- ⚠️ **Les données dépendent du navigateur.** Vider les données du site les efface. D'où
  l'export de sauvegarde.
- ⚠️ **Le quiz du jour suit le calendrier local.** Il change à minuit, heure de ton appareil.
- ⚠️ **Les sources sont des liens vers Wikipédia.** Elles permettent de comprendre et de vérifier,
  elles ne donnent pas forcément la réponse. Aucun contenu n'est téléchargé depuis Internet.
- ⚠️ **La musique est synthétisée à la volée.** Sur un très vieil appareil, la génération peut
  prendre quelques secondes (un indicateur « préparation » s'affiche).

---

## 11. FAQ

**Est-ce qu'il faut un compte ?**
Non. Aucune inscription, aucune connexion, aucune donnée personnelle.

**Est-ce que ça marche sans Internet ?**
Oui, une fois la page chargée. Aucune ressource externe n'est utilisée (ni police, ni image, ni
musique, ni script distant).

**Comment j'ajoute mes propres questions ?**
Voir la [section 5](#5--ajouter-des-questions). Une banque de questions est un simple tableau
JavaScript : rien de compliqué.

**Je veux une question qui n'existe pas dans la base, je fais comment ?**
Copie un bloc existant dans `tools/authoring/questions/`, change le texte, les propositions, la
bonne réponse et l'explication, puis ajoute le fichier dans `data/questions.json`.

**Les questions sont-elles exactes ?**
Elles ont été rédigées spécifiquement pour ce projet et relues. Chaque réponse affiche une
explication et des sources pour que tu puisses vérifier toi-même. Si tu constates une erreur,
corrige le fichier concerné et renvoie le site sur GitHub : la correction est en ligne en 2 minutes.

**Comment réinitialiser ma progression ?**
Paramètres → Zone sensible → Tout réinitialiser.

**Puis-je changer le nom du site ?**
Oui : cherche `QuizVerse` dans `index.html`, `js/` et `README.md`. Les textes de l'interface sont
dans les fichiers `js/views-*.js` et `js/app.js`.

**Le site est-il bien sur GitHub Pages ?**
Oui : tous les chemins sont **relatifs**, le fichier `.nojekyll` est présent, et `404.html` est
fourni. Il fonctionne à la racine d'un domaine et dans un sous-dossier
(`https://TON-NOM.github.io/QuizVerse/`).

---

## 📄 Licence

Code sous **licence MIT** (voir `LICENSE`).
Musiques, effets sonores et illustrations : créations originales générées pour ce projet.
Aucune dépendance externe, aucun service tiers.

**Fait avec soin pour être simple à installer, simple à comprendre et simple à faire évoluer.**
