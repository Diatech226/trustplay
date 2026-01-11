# Troubleshooting — Trustplay Backend

## CORS errors (blocked preflight / no Access-Control-Allow-Origin)
**Symptômes** : erreurs console `CORS`, OPTIONS 403/204 sans headers.

**À vérifier** :
- `.env` contient `CORS_ORIGIN` avec les domaines exacts :
  - `https://www.trust-group.agency`
  - `https://trust-cms-git-main-christodules-projects.vercel.app`
- Redémarrer PM2 après changement : `pm2 restart trustplay-api`.

**Test rapide** :
```bash
curl -I -X OPTIONS "https://api.trust-group.agency/api/posts" \
  -H "Origin: https://www.trust-group.agency" \
  -H "Access-Control-Request-Method: GET"
```

## 502 Bad Gateway (Nginx)
**Symptômes** : Nginx renvoie 502.

**Causes possibles** :
- API non démarrée : `pm2 list`.
- Mauvais port dans Nginx (doit pointer sur `127.0.0.1:3000`).
- Crash API → consulter logs : `pm2 logs trustplay-api`.

## Images/Uploads non accessibles
**Symptômes** : images cassées, 404 sur `/uploads/...`.

**À vérifier** :
- `UPLOAD_DIR` existe et permissions OK :
  ```bash
  ls -la /var/www/trust-api/backend/uploads
  ```
- `API_PUBLIC_URL` pointe vers `https://api.trust-group.agency`.
- Nginx proxy forward bien `X-Forwarded-Proto`.

## Connexion MongoDB impossible
**Symptômes** : erreurs `MongoDB connection failed` au boot.

**À vérifier** :
- `DATABASE_URL` valide + IP VPS autorisée (Atlas Network Access).
- DNS VPS résout le cluster Mongo.

## Auth / Admin role
**Symptômes** : comptes admin non reconnus, 403 sur routes CMS.

**À vérifier** :
- `ADMIN_EMAILS` contient l’email exact (minuscule) pour auto-promotion.
- Utiliser le script : `npm run make-admin -- --email user@domain.com`.
