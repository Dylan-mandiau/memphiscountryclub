# deploi-rules.md — Memphis Country Club

Règles et procédure de déploiement de **new.memphiscountryclub.fr** sur **o2switch** (hébergement mutualisé cPanel + CloudLinux NodeJS Selector + Passenger).

> ⚠️ Ce fichier est canonique. Toute modification d'infra (chemins, env vars, base de données, scripts) **doit être répercutée ici en même temps que le code**.

---

## 1. Environnement cible

| Élément | Valeur |
|---|---|
| Domaine | `new.memphiscountryclub.fr` |
| Hébergeur | o2switch (mutualisé cPanel) |
| Runtime | Node.js 22.x LTS (ou 20.x si 22 indisponible — éviter 24.x : versions impaires non-LTS) |
| Process manager | Phusion Passenger (via NodeJS Selector cPanel) |
| Base de données | **SQLite** (fichier `memphis.db` dans l'application root — pas de BDD cPanel à créer) |
| User cPanel | `ufaj3133` |
| Chemins typiques | `/home/ufaj3133/new.memphiscountryclub.fr/` |

> 📌 **Pourquoi SQLite et non PostgreSQL ?** o2switch ne propose que PostgreSQL 9.6 (EOL depuis 2021) et envisage de retirer le support PG. MariaDB n'a pas d'adapter Payload 3 officiel. SQLite (officiellement supporté par Payload, file-based) est l'option idéale pour ce volume d'usage.

---

## 2. Pré-requis côté o2switch

À faire **avant** le premier déploiement, dans cPanel :

1. **Sous-domaine** créé et pointé sur un dossier dédié (ex. `/home/ufaj3133/new.memphiscountryclub.fr`).
2. **Pas de BDD à créer dans cPanel** — SQLite est un fichier local créé automatiquement par Payload au 1er démarrage. Si tu as déjà créé une BDD PostgreSQL ou MariaDB pour ce projet, tu peux la **supprimer** (elle ne sert plus).
3. **SSL** : activer Let's Encrypt sur le sous-domaine via *SSL/TLS Status* → AutoSSL.
4. **Accès SSH** activé (Sécurité → SSH).

---

## 3. Variables d'environnement obligatoires

À renseigner dans le **NodeJS Selector → Environment variables** (PAS dans un `.env` versionné). En cas de doublon, le NodeJS Selector gagne.

| Variable | Valeur exemple | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Géré aussi par « Application mode = Production » |
| `DATABASE_URI` | `file:./memphis.db` | Chemin **relatif à l'application root**. Le fichier est créé automatiquement par Payload au 1er démarrage. |
| `PAYLOAD_SECRET` | (96 hex aléatoires) | Générer avec `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`. **Ne jamais réutiliser** entre dev et prod. |
| `PAYLOAD_PUSH` | `true` au premier déploiement, puis `false` | **Crée automatiquement le schéma au démarrage**. À désactiver une fois les tables créées (passage en mode migration explicite). |
| `NEXT_PUBLIC_SERVER_URL` | `https://new.memphiscountryclub.fr` | Public — utilisé par metadataBase |
| `PAYLOAD_PUBLIC_SERVER_URL` | `https://new.memphiscountryclub.fr` | Optionnel — admin URL |

**Règle stricte** : aucun secret ne doit apparaître dans le repo Git. Si une variable est ajoutée ici, mettre à jour aussi `.env.example`.

---

## 4. Premier déploiement — pas à pas

### 4.1 Upload du code

Option A — via Git (recommandé) :

```bash
# En SSH sur o2switch
cd ~/new.memphiscountryclub.fr
git clone https://github.com/USER/memphiscountryclub.git .
```

Option B — via FTP/SFTP : zipper localement, uploader, dézipper sur le serveur.
**Ne JAMAIS uploader** `node_modules/`, `.next/`, ni `.env.local`.

### 4.2 Création de l'application Node.js (cPanel)

Dans cPanel → *Setup Node.js App* → **CREATE APPLICATION** :

| Champ | Valeur |
|---|---|
| **Node.js version** | 22.x (ou 20.x) |
| **Application mode** | Production |
| **Application root** | `new.memphiscountryclub.fr` (relatif à `/home/ufaj3133`) |
| **Application URL** | choisir le sous-domaine `new.memphiscountryclub.fr` |
| **Application startup file** | `server.js` |

Cliquer **CREATE**. cPanel génère le virtualenv Node sous `/home/ufaj3133/nodevenv/new.memphiscountryclub.fr/<version>/`.

### 4.3 Ajout des variables d'environnement

Dans la même page → *Environment variables* → ajouter chaque ligne du §3, puis **Save**.

### 4.4 Installation des dépendances et build

Dans cPanel → *Terminal* (ou SSH) :

```bash
# Activer le virtualenv Node de l'app
source /home/ufaj3133/nodevenv/new.memphiscountryclub.fr/22/bin/activate
cd ~/new.memphiscountryclub.fr

# Install (deps + devDeps nécessaires pour le build)
npm run deploy:install

# Build production
npm run deploy:build
```

Le build doit se terminer par un récap des routes Next.js. En cas d'erreur, lire la section §8 *Troubleshooting*.

### 4.5 Migrations Payload + seed

```bash
# Toujours dans le virtualenv activé
npm run migrate
npm run seed
```

### 4.6 Démarrage / redémarrage

Dans *Setup Node.js App* → cliquer **Restart**.
Aller sur `https://new.memphiscountryclub.fr` — le site doit répondre.
Aller sur `https://new.memphiscountryclub.fr/admin` — interface Payload doit charger.

### 4.7 Création du compte Super Admin

Sur `/admin`, Payload propose un formulaire de création de premier utilisateur.
Créer **Dylan Fournier** avec le rôle `admin`. C'est le seul compte qui peut ensuite créer les autres rôles.

---

## 5. Mises à jour ultérieures

```bash
source /home/ufaj3133/nodevenv/new.memphiscountryclub.fr/22/bin/activate
cd ~/new.memphiscountryclub.fr

git pull
npm run deploy:install   # si package.json a changé
npm run deploy:build     # toujours
npm run migrate          # si nouvelles migrations Payload

# Restart via UI cPanel OU :
touch tmp/restart.txt    # Passenger redémarre au prochain hit
```

**Règle** : ne jamais éditer du code directement sur le serveur — toute modif passe par le repo Git en local puis `git pull`.

---

## 6. Structure de fichiers sur le serveur

```
/home/ufaj3133/
├── new.memphiscountryclub.fr/      ← Application Root
│   ├── server.js                    ← Startup file (Passenger)
│   ├── src/
│   ├── public/
│   ├── .next/                       ← généré par npm run build
│   ├── node_modules/                ← généré par npm install
│   ├── package.json
│   ├── .htaccess                    ← auto-géré par NodeJS Selector
│   ├── uploads/                     ← médias Payload (CDC : pas de limite)
│   └── tmp/
│       └── restart.txt              ← touch pour reload Passenger
└── nodevenv/
    └── new.memphiscountryclub.fr/
        └── 22/                      ← virtualenv Node de l'app
            ├── bin/activate
            └── ...
```

---

## 7. Règles de sécurité

1. **Aucun secret en repo** — `PAYLOAD_SECRET`, mots de passe BDD, clés API : toujours dans *Environment variables* du NodeJS Selector.
2. **Différer dev et prod** — `PAYLOAD_SECRET` prod ≠ dev (le secret signe les sessions ; le partager = compromettre les sessions admin).
3. **Backups SQLite + médias** — programmer dans cPanel → *Cron Jobs* un backup quotidien :

   ```cron
   0 3 * * * mkdir -p /home/ufaj3133/backups && sqlite3 /home/ufaj3133/new.memphiscountryclub.fr/memphis.db ".backup '/home/ufaj3133/backups/memphis-$(date +\%F).db'" && tar czf /home/ufaj3133/backups/uploads-$(date +\%F).tar.gz -C /home/ufaj3133/new.memphiscountryclub.fr uploads && find /home/ufaj3133/backups -mtime +30 -delete
   ```

   La commande `.backup` de SQLite est sûre **même pendant que l'app tourne** (snapshot atomique). On archive aussi le dossier `uploads/`. Rétention : 30 jours.

4. **HTTPS forcé** — activer la redirection HTTPS dans cPanel *Domains* après émission du certificat.
5. **Uploads sans limite** — vérifier que `LimitRequestBody 0` est dans `.htaccess` (voir `.htaccess.example`), et que `client_max_body_size` n'est pas restreint par o2switch côté reverse-proxy (à signaler au support si dépassement 100 MB pour gros fichiers vidéo).
6. **Pas d'inscription publique** — vérifier que `/admin` n'expose **aucun** endpoint d'auto-création de compte. Seul l'admin Dylan peut créer des comptes (CDC §3).

---

## 8. Troubleshooting

| Symptôme | Cause probable | Fix |
|---|---|---|
| `503 Application failed to start` | Erreur dans `server.js` ou build manquant | SSH → activer venv → consulter `stderr.log` ; relancer `npm run deploy:build` |
| `SQLITE_CANTOPEN` ou DB introuvable | Chemin `DATABASE_URI` incorrect ou permissions fichier | Vérifier que `DATABASE_URI=file:./memphis.db` (chemin relatif app root), tester avec `sqlite3 memphis.db ".tables"` |
| Erreur disque plein | Trop de médias uploadés | Vérifier l'espace disque cPanel, archiver/déplacer les vieux uploads |
| `missing secret key` | `PAYLOAD_SECRET` absent | Ajouter dans Environment variables + Restart |
| Images 404 | `public/` mal uploadé OU `next.config.mjs` remotePatterns manquant | Vérifier que le dossier `public/icons/` existe, ajouter le domaine au config |
| Upload bloqué > 50 MB | `LimitRequestBody` ou reverse proxy o2switch | Vérifier `.htaccess`, contacter le support si problème reste |
| Build OOM (out of memory) | npm build dépasse la RAM mutualisée | Build localement, uploader `.next/` ou splitter en sous-builds |
| Page blanche mais 200 OK | JS bundle introuvable | Vérifier que `.next/static/` est sur le serveur |
| Admin Payload 500 | Migrations non appliquées | `npm run migrate` |
| Sessions perdues au déploiement | `PAYLOAD_SECRET` changé entre 2 déploiements | Ne jamais changer le secret en prod sauf compromission |

---

## 9. Notes SQLite — bonnes pratiques

**Mode WAL (Write-Ahead Logging)** — Payload + libsql active automatiquement le mode WAL au démarrage. Cela permet aux lectures de continuer pendant les écritures (utile quand un admin édite et qu'un visiteur consulte). Les fichiers annexes `memphis.db-wal` et `memphis.db-shm` apparaissent à côté du `.db` principal — c'est normal, ne pas les supprimer manuellement.

**Concurrence d'écriture** — SQLite sérialise les écritures (1 writer à la fois). Avec 4 rôles éditeurs max et un usage typique d'asso (quelques écritures par jour), aucune contention attendue. Si un jour le site grossit à plusieurs dizaines de rédacteurs simultanés, on migrera vers PostgreSQL externe (Supabase, Neon).

**Migration future SQLite → PostgreSQL** — possible via la Local API Payload :
1. Export en JSON de toutes les collections via un script Node
2. Switch d'adapter dans `payload.config.ts`
3. Re-import via Local API

**Sauvegarde locale rapide** :

```bash
# Sur le serveur, snapshot atomique pendant que l'app tourne
sqlite3 memphis.db ".backup memphis-backup.db"
```

**Pourquoi pas PostgreSQL (rappel)** : o2switch propose PG 9.6 (EOL 2021, incompatible Drizzle/Payload 14+) et envisage de retirer le support PG. MariaDB n'a pas d'adapter Payload 3.

---

## 10. Domaine principal `memphiscountryclub.fr` (futur cut-over)

Aujourd'hui : `memphiscountryclub.fr` pointe sur l'ancien WordPress/Divi.
Quand le nouveau site est validé sur `new.memphiscountryclub.fr` :

1. **Sauvegarder** l'ancien WordPress (DB + `wp-content/uploads/`).
2. **Migrer** le contenu manquant (articles, photos, danses) via les outils internes ou import CSV.
3. **Bascule DNS** : changer l'enregistrement A/CNAME du domaine racine vers le même dossier que `new`.
4. **Mettre à jour** dans le NodeJS Selector : *Application URL* → `memphiscountryclub.fr`.
5. **Mettre à jour** `NEXT_PUBLIC_SERVER_URL` → `https://memphiscountryclub.fr`.
6. **Redirections 301** depuis les anciennes URLs WordPress (cf. CDC §8 Migration).
7. **Renouveler** SSL pour le domaine racine.

---

## 11. Checklist pré-mise-en-prod

- [ ] Build local OK (`npm run build` sans erreur)
- [ ] Lint OK (`npm run lint`)
- [ ] Types OK (`npx tsc --noEmit`)
- [ ] Toutes les vars d'env du §3 sont renseignées dans NodeJS Selector
- [ ] `PAYLOAD_SECRET` prod différent du dev
- [ ] Migrations appliquées sur la BDD prod
- [ ] Seed niveaux/saisons/catégories exécuté
- [ ] Compte super-admin Dylan créé
- [ ] HTTPS forcé sur le sous-domaine
- [ ] Cron de backup PostgreSQL planifié
- [ ] `.htaccess` contient `LimitRequestBody 0`
- [ ] Logo final déposé dans `public/logo.svg`
- [ ] Icônes PWA déposées dans `public/icons/`
- [ ] Test upload média > 50 MB OK
- [ ] Test création de danse via l'admin OK
- [ ] Test affichage fiche danse + lecteur YouTube OK
- [ ] Test page bibliothèque avec filtres OK
- [ ] Test PWA depuis Android Chrome (Ajouter à l'écran d'accueil)

---

## 12. Règles transverses Claude

Quand Dylan demande une modif liée au déploiement :

1. **Toujours mettre à jour** ce fichier en même temps que le code.
2. **Ne jamais committer** un fichier `.env.local` ou un secret.
3. **Avant un changement de DB adapter**, valider avec Dylan (les migrations existantes deviennent incompatibles).
4. **Toute nouvelle variable d'env** → ajouter dans `.env.example` + dans le §3 ici.
5. **Toute nouvelle dépendance native** (sharp, bcrypt, pg) → vérifier qu'elle compile sur Node Linux d'o2switch.
6. **Aucune écriture en dehors de l'application root** — toujours utiliser des chemins relatifs.

---

*Dernière mise à jour : 2026-05-21 — voir l'historique git pour les évolutions.*
