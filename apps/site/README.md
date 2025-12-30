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
- `/rubriques` : liste des rubriques Trust Media
- `/search` : recherche/filtrage
- `/post/:slug` : article
- `/events` (alias `/event`) : Trust Event
- `/production` : Trust Production
- `/about` : à propos
- `/privacy-policy`, `/terms` : pages légales
- `/favorites`, `/history`, `/notifications-preferences` : espaces lecteurs

## Mapping rubriques → API
- `MEDIA_CATEGORY` = `TrustMedia`
- `EVENT_CATEGORY` = `TrustEvent`
- `PRODUCTION_CATEGORY` = `TrustProduction`
- Rubriques `TrustMedia` (`subCategory`) :
  - News → `news`
  - Politique → `politique`
  - Science/Tech → `science-tech`
  - Sport → `sport`
  - Cinéma → `cinema`
  - Toute valeur obsolète est normalisée vers ces rubriques côté front (fallback: `news`).

## Queries API (site public)
Les pages publiques consomment `GET /api/posts` avec les paramètres supportés :
- `category`, `subCategory`
- `searchTerm`
- `startIndex` (pagination), `limit`
- `order` (`asc`/`desc`)

## Paramètres de navigation (UI)
La page `/search` accepte les paramètres suivants (tous optionnels) :
- `category` (par défaut `TrustMedia`)
- `subCategory` (slug de rubrique Trust Media)
- `searchTerm`
- `sort` (`recent`, `asc`, `popular`, `relevance`)
- `dateRange` (`any`, `24h`, `7d`, `30d`, `1y`)
- `tags` (séparés par des virgules)
- `startIndex`, `limit` (pagination)

Endpoints utilisés :
- Home Trust Media : `GET /api/posts?category=TrustMedia&order=desc&limit=...`
- Trust Event : `GET /api/posts?category=TrustEvent&order=desc&limit=...`
- Trust Production : `GET /api/posts?category=TrustProduction&order=desc&limit=...`
