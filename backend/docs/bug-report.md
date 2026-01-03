# BUG_REPORT — Trust Media Auth & Users

## Résumé
- Les actions admin dans le CMS renvoyaient encore « admin connection required » malgré une session valide.
- Les formulaires Sign in / Sign up affichaient des CTA manquants ou mal placés.
- Le modèle d’autorisation mélangeait `role` et des flags admin, provoquant des réponses 403 incohérentes.

## Correctifs appliqués
- **Backend** : passage à un modèle unique `User.role` (`USER`/`ADMIN`), JWT avec `{ id, email, role }`, middleware `verifyToken` basé sur le bearer en priorité, `requireAdmin` basé sur le rôle, nouvel endpoint `PATCH /api/user/:id/role`, création admin via `POST /api/user/admin-create`, script `scripts/seed-admin.js`.
- **Frontends (site + CMS)** : client API partagé qui injecte toujours `Authorization: Bearer <token>`, gestion 401/403 cohérente, hydratation `/api/user/me` au boot, gardes admin basés sur `role`.
- **UI auth** : boutons et CTA rétablis (Sign in / Sign up), ajout d’un champ de confirmation optionnel et messages d’erreur/chargement alignés.

## Résultat attendu
- Un admin connecté accède au module Users dans le CMS et peut créer des comptes / changer les rôles.
- Un utilisateur `USER` voit un accès refusé (403) sans redirection forcée.
- Les formulaires d’auth affichent tous les CTA requis et restent alignés avec le design.
