import type { CollectionConfig } from 'payload'
import { hasRole, publicRead } from '../access/hasRole'

/**
 * Niveaux de danse : Débutant, Intermédiaire, Démonstration.
 * Créables librement par le Gestionnaire Danses (CDC §4.1).
 */
export const Niveaux: CollectionConfig = {
  slug: 'niveaux',
  admin: {
    useAsTitle: 'nom',
    defaultColumns: ['nom', 'ordre'],
    group: 'Danses',
  },
  access: {
    read: publicRead,
    create: hasRole('gestionnaire-danses'),
    update: hasRole('gestionnaire-danses'),
    delete: hasRole('gestionnaire-danses'),
  },
  fields: [
    {
      name: 'nom',
      label: 'Nom du niveau',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Identifiant URL (ex: debutant, intermediaire)',
      },
    },
    {
      name: 'ordre',
      label: 'Ordre d’affichage',
      type: 'number',
      defaultValue: 0,
    },
  ],
}
