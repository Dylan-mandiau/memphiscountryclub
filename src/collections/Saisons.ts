import type { CollectionConfig } from 'payload'
import { hasRole, publicRead } from '../access/hasRole'

/**
 * Saisons (années) — créables librement par le Gestionnaire Danses (CDC §4.1).
 * Saisons existantes à migrer : 2017-2018, 2018-2019, 2019-2020,
 * 2021-2022, 2022-2023, 2023-2024, 2024-2025, 2025-2026.
 * (2020-2021 absente — COVID)
 */
export const Saisons: CollectionConfig = {
  slug: 'saisons',
  admin: {
    useAsTitle: 'libelle',
    defaultColumns: ['libelle', 'annee_debut'],
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
      name: 'libelle',
      label: 'Libellé (ex: 2024-2025)',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'annee_debut',
      label: 'Année de début',
      type: 'number',
      required: true,
      admin: { description: 'Utilisé pour le tri décroissant' },
    },
  ],
}
