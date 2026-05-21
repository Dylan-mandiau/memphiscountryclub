import type { Access } from 'payload'
import type { UserRole } from './types'

/**
 * Accès si l'utilisateur a l'un des rôles fournis OU est admin.
 * Admin a toujours tous les droits — section 2 du CDC.
 */
export const hasRole = (...allowed: UserRole[]): Access => {
  return ({ req }) => {
    const role = (req.user as { role?: UserRole } | null)?.role
    if (!role) return false
    if (role === 'admin') return true
    return allowed.includes(role)
  }
}

export const isAuthenticated: Access = ({ req }) => Boolean(req.user)

export const publicRead: Access = () => true
