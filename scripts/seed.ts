/**
 * Script de seed — crée les niveaux, saisons et catégories d'albums initiaux.
 * Exécution : npm run seed
 *
 * Pas de dépendance externe (dotenv) :
 * - En dev, charge `.env.local` manuellement.
 * - En prod (o2switch), les env vars sont déjà dans process.env via le venv.
 *
 * Robustesse :
 * - Try/catch par-item : une erreur sur un seed n'interrompt pas le reste.
 * - Vérification des env vars avant init Payload.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'

// === Chargement manuel de .env.local en dev (sans dotenv) ===
const loadEnvFile = (filename: string): void => {
  try {
    const content = readFileSync(resolve(process.cwd(), filename), 'utf-8')
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const value = trimmed
        .slice(eq + 1)
        .trim()
        .replace(/^['"]|['"]$/g, '')
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // Fichier absent — OK, les env vars viennent d'ailleurs (venv prod)
  }
}

// On charge à la fois `.env.local` (dev) et `.env` (NodeJS Selector cPanel écrit
// les env vars dans ce fichier). Les env vars déjà définies dans process.env ne
// sont JAMAIS écrasées (priorité venv > fichiers).
loadEnvFile('.env.local')
loadEnvFile('.env')

// === Vérification des env vars critiques (avec log lisible) ===
console.log('[seed] Env check :')
console.log('  NODE_ENV =', process.env.NODE_ENV || '(unset)')
console.log('  DATABASE_URI present :', Boolean(process.env.DATABASE_URI))
console.log(
  '  DATABASE_URI value (path only) :',
  process.env.DATABASE_URI?.replace(/^file:/, '') || '(unset)',
)
console.log('  PAYLOAD_SECRET present :', Boolean(process.env.PAYLOAD_SECRET))
console.log('  PAYLOAD_PUSH =', process.env.PAYLOAD_PUSH || '(unset)')
console.log('  process.cwd() =', process.cwd())

if (!process.env.PAYLOAD_SECRET) {
  console.error('\n[seed] ❌ PAYLOAD_SECRET manquant.')
  console.error('  Sur o2switch : la var doit être dans NodeJS Selector,')
  console.error('  ET un fichier .env doit exister dans l\'app root.')
  console.error('  Vérifie : ls -la .env')
  process.exit(1)
}
if (!process.env.DATABASE_URI) {
  console.error('\n[seed] ❌ DATABASE_URI manquant.')
  process.exit(1)
}

// === Données à seed ===
const niveaux = [
  { nom: 'Débutant', slug: 'debutant', ordre: 1 },
  { nom: 'Intermédiaire', slug: 'intermediaire', ordre: 2 },
  { nom: 'Démonstration', slug: 'demonstration', ordre: 3 },
]

const saisons = [
  '2017-2018',
  '2018-2019',
  '2019-2020',
  '2021-2022',
  '2022-2023',
  '2023-2024',
  '2024-2025',
  '2025-2026',
]

const categoriesAlbums = [
  'BAL',
  'Assemblée Générale',
  'Démonstrations',
  'Foire aux Assos',
  'Saison 2023',
  'Saison 2024',
]

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const tryStep = async <T>(label: string, fn: () => Promise<T>): Promise<T | null> => {
  try {
    return await fn()
  } catch (err) {
    console.error(`  ✗ ${label} — échec :`, (err as Error).message)
    return null
  }
}

const main = async (): Promise<void> => {
  console.log('→ Init Payload…')
  const payload = await getPayload({ config })
  console.log('  Payload initialisé. Push schéma en cours…')

  // === Niveaux ===
  console.log('→ Seed niveaux…')
  for (const n of niveaux) {
    await tryStep(n.nom, async () => {
      const exists = await payload.find({
        collection: 'niveaux',
        where: { slug: { equals: n.slug } },
        limit: 1,
      })
      if (exists.docs.length === 0) {
        await payload.create({ collection: 'niveaux', data: n })
        console.log('  + ' + n.nom)
      } else {
        console.log('  = ' + n.nom + ' (déjà présent)')
      }
    })
  }

  // === Saisons ===
  console.log('→ Seed saisons…')
  for (const lib of saisons) {
    await tryStep(lib, async () => {
      const exists = await payload.find({
        collection: 'saisons',
        where: { libelle: { equals: lib } },
        limit: 1,
      })
      if (exists.docs.length === 0) {
        const annee_debut = Number(lib.split('-')[0])
        await payload.create({
          collection: 'saisons',
          data: { libelle: lib, annee_debut },
        })
        console.log('  + ' + lib)
      } else {
        console.log('  = ' + lib + ' (déjà présent)')
      }
    })
  }

  // === Catégories d'albums ===
  console.log('→ Seed catégories albums…')
  for (const nom of categoriesAlbums) {
    await tryStep(nom, async () => {
      const slug = slugify(nom)
      const exists = await payload.find({
        collection: 'categories-albums',
        where: { slug: { equals: slug } },
        limit: 1,
      })
      if (exists.docs.length === 0) {
        await payload.create({
          collection: 'categories-albums',
          data: { nom, slug },
        })
        console.log('  + ' + nom)
      } else {
        console.log('  = ' + nom + ' (déjà présent)')
      }
    })
  }

  console.log('✓ Seed terminé.')
  process.exit(0)
}

main().catch((e: Error) => {
  console.error('[seed] Erreur fatale :', e.message)
  console.error(e.stack)
  process.exit(1)
})
