# Edit Post Audit Notes

## Constat (avant correction)
- **Chargement post ("post introuvable")** : la page ne peuplait pas les médias associés, rendant la couverture parfois vide et rendant le diagnostic 404/403 moins clair.
- **Médiathèque & couverture** : sélection et upload existaient mais sans aperçu dédié ni champ de suivi clair pour la couverture/featured media.
- **Insertion média dans l’éditeur** : actions présentes mais pas intégrées dans une barre d’outils dédiée, ce qui rendait l’usage peu visible.
- **Disposition** : formulaire monolithique en une seule colonne, sans hiérarchie visuelle ni sidebar d’actions.

## Correctifs appliqués
- **API** : récupération du post avec `populateMedia=1` afin d’obtenir `featuredMedia` et fiabiliser l’aperçu couverture.
- **UI** : refonte en layout 2 colonnes (contenu à gauche, sidebar à droite) avec sections dédiées (statut, actions, media, catégorie, SEO, event).
- **Featured media** : ajout d’un bloc dédié avec preview, actions "Choisir"/"Upload"/"Retirer" et stockage `featuredMediaUrl` côté formulaire.
- **Insertion média** : ajout d’une barre d’outils explicite pour insérer depuis la médiathèque ou uploader + insérer au curseur.
- **Feedback** : ajout d’un skeleton de chargement et d’une mise à jour rapide du statut (draft/published) depuis la sidebar.
