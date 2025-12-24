# Trust Media — CMS éditorial & agence

Trust Media combine un site média grand public et un backoffice orienté agence. La vision produit est d'offrir un CMS complet pour des équipes éditoriales et marketing : publication multi-rubriques, gestion d'événements, stockage média, suivi de projets/campagnes et outils d'engagement (newsletter, formulaires, commentaires).

Ce dépôt contient désormais un **monorepo** :
- **apps/site** : site public Vite/React (Redux Toolkit + Flowbite/Tailwind, routes clientes, upload via API).
- **apps/cms** : CMS v2 Vite/React dédié (layout pro + modules branchés sur l'API).
- **trustapi-main** : backend Express/MongoDB exposant l'API REST (auth JWT, posts, commentaires, upload, utilisateurs) et servant les fichiers médias.
- **Données mock** pour prévisualiser le backoffice sans API et un seed JSON pour l'API.

Une analyse détaillée (architecture, benchmark, risques) est disponible dans [`ANALYSIS.md`](./ANALYSIS.md). La roadmap produit/technique détaillée est suivie dans [`ROADMAP.md`](./ROADMAP.md).
Le blueprint CMS v2 est documenté dans [`CMS_V2.md`](./CMS_V2.md).

## Architecture monorepo
### apps/site (Vite/React)
- **Routage** : routes publiques (home, recherche, rubriques, article) et routes protégées (dashboard historique) déclarées dans `apps/site/src/App.jsx`.
- **État & session** : Redux Toolkit avec persistance asynchrone pour l'utilisateur, thème, favoris/historique et préférences de notifications. Le profil est rafraîchi via `/api/user/me` si un token est disponible.
- **UI** : composants réutilisables + Flowbite/Tailwind.
- **Librairies clés** : `react-router-dom`, `redux-persist`, `flowbite-react`, `react-quill`, `react-helmet-async`, Tailwind CSS.

### apps/cms (Vite/React)
- **Routage** : CMS v2 standalone (Overview, Posts, Events, Media, Comments, Users, Settings) avec layout pro et breadcrumbs.
- **Auth** : client API unifié + Bearer token, validation `/api/user/me` au boot, redirection `returnTo` sur login.
- **Modules branchés** : CRUD posts, upload via `/api/uploads`, modération commentaires, listing utilisateurs.

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

## Itération 2 – CMS éditorial pro
- **Workflow éditorial** : statuts `draft` → `review` → `published` (+ `scheduled`) avec date de publication, tags, SEO (title/description/OG) et indicateur « featured ».
- **API Mongo** : nouveaux indexes (texte sur titre/contenu/tags, index slug/status/publishedAt) et filtres avancés (status, tags, date, tri) sans casser les endpoints existants.
- **Content Studio** : liste des posts avec filtres (statut, rubrique, tags), recherche, tri/pagination et actions rapides (publish/unpublish/review). Éditeur avec prévisualisation, autosave de brouillon et réglages SEO/OG.
- **Rubriques publiques** : pages `/politique`, `/science-tech`, `/sport`, `/cinema` avec tri date/popularité, filtres de période et pagination, breadcrumbs cohérents.
- **SEO & partage** : `react-helmet-async` enrichi (canonical, OG/Twitter) + schéma Article sur la page article.

## Itération 3 – Cockpit agence (clients/projets/campagnes)
- **Modèles Mongo + API CRUD** : nouveaux schémas `Client`, `Project`, `Campaign` (relations client → projet → campagne) avec endpoints REST `/api/clients`, `/api/projects`, `/api/campaigns` protégés (`ADMIN/MANAGER/EDITOR`). Cascade automatique sur les suppressions.
- **Admin UI** : vues Clients / Projets / Campagnes branchées sur l'API avec filtres, tri, pagination, sélection détaillée et actions rapides (génération de brief, assignation de statut, joindre un média depuis la médiathèque).
- **Médias liés** : attachement direct des assets uploadés aux projets/campagnes (champ `attachments`/`assets`), réutilisable depuis la Media Library.
- **Documentation & seed** : README/API contract enrichis + seed JSON mis à jour pour injecter des clients/projets/campagnes (`trustapi-main/scripts/cms-seed.json`).

### Exemples JSON rapides
```json
{
  "client": {
    "name": "Nova Industries",
    "status": "active",
    "contacts": [{ "name": "Aline Dupont", "email": "aline@nova.com", "role": "CMO" }]
  },
  "project": {
    "clientId": "<mongoId>",
    "title": "Série vidéo produit",
    "status": "in_progress",
    "deadline": "2024-07-15",
    "brief": "3 vidéos demo + 1 teaser social",
    "attachments": [{ "name": "storyboard.pdf", "url": "/uploads/storyboard.pdf", "mime": "application/pdf" }]
  },
  "campaign": {
    "projectId": "<mongoId>",
    "channel": "Paid ads",
    "goal": "200 démos/mois",
    "budget": 12000,
    "kpis": [{ "name": "CPL < 45€" }],
    "schedule": { "start": "2024-06-01", "end": "2024-07-31" },
    "assets": [{ "name": "visuel-cover.jpg", "url": "/uploads/visuel-cover.jpg", "mime": "image/jpeg" }]
  }
}
```

### Guide SEO rapide
- Renseigner **seoTitle** et **seoDescription** dans les formulaires de création/édition pour contrôler les balises `<title>`/meta description (160 caractères). L'image OG peut être surchargée via `ogImage`.
- Utiliser les **tags** pour enrichir le référencement interne et les filtres front ; ils sont aussi inclus dans le schéma Article et l'index texte Mongo.
- Les pages rubriques et articles exposent un lien canonical et les balises OpenGraph/Twitter. Vérifier la date de publication (champ `publishedAt`) pour les contenus planifiés ou backdatés.

## Démarrage rapide (monorepo)
### Prérequis
- Node.js 18+
- MongoDB accessible (local ou Atlas) si vous utilisez l'API Express.

### Installation (root)
```bash
npm install
npm run dev       # lance site + CMS + API (concurrently)
npm run dev:site  # Vite site public (apps/site)
npm run dev:cms   # Vite CMS v2 (apps/cms)
npm run dev:api   # API Express (trustapi-main)
```

### Installation backend (`trustapi-main`) si nécessaire
```bash
cd trustapi-main
npm install
npm run dev   # nodemon api/index.js
npm start     # node api/index.js
```

### Configuration
Créer un fichier `.env` dans `apps/site` avec :
- `VITE_API_URL` : URL de base de l'API REST (ex: `http://localhost:3000`).
- `VITE_CMS_URL` (optionnel) : URL du CMS pour le lien admin (ex: `http://localhost:5174`).

Créer un fichier `.env` dans `apps/cms` avec :
- `VITE_API_URL` : URL de base de l'API REST (ex: `http://localhost:3000`).

Créer `.env` dans `trustapi-main` (voir `.env.example`) avec :
- `PORT`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `FRONTEND_URL`, `UPLOAD_DIR`.
- Exemple recommandé : `CORS_ORIGIN=http://localhost:5173,http://localhost:5174`.
- (Optionnel) `RESEND_API_KEY`, `MAIL_FROM` pour l'e-mail reset password.

### URLs de développement
- Site public : `http://localhost:5173`
- CMS v2 : `http://localhost:5174`
- API : `http://localhost:3000`

## Admin setup
Pour activer les droits admin, assurez-vous qu'un utilisateur a bien **`role: "ADMIN"`** (ou **`isAdmin: true`**) en base.

### Rendre un utilisateur admin en base (MongoDB)
```js
db.users.updateOne(
  { email: "admin@trustmedia.com" },
  { $set: { role: "ADMIN", isAdmin: true } }
)
```

> ℹ️ Le backend utilise `role: "ADMIN"` comme référence principale et expose aussi `isAdmin` dans le payload utilisateur/JWT.

## QA checklist (admin)
Checklist rapide avant validation :
- Connexion admin (CMS) → `/api/user/me` retourne `role: "ADMIN"` et `isAdmin: true`.
- CMS dashboard : `/api/user/getusers` et `/api/comment/getcomments` répondent **200**.
- Création d’un post TrustMedia avec sous-catégorie valide : apparition immédiate dans `/posts` et sur le site (si `status=published`).
- Commentaires : aucun appel à `/api/comment/getPostComments/undefined` et `postId` invalide renvoie **400**.

Checklist détaillée : [`QA_CHECKLIST.md`](./QA_CHECKLIST.md).

## CMS v2 — Routes dashboard
- `/login` : authentification CMS
- `/` : Overview
- `/posts` : liste + filtres
- `/posts/new` : création
- `/posts/:postId` : édition
- `/events` : liste événements
- `/events/new`
- `/events/:postId`
- `/media` : bibliothèque médias
- `/comments` : modération commentaires
- `/users` : admin users + stats
- `/settings` : paramètres

## Modules clés (actuels / cibles)
- **Site public** : home, recherche, rubriques, pages légales, détail article + commentaires.
- **CMS & studio éditorial** : articles/pages/événements avec éditeur riche, filtres, upload médias, suggestions.
- **Agence & delivery** : campagnes, clients, projets, formulaires, newsletter (mock côté UI, à brancher sur l'API).
- **Gouvernance** : rôles ADMIN/MANAGER/EDITOR/VIEWER en UI, journal d’activité et paramètres.

### Dashboard CMS (MVP pro)
- **Routes clés** : `/` (overview), `/posts`, `/posts/new`, `/posts/:postId`, `/media`, `/comments`, `/users`.
- **Endoints utilisés** :
  - Articles : `GET /api/posts`, `POST /api/posts`, `PUT /api/posts/:postId`, `DELETE /api/posts/:postId`.
  - Commentaires : `GET /api/comment/getcomments`, `DELETE /api/comment/deleteComment/:commentId`.
  - Utilisateurs : `GET /api/user/getusers`.
  - Upload : `POST /api/uploads` (FormData, champ `file`).
- **Comportements** :
  - Tableau de bord affiche KPIs (posts, utilisateurs, commentaires) + listes récentes et actions contextuelles.
  - Content Manager : recherche rapide, actions voir/éditer/supprimer.
  - Media upload : formulaire contrôlé + historique local des derniers uploads.
  - Comments moderation : suppression sécurisée avec confirmation.
  - Users : listing admin avec rafraîchissement manuel.

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

## Bugs corrigés
- Stabilisation de l’injection du token JWT sur toutes les requêtes du CMS (fallback Redux Persist/localStorage) avec gestion contrôlée des 401.
- Navigation du dashboard fiabilisée : sidebar en `NavLink` alignée sur les routes `/dashboard/*` et icônes complètes.
- Flux commentaires sécurisé : validation stricte de `postId` côté front pour éviter les appels avec un identifiant indéfini et suppression via confirmation.
- Remplacement des écrans mockés (dashboard, articles, médias, commentaires, utilisateurs) par des appels API réels avec états de chargement/erreur.

## Stabilisation (Itération 1)
- Stratégie d’authentification unifiée : jeton JWT accepté en `Authorization: Bearer` **et** via le cookie `access_token` (secure/httpOnly). Le client inclut automatiquement le Bearer quand un token est présent et envoie les cookies pour les actions protégées.
- Gardes de routes (front) revues pour éviter les redirections en boucle : attente explicite du rafraîchissement de session avant d’autoriser/relire les routes privées et admin.
- Endpoints critiques fiabilisés : `/api/user/me` renvoie un 401 cohérent si le token est manquant/expiré, upload Multer retourne des erreurs contrôlées (MIME/taille) et expose l’URL publique.
- Navigation : le lien Dashboard réapparaît automatiquement pour les rôles autorisés.

## Comment fonctionne l’auth (token/cookie)
- **Connexion** : `/api/auth/signin` renvoie un token JWT + pose un cookie `access_token` (httpOnly).
- **Stockage front** : le token est conservé dans Redux + redux-persist (fallback localStorage `auth`).
- **API client** : chaque appel protégé ajoute `Authorization: Bearer <token>` si disponible et envoie les cookies (`credentials: include`).
- **Restauration de session** : au chargement, le front hydrate l’utilisateur depuis la persistance, puis rafraîchit le profil via `/api/user/me`.
- **401** : la déconnexion automatique n’est déclenchée que lorsqu’un token est explicitement invalidé/expiré (validation via `/api/user/me` si besoin).

## QA Checklist
- [ ] Connexion admin puis navigation `/dashboard` → `/dashboard/posts` → `/dashboard/media` → `/dashboard/comments` → `/dashboard/users` sans perte de session.
- [ ] Dashboard overview affiche les KPIs et les listes récentes (posts, commentaires, utilisateurs) ; bouton « Rafraîchir » fonctionne.
- [ ] Content Manager : recherche/filtre/pagination fonctionnent ; publier/dépublier/envoyer en revue puis supprimer un post met bien à jour la liste.
- [ ] Formulaire de création de post : création réussie, redirection vers l’article.
- [ ] Media upload : sélection d’un fichier image/vidéo, upload via `/api/uploads`, URL affichée et prévisualisation image visible.
- [ ] Comments moderation : filtrage par article et recherche texte, suppression confirmée met à jour le tableau sans erreur `postId`.
- [ ] Users admin : liste chargée depuis `/api/user/getusers`, recherche par nom/email, rafraîchissement manuel OK.
