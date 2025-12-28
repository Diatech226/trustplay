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
