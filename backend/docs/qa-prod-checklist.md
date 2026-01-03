# QA Checklist — Production Readiness

## Auth & roles
- [ ] Login admin depuis CMS, accès à `/` (Overview) sans boucle de reconnexion.
- [ ] `GET /api/user/me` renvoie bien `role: ADMIN` pour un admin.
- [ ] `ADMIN_EMAILS` promeut automatiquement un compte au login.
- [ ] Script `npm run make-admin -- --email user@mail.com` fonctionne.

## CORS & API health
- [ ] `GET /api/health` répond même si MongoDB est indisponible.
- [ ] CORS dev autorise `http://localhost:5173` et `http://localhost:5174`.
- [ ] CORS prod respecte `CORS_ORIGIN`.
- [ ] Preflight OPTIONS retourne les headers CORS attendus.

## Media
- [ ] Upload via CMS (`POST /api/media/upload`) avec champ `file`.
- [ ] Les URLs retournées sont absolues (via `API_PUBLIC_URL`) et accessibles.
- [ ] `/uploads/<filename>` est servi publiquement.

## Posts
- [ ] Création post dans le CMS -> visible sur site (`/` et page rubrique).
- [ ] `GET /api/posts` filtre correctement par `status`, `category`, `subCategory`.
- [ ] Compteurs overview (draft/published/scheduled) reflètent les données réelles.

## Commentaires
- [ ] Création de commentaire par un utilisateur connecté.
- [ ] Modération des commentaires dans le CMS (listing + suppression).

## Navigation & UX
- [ ] Tous les liens du header du site pointent vers des routes valides.
- [ ] Les rubriques filtrent correctement les posts.
- [ ] Pages TrustEvent/TrustProduction alimentées avec les posts correspondants.

## Sécurité minimale
- [ ] Rate limit appliqué sur `/api/auth`.
- [ ] `helmet` actif et `express-mongo-sanitize` actif.

