# Trust Media — Site public

Application Vite/React du site public (UI existante). Elle consomme l'API Express disponible dans `backend`.

## Prérequis
- Node.js 18+

## Installation
```bash
npm install
npm run dev
```

## Configuration (.env)
Créer un fichier `.env` à la racine du projet (voir `.env.example`) :
- `VITE_API_URL` : URL de base de l'API (ex. `http://localhost:3000`).
- `VITE_CMS_URL` (optionnel) : URL du CMS pour le lien admin (ex. `http://localhost:5174`).

## Règles d'URL des images
- Les URLs absolues (`https://...`) sont utilisées telles quelles.
- Les URLs commençant par `/uploads/...` sont préfixées par l'origine de `VITE_API_URL`.
- Si aucune image n'est fournie, un placeholder est affiché (`DEFAULT_MEDIA_PLACEHOLDER`).

## Scripts
```bash
npm run dev
npm run build
npm run lint
```

## Déploiement Vercel
- Build command : `npm run build`
- Output directory : `dist`
- La SPA est configurée via `vercel.json` (rewrite vers `/index.html`).
- Pour un hébergement Apache, le rewrite SPA est fourni dans `public/.htaccess`.

## Notes
- L'UI actuelle est conservée : aucune modification visuelle n'est nécessaire pour démarrer.
- Les appels API sont centralisés dans `src/lib/apiClient.js` (core client dans `src/lib/apiClientCore.js`).

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
