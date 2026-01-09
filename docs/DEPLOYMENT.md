# Deployment Guide (Trustplay)

Ce document décrit comment builder/déployer chaque application séparément, ainsi que les variables d'environnement attendues.

## Site public (`site/`)

### Build local
```bash
cd site
npm install
npm run build
```

### Dev local
```bash
cd site
npm run dev
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
cd cms
npm install
npm run build
```

### Dev local
```bash
cd cms
npm run dev
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
cd backend
npm install
npm run dev
# ou
npm run start
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

## Push séparé sur GitHub
Voir `docs/STRUCTURE_REPORT.md` pour les décisions de structure et d'isolation.
