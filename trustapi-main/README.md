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
- `CORS_ORIGIN` : origines autorisées (CSV, ex. `http://localhost:5173,http://localhost:3000`)
- `UPLOAD_DIR` : répertoire pour stocker les fichiers uploadés (servi via `/uploads`)

## Architecture
- `api/index.js` : bootstrap serveur, CORS, statiques, routage et gestion d'erreurs
- `api/routes/*` : définitions des routes (auth, user, post, comment, upload)
- `api/controllers/*` : logique métier
- `api/models/*` : schémas Mongoose
- `api/utils/*` : helpers (erreur, vérification JWT)

## Auth & CORS
- Auth JWT : le serveur signe un JWT avec `{ id, email, role }` et le renvoie dans `data.token`. **Le header `Authorization: Bearer <token>` est la source de vérité pour toutes les routes protégées.**
- Middleware `verifyToken` : lit uniquement le bearer ; en cas d'absence, renvoie `401 { success: false, message: "Unauthorized: No token provided" }`, et en cas de signature invalide renvoie `401 { success: false, message: "Unauthorized: Invalid token" }`. Le payload décodé est exposé sur `req.user` (`{ id, email, role }`).
- CORS : origines multiples via `CORS_ORIGIN`, `credentials: true`, méthodes `GET,POST,PUT,DELETE,OPTIONS`, headers `Content-Type, Authorization`.
- Front : utiliser `NEXT_PUBLIC_API_URL` (ou `VITE_API_URL` en fallback) et appeler `fetch(..., { credentials: 'include' })`. Les requêtes authentifiées ajoutent automatiquement le bearer.

## Modèles de données
- **User** : `username`, `email`, `passwordHash`, `role` (`USER` par défaut, `ADMIN` pour l'admin), `profilePicture`, timestamps.
- **Post** : `userId`, `title`, `slug` (slugify lowercase/strict), `content`, `image`, `category` (`TrustMedia`, `TrustEvent`, `TrustProd`, `uncategorized`), `subCategory`, `eventDate?`, `location?`, timestamps.
- **Comment** : `userId`, `postId`, `content`, `likes[]`, `numberOfLikes`, timestamps.

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
- `GET /api/user/me` — retourne le profil du porteur du token

### Utilisateurs
- `GET /api/user/me` (auth) — profil courant
- `GET /api/user/getusers` (admin) — liste + stats `totalUsers`, `lastMonthUsers`
- `PUT /api/user/update/:userId` (auth proprio) — met à jour `username/email/profilePicture/password`
- `DELETE /api/user/delete/:userId` (auth proprio/admin)
- `GET /api/user/:userId` — public

> ⚙️ **Promotion admin** : pour donner le rôle administrateur à un utilisateur, changer son champ `role` à `ADMIN` directement dans MongoDB (aucune whitelist côté serveur).

### Posts / Events
- `POST /api/post/create` (auth) — crée un article/événement (`title`, `content`, `category`, `subCategory`, `image`, `eventDate`, `location`)
- `GET /api/post/getposts` — filtre par `userId`, `category`, `subCategory`, `slug`, `postId`, `searchTerm`, `startIndex`, `limit`, `order`
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
- `GET /uploads/<filename>` — fichiers statiques servis depuis `UPLOAD_DIR`

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

## Contract API détaillé
Le mapping complet des routes, paramètres et réponses est maintenu dans [`API_CONTRACT.md`](./API_CONTRACT.md).
