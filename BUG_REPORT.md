# Trust Media — Bug report & fixes

## Bug #1 — CMS Users: “Accès admin requis”
**Cause racine**
- Les réponses API utilisateur ne renvoyaient pas systématiquement un indicateur `isAdmin`, et le CMS n’acceptait que `role === 'ADMIN'`. Les comptes legacy (ou tokens existants) pouvaient donc être considérés comme non admin côté UI.

**Fix appliqué**
- Ajout de `isAdmin` (dérivé du rôle) dans les réponses utilisateur (`signin`, `me`, admin users).
- Le CMS accepte `role === 'ADMIN'` **ou** `isAdmin === true` pour les écrans admin.

## Bug #2 — Images non affichées (site + CMS)
**Cause racine**
- Les URLs médias pouvaient être stockées sous différentes formes (URL absolue, `/uploads/...`, `uploads/...`), ce qui cassait la résolution selon les environnements.

**Fix appliqué**
- Normalisation backend : stockage standardisé sur `/uploads/...` pour les médias/posts.
- Résolution front renforcée : `resolveMediaUrl` nettoie la base URL, accepte des objets `{ url }`, et reconstruit correctement l’URL publique.

## Bug #3 — Audit .env
**Cause racine**
- Aucun fichier `.env`/`.env.example` n’était présent pour guider les valeurs critiques (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `UPLOAD_DIR`, `VITE_API_URL`).

**Fix appliqué**
- Ajout de `.env.example` pour `trustapi-main`, `apps/cms`, `apps/site`.
- README mis à jour avec les copies à effectuer avant le démarrage.

---

## QA checklist
- [ ] Login admin → `/api/user/me` renvoie `role=ADMIN` et `isAdmin=true`.
- [ ] CMS → Users : `GET /api/admin/users` → 200 + liste non vide.
- [ ] CMS → Users : `POST /api/admin/users` → 201.
- [ ] Site + CMS : images `post.image` & médias visibles (URLs `/uploads/...`).
