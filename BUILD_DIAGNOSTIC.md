# Build Diagnostic

## trustapi-main (Express / Node)
### Erreur
- `[BOOT] Missing required env: DATABASE_URL, JWT_SECRET`

### Cause
- Variables d’environnement manquantes lors du démarrage (`trustapi-main/.env` non configuré).

### Fichier concerné
- `trustapi-main/api/index.js`

### Solution appliquée
- Documenté dans le README API (section **Common build errors**) et rappel dans le README root (Build & Production). Le serveur reste démarrable en mode dégradé.

---

## apps/cms (Vite / React)
### Erreur
- `Cannot find module @rollup/rollup-linux-x64-gnu` au lancement de Vite.

### Cause
- Dépendance optionnelle native Rollup non installée dans les workspaces (bug npm sur les optional deps).

### Fichier concerné
- `node_modules/rollup/dist/native.js`

### Solution appliquée
- Ajout explicite de `@rollup/rollup-linux-x64-gnu` dans les devDependencies root pour forcer l’installation.

### Erreur
- `Error: Failed to load native binding` (SWC) lors du chargement du plugin React SWC.

### Cause
- Dépendance optionnelle native `@swc/core-linux-x64-gnu` manquante.

### Fichier concerné
- `node_modules/@swc/core/binding.js`

### Solution appliquée
- Ajout explicite de `@swc/core` et `@swc/core-linux-x64-gnu` dans les devDependencies root pour garantir le binaire natif.

---

## apps/site (Vite / React)
### Erreur
- `Cannot find module @rollup/rollup-linux-x64-gnu` au lancement de Vite.

### Cause
- Dépendance optionnelle native Rollup non installée dans les workspaces (bug npm sur les optional deps).

### Fichier concerné
- `node_modules/rollup/dist/native.js`

### Solution appliquée
- Ajout explicite de `@rollup/rollup-linux-x64-gnu` dans les devDependencies root.

### Erreur
- `Error: Failed to load native binding` (SWC) lors du chargement du plugin React SWC.

### Cause
- Dépendance optionnelle native `@swc/core-linux-x64-gnu` manquante.

### Fichier concerné
- `node_modules/@swc/core/binding.js`

### Solution appliquée
- Ajout explicite de `@swc/core` et `@swc/core-linux-x64-gnu` dans les devDependencies root.
