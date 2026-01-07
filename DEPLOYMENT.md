# Deployment Guide (Trust Media)

Ce document décrit comment builder/déployer chaque application séparément, ainsi que les variables d'environnement attendues.

## Site public (`site/`)

### Build local
```bash
npm --workspace site install
npm --workspace site run build
```

### Dev local
```bash
npm --workspace site run dev
```

### Variables d'env
Créer `site/.env` si nécessaire :
- `VITE_API_URL` (ex: `http://localhost:3000`)
- `VITE_CMS_URL` (optionnel, lien vers le CMS)

### Déploiement Vercel
- Build command: `npm run build`
- Output directory: `dist`
- Le fichier SPA `.htaccess` est fourni dans `site/public/.htaccess` pour un hébergement Apache (non requis sur Vercel).

## CMS (`cms/`)

### Build local
```bash
npm --workspace cms install
npm --workspace cms run build
```

### Dev local
```bash
npm --workspace cms run dev
```

### Variables d'env
Créer `cms/.env` si nécessaire :
- `VITE_API_URL` (ex: `http://localhost:3000`)

### Déploiement Vercel
- Build command: `npm run build`
- Output directory: `dist`

## Backend (`backend/`)

### Démarrage local
```bash
npm --workspace backend install
npm --workspace backend run dev
# ou
npm --workspace backend run start
```

### Variables d'env
Créer `backend/.env` (voir `backend/.env.example`) :
- `PORT` (défaut 3000)
- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN`
- `FRONTEND_URL`
- `UPLOAD_DIR` (défaut `./uploads`)
- `API_PUBLIC_URL`

### Déploiement Render/OnRender
- Start command: `npm start`
- Les fichiers uploadés sont stockés dans `UPLOAD_DIR`.
- `.htaccess` non requis (Express gère les routes).

## Commandes workspace depuis la racine
```bash
npm run build:site
npm run build:cms
npm run build:api

npm run start:api
```

## Push séparé sur GitHub
Voir `REPO_STRUCTURE_AUDIT.md` pour la stratégie détaillée (subtree / split).
