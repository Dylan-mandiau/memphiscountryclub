import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { fr } from '@payloadcms/translations/languages/fr'
import { en } from '@payloadcms/translations/languages/en'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Danses } from './collections/Danses'
import { Niveaux } from './collections/Niveaux'
import { Saisons } from './collections/Saisons'
import { Albums } from './collections/Albums'
import { CategoriesAlbums } from './collections/CategoriesAlbums'
import { Articles } from './collections/Articles'

import { Banniere } from './globals/Banniere'
import { Contact } from './globals/Contact'
import { Horaires } from './globals/Horaires'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Résout le chemin SQLite en ABSOLU.
 * - Si DATABASE_URI est déjà absolu (file:/abs/path), on garde tel quel.
 * - Si relatif (file:./memphis.db), on le résout par rapport à la racine
 *   du projet (parent de `src/`), PAS par rapport à process.cwd().
 *
 * Évite que Passenger spawn server.js avec un CWD différent et que la
 * DB soit créée ailleurs que là où le seed/tools la cherchent.
 */
const resolveDatabaseUri = (uri: string | undefined): string => {
  const fallback = 'file:' + path.resolve(dirname, '..', 'memphis.db')
  if (!uri) return fallback
  if (!uri.startsWith('file:')) return uri
  const rel = uri.slice(5).replace(/^\/\//, '')
  if (path.isAbsolute(rel)) return uri
  // Résout par rapport au parent de src/ = la racine du projet
  return 'file:' + path.resolve(dirname, '..', rel)
}

const DATABASE_URI_ABS = resolveDatabaseUri(process.env.DATABASE_URI)

// Fail-fast — sans secret, on ne démarre pas. Évite des sessions signées
// avec une chaîne vide (faille critique).
const PAYLOAD_SECRET = process.env.PAYLOAD_SECRET
if (!PAYLOAD_SECRET) {
  throw new Error(
    'PAYLOAD_SECRET env variable is required (Payload refuse de démarrer sans secret).',
  )
}

// Warning en prod si PAYLOAD_PUSH est resté à true après le premier déploiement
// — auto-sync de schéma sur une DB en production = risque de perte de données.
const PAYLOAD_PUSH = process.env.PAYLOAD_PUSH === 'true'
if (PAYLOAD_PUSH && process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line no-console
  console.warn(
    '[payload.config] PAYLOAD_PUSH=true en production. Désactiver dès que le schéma est stable.',
  )
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: {
      titleSuffix: ' — Memphis Country Club',
    },
  },
  i18n: {
    supportedLanguages: { fr, en },
    fallbackLanguage: 'fr',
  },
  collections: [
    Users,
    Media,
    Danses,
    Niveaux,
    Saisons,
    Albums,
    CategoriesAlbums,
    Articles,
  ],
  globals: [Banniere, Contact, Horaires],
  editor: lexicalEditor(),
  secret: PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: DATABASE_URI_ABS,
    },
    // `push` = auto-sync du schéma au démarrage. À désactiver en prod une
    // fois les tables créées (passage en mode migration).
    push: PAYLOAD_PUSH || process.env.NODE_ENV !== 'production',
  }),
  sharp,
  // Pas de limite de taille — règle métier CDC §4.2 / §10. On omet `upload.limits`
  // plutôt que de caster `undefined as unknown as number`.
  plugins: [],
})
