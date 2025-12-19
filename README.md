# Trust Media

Site web de média en ligne construit avec React et Vite. L'application propose des rubriques éditoriales (News, Politique, Science/Technologie, Sport, Cinéma via sous-catégories) avec pages d'accueil, de recherche, de détail d'article et un espace d'administration pour gérer les contenus.

## Fonctionnalités principales
- Page d'accueil affichant les derniers articles et un filtrage par sous-catégorie (News, Politique, Économie, Culture, Technologie, Sport, Portraits). Les cartes renvoient vers les pages de détail.
- Navigation complète via `react-router-dom` : accueil `/`, page article `/post/:postSlug`, recherche `/search`, pages institutionnelles (à propos, politique de confidentialité, conditions), sections événementiels et production.
- Page de détail d'article avec image, métadonnées, contenu HTML et suggestions d'articles récents.
- Recherche et filtrage des posts avec critères (terme, ordre chronologique, catégorie) et pagination par chargement incrémental.
- Authentification locale email/mot de passe via API JWT, session persistée côté navigateur (storage asynchrone) ; redirections protégées (dashboard, création/mise à jour d'article).
- Création et modification d'articles avec éditeur riche (ReactQuill), upload d'image envoyé au backend (`/api/uploads`) et gestion des catégories/sous-catégories (TrustMedia, TrustEvent, TrustProduction + News/Politique/…).
- Gestion des commentaires avec création authentifiée et affichage de la liste des commentaires d’un article.
- Thème clair/sombre mémorisé via Redux Persist.

## CMS agence (dashboard)
- Layout pro : sidebar collapsible, header avec recherche globale, notifications, switch thème et breadcrumbs automatiques.
- Navigation élargie : Dashboard, Articles, Pages, Médias, Événements, Campagnes, Clients, Projets, Newsletter, Formulaires, Commentaires, Utilisateurs, Paramètres et journal d’activité.
- Composants réutilisables : `AdminSidebar`, `AdminHeader`, `PageShell`, `ResourceTable`, `KpiCard` pour structurer les modules.
- Données démo prêtes (`src/admin/config/mockData.js`) pour visualiser le CMS sans backend.
- Seed d’exemple pour l’API (`trustapi-main/scripts/cms-seed.json`) afin de pré-remplir posts/pages/events/campagnes.
- RBAC côté UI : affichage conditionnel des entrées selon le rôle (ADMIN/MANAGER/EDITOR/VIEWER) et redirection sécurisée.

## Architecture technique
- **Frontend** : React 18 + Vite 5, routage `react-router-dom`, composants UI `flowbite-react`, icônes `react-icons`, éditeur riche `react-quill`.
- **État global** : Redux Toolkit (`@reduxjs/toolkit`) avec persistance (`redux-persist`) pour l'utilisateur et le thème.
- **Auth & médias** : Auth locale JWT (backend Express/MongoDB) ; les images/vidéos sont envoyées au backend (`/api/uploads`).
- **Appel API** : toutes les données métiers (posts, commentaires, utilisateurs) proviennent d’un backend REST configuré via `VITE_API_URL` (non inclus dans ce dépôt).
- **Styles** : Tailwind CSS + plugins (`@tailwindcss/line-clamp`, `tailwind-scrollbar`).

### Structure des dossiers
```
src/
  main.jsx            # Point d'entrée Vite/React + Redux + ThemeProvider
  App.jsx             # Définition des routes principales
  components/         # Header/Footer, cartes d’articles, sections dashboard, commentaires, etc.
  pages/              # Pages routées : Home, Search, PostPage, Dashboard, Auth, etc.
  redux/              # Store, slices user & theme
  lib/                # apiClient (gestion bearer/401) et asyncStorage (wrapper localStorage)
  index.css           # Styles globaux (Tailwind)
```

## Installation & démarrage
Prérequis : Node.js (>=18 recommandé) et npm.

```bash
npm install
npm run dev       # démarre le serveur de développement Vite
npm run build     # build de production
npm run preview   # prévisualisation du build
npm run lint      # linting ESLint
```

### Démarrage de l’admin CMS
- Front : `npm run dev` puis ouvrir `/dashboard` (connexion requise ; le rôle ADMIN débloque tous les modules).
- Backend : utiliser l’API Express/MongoDB (répertoire `trustapi-main`) pointée par `VITE_API_URL`.
- Démo sans backend : les pages Admin utilisent des données mock pour illustrer le layout ; branchez vos endpoints REST pour rendre les tables interactives.

## Configuration & variables d'environnement
Créer un fichier `.env` à la racine du projet (ou équivalent Vite) avec au minimum :

- `VITE_API_URL` (obligatoire) : base URL du backend REST (ex. https://api.example.com). Utilisé pour la récupération et la création de posts, commentaires, utilisateurs, etc.

## Modèle de données (côté frontend)
Les types sont consommés depuis l’API, mais les champs utilisés permettent d’identifier :
- **Post** : `_id`, `title`, `slug`, `category` (TrustMedia/TrustEvent/TrustProduction), `subCategory` (news, politique, economie, culture, technologie, sport, portraits), `content` (HTML), `image`, `createdAt`, `eventDate`, `location` (pour les événements).
- **User** : `id`/`_id`, `username`, `email`, `profilePicture`, `token`, `role` (`ADMIN` pour les routes protégées admin).
- **Comment** : `_id`, `postId`, `userId`, `content`, `userName`, `profilePicture`, timestamps.

## Routage & contenu éditorial
- **Point d’entrée** : `src/main.jsx` monte `<App />` dans `#root` avec Redux et PersistGate.
- **Routes principales (src/App.jsx)** :
  - `/` (Home) : liste des posts avec filtrage par sous-catégorie.
  - `/post/:postSlug` : détail d’article + commentaires + articles récents.
  - `/search` : recherche/filtrage des posts avec pagination via `startIndex`.
  - `/event`, `/production`, `/projects`, `/about`, `/privacy-policy`, `/Terms` : pages éditoriales.
  - Auth : `/sign-in`, `/sign-up`.
  - Dashboard & admin : `/dashboard` (privé), `/create-post`, `/update-post/:postId` (admins).

### Gestion des rubriques et catégories
- Les posts portent un champ `category` (TrustMedia/TrustEvent/TrustProduction) et, pour la partie média, un `subCategory` explicitant la rubrique éditoriale (news, politique, economie, culture, technologie, sport, portraits). La navigation et les filtres (home, search) s’appuient sur ces champs.
- URLs : les slugs d’articles alimentent `/post/:postSlug`; la recherche ajoute `?category=` et `?searchTerm=`.

### Pagination & recherche
- `Search.jsx` construit les requêtes via `URLSearchParams` et supporte `searchTerm`, `sort` (asc/desc), `category` et `startIndex` pour charger la suite des résultats (infinite scroll bouton « Voir plus »).
- La page d’accueil filtre côté client sur `subCategory` une fois les posts chargés.

### Médias
- Upload d’images/vidéos via `/api/uploads` (Multer côté backend) depuis la page de création/mise à jour d’article ou l’éditeur.
- Les URLs retournées par l’API sont stockées sur les posts/contenus.

### Authentification & autorisations
- Auth email/mot de passe contre l’API (`/api/auth/signin`, `/api/auth/signup`), stockage du token dans un wrapper asynchrone autour de `localStorage`.
- Routes protégées (`PrivateRoute`, `OnlyAdminPrivateRoute`) contrôlent l’accès au dashboard et aux pages d’édition (rôle `ADMIN`).

### Workflow éditorial (front)
- Création/édition : formulaires `CreatePost.jsx` et `UpdatePost.jsx` envoient les données au backend (token JWT requis). Les sous-catégories sont obligatoires pour TrustMedia.
- Consultation : `Home` et `Search` affichent les listes; `PostPage` charge un article par slug et propose les articles récents.
- Commentaires : `CommentSection` récupère les commentaires d’un post et permet aux utilisateurs connectés d’en ajouter ou supprimer localement.

## Tests & qualité
- Linting : `npm run lint` (ESLint avec plugins React, React Hooks, React Refresh).
- Aucun test unitaire ou e2e n’est défini dans ce dépôt.

### Checklist QA admin (extrait)
- Connexion / déconnexion et redirection 401 vers `/sign-in`.
- Accès role-based : ADMIN voit tous les modules, les rôles inférieurs restent cantonnés aux sections autorisées.
- Navigation sidebar (collapsible) + breadcrumbs cohérents.
- CRUD basiques sur Articles, Pages, Événements via vos endpoints REST ; upload média via `/api/uploads`.
- Journal d’activité lisible et pages vides avec états empty/loading à compléter côté API.

## Déploiement
- Build frontend Vite (`npm run build`), prévisualisation via `npm run preview`.
- Architecture CSR (client-side rendering). L’API distante doit être accessible via `VITE_API_URL`.

## 🛣️ Roadmap & pistes d’amélioration
### Itération 1 – Structuration éditoriale
- Uniformiser les catégories (News, Politique, Science/Tech, Sport, Cinéma) via `category/subCategory` et aligner les options de création/recherche.
- Créer des pages dédiées par rubrique (`/politique`, `/science`, `/sport`, `/cinema`) avec filtres par date/popularité.
- Ajouter un menu/breadcrumbs clair reliant chaque rubrique et des liens vers les sous-catégories depuis les cartes.

### Itération 2 – UX & UI du média
- Repenser la page d’accueil pour mettre en avant les rubriques principales et les articles récents par section.
- Améliorer la mise en page des articles (typo, marges, contrastes) et ajouter des blocs « Articles similaires » basés sur la sous-catégorie.
- Optimiser le responsive et la lisibilité mobile (cartes, filtres, formulaires).

### Itération 3 – Fonctionnalités avancées
- Recherche avancée combinant mots-clés, rubriques, dates et tags éventuels ; ajout d’un nuage de mots-clés.
- Comptes utilisateurs enrichis : favoris, historique de lecture, notifications par rubrique.
- Flux RSS/newsletter par rubrique (Politique, Science/Tech, Sport, Cinéma) et intégration de partages sociaux.

### Itération 4 – Technique & performance
- Optimiser les images (lazy loading, formats modernes) et mettre en cache les listes de posts.
- Améliorer le SEO : métadonnées dynamiques, balises Open Graph/Twitter, schémas `Article`/`BreadcrumbList`.
- Ajouter des tests automatisés (lint en CI, tests de pages critiques) et du monitoring (erreurs/perfs) adapté à l’infra d’hébergement.
