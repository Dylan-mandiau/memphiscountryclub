# Memphis Country Club

Site vitrine + WebApp PWA pour l'association de danse country de Villeneuve-d'Ascq.

**Stack** : Payload CMS 3 (intégré natif Next.js) + Next.js 14 + PostgreSQL.

Voir `CLAUDE.md` et `CLAUDE_SPECS.md` pour le détail métier, et `website-design.md` pour la direction visuelle.

---

## Prérequis

- Node.js 18.20+ ou 20.x (≤ 22.x)
- PostgreSQL 14+
- npm 10+

## Installation

```bash
# 1. Cloner et installer
npm install

# 2. Copier l'env et configurer DATABASE_URI + PAYLOAD_SECRET
cp .env.example .env.local
# (ouvrir .env.local et compléter les valeurs)

# 3. Créer la base PostgreSQL
createdb memphis   # ou via psql

# 4. (optionnel) Démarrer en dev
npm run dev
```

Le serveur démarre sur `http://localhost:3000` :
- `/` à `/contact` — site public
- `/admin` — back-office Payload
- `/api` — API REST Payload

## Comptes & rôles

Au premier démarrage, créer le compte super-admin Dylan via `/admin` puis assigner le rôle `admin`.

| Rôle | Périmètre |
|------|-----------|
| `admin` | Tout (Dylan) |
| `gestionnaire-danses` | Danses, niveaux, saisons |
| `gestionnaire-medias` | Albums, catégories, media |
| `redacteur` | Articles |

## Seed initial

Une fois la base prête et le serveur démarré au moins une fois (pour générer les schémas) :

```bash
npm run seed
```

Cela crée :
- 3 niveaux (Débutant, Intermédiaire, Démonstration)
- 8 saisons (2017-2018 → 2025-2026 sans 2020-2021)
- 6 catégories d'albums (BAL, AG, Démos, Foire aux Assos, Saison 2023, Saison 2024)

## Build production

```bash
npm run build
npm run start            # ou via PM2 :
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup              # autostart au boot du VPS
```

## Déploiement VPS (résumé)

1. Installer Node, PostgreSQL, Nginx, Certbot sur le VPS
2. Cloner le repo dans `/var/www/memphis`
3. `npm install --omit=dev && npm run build`
4. Copier `nginx.conf.example` vers `/etc/nginx/sites-available/memphiscountryclub.fr` et l'activer
5. `certbot --nginx -d memphiscountryclub.fr -d www.memphiscountryclub.fr`
6. `pm2 start ecosystem.config.cjs && pm2 save`
7. Configurer cron : dump PostgreSQL quotidien

## Règles métier — rappel

- **Max 2 vidéos par danse** (`video_demo_url` + `video_apprentissage_url`), au moins 1 requise.
- **Aucune limite de taille** sur les uploads (Payload + Nginx `client_max_body_size 0`).
- **WebApp = lecture seule** — la PWA mobile (`/danses` sous écran d'accueil) n'expose aucune interface de modification.
- **Pas d'inscription publique** — seul l'admin crée les comptes.

## Arborescence

```
.
├── src/
│   ├── app/                       # Routes Next.js (App Router)
│   │   ├── (payload)/             # Routes Payload (admin + API)
│   │   ├── danses/                # Bibliothèque + fiches
│   │   ├── galerie/               # Albums
│   │   ├── contact/  acces/       # Pages statiques éditables
│   │   ├── manifest.ts            # PWA
│   │   └── layout.tsx
│   ├── collections/               # 8 collections Payload
│   ├── globals/                   # 3 globals (bannière, contact, horaires)
│   ├── access/                    # Helpers rôles/permissions
│   ├── components/                # UI réutilisable
│   └── lib/                       # payload.ts, utils, youtube
├── scripts/seed.ts
├── ecosystem.config.cjs           # PM2
├── nginx.conf.example
├── CLAUDE.md / CLAUDE_SPECS.md / website-design.md
└── package.json
```

## Commandes utiles

```bash
npm run dev                    # Dev (port 3000)
npm run build && npm start     # Production
npm run lint                   # Lint
npm run generate:types         # Régénère src/payload-types.ts
npm run migrate:create -- ma_migration
npm run migrate                # Applique les migrations
npm run seed                   # Seed initial
```
