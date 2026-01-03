# Analyse interne & benchmark Trust Media

## 1️⃣ Analyse interne
### A. Architecture
- **Organisation** : séparation claire frontend (`src/`) et backend (`backend/api`). Routage React structuré via `src/App.jsx` avec lazy loading et gardes de routes ; backoffice sous `/dashboard` avec contrôles de rôle. L'API Express monte les routes auth/user/post/comment/upload et sert les assets depuis `/uploads`.
- **Patterns** : contrôleurs/routers/modèles côté API, middleware JWT (`verifyToken`) et gate `requireAdmin`. Côté front, layout admin (sidebar, header, breadcrumbs) et navigation role-based, mais la logique RBAC est dupliquée entre client et serveur et reste minimale (peu de services/intercepteurs partagés).
- **État** : Redux Toolkit persistant pour utilisateur/thème/favoris/historique/notifications. Restauration de session et rafraîchissement du profil si un token existe.
- **Conventions** : réponses API mêlant parfois `{ success, data }` et retour direct d’objets ; endpoints nommés `getposts`, `updatepost`… peu homogènes. Côté front, conventions de noms et cheminement des rôles sont cohérents mais non documentés.

### B. Fonctionnalités actuelles
- **Authentification & rôles** : login/signup JWT, persistance locale, route `/user/me` pour profil. Front protège `/dashboard` et les routes de création/mise à jour, mais le backend n’expose qu’un rôle ADMIN strict (pas de MANAGER/EDITOR côté API).
- **Gestion de contenus** : CRUD posts/événements, recherche/pagination, commentaires avec like/édition/suppression, pages de rubriques. L’admin affiche des tables mock (articles/pages/événements/campagnes/clients/projets/newsletter/formulaires/activité) et des quick actions.
- **Upload médias** : endpoint `/api/uploads` avec limites MIME/tailles et stockage sur disque (`UPLOAD_DIR` exposé en statique).
- **Dashboard** : sidebar collapsible, header avec recherche, switch de thème, breadcrumbs, cartes KPI mock et navigation par module.
- **Navigation & filtres** : recherche multi-critères (`searchTerm`, `sort/order`, `category`, `startIndex`) et filtres par sous-catégorie sur la home ; pages événements/production/projets dédiées.
- **Sécurité & permissions** : contrôle bearer obligatoire côté API, admin requis pour la liste des utilisateurs/commentaires ; ownership vérifiée au niveau des contrôleurs. Pas de scopes fins ni de politique de rate limit.

### C. Qualité & maintenabilité
- **Erreurs** : middleware d’erreur global côté API ; messages explicites sur les tokens manquants/invalides et sur la connexion Mongo. Peu de gestion d’erreurs au niveau des services front (erreurs souvent loggées mais non exposées à l’utilisateur).
- **Robustesse** : flux auth/CRUD/upload couverts mais sans tests automatisés ; pagination simple par offset ; absence de validation centralisée des schémas (ex. joi/zod) et de mécanisme de retry/cache front.
- **Dette technique** :
  - Conventions d’API hétérogènes (`getposts` vs `/posts`), payloads peu normalisés.
  - RBAC incomplet (UI vs API), absence de permissions granularisées et d’audit trail côté serveur.
  - Pas de CI/CD ni de tests (unitaires/e2e), pas d’observabilité (logs structurés, métriques, traces).
  - Upload sur disque local sans CDN ni transformations d’images.
- **Risques & opportunités** :
  - Risque de dérive entre UI et API sur les rôles/modules ; cohérence à formaliser.
  - Opportunité de transformer l’admin mock en CMS modulaire (pages, médias, campagnes) via un contrat d’API cohérent.
  - Manque de SEO/performances (CSR pur) et d’analytics ; à adresser pour un produit média.

## 2️⃣ Benchmark (CMS médias/agences)
- **UX backoffice** : les CMS pro (Contentful, Strapi, Sanity, Prismic) offrent navigation modulaire, vues personnalisables, états vides/loading, et éditeurs riches extensibles. Trust Media dispose déjà d’un layout agence et de données mock, mais manque de workflows (brouillon/revue), d’états de validation et de design systems partagés.
- **Workflow éditorial** : standards pro = statuts multiples, planification, commentaires internes, révision et versioning. Ici, seule la création/édition simple est disponible, sans calendrier ni validation.
- **Gestion médias** : les CMS modernes intègrent transformations, CDN, tags et droits. Trust Media ne gère que l’upload brut en local.
- **Permissions & collaboration** : solutions SaaS offrent RBAC granulaires, espaces/tenants, audit et notifications. L’app dispose d’un rôle ADMIN côté API et d’un RBAC UI simple ; pas de collaboration temps réel.
- **Performance & SEO** : SSR/SSG, métadonnées dynamiques, sitemaps, schemas.org et optimisations images sont la norme. Trust Media est CSR avec SEO limité et pas d’optimisation image.
- **Scalabilité & observabilité** : pipelines CI/CD, monitoring (APM/logs/metrics) et feature flags sont standards. L’app n’a pas encore d’outillage d’industrialisation.

## 3️⃣ Recommandations & priorisation
### Quick wins (itération 1)
- Normaliser les réponses API (`success`, `data`, `errors`), harmoniser les noms d’endpoint et ajouter la validation de payloads (zod/joi) côté API.
- Sécuriser les routes sensibles (RBAC serveur, rate limiting, CORS resserré) et aligner les rôles UI/API.
- Couvrir les flux critiques par des tests légers (auth, CRUD posts, upload) et ajouter des états d’erreur côté UI.
- Mettre en place des métriques de base (healthcheck, logs structurés, dashboard Mongo/HTTP).

### Moyen terme (itérations 2-3)
- Mettre en place un workflow éditorial (brouillon → revue → publication), planification et versioning ; ajouter un éditeur modulaire et des modèles de page.
- Construire une médiathèque avec conversions (WebP/AVIF), CDN/objets et tags, plus un système de droits sur les médias.
- Établir un vrai module Agence (clients, projets, campagnes) avec statuts, pipelines, formulaires connectés et reporting.
- Améliorer le SEO (métas dynamiques, sitemap, schémas) et la performance front (mise en cache, lazy loading, SplitChunks).

### Long terme (itérations 4-5)
- Industrialiser (CI/CD, tests e2e, scans SAST/DAST), observabilité (APM, logs centralisés, alerting) et feature flags.
- Préparer le multi-tenant/multi-marque avec isolation des données, custom branding et plans tarifaires.
- Ajouter analytics temps réel, dashboards éditoriaux, AB testing et intégrations partenaires (newsletter/CRM/CDP).

## 4️⃣ Roadmap
La roadmap détaillée par itération est documentée dans [`ROADMAP.md`](./ROADMAP.md) et résume les objectifs, modules, changements techniques et valeur métier attendue.
