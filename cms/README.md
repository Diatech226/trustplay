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
- Root directory : `cms/`
- Build command : `npm run build`
- Output directory : `dist`
- Variables d'environnement :
  - `VITE_API_URL` (ex. `https://api.trust-group.agency`)
- La SPA est configurée via `vercel.json` (rewrite vers `/index.html`, présent à la racine de l'app).

## Troubleshooting (CORS / 404 / médias)
- **CORS** : vérifier que l'API autorise `https://cms.trust-group.agency` dans `CORS_ORIGIN`.
- **404 en refresh** : confirmer que le `vercel.json` de l'app applique le rewrite vers `/index.html`.
- **Médias cassés** : `VITE_API_URL` doit être l'origine de l'API et `API_PUBLIC_URL` doit être défini côté backend.

## Auth flow (admin-only)
- Le CMS est réservé aux comptes `ADMIN`.
- Token stocké en local (`cms_token`) + profil (`cms_current_user`).
- Au boot, si token présent : `GET /api/user/me`.
- En cas de 401, redirection `/login?returnTo=...`.
- En cas de 403 ou de rôle `USER`, l'interface affiche une page **Accès refusé** (sans logout).

## Pages & routes
- `/` : Overview
- `/pages` : liste des pages CMS
- `/pages/new` : création
- `/pages/:id/edit` : édition
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

## Créer une page
1. Aller sur **Pages > Nouvelle page**.
2. Renseigner le titre, le slug (auto-généré) et le contenu.
3. Ajouter un extrait si nécessaire.
4. Sélectionner le statut (brouillon, publié, planifié) et enregistrer.

## Workflow de statut
- **Brouillon** : non visible, sauvegarde rapide.
- **Publié** : visible immédiatement.
- **Planifié** : définir une date/heure, puis cliquer sur **Programmer**.

## Insertion média dans l'éditeur
- **Insérer un média** : ouvre la Media Library et insère au curseur.
- **Upload média** : upload local, puis insertion automatique dans le contenu.
- Le média mis en avant se choisit via la Media Library ou upload direct.

## Endpoints utilisés
- Posts : `GET /api/posts`, `GET /api/posts/:postId`, `POST /api/posts`, `PUT /api/posts/:postId`, `DELETE /api/posts/:postId`
- Pages : `GET /api/pages`, `GET /api/pages/:pageId`, `POST /api/pages`, `PUT /api/pages/:pageId`, `PATCH /api/pages/:pageId/status`, `DELETE /api/pages/:pageId`
- Media : `POST /api/media/upload` (FormData, champ `file`) + `GET /api/media` + `PUT /api/media/:id`
- Comments : `GET /api/comment/getcomments`, `DELETE /api/comment/deleteComment/:commentId`
- Users : `GET /api/user/getusers`, `POST /api/user/admin-create`, `PATCH /api/user/:id/role`, `PUT /api/user/:id`, `DELETE /api/user/delete/:id`

## Identifiants
- Le CMS utilise `_id` (Mongo) pour l'édition/suppression des posts.
- Le site public utilise `slug` pour les URLs de lecture (`/post/:slug`).

## QA checklist
- Login/Logout OK
- Compte USER bloqué (redirection/login si non authentifié, accès refusé si token valide)
- Accès direct aux routes CMS interdit pour USER (URL directe)
- Créer/éditer/supprimer un post
- Créer/éditer/supprimer une page
- Insertion média + upload dans l’éditeur de pages
- Mise en avant média via la Media Library
- Upload média + visibilité immédiate dans la Media Library
- Sélection d’un média en couverture (posts & événements)
- Insertion d’un média dans le contenu (éditeur)
- Modération commentaires
- Sidebar : chaque item mène à une route existante
