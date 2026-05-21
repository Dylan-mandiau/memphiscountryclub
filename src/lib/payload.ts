import 'server-only'
import net from 'net'
import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

let cached: Promise<Payload> | null = null
let dbReachable: boolean | null = null
let unhandledInstalled = false

/**
 * Silence les unhandledRejection issus de la boucle de reconnexion
 * Postgres de Payload (dev sans PG local).
 */
const installUnhandledRejectionFilter = () => {
  if (unhandledInstalled) return
  unhandledInstalled = true
  process.on('unhandledRejection', (reason: unknown) => {
    const r = reason as { message?: string; code?: string } | undefined
    const msg = (r?.message || '') + ' ' + (r?.code || '')
    if (
      msg.includes('ECONNREFUSED') ||
      msg.includes('cannot connect to Postgres')
    ) {
      return
    }
    console.error('[unhandledRejection]', reason)
  })
}

/**
 * Sonde TCP rapide (500 ms) — évite d'appeler getPayload() quand on sait
 * déjà que le port Postgres n'est pas joignable. Ça empêche le pool pg
 * de se créer et donc d'émettre des unhandledRejection en cascade.
 */
const probePostgres = async (): Promise<boolean> => {
  if (dbReachable !== null) return dbReachable
  const uri = process.env.DATABASE_URI
  if (!uri) {
    dbReachable = false
    return false
  }
  try {
    const u = new URL(uri)
    const host = u.hostname
    const port = Number(u.port || 5432)
    dbReachable = await new Promise<boolean>((resolve) => {
      const sock = new net.Socket()
      const done = (ok: boolean) => {
        sock.destroy()
        resolve(ok)
      }
      sock.setTimeout(500)
      sock.once('connect', () => done(true))
      sock.once('timeout', () => done(false))
      sock.once('error', () => done(false))
      sock.connect(port, host)
    })
  } catch {
    dbReachable = false
  }
  return dbReachable
}

export const payload = async (): Promise<Payload> => {
  installUnhandledRejectionFilter()
  if (!cached) {
    cached = getPayload({ config })
    cached.catch(() => {
      /* swallow — caller utilise tryPayload */
    })
  }
  return cached
}

/**
 * Variante tolérante — retourne null si Payload ne peut pas s'initialiser
 * ou si Postgres n'est pas joignable.
 */
export const tryPayload = async (): Promise<Payload | null> => {
  installUnhandledRejectionFilter()
  if (!process.env.PAYLOAD_SECRET) return null
  const ok = await probePostgres()
  if (!ok) {
    if (process.env.NODE_ENV !== 'production' && dbReachable === false) {
      console.warn(
        '[payload] Postgres injoignable (' +
          (process.env.DATABASE_URI || 'DATABASE_URI vide') +
          ') — pages publiques en fallback.',
      )
    }
    return null
  }
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
