import type { CollectionConfig } from 'payload'
import { hasRole, publicRead } from '../access/hasRole'
import { slugFromField } from '../lib/slugify'

/**
 * Catégories d'albums photo/vidéo — créables librement par le
 * Gestionnaire Médias (CDC §4.2).
 * Catégories existantes : BAL, Assemblée Générale, Démonstrations,
 * Foire aux Assos, Saison 2023, Saison 2024.
 */
export const CategoriesAlbums: CollectionConfig = {
  slug: 'categories-albums',
  labels: {
    singular: 'Catégorie d’album',
    plural: 'Catégories d’albums',
  },
  admin: {
    useAsTitle: 'nom',
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
      name: 'nom',
      label: 'Nom de la catégorie',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: { beforeValidate: [slugFromField('nom')] },
      admin: {
        position: 'sidebar',
        description: 'Généré automatiquement depuis le nom (modifiable).',
      },
    },
  ],
}
