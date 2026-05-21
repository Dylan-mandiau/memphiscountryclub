import 'server-only'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

let cached: Promise<Payload> | null = null
let unhandledInstalled = false

/**
 * Silence les unhandledRejection liés à des erreurs SQLite/IO transitoires.
 * En production, on log uniquement les rejets inattendus.
 */
const installUnhandledRejectionFilter = () => {
  if (unhandledInstalled) return
  unhandledInstalled = true
  process.on('unhandledRejection', (reason: unknown) => {
    const r = reason as { message?: string; code?: string } | undefined
    const msg = (r?.message || '') + ' ' + (r?.code || '')
    if (
      msg.includes('SQLITE_BUSY') ||
      msg.includes('SQLITE_LOCKED') ||
      msg.includes('SQLITE_CANTOPEN')
    ) {
      // Erreurs SQLite transitoires (verrou, fichier non créé encore) —
      // le caller utilise tryPayload() et bascule en fallback.
      return
    }
    console.error('[unhandledRejection]', reason)
  })
}

export const payload = async (): Promise<Payload> => {
  installUnhandledRejectionFilter()
  if (!cached) {
    // On garde la promesse même si elle rejette — évite de relancer
    // une boucle d'init à chaque page chargée.
    cached = getPayload({ config })
    cached.catch(() => {
      /* swallow — caller utilise tryPayload */
    })
  }
  return cached
}

/**
 * Variante tolérante — retourne null si Payload ne peut pas s'initialiser
 * (secret manquant, fichier SQLite inaccessible, schéma non créé, etc.).
 * Les pages publiques l'utilisent pour rester rendables même quand
 * l'admin n'est pas opérationnel.
 */
export const tryPayload = async (): Promise<Payload | null> => {
  installUnhandledRejectionFilter()
  if (!process.env.PAYLOAD_SECRET) return null
  try {
    return await payload()
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        '[payload] init failed — pages publiques en fallback :',
        (err as Error).message,
      )
    }
    return null
  }
}
