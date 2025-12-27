# BUG_REPORT — Trust Media Monorepo

## 1. Résumé exécutif
Deux familles de bugs ont été identifiées : (1) l’accès admin parfois refusé lorsque le rôle n’est pas correctement normalisé entre JWT, DB et front CMS, et (2) l’affichage des médias (CMS + site) qui casse dès que l’API retourne des variantes ou chemins hétérogènes. Les corrections consolident l’auth (rôle canonique via `/api/user/me`, gestion 401/403 côté CMS, logs auth en dev) et la médiathèque (MediaAsset + `resolveMediaUrl` + `ResponsiveImage`).

## 2. Bugs critiques (table)
| ID | Symptôme | Impact | Cause racine | Fix | Fichiers modifiés | Comment tester |
| --- | --- | --- | --- | --- | --- | --- |
| AUTH-01 | CMS > Users affiche “Accès admin requis” alors que l’admin est connecté | Blocage de la gestion des utilisateurs | Rôle potentiellement incohérent entre JWT, base et session front | Normalisation `role/isAdmin` côté CMS + rôle canonique via `/api/user/me` | `trustapi-main/api/utils/verifyUser.js`, `apps/cms/src/context/AuthContext.jsx` | Se connecter en admin → `/api/user/me` renvoie `role=ADMIN`; ouvrir `/users` dans le CMS → liste chargée |
| AUTH-02 | `/api/media` renvoie 403 dans le CMS même connecté admin | Blocage de la médiathèque | Source de token non visible + contrôle admin strictement basé sur `role` | Journalisation auth en dev + contrôle admin basé sur `role` ou `isAdmin` + redirection 401/403 côté CMS | `trustapi-main/api/utils/verifyUser.js`, `apps/cms/src/lib/apiClient.js` | Ouvrir le CMS admin → `/api/media` passe en 200; non-admin reçoit 403 |
| MEDIA-01 | Prévisualisations cassées dans la médiathèque | Perte de visibilité des médias, UX dégradée | UI CMS utilisait des champs legacy (`thumbUrl`, `coverUrl`) alors que le modèle renvoie des variantes `variants.*` | Ajouter un resolver `resolveMediaUrlFromAsset` + mise à jour Media Library/Picker | `apps/cms/src/pages/MediaLibrary.jsx`, `apps/cms/src/components/MediaPicker.jsx`, `apps/cms/src/utils/media.js` | Ouvrir la médiathèque → thumbnails visibles |
| MEDIA-02 | Images de posts absentes sur Home/PostPage quand `featuredMedia` est utilisé | Articles sans visuels | Front site utilisait uniquement `post.image*` (legacy) | `ResponsiveImage` + `populateMedia=1` + fallback legacy | `apps/site/src/components/ResponsiveImage.jsx`, `apps/site/src/pages/Home.jsx`, `apps/site/src/pages/PostPage.jsx`, `apps/site/src/components/PostCard.jsx`, `apps/site/src/services/posts.service.js` | Home/PostPage affichent les visuels (thumb/cover) |

## 3. Détails par bug
### AUTH-01 — CMS Users bloqué malgré admin
**Reproduction**
1. Se connecter au CMS avec un compte admin.
2. Aller sur `/users`.
3. Observer un refus d’accès.

**Cause racine**
- Le rôle peut être obsolète dans le token ou mal normalisé côté front.

**Correction**
- Le backend et le CMS s’alignent sur le rôle canonique renvoyé par `/api/user/me`.

**Validation**
- `GET /api/user/me` renvoie `{ role: "ADMIN", isAdmin: true }`.
- `/users` charge la liste.

### MEDIA-01 — Prévisualisations médias cassées
**Reproduction**
1. Uploader un média.
2. Ouvrir la page Media Library.
3. Observer un thumbnail vide.

**Cause racine**
- Les anciennes URLs (thumb/cover) n’étaient plus alignées avec `variants`.

**Correction**
- Utilisation d’un helper pour résoudre `variants.*` + fallback URL.

**Validation**
- Thumbnails visibles et clic “Ouvrir” fonctionnel.

### MEDIA-02 — Images de posts absentes
**Reproduction**
1. Assigner un `featuredMediaId`.
2. Ouvrir Home ou PostPage.
3. Le visuel n’apparaît pas.

**Cause racine**
- Le front ne récupérait pas `featuredMedia` et utilisait uniquement `image` legacy.

**Correction**
- `populateMedia=1` + composant `ResponsiveImage` avec `srcSet`.

**Validation**
- Home affiche le thumb, PostPage affiche le cover.

### AUTH-02 — `/api/media` refusé malgré admin
**Reproduction**
1. Se connecter au CMS en admin.
2. Ouvrir Media Library (`/media`).
3. Observer un 403 sur `GET /api/media`.

**Cause racine**
- Contrôle `requireAdmin` dépendait uniquement de `role` (pas de fallback sur `isAdmin`).
- Manque de diagnostic sur la source du token; le CMS ne redirigeait pas sur 403.

**Correction**
- `requireAdmin` accepte `role=ADMIN` ou `isAdmin=true`.
- Ajout de logs `[AUTH]` en dev avec route, source du token, userId, rôle.
- CMS redirige vers `/login` sur 401/403.

**Validation**
- Admin: `GET /api/media` retourne 200.
- Non-admin: `GET /api/media` retourne 403.

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
- [ ] Upload image → MediaAsset créé + variants générés.
- [ ] Media Library affiche les thumbs.
- [ ] Home/PostPage affichent les images (thumb/cover).
- [ ] Legacy posts avec `image` s’affichent encore.
- [ ] `/uploads/<file>` accessible en direct.
