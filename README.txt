SORTIR+ — VERSION 2 (prototype marketplace)
=============================================

Fichiers :
- index.html : pages Accueil, Activités, Réservation, Partenaires et Informations
- style.css : design responsive ordinateur / mobile
- script.js : catalogue de démonstration, filtres, calcul du total et commission indicative

MISE À JOUR DU SITE GITHUB
1. Ouvre le dépôt GitHub Sortir-plus.
2. Ouvre chaque fichier (index.html, style.css, script.js).
3. Choisis Edit (icône crayon), remplace tout le contenu par le fichier V2 correspondant.
4. Enregistre avec Commit changes.
5. Attends le redéploiement GitHub Pages puis actualise le site.

IMPORTANT — PAIEMENT NON ACTIVÉ
Ce projet reste une maquette front-end. Le récapitulatif calcule une commission d'exemple de 10 %, mais :
- aucun paiement n'est effectué ;
- aucune réservation n'est confirmée ou transmise ;
- aucune donnée client n'est collectée ou stockée.

GitHub Pages héberge des fichiers statiques et ne peut pas protéger des clés secrètes ni gérer seul des paiements marketplace.
Pour accepter de vrais paiements, il faudra un backend sécurisé et une solution de paiement marketplace (par exemple Stripe Connect), avec validation des partenaires, gestion des remboursements, litiges et reversements. Les clés secrètes ne doivent jamais être placées dans index.html ou script.js.

Le taux de 10 % est uniquement un exemple à discuter avec les partenaires. Les frais du prestataire de paiement, remboursements, taxes et obligations légales ne sont pas inclus dans ce calcul.
Avant toute activité commerciale ou ouverture de comptes de paiement, fais-toi accompagner par un parent/tuteur et un adulte responsable du projet.


REFERENCEMENT GOOGLE (SEO)
- index.html contient un titre, une description et des balises de partage.
- sitemap.xml indique à Google l'adresse de la page d'accueil.
- robots.txt autorise l'exploration et indique le sitemap.
Après mise en ligne, ajoute l'adresse du site dans Google Search Console, vérifie la propriété, soumets sitemap.xml puis demande l'indexation de la page d'accueil. L'indexation n'est pas garantie et peut prendre plusieurs jours ou semaines.


CORRECTION NAVIGATION
Cette version corrige le routage des liens internes : les liens Accueil, Activités, Réserver, Partenaires et Informations changent explicitement de vue. Remplacer index.html, script.js et style.css à la racine du dépôt.
