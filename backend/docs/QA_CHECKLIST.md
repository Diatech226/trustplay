# QA Checklist — Trustplay Backend

## Pré-déploiement (local)
- [ ] `npm install`
- [ ] `npm run dev`
- [ ] `GET /api/health` retourne `200` avec `success`, `uptime`, `timestamp`, `version`.
- [ ] Upload image via `/api/uploads` renvoie une URL absolue (si `API_PUBLIC_URL` défini).

## CORS
- [ ] Preflight depuis `https://www.trust-group.agency` répond avec `Access-Control-Allow-Origin`.
- [ ] Preflight depuis `https://trust-cms-git-main-christodules-projects.vercel.app` répond avec `Access-Control-Allow-Origin`.

Commandes utiles :
```bash
curl -I -X OPTIONS "https://api.trust-group.agency/api/posts" \
  -H "Origin: https://www.trust-group.agency" \
  -H "Access-Control-Request-Method: GET"

curl -I -X OPTIONS "https://api.trust-group.agency/api/posts" \
  -H "Origin: https://trust-cms-git-main-christodules-projects.vercel.app" \
  -H "Access-Control-Request-Method: GET"
```

## Post-déploiement (VPS)
- [ ] `curl https://api.trust-group.agency/api/health` retourne 200.
- [ ] `curl -I https://api.trust-group.agency/uploads/<file>` retourne 200.
- [ ] Connexion CMS : routes admin fonctionnelles (`/api/media`, `/api/posts`).
- [ ] Site public : lecture des posts/events OK, images visibles.

## Vérification Admin
- [ ] `GET /api/user/me` renvoie `role`.
- [ ] Un utilisateur défini dans `ADMIN_EMAILS` devient `ADMIN` après login.
- [ ] Script `npm run make-admin -- --email user@domain.com` fonctionne.
