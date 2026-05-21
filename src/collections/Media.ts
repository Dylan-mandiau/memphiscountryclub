import type { CollectionConfig } from 'payload'
import { hasRole, publicRead } from '../access/hasRole'

/**
 * Fichiers uploadés : photos, vidéos, PDFs.
 *
 * Règle métier critique (CDC §4.2 et §10) :
 * AUCUNE LIMITE DE TAILLE imposée par l'application.
 * Ne pas ajouter de validation côté Payload.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    group: 'Médiathèque',
  },
  access: {
    read: publicRead,
    create: hasRole('gestionnaire-medias', 'gestionnaire-danses', 'redacteur'),
    update: hasRole('gestionnaire-medias', 'gestionnaire-danses', 'redacteur'),
    delete: hasRole('gestionnaire-medias'),
  },
  upload: {
    staticDir: 'uploads',
    // PAS de limites de taille — voir CDC §10 règle 5
    mimeTypes: [
      'image/*',
      'video/*',
      'application/pdf',
    ],
    imageSizes: [
      { name: 'thumbnail', width: 400, height: undefined, position: 'centre' },
      { name: 'card', width: 800, height: undefined, position: 'centre' },
      { name: 'large', width: 1600, height: undefined, position: 'centre' },
    ],
  },
  fields: [
    {
      name: 'alt',
      label: 'Texte alternatif',
      type: 'text',
    },
    {
      name: 'caption',
      label: 'Légende',
      type: 'text',
    },
  ],
}
