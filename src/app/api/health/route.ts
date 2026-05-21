/**
 * Endpoint de diagnostic — accessible publiquement à /api/health
 *
 * Aucune donnée sensible exposée (pas de SECRET, pas de mdp, juste des booléens
 * et l'état des composants).
 *
 * Utile au premier déploiement pour vérifier que :
 * - les env vars sont bien lues par Next/Passenger
 * - le fichier SQLite est accessible en lecture/écriture
 * - Payload arrive à s'initialiser
 *
 * À SUPPRIMER ou protéger une fois la prod stable (route publique).
 */
import { NextResponse } from 'next/server'
import { promises as fs } from 'node:fs'
import path from 'node:path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type HealthReport = {
  status: 'ok' | 'warn' | 'fail'
  timestamp: string
  env: {
    NODE_ENV: string | null
    has_DATABASE_URI: boolean
    has_PAYLOAD_SECRET: boolean
    PAYLOAD_PUSH: string | null
    NEXT_PUBLIC_SERVER_URL: string | null
    PAYLOAD_PUBLIC_SERVER_URL: string | null
    node_version: string
    cwd: string
  }
  sqlite: {
    expected_file: string | null
    file_exists: boolean | null
    file_size_bytes: number | null
    readable: boolean | null
    writable: boolean | null
    parent_writable: boolean | null
    error: string | null
  }
  payload: {
    can_init: boolean | null
    collections_count: number | null
    error: string | null
  }
  notes: string[]
}

const computeSqliteFilePath = (uri: string | undefined): string | null => {
  if (!uri) return null
  // Format LibSQL : file:./memphis.db ou file:/abs/path/memphis.db
  if (uri.startsWith('file:')) {
    const p = uri.slice(5).replace(/^\/\//, '')
    return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p)
  }
  return uri
}

const checkFs = async (filepath: string) => {
  const result: Partial<HealthReport['sqlite']> = {
    file_exists: false,
    file_size_bytes: null,
    readable: null,
    writable: null,
    parent_writable: null,
  }
  try {
    const stat = await fs.stat(filepath)
    result.file_exists = true
    result.file_size_bytes = stat.size
    try {
      await fs.access(filepath, fs.constants.R_OK)
      result.readable = true
    } catch {
      result.readable = false
    }
    try {
      await fs.access(filepath, fs.constants.W_OK)
      result.writable = true
    } catch {
      result.writable = false
    }
  } catch {
    result.file_exists = false
  }
  try {
    await fs.access(path.dirname(filepath), fs.constants.W_OK)
    result.parent_writable = true
  } catch {
    result.parent_writable = false
  }
  return result
}

export const GET = async () => {
  const notes: string[] = []
  const sqlitePath = computeSqliteFilePath(process.env.DATABASE_URI)

  const env: HealthReport['env'] = {
    NODE_ENV: process.env.NODE_ENV || null,
    has_DATABASE_URI: Boolean(process.env.DATABASE_URI),
    has_PAYLOAD_SECRET: Boolean(process.env.PAYLOAD_SECRET),
    PAYLOAD_PUSH: process.env.PAYLOAD_PUSH || null,
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || null,
    PAYLOAD_PUBLIC_SERVER_URL: process.env.PAYLOAD_PUBLIC_SERVER_URL || null,
    node_version: process.version,
    cwd: process.cwd(),
  }

  const sqlite: HealthReport['sqlite'] = {
    expected_file: sqlitePath,
    file_exists: null,
    file_size_bytes: null,
    readable: null,
    writable: null,
    parent_writable: null,
    error: null,
  }

  if (sqlitePath) {
    try {
      Object.assign(sqlite, await checkFs(sqlitePath))
    } catch (e) {
      sqlite.error = (e as Error).message
    }
  } else {
    sqlite.error = 'DATABASE_URI vide ou format inattendu'
  }

  // Tentative d'init Payload (best-effort)
  const payload: HealthReport['payload'] = {
    can_init: null,
    collections_count: null,
    error: null,
  }
  try {
    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    const cms = await getPayload({ config })
    payload.can_init = true
    payload.collections_count = Object.keys((cms as any).collections || {}).length
  } catch (e) {
    payload.can_init = false
    payload.error = (e as Error).message
  }

  // Conclusion
  let status: HealthReport['status'] = 'ok'
  if (!env.has_DATABASE_URI) {
    status = 'fail'
    notes.push('DATABASE_URI manquant')
  }
  if (!env.has_PAYLOAD_SECRET) {
    status = 'fail'
    notes.push('PAYLOAD_SECRET manquant')
  }
  if (sqlite.expected_file && sqlite.file_exists === false && sqlite.parent_writable === false) {
    status = 'fail'
    notes.push('Dossier parent du fichier SQLite NON inscriptible')
  }
  if (sqlite.file_exists && sqlite.writable === false) {
    status = 'fail'
    notes.push('Fichier SQLite existe mais NON inscriptible')
  }
  if (payload.can_init === false) {
    status = 'fail'
    notes.push('Payload n a pas pu s initialiser : ' + (payload.error || 'erreur inconnue'))
  }

  const report: HealthReport = {
    status,
    timestamp: new Date().toISOString(),
    env,
    sqlite,
    payload,
    notes,
  }

  return NextResponse.json(report, { status: status === 'fail' ? 500 : 200 })
}
