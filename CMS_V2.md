# Trust Media — CMS v2 (Blueprint pro & fonctionnel)

Ce document décrit une **version 2 du CMS** (dashboard admin) : architecture, routes, UI, modules, conventions API, et checklist QA. Objectif : obtenir un backoffice **professionnel**, **stable**, et **100% fonctionnel** (zéro bouton mort), tout en gardant le site public intact.

---

## 1) Vision produit

### Ce que le CMS v2 doit permettre (MVP)

1. **Gérer le contenu média** (Articles) : créer / modifier / supprimer, rubriques, image/vidéo, SEO de base.
2. **Gérer TrustEvent (Événements)** : CRUD, date, lieu, gratuit/payant, participants (liste + export simple).
3. **Gérer les commentaires** : modération (suppression), statut (visible/masqué) si possible.
4. **Bibliothèque médias** : upload (image/vidéo) via Multer API, preview, réutilisation dans les posts.
5. **Gestion users (admin)** : liste + stats, et marquage admin (via DB si ta stack le permet).
6. **Dashboard overview** : stats (posts, users, comments) + derniers contenus.

### Principes de qualité

- **Navigation fiable** : sidebar = vrais liens, routes existantes, état actif.
- **API solide** : un seul client HTTP (apiClient) + gestion standardisée des erreurs.
- **Auth stable** : pas de “reconnectez-vous” si token valide.
- **UX pro** : tables, filtres, pagination, modals de confirmation, toasts.

---

## 2) Architecture CMS v2 (Front)

### 2.1 Routes

Toutes les pages du CMS sont sous `/dashboard`.

- `/dashboard` : Overview
- `/dashboard/posts` : liste + filtres
- `/dashboard/posts/new` : création
- `/dashboard/posts/:postId/edit` : édition
- `/dashboard/events` : liste événements
- `/dashboard/events/new`
- `/dashboard/events/:eventId/edit`
- `/dashboard/media` : bibliothèque médias
- `/dashboard/comments` : modération commentaires
- `/dashboard/users` : admin users + stats
- `/dashboard/settings` : paramètres (placeholder utile)

> Chaque item du menu gauche **doit** pointer vers une route existante.

### 2.2 Layout dashboard

- **DashboardLayout**
  - Sidebar (NavLink)
  - Topbar (titre, recherche globale optionnelle, profil, logout)
  - Breadcrumbs (automatique)
  - `<Outlet />` (content)

### 2.3 Arborescence recommandée

```
src/
  app/
    routes/                 # router config
    providers/              # Providers (Redux, Persist, Helmet)
  cms/
    layout/
      DashboardLayout.jsx
      Sidebar.jsx
      Topbar.jsx
      Breadcrumbs.jsx
    pages/
      Overview.jsx
      PostsList.jsx
      PostEditor.jsx
      EventsList.jsx
      EventEditor.jsx
      MediaLibrary.jsx
      CommentsModeration.jsx
      UsersAdmin.jsx
      Settings.jsx
    components/
      DataTable.jsx
      PageHeader.jsx
      ConfirmDialog.jsx
      ToastProvider.jsx
      EmptyState.jsx
      Skeleton.jsx
      Form/
        FormField.jsx
        validators.js
    services/
      posts.service.js
      events.service.js
      comments.service.js
      users.service.js
      media.service.js
  lib/
    apiClient.js
    auth.js
  redux/
    store.js
    userSlice.js
    themeSlice.js
```

---

## 3) Auth & Session (CMS v2)

### 3.1 Stratégie recommandée

**Bearer token partout** (Authorization: Bearer), cookie en fallback si présent.

- Stockage côté front : Redux Persist (localStorage)
- Au démarrage :
  1. hydrater `currentUser` depuis persist
  2. si `token` existe → appeler `/api/user/me` pour valider et rafraîchir le user

### 3.2 Redirections

- Si accès à une route protégée sans session : redirect `/sign-in` avec `returnTo`.
- Après login : revenir à `returnTo` si défini, sinon `/dashboard`.

### 3.3 Guard propre

- `RequireAuth` : vérifie token/user, sinon redirect sign-in.
- `RequireAdmin` : vérifie `currentUser.isAdmin === true`.

**Important :** un 401 sur une requête API **ne doit pas** te rediriger automatiquement vers login à chaque fois. On doit :

- afficher un message + tenter `/me` une fois
- si échec confirmé → logout + redirect sign-in

---

## 4) API contract mapping (avec ton backend existant)

### 4.1 Endpoints (existants)

- Auth
  - POST `/api/auth/signup`
  - POST `/api/auth/signin`
  - POST `/api/auth/signout`
  - GET  `/api/auth/me` ou `/api/user/me` (selon ton code) → **choisir 1 et standardiser**
- Users
  - GET `/api/user/me`
  - GET `/api/user/getusers` (admin)
- Posts
  - POST `/api/post/create`
  - GET  `/api/post/getposts?category=&subCategory=&searchTerm=&startIndex=&limit=&order=`
  - PUT  `/api/post/updatepost/:postId/:userId`
  - DELETE `/api/post/deletepost/:postId/:userId`
- Comments
  - POST `/api/comment/create`
  - GET  `/api/comment/getPostComments/:postId`
  - DELETE `/api/comment/deleteComment/:commentId`
- Upload
  - POST `/api/uploads` (multipart)
  - GET  `/uploads/<filename>`

### 4.2 Conventions côté Front

Tous les appels passent par `apiClient`.

- JSON: `apiClient.get/post/put/delete`
- Upload: `apiClient.upload('/api/uploads', formData)`

Toujours :

- `Authorization: Bearer <token>`
- `baseURL = VITE_API_URL`

---

## 5) UI/UX pro — règles

### 5.1 Sidebar (menu gauche)

Doit contenir :

- Overview
- Articles
- Événements
- Médias
- Commentaires
- Utilisateurs
- Paramètres

**Chaque item = `NavLink`** (pas `<a href>`), et doit :

- avoir une icône
- état actif (highlight)
- support collapse mobile

### 5.2 Patterns pro

- Liste = table (DataTable) avec :
  - search
  - filtres
  - pagination
  - actions (Edit/Delete)
- Delete = modal ConfirmDialog
- Feedback = Toast (success/error)
- Chargement = Skeleton
- Aucun contenu = EmptyState

---

## 6) Modules détaillés

### 6.1 Overview

- KPI cards : total posts, total users, total comments
- “Derniers articles” (5)
- “Derniers événements” (5)

### 6.2 Articles — PostsList

- colonnes : titre, rubrique, statut, date, auteur
- filtres : `category` (TrustMedia/TrustEvent/TrustProduction), `subCategory` (news/politique/science-tech/sport/cinema)
- bouton “Nouvel article”

### 6.3 Articles — PostEditor

- champs : title, subCategory, content (ReactQuill), coverImage (upload), tags
- bouton “Enregistrer” + “Publier” (si modèle supporte)
- validation : title obligatoire, subCategory obligatoire pour TrustMedia

### 6.4 Events

- champs : title, date, location, pricingType (free/paid), price (si paid)
- CTA : “Créer événement”
- Participants : tableau (si endpoint existant, sinon placeholder)

### 6.5 Media Library

- upload image/vidéo
- liste des derniers uploads (simple)
- copier l’URL

### 6.6 Comments Moderation

- liste globale (admin) si route existante, sinon :
  - page par post (depuis PostEditor)
- actions : delete
- fix obligatoire : ne jamais appeler getPostComments avec postId undefined

### 6.7 Users

- listing + stats
- afficher isAdmin

---

## 7) Fixes critiques à implémenter (causes probables)

### 7.1 “Je suis connecté mais on me redemande de me connecter”

Causes typiques :

1. token non injecté sur les requêtes CMS
2. redirection trop agressive sur 401
3. mismatch cookie vs bearer
4. CORS/credentials non cohérent

**Fix v2** : apiClient unique + guards propres + refresh `/me`.

### 7.2 Menu gauche sans liens

Cause : sidebar en simple UI sans `NavLink` + routes pas déclarées.

**Fix v2** : router `/dashboard/*` + Sidebar NavLink.

### 7.3 CastError comments postId undefined

Cause : composant commentaires lancé avant que `post._id` ne soit disponible.

**Fix v2** :

- front: `if (!postId) return;`
- backend: valider ObjectId et retourner 400 si invalide

---

## 8) Checklist QA (obligatoire avant merge)

### Auth

- [ ] Login admin -> redirect `/dashboard`
- [ ] Refresh page dashboard -> session conservée
- [ ] Create post sans “relogin”

### Navigation

- [ ] Sidebar: chaque item ouvre une page
- [ ] Active state visible

### Posts

- [ ] Liste posts charge
- [ ] Création post OK
- [ ] Upload cover OK + preview
- [ ] Edit OK
- [ ] Delete OK

### Comments

- [ ] PostPage charge les comments
- [ ] Create comment OK
- [ ] Delete comment admin OK
- [ ] Pas de requête `/getPostComments/undefined`

### Events

- [ ] CRUD event OK

---

## 9) Livrables à produire dans le dépôt

- `CMS_V2.md` (ce document)
- `README.md` mis à jour :
  - comment lancer front+api
  - env vars
  - routes cms v2
  - QA checklist
- (optionnel) `QA_CHECKLIST.md`

---

## 10) Prompt prêt à envoyer à Codex (remaster CMS v2)

> Utilise ce prompt si tu veux demander à Codex d’implémenter le CMS v2.

**PROMPT**

- Implémente un CMS v2 basé sur `/dashboard/*` avec DashboardLayout + Sidebar NavLink + pages Overview/Posts/Events/Media/Comments/Users/Settings.
- Remplace tous les fetch dispersés par un apiClient unique (Bearer token auto).
- Corrige l’auth : login redirect vers returnTo ou /dashboard, refresh via /api/user/me, plus de “relogin” sur actions.
- Branche Posts CRUD + upload Multer + comments moderation.
- Ajoute ConfirmDialog, Toast, Skeleton, EmptyState.
- Mets à jour README avec routes CMS v2 + QA checklist.
