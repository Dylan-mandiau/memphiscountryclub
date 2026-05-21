import type { CollectionConfig, FieldHook } from 'payload'
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

const validateYoutubeUrl = (value?: string | null): true | string => {
  if (!value) return true
  const ok = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(value)
  return ok ? true : 'L’URL doit pointer vers YouTube (youtube.com ou youtu.be)'
}

/**
 * Fiches de danses — module central du site (CDC §4.1).
 *
 * Règles métier :
 * - Max 2 vidéos : video_demo_url + video_apprentissage_url. Jamais plus.
 * - Au moins UNE des deux vidéos est requise (validation au niveau collection).
 * - Ordre d'affichage : démo d'abord, apprentissage ensuite.
 */
export const Danses: CollectionConfig = {
  slug: 'danses',
  admin: {
    useAsTitle: 'titre',
    defaultColumns: ['titre', 'niveau', 'annee_saison', 'date_creation'],
    group: 'Danses',
  },
  access: {
    read: publicRead,
    create: hasRole('gestionnaire-danses'),
    update: hasRole('gestionnaire-danses'),
    delete: hasRole('gestionnaire-danses'),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        const hasDemo = Boolean(data.video_demo_url)
        const hasAppr = Boolean(data.video_apprentissage_url)
        if (!hasDemo && !hasAppr) {
          throw new Error(
            'Au moins une vidéo YouTube est requise (démo ou apprentissage).',
          )
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'titre',
      label: 'Titre de la danse',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: 'Slug (URL)',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: { beforeValidate: [generateSlug] },
      admin: {
        position: 'sidebar',
        description: 'Généré automatiquement depuis le titre.',
      },
    },
    {
      name: 'niveau',
      label: 'Niveau',
      type: 'relationship',
      relationTo: 'niveaux',
      required: true,
    },
    {
      name: 'annee_saison',
      label: 'Année de saison',
      type: 'relationship',
      relationTo: 'saisons',
      required: true,
    },
    {
      type: 'collapsible',
      label: 'Vidéos YouTube (2 max)',
      admin: {
        description:
          'Au moins UNE des deux vidéos est requise. Démo d’abord, apprentissage ensuite.',
      },
      fields: [
        {
          name: 'video_demo_url',
          label: 'Vidéo de démonstration (URL YouTube)',
          type: 'text',
          validate: validateYoutubeUrl,
        },
        {
          name: 'video_apprentissage_url',
          label: 'Vidéo d’apprentissage (URL YouTube)',
          type: 'text',
          validate: validateYoutubeUrl,
        },
      ],
    },
    {
      name: 'fiche_pdf',
      label: 'Fiche PDF',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        mimeType: { contains: 'pdf' },
      },
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
    },
    {
      name: 'date_creation',
      label: 'Date de création',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly' },
        readOnly: true,
      },
      defaultValue: () => new Date(),
    },
  ],
}
