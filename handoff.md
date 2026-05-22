# HANDOFF — Memphis Country Club

> Mis à jour : 2026-05-22 (matinée — fix redirect admin)
> Session : Mise en ligne + audit + slug + Lexical + fix behind-proxy
> Auteur : Dylan FOURNIER

---

## 1. Contexte du projet

**Objectif global :**
Site vitrine + WebApp PWA pour l'association de danse country Memphis Country Club (Villeneuve-d'Ascq). Remplace l'ancien WordPress/Divi `memphiscountryclub.fr`.

**Stade actuel :**
🟢 **Site en ligne** sur `https://new.memphiscountryclub.fr` (pages publiques fonctionnelles).
🔴 **Admin Payload bloquée** : `ERR_TOO_MANY_REDIRECTS` au submit du formulaire → impossible de créer/sauver quoi que ce soit dans l'admin (cf. §5 bloquant prioritaire).
🟡 Slug auto-fill + Upload/Relation dans Lexical : code poussé (commit `30d29b1`) mais pas testable tant que l'admin redirige en boucle.

**Stack / Outils impliqués :**
Next.js 15.4 + Payload CMS 3.84 (intégré natif) + **SQLite** (file-based, `memphis.db`) + React 19 + Tailwind 3 + TypeScript strict + Fraunces/Inter (Google Fonts).
Hébergement : o2switch (cPanel + CloudLinux NodeJS Selector + Phusion Passenger, Node.js 22.x).

> 📌 BDD : SQLite choisi après que o2switch ait confirmé que leur PostgreSQL est en 9.6 (EOL) et envisage d'être retiré. MariaDB n'a pas d'adapter Payload 3 officiel. La BDD PG `ufaj3133_memphis` créée à l'origine sur cPanel n'est plus utilisée — peut être supprimée.

---

## 2. Ce qui a été fait ✅

### Scaffold & code

- [x] Scaffold Next.js 15 + Payload 3 (intégration native, port unique 3000)
- [x] **Route groups frères** : `src/app/(frontend)/` (site public) + `src/app/(payload)/` (admin Payload) — résout l'erreur React #418 d'hydration
- [x] 8 collections Payload : Users, Media, Danses (max 2 vidéos, ≥ 1 requise — hook beforeChange avec originalDoc pour PATCH safe), Niveaux, Saisons, Albums, CategoriesAlbums, Articles (Lexical = équivalent Gutenberg)
- [x] 3 globals éditables par admin : Bannière (3 styles d'affichage), Contact, Horaires
- [x] Cloisonnement strict des 4 rôles via `src/access/*` — admin / gestionnaire-danses / gestionnaire-medias / redacteur
- [x] Articles : auth lecture corrigée (seuls admin/rédacteur voient drafts), delete réservé à admin
- [x] Pages publiques résilientes (`tryPayload` + `withFallbackPaginated` qui loguent au lieu de masquer) : accueil, /danses, /danses/[slug], /galerie, /galerie/[slug], /contact, /acces
- [x] Hero d'accueil éditable + galerie 6 photos membres + 3 styles d'affichage
- [x] HeroBanniere : `safeHref()` whiteliste les URLs des CTAs (anti-XSS)
- [x] Composants UI : Header (logo + menu mobile), Footer, DanseCard, AlbumCard, Badge, FiltresDanses (instantanés via query params), YouTubeEmbed (youtube-nocookie + lazy)
- [x] PWA basique : `src/app/(frontend)/manifest.ts` + `apple-icon.png` + `icon.png` (placeholders à remplacer par icônes dédiées)
- [x] Logo Memphis intégré (`public/logo.png`) dans Header
- [x] Design chaleureux : palette crème + terracotta, typo Fraunces serif pour titres, ombres tièdes, rounded-soft

### Infra / DB

- [x] **Migration adapter** : Postgres → SQLite (@payloadcms/db-sqlite v3.84.1, @libsql/client)
- [x] **Chemin DB absolu** résolu depuis l'emplacement du config (pas process.cwd) — évite mismatch Passenger
- [x] **Migration Payload initiale** générée et versionnée : `src/migrations/20260521_205128_initial.ts`
- [x] Sur o2switch : `npm run migrate` a créé toutes les tables (`memphis.db` = 434 KB)
- [x] Fail-fast si `PAYLOAD_SECRET` absent (throw au lieu de signer avec '')
- [x] Warning au boot si `PAYLOAD_PUSH=true` en production (anti-écrasement schéma)
- [x] `lib/payload.ts` : singleton + `tryPayload()` résilient. Log TOUJOURS l'erreur d'init (même en prod) — fini le poison cache
- [x] Server.js Passenger ESM compatible Next.js custom server
- [x] `next.config.mjs` : `experimental.workerThreads: false` + `cpus: 1` + `webpack.parallelism: 1` (anti-EAGAIN CloudLinux)
- [x] `deploy:install` = `npm install --include=dev --no-audit --no-fund` (tolérant aux peerDeps optionnelles Linux/Windows)
- [x] `deploy:build` = `payload generate:importmap && next build` (inclut `NEXT_TELEMETRY_DISABLED=1`)
- [x] tsconfig `allowJs: true` pour résoudre `importMap.js` généré par Payload
- [x] `.htaccess.example` (LimitRequestBody 0 = pas de limite upload, règle CDC)

### Admin Payload

- [x] **Slug auto-fill temps réel** : `src/components/admin/SlugField.tsx` (composant client), branché sur les 5 collections avec slug (Niveaux, CategoriesAlbums, Danses, Albums, Articles)
- [x] Helper partagé `src/lib/slugify.ts` (3 copies locales supprimées)
- [x] **Éditeur Lexical des Articles fixé** : `UploadFeature({ collections: { media: { fields: [] } } })` et `RelationshipFeature({ enabledCollections: ['danses', 'albums', 'articles'] })`

### Fix redirect admin (2026-05-22, en attente vérif deploy)

- [x] `payload.config.ts` : ajout `serverURL`, `csrf` whitelist, `cors` whitelist (origines = `PAYLOAD_PUBLIC_SERVER_URL` + `localhost:3000`). Sans ces 3 clés, Payload derrière TLS-terminating proxy se croit en HTTP et casse cookies/CSRF/Location.
- [x] `server.js` : helper `applyTrustProxy(req)` qui force `req.socket.encrypted = true` quand `X-Forwarded-Proto === 'https'`. Indispensable derrière Apache/Passenger pour que Next génère URLs et cookies en HTTPS.
- [x] `/api/health` : ajout d'une section `request` qui expose `host`, `x_forwarded_proto`, `x_forwarded_host`, `x_forwarded_for`, `next_url_protocol`, `next_url_origin` — permet de vérifier après deploy que Apache transmet bien le proto et que le shim a basculé Next en HTTPS.

### Sécurité & observabilité

- [x] **Audit 4 agents** terminé (typescript-reviewer, silent-failure-hunter, code-reviewer, code-explorer) — tous les P0/P1 corrigés
- [x] Endpoint `/api/health` protégé par `HEALTH_TOKEN` (retire infos sensibles cwd / chemins absolus)
- [x] Tous les `catch {}` muets remplacés par `catch(err) { console.warn(...) }` dans 7 pages
- [x] `payload-fallbacks.ts` : helper `withFallbackPaginated` qui log les erreurs au lieu de les masquer

### Git & déploiement

- [x] Repo Git local initialisé sur `main`
- [x] **Repo GitHub public** : https://github.com/Dylan-mandiau/memphiscountryclub (passé public temporairement pour le déploiement initial)
- [x] **Application Node.js créée dans cPanel** : Node 22, Production, root `new.memphiscountryclub.fr`, startup `server.js`
- [x] **Variables d'environnement** dans NodeJS Selector : NODE_ENV, DATABASE_URI=`file:./memphis.db`, PAYLOAD_SECRET, PAYLOAD_PUSH=true, NEXT_PUBLIC_SERVER_URL, PAYLOAD_PUBLIC_SERVER_URL, HEALTH_TOKEN=`debug2026`
- [x] **Code déployé sur o2switch** : git clone OK, `npm run deploy:install` OK, `npm run deploy:build` OK
- [x] **Migration appliquée** : tables créées dans `memphis.db` (434 KB)
- [x] **Site public accessible** : `https://new.memphiscountryclub.fr/` rend correctement
- [x] **Diagnostic prod** : `/api/health?token=debug2026` retourne `status: ok`

---

## 3. Ce qui N'a PAS été fait 🔲

### 🔴 BLOQUANT — Admin Payload inutilisable

- [ ] **Résoudre `ERR_TOO_MANY_REDIRECTS`** sur les écritures admin (POST `/api/niveaux`, etc.) — sans ça impossible de créer le 1er user, créer un niveau, etc. Voir §6 pour la stratégie de diagnostic.

### 🟡 À polir avant ouverture publique

- [ ] **Compte super-admin Dylan** à créer dans `/admin` (bloqué par le bug redirect)
- [ ] **Tester slug auto-fill** une fois l'admin OK (commit `30d29b1`)
- [ ] **Tester Upload + Relation dans éditeur d'Articles** (commit `30d29b1`)
- [ ] **Désactiver `PAYLOAD_PUSH=true`** dans NodeJS Selector une fois le schéma stable
- [ ] **Activer HTTPS forcé** (Let's Encrypt via cPanel SSL/TLS Status → AutoSSL si pas déjà)
- [ ] Générer **icônes PWA dédiées** (192/512/maskable) via realfavicongenerator.net
- [ ] Page **404 custom** branded (`src/app/(frontend)/not-found.tsx`)
- [ ] Pages **error.tsx + loading.tsx** Next 15 pour états gracieux
- [ ] **sitemap.xml dynamique** (`src/app/(frontend)/sitemap.ts`)
- [ ] **generateMetadata** sur fiches danse + albums + articles (SEO + OG)
- [ ] **Recherche bibliothèque insensible aux accents** (« débutant » = « debutant »)
- [ ] **Cron backup SQLite quotidien** (procédure dans deploi-rules.md §7)
- [ ] **Repasser le repo GitHub en privé** une fois la prod stable (il est public temporairement)

### 🟢 Chantiers ultérieurs (sessions dédiées)

- [ ] **Migration contenu WordPress** ← gros chantier. Inputs à collecter : export XML + screenshots structure (où sont les danses sur l'ancien WP ? articles standards ? CPT ? ACF ?). Voir §Notes libres.
- [ ] **Cut-over `memphiscountryclub.fr`** : bascule DNS de l'ancien WordPress vers le nouveau site (procédure dans deploi-rules.md §10)
- [ ] Scripts `export.ts` / `import.ts` JSON (migration entre environnements)
- [ ] Tests E2E Playwright sur parcours critiques
- [ ] **Supprimer la BDD PostgreSQL** `ufaj3133_memphis` dans cPanel (libère 7 MB, plus utilisée)

---

## 4. Dernier état technique

**Fichiers clés (état actuel) :**

```
src/payload.config.ts                         Config Payload (sqliteAdapter abs path,
                                              push opt-in, secret strict, 8 col + 3 globals)
src/lib/payload.ts                            Singleton + tryPayload() avec log prod
src/lib/payload-fallbacks.ts                  withFallbackPaginated (log au lieu de masquer)
src/lib/slugify.ts                            Helper centralisé slugify + slugFromField
src/components/admin/SlugField.tsx            Composant client auto-fill slug temps réel
src/app/(frontend)/layout.tsx                 Root layout frontend (Inter+Fraunces, Header/Footer)
src/app/(frontend)/page.tsx                   Accueil avec HeroBanniere + articles
src/app/(payload)/layout.tsx                  Layout admin Payload (serverFunction)
src/app/(payload)/admin/importMap.js          Import map généré (avec SlugField + Lexical)
src/app/api/health/route.ts                   Endpoint diag protégé par HEALTH_TOKEN
src/collections/Articles.ts                   Lexical: Upload(media)+Relation(danses,albums,articles)
src/collections/Danses.ts                     beforeChange + originalDoc pour PATCH safe
src/migrations/20260521_205128_initial.ts     Migration SQL initiale (versionnée)
server.js                                     Entry-point Passenger ESM
package.json                                  scripts deploy:*, start:passenger, generate:importmap
deploi-rules.md                               Procédure o2switch complète (canonique)
website-design.md                             Direction visuelle révisée (chaleureuse)
CLAUDE_SPECS.md                               Spec produit complet
```

**Variables d'environnement actives dans NodeJS Selector cPanel :**

```
NODE_ENV                  = production
DATABASE_URI              = file:./memphis.db
PAYLOAD_SECRET            = 02a60d09…fcfa   (96 hex)
PAYLOAD_PUSH              = true             (à passer à false plus tard)
NEXT_PUBLIC_SERVER_URL    = https://new.memphiscountryclub.fr
PAYLOAD_PUBLIC_SERVER_URL = https://new.memphiscountryclub.fr
HEALTH_TOKEN              = debug2026
```

**Sur le serveur o2switch :**

```
Path app           : /home/ufaj3133/new.memphiscountryclub.fr/
Venv node          : /home/ufaj3133/nodevenv/new.memphiscountryclub.fr/22/bin/activate
DB SQLite          : /home/ufaj3133/new.memphiscountryclub.fr/memphis.db  (~434 KB)
Migrations         : /home/ufaj3133/new.memphiscountryclub.fr/src/migrations/
Logs Passenger     : /home/ufaj3133/new.memphiscountryclub.fr/stderr.log
```

**Historique des commits récents :**

```
30d29b1 feat(admin): slug auto-fill temps réel + fix Upload/Relation dans Lexical
408a06e feat(slug): auto-génération slug sur toutes les collections + helper partagé
816f142 feat(db): migration initiale Payload générée
f00894d fix(db): chemin SQLite absolu + seed charge .env (cPanel)
d98a26e fix(seed): retrait dépendance dotenv, lecture maison de .env.local
949edf7 fix: audit complet — silent failures, sécu, validation, types
a9a412f feat(diag): endpoint /api/health pour diagnostic prod
efe76b7 fix(layout): séparation (frontend)/(payload) en route groups frères
dafbff4 fix(build): réduit la parallélisation pour éviter EAGAIN sur o2switch
b5c1575 fix(access): isAdminFieldLevel utilise FieldAccess officiel
09fcc00 fix(deploy): deploy:install passe en npm install
27ab631 fix(payload): import map généré + allowJs pour résolution
bbdc8a0 feat(db): migration de PostgreSQL vers SQLite
756bd6f Initial scaffold
```

---

## 5. Décisions ouvertes / Points bloquants ⚠️

| Sujet | Sévérité | Statut | Commentaire |
|---|---|---|---|
| **`ERR_TOO_MANY_REDIRECTS` sur POST admin** | 🔴 P0 | Fix code appliqué (2026-05-22) — en attente vérif après deploy | 3 manques identifiés et corrigés : `serverURL` Payload absent, `csrf`/`cors` whitelist absente, `X-Forwarded-Proto` non propagé par `server.js`. Si le bug persiste après deploy, le suspect résiduel est le `.htaccess` o2switch (règle Force HTTPS de cPanel) — voir §6. |
| Compte super-admin Dylan non créé | 🔴 P0 | Bloqué par `ERR_TOO_MANY_REDIRECTS` | Impossible de submit le formulaire de création du 1er user |
| Repo GitHub public | 🟡 | À repasser privé | Mis en public le temps du déploiement initial. À refermer après prod stable |
| `PAYLOAD_PUSH=true` en prod | 🟡 | À désactiver | Une fois le schéma stable. Sinon risque d'auto-modification non voulue |
| Test slug auto-fill | 🟡 | Bloqué par admin | Code poussé en commit `30d29b1`, non testable avant fix admin |
| Test Upload/Relation dans Lexical | 🟡 | Bloqué par admin | Code poussé en commit `30d29b1` |
| BDD PostgreSQL `ufaj3133_memphis` chez o2switch | 🟢 | À supprimer | Plus utilisée (passé à SQLite). Libère 7 MB |
| Migration WordPress | 🟢 | Reporté | Sessions dédiées après mise en service. Inputs à collecter : XML export + screenshots structure du WP |

---

## 6. Prochaine action immédiate 🎯

> **Étape — Vérifier que le fix behind-proxy résout `ERR_TOO_MANY_REDIRECTS`.**
>
> **Code appliqué cette session (2026-05-22)** :
> 1. `payload.config.ts` → `serverURL` + `csrf` + `cors` whitelist (origines = `PAYLOAD_PUBLIC_SERVER_URL` + `localhost:3000`)
> 2. `server.js` → shim `applyTrustProxy(req)` qui propage `X-Forwarded-Proto=https` à Next/Payload
> 3. `/api/health` → expose les headers proxy reçus pour diagnostic post-deploy
>
> **Procédure côté Dylan (à exécuter dans cet ordre)** :
>
> ```bash
> # 1. Récupérer le code à jour sur o2switch
> cd ~/new.memphiscountryclub.fr
> git pull origin main
> npm run deploy:install    # noop si rien à mettre à jour côté deps
> npm run deploy:build
> # 2. Restart app via cPanel → NodeJS Selector → bouton « Restart »
> # 3. Smoke test diag :
> curl 'https://new.memphiscountryclub.fr/api/health?token=debug2026' | jq
> #    → vérifier dans le JSON :
> #      request.x_forwarded_proto == "https"
> #      request.next_url_protocol == "https:"
> #      request.next_url_origin == "https://new.memphiscountryclub.fr"
> # 4. Tester admin :
> #    https://new.memphiscountryclub.fr/admin → créer 1er user → submit
> ```
>
> **Si le bug est résolu** : continuer avec tests slug auto-fill + Upload/Relation Lexical → puis désactiver `PAYLOAD_PUSH=true`.
>
> **Si le bug persiste** (le `.htaccess` cPanel est alors le suspect résiduel) :
> 1. Récupérer le contenu : `cat ~/new.memphiscountryclub.fr/.htaccess` et coller la sortie en session.
> 2. DevTools Chrome → Network tab → cocher « Preserve log » → refaire le submit → copier-coller la chaîne complète des requêtes (URL initiale + chaque 30x + Location header) jusqu'à voir le pattern qui boucle.
> 3. Comparer le `.htaccess` avec `.htaccess.example` du repo, et désactiver si présent le « Force HTTPS Redirect » dans cPanel → Domains → SSL/TLS Status (ou réécrire la règle pour utiliser `%{HTTP:X-Forwarded-Proto}` au lieu de `%{HTTPS}`).

---

## 7. Prompt de relance (copier-coller)

```
Contexte : Memphis Country Club — site asso de danse country (Next 15 + Payload 3 + SQLite).
Site en ligne : https://new.memphiscountryclub.fr/ (frontend OK).
Hébergement : o2switch (shared hosting cPanel + Passenger + Node 22).
Repo : https://github.com/Dylan-mandiau/memphiscountryclub (public temporairement).
Stade : Tout déployé, migrations appliquées, admin Payload accessible MAIS submit form
        → ERR_TOO_MANY_REDIRECTS sur /api/niveaux (et toute autre POST API).
Bloquant : impossible de créer le 1er user admin ni d'ajouter quoi que ce soit.
Prochaine étape : Diagnostiquer la boucle de redirection (cf. handoff §6).
                  Probable cause : trust-proxy + cookie HTTPS + serverURL Payload manquant.
Stack : Next.js 15.4.11 + Payload 3.84 + SQLite + React 19 + Tailwind 3.
Reprends à partir du handoff.md section 6.
```

---

## Notes libres

### Règles métier inviolables (CDC §10)

- Max 2 vidéos par danse / au moins 1 requise — enforced via `beforeChange` hook (PATCH safe)
- Aucune limite de taille d'upload — `client_max_body_size 0` dans `.htaccess` + pas de `limits` côté Payload
- WebApp = lecture seule — aucune route d'édition sur `/danses`, `/galerie`, etc.
- Pas d'inscription publique — `Users.access.create = isAdmin`
- 4 rôles, cloisonnement strict — vérifié dans chaque collection

### Anti-pattern visuel

Zéro texture western (bois, corde, chapeau). La chaleur vient strictement de la palette (crème + terracotta) et de la typo (Fraunces serif pour titres, Inter pour corps).

### Stratégie d'import WordPress (à faire plus tard)

3 voies possibles, dans l'ordre de préférence :
- **XML export** WordPress (Outils → Exporter → Tout le contenu) → script `scripts/import-wordpress.ts` parse le XML, downloade les médias, crée via Payload Local API
- **REST API** WordPress (`/wp-json/wp/v2/...`) si activée
- **Dump SQL** MySQL via phpMyAdmin si rien d'autre

Inputs à collecter quand on s'y mettra :
- Structure des danses sur l'ancien WP (Custom Post Type ? Articles avec catégorie ? Plugin ACF ?)
- Structure des albums (CPT ? Gallery WP standard ?)
- Liste des plugins WP actifs (donne des indices)
- 1 export XML complet pour avoir tout le contenu

### Backup à mettre en place après la mise en service

Cron quotidien dans cPanel (cf. deploi-rules.md §7) :
```
0 3 * * * mkdir -p ~/backups && sqlite3 ~/new.memphiscountryclub.fr/memphis.db ".backup '~/backups/memphis-$(date +\%F).db'" && tar czf ~/backups/uploads-$(date +\%F).tar.gz -C ~/new.memphiscountryclub.fr uploads && find ~/backups -mtime +30 -delete
```

### Cut-over domaine principal

Le domaine `memphiscountryclub.fr` reste sur l'ancien WordPress jusqu'au cut-over. Procédure dans `deploi-rules.md §10`.
