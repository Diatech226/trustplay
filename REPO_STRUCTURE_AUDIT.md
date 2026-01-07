# Repo Structure Audit — Trust Media

## État actuel (monorepo)
- `site/` (Vite/React) : `package.json`, `vite.config.js`, `index.html` OK.
- `cms/` (Vite/React) : `package.json`, `vite.config.js`, `index.html` OK.
- `backend/` (Express/Mongo) : `package.json`, `api/index.js` OK.
- Workspaces racine configurés via `package.json`.

## Problèmes détectés
1. **Proxy Vite site incorrect** : proxy défini avec une clé littérale `${API_URL}` qui ne correspond à aucun chemin `/api`.
2. **.htaccess placé à la racine** : le rewrite SPA ne doit pas être au niveau monorepo, mais dans le site statique servi par Apache.
3. **Uploads suivis par git** : fichiers `backend/uploads` et `backend/public/uploads` committés.
4. **Ignore incomplet** : `.vite/`, `uploads/` et variantes backend non ignorés.

## Corrections appliquées
- `site/vite.config.js` : proxy `/api` corrigé, lecture de `VITE_API_URL` pour éviter les imports cassés en build.
- `.htaccess` déplacé vers `site/public/.htaccess` (utile uniquement si hébergé sous Apache).
- Fichiers d'uploads retirés de git (`backend/uploads/*`, `backend/public/uploads/*`).
- `.gitignore` complété avec `.vite/` et dossiers d'uploads.
- Ajout de `DEPLOYMENT.md` et README racine pour documenter build/run séparés.

## Checklist build séparé
### Site
- [ ] `npm --workspace site run build`
- [ ] Vérifier que `VITE_API_URL` est bien défini sur Vercel

### CMS
- [ ] `npm --workspace cms run build`
- [ ] Vérifier que `VITE_API_URL` est bien défini sur Vercel

### Backend
- [ ] `npm --workspace backend run start`
- [ ] Vérifier que `.env` est présent et `DATABASE_URL`/`JWT_SECRET` sont définis

## Stratégie “shared”
- **Choix actuel** : duplication contrôlée (`site/src/lib/*` et `cms/src/lib/*`).
- Évite les imports cross-app cassés sur Vercel.
- Si un package partagé est requis plus tard : créer `packages/shared` **buildable** et importé via workspace, avec build explicite pour Vercel.

## Push séparé sur GitHub (plan concret)
### Option A — Git subtree (simple)
1. Créer un repo distant par app (`trust-media-site`, `trust-media-cms`, `trust-media-backend`).
2. Depuis la racine :
   ```bash
   git subtree push --prefix site git@github.com:ORG/trust-media-site.git main
   git subtree push --prefix cms git@github.com:ORG/trust-media-cms.git main
   git subtree push --prefix backend git@github.com:ORG/trust-media-backend.git main
   ```
3. Pour pull des changements depuis un repo :
   ```bash
   git subtree pull --prefix site git@github.com:ORG/trust-media-site.git main --squash
   ```

### Option B — git split (historique propre)
1. Utiliser `git split` (ou `git filter-repo`) pour créer des branches filtrées par dossier.
2. Pousser chaque branche filtrée vers un repo dédié.

## .htaccess (rappel)
- **Site/CMS (Apache)** : utiliser `site/public/.htaccess` (ou `cms/public/.htaccess` si besoin).
- **Backend Express** : `.htaccess` non requis (routes gérées par Node/Express). Si backend est proxifié derrière Apache, utilisez une configuration proxy côté serveur (voir `backend/README.md`).
