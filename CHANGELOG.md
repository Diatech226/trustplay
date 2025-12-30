# Changelog

## 2025-02-14
### Production readiness
- Standardisation des appels posts côté site (`/api/posts`).
- CORS strict en production, origins dev ajoutées par défaut, preflight stabilisé.
- Sécurité minimale : headers de sécurité de base, sanitation des inputs, rate limit sur `/api/auth`.
- Accès admin requis pour `/api/media` et `/api/media/upload`.
- Retry/backoff réseau côté client partagé.
- Documentation prod : audit, QA checklist, README mis à jour.
