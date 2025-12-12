# API Contract — Trust Media

## Base
- **Base URL** : configurable via `NEXT_PUBLIC_API_URL` (front) / `VITE_API_URL` fallback. Exemple local : `http://localhost:3000`.
- **Prefix** : toutes les routes sont préfixées par `/api` sauf la statique `/uploads/*`.
- **Auth** : JWT signé avec `JWT_SECRET`, transmis en cookie `access_token` (HttpOnly) **ou** header `Authorization: Bearer <token>`.
- **CORS** : origines autorisées via `CORS_ORIGIN` (CSV), `credentials: true`, méthodes `GET,POST,PUT,DELETE,OPTIONS`, headers `Content-Type, Authorization`.
- **Réponses** :
  - Succès : `{ "success": true, "data": { ... }, "message"? }` + champs dupliqués pour compatibilité (`user`, `post`, `comments`, `token`...).
  - Erreur : `{ "success": false, "message": "...", "statusCode"? }` avec le code HTTP correspondant.

## Endpoints détaillés

### Authentification
| Méthode | Route | Auth | Corps | Réponse (200/201) |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/signup` | Non | `{ username, email, password }` | `{ success, message: "Signup successful", data: { userId } }` |
| POST | `/api/auth/signin` | Non | `{ email, password }` | `{ success, message, data: { user, token }, user, token }` + cookie `access_token` |
| POST | `/api/auth/google` | Non | `{ email, name, googlePhotoUrl }` | Identique à `/signin` |
| POST | `/api/auth/signout` | Facultatif | – | Vide le cookie, `{ success: true, message }` |

### Utilisateurs
| Méthode | Route | Auth | Détails | Réponse principale |
| --- | --- | --- | --- | --- |
| GET | `/api/user/test` | Non | Ping API | `{ success: true, message }` |
| GET | `/api/user/me` | Oui | Profil depuis le token | `{ success, data: { user }, user }` |
| GET | `/api/user/getusers` | Oui (admin) | Query: `startIndex` (offset, défaut 0), `limit` (défaut 9), `sort` (`asc`/`desc`) | `{ success, users, totalUsers, lastMonthUsers, data: {...} }` |
| GET | `/api/user/:userId` | Non | Récupérer un utilisateur par id | `{ success, data: { user }, user }` |
| PUT | `/api/user/update/:userId` | Oui (proprio) | Corps optionnel : `username`, `email`, `profilePicture`, `password` | `{ success, data: { user }, user }` |
| DELETE | `/api/user/delete/:userId` | Oui (proprio ou admin) | – | `{ success, message }` |
| POST | `/api/user/signout` | Facultatif | – | Équivaut à `/api/auth/signout` |

### Posts & Événements
| Méthode | Route | Auth | Corps / Query | Réponse |
| --- | --- | --- | --- | --- |
| POST | `/api/post/create` | Oui | JSON : `title*`, `content*`, `category*` (`TrustMedia`, `TrustEvent`, `TrustProd`, `uncategorized`), `subCategory`, `image`, `eventDate`, `location` | `201 { success, message, data: { post }, post, slug }` |
| GET | `/api/post/getposts` | Non | Query : `userId`, `category`, `subCategory`, `slug`, `postId`, `searchTerm`, `startIndex` (offset), `limit` (défaut 9), `order` (`asc`/`desc`) | `{ success, data: { posts, totalPosts }, posts, totalPosts }` |
| PUT | `/api/post/updatepost/:postId/:userId` | Oui (proprio ou admin) | Corps identique à la création | `{ success, data: post, post, slug }` |
| DELETE | `/api/post/deletepost/:postId/:userId` | Oui (proprio ou admin) | – | `{ success, message }` |

> Les événements sont des posts avec `category = TrustEvent` et champs optionnels `eventDate`, `location`. Les anciennes routes `/api/post/*` sont conservées ; filtre `category=TrustEvent` pour une vue "Events".

### Commentaires
| Méthode | Route | Auth | Corps / Query | Réponse |
| --- | --- | --- | --- | --- |
| POST | `/api/comment/create` | Oui | `{ postId, content }` | `201 { success, data: comment, comment }` |
| GET | `/api/comment/getPostComments/:postId` | Non | – | `{ success, data: { comments }, comments }` |
| GET | `/api/comment/getcomments` | Oui (admin) | Query: `startIndex`, `limit`, `sort` (`asc`/`desc`) | `{ success, comments, totalComments, lastMonthComments, data: {...} }` |
| PUT | `/api/comment/likeComment/:commentId` | Oui | – | `{ success, data: comment, comment }` |
| PUT | `/api/comment/editComment/:commentId` | Oui (proprio ou admin) | `{ content }` | `{ success, data: comment, comment }` |
| DELETE | `/api/comment/deleteComment/:commentId` | Oui (proprio ou admin) | – | `{ success, message }` |

### Upload
| Méthode | Route | Auth | Corps | Réponse |
| --- | --- | --- | --- | --- |
| POST | `/api/uploads` | Oui | `multipart/form-data` champ `file` (ou `image` en compat) | `201 { success, data: { url, name, mime, size, type }, message }` |
| GET | `/uploads/<filename>` | Non | – | Fichier statique (servi depuis `UPLOAD_DIR`) |

## Modèles de données
- **User** : `username`, `email`, `password`, `profilePicture`, `isAdmin`, timestamps.
- **Post** : `userId`, `title`, `slug` (slugify lowercase/strict), `content`, `image`, `category`, `subCategory`, `eventDate?`, `location?`, timestamps.
- **Comment** : `userId`, `postId`, `content`, `likes[]`, `numberOfLikes`, timestamps.

## Pagination & tri
- `startIndex` : offset (0 par défaut).
- `limit` : nombre d’éléments (9 par défaut sur posts/commentaires/utilisateurs).
- `order` (`asc`/`desc`) pour les posts ; `sort` (`asc`/`desc`) pour les utilisateurs/commentaires.

## Erreurs attendues
- 400 : validation manquante (ex. login sans email/mot de passe, création de post sans `title/content/category`).
- 401 : non authentifié.
- 403 : non autorisé (propriété/admin).
- 404 : ressource manquante.
- 500 : erreur serveur ou Mongo.

