# Project Diagnostic — Trust Media

## API connectivity
- ✅ `GET /api/health` répond toujours (même si MongoDB est indisponible).
- ✅ Si la base est indisponible, les routes dépendantes renvoient `503` avec un message explicite.
- ✅ Le bootstrap journalise `PORT`, `DB_HOST` (masqué) et `CORS_ORIGIN`.

## Autorisations CMS (policy mise à jour)
- ✅ La médiathèque n'est plus admin-only :
  - `GET /api/media` (auth)
  - `GET /api/media/:id` (auth)
  - `POST /api/media/upload` (auth)
  - `POST /api/media` (auth)
  - `PUT /api/media/:id` (owner/admin)
  - `DELETE /api/media/:id` (owner/admin)
- 🔐 Les sections sensibles restent admin-only :
  - Gestion des utilisateurs (listes, rôles)
  - Paramètres globaux
  - Modération globale des commentaires

## Notes
- L'ancien `403` sur `/api/media` en USER est considéré comme **résolu** (policy changée).

## Bug "Accès admin requis" (Users & Comments)
- **Cause racine** : désalignement potentiel entre anciens comptes `isAdmin` et le champ canonique `role`.
- **Correctif** :
  - Normalisation côté API : `resolveUserRole` mappe `isAdmin === true` vers `role = ADMIN`.
  - Endpoint debug (dev-only) : `GET /api/debug/whoami` pour vérifier le rôle renvoyé par le middleware.
  - Logs front (dev-only) : `site/src/lib/apiClient.js` et `cms/src/lib/apiClient.js` tracent les requêtes échouées (method, url, hasToken, status).
- **Attendu** :
  - ADMIN : `/api/user/getusers` et `/api/comment/getcomments` → `200`.
  - USER : `403` explicite sans forcer la déconnexion.
