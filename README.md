# Trust Media — CMS éditorial & agence

Trust Media combine un site média grand public et un backoffice orienté agence. La vision produit est d'offrir un CMS complet pour des équipes éditoriales et marketing : publication multi-rubriques, gestion d'événements, stockage média, suivi de projets/campagnes et outils d'engagement (newsletter, formulaires, commentaires).

Ce dépôt contient :
- **Frontend Vite/React** pour le site public et l'admin (Redux Toolkit + Flowbite/Tailwind, routes clientes, upload via API).
- **Backend Express/MongoDB** (`trustapi-main`) exposant l'API REST (auth JWT, posts, commentaires, upload, utilisateurs) et servant les fichiers médias.
- **Données mock** pour prévisualiser le backoffice sans API et un seed JSON pour l'API.

Une analyse détaillée (architecture, benchmark, risques) est disponible dans [`ANALYSIS.md`](./ANALYSIS.md). La roadmap produit/technique détaillée est suivie dans [`ROADMAP.md`](./ROADMAP.md).

## Architecture actuelle
### Frontend (Vite/React)
- **Routage** : routes publiques (home, recherche, rubriques, article) et protégées (dashboard, création/mise à jour) déclarées dans `src/App.jsx`. Les routes admin sont regroupées sous `/dashboard` avec garde `PrivateRoute` + `OnlyAdminPrivateRoute`. 
- **État & session** : Redux Toolkit avec persistance asynchrone pour l'utilisateur, thème, favoris/historique et préférences de notifications. Le profil est rafraîchi via `/api/user/me` si un token est disponible.
- **UI admin** : layout avec sidebar, header, breadcrumbs et dark mode ; navigation role-based (ADMIN/MANAGER/EDITOR/VIEWER) et redirections vers le profil en cas de section non autorisée. Composants réutilisables et données mock pour chaque module (posts, pages, événements, campagnes, etc.).
- **Librairies clés** : `react-router-dom`, `redux-persist`, `flowbite-react`, `react-quill`, `react-helmet-async`, Tailwind CSS.

### Backend (Express/MongoDB)
- **Entrée** : `trustapi-main/api/index.js` démarre Express, MongoDB, CORS, routes REST et sert le dossier `/uploads`.
- **Routes principales** :
  - `POST /api/auth/*` pour signup/signin/signout et flux reset password.
  - `GET /api/user/me`, `PUT /api/user/update/:userId`, `GET /api/user/getusers` (admin), `DELETE /api/user/delete/:userId`.
  - `POST /api/post/create`, `GET /api/post/getposts`, `PUT /api/post/updatepost/:postId/:userId`, `DELETE /api/post/deletepost/:postId/:userId`.
  - `POST /api/comment/create`, likes/édition/suppression et listing admin.
  - `POST /api/uploads` (Multer) avec filtrage MIME et quotas (10 Mo image, 100 Mo vidéo).
- **Auth & permissions** : middleware JWT `verifyToken` + contrôle `requireAdmin` sur les routes critiques (liste users, commentaires). Les autres permissions (ownership) sont gérées dans les contrôleurs.

## Fonctionnalités actuelles
- **Site média** : pages éditoriales par rubrique, page article avec commentaires, recherche multi-critères et pagination incrémentale, pages événement/production/projets.
- **Authentification & rôles** : email/mot de passe JWT, persistance locale, gardes de routes, rôle ADMIN pour l'admin ; rôles supplémentaires gérés côté UI.
- **Backoffice CMS** : dashboard multi-modules (articles, pages, médias, événements, campagnes, clients, projets, newsletter, formulaires, commentaires, utilisateurs, paramètres, activité) avec maquettes de données et actions rapides.
- **Médias** : upload image/vidéo via API, stockage dans `UPLOAD_DIR` exposé en statique.
- **Thème & personnalisation** : mode clair/sombre, favoris/lecture, historique et préférences de notification côté client.

## Démarrage rapide
### Prérequis
- Node.js 18+
- MongoDB accessible (local ou Atlas) si vous utilisez l'API Express.

### Installation frontend
```bash
npm install
npm run dev       # démarre Vite en développement
npm run build     # build de production
npm run preview   # prévisualisation du build
npm run lint      # linting ESLint
```

### Installation backend (`trustapi-main`)
```bash
cd trustapi-main
npm install
npm run dev   # nodemon api/index.js
npm start     # node api/index.js
```

### Configuration
Créer un fichier `.env` à la racine frontend avec :
- `VITE_API_URL` : URL de base de l'API REST.

Créer `.env` dans `trustapi-main` (voir `.env.example`) avec :
- `PORT`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `FRONTEND_URL`, `UPLOAD_DIR`.
- (Optionnel) `RESEND_API_KEY`, `MAIL_FROM` pour l'e-mail reset password.

## Modules clés (actuels / cibles)
- **Site public** : home, recherche, rubriques, pages légales, détail article + commentaires.
- **CMS & studio éditorial** : articles/pages/événements avec éditeur riche, filtres, upload médias, suggestions.
- **Agence & delivery** : campagnes, clients, projets, formulaires, newsletter (mock côté UI, à brancher sur l'API).
- **Gouvernance** : rôles ADMIN/MANAGER/EDITOR/VIEWER en UI, journal d’activité et paramètres.

## Roadmap produit & technique
La roadmap détaillée par itérations (objectifs, modules, changements techniques, valeur métier) est décrite dans [`ROADMAP.md`](./ROADMAP.md). Synthèse :
1. **Stabilisation & cohérence** : fiabiliser auth/CRUD/upload, harmoniser conventions, sécuriser l’admin.
2. **CMS éditorial professionnel** : workflow de publication, médias et SEO renforcés.
3. **Agence & gestion clients/projets** : pipeline clients/projets/campagnes, formulaires et reporting.
4. **Performance, SEO & analytics** : optimisation front, métadonnées, instrumentation produit.
5. **Scalabilité & industrialisation** : CI/CD, observabilité, multitenant et plans d’hébergement.

## Évolutions prévues & priorités
- **Quick wins** : revue des erreurs API, tests sur flux login/CRUD/upload, audit UX des filtres/recherche, sécurisation des routes admin.
- **Moyen terme** : workflow éditorial (brouillon → revue → publication), bibliothèques médias avec conversions, configuration RBAC centralisée.
- **Long terme** : automatisation CI/CD, analytics temps réel, support multi-marques et marketplace partenaires.

## Ressources
- Contrat API backend : [`trustapi-main/API_CONTRACT.md`](./trustapi-main/API_CONTRACT.md).
- Analyse détaillée : [`ANALYSIS.md`](./ANALYSIS.md).
- Roadmap : [`ROADMAP.md`](./ROADMAP.md).
