import type { CollectionConfig } from 'payload'
import { isAdmin, isAdminFieldLevel } from '../access/isAdmin'
import { ALL_ROLES } from '../access/types'

/**
 * Comptes utilisateurs. Seul l'admin (Dylan) peut créer/modifier des comptes
 * et attribuer les rôles. Pas d'inscription publique (CDC §3).
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'nom', 'role'],
    group: 'Administration',
  },
  auth: true,
  access: {
    create: isAdmin,
    read: ({ req }) => {
      if (req.user?.role === 'admin') return true
      // Un utilisateur peut lire son propre profil
      if (req.user) return { id: { equals: req.user.id } }
      return false
    },
    update: ({ req }) => {
      if (req.user?.role === 'admin') return true
      if (req.user) return { id: { equals: req.user.id } }
      return false
    },
    delete: isAdmin,
    admin: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'nom',
      label: 'Nom complet',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      label: 'Rôle',
      type: 'select',
      required: true,
      defaultValue: 'redacteur',
      options: ALL_ROLES.map((r) => ({ label: r, value: r })),
      access: {
        // Seul un admin peut modifier le rôle
        update: isAdminFieldLevel,
      },
    },
  ],
}
