# Media pipeline fix (images site + CMS)

## Cause racine
- Les URLs d'images stockées en base sont des chemins publics (`/uploads/...`) qui doivent être préfixés avec l'hôte API **sans** `/api`.
- Lorsque `VITE_API_URL` est défini avec un suffixe `/api` (ex: `http://localhost:3000/api`), le frontend construisait des URLs d'images erronées (`/api/uploads/...`) → 404 sur le serveur statique.

## Correction
- Normalisation côté frontend pour dériver une base médias dédiée qui retire un suffixe `/api` si présent.
- Cette base est utilisée pour toutes les URLs images (site + CMS), sans modifier l'API base utilisée pour les requêtes REST.

## Fichiers modifiés
- `site/src/lib/mediaUrls.js`
- `cms/src/lib/mediaUrls.js`

## Convention retenue
- Les médias sont stockés en DB sous forme de chemins publics relatifs : `/uploads/<fichier>`.
- Les frontends résolvent l'URL complète via `resolveMediaUrl`, qui préfixe l'hôte **sans** `/api`.

## Comment tester
1. Démarrer l'API + frontends.
2. Uploader une image via le CMS (`POST /api/uploads`).
3. Vérifier l'accès direct : `http://localhost:3000/uploads/<filename>`.
4. Vérifier l'affichage dans :
   - Home (site)
   - Page article (site)
   - Media Library (CMS)
