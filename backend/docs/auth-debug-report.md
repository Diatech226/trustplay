# Auth Debug Report

## Routes disponibles
- `POST /api/auth/signup`
- `POST /api/auth/signin`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/signout`
- `GET /api/user/me`
- `GET /api/health` (nouveau endpoint de vérification)

## Diagnostic des erreurs précédentes
- **404 reset-password** : la route est bien exposée via `/api/auth/reset-password` et montée dans `api/index.js` avec `app.use('/api/auth', authRoutes);`. Les appels front sont alignés sur ce chemin dans `src/lib/apiClient.js`, évitant les 404 liés à un mauvais endpoint.
- **500 signin** : l’appel JWT pouvait échouer silencieusement (secret manquant) et les exceptions n’étaient pas interceptées. La logique `signin` est désormais protégée par un `try/catch`, loggue les erreurs et retourne une réponse 500 stable.
- **500 forgot-password** : les exceptions non capturées pouvaient faire tomber l’endpoint. La route gère maintenant explicitement les erreurs (logs + réponse 500) et garde un 200 constant côté client même si l’email est absent ou l’envoi échoue.
- **500 reset-password** : la comparaison du token et l’écriture DB sont protégées par un `try/catch`; les expirations, tokens invalides et secrets JWT manquants sont renvoyés en 400/500 contrôlés.

## Fichiers modifiés
- `backend/api/controllers/auth.controller.js`
- `backend/api/index.js`

## Comment tester (curl)
- Vérifier l’état du serveur : `curl -i http://localhost:3000/api/health`
- Connexion : `curl -i -X POST http://localhost:3000/api/auth/signin -H 'Content-Type: application/json' -d '{"email":"user@example.com","password":"secret"}'`
- Mot de passe oublié : `curl -i -X POST http://localhost:3000/api/auth/forgot-password -H 'Content-Type: application/json' -d '{"email":"user@example.com"}'`
- Réinitialisation : `curl -i -X POST http://localhost:3000/api/auth/reset-password -H 'Content-Type: application/json' -d '{"email":"user@example.com","token":"<token>","newPassword":"newsecret"}'`
