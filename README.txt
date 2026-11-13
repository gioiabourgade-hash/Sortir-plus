SORTIR+ — VERSION 4 : GUIDE DES SORTIES BORDEAUX & ALENTOURS

Cette version remplace l'ancien prototype de réservation par un guide de découverte.

Navigation : Accueil, Activités, Carte, Événements, Étudiants, À découvrir.

Fonctionnalités :
- navigation entre les rubriques ;
- recherche et filtres d'activités ;
- carte interactive Leaflet avec fond OpenStreetMap ;
- liens vers les itinéraires Google Maps ;
- filtre des bons plans étudiants par catégorie.

À savoir :
- aucun système de réservation, paiement, prix ou commission n'est présent ;
- les marqueurs de la carte sont des lieux de repère initiaux à enrichir ;
- aucune réduction étudiante n'est inventée : les offres restent indiquées comme « à confirmer » tant qu'elles ne sont pas vérifiées auprès des établissements ;
- la carte nécessite une connexion internet pour charger Leaflet et les tuiles OpenStreetMap.

INSTALLATION GITHUB PAGES
1. Fais une copie de sauvegarde de tes fichiers actuels.
2. Dans le dépôt Sortir-plus, branche main, remplace index.html, style.css et script.js par ceux de cette archive.
3. Ajoute aussi sitemap.xml et robots.txt s'ils ne sont pas déjà à jour.
4. Commit changes puis attends le déploiement GitHub Pages.

La structure reste composée de sections sur une seule page : les liens utilisent les ancres #accueil, #activites, #carte, #evenements, #etudiants et #decouvrir.


VERSION 5 – MISE EN AVANT DE BORDEAUX
Le titre de la page d’accueil met maintenant BORDEAUX en grand, avec la mention visible « BORDEAUX · MÉTROPOLE · GIRONDE ». Les titres des rubriques rappellent également clairement le territoire couvert. La direction artistique minimaliste bleu nuit, beige et caramel est conservée.

ASSISTANT IA – NOTE
Une véritable IA conversationnelle pourra être ajoutée dans une prochaine étape. Comme le site est hébergé en statique sur GitHub Pages, il faudra un petit service serveur sécurisé pour appeler le modèle IA : la clé secrète ne doit jamais être placée dans les fichiers HTML ou JavaScript publics. L’assistant devra répondre à partir des fiches SORTIR+ et de sources locales vérifiées, signaler quand une information est incertaine et proposer les liens officiels.
