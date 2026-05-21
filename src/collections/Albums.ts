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
  if (data?.titre_album) return slugify(String(data.titre_album))
  return value
}

/**
 * Albums photo/vidéo organisés par événements (CDC §4.2).
 * Pas de limite de taille sur les médias (voir collection Media).
 */
export const Albums: CollectionConfig = {
  slug: 'albums',
  admin: {
    useAsTitle: 'titre_album',
    defaultColumns: ['titre_album', 'categorie', 'date_evenement'],
    group: 'Galerie',
  },
  access: {
    read: publicRead,
    create: hasRole('gestionnaire-medias'),
    update: hasRole('gestionnaire-medias'),
    delete: hasRole('gestionnaire-medias'),
  },
  fields: [
    {
      name: 'titre_album',
      label: 'Titre de l’album',
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
      name: 'categorie',
      label: 'Catégorie',
      type: 'relationship',
      relationTo: 'categories-albums',
      required: true,
    },
    {
      name: 'date_evenement',
      label: 'Date de l’événement',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
    },
    {
      name: 'couverture',
      label: 'Image de couverture',
      type: 'upload',
      relationTo: 'media',
      filterOptions: { mimeType: { contains: 'image' } },
    },
    {
      name: 'medias',
      label: 'Photos et vidéos',
      type: 'array',
      admin: {
        description: 'Aucune limite de taille — uploadez librement.',
      },
      fields: [
        {
          name: 'fichier',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'legende',
          label: 'Légende',
          type: 'text',
        },
      ],
    },
  ],
}
