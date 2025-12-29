# Trust Media — CMS éditorial & agence

Trust Media combine un site média grand public et un backoffice orienté agence. La vision produit est d'offrir un CMS complet pour des équipes éditoriales et marketing : publication multi-rubriques, gestion d'événements, stockage média, suivi de projets/campagnes et outils d'engagement (newsletter, formulaires, commentaires).

Ce dépôt contient désormais un **monorepo** :
- **apps/site** : site public Vite/React (Redux Toolkit + Flowbite/Tailwind, routes clientes, upload via API).
- **apps/cms** : CMS v2 Vite/React dédié (layout pro + modules branchés sur l'API).
- **trustapi-main** : backend Express/MongoDB exposant l'API REST (auth JWT, posts, commentaires, upload, utilisateurs) et servant les fichiers médias.
- **Données mock** pour prévisualiser le backoffice sans API et un seed JSON pour l'API.

Une analyse détaillée (architecture, benchmark, risques) est disponible dans [`ANALYSIS.md`](./ANALYSIS.md). La roadmap produit/technique détaillée est suivie dans [`ROADMAP.md`](./ROADMAP.md).
Le blueprint CMS v2 est documenté dans [`CMS_V2.md`](./CMS_V2.md).

## Setup rapide
1. Installer les dépendances : `npm install` (workspaces actifs).
2. Copier les variables d’environnement :
   - `trustapi-main/.env.example` → `trustapi-main/.env`
   - `apps/site/.env.example` → `apps/site/.env`
   - `apps/cms/.env.example` → `apps/cms/.env`
3. Vérifier les valeurs critiques :
   - `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `UPLOAD_DIR`, `API_PUBLIC_URL` côté API.
   - `VITE_API_URL` côté site + CMS.
4. Démarrer en local : `npm run dev` (site 5173, CMS 5174, API 3000).

## Architecture monorepo
### apps/site (Vite/React)
- **Routage** : routes publiques (home, recherche, rubriques, article) et routes protégées (dashboard historique) déclarées dans `apps/site/src/App.jsx`.
- **État & session** : Redux Toolkit avec persistance asynchrone pour l'utilisateur, thème, favoris/historique et préférences de notifications. Le profil est rafraîchi via `/api/user/me` si un token est disponible.
- **Auth UI** : pages `/sign-in`, `/sign-up`, `/forgot-password` avec formulaire Flowbite/Tailwind, états loading/erreur et redirections (`returnTo` + rôle admin → `/dashboard`, sinon `/`).
- **UI** : composants réutilisables + Flowbite/Tailwind.
- **Librairies clés** : `react-router-dom`, `redux-persist`, `flowbite-react`, `react-quill`, `react-helmet-async`, Tailwind CSS.

### apps/cms (Vite/React)
- **Routage** : CMS v2 standalone (Overview, Posts, Events, Media, Comments, Users, Settings) avec layout pro et breadcrumbs.
- **Auth** : client API unifié + Bearer token, validation `/api/user/me` au boot, redirection `returnTo` sur login.
- **Modules branchés** : CRUD posts, upload via `/api/media/upload`, modération commentaires, listing utilisateurs.

### Backend (Express/MongoDB)
- **Entrée** : `trustapi-main/api/index.js` démarre Express, MongoDB, CORS, routes REST et sert le dossier `/uploads`.
- **Routes principales** :
  - `POST /api/auth/*` pour signup/signin/signout et flux reset password.
  - `GET /api/user/me`, `PUT /api/user/update/:userId`, `GET /api/user/getusers` (admin), `DELETE /api/user/delete/:userId`.
  - `POST /api/user/admin-create`, `PATCH /api/user/:id/role`, `PUT /api/user/:id` (alias admin CMS).
  - `POST /api/admin/users`, `GET /api/admin/users`, `PUT /api/admin/users/:id`, `DELETE /api/admin/users/:id`, `PUT /api/admin/users/:id/toggle-admin` (admin users CRUD CMS).
  - `GET /api/rubrics?scope=TrustMedia`, `POST /api/rubrics`, `PUT /api/rubrics/:id`, `DELETE /api/rubrics/:id` (taxonomie rubriques).
  - `POST /api/post/create`, `GET /api/post/getposts`, `GET /api/post/:postId`, `PUT /api/post/updatepost/:postId/:userId`, `DELETE /api/post/deletepost/:postId/:userId`.
  - `GET /api/posts/:postId` (CMS : lecture par `_id`).
  - `PATCH /api/posts/:postId/status` (admin/author) pour mise à jour rapide du statut (`draft|published|archived`).
  - `PATCH /api/post/:postId/status` (alias legacy).
  - `GET /api/events` (liste TrustEvent côté CMS).
  - `POST /api/comment/create`, likes/édition/suppression et listing admin.
  - `POST /api/uploads` (Multer legacy) avec filtrage MIME et quotas (10 Mo image, 100 Mo vidéo).
  - `POST /api/media/upload` (Multer + Sharp) pour MediaAsset (auth).
  - `GET /api/media`, `POST /api/media` (auth), `PUT /api/media/:id`, `DELETE /api/media/:id` (owner/admin).
  - `GET /api/health` (healthcheck, répond même si MongoDB est indisponible).
  - `GET /api/settings` (public) et `PUT /api/settings` (admin) pour les réglages globaux du site.
- **Auth & permissions** : middleware JWT `verifyToken` + contrôle `requireAdmin` sur les routes critiques (liste users, commentaires). Les autres permissions (ownership) sont gérées dans les contrôleurs.

### Auth/RBAC — source de vérité
- **Champ canonique** : `User.role` (`USER` ou `ADMIN`) est la source de vérité pour l'accès admin.
- **JWT payload** : `{ id, email, role }` est signé à la connexion/inscription.
- **Source de vérité** : `GET /api/user/me` retourne le profil canonique (rôle inclus).
- **Transport** : l’API attend `Authorization: Bearer <token>` (cookie `access_token` accepté en fallback).
- **Session CMS** : token stocké en `localStorage` (`cms_token`) + hydratation via `/api/user/me`.
- **Session site** : token stocké via Redux/asyncStorage, revalidation via `/api/user/me`.
- **Logout** : `POST /api/auth/signout` efface le cookie `access_token`; le front doit purger le token local (localStorage / redux-persist).
- **Identifiants** : le CMS utilise `_id` pour l'édition/suppression, le site public utilise `slug` pour la lecture (`/post/:slug`).
- **Migration** : les comptes existants sans rôle doivent être normalisés à `USER` (script `trustapi-main/scripts/migrateRoles.js`).
- **Legacy** : les anciens comptes avec `isAdmin=true` sont automatiquement normalisés en `role=ADMIN` côté API.
- **Debug (dev-only)** : `GET /api/debug/whoami` renvoie `req.user` + `tokenSource` pour valider le rôle reçu.

### Admin emails & promotion
- **ADMIN_EMAILS** : définir `ADMIN_EMAILS=admin1@mail.com,admin2@mail.com` dans `trustapi-main/.env` pour promouvoir automatiquement ces comptes en admin à l'inscription/connexion.
- **Promotion manuelle** :
  - API : `PATCH /api/user/:id/role` (admin requis).
  - Script : `npm run make-admin -- --email someone@mail.com` ou `node trustapi-main/scripts/seed-admin.js --email someone@mail.com`.

## Fonctionnalités actuelles
- **Site média** : pages éditoriales par rubrique, page article avec commentaires, recherche multi-critères et pagination incrémentale, pages événement/production/projets.
- **Authentification & rôles** : email/mot de passe JWT, persistance locale, gardes de routes, rôles `ADMIN`/`USER`.
- **Backoffice CMS** : dashboard multi-modules (articles, pages, médias, événements, campagnes, clients, projets, newsletter, formulaires, commentaires, utilisateurs, paramètres, activité) avec maquettes de données et actions rapides.
- **Médias** : upload image/vidéo via API, stockage dans `UPLOAD_DIR` exposé en statique.
- **Thème & personnalisation** : mode clair/sombre, favoris/lecture, historique et préférences de notification côté client.

## Media Library (CMS pro)
### Schéma Media (Mongo)
```json
{
  "_id": "ObjectId",
  "type": "image | video",
  "title": "string",
  "alt": "string",
  "caption": "string",
  "credit": "string",
  "category": "news | politique | science-tech | sport | cinema",
  "tags": ["string"],
  "status": "draft | published | archived",
  "original": { "url": "/uploads/<id>-original.jpg", "width": 1600, "height": 900, "format": "jpeg", "size": 123456 },
  "variants": {
    "thumb": { "url": "/uploads/<id>-thumb.webp", "width": 400, "height": 225 },
    "card": { "url": "/uploads/<id>-card.webp", "width": 800, "height": 450 },
    "cover": { "url": "/uploads/<id>-cover.webp", "width": 1600, "height": 900 },
    "og": { "url": "/uploads/<id>-og.webp", "width": 1200, "height": 630 }
  },
  "createdBy": "userId"
}
```

### Endpoints Media/Upload
- `POST /api/media/upload` : upload fichier (multipart) + création automatique du MediaAsset et variantes (auth).
- `GET /api/media?search=&category=&type=&status=&page=&limit=` : liste + filtres + pagination (auth).
- `POST /api/media` : créer une entrée metadata si besoin (auth).
- `PUT /api/media/:id` : metadata (owner/admin).
- `DELETE /api/media/:id` : suppression (owner/admin).

## Rubriques / Taxonomie
### Schéma Rubric (Mongo)
```json
{
  "_id": "ObjectId",
  "scope": "TrustMedia | TrustEvent | TrustProduction | Media",
  "slug": "politique",
  "label": "Politique",
  "description": "string",
  "order": 1,
  "isActive": true,
  "deletedAt": null,
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Endpoints Rubriques
- `GET /api/rubrics?scope=TrustMedia` (public).
- `POST /api/rubrics` (admin).
- `PUT /api/rubrics/:id` (admin).
- `DELETE /api/rubrics/:id` (admin, soft delete).

### Mapping unifié (Posts / Events / Media)
- **Posts** : `category = TrustMedia`, `subCategory = rubric.slug` (scope TrustMedia).
- **Events** : `category = TrustEvent`, `subCategory = rubric.slug` (scope TrustEvent).
- **Media** : `category = Media`, `subCategory = rubric.slug` (scope Media).

## Settings (CMS)
### Schéma Settings (Mongo)
```json
{
  "_id": "ObjectId",
  "siteName": "string",
  "siteDescription": "string",
  "logoUrl": "string",
  "primaryColor": "string",
  "socialLinks": {
    "facebook": "string",
    "twitter": "string",
    "youtube": "string",
    "instagram": "string",
    "linkedin": "string"
  },
  "navigationCategories": ["string"],
  "commentsEnabled": true,
  "maintenanceMode": false,
  "emailSettings": {
    "senderName": "string",
    "senderEmail": "string",
    "replyToEmail": "string"
  },
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Endpoints Settings
- `GET /api/settings` : lecture publique des paramètres du site.
- `PUT /api/settings` : mise à jour (admin only).

### Workflow
1. Upload fichier via `/api/media/upload` → stockage `UPLOAD_DIR` (défaut `./uploads`).
2. Le backend crée un `Media` + variantes `thumb/card/cover/og` en WebP.
3. Le CMS liste via `/api/media` et permet la sélection dans l’éditeur.
4. Les posts stockent `featuredMediaId` et continuent de supporter `image` legacy.

### Convention URLs média
- **Stockage** : chemin relatif `/uploads/<filename>` en base (normalisé côté API).
- **Front** : construire l'URL publique via `API_BASE_URL` (helper `resolveMediaUrl` dans le site et `apps/cms/src/lib/mediaUrls.js`).
- **UPLOAD_DIR** : doit pointer vers le dossier réellement servi par `/uploads` (par défaut `./uploads`).

### Variantes images (Blog)
- `thumb` : 400px (home, listes)
- `card` : 800px (cartes)
- `cover` : 1600px (page article)
- `og` : 1200x630 (partage)
- Formats générés : WebP (AVIF optionnel).

## QA checklist (Users & Rubriques)
- **Users** : liste / création / édition / suppression ok (CMS → `/api/user/getusers`, `/api/user/admin-create`).
- **Admin toggle** : promotion/rétrogradation via `/api/user/:id/role`.
- **Rubriques** : création TrustMedia/TrustEvent/Media visible dans CMS, site public et éditeurs.
- **Legacy** : les posts avec subCategory inconnue affichent “Legacy”.

## Itération 2 – CMS éditorial pro
- **Workflow éditorial** : statuts `draft` → `review` → `published` (+ `scheduled`) avec date de publication, tags, SEO (title/description/OG) et indicateur « featured ».
- **API Mongo** : nouveaux indexes (texte sur titre/contenu/tags, index slug/status/publishedAt) et filtres avancés (status, tags, date, tri) sans casser les endpoints existants.
- **Content Studio** : liste des posts avec filtres (statut, rubrique, tags), recherche, tri/pagination et actions rapides (publish/unpublish/review). Éditeur avec prévisualisation, autosave de brouillon et réglages SEO/OG.
- **Rubriques publiques** : pages `/politique`, `/science-tech`, `/sport`, `/cinema` avec tri date/popularité, filtres de période et pagination, breadcrumbs cohérents.
- **SEO & partage** : `react-helmet-async` enrichi (canonical, OG/Twitter) + schéma Article sur la page article.

## Itération 3 – Cockpit agence (clients/projets/campagnes)
- **Modèles Mongo + API CRUD** : nouveaux schémas `Client`, `Project`, `Campaign` (relations client → projet → campagne) avec endpoints REST `/api/clients`, `/api/projects`, `/api/campaigns` protégés (`ADMIN`). Cascade automatique sur les suppressions.
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
cp trustapi-main/.env.example trustapi-main/.env
cp apps/cms/.env.example apps/cms/.env
cp apps/site/.env.example apps/site/.env
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
- `PORT`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `FRONTEND_URL`, `UPLOAD_DIR`, `API_PUBLIC_URL`.
- Exemple recommandé : `CORS_ORIGIN=http://localhost:5173,http://localhost:5174`.
- `API_PUBLIC_URL` doit pointer vers l'URL publique de l'API (ex: `http://localhost:3000`) pour générer des URLs absolues vers `/uploads`.
- (Optionnel) Email reset password : `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`.

### Créer un administrateur
1. Créer un compte utilisateur via `/api/auth/signup` ou via le CMS.
2. Promouvoir l'utilisateur en admin depuis le CMS (module Users) **ou** via le script CLI :
   ```bash
   cd trustapi-main
   npm run make-admin -- --email someone@mail.com
   ```
3. En base, un admin est un user avec `role: "ADMIN"` (majuscule).

### Endpoints admin utilisés par le CMS
- `GET /api/user/me` : profil courant (role inclus).
- `GET /api/admin/users` : liste paginée des users + `totalUsers`.
- `POST /api/admin/users` : création user (admin only).
- `PUT /api/admin/users/:id` + `PUT /api/admin/users/:id/role` : mise à jour user/rôle.
- `DELETE /api/admin/users/:id` : suppression user (protégé contre la suppression du dernier admin).
- `GET /api/comment/getcomments` : liste des commentaires (admin only).
- `GET /api/settings` (public) + `PUT /api/settings` (admin only).

### Media URLs & previews
- Les uploads sont servis en statique via `GET /uploads/...`.
- Les entrées Media stockent par défaut des URLs **relatives** (`/uploads/xxx.jpg`).
- Le CMS préfixe automatiquement `VITE_API_URL` pour générer les previews et liens cliquables.
- Pour forcer des URLs absolues côté API, définissez `API_PUBLIC_URL` (ex: `http://localhost:3000`).

### URLs de développement
- Site public : `http://localhost:5173`
- CMS v2 : `http://localhost:5174`
- API : `http://localhost:3000`

## Admin setup
Pour activer les droits admin, assurez-vous qu'un utilisateur a bien **`role: "ADMIN"`** en base.

### Rendre un utilisateur admin en base (MongoDB)
```js
db.users.updateOne(
  { email: "admin@trustmedia.com" },
  { $set: { role: "ADMIN" } }
)
```

### Script rapide (dev)
```bash
cd trustapi-main
npm run make-admin -- --email admin@trustmedia.com
```

## QA checklist (admin)
Checklist rapide avant validation :
- Connexion admin (CMS) → `/api/user/me` retourne `role: "ADMIN"`.
- CMS dashboard : `/api/user/getusers` et `/api/comment/getcomments` répondent **200**.
- Création d’un post TrustMedia avec sous-catégorie valide : apparition immédiate dans `/posts` et sur le site (si `status=published`).
- Commentaires : aucun appel à `/api/comment/getPostComments/undefined` et `postId` invalide renvoie **400**.
- CMS Overview : compteurs totaux (posts/users/comments/events) alignés avec la base.
- Media Library : upload réussi via `/api/uploads` puis média visible dans `/api/media`.
- Media Library : les previews utilisent `/uploads/...` et s'ouvrent via le lien cliquable.
- Events : `/api/events` retourne tous les TrustEvent (draft + published).
- Navigation CMS : toutes les entrées sidebar ouvrent une route active.

Checklist détaillée : [`QA_CHECKLIST.md`](./QA_CHECKLIST.md).

## CMS v2 — Routes dashboard
- `/login` : authentification CMS
- `/` : Overview
- `/posts` : liste + filtres
- `/posts/new` : création
- `/posts/:id/edit` : édition
- `/events` : liste événements
- `/events/new`
- `/events/:id/edit`
- `/media` : bibliothèque médias
- `/comments` : modération commentaires
- `/users` : admin users + stats
- `/settings` : paramètres

## Modules clés (actuels / cibles)
- **Site public** : home, recherche, rubriques, pages légales, détail article + commentaires.
- **CMS & studio éditorial** : articles/pages/événements avec éditeur riche, filtres, upload médias, suggestions.
- **Agence & delivery** : campagnes, clients, projets, formulaires, newsletter (mock côté UI, à brancher sur l'API).
- **Gouvernance** : rôles ADMIN/USER en UI, journal d’activité et paramètres.

### Dashboard CMS (MVP pro)
- **Routes clés** : `/` (overview), `/posts`, `/posts/new`, `/posts/:id/edit`, `/media`, `/comments`, `/users`.
- **Endoints utilisés** :
  - Articles : `GET /api/posts`, `GET /api/posts/:postId`, `POST /api/posts`, `PUT /api/posts/:postId`, `DELETE /api/posts/:postId`.
  - Événements : `GET /api/events`, `POST /api/posts` (category `TrustEvent`).
  - Médias : `GET /api/media`, `PUT /api/media/:id`, `DELETE /api/media/:id`.
  - Commentaires : `GET /api/comment/getcomments`, `DELETE /api/comment/deleteComment/:commentId`.
  - Utilisateurs : `GET /api/user/getusers`.
  - Upload : `POST /api/uploads` (FormData, champ `file`) → création d’un Media.
- **Métriques** :
  - Overview lit `totalPosts`, `totalUsers`, `totalComments`, `totalMedia` depuis les endpoints listants.
  - Les événements utilisent `GET /api/events` pour le total.
- **Comportements** :
  - Tableau de bord affiche KPIs (posts, utilisateurs, commentaires) + listes récentes et actions contextuelles.
  - Content Manager : recherche rapide, actions voir/éditer/supprimer.
  - Media upload : formulaire contrôlé + listing depuis `/api/media` (rafraîchissement auto).
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
