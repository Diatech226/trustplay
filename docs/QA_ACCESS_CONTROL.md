# QA checklist — Access control (ADMIN vs USER)

## Backend
- USER reçoit `403` sur les endpoints admin (media, pages, settings, analytics, clients/projects/campaigns, admin users, comments moderation).
- USER reçoit `403` sur les endpoints d’édition de posts/events (`POST/PUT/DELETE/PATCH` admin-only).
- ADMIN peut appeler toutes les routes admin sans erreur.
- `GET /api/debug/whoami` retourne `{ id, role }` en environnement non-prod.

## CMS (Vite)
- USER non authentifié est redirigé vers `/login`.
- USER authentifié (role `USER`) voit une page **Accès refusé** et ne peut pas charger l’interface.
- ADMIN voit le CMS normalement et toutes les routes fonctionnent.

## Site public
- `/dashboard` et ses sous-routes sont admin-only.
- USER authentifié reçoit un écran **Accès refusé** (sans logout).
- Le lien "CMS" et les navs admin n’apparaissent que pour `ADMIN`.
