# Trust Media — Site public

Application Vite/React du site public (UI existante). Elle consomme l'API Express disponible dans `trustapi-main`.

## Prérequis
- Node.js 18+

## Installation
```bash
npm install
npm run dev
```

## Configuration (.env)
Créer un fichier `.env` dans `apps/site` (voir `.env.example`) :
- `VITE_API_URL` : URL de base de l'API (ex. `http://localhost:3000`).
- `VITE_CMS_URL` (optionnel) : URL du CMS pour le lien admin (ex. `http://localhost:5174`).

## Scripts
Depuis la racine du monorepo :
```bash
npm run dev:site
npm run build
npm run lint
```

## Notes
- L'UI actuelle est conservée : aucune modification visuelle n'est nécessaire pour démarrer.
- Les appels API sont centralisés dans `apps/site/src/lib/apiClient.js`.

## Routes publiques principales
- `/` : Home
- `/news`, `/politique`, `/science`, `/sport`, `/cinema` : rubriques Trust Media
- `/search` : recherche/filtrage
- `/post/:slug` : article
- `/event` : Trust Event

## Mapping rubriques → API
- `MEDIA_CATEGORY` = `TrustMedia`
- `EVENT_CATEGORY` = `TrustEvent`
- Rubriques `TrustMedia` (`subCategory`) :
  - News → `news`
  - Politique → `politique`
  - Science/Tech → `science-tech`
  - Sport → `sport`
  - Cinéma → `cinema`

## Queries API (site public)
Les pages publiques consomment `GET /api/post/getposts` avec les paramètres supportés :
- `category`, `subCategory`
- `searchTerm`
- `startIndex` (pagination), `limit`
- `order` (`asc`/`desc`)
