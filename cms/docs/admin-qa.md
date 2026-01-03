# Admin QA — Trust Media CMS

## Correctifs & refonte
- Sidebar unique et collapsible avec contrôle par rôle (ADMIN/MANAGER/EDITOR/VIEWER).
- Header enrichi (recherche, notifications, switch thème) et breadcrumbs automatiques pour toutes les pages `/dashboard`.
- Layout `PageShell` + `ResourceTable` pour des listes cohérentes et réutilisables.
- Données démo injectées pour valider les écrans sans dépendance backend immédiate.

## Parcours de test recommandé
- Connexion avec un compte rôle `ADMIN`; vérifier l’accès à toutes les entrées de la sidebar.
- Activer/désactiver le thème sombre via le bouton de header et vérifier la persistance visuelle.
- Naviguer vers Articles, Pages, Médias, Événements, Campagnes, Clients, Projets, Newsletter, Formulaires et Journal d’activité : s’assurer que les tables s’affichent et que les breadcrumbs sont corrects.
- Tester la redirection des rôles restreints : changer le rôle dans l’état utilisateur et vérifier la redirection vers `/dashboard/profile`.
- Bouton déconnexion : renvoie vers `/sign-in` et nettoie l’état utilisateur.
- Intégrer vos endpoints REST (posts/pages/media/...) et vérifier que `apiClient` ajoute bien le bearer token.

## Données de démonstration
Des exemples sont disponibles dans `src/admin/config/mockData.js` pour simuler :
- Articles, Pages, Campagnes, Clients, Projets
- Événements (avec date/lieu/places)
- Formulaires, Newsletter, Logs d’activité
