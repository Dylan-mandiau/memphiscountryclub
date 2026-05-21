# CLAUDE.md — Memphis Country Club

Fichier de contexte projet pour l'assistant IA (Claude / Cowork).  
Ce fichier décrit le projet, son architecture fonctionnelle, ses règles métier et ses conventions.  
Il doit être lu en priorité avant toute intervention sur le projet.

---

## 1. Présentation du projet

**Nom :** Memphis Country Club  
**Type :** Site internet d'une association de danse country + WebApp mobile  
**Domaine actuel :** memphiscountryclub.fr (WordPress/Divi — en cours de refonte)  
**Localisation :** Villeneuve-d'Ascq, Nord (59)  
**Contact association :** memphiscountryclub59650@gmail.com — 07 69 21 08 91  
**Adresse cours :** Salle Alfred Dequesnes, 37 Rue Jean Baptiste Bonte, 59650 Villeneuve-d'Ascq

### Objectif de la refonte
Remplacer le site WordPress/Divi (jugé trop lourd) par une solution moderne, légère, rapide et facile à administrer pour des utilisateurs peu technophiles. Le nouveau site doit conserver tout le contenu existant et ajouter une WebApp mobile (PWA) pour la playlist des danses.

---

## 2. Super Administrateur

**Nom :** Dylan Fournier  
**Rôle :** Super Administrateur — droits CRUD illimités sur l'intégralité du système.

### Droits spécifiques
- CRUD complet sur tous les modules : danses, albums, articles, pages, utilisateurs, catégories
- Créer des comptes utilisateurs et attribuer des rôles
- Réinitialiser le mot de passe de n'importe quel utilisateur
- Modifier visuellement n'importe quelle page via le page builder (type Elementor)
- Déléguer des modifications à l'assistant technique (Claude)
- Aucune page ne doit être verrouillée pour le Super Admin

---

## 3. Rôles utilisateurs et droits CRUD

Le système repose sur 4 rôles. Seul le Super Admin peut créer des comptes. Pas d'inscription publique.

| Rôle | Périmètre CRUD |
|------|----------------|
| **Super Admin** (Dylan) | Tout, sans exception |
| **Gestionnaire Danses** | CRUD sur fiches danses + catégories/niveaux/années |
| **Gestionnaire Médias** | CRUD sur albums photo/vidéo + catégories d'albums |
| **Rédacteur** | CRUD sur articles/actualités |

### Règle de cloisonnement
Chaque rôle ne voit dans son interface d'administration que son périmètre. Un rédacteur ne voit pas les danses. Un gestionnaire médias ne voit pas les articles.

---

## 4. Modules fonctionnels

### 4.1 Bibliothèque des danses

Module central du site. Chaque fiche de danse contient :

| Champ | Type | Obligatoire |
|-------|------|-------------|
| `titre` | string | ✅ |
| `niveau` | enum : `Debutant` / `Intermediaire` / `Demonstration` | ✅ |
| `annee_saison` | string, ex : `2024-2025` | ✅ |
| `video_demo_url` | URL YouTube (vidéo de démonstration) | ❌ (au moins une des deux vidéos requise) |
| `video_apprentissage_url` | URL YouTube (tutoriel pas à pas) | ❌ (au moins une des deux vidéos requise) |
| `fiche_pdf` | fichier PDF hébergé | ❌ |
| `description` | texte libre court | ❌ |
| `date_creation` | datetime auto | ✅ auto |

**Règle vidéo :** chaque fiche peut avoir jusqu'à 2 vidéos YouTube distinctes — une de démonstration, une d'apprentissage. L'affichage sur la fiche montre les deux lecteurs embarqués, dans cet ordre.

**Filtres publics :**
- Par niveau (Débutant / Intermédiaire / Tous)
- Par année de saison
- Les filtres sont combinables et instantanés (pas de rechargement)

**Catégories et années :** créables librement par le Gestionnaire Danses, sans intervention technique.

**Saisons existantes à migrer :** 2017-2018, 2018-2019, 2019-2020, 2021-2022, 2022-2023, 2023-2024, 2024-2025, 2025-2026.  
*(Note : 2020-2021 absente — période COVID)*

---

### 4.2 Galerie photo / vidéo

Albums organisés par événements.

| Champ | Type |
|-------|------|
| `titre_album` | string |
| `categorie` | string (créable librement) |
| `date_evenement` | date |
| `description` | texte libre |
| `medias` | collection de fichiers photo/vidéo |

**Catégories existantes :** BAL, Assemblée Générale, Démonstrations, Foire aux Assos, Saison 2023, Saison 2024.  
**Contrainte critique :** aucune limite de taille imposée par l'application sur les uploads (photos et vidéos). La gestion du stockage est côté hébergement.

---

### 4.3 Blog / Actualités

Articles publiés en page d'accueil.

| Champ | Type |
|-------|------|
| `titre` | string |
| `contenu` | blocs type Gutenberg |
| `image_une` | image optionnelle |
| `statut` | `brouillon` / `publié` / `programmé` |
| `date_publication` | datetime (auto ou programmée) |

**Exigence éditeur :** interface de type Gutenberg (blocs glissables). Les rédacteurs sont habitués à ce système depuis WordPress. Ne pas changer leurs repères.

---

### 4.4 Pages statiques

Deux pages à conserver à l'identique :

**Contact**
- Email : memphiscountryclub59650@gmail.com
- Téléphone : 07 69 21 08 91
- Adresse : Salle Alfred Dequesnes, 37 Rue Jean Baptiste Bonte, 59650 Villeneuve-d'Ascq

**Se rendre aux cours**
- Cours débutants : mercredi 18h30–19h45
- Cours intermédiaires : mercredi 20h00–21h15
- Bus : ligne 32, arrêt Pont du Breucq
- Métro : ligne 2 rouge → Jean Jaurès → bus → Pont du Breucq
- Tramway : arrêt Planche d'Épinoy → 100m rue Jean Baptiste Bonte

---

## 5. WebApp mobile (PWA)

Application web progressive, accessible depuis le navigateur du téléphone, installable sur l'écran d'accueil sans passer par un store.

### Accès
- Public, sans authentification
- Adresse accessible depuis n'importe quel navigateur mobile

### Fonctionnalités
- Consultation de toute la bibliothèque des danses
- Pour chaque fiche : titre, niveau, année, vidéo démo (embarquée), vidéo apprentissage (embarquée), PDF consultable
- Filtre par niveau (Débutant / Intermédiaire / Tous)
- Filtre par année de saison
- Barre de recherche par nom de danse
- Filtres instantanés, navigation en 1 tap

### Exigences UX mobile
- Interface pensée pour smartphone : boutons larges, texte lisible sans zoom
- Chargement rapide sur 3G/4G
- Vidéos YouTube lues sans quitter l'app (lecteur embarqué)
- PDF consultable directement (visionneuse intégrée, sans téléchargement forcé)
- Installable sur écran d'accueil (comportement type app native)

### Synchronisation
- La WebApp lit les mêmes données que le site
- Aucune double saisie : quand une danse est ajoutée sur le site, elle apparaît automatiquement dans la WebApp

### Hors périmètre WebApp
- Pas de galerie, pas de blog
- Pas de modification de contenu
- Pas de compte / authentification

---

## 6. Navigation du site

```
/                    → Page d'accueil (derniers articles)
/danses              → Bibliothèque des danses (filtres + liste)
/danses/:slug        → Fiche individuelle d'une danse
/galerie             → Liste des albums photo/vidéo
/galerie/:slug       → Album individuel
/contact             → Page contact
/acces               → Se rendre aux cours
```

---

## 7. Page builder

La stack retenue (Payload CMS + Next.js) ne dispose pas d'un page builder visuel type Elementor. La modification des pages fonctionne via deux mécanismes :

**Mécanisme 1 — Champs éditables dans Payload (Super Admin)**
Certaines zones de pages sont éditables directement dans l'interface d'admin Payload sans toucher au code : bannière d'accueil, texte d'introduction, informations de contact, horaires. Ces zones sont définies à la construction du site comme des "globals" Payload.

**Mécanisme 2 — Délégation à Claude (Super Admin)**
Pour toute modification plus complexe (restructuration d'une section, ajout d'un nouveau bloc, changement de mise en page), Dylan décrit le changement souhaité par message et Claude modifie directement les fichiers Next.js. Aucune page n'est verrouillée.

**Règle :** Claude doit toujours confirmer la modification effectuée avec un résumé des fichiers touchés.

---

## 8. Exigences transversales

### Performance
- Pages principales < 3 secondes sur connexion normale
- Images optimisées automatiquement à l'upload

### Responsive
- Site et WebApp 100% fonctionnels sur mobile, tablette, desktop
- Navigation à une main sur mobile

### Accessibilité utilisateur
- Interfaces d'administration en français, sans jargon technique
- Maximum 5 clics pour toute action courante (ajouter une danse, un album, un article)
- Confirmation visuelle après chaque action

### Migration
- Toutes les danses depuis 2017-2018 (centaines de fiches) à migrer
- Tous les albums photo existants à migrer
- Tous les articles à migrer
- Pages statiques à migrer à l'identique
- Redirections des anciennes URLs vers les nouvelles

---

## 9. Stack technique — Décision validée

Stack retenue : **Payload CMS + Next.js** (Option B).

### 9.1 Vue d'ensemble

```
┌─────────────────────────────────────────────────────┐
│                    VPS (Hostinger)                  │
│                                                     │
│  ┌──────────────────┐    ┌───────────────────────┐  │
│  │   Payload CMS    │    │       Next.js         │  │
│  │   (Back-office)  │◄──►│  (Site + PWA mobile)  │  │
│  │   Port 3001      │    │   Port 3000           │  │
│  └────────┬─────────┘    └───────────────────────┘  │
│           │                                         │
│  ┌────────▼─────────┐    ┌───────────────────────┐  │
│  │   PostgreSQL     │    │   Stockage médias     │  │
│  │   (Base de       │    │   (local /uploads     │  │
│  │    données)      │    │    ou S3-compatible)  │  │
│  └──────────────────┘    └───────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### 9.2 Payload CMS — Back-office

**Rôle :** Gestion de tout le contenu (danses, albums, articles, utilisateurs) et exposition d'une API REST/GraphQL consommée par Next.js.

**Pourquoi Payload :**
- Gestion des rôles et permissions au niveau champ par champ — parfait pour le cloisonnement des 4 rôles
- Interface d'administration moderne, en français, accessible sans connaissance technique
- Éditeur riche intégré (Lexical) pour les articles — rendu similaire à Gutenberg
- Open source, auto-hébergeable, aucun coût de licence
- TypeScript natif, maintenable sur le long terme

**Collections Payload à créer :**

| Collection | Description |
|-----------|-------------|
| `users` | Comptes utilisateurs + rôles |
| `danses` | Fiches chorégraphiques |
| `niveaux` | Débutant / Intermédiaire / Démonstration (créables) |
| `saisons` | Années de saison (créables librement) |
| `albums` | Albums photo/vidéo |
| `categories-albums` | Catégories d'albums (créables librement) |
| `articles` | Blog / Actualités |
| `media` | Fichiers uploadés (photos, vidéos, PDFs) |

**Accès admin :** `https://memphiscountryclub.fr/admin`

### 9.3 Next.js — Frontend + PWA

**Rôle :** Rendu du site public (pages, danses, galerie, blog) et de la WebApp mobile (PWA). Consomme l'API Payload.

**Pourquoi Next.js :**
- Rendu hybride (SSR + SSG) : pages rapides, bon SEO
- Support PWA natif via `next-pwa`
- React : composants réutilisables, maintenance simple
- Déployable sur le même VPS via PM2

**Structure des routes Next.js :**

```
app/
├── page.tsx                    → Accueil (derniers articles)
├── danses/
│   ├── page.tsx                → Bibliothèque (filtres + liste)
│   └── [slug]/page.tsx         → Fiche danse individuelle
├── galerie/
│   ├── page.tsx                → Liste des albums
│   └── [slug]/page.tsx         → Album individuel
├── contact/page.tsx            → Page contact
├── acces/page.tsx              → Se rendre aux cours
└── manifest.json               → Config PWA
```

### 9.4 Base de données — PostgreSQL

- PostgreSQL hébergé sur le même VPS
- Payload gère les migrations automatiquement
- Sauvegardes : dump quotidien via cron

### 9.5 Stockage des médias

- **Option par défaut :** stockage local sur le VPS (`/uploads`) — simple, gratuit, pas de limite imposée par l'app
- **Option évolutive :** stockage S3-compatible (ex : Cloudflare R2, ~0€ pour les premières Go) si le volume devient trop important pour le VPS
- Aucune limite de taille imposée côté application (conforme au CDC)

### 9.6 Page builder — Stratégie retenue

Pas de page builder visuel type Elementor dans cette stack. À la place, deux mécanismes complémentaires :

1. **Blocs de contenu Payload** : certaines zones de pages (bannière d'accueil, texte d'intro) sont éditables directement dans l'admin Payload via des champs structurés simples (texte, image, lien)
2. **Délégation à Claude** : pour toute modification de mise en page ou de structure, Dylan décrit le changement souhaité par message et Claude modifie directement les fichiers Next.js correspondants

**Règle :** aucun fichier de page n'est verrouillé. Claude peut modifier n'importe quelle page sur instruction de Dylan.

### 9.7 Hébergement

- **VPS :** Hostinger ou o2switch (déjà utilisés par Dylan)
- **Prérequis VPS :** Node.js 18+, PostgreSQL 14+, PM2, Nginx (reverse proxy)
- **Nginx :** redirige le port 3000 (Next.js) sur le domaine principal, et le port 3001 (Payload admin) sur `/admin`
- **SSL :** Let's Encrypt (Certbot)
- **Domaine :** memphiscountryclub.fr

### 9.8 Dépendances principales

```json
{
  "payload": "^3.x",
  "next": "^14.x",
  "react": "^18.x",
  "typescript": "^5.x",
  "next-pwa": "^5.x",
  "pg": "^8.x",
  "@payloadcms/db-postgres": "latest",
  "@payloadcms/richtext-lexical": "latest"
}
```

### 9.9 Hors périmètre (décisions séparées)

- Charte graphique et design final
- Budget et délais de réalisation
- Politique de sauvegarde détaillée
- Choix définitif du fournisseur de stockage médias (local vs S3)

---

## 10. Conventions pour Claude

Quand Dylan demande une modification sur ce projet :

1. **Toujours vérifier** ce fichier CLAUDE.md avant d'intervenir
2. **Ne jamais inventer** de règles métier non documentées ici — demander confirmation
3. **Respect des rôles** : ne jamais donner à un rôle des droits hors de son périmètre défini en section 3
4. **Règle vidéo** : chaque fiche danse = max 2 vidéos YouTube (démo + apprentissage), jamais plus
5. **Règle upload médias** : aucune limite de taille côté application (ni dans Payload, ni dans Next.js)
6. **Page builder** : le Super Admin peut tout modifier — via les globals Payload ou via délégation à Claude
7. **WebApp = lecture seule** : la WebApp (PWA Next.js) n'expose jamais d'interface de modification
8. **Éditeur articles = Lexical (Payload)** : éditeur riche par blocs, équivalent fonctionnel de Gutenberg
9. **Stack fixée** : Payload CMS + Next.js + PostgreSQL sur VPS. Ne pas proposer d'alternative sauf si Dylan le demande explicitement
10. **Modifications de pages** : toujours lister les fichiers Next.js modifiés dans le résumé de la réponse

---

*Dernière mise à jour : Mai 2026 — Dylan Fournier*  
*Stack validée : Payload CMS + Next.js + PostgreSQL (Option B)*
