import type { FieldHook } from 'payload'

/**
 * Slugifie une chaîne en identifiant URL-safe.
 * - Minuscules
 * - Diacritiques supprimés (é → e, ç → c, etc.)
 * - Non-alphanumériques remplacés par `-`
 * - Trim des tirets en début/fin
 *
 * Exemple : "Démonstrations 2024" → "demonstrations-2024"
 */
export const slugify = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

/**
 * Crée un hook `beforeValidate` Payload qui auto-génère le slug
 * à partir d'un champ source du même document.
 * Si l'utilisateur a déjà saisi un slug manuellement, sa valeur est conservée.
 *
 * Usage :
 *   { name: 'slug', hooks: { beforeValidate: [slugFromField('nom')] } }
 */
export const slugFromField = (sourceField: string): FieldHook => {
  return ({ data, value }) => {
    if (value) return value
    const source = (data as Record<string, unknown> | undefined)?.[sourceField]
    if (typeof source === 'string' && source.length > 0) {
      return slugify(source)
    }
    return value
  }
}
