# QA — Media Library + Posts/Events

## Pré-requis
- API backend démarrée (`backend`)
- CMS démarré (`cms`)
- Site public démarré (`site`)
- Un compte admin (ou utilisateur authentifié si permissions ouvertes)

## Scénarios principaux

### 1) Upload Media (CMS)
1. Ouvrir **CMS → Media Library**.
2. Cliquer sur **Upload** et sélectionner une image ou vidéo.
3. Vérifier que l’item apparaît dans la grille avec un aperçu et la date.
4. Cliquer **Copy URL** et ouvrir le lien :
   - l’asset doit être public et répondre en 200.

### 2) Post: featured media + insertion contenu
1. Ouvrir **CMS → Posts → New**.
2. Dans **Image de couverture**, cliquer **Bibliothèque médias** et choisir un média.
3. Vérifier que le champ `Featured media ID` est rempli.
4. Dans l’éditeur, cliquer **Insérer un média** et sélectionner une image.
5. Sauvegarder le post, puis ouvrir la page du post côté **Site** :
   - la couverture est affichée
   - l’image insérée apparaît dans le contenu

### 3) Event: featured media + insertion contenu
1. Ouvrir **CMS → Events → New**.
2. Choisir **Featured media** depuis la bibliothèque ou uploader un fichier.
3. Dans la description, cliquer **Insérer un média** et sélectionner un asset.
4. Sauvegarder, puis ouvrir la page de l’événement côté **Site**.
5. Valider que la couverture et le contenu affichent correctement les médias.

### 4) Endpoints API media (smoke test)
- `GET /api/media?limit=5` → doit retourner `data.items` + `data.total`.
- `POST /api/media/upload` (multipart `file`) → doit retourner `data.media` avec `url` absolue.

## Cas de régression
- 401 doit rediriger vers login côté CMS.
- 403 doit afficher un message d’accès refusé.
- Les URLs `/uploads/*` doivent répondre sans CORS bloquant.
