SORTIR+ V14 — édition immersive

Base : V13.2 complète. Installer tous les fichiers à la racine du dépôt GitHub Pages.

NOUVEAUTÉS
- Moteur de suggestions locales basé sur les activités existantes (sans API IA).
- Nouveau panneau immersif sur l’accueil, animations 3D et adaptation mobile.
- Contraste renforcé des fiches événements retournées.
- Administration GitHub existante conservée pour événements, restaurants et activités.

SÉCURITÉ
GitHub Pages est statique : aucun mot de passe privé ne doit figurer dans le dépôt.
L’administration actuelle requiert un jeton GitHub avec autorisation d’écriture, saisi uniquement lors de l’édition.
Ce n’est PAS un système de connexion privé par e-mail/mot de passe. Pour cela, ajouter un fournisseur d’authentification (ex. Supabase Auth) et une fonction serveur protégée qui publie les changements. Ne jamais exposer de clé de service dans le navigateur.

LIMITES
Suggestions basées sur le catalogue local, pas une IA générative. Aucun horaire, disponibilité ou réservation temps réel n’est garanti.
Vérifier le rendu dans le navigateur et la publication sur GitHub Pages après déploiement.
