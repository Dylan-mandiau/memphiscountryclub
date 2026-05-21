# HANDOFF — Memphis Country Club

> Généré le : 2026-05-21
> Session : Mise en ligne sur new.memphiscountryclub.fr (o2switch)
> Auteur : Dylan FOURNIER

---

## 1. Contexte du projet

**Objectif global :**
Site vitrine + WebApp PWA pour l'association de danse country Memphis Country Club (Villeneuve-d'Ascq). Remplace l'ancien WordPress/Divi `memphiscountryclub.fr`.

**Stade actuel :**
Scaffold complet & testé en local. **Objectif immédiat : premier déploiement sur `https://new.memphiscountryclub.fr`** (o2switch, BDD PostgreSQL créée).

**Stack / Outils impliqués :**
Next.js 15.4 + Payload CMS 3 (intégré natif) + PostgreSQL + React 19 + Tailwind 3 + TypeScript strict + Fraunces/Inter (Google Fonts). Hébergement : o2switch (cPanel + CloudLinux NodeJS Selector + Phusion Passenger).

---

## 2. Ce qui a été fait ✅

- [x] Scaffold Next.js 15 + Payload 3 (intégration native, port unique 3000)
- [x] 8 collections Payload : Users, Media, Danses (validation max 2 vidéos + ≥ 1 requise), Niveaux, Saisons, Albums, CategoriesAlbums, Articles (Lexical = équivalent Gutenberg)
- [x] 3 globals éditables sans code par admin : Bannière (3 styles), Contact, Horaires
- [x] Cloisonnement strict des 4 rôles (admin / gestionnaire-danses / gestionnaire-medias / redacteur) via `src/access/*`
- [x] Pages publiques résilientes (fallback si BDD KO) : accueil, /danses, /danses/[slug], /galerie, /galerie/[slug], /contact, /acces
- [x] Hero d'accueil éditable par admin avec image membres + galerie 6 photos + 3 styles d'affichage
- [x] Composants UI : Header (logo + menu mobile), Footer, DanseCard, AlbumCard, Badge, FiltresDanses (instantanés via query params), YouTubeEmbed (youtube-nocookie + lazy), HeroBanniere
- [x] PWA : `src/app/manifest.ts` + `apple-icon.png` + `icon.png` (placeholders à remplacer par icônes dédiées)
- [x] Logo Memphis intégré (`public/logo.png`) dans Header
- [x] Design chaleureux (palette crème + terracotta, typo Fraunces serif pour titres, ombres tièdes, rounded-soft)
- [x] `lib/payload.ts` : singleton + variante `tryPayload()` avec sonde TCP PostgreSQL et filtre `unhandledRejection`
- [x] Infra production : `server.js` (entry-point Passenger ESM), `ecosystem.config.cjs` (PM2 si VPS dédié), `nginx.conf.example`, `.htaccess.example` (LimitRequestBody 0 = règle CDC)
- [x] Scripts npm : `dev`, `devsafe`, `build`, `start`, `start:passenger`, `deploy:install`, `deploy:build`, `migrate`, `migrate:create`, `seed`, `generate:types`, `lint`
- [x] Documentation déploiement : [deploi-rules.md](deploi-rules.md) — 12 sections (env, pas-à-pas, structure serveur, sécurité, troubleshooting, fallback BDD, cut-over domaine, checklist)
- [x] Direction visuelle documentée et révisée : [website-design.md](website-design.md)
- [x] Spec produit complet : [CLAUDE_SPECS.md](CLAUDE_SPECS.md)
- [x] Seed script : 3 niveaux + 8 saisons (2017-2026 sans 2020-2021) + 6 catégories d'albums
- [x] BDD PostgreSQL créée sur o2switch : `ufaj3133_memphis` (7.20 MB allocated)

---

## 3. Ce qui N'a PAS été fait 🔲

### Bloquants pour la mise en ligne
- [x] ~~**Build local de pré-validation**~~ — ✅ build OK (13 routes), types OK, lint OK
- [x] ~~**Cleanup doublon `deploy-rules.md`**~~ — ✅ supprimé (était une vieille archi en 2 apps séparées)
- [x] ~~**Activer `push` Payload pour le premier déploiement**~~ — ✅ `payload.config.ts` accepte désormais `PAYLOAD_PUSH=true` via env
- [x] ~~**Mettre à jour `.env.example` + `deploi-rules.md`**~~ — ✅ nouvelle var `PAYLOAD_PUSH` documentée
- [x] ~~**Vérifier le user PostgreSQL**~~ — ✅ confirmé : DB `ufaj3133_memphis`, user `ufaj3133_grememphis`
- [ ] **Récupérer le mot de passe** du user `ufaj3133_grememphis` pour construire `DATABASE_URI`  ← **action Dylan**
- [x] ~~**Repo Git local initialisé**~~ — ✅ branche `main`, commit initial `756bd6f` (72 fichiers, 0 secret leaké)
- [ ] **Repo Git distant** (GitHub privé recommandé) pour permettre `git clone` depuis o2switch  ← **action Dylan**
- [ ] **Création de l'application Node.js dans cPanel** (formulaire NodeJS Selector)
- [ ] **Renseigner les variables d'environnement** dans NodeJS Selector
- [ ] **Install + build sur o2switch** via Terminal cPanel
- [ ] **Premier démarrage avec `PAYLOAD_PUSH=true`** → Payload crée le schéma automatiquement
- [ ] **Exécuter `npm run seed`** sur le serveur (niveaux + saisons + catégories)
- [ ] **Créer le compte super-admin Dylan** via `/admin`
- [ ] **Activer HTTPS** (Let's Encrypt via cPanel SSL/TLS Status → AutoSSL)
- [ ] **Désactiver `PAYLOAD_PUSH`** une fois le schéma stable
- [ ] **Test fumée** : navigation publique + admin + upload média

### Post-déploiement (non bloquants pour la mise en ligne)
- [ ] Générer **icônes PWA dédiées** (192/512/maskable) via realfavicongenerator.net
- [ ] Page **404 custom** (`src/app/not-found.tsx`)
- [ ] Pages **error.tsx + loading.tsx** Next 15
- [ ] **sitemap.xml dynamique** (`src/app/sitemap.ts`)
- [ ] **generateMetadata** sur fiches danse (SEO)
- [ ] **Recherche bibliothèque insensible aux accents**
- [ ] **Cron backup PostgreSQL** quotidien (cf. deploi-rules.md §7)
- [ ] **Migration contenu WordPress** (centaines de danses + albums + articles)
- [ ] **Scripts export/import JSON** (à créer si besoin)
- [ ] **Nettoyer doublon `deploy-rules.md`** (garder `deploi-rules.md`)
- [ ] Tests E2E Playwright sur parcours critiques

---

## 4. Dernier état technique

**Fichiers clés :**

```
src/payload.config.ts          — Config Payload (postgresAdapter, 8 collections, 3 globals, i18n fr)
src/lib/payload.ts             — Singleton + tryPayload() résilient avec sonde TCP
src/app/layout.tsx             — Root layout (Inter + Fraunces, Header/Footer)
src/app/page.tsx               — Accueil avec HeroBanniere + articles
src/app/(payload)/             — Routes admin & API Payload (intégration native Next.js)
src/collections/Danses.ts      — Règle métier max 2 vidéos / ≥1 requise
src/globals/Banniere.ts        — Hero éditable (tabs Contenu / Image / Galerie membres)
server.js                      — Entry-point Passenger (Next.js custom server)
package.json                   — scripts deploy:* + start:passenger
deploi-rules.md                — Procédure o2switch complète (canonique)
website-design.md              — Direction visuelle révisée (chaleureuse)
.htaccess.example              — LimitRequestBody 0 + headers sécu
scripts/seed.ts                — Seed niveaux / saisons / catégories
```

**Variables / configs importantes (à renseigner dans NodeJS Selector → Environment variables) :**

```
NODE_ENV               = production
DATABASE_URI           = postgresql://ufaj3133_grememphis:MOT_DE_PASSE@localhost:5432/ufaj3133_memphis
PAYLOAD_SECRET         = <96 hex aléatoires, généré spécifiquement pour la prod>
NEXT_PUBLIC_SERVER_URL = https://new.memphiscountryclub.fr
```

**Valeurs cPanel — création application Node.js :**

```
Node.js version           = 22.x (LTS) ou 20.x si 22 indisponible
Application mode          = Production
Application root          = new.memphiscountryclub.fr
Application URL           = new.memphiscountryclub.fr
Application startup file  = server.js
```

**Dernière modification notable :**
Vérification que `@payloadcms/db-mysql` n'existe pas → confirmation que PostgreSQL reste le choix correct. BDD `ufaj3133_memphis` créée chez o2switch.

---

## 5. Décisions ouvertes / Points bloquants ⚠️

| Sujet | Statut | Commentaire |
|---|---|---|
| ~~Typo user BDD~~ | ✅ Résolu | DB `ufaj3133_memphis`, user `ufaj3133_grememphis` |
| Mot de passe `ufaj3133_grememphis` | À fournir | Nécessaire pour construire `DATABASE_URI` |
| `PAYLOAD_SECRET` production | À générer | Doit être DIFFÉRENT de celui du dev — règle de sécurité deploi-rules.md §7 |
| Repo Git distant | À créer | GitHub privé recommandé pour `git clone` sur o2switch (alternative : upload FTP zippé) |
| Doublon `deploy-rules.md` | À nettoyer | Garder `deploi-rules.md` (français), supprimer le doublon anglais |
| Migration contenu WordPress | Reporté | Chantier post-mise-en-ligne — script dédié à écrire après que l'infra tourne |

---

## 6. Prochaine action immédiate 🎯

> **Étapes 1 & 2 — TERMINÉES ✅**
> - Étape 1 : pré-validation locale OK, `PAYLOAD_PUSH` env var ajoutée, doublon nettoyé
> - Étape 2 : repo Git local initialisé, commits `756bd6f` + `b8e90ba`
>
> **Étape 2.5 — Installation PostgreSQL local pour dev (en cours).**
>
> Choix de Dylan : **EDB Installer Windows** (PG 16).
>
> 1. Dylan télécharge et installe PG 16 depuis postgresql.org/download/windows/
> 2. Une fois installé, Claude fournit les commandes psql pour créer la DB `memphis` + user `memphis`
> 3. Test connexion + `npm run dev` doit charger l'admin sans erreur
>
> **Étape 3 — Préparation infra o2switch (en parallèle).**
>
> Concret côté Dylan :
> 1. **Mot de passe** du user `ufaj3133_grememphis` — à définir/récupérer dans cPanel mais **JAMAIS le partager à Claude** (sécurité). Dylan le copiera lui-même dans les Environment variables cPanel le moment venu.
> 2. **Créer un repo GitHub privé** `memphiscountryclub` puis me donner l'URL HTTPS — ou dire si tu préfères FTP/zip
> 3. **Vérifier dans cPanel → Sous-domaines** que `new.memphiscountryclub.fr` est bien créé et noter le **chemin du dossier racine**
> 4. **SSH activé** dans cPanel → Sécurité → SSH

---

## 7. Prompt de relance (copier-coller)

```
Contexte : Memphis Country Club — site asso de danse country (Next 15 + Payload 3 + PG).
Objectif : Première mise en ligne sur https://new.memphiscountryclub.fr (o2switch shared hosting).
Stade : Scaffold complet, BDD PostgreSQL créée chez o2switch (ufaj3133_memphis), tout est testé en local.
Ce qui est fait : code complet, design chaleureux, server.js Passenger prêt, deploi-rules.md canonique.
Ce qui reste : build de pré-validation, génération migration initiale Payload, upload sur serveur, création app cPanel, env vars, migrate + seed, compte admin, HTTPS, fumée.
Prochaine étape : Étape 1 du plan — pré-validation locale + migration initiale + cleanup.
Stack : Next.js 15.4 + Payload 3.84 + PostgreSQL + React 19 + Tailwind 3.
Reprends à partir du handoff.md section 6 et fais l'étape concrète suivante.
```

---

## Plan de déploiement — étapes

1. **Pré-validation locale** ← en cours
   - Build OK, lint OK, types OK
   - Génération migration Payload initiale
   - Cleanup fichiers doublons
2. **Préparation Git**
   - Init repo (si pas déjà fait) + commit
   - Push sur GitHub privé
3. **Côté o2switch (cPanel)**
   - Vérifier sous-domaine `new.memphiscountryclub.fr` pointe sur `/home/ufaj3133/new.memphiscountryclub.fr`
   - Activer SSH (si pas déjà)
   - Confirmer credentials BDD (typo user + mot de passe)
4. **Upload code sur serveur**
   - `git clone` via SSH
5. **Création app Node.js dans cPanel**
   - Form NodeJS Selector (valeurs section §4 du handoff)
   - Ajout variables d'environnement
6. **Install + build sur serveur**
   - `npm run deploy:install` + `npm run deploy:build`
7. **Migrations + seed**
   - `npm run migrate` + `npm run seed`
8. **Restart app + activation HTTPS**
   - Bouton Restart + AutoSSL Let's Encrypt
9. **Création compte super-admin Dylan**
   - `/admin` → premier user
10. **Tests fumée**
    - Page d'accueil, /danses, /admin, upload média test

---

## Notes libres

- **Règles métier inviolables** (CDC §10) : max 2 vidéos par danse / au moins 1 requise / aucune limite de taille upload / WebApp lecture seule / pas d'inscription publique
- **Stack figée** : Payload 3 + Next.js 15 + PostgreSQL — pas d'alternative sauf demande explicite
- **Anti-pattern visuel** : zéro texture western (bois, corde, chapeau) — la chaleur vient strictement de la palette + typo
- **Backup** : à mettre en place dès que l'admin tourne. Cron `pg_dump` quotidien retenu (deploi-rules.md §7)
- **Domaine racine `memphiscountryclub.fr`** : reste sur l'ancien WordPress jusqu'au cut-over (deploi-rules.md §10)
