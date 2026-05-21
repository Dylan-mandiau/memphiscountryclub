import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))

export const formatDateFr = (input: string | Date): string => {
  const d = typeof input === 'string' ? new Date(input) : input
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
