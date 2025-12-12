# API Contract — Trust Media

## Convention
- Base URL configurable via `VITE_API_URL` côté front.
- Authentification : JWT en cookie `access_token` ou en header `Authorization: Bearer <token>`.
- Réponses : `{ success, data?, message? }` avec duplication des champs principaux pour compatibilité (`posts`, `user`, `token`, ...).

## Routage Backend → Frontend
| Endpoint | Méthode | Frontend (écran/comp) | Payload entrée | Données retour clés | Auth |
| --- | --- | --- | --- | --- | --- |
| `/api/auth/signup` | POST | SignUp.jsx | `{ username, email, password }` | `message`, `data.userId` | Non |
| `/api/auth/signin` | POST | SignIn.jsx | `{ email, password }` | `user`, `token`, cookie | Non |
| `/api/auth/google` | POST | components/OAuth.jsx | `{ email, name, googlePhotoUrl }` | `user`, `token`, cookie | Non |
| `/api/auth/signout` | POST | Header.jsx, DashSidebar.jsx, AdminLayout.jsx | – | `message` | Oui (cookie/bearer)
| `/api/user/me` | GET | App.jsx (bootstrap session) | – | `data.user` | Oui |
| `/api/user/getusers` | GET | DashboardComp, DashUsers | Query: `startIndex`, `limit`, `sort` | `users`, `totalUsers`, `lastMonthUsers` | Admin |
| `/api/user/update/:userId` | PUT | DashProfile.jsx | Profil/mot de passe | `user` | Auth + propriétaire |
| `/api/user/delete/:userId` | DELETE | DashProfile.jsx, DashUsers | – | `message` | Auth (admin ou propriétaire) |
| `/api/post/create` | POST | CreatePost.jsx | Article/Event (`title`, `content`, `category`, `subCategory`, `image`, `eventDate`, `location`) | `post`, `slug` | Auth |
| `/api/post/getposts` | GET | Home, Search, CategoryPageLayout, Event, DashPosts, DashboardComp, UpdatePost | Query: `userId`, `category`, `subCategory`, `slug`, `postId`, `searchTerm`, `startIndex`, `limit`, `order` | `posts`, `totalPosts` | Public |
| `/api/post/updatepost/:postId/:userId` | PUT | UpdatePost.jsx | Corps identique à la création | `post`, `slug` | Auth (admin/auteur) |
| `/api/post/deletepost/:postId/:userId` | DELETE | DashPosts.jsx | – | `message` | Auth (admin/auteur) |
| `/api/comment/create` | POST | CommentSection.jsx | `{ postId, content }` | `comment` | Auth |
| `/api/comment/getPostComments/:postId` | GET | CommentSection.jsx | – | `comments[]` | Public |
| `/api/comment/getcomments` | GET | DashboardComp, DashComments | Query: `startIndex`, `limit`, `sort` | `comments`, `totalComments`, `lastMonthComments` | Admin |
| `/api/comment/deleteComment/:commentId` | DELETE | CommentSection.jsx, DashComments | – | `message` | Auth (admin/propriétaire) |
| `/api/comment/likeComment/:commentId` | PUT | CommentSection.jsx | – | `comment` (maj likes) | Auth |
| `/api/uploads` | POST | utils/uploadImage.js (Create/Update Post) | `multipart/form-data` (`image` ou `file`) | `data.url` (URL publique) | Auth conseillée |
| `/uploads/<filename>` | GET | assets uploadés | – | Fichier statique | Public |

## Points de cohérence
- Catégorie de filtrage côté front : utiliser `subCategory` (camelCase) aligné avec le backend.
- Les appels administrateur doivent passer `{ auth: true }` dans `apiRequest` pour envoyer le cookie et le bearer local.
- Les écrans TrustEvent (Event.jsx) consomment `/api/post/getposts?category=TrustEvent`; l'inscription événementielle reste à implémenter côté API.

## Format d'erreur attendu
```json
{
  "success": false,
  "message": "Raison de l'échec",
  "statusCode": 400
}
```
