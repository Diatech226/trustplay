# Plan Media System (résumé)

## Conventions
- Base URL des fichiers publics : `/uploads/<filename>` (servi par Express via `UPLOAD_DIR`).
- Upload principal : `POST /api/media/upload` (auth admin) avec champ multipart `file`.
- Modèle Mongo : `Media` (MediaAsset) avec `original` + `variants` (`thumb`, `card`, `cover`, `og`).

## Variantes
- `thumb` : 400px de large
- `card` : 800px de large
- `cover` : 1600px de large
- `og` : 1200x630 crop cover
- Format principal : WebP (AVIF optionnel non activé par défaut)

## Posts
- Nouveau champ `featuredMediaId` (ref `Media`).
- Option `populateMedia=1` pour peupler `featuredMedia`.
- Compatibilité legacy : si `featuredMediaId` absent, utiliser `post.image` (et variantes existantes).

## Décisions clés
- Conservation de `/api/uploads` pour rétro-compatibilité.
- Ajout d’un helper `ResponsiveImage` côté front pour `srcSet/sizes`.
