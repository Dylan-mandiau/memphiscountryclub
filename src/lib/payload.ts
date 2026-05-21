import 'server-only'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

let cached: Promise<Payload> | null = null
let unhandledInstalled = false

/**
 * Filtre process-level pour les unhandledRejection liés à SQLite.
 * Important : on LOG quand même, on ne masque jamais silencieusement
 * (sinon impossible de debugger une init qui foire en prod).
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
      // Erreur SQLite transitoire — on log quand même pour traçabilité
      console.warn('[payload][unhandledRejection][sqlite-transitoire]', msg.trim())
      return
    }
    console.error('[payload][unhandledRejection]', reason)
  })
}

/**
 * Init Payload (singleton). Si l'init échoue, le cache est invalidé
 * pour que la requête suivante puisse retry — évite le "poison pill"
 * où une promesse rejetée permanente bloque tout sans aucun log.
 */
export const payload = async (): Promise<Payload> => {
  installUnhandledRejectionFilter()
  if (!cached) {
    cached = getPayload({ config })
    cached.catch((err) => {
      // LOG toujours, même en prod — sinon on ne saurait jamais ce qui plante
      console.error('[payload] init failed:', err)
      cached = null // permet de réessayer à la requête suivante
    })
  }
  return cached
}

/**
 * Variante tolérante — retourne null si Payload ne peut pas s'initialiser.
 * Pages publiques l'utilisent pour rester rendables même quand l'admin
 * n'est pas opérationnel. Log TOUJOURS (même en prod) pour observabilité.
 */
export const tryPayload = async (): Promise<Payload | null> => {
  installUnhandledRejectionFilter()
  if (!process.env.PAYLOAD_SECRET) {
    console.warn('[payload] PAYLOAD_SECRET manquant — pages en fallback')
    return null
  }
  try {
    return await payload()
  } catch (err) {
    console.warn(
      '[payload] init failed — pages publiques en fallback :',
      (err as Error).message,
    )
    return null
  }
}
