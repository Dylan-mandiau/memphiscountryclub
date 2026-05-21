import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { publicRead } from '../access/hasRole'

/**
 * Horaires de cours et accès — éditables sans code (CDC §4.4).
 */
export const Horaires: GlobalConfig = {
  slug: 'horaires',
  label: 'Horaires & Accès',
  admin: { group: 'Apparence' },
  access: {
    read: publicRead,
    update: isAdmin,
  },
  fields: [
    {
      name: 'cours',
      label: 'Cours hebdomadaires',
      type: 'array',
      defaultValue: [
        { niveau: 'Débutants', jour: 'Mercredi', horaire: '18h30 – 19h45' },
        { niveau: 'Intermédiaires', jour: 'Mercredi', horaire: '20h00 – 21h15' },
      ],
      fields: [
        { name: 'niveau', type: 'text', required: true },
        { name: 'jour', type: 'text', required: true },
        { name: 'horaire', type: 'text', required: true },
      ],
    },
    {
      name: 'transports',
      label: 'Accès en transports',
      type: 'array',
      defaultValue: [
        { mode: 'Bus', detail: 'Ligne 32, arrêt Pont du Breucq' },
        { mode: 'Métro', detail: 'Ligne 2 rouge → Jean Jaurès → bus → Pont du Breucq' },
        { mode: 'Tramway', detail: 'Arrêt Planche d’Épinoy → 100m rue Jean Baptiste Bonte' },
      ],
      fields: [
        { name: 'mode', type: 'text', required: true },
        { name: 'detail', type: 'text', required: true },
      ],
    },
  ],
}
