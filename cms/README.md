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
Créer un fichier `.env` à la racine du projet (voir `.env.example`) :
- `VITE_API_URL` : URL de base de l'API (ex. `http://localhost:3000`).

## Déploiement Vercel
- Build command : `npm run build`
- Output directory : `dist`
- La SPA est configurée via `vercel.json` (rewrite vers `/index.html`).

## Build séparé depuis la racine
```bash
npm run build:cms
```

## Push séparé (subtree)
Depuis la racine du monorepo :
```bash
git subtree push --prefix cms git@github.com:ORG/trust-media-cms.git main
```

## Auth flow
- Token stocké en local (`cms_token`) + profil (`cms_current_user`).
- Au boot, si token présent : `GET /api/user/me`.
- En cas de 401, redirection `/login?returnTo=...`.

## Pages & routes
- `/` : Overview
- `/posts` : liste des articles
- `/posts/new` : création
- `/posts/:id/edit` : édition
- `/events` : liste événements
- `/events/new`
- `/events/:id/edit`
- `/media` : bibliothèque médias
- `/comments` : modération commentaires
- `/users` : admin utilisateurs
- `/settings` : paramètres

## Endpoints utilisés
- Posts : `GET /api/posts`, `GET /api/posts/:postId`, `POST /api/posts`, `PUT /api/posts/:postId`, `DELETE /api/posts/:postId`
- Media : `POST /api/media/upload` (FormData, champ `file`) + `GET /api/media`
- Comments : `GET /api/comment/getcomments`, `DELETE /api/comment/deleteComment/:commentId`
- Users : `GET /api/user/getusers`, `POST /api/user/admin-create`, `PATCH /api/user/:id/role`, `PUT /api/user/:id`, `DELETE /api/user/delete/:id`

## Identifiants
- Le CMS utilise `_id` (Mongo) pour l'édition/suppression des posts.
- Le site public utilise `slug` pour les URLs de lecture (`/post/:slug`).

## QA checklist
- Login/Logout OK
- Créer/éditer/supprimer un post
- Upload média + visibilité immédiate dans la Media Library
- Modération commentaires
- Sidebar : chaque item mène à une route existante
