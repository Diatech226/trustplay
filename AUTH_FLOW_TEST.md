# Plan de test Auth (reset password)

1. **Signup**
   - Envoyer `POST /api/auth/signup` avec un email inédit et un mot de passe ≥ 8 caractères.
   - Vérifier réponse `201` avec `success: true` et création de l'utilisateur.

2. **Login**
   - Appeler `POST /api/auth/signin` avec les identifiants créés.
   - Confirmer la réception d'un `token` JWT et du profil utilisateur.

3. **Mot de passe oublié**
   - Appeler `POST /api/auth/forgot-password` avec l'email du compte.
   - Vérifier que la réponse est `200` même pour un email inconnu ; récupérer l'URL de réinitialisation (email SMTP ou `console.log`).

4. **Reset password**
   - Ouvrir l'URL de reset (`/reset-password?token=...&email=...`) et soumettre un nouveau mot de passe (≥ 8 caractères) avec confirmation.
   - Attendre la réponse `200` "Mot de passe mis à jour." et vérifier que le token JWT + user sont renvoyés.

5. **Reconnexion automatique**
   - S'assurer que le front stocke le `token`/`user` renvoyés après le reset et redirige vers l'accueil ou le dashboard.
   - Vérifier qu'un appel authentifié (`GET /api/user/me`) fonctionne avec le nouveau mot de passe.
