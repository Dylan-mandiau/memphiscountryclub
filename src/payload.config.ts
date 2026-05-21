import { postgresAdapter } from '@payloadcms/db-postgres'
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
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
    // `push` = auto-sync du schéma au démarrage (sans migrations explicites).
    // - Par défaut : actif en dev, inactif en prod.
    // - Pour le premier déploiement sur un environnement vierge (o2switch),
    //   on active explicitement via PAYLOAD_PUSH=true le temps que Payload
    //   crée toutes les tables. À retirer ensuite et passer en mode migration.
    push:
      process.env.PAYLOAD_PUSH === 'true' ||
      process.env.NODE_ENV !== 'production',
  }),
  sharp,
  upload: {
    // PAS de limite de taille — règle métier CDC §4.2 / §10
    limits: { fileSize: undefined as unknown as number },
  },
  plugins: [],
})
