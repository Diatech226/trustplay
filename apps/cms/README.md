# Trust Media — CMS v2

Backoffice Vite/React standalone. Layout pro (sidebar/topbar/breadcrumbs) et modules branchés sur l'API existante.

## Prérequis
- Node.js 18+

## Installation
```bash
npm install
npm run dev
```

## Configuration (.env)
Créer un fichier `.env` dans `apps/cms` (voir `.env.example`) :
- `VITE_API_URL` : URL de base de l'API (ex. `http://localhost:3000`).

## Auth flow
- Token stocké en local (`cms_token`).
- Au boot, si token présent : `GET /api/user/me`.
- En cas de 401, redirection `/login?returnTo=...`.

## Pages & routes
- `/` : Overview
- `/posts` : liste des articles
- `/posts/new` : création
- `/posts/:postId` : édition
- `/events` : liste événements
- `/events/new`
- `/events/:postId`
- `/media` : bibliothèque médias
- `/comments` : modération commentaires
- `/users` : admin utilisateurs
- `/settings` : paramètres

## Endpoints utilisés
- Posts : `GET /api/post/getposts`, `POST /api/post/create`, `PUT /api/post/updatepost/:postId/:userId`, `DELETE /api/post/deletepost/:postId/:userId`
- Upload : `POST /api/uploads` (FormData, champ `file`)
- Comments : `GET /api/comment/getcomments`, `DELETE /api/comment/deleteComment/:commentId`
- Users : `GET /api/user/getusers`

## QA checklist
- Login/Logout OK
- Créer/éditer/supprimer un post
- Upload média + prévisualisation
- Modération commentaires
- Sidebar : chaque item mène à une route existante
