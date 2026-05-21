import type { Access, FieldAccess } from 'payload'
import type { UserRole } from './types'

export const isAdmin: Access = ({ req }) => {
  const role = (req.user as { role?: UserRole } | null)?.role
  return role === 'admin'
}

/**
 * Accès au niveau champ — utilisé pour empêcher la modification d'un
 * champ par tout autre rôle que l'admin (ex : `role` dans Users).
 */
export const isAdminFieldLevel: FieldAccess = ({ req }) => {
  const role = (req.user as { role?: UserRole } | null)?.role
  return role === 'admin'
}
