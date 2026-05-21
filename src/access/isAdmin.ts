import type { Access } from 'payload'
import type { UserRole } from './types'

export const isAdmin: Access = ({ req }) => {
  const role = (req.user as { role?: UserRole } | null)?.role
  return role === 'admin'
}

export const isAdminFieldLevel = ({
  req,
}: {
  req: { user: { role?: UserRole } | null }
}): boolean => {
  return req.user?.role === 'admin'
}
