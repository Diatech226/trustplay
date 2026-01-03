# QA Checklist — Trust Media CMS (Admin)

## Auth & session
- [ ] Connexion admin réussie via `/sign-in`.
- [ ] Retour automatique vers la page CMS d’origine (paramètre `returnTo` ou état `from`).
- [ ] Session stable : aucune redemande d’auth pendant les actions CRUD.

## Navigation & UI
- [ ] Navigation sidebar complète : chaque item ouvre une page existante.
- [ ] Topbar affiche profil + action logout.
- [ ] Breadcrumbs et titres cohérents par page.

## Posts / Articles
- [ ] Liste des posts chargée (pagination, recherche, filtres category/subCategory).
- [ ] Création d’un post avec image uploadée.
- [ ] Édition d’un post (slug, contenu, image) et sauvegarde OK.
- [ ] Suppression d’un post avec confirmation et toast.

## Media Library
- [ ] Upload image/vidéo via `/api/uploads`.
- [ ] URL retournée + preview affichée.
- [ ] Réutilisation d’un média dans l’éditeur de post.

## Commentaires
- [ ] Liste admin des commentaires (filtre + recherche).
- [ ] Création de commentaire (user/admin).
- [ ] Suppression d’un commentaire sans erreur `postId`.

## Users (admin)
- [ ] Listing utilisateurs via `/api/user/getusers`.
- [ ] Affichage des rôles / statut admin.

## Events (si module présent)
- [ ] CRUD events (date, lieu, gratuit/payant).
- [ ] Inscription event si route disponible.

## Régression
- [ ] Site public non impacté (home + page article + recherche).
