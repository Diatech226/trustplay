# Trust Media API

Backend Express/MongoDB qui alimente Trust Media (articles, événements TrustEvent, commentaires et administration). Ce README décrit l'installation, la configuration et le contrat d'API tel qu'implémenté dans le code.

## Sommaire
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Déploiement LWS (cPanel Node.js Passenger)](#déploiement-lws-cpanel-nodejs-passenger)
- [Configuration (.env)](#configuration-env)
- [Architecture](#architecture)
- [Auth & CORS](#auth--cors)
- [Modèles de données](#modèles-de-données)
- [Pagination & Slugs](#pagination--slugs)
- [Endpoints principaux](#endpoints-principaux)
- [Upload](#upload)
- [Troubleshooting](#troubleshooting)
- [Common build errors](#common-build-errors)
- [Contract API détaillé](#contract-api-détaillé)

## Prérequis
- Node.js 20+ (VPS prod) — compatible local Windows
- MongoDB accessible via `DATABASE_URL` (Atlas ou local)

## Installation
```bash
npm install
npm run dev   # nodemon api/index.js
npm start     # node api/index.js
```

### Windows (PowerShell)
```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

## Déploiement VPS (PM2 + Nginx)
Voir le guide détaillé dans [`docs/DEPLOY_VPS.md`](docs/DEPLOY_VPS.md).

## Déploiement LWS (cPanel Node.js Passenger)
1. Créer une application **Node.js** dans cPanel (Passenger).
2. Définir :
   - **Application root** : `backend/`
   - **Application startup file** : `api/index.js`
   - **Node.js version** : 18+
3. Ajouter les variables d'environnement (voir ci-dessous).
4. Exécuter `npm install` depuis cPanel, puis **Restart** l'application.
5. Vérifier la santé : `https://api.trust-group.agency/api/health`.

## Configuration (.env)
Un exemple complet est fourni dans `.env.example`.

Variables utilisées par le code :
- `PORT` : port HTTP (défaut 3000)
- `DATABASE_URL` : URI MongoDB (ex. `mongodb+srv://user:pass@cluster/db`)
- `JWT_SECRET` : clé de signature JWT
- `CORS_ORIGIN` : origines autorisées (CSV). Exemples :
  - **Prod** : `CORS_ORIGIN=https://www.trust-group.agency,https://trust-cms-git-main-christodules-projects.vercel.app`
  - **Dev** : `CORS_ORIGIN=http://localhost:5173,http://localhost:5174`
  - En prod sans `CORS_ORIGIN`, l'API limite automatiquement aux domaines Trust Group.
- `FRONTEND_URL` : URL publique du frontend (utilisée pour construire les liens de reset password)
- `UPLOAD_DIR` : répertoire pour stocker les fichiers uploadés (servi via `/uploads`)
- `API_PUBLIC_URL` : base publique de l'API pour retourner des URLs absolues vers `/uploads` (ex. `http://localhost:3000`)
- `ADMIN_EMAILS` : CSV d'emails à promouvoir automatiquement en `ADMIN` (ex. `admin@trust-group.agency`)
- SMTP Gmail (email reset) : `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (mot de passe d'application Gmail) et `MAIL_FROM` (ex. `"Trust Media <your_email@gmail.com>"`). Si SMTP est absent, le lien de réinitialisation est simplement loggé en console (mode dev), sans erreur.

### Santé & disponibilité
- `GET /api/health` répond toujours (même sans MongoDB).
- Si MongoDB est indisponible, les routes dépendantes de la base renvoient `503`.

### Emails de réinitialisation (SMTP)
- Configurer un mot de passe d'application Gmail (`SMTP_PASS`) et le couple `SMTP_USER`/`MAIL_FROM` pour activer l'envoi réel via Gmail SMTP.
- `SMTP_HOST` par défaut : `smtp.gmail.com`, `SMTP_PORT` par défaut : `587` (STARTTLS).
- En développement sans configuration SMTP, le serveur affiche simplement dans les logs la ligne `[MAILER] SMTP not configured. Password reset URL: <lien>` et retourne toujours un 200 pour l'endpoint `forgot-password`.

## Architecture
- `api/index.js` : bootstrap serveur, CORS, statiques, routage et gestion d'erreurs
- `api/routes/*` : définitions des routes (auth, user, post, comment, upload)
- `api/controllers/*` : logique métier
- `api/models/*` : schémas Mongoose
- `api/utils/*` : helpers (erreur, vérification JWT)

## Auth & CORS
- Auth JWT : le serveur signe un JWT avec `{ id, email, role }` et le renvoie dans `data.token`. **Le header `Authorization: Bearer <token>` est la source de vérité pour toutes les routes protégées.**
- Middleware `verifyToken` : lit d'abord le bearer (cookie `access_token` accepté en fallback) ; en cas d'absence, renvoie `401 { success: false, message: "Unauthorized: No token provided" }`, et en cas de signature invalide renvoie `401 { success: false, message: "Unauthorized: Invalid token" }`. Le payload décodé est exposé sur `req.user` (`{ id, email, role }`).
- Middleware `requireAdmin` : bloque tout rôle non `ADMIN` avec `403 { success: false, message: "Admin access required" }`.
- CORS : origines multiples via `CORS_ORIGIN` (ou `https://www.trust-group.agency` + `https://trust-cms-git-main-christodules-projects.vercel.app` par défaut en prod), `credentials: true`, méthodes `GET,POST,PUT,PATCH,DELETE,OPTIONS`, headers `Content-Type, Authorization`.
- Vérification rapide (préflight) :
  ```bash
  curl -I -X OPTIONS "$NEXT_PUBLIC_API_URL/api/posts" \
    -H "Origin: https://www.trust-group.agency" \
    -H "Access-Control-Request-Method: GET"
  ```
- Uploads : `API_PUBLIC_URL` permet de renvoyer des URLs absolues pour la médiathèque (sinon l'API déduit l'host depuis la requête).
- Front : utiliser `NEXT_PUBLIC_API_URL` (ou `VITE_API_URL` en fallback) et appeler `fetch(..., { credentials: 'include' })`. Les requêtes authentifiées ajoutent automatiquement le bearer.
- Sécurité minimale : rate limiting sur `/api/auth`, headers de sécurité de base et sanitation des inputs pour limiter les injections Mongo.

## Modèles de données
- **User** : `username`, `email`, `passwordHash` (obligatoire uniquement pour `authProvider=local`), `authProvider` (`local` par défaut, compat `google`/`firebase`), `role` (`USER` par défaut, `ADMIN`), `profilePicture`, timestamps.
- **Migration** : les utilisateurs existants sans rôle doivent être normalisés à `USER` (ex. via `scripts/migrateRoles.js`).
- **Post** : `userId`, `title`, `slug` (slugify lowercase/strict), `content`, `image`, `imageOriginal`, `imageThumb`, `imageCover`, `imageMedium`, `imageThumbAvif`, `imageCoverAvif`, `imageMediumAvif`, `category` (`TrustMedia`, `TrustEvent`, `TrustProd`, `uncategorized`), `subCategory`, `eventDate?`, `location?`, timestamps.
- **Media** : `type` (`image`/`video`), `title`, `alt`, `caption`, `credit`, `category`, `tags`, `status`, `original`, `variants` (`thumb`, `card`, `cover`, `og`), `createdBy`, timestamps. (Champs legacy conservés pour compatibilité.)
- **Comment** : `userId`, `postId`, `content`, `likes[]`, `numberOfLikes`, timestamps.
- **Client** : `name`, `contacts[]` (`name/email/phone/role`), `notes`, `status` (`prospect/onboarding/active/paused/archived`), `tags`, timestamps.
- **Project** : `clientId`, `title`, `brief`, `status` (`planning/in_progress/delivered/on_hold/archived`), `deadline`, `attachments[]` (médias liés), `tags`, timestamps.
- **Campaign** : `projectId`, `title`, `channel`, `goal`, `budget`, `kpis[]`, `assets[]` (médias liés), `schedule { start, end, cadence? }`, `status` (`planned/in_progress/delivered/on_hold/archived`).
- **Setting** : `siteName`, `siteDescription`, `logoUrl`, `primaryColor`, `socialLinks`, `navigationCategories[]`, `commentsEnabled`, `maintenanceMode`, `emailSettings` (senderName/senderEmail/replyToEmail), timestamps.

## Pagination & Slugs
- `startIndex` : offset (0 par défaut).
- `limit` : nombre d’éléments (défaut 9 sur posts/commentaires/utilisateurs).
- `order` (`asc`/`desc`) sur les posts ; `sort` (`asc`/`desc`) sur les utilisateurs/commentaires.
- Les slugs sont générés avec `slugify` en minuscule strict.

## Endpoints principaux
Résumé (voir le détail complet dans `API_CONTRACT.md`). Les routes sont préfixées par `/api`.

### Endpoints admin-only (role `ADMIN`)
- Media library : `POST /api/media/upload`, `GET /api/media`, `GET /api/media/:id`, `POST /api/media`, `PUT /api/media/:id`, `DELETE /api/media/:id`
- Uploads : `POST /api/uploads`, `GET /api/uploads/list`
- Pages CMS : `GET /api/pages`, `GET /api/pages/:pageId`, `POST /api/pages`, `PUT /api/pages/:pageId`, `PATCH /api/pages/:pageId/status`, `DELETE /api/pages/:pageId`
- Posts/events admin : `POST /api/post/create`, `PUT /api/post/updatepost/:postId/:userId`, `DELETE /api/post/deletepost/:postId/:userId`, `PATCH /api/post/:postId/status`
- Comment moderation : `GET /api/comment/getcomments`
- Settings : `PUT /api/settings`
- Analytics : `GET /api/analytics/summary`
- Clients/projects/campaigns : toutes les routes `/api/clients`, `/api/projects`, `/api/campaigns`
- Admin users : toutes les routes `/api/admin/*`, `POST /api/user/admin-create`, `POST /api/user/create`, `PUT /api/user/:id`, `PUT /api/user/:id/toggle-admin`, `PATCH /api/user/:id/role`, `PATCH /api/user/:id/promote`, `GET /api/user/getusers`

### Auth
- `POST /api/auth/signup` — `{ username, email, password }`
- `POST /api/auth/signin` — `{ email, password }` → retourne `user`, `token`
- `POST /api/auth/signout` — `{ success: true }`
- `POST /api/auth/forgot-password` — `{ email }` → Toujours 200 ; stocke un hash de token avec expiration 15 min et envoie (ou log) l’URL `${FRONTEND_URL}/reset-password?token=...&email=...`
- `POST /api/auth/reset-password` — `{ email, token, newPassword }` → vérifie le hash+expiration, met à jour le mot de passe (min. 8 caractères), supprime le token et renvoie éventuellement `user` + `token` pour reconnexion auto. Les comptes SSO peuvent ainsi définir un mot de passe local.
- `GET /api/user/me` — retourne le profil du porteur du token

### Utilisateurs
- `GET /api/user/me` (auth) — profil courant
- `GET /api/user/getusers` (admin) — liste + stats `totalUsers`, `lastMonthUsers`
- `POST /api/user/admin-create` (admin) — créer un utilisateur `{ username, email, password, role }`
- `PATCH /api/user/:id/role` (admin) — mise à jour du rôle (`ADMIN`/`USER`)
- `PUT /api/user/update/:userId` (auth proprio) — met à jour `username/email/profilePicture/password`
- `DELETE /api/user/delete/:userId` (auth proprio/admin)
- `PATCH /api/user/:id/promote` (admin) — promeut un utilisateur existant en admin
- `GET /api/user/:userId` — public

### Admin users (CMS)
- `POST /api/admin/users` (admin) — créer un user `{ username, email, password, role }`
- `GET /api/admin/users` (admin) — liste paginée + `totalUsers`
- `GET /api/admin/users/:id` (admin) — détail user
- `PUT /api/admin/users/:id` (admin) — update profil + rôle + reset password
- `PUT /api/admin/users/:id/role` (admin) — mise à jour rapide du rôle
- `PUT /api/admin/users/:id/toggle-admin` (admin) — promotion/rétrogradation admin
- `DELETE /api/admin/users/:id` (admin) — suppression

Alias admin (compat CMS) :
- `POST /api/user/create` (admin) — création user (alias `admin-create`)
- `PUT /api/user/:id` (admin) — update user
- `PUT /api/user/:id/toggle-admin` (admin) — toggle admin

> ⚙️ **Promotion admin** : 
> - `.env` : définir `ADMIN_EMAILS=admin1@mail.com,admin2@mail.com` pour promouvoir automatiquement à la connexion/inscription.
> - Route : `PATCH /api/user/:id/role` (admin) pour promouvoir/rétrograder un compte existant.
> - Scripts : `npm run make-admin -- --email someone@mail.com` ou `node scripts/seed-admin.js --email someone@mail.com`.

### Posts / Events
- `POST /api/post/create` (admin) — crée un article/événement (`title`, `content`, `category`, `subCategory`, `image`, `eventDate`, `location`, `featuredMediaId`)
- `GET /api/post/getposts` — filtre par `userId`, `category`, `subCategory`, `slug`, `postId`, `searchTerm`, `startIndex`, `limit`, `order` + `populateMedia=1`
- `GET /api/posts/:postId` et `GET /api/post/:postId` — lecture d'un post par `_id` (admin voit tous les statuts)
- `PUT /api/post/updatepost/:postId/:userId` (admin)
- `DELETE /api/post/deletepost/:postId/:userId` (admin)
- Un événement est un post avec `category=TrustEvent`; filtrer `category=TrustEvent` pour la vue Events.

### Commentaires
- `POST /api/comment/create` (auth) — `{ postId, content }`
- `GET /api/comment/getPostComments/:postId` — liste des commentaires d'un post
- `GET /api/comment/getcomments` (admin) — stats globales
- `PUT /api/comment/likeComment/:commentId` (auth)
- `PUT /api/comment/editComment/:commentId` (auth proprio/admin)
- `DELETE /api/comment/deleteComment/:commentId` (auth proprio/admin)

### Upload
- `POST /api/uploads` (admin) — `multipart/form-data` avec champ `file` (recommandé) ou `image` (compat)
  - Si fichier image : génération automatique des variantes `thumb` (400px), `medium` (900px), `cover` (1400px) en WebP + AVIF.
  - Retour : `{ originalUrl, thumbUrl, mediumUrl, coverUrl, thumbAvifUrl, mediumAvifUrl, coverAvifUrl, width, height }`.
  - Les URLs renvoyées sont absolues si `API_PUBLIC_URL` est défini (sinon basées sur l'host de la requête).
- `POST /api/media/upload` (admin) — upload MediaAsset (variants `thumb`, `card`, `cover`, `og`) et retourne `data.media`
- `GET /api/media` (admin) — liste paginée + filtres `search`, `category`, `type`, `status`
- `PUT /api/media/:id` (admin) — update metadata
- `DELETE /api/media/:id` (admin) — suppression DB + fichiers
- `GET /uploads/<filename>` — fichiers statiques servis depuis `UPLOAD_DIR` (défaut `./uploads`)

### Settings
- `GET /api/settings` — lecture publique des paramètres du site.
- `PUT /api/settings` — mise à jour (admin).

### Agence (clients / projets / campagnes)
- `GET /api/clients` — liste paginée + recherche plein texte, filtre par statut ; `POST` pour créer un client avec contacts/notes.
- `GET /api/clients/:id` — détail + projets rattachés ; `PUT`/`DELETE` pour mettre à jour ou supprimer (cascade sur projets/campagnes).
- `GET /api/projects` — filtre par client/statut/recherche ; `POST` pour créer un projet (brief, deadline, statut, pièces jointes médias).
- `GET /api/projects/:id` — détail + campagnes ; `PUT`/`DELETE` pour mises à jour/cascade.
- `GET /api/campaigns` — filtre par projet/canal/statut ; `POST` pour créer une campagne (objectif, budget, KPIs, planning, assets médias).
- `GET /api/campaigns/:id` — détail (avec projet + client) ; `PUT`/`DELETE` pour modifier/supprimer.

Toutes ces routes exigent un rôle `ADMIN` + Bearer JWT.

### Debug (dev-only)
- `GET /api/debug/whoami` (auth) — retourne `{ id, role }` et la source du token. Désactivé en production (404).

### Flux Auth (JWT)
1. **Signin** :
   ```bash
   curl -X POST "$NEXT_PUBLIC_API_URL/api/auth/signin" \
     -H 'Content-Type: application/json' \
     -d '{"email":"demo@example.com","password":"secret"}'
   # => { "success": true, "data": { "user": { ... }, "token": "<JWT>" } }
   ```
2. **Appels protégés** : ajouter `Authorization: Bearer <token>` (le cookie `access_token` est accepté en secours)
   ```bash
   curl "$NEXT_PUBLIC_API_URL/api/user/me" \
     -H "Authorization: Bearer <token>"
   ```

3. **Mot de passe oublié / reset** :
   ```bash
   # Demande de lien de réinitialisation (réponse 200 même si l'email n'existe pas)
   curl -X POST "$NEXT_PUBLIC_API_URL/api/auth/forgot-password" \
     -H 'Content-Type: application/json' \
     -d '{"email":"demo@example.com"}'

  # En mode dev sans config SMTP, l'URL de reset est affichée dans les logs serveur

   # Depuis le lien reçu (ou loggé), soumettre le nouveau mot de passe
   curl -X POST "$NEXT_PUBLIC_API_URL/api/auth/reset-password" \
     -H 'Content-Type: application/json' \
     -d '{"email":"demo@example.com","token":"<token>","newPassword":"NewSecurePass!"}'
   # Même si l'envoi d'email échoue, le reset réussit tant que le token est valide
   ```

#### Exemples curl
```bash
# Signup
curl -X POST "$NEXT_PUBLIC_API_URL/api/auth/signup" \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","email":"demo@example.com","password":"secret"}'

# Liste des posts paginés
curl "$NEXT_PUBLIC_API_URL/api/post/getposts?limit=5&order=desc"

# Création de post (bearer + cookie inclus)
curl -X POST "$NEXT_PUBLIC_API_URL/api/post/create" \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Hello","content":"<p>World</p>","category":"TrustMedia","subCategory":"news"}' \
  -b cookie.txt

# Upload d'image (bearer ou cookie)
curl -X POST "$NEXT_PUBLIC_API_URL/api/uploads" \
  -H "Authorization: Bearer <token>" \
  -F 'file=@/chemin/vers/image.jpg'

# Upload vidéo
curl -X POST "$NEXT_PUBLIC_API_URL/api/uploads" \
  -H "Authorization: Bearer <token>" \
  -F 'file=@/chemin/vers/video.mp4'
```

## Upload
- Endpoint : `POST /api/uploads` (auth requis)
- Accepte les champs `file` (recommandé) ou `image` (compatibilité legacy), multipart/form-data.
- Types : images (`jpeg`, `png`, `webp`, `gif`, 10 Mo max) et vidéos (`mp4`, `webm`, 100 Mo max).
- Réponse :
  ```json
  {
    "success": true,
    "data": {
      "url": "/uploads/<filename>",
      "name": "<filename>",
      "mime": "image/png",
      "size": 12345,
      "type": "image" // ou "video"
    }
  }
  ```
- Les fichiers sont servis via `/uploads/<filename>` ; le dossier `UPLOAD_DIR` est créé automatiquement.
- Les fichiers d'uploads **ne doivent pas être versionnés** (voir `.gitignore`).

## .htaccess
- **Non requis** quand l'API tourne en Node/Render/OnRender (Express gère les routes).
- Si l'API est derrière Apache, utiliser une config proxy côté serveur (exemples plus bas).

## Push séparé (subtree)
Depuis la racine du monorepo :
```bash
git subtree push --prefix backend git@github.com:ORG/trust-media-backend.git main
```

## Troubleshooting
- **CORS** : vérifier `CORS_ORIGIN=https://trust-group.agency,https://cms.trust-group.agency` et que les requêtes front passent `credentials: 'include'`.
- **404 sur `/uploads/...`** : vérifier `UPLOAD_DIR` et que `API_PUBLIC_URL` pointe vers l'URL publique de l'API.
- **Médias relatifs** : définir `API_PUBLIC_URL` pour forcer des URLs absolues côté CMS/site.
- Si l'API est derrière un proxy (Nginx/Apache), assurez-vous que les préflights `OPTIONS` passent bien et que les headers CORS sont renvoyés.

### Exemple Nginx (proxy CORS + OPTIONS)
```nginx
location /api/ {
  if ($request_method = OPTIONS) {
    add_header Access-Control-Allow-Origin $http_origin always;
    add_header Access-Control-Allow-Credentials true always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    add_header Content-Length 0;
    return 204;
  }

  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_pass http://localhost:3000;

  add_header Access-Control-Allow-Origin $http_origin always;
  add_header Access-Control-Allow-Credentials true always;
  add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" always;
  add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
}
```

### Exemple Apache (proxy CORS + OPTIONS)
```apache
<Location "/api/">
  RewriteEngine On
  RewriteCond %{REQUEST_METHOD} OPTIONS
  RewriteRule ^(.*)$ $1 [R=204,L]

  SetEnvIfNoCase Origin "^https?://.*$" Origin=$0
  Header always set Access-Control-Allow-Origin "%{Origin}e" env=Origin
  Header always set Access-Control-Allow-Credentials "true"
  Header always set Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  Header always set Access-Control-Allow-Headers "Content-Type, Authorization"

  ProxyPass http://localhost:3000/
  ProxyPassReverse http://localhost:3000/
</Location>
```
- **Mongo Atlas** :
  - S’assurer que `DATABASE_URL` est renseigné et que l’utilisateur a le rôle `readWrite` sur la base.
  - Ajouter votre IP dans la whitelist Atlas ; encoder les caractères spéciaux du mot de passe dans l’URI.
  - En cas d’échec de connexion, le serveur s’arrête avec un message explicite.
- **CORS** : vérifier `CORS_ORIGIN` (CSV) et que le front appelle avec `credentials: 'include'` pour conserver les cookies.
- **Upload** : le dossier `UPLOAD_DIR` est créé automatiquement. En cas d’erreur 400 "No file uploaded", vérifier le nom de champ (`image` ou `file`).
- **Migration des rôles legacy** : si votre base contient des utilisateurs avec `role: "client"` (ou un ancien rôle de livraison),
  normalisez les rôles en lançant `npm run migrate:roles` (nécessite `DATABASE_URL`).

## Common build errors
- **`[BOOT] Missing required env: DATABASE_URL, JWT_SECRET`** : renseigner `backend/.env` (voir `.env.example`). Le serveur démarre en mode dégradé sans base, mais les routes DB renverront `503`.
- **Connexion MongoDB refusée** : vérifier l’URI `DATABASE_URL`, les droits réseau et l’IP whitelist côté Atlas.
- **`PORT invalide`** : vérifier `PORT` (entier). Le serveur retombe sur `3000` si la valeur est invalide.

## Contract API détaillé
Le mapping complet des routes, paramètres et réponses est maintenu dans [`API_CONTRACT.md`](./API_CONTRACT.md).
