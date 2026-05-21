import type { CollectionConfig } from 'payload'
import { hasRole, publicRead } from '../access/hasRole'
import { slugFromField } from '../lib/slugify'

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
      index: true,
      // Hook serveur (filet de sécurité, ex: création via API)
      hooks: { beforeValidate: [slugFromField('nom')] },
      admin: {
        position: 'sidebar',
        description: 'Généré automatiquement depuis le nom (modifiable).',
        // Custom client component → auto-fill en temps réel dans le formulaire
        custom: { sourceField: 'nom' },
        components: {
          Field: '@/components/admin/SlugField',
        },
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
