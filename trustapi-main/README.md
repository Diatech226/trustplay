# Trust Media API

## Présentation
Backend Express/MongoDB qui alimente Trust Media (articles, événements TrustEvent, commentaires et administration). Il expose les routes REST consommées par le front Vite/Next, gère l'authentification JWT (cookies HttpOnly + bearer), le stockage des médias et quelques métriques d'administration.

### Fonctionnalités principales
- Authentification par email/mot de passe et Google OAuth (creds côté front, token JWT côté API)
- Gestion des utilisateurs (profil, admin, statistiques)
- Articles et événements (catégories, sous-catégories, pagination, recherche, slug)
- Commentaires (CRUD, likes)
- Upload de fichiers avec stockage disque et exposition statique
- Administration : récupération des métriques globales (users/posts/comments)

## Stack
- Node.js / Express 4
- MongoDB + Mongoose 8
- Authentification : JWT signé avec `JWT_SECRET` (cookie `access_token` + header `Authorization: Bearer`)
- Upload : endpoint `/api/uploads` (multipart), fichiers servis depuis `/uploads/*`

## Installation
```bash
npm install
npm run dev   # nodemon api/index.js
npm start     # node api/index.js
```

### Prérequis
- Node 18+
- MongoDB accessible via `DATABASE_URL`

### Variables d'environnement
Un exemple est fourni dans `.env.example` :
- `PORT` : port HTTP (3000 par défaut)
- `DATABASE_URL` : URL MongoDB
- `JWT_SECRET` : clé de signature JWT
- `CORS_ORIGIN` : liste d'origines autorisées (séparées par des virgules)
- `UPLOAD_DIR` : répertoire de stockage des fichiers uploadés (servi via `/uploads`)

## Architecture
- `api/index.js` : bootstrap serveur, CORS, statiques, routage et gestion d'erreurs
- `api/routes/*` : définitions des routes (auth, user, post, comment, upload)
- `api/controllers/*` : logique métier
- `api/models/*` : schémas Mongoose
- `api/utils/*` : helpers (erreur, vérification JWT)

## API
Toutes les routes sont préfixées par `/api`. Les réponses suivent ce format :
```json
{ "success": true, "data": { ... }, "message": "optional" }
{ "success": false, "message": "..." }
```

### Auth
| Méthode | Route | Corps attendu | Réponse principale |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | `{ username, email, password }` | `message`, `data.userId` |
| POST | `/api/auth/signin` | `{ email, password }` | `user`, `token`, cookie `access_token` |
| POST | `/api/auth/google` | `{ email, name, googlePhotoUrl }` | `user`, `token`, cookie `access_token` |
| POST | `/api/auth/signout` | – | Nettoie le cookie et retourne un message |

### Utilisateurs
| Méthode | Route | Détails |
| --- | --- | --- |
| GET | `/api/user/me` | (auth) Retourne le profil du token | 
| PUT | `/api/user/update/:userId` | (auth) Met à jour profil/mot de passe | 
| DELETE | `/api/user/delete/:userId` | (auth) Admin ou propriétaire |
| GET | `/api/user/getusers?startIndex=&limit=&sort=` | (auth admin) Liste + stats `totalUsers`, `lastMonthUsers` |
| GET | `/api/user/:userId` | Récupère un utilisateur par id |

### Posts / Events
| Méthode | Route | Détails |
| --- | --- | --- |
| POST | `/api/post/create` | (auth) Crée un post/event. Champs : `title`, `content`, `category` (`TrustMedia`, `TrustEvent`, `TrustProd`, `uncategorized`), `subCategory`, `image`, `eventDate`, `location`. Retourne `post`, `slug` |
| PUT | `/api/post/updatepost/:postId/:userId` | (auth) Admin ou auteur |
| DELETE | `/api/post/deletepost/:postId/:userId` | (auth) Admin ou auteur |
| GET | `/api/post/getposts?userId=&category=&subCategory=&slug=&postId=&searchTerm=&startIndex=&limit=&order=` | Liste avec pagination + `totalPosts` |

### Commentaires
| Méthode | Route | Détails |
| --- | --- | --- |
| POST | `/api/comment/create` | (auth) `{ postId, content }` |
| GET | `/api/comment/getPostComments/:postId` | Liste des commentaires d'un post |
| GET | `/api/comment/getcomments?startIndex=&limit=&sort=` | (auth admin) Liste globale + stats `totalComments`, `lastMonthComments` |
| PUT | `/api/comment/likeComment/:commentId` | (auth) Toggle like |
| PUT | `/api/comment/editComment/:commentId` | (auth + owner/admin) Mise à jour du contenu |
| DELETE | `/api/comment/deleteComment/:commentId` | (auth + owner/admin) |

### Upload
| Méthode | Route | Corps attendu | Réponse |
| --- | --- | --- | --- |
| POST | `/api/uploads` | `multipart/form-data` avec champ `image` ou `file` | `data.url` (chemin public `/uploads/<filename>`) |
| GET | `/uploads/<filename>` | – | Sert le fichier uploadé |

### Auth & Permissions
- Envoyer `Authorization: Bearer <token>` **ou** s'appuyer sur le cookie `access_token`.
- Les routes d'administration vérifient `req.user.isAdmin` (payload JWT issu de Mongo).

### Erreurs
- Middleware global retourne `{ success: false, statusCode, message }` avec le code HTTP adapté (400/401/403/404/500).

## Roadmap / Améliorations
- Validation stricte des payloads (Joi/Zod) et messages traduits
- Tests d'intégration (Supertest) sur les routes principales
- Rate limiting + logs structurés
- Webhook ou collection pour l'inscription aux événements
- Support stockage objet (S3) pour les médias
