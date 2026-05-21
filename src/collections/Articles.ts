import type { CollectionConfig, FieldHook } from 'payload'
import {
  lexicalEditor,
  HeadingFeature,
  FixedToolbarFeature,
  InlineToolbarFeature,
  LinkFeature,
  UploadFeature,
  BlocksFeature,
} from '@payloadcms/richtext-lexical'
import { hasRole, publicRead } from '../access/hasRole'

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const generateSlug: FieldHook = ({ data, value }) => {
  if (value) return value
  if (data?.titre) return slugify(String(data.titre))
  return value
}

/**
 * Articles / actualités — affichés sur la page d'accueil (CDC §4.3).
 *
 * Éditeur : Lexical configuré avec blocs (équivalent fonctionnel Gutenberg).
 * Statuts : brouillon / publié / programmé.
 */
export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'statut', 'date_publication'],
    group: 'Contenu',
  },
  access: {
    read: ({ req }) => {
      // Les visiteurs publics ne voient que les articles publiés
      if (req.user) return publicRead({ req } as any)
      return {
        statut: { equals: 'publie' },
        date_publication: { less_than_equal: new Date() },
      }
    },
    create: hasRole('redacteur'),
    update: hasRole('redacteur'),
    delete: hasRole('redacteur'),
  },
  fields: [
    {
      name: 'titre',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: { beforeValidate: [generateSlug] },
      admin: { position: 'sidebar' },
    },
    {
      name: 'image_une',
      label: 'Image à la une',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { contains: 'image' } },
    },
    {
      name: 'extrait',
      label: 'Extrait (chapeau)',
      type: 'textarea',
      admin: {
        description: 'Court résumé affiché sur la page d’accueil (~280 caractères).',
      },
    },
    {
      name: 'contenu',
      label: 'Contenu',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          LinkFeature({}),
          UploadFeature({}),
          BlocksFeature({ blocks: [] }),
        ],
      }),
    },
    {
      name: 'statut',
      label: 'Statut',
      type: 'select',
      required: true,
      defaultValue: 'brouillon',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Brouillon', value: 'brouillon' },
        { label: 'Publié', value: 'publie' },
        { label: 'Programmé', value: 'programme' },
      ],
    },
    {
      name: 'date_publication',
      label: 'Date de publication',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
      defaultValue: () => new Date(),
    },
  ],
}
