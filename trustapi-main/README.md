# Trust Media API

Backend Express/MongoDB qui alimente Trust Media (articles, événements TrustEvent, commentaires et administration). Ce README décrit l'installation, la configuration et le contrat d'API tel qu'implémenté dans le code.

## Sommaire
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration (.env)](#configuration-env)
- [Architecture](#architecture)
- [Auth & CORS](#auth--cors)
- [Modèles de données](#modèles-de-données)
- [Pagination & Slugs](#pagination--slugs)
- [Endpoints principaux](#endpoints-principaux)
- [Upload](#upload)
- [Troubleshooting](#troubleshooting)
- [Contract API détaillé](#contract-api-détaillé)

## Prérequis
- Node.js 18+
- MongoDB accessible via `DATABASE_URL` (Atlas ou local)

## Installation
```bash
npm install
npm run dev   # nodemon api/index.js
npm start     # node api/index.js
```

## Configuration (.env)
Un exemple complet est fourni dans `.env.example`.

Variables utilisées par le code :
- `PORT` : port HTTP (défaut 3000)
- `DATABASE_URL` : URI MongoDB (ex. `mongodb+srv://user:pass@cluster/db`)
- `JWT_SECRET` : clé de signature JWT
- `CORS_ORIGIN` : origines autorisées (CSV, ex. `http://localhost:5173,http://localhost:5174`)
- `FRONTEND_URL` : URL publique du frontend (utilisée pour construire les liens de reset password)
- `UPLOAD_DIR` : répertoire pour stocker les fichiers uploadés (servi via `/uploads`)
- SMTP Gmail (email reset) : `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` (mot de passe d'application Gmail) et `MAIL_FROM` (ex. `"Trust Media <your_email@gmail.com>"`). Si SMTP est absent, le lien de réinitialisation est simplement loggé en console (mode dev), sans erreur.

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
- Auth JWT : le serveur signe un JWT avec `{ id, email, role, isAdmin }` et le renvoie dans `data.token`. **Le header `Authorization: Bearer <token>` est la source de vérité pour toutes les routes protégées.**
- Middleware `verifyToken` : lit d'abord le bearer (cookie `access_token` accepté en fallback) ; en cas d'absence, renvoie `401 { success: false, message: "Unauthorized: No token provided" }`, et en cas de signature invalide renvoie `401 { success: false, message: "Unauthorized: Invalid token" }`. Le payload décodé est exposé sur `req.user` (`{ id, email, role, isAdmin }`).
- CORS : origines multiples via `CORS_ORIGIN`, `credentials: true`, méthodes `GET,POST,PUT,DELETE,OPTIONS`, headers `Content-Type, Authorization`.
- Front : utiliser `NEXT_PUBLIC_API_URL` (ou `VITE_API_URL` en fallback) et appeler `fetch(..., { credentials: 'include' })`. Les requêtes authentifiées ajoutent automatiquement le bearer.

## Modèles de données
- **User** : `username`, `email`, `passwordHash` (obligatoire uniquement pour `authProvider=local`), `authProvider` (`local` par défaut, compat `google`/`firebase`), `role` (`USER` par défaut, `ADMIN`, `EDITOR`, `AUTHOR`), `isAdmin` (boolean canonique), `profilePicture`, timestamps.
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
- `POST /api/user/create` (admin) — création user
- `PUT /api/user/:id` (admin) — update user
- `PUT /api/user/:id/toggle-admin` (admin) — toggle admin

> ⚙️ **Promotion admin** : 
> - `.env` : définir `ADMIN_EMAILS=admin1@mail.com,admin2@mail.com` pour promouvoir automatiquement à la connexion/inscription.
> - Route : `PATCH /api/user/:id/promote` (admin) pour promouvoir un compte existant.
> - Script : `npm run make-admin -- --email someone@mail.com` pour forcer un admin en DB.

### Posts / Events
- `POST /api/post/create` (auth) — crée un article/événement (`title`, `content`, `category`, `subCategory`, `image`, `eventDate`, `location`, `featuredMediaId`)
- `GET /api/post/getposts` — filtre par `userId`, `category`, `subCategory`, `slug`, `postId`, `searchTerm`, `startIndex`, `limit`, `order` + `populateMedia=1`
- `GET /api/posts/:postId` et `GET /api/post/:postId` — lecture d'un post par `_id` (admin voit tous les statuts)
- `PUT /api/post/updatepost/:postId/:userId` (auth proprio/admin)
- `DELETE /api/post/deletepost/:postId/:userId` (auth proprio/admin)
- Un événement est un post avec `category=TrustEvent`; filtrer `category=TrustEvent` pour la vue Events.

### Commentaires
- `POST /api/comment/create` (auth) — `{ postId, content }`
- `GET /api/comment/getPostComments/:postId` — liste des commentaires d'un post
- `GET /api/comment/getcomments` (admin) — stats globales
- `PUT /api/comment/likeComment/:commentId` (auth)
- `PUT /api/comment/editComment/:commentId` (auth proprio/admin)
- `DELETE /api/comment/deleteComment/:commentId` (auth proprio/admin)

### Upload
- `POST /api/uploads` — `multipart/form-data` avec champ `file` (recommandé) ou `image` (compat)
  - Si fichier image : génération automatique des variantes `thumb` (400px), `medium` (900px), `cover` (1400px) en WebP + AVIF.
  - Retour : `{ originalUrl, thumbUrl, mediumUrl, coverUrl, thumbAvifUrl, mediumAvifUrl, coverAvifUrl, width, height }`.
- `POST /api/media/upload` (admin) — upload MediaAsset (variants `thumb`, `card`, `cover`, `og`)
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

Toutes ces routes exigent un rôle `ADMIN`/`EDITOR`/`AUTHOR` + Bearer JWT.

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

## Troubleshooting
- **Mongo Atlas** :
  - S’assurer que `DATABASE_URL` est renseigné et que l’utilisateur a le rôle `readWrite` sur la base.
  - Ajouter votre IP dans la whitelist Atlas ; encoder les caractères spéciaux du mot de passe dans l’URI.
  - En cas d’échec de connexion, le serveur s’arrête avec un message explicite.
- **CORS** : vérifier `CORS_ORIGIN` (CSV) et que le front appelle avec `credentials: 'include'` pour conserver les cookies.
- **Upload** : le dossier `UPLOAD_DIR` est créé automatiquement. En cas d’erreur 400 "No file uploaded", vérifier le nom de champ (`image` ou `file`).
- **Migration des rôles legacy** : si votre base contient des utilisateurs avec `role: "client"` (ou un ancien rôle de livraison),
  normalisez les rôles en lançant `npm run migrate:roles` (nécessite `DATABASE_URL`).

## Contract API détaillé
Le mapping complet des routes, paramètres et réponses est maintenu dans [`API_CONTRACT.md`](./API_CONTRACT.md).
