# Détails d'Implémentation - Modernisation ReneOltra

Ce document décrit en détail l'architecture, les fonctionnalités, le parcours client, l'API et les choix techniques de la nouvelle application web ReneOltra.

## 1. Architecture Globale

L'application est construite sur une architecture **Full Stack** moderne utilisant le framework **Next.js**. Elle est conçue pour être performante, SEO-friendly et facile à maintenir.

### Stack Technique
-   **Frontend & Backend Framework** : Next.js 16 (App Router)
-   **Langage** : TypeScript
-   **Base de Données** : SQLite (fichier local `dev.db` pour le développement)
-   **ORM** : Prisma v5
-   **Styling** : Tailwind CSS v4
-   **Composants UI** : React Server Components (RSC) & Client Components

### Structure du Projet (`/frontend`)
-   `app/` : Contient les routes et les pages de l'application (App Router).
    -   `api/` : **C'est ici que réside le Backend**. Next.js utilise une architecture "Serverless Functions" où chaque fichier dans ce dossier devient un endpoint API.
        -   `availability/route.ts` : Gère la logique de recherche.
        -   `booking/route.ts` : Gère la création de réservations.
        -   `supplements/route.ts` : Gère les options.
    -   `hebergements/` : Pages liées à la recherche et au détail des hébergements.
-   `components/` : Composants Réutilisables (UI, Navbar, Footer, BookingForm).
-   `lib/` : Utilitaires (ex: instance Prisma singleton).
-   `prisma/` : **Couche de Données**.
    -   `schema.prisma` : Définition des tables de la base de données.
    -   `dev.db` : Le fichier de base de données SQLite.
-   `public/` : Assets statiques (images, icônes).

> **Note sur l'Architecture Backend** :
> Contrairement aux architectures traditionnelles séparant le frontend (React) et le backend (Node/Express) dans des dossiers distincts, **Next.js unifie les deux**.
> - **L'API** se trouve dans `app/api/`.
> - **La Base de Données** est gérée via Prisma dans le dossier `prisma/`.
> - **Le Code Serveur** peut être exécuté directement dans les composants React (`Server Components`), offrant sécurité et performance sans nécessiter d'appel API explicite pour le rendu initial.
> Il est donc tout à fait normal de ne pas voir de dossier racine nommé "backend". Tout le code backend est intégré et modulaire.

## 2. Fonctionnalités

### Recherche et Disponibilité
-   Recherche d'hébergements par dates d'arrivée/départ et nombre de voyageurs.
-   Filtrage automatique des hébergements non disponibles ou dont la capacité est insuffisante.
-   Affichage des prix de base par nuit.

### Réservation
-   Tunnel de réservation complet.
-   Ajout de suppléments (Draps, Ménage, etc.).
-   Calcul dynamique du prix total (Prix séjour + Suppléments).
-   Formulaire de coordonnées client.
-   Simulation de paiement et validation de la commande.

### Gestion de Contenu
-   Pages statiques pour la présentation des services et le contact.
-   Fiches détaillées pour chaque type d'hébergement avec galerie photos.

## 3. Parcours Client (User Journey)

1.  **Accueil (`/`)** :
    -   L'utilisateur arrive sur une page d'accueil immersive ("Hero").
    -   Il sélectionne ses dates de séjour et le nombre de participants.
    -   Il clique sur "Rechercher".

2.  **Résultats de Recherche (`/hebergements`)** :
    -   L'utilisateur voit une liste des hébergements disponibles pour ses critères.
    -   Chaque carte affiche la photo, le nom, la capacité et le prix.
    -   Il sélectionne une offre en cliquant sur "Voir les détails".

3.  **Détail de l'Hébergement (`/hebergements/[id]`)** :
    -   L'utilisateur consulte les détails complets (description, équipements, photos).
    -   Il configure son séjour via le formulaire de réservation à droite.

4.  **Tunnel de Réservation (Composant `BookingForm`)** :
    -   **Étape 1 : Suppléments** : Choix des options additionnelles.
    -   **Étape 2 : Coordonnées** : Saisie du nom, prénom, email, téléphone.
    -   **Étape 3 : Paiement** : Récapitulatif du prix total et validation.

5.  **Confirmation** :
    -   Une fois validé, l'utilisateur est redirigé vers une page de confirmation (ou reçoit un message de succès) et la réservation est enregistrée en base de données.

## 4. API Backend

L'API est construite avec les **Route Handlers** de Next.js.

### Endpoints

#### `GET /api/availability`
Récupère les hébergements disponibles selon les critères.
-   **Params** : `startDate`, `endDate`, `guests`.
-   **Logique** : Exclut les hébergements ayant une réservation (`Booking`) chevauchant les dates demandées.

#### `GET /api/supplements`
Récupère la liste de tous les suppléments disponibles.
-   **Retour** : Liste d'objets `Supplement` (id, nom, prix, type).

#### `POST /api/booking`
Crée une nouvelle réservation.
-   **Body** :
    ```json
    {
      "stayId": "...",
      "startDate": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD",
      "guestDetails": { ... },
      "supplements": [ { "id": "...", "quantity": 1 } ],
      "totalPrice": 123.45
    }
    ```
-   **Logique** :
    1.  Vérifie ou crée l'utilisateur (`User`) basé sur l'email.
    2.  Crée l'entrée `Booking`.
    3.  Crée les entrées `BookingSupplement` associées.
    4.  Retourne la réservation créée.

## 5. Modèle de Données (Prisma)

Le schéma de base de données (`schema.prisma`) définit les entités suivantes :

-   **User** : Client effectuant la réservation (Email, Nom, Prénom, etc.).
-   **Stay** : Type d'hébergement (Mobil-home, Emplacement, etc.) avec capacité et prix.
-   **Supplement** : Options payantes (Draps, Ménage).
-   **Booking** : Réservation liant un `User` à un `Stay` pour une période donnée.
-   **BookingSupplement** : Table de liaison pour les suppléments choisis lors d'une réservation.

## 6. Détails Techniques & Choix

-   **Next.js App Router** : Choisi pour sa capacité à mélanger rendu serveur (SEO, performance initiale) et interactivité client (formulaires).
-   **Tailwind CSS** : Utilisé pour un développement rapide et un design cohérent et responsive. La configuration v4 a été adoptée pour sa simplicité.
-   **Prisma & SQLite** : SQLite permet un développement local sans configuration lourde de serveur SGBD. Prisma offre une sécurité de type (Type-safety) de bout en bout avec TypeScript.
-   **Gestion des Erreurs** : L'API renvoie des codes HTTP standard (400, 500) et des messages d'erreur clairs pour le débogage.
