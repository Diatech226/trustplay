# Roadmap produit & technique

Chaque itération vise un objectif clair avec scope, modules impactés, risques et critères d’acceptation. L’ordre est priorisé pour stabiliser l’exploitation avant d’étendre les fonctionnalités.

## Itération 1 — Stabilisation auth & médias
- **Objectif** : rendre l’auth et l’affichage média fiables sur site + CMS.
- **Scope** : unification rôle admin, normalisation URLs médias, cohérence `/api/user/me`, CORS clean.
- **Modules impactés** : `trustapi-main/api/utils/verifyUser.js`, `trustapi-main/api/utils/media.js`, helpers media front (`apps/site`, `apps/cms`).
- **Risques** : régression sur des tokens legacy, URL média historiques non normalisées.
- **Critères d’acceptation** :
  - `/users` CMS accessible en admin.
  - `GET /api/user/me` renvoie `role=ADMIN` pour un admin.
  - Images visibles partout (Home, Post, Media Library).

## Itération 2 — CMS éditorial pro
- **Objectif** : workflow éditorial complet (draft → review → published) avec actions rapides.
- **Scope** : statuts, planning, filtres avancés, SEO (title/description/OG).
- **Modules impactés** : `apps/cms/src/pages/PostEditor.jsx`, API posts (`trustapi-main/api/controllers/post.controller.js`).
- **Risques** : complexité UI (filtres + pagination), migrations de données.
- **Critères d’acceptation** :
  - Filtres par statut/rubrique/tags.
  - Changement de statut sans reload.
  - SEO complet rendu sur la page article.

## Itération 3 — Media pipeline avancé
- **Objectif** : pipeline médias optimisé (variants, WebP/AVIF, stockage).
- **Scope** : thumbnails, variantes par usage, compression, renommage uniforme.
- **Modules impactés** : `trustapi-main/api/controllers/upload.controller.js`, Media Library CMS.
- **Risques** : temps de traitement, stockage disque, compatibilité navigateur.
- **Critères d’acceptation** :
  - Variantes auto générées et exposées.
  - Préviews CMS rapides.
  - Poids moyen des images réduit.

## Itération 4 — SEO/perf + caching + monitoring
- **Objectif** : améliorer SEO/perf et rendre l’observabilité exploitable.
- **Scope** : cache HTTP, monitoring, logs structurés, suivi métriques clés.
- **Modules impactés** : API (headers cache), site public (lazy loading), pipeline build.
- **Risques** : invalidation cache, duplication analytics.
- **Critères d’acceptation** :
  - LCP réduit, images lazy + formats modernes.
  - Dash monitoring avec erreurs API et temps de réponse.

## Itération 5 — RBAC avancé + audit log
- **Objectif** : permissions par module + journal d’audit.
- **Scope** : rôles personnalisés, permissions fines, historique d’actions.
- **Modules impactés** : auth middleware, UI CMS (page activité), modèles DB.
- **Risques** : complexité RBAC, compatibilité avec rôles existants.
- **Critères d’acceptation** :
  - Permissions par module appliquées.
  - Audit log consultable par admin.
