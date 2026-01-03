# Media System

## Variantes d’images
| Variante | Largeur | Usage | Format |
| --- | --- | --- | --- |
| thumb | 400px | grilles, cards, CMS | WebP |
| card | 800px | listings & cartes larges | WebP |
| cover | 1600px | hero & pages article | WebP |
| og | 1200x630 | OpenGraph | WebP |

Les variantes sont générées avec Sharp à partir de l’original. L’OG utilise un crop `cover` pour respecter 1200x630.

## API
- `POST /api/media/upload` (admin)
  - FormData: `file`, `title`, `alt`, `caption`, `credit`, `category`, `tags`, `status`
  - Retour: `media` (avec `original` + `variants`)
- `GET /api/media` (admin) : pagination + filtres `search`, `category`, `type`, `status`, `page`, `limit`
- `GET /api/media/:id` (admin)
- `PUT /api/media/:id` (admin) : metadata
- `DELETE /api/media/:id` (admin) : supprime DB + fichiers

## Intégration posts
- `featuredMediaId` (ref Media)
- Utiliser `?populateMedia=1` pour récupérer `featuredMedia`
- Fallback legacy: `image` et anciennes variantes si `featuredMedia` absent

## Intégration front
- Utiliser le composant `ResponsiveImage` (site) pour générer `srcSet`.
- Exemples :
  - Home: `variantPreference="thumb"` + `sizes="(max-width: 768px) 100vw, 400px"`
  - PostPage: `variantPreference="cover"` + `sizes="(max-width: 768px) 100vw, 1200px"`
