# BUG_REPORT — Trust Media Monorepo

## 1. Résumé exécutif
L’audit a isolé deux causes racines majeures : un décalage entre le rôle en base et le rôle porté par les JWT, et une normalisation incomplète des chemins médias. Résultat : le CMS refuse l’accès admin malgré un compte admin, et les images chargées via l’API apparaissent cassées selon les formats stockés. Les corrections appliquées harmonisent la source de vérité côté auth (rôle DB) et standardisent les chemins médias en `/uploads/...` côté back et front. Un audit des variables d’environnement indique l’absence de fichiers `.env` actifs, ce qui doit être corrigé avant déploiement.

## 2. Bugs critiques (table)
| ID | Symptôme | Impact | Cause racine | Fix | Fichiers modifiés | Comment tester |
| --- | --- | --- | --- | --- | --- | --- |
| AUTH-01 | CMS > Users affiche “Accès admin requis” alors que l’admin est connecté | Blocage de la gestion des utilisateurs | JWT peut porter un rôle obsolète (USER) alors que la base est ADMIN, et le front ne normalise pas toujours les rôles | Le middleware auth recharge le rôle depuis la base et le CMS normalise `role/isAdmin` en session | `trustapi-main/api/utils/verifyUser.js`, `apps/cms/src/context/AuthContext.jsx` | Se connecter en admin → `/api/user/me` renvoie `role=ADMIN`; ouvrir `/users` dans le CMS → liste chargée |
| MEDIA-01 | Images non affichées (site + CMS) malgré upload | Contenu visuel manquant, expérience dégradée | Chemins médias stockés sous des formats hétérogènes (nom de fichier seul, `public/uploads`, `uploads/`) non résolus côté front | Normalisation stricte vers `/uploads/...` côté back + helper front robuste | `trustapi-main/api/utils/media.js`, `apps/cms/src/lib/mediaUrls.js`, `apps/site/src/lib/mediaUrls.js` | Uploader une image, vérifier `url` en DB (préfixe `/uploads/`), puis afficher Home/CMS Media Library |

## 3. Détails par bug
### AUTH-01 — CMS Users bloqué malgré admin
**Reproduction**
1. Se connecter au CMS avec un compte admin existant.
2. Aller sur `/users`.
3. Observer le message “Accès admin requis”.

**Cause racine**
- Le token JWT peut contenir un rôle obsolète (USER) qui prime sur le rôle stocké en base. Les guards backend utilisent ce rôle sans revalidation en base.
- Le CMS ne normalise pas systématiquement la casse du rôle lors de l’hydratation du profil.

**Correction**
- Le middleware `verifyToken` recharge systématiquement l’utilisateur en base et utilise `User.role` comme source de vérité.
- Le CMS normalise `role`/`isAdmin` à l’hydratation et à la connexion.

**Validation**
- `GET /api/user/me` renvoie `{ role: "ADMIN", isAdmin: true }`.
- `GET /api/admin/users` répond 200 et affiche la liste côté CMS.

### MEDIA-01 — Images cassées
**Reproduction**
1. Uploader une image via `/api/uploads`.
2. Consulter le post ou la médiathèque CMS.
3. Observer des images manquantes selon la forme du chemin stocké.

**Cause racine**
- `url` pouvait être stocké sous différentes formes (ex: `image.jpg`, `public/uploads/xxx.jpg`, `uploads/xxx.jpg`), sans conversion robuste.

**Correction**
- Normalisation backend pour convertir systématiquement vers `/uploads/...`.
- Normalisation front (CMS + site) pour résoudre les chemins relatifs/bare filenames.

**Validation**
- Les cartes Home et la Media Library affichent les images avec un URL public résolu.

## 4. Audit .env
> Statut détecté : aucun fichier `.env` actif dans le repo. S’appuyer sur les `.env.example` pour créer les valeurs.

| Variable | Attendue | Présente | Impact si manquante |
| --- | --- | --- | --- |
| `DATABASE_URL` (trustapi-main) | URI MongoDB | Non (`.env` absent) | API ne démarre pas, connexion DB impossible |
| `JWT_SECRET` (trustapi-main) | Secret JWT non vide | Non (`.env` absent) | Auth KO, tokens invalides |
| `CORS_ORIGIN` (trustapi-main) | `http://localhost:5173,http://localhost:5174` | Non (`.env` absent) | Bloque le site/CMS selon l’origine |
| `FRONTEND_URL` (trustapi-main) | `http://localhost:5173` | Non (`.env` absent) | Liens reset password erronés |
| `UPLOAD_DIR` (trustapi-main) | `./uploads` | Non (`.env` absent) | Média non servibles si mauvais chemin |
| `VITE_API_URL` (apps/site) | `http://localhost:3000` | Non (`.env` absent) | Requêtes vers API incorrectes |
| `VITE_API_URL` (apps/cms) | `http://localhost:3000` | Non (`.env` absent) | Requêtes CMS vers API incorrectes |

## 5. Checklist QA finale
- [ ] Auth admin : `GET /api/user/me` renvoie `role=ADMIN`.
- [ ] CMS `/users` accessible et liste affichée.
- [ ] Création / édition / suppression d’utilisateur en admin OK.
- [ ] Upload image → URL stockée en `/uploads/...`.
- [ ] Images visibles sur le site (Home/Post) et la Media Library CMS.
