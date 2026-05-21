import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { publicRead } from '../access/hasRole'

/**
 * Informations de contact — éditables sans code (CDC §4.4).
 */
export const Contact: GlobalConfig = {
  slug: 'contact',
  label: 'Contact',
  admin: { group: 'Apparence' },
  access: {
    read: publicRead,
    update: isAdmin,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      defaultValue: 'memphiscountryclub59650@gmail.com',
    },
    {
      name: 'telephone',
      label: 'Téléphone',
      type: 'text',
      required: true,
      defaultValue: '07 69 21 08 91',
    },
    {
      name: 'adresse',
      label: 'Adresse',
      type: 'textarea',
      required: true,
      defaultValue:
        'Salle Alfred Dequesnes, 37 Rue Jean Baptiste Bonte, 59650 Villeneuve-d’Ascq',
    },
  ],
}
