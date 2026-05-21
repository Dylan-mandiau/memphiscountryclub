# CLAUDE.md — Memphis Country Club

Site vitrine + WebApp mobile (PWA) pour une association de danse country.  
Stack : **Payload CMS 3** (back-office) + **Next.js 14** (frontend) + **PostgreSQL** sur VPS.

---

## Commandes

```bash
# Installer les dépendances
npm install

# Développement (Payload + Next.js en parallèle)
npm run dev

# Build production
npm run build

# Démarrer en production (via PM2)
pm2 start ecosystem.config.js

# Migrations base de données (Payload)
npm run payload migrate

# Linter
npm run lint

# Tests
npm run test
```

## Architecture

```
memphiscountryclub/
├── payload/                  # Payload CMS (port 3001)
│   ├── collections/
│   │   ├── Users.ts
│   │   ├── Danses.ts
│   │   ├── Niveaux.ts
│   │   ├── Saisons.ts
│   │   ├── Albums.ts
│   │   ├── CategoriesAlbums.ts
│   │   ├── Articles.ts
│   │   └── Media.ts
│   ├── globals/              # Zones éditables (bannière, contact, horaires)
│   └── payload.config.ts
├── app/                      # Next.js App Router (port 3000)
│   ├── page.tsx              # Accueil — derniers articles
│   ├── danses/
│   │   ├── page.tsx          # Bibliothèque (filtres niveau + année)
│   │   └── [slug]/page.tsx   # Fiche danse individuelle
│   ├── galerie/
│   │   ├── page.tsx          # Liste des albums
│   │   └── [slug]/page.tsx   # Album individuel
│   ├── contact/page.tsx
│   ├── acces/page.tsx
│   └── manifest.json         # Config PWA
├── components/
├── lib/                      # Helpers API Payload
└── public/
```

## Rôles et droits CRUD

| Rôle | Périmètre |
|------|-----------|
| `admin` (Dylan) | CRUD illimité + gestion utilisateurs + reset MDP |
| `gestionnaire-danses` | CRUD danses, niveaux, saisons |
| `gestionnaire-medias` | CRUD albums, catégories-albums, media |
| `redacteur` | CRUD articles |

Cloisonnement strict : chaque rôle ne voit que son périmètre dans l'admin Payload.

## Modèle de données — Danses

```typescript
// collections/Danses.ts
{
  titre: Text,                    // requis
  slug: Text,                     // auto-généré depuis titre
  niveau: Relationship(Niveaux),  // requis — Débutant / Intermédiaire / Démonstration
  annee_saison: Relationship(Saisons), // requis — ex: "2024-2025"
  video_demo_url: Text,           // URL YouTube — facultatif*
  video_apprentissage_url: Text,  // URL YouTube — facultatif*
  fiche_pdf: Upload(Media),       // PDF — facultatif
  description: Textarea,          // facultatif
  date_creation: Date,            // auto
}
// * Au moins une des deux vidéos est requise (validation custom)
```

## Règles métier — à respecter absolument

- **Max 2 vidéos par danse** : `video_demo_url` (démonstration) + `video_apprentissage_url` (apprentissage). Jamais plus. Ordre d'affichage : démo d'abord, apprentissage ensuite.
- **Aucune limite de taille** sur les uploads media (photos, vidéos, PDFs) — ne pas ajouter de validation de taille ni côté Payload ni côté Next.js.
- **WebApp = lecture seule** : les routes `/app` (PWA) n'exposent aucune interface de modification.
- **Pas d'inscription publique** : la création de comptes est réservée au rôle `admin`.
- **Filtres danses = instantanés** : pas de rechargement de page, utiliser des query params ou état React local.

## Page builder

Pas d'Elementor. Deux mécanismes :
1. **Globals Payload** — zones éditables sans code (bannière, intro, contact, horaires)
2. **Délégation à Claude** — Dylan décrit la modification → Claude modifie les fichiers Next.js

Après chaque modification de page, **toujours lister les fichiers touchés** dans la réponse.

## Conventions de code

- **TypeScript strict** partout — pas de `any`
- **Composants** : PascalCase, un fichier par composant dans `components/`
- **API Payload** : toujours passer par `lib/payload.ts` pour les appels côté serveur
- **Styles** : Tailwind CSS — pas de CSS-in-JS, pas de modules CSS
- **Images** : toujours utiliser `next/image` avec `sizes` défini
- **Variables d'environnement** : préfixer `NEXT_PUBLIC_` uniquement ce qui doit être exposé au client

## Environnement

```bash
# .env.local (Next.js)
NEXT_PUBLIC_PAYLOAD_URL=http://localhost:3001
PAYLOAD_SECRET=...

# .env (Payload)
DATABASE_URI=postgresql://user:pass@localhost:5432/memphis
PAYLOAD_SECRET=...
```

## Déploiement VPS

- **Nginx** : port 3000 → domaine principal, port 3001 → `/admin`
- **PM2** : gestion des processus Node
- **SSL** : Certbot / Let's Encrypt
- **Medias** : stockage local `/uploads` (option S3-compatible Cloudflare R2 si volume important)
- **BDD** : dump PostgreSQL quotidien via cron

## Saisons existantes (migration)

2017-2018 · 2018-2019 · 2019-2020 · 2021-2022 · 2022-2023 · 2023-2024 · 2024-2025 · 2025-2026  
*(2020-2021 absente — COVID)*

## Fichiers de référence

Lire ces fichiers avant toute intervention sur le projet :

| Fichier | Contenu |
|---------|---------|
| `CLAUDE_SPECS.md` | CDC fonctionnel complet — règles métier, modules, rôles détaillés, migration |
| `website-design.md` | Direction visuelle — palette, typographie, composants, règles CSS |

## Contacts projet

- **Super Admin :** Dylan Fournier — guldan1418@gmail.com
- **Association :** memphiscountryclub59650@gmail.com — 07 69 21 08 91
