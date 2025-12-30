# Production Readiness Audit — Trust Media Monorepo

Date: 2025-02-14

## Scope
- **apps/site** (Vite/React public site)
- **apps/cms** (Vite/React CMS)
- **trustapi-main** (Express/MongoDB API)

## P0 — Bloquants (must-fix)
1. **Incohérence des endpoints posts (site)**
   - **Cause probable** : le site consommait `GET /api/post/getposts` (legacy) alors que le CMS utilise `GET /api/posts`.
   - **Fichiers** : `apps/site/src/services/posts.service.js`.
   - **Fix appliqué** : standardisation côté site sur `/api/posts`.
   - **Validation** : vérifier que Home/TrustEvent/TrustProduction chargent les posts et que la pagination fonctionne.

2. **CORS permissif en prod + preflight instable**
   - **Cause probable** : origin wildcard en l’absence de `CORS_ORIGIN` et middleware CORS qui renvoyait un 403 non standard.
   - **Fichiers** : `trustapi-main/api/index.js`.
   - **Fix appliqué** : CORS strict en production (origines obligatoires), ajout par défaut de `localhost:5173/5174` en dev, options preflight stabilisées.
   - **Validation** : vérifier OPTIONS et appels cross-origin en dev/prod.

3. **Sécurité minimale absente (rate limit + sanitize)**
   - **Cause probable** : pas de rate limiting et pas de sanitation des inputs.
   - **Fichiers** : `trustapi-main/api/index.js`.
   - **Fix appliqué** : rate limiting sur `/api/auth`, headers de sécurité de base, sanitation des inputs.
   - **Validation** : vérifier headers de sécurité + throttling des routes auth.

4. **Media endpoint non restreint**
   - **Cause probable** : `/api/media` était accessible à tout utilisateur authentifié.
   - **Fichiers** : `trustapi-main/api/routes/media.route.js`.
   - **Fix appliqué** : `requireAdmin` sur `/api/media` et `/api/media/upload`.
   - **Validation** : un compte non-admin ne peut pas lister/uploader, un admin oui.

## P1 — Importants (à stabiliser)
1. **Rôle admin côté front**
   - **Cause probable** : rôle non normalisé ou non hydraté après `GET /api/user/me`.
   - **Fichiers** : `apps/cms/src/context/AuthContext.jsx`, `apps/site/src/App.jsx`.
   - **Fix recommandé** : conserver la normalisation du rôle et éviter les logout en cascade sur 403.
   - **Validation** : connexion admin -> navigation CMS, pas de boucle de reconnexion.

2. **Uploads & URLs médias absolues**
   - **Cause probable** : images rendues avec URL relative si `API_PUBLIC_URL` absent.
   - **Fichiers** : `trustapi-main/api/controllers/media.controller.js`, `trustapi-main/api/utils/media.js`.
   - **Fix recommandé** : documenter `API_PUBLIC_URL` dans les README (fait) + vérifier `/uploads` en prod.
   - **Validation** : upload depuis CMS, affichage correct dans CMS et site public.

3. **Commentaires (postId)**
   - **Cause probable** : création appelée sans `postId` ou `postId` undefined.
   - **Fichiers** : `apps/site/src/components/CommentSection.jsx`.
   - **Fix appliqué** : garde de validation de `postId` côté site.
   - **Validation** : création de commentaire sur un post existant, erreur contrôlée si postId manquant.

## P2 — Améliorations (nice-to-have)
1. **Standardisation des réponses API**
   - **Cause probable** : réponses parfois hétérogènes (`data`/`post`/`media`).
   - **Fix recommandé** : aligner progressivement sur `{ success, data, message }`.

2. **Empty states + retry UX**
   - **Cause probable** : expérience vide peu explicite sur certains écrans.
   - **Fix appliqué** : retry/backoff léger côté client partagé.
   - **Fix recommandé** : ajouter des empty states supplémentaires sur les pages secondaires.

## Fixes appliqués (résumé)
- Standardisation des appels posts du site vers `/api/posts`.
- CORS strict en prod + preflight stabilisé, origin dev ajoutés par défaut.
- Sécurité minimale : headers de sécurité, sanitation des inputs, rate limit `/api/auth`.
- Restriction admin pour `/api/media` et `/api/media/upload`.
- Retry/backoff réseau côté client partagé.

## Checklist QA (validation prod)
- [ ] Connexion admin : accès CMS sans boucle de reconnexion.
- [ ] `GET /api/user/me` retourne bien `role` = `ADMIN` pour les admins.
- [ ] CORS dev (5173/5174) OK + CORS prod sur domaines autorisés.
- [ ] Upload media depuis CMS : URL absolue fonctionnelle + preview.
- [ ] Posts : création CMS -> affichage site + compteurs overview cohérents.
- [ ] Commentaires : création côté site + modération CMS.
- [ ] Navigation : tous les liens du header du site mènent à des routes existantes.
