# Roadmap produit & technique

Chaque itération combine objectifs métier et chantiers techniques pour rapprocher Trust Media d’un CMS pro de niveau agence.

## Itération 1 – Stabilisation & cohérence
- **Objectif** : sécuriser les flux critiques et aligner les conventions UI/API.
- **Fonctionnalités** : messages d’erreur unifiés, états d’erreur UI, harmonisation des endpoints et payloads, durcissement des gardes admin.
- **Modules concernés** : API auth/user/post/comment/upload, routage front, middleware Redux/API client.
- **Changements techniques** : validation schémas (joi/zod), normalisation des réponses `{ success, data, error }`, rate limiting + CORS whitelist, logs structurés et healthchecks.
- **Valeur métier** : fiabilité accrue des opérations quotidiennes (login, publication, upload) et base saine pour brancher l’admin sur l’API.
  - **Chantiers remaster** :
    - A) Auth & API client unifiés (Bearer + session refresh).
    - B) Router CMS + UI pro (sidebar/topbar, boutons actifs).
    - C) Modules CMS branchés sur l’API + QA.

## Itération 2 – CMS éditorial professionnel
- **Objectif** : fournir un workflow éditorial complet et un backoffice utilisable en prod.
- **Fonctionnalités** : statuts brouillon/revue/publié, planning/push programmé, révisions + commentaires internes, éditeur modulaire (blocs), gabarits de page, filtres avancés et recherche par tags.
- **Modules concernés** : front admin (Articles/Pages/Événements), API posts/pages, service de recherche.
- **Changements techniques** : schémas enrichis (statuts, versions, métadonnées), service d’indexation (Mongo text index/Algolia/Meilisearch), hooks web pour publication, automatisation SEO (meta/OpenGraph/schemas, sitemap).
- **Valeur métier** : productivité éditoriale, cohérence des contenus et amélioration SEO.

## Itération 3 – Agence & gestion clients/projets
- **Objectif** : transformer le backoffice en cockpit agence.
- **Fonctionnalités** : CRM léger (clients/contacts), pipeline projets/campagnes, formulaires connectés, synchronisation newsletter/CRM, reporting campagnes et temps passé.
- **Modules concernés** : admin Clients/Projets/Campagnes/Newsletter/Formulaires, API dédiées, automatisations (webhooks/zapier-like).
- **Changements techniques** : nouveaux modèles (clients, projets, formulaires, envois), permissions fines par équipe/dossier, intégrations SMTP/CRM, stockage objet/CDN pour médias des campagnes.
- **Valeur métier** : visibilité portefeuille clients, suivi production et capacité à vendre des offres récurrentes.

## Itération 4 – Performance, SEO & analytics
- **Objectif** : optimiser l’expérience publique et instrumenter le produit.
- **Fonctionnalités** : optimisation images (lazy, WebP/AVIF), cache CDN, pré-rendu SSR/SSG des pages critiques, suivi analytics (événements éditoriaux et conversions), AB testing léger.
- **Modules concernés** : frontend public, pipeline build/deploy, observabilité (logs/metrics), module Analytics admin.
- **Changements techniques** : passage éventuel à SSR (Next/Remix) ou pré-rendu Vite SSG, CDN + headers cache, instrumentation (OpenTelemetry + logger), worker d’indexation/sitemap, tests de performance.
- **Valeur métier** : SEO amélioré, temps de chargement réduit, pilotage par la donnée.

## Itération 5 – Scalabilité & industrialisation
- **Objectif** : préparer le scale-up et l’ouverture à plusieurs marques/clients.
- **Fonctionnalités** : multi-tenant/multi-branding, plans d’abonnement, gestion des environnements (staging/preprod), feature flags et access management avancé.
- **Modules concernés** : provisionning des workspaces/clients, billing, auth/permissions, infra CI/CD/observabilité.
- **Changements techniques** : refonte RBAC (policies + scopes), séparation des données par tenant, infrastructure as code, CI/CD avec qualité (lint/test/build/scan), sauvegardes/restores automatisés.
- **Valeur métier** : onboarding rapide de nouveaux clients, fiabilité opérationnelle et capacité à industrialiser la distribution.
