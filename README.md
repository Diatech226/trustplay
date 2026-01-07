# Trust Media (monorepo)

Monorepo pour trois applications isolées et déployables séparément :

- `site/` : site public Vite/React
- `cms/` : backoffice Vite/React
- `backend/` : API Express/MongoDB

Chaque app possède son propre `package.json` et peut être build/deploy indépendamment.

## Pré-requis
- Node.js 18+

## Scripts racine (workspaces)
```bash
npm run dev:site
npm run dev:cms
npm run dev:api
npm run dev

npm run build:site
npm run build:cms
npm run build:api

npm run start:api
```

## Déploiement & isolation
Consultez `DEPLOYMENT.md` pour les instructions détaillées (build/run séparés, variables d'env, push séparé sur GitHub).

## Structure & audit
Consultez `REPO_STRUCTURE_AUDIT.md` pour l'audit d'isolation, les corrections appliquées et la checklist build.
