import type { CollectionConfig } from 'payload'
import { hasRole, publicRead } from '../access/hasRole'
import { slugFromField } from '../lib/slugify'

const generateSlug = slugFromField('titre_album')

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
