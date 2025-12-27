# BUG_REPORT — Trust Media Monorepo

## 1. Résumé exécutif
Les actions admin échouaient avec un `403 "Admin connection required"` alors que la connexion semblait valide côté CMS/site. La cause racine était un mélange de sources d'autorité (rôle vs flag admin) et un token bearer non systématiquement considéré comme vérité unique. La correction unifie l'admin sur `User.isAdmin`, synchronise `role=ADMIN`, impose le bearer en transport principal et ajoute une promotion admin contrôlée.

## 2. Bugs critiques (table)
| ID | Symptôme | Impact | Cause racine | Fix | Fichiers modifiés | Comment tester |
| --- | --- | --- | --- | --- | --- | --- |
| AUTH-CRIT | Login admin ok mais endpoints admin 403 | CMS/site inutilisables pour la gestion | Incohérence `role`/`isAdmin` entre DB/JWT + garde admin basée sur le mauvais champ | `User.isAdmin` canonique + synchronisation `role=ADMIN`, bearer unique côté clients, route de promotion admin | `trustapi-main/api/models/user.model.js`, `trustapi-main/api/utils/roles.js`, `trustapi-main/api/utils/verifyUser.js`, `trustapi-main/api/controllers/*`, `apps/cms/src/lib/apiClient.js`, `apps/site/src/components/OnlyAdminPrivateRoute.jsx` | Se connecter en admin → `/api/user/me` renvoie `isAdmin=true`; `/api/user/getusers` et `/api/media` passent en 200 |

## 3. Détails par bug
### AUTH-CRIT — Admin 403 malgré connexion
**Reproduction**
1. Se connecter au CMS avec un compte admin.
2. Appeler `/api/user/getusers` ou `/api/media`.
3. Observer un 403 `"Admin connection required"`.

**Cause racine**
- La vérité admin était déduite du rôle au lieu d'un flag canonique, ce qui casse quand `role`/JWT sont incohérents.
- Certains clients redirigeaient sur 403 au lieu de signaler un accès refusé.

**Correction**
**Correction**
- `User.isAdmin` est la source de vérité admin, synchronisée avec `role=ADMIN`.
- Le JWT expose `isAdmin` et `/api/user/me` renvoie le profil canonique.
- Le CMS redirige uniquement sur 401 (403 = accès refusé), et la route guard admin du site affiche un message.
- Ajout d'une route `PATCH /api/user/:id/promote` + support `ADMIN_EMAILS`.

**Validation**
- `GET /api/user/me` renvoie `{ isAdmin: true }` pour un admin.
- `/api/user/getusers`, `/api/media`, `/api/comment/getcomments` passent en 200 pour l'admin.
- Un non-admin reçoit toujours 403.

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
- [ ] Auth admin : `GET /api/user/me` renvoie `isAdmin=true`.
- [ ] CMS `/users` accessible et liste affichée.
- [ ] CMS Overview + Media + Comments chargent sans 403.
- [ ] `PATCH /api/user/:id/promote` fonctionne (admin only).
- [ ] Non-admin reçoit 403 sur routes admin.
