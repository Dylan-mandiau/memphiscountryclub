/**
 * Endpoint de diagnostic — protégé par token.
 *
 * Usage :
 *   GET /api/health?token=<HEALTH_TOKEN>
 * ou via header :
 *   X-Health-Token: <HEALTH_TOKEN>
 *
 * Renvoie un rapport JSON minimal. AUCUNE info sensible exposée :
 * - Pas de chemin absolu (cwd, expected_file)
 * - Pas de message d'erreur brut
 * - Juste des booléens et catégories
 *
 * À retirer ou désactiver une fois la prod stable.
 */
import { NextResponse, type NextRequest } from 'next/server'
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
    has_NEXT_PUBLIC_SERVER_URL: boolean
    node_version: string
  }
  sqlite: {
    relative_path: string | null
    file_exists: boolean | null
    file_size_bytes: number | null
    writable: boolean | null
    parent_writable: boolean | null
  }
  payload: {
    can_init: boolean | null
    collections_count: number | null
    error_category: string | null
  }
  notes: string[]
}

const categorizeError = (msg: string): string => {
  if (msg.includes('SQLITE_CANTOPEN')) return 'sqlite_cantopen'
  if (msg.includes('SQLITE_READONLY')) return 'sqlite_readonly'
  if (msg.includes('no such table')) return 'schema_missing'
  if (msg.includes('PAYLOAD_SECRET')) return 'missing_secret'
  if (msg.toLowerCase().includes('database')) return 'database_generic'
  return 'unknown'
}

const computeSqliteFilePath = (uri: string | undefined): string | null => {
  if (!uri) return null
  if (uri.startsWith('file:')) {
    return uri.slice(5).replace(/^\/\//, '')
  }
  return null
}

const checkFs = async (relativePath: string) => {
  const abs = path.resolve(process.cwd(), relativePath)
  const result = {
    file_exists: false as boolean | null,
    file_size_bytes: null as number | null,
    writable: null as boolean | null,
    parent_writable: null as boolean | null,
  }
  try {
    const stat = await fs.stat(abs)
    result.file_exists = true
    result.file_size_bytes = stat.size
    try {
      await fs.access(abs, fs.constants.W_OK)
      result.writable = true
    } catch {
      result.writable = false
    }
  } catch {
    result.file_exists = false
  }
  try {
    await fs.access(path.dirname(abs), fs.constants.W_OK)
    result.parent_writable = true
  } catch {
    result.parent_writable = false
  }
  return result
}

const isAuthorized = (req: NextRequest): boolean => {
  const expected = process.env.HEALTH_TOKEN
  if (!expected) {
    // Si pas de token configuré, on autorise UNIQUEMENT en dev pour éviter
    // un endpoint public en prod par accident.
    return process.env.NODE_ENV !== 'production'
  }
  const fromQuery = req.nextUrl.searchParams.get('token')
  const fromHeader = req.headers.get('x-health-token')
  return fromQuery === expected || fromHeader === expected
}

export const GET = async (req: NextRequest) => {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: 'Forbidden', hint: 'Provide HEALTH_TOKEN via ?token= or X-Health-Token header' },
      { status: 403 },
    )
  }

  const notes: string[] = []
  const sqliteRelative = computeSqliteFilePath(process.env.DATABASE_URI)

  const env: HealthReport['env'] = {
    NODE_ENV: process.env.NODE_ENV || null,
    has_DATABASE_URI: Boolean(process.env.DATABASE_URI),
    has_PAYLOAD_SECRET: Boolean(process.env.PAYLOAD_SECRET),
    PAYLOAD_PUSH: process.env.PAYLOAD_PUSH || null,
    has_NEXT_PUBLIC_SERVER_URL: Boolean(process.env.NEXT_PUBLIC_SERVER_URL),
    node_version: process.version,
  }

  const sqlite: HealthReport['sqlite'] = {
    relative_path: sqliteRelative,
    file_exists: null,
    file_size_bytes: null,
    writable: null,
    parent_writable: null,
  }

  if (sqliteRelative) {
    try {
      Object.assign(sqlite, await checkFs(sqliteRelative))
    } catch {
      // ignore, restera null
    }
  }

  const payload: HealthReport['payload'] = {
    can_init: null,
    collections_count: null,
    error_category: null,
  }
  try {
    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    const cms = await getPayload({ config })
    payload.can_init = true
    payload.collections_count = Object.keys(
      (cms as { collections?: Record<string, unknown> }).collections || {},
    ).length
  } catch (e) {
    payload.can_init = false
    payload.error_category = categorizeError((e as Error).message)
    // Log la vraie erreur côté serveur (visible dans stderr.log)
    console.error('[health] Payload init failed:', e)
  }

  let status: HealthReport['status'] = 'ok'
  if (!env.has_DATABASE_URI) {
    status = 'fail'
    notes.push('DATABASE_URI manquant')
  }
  if (!env.has_PAYLOAD_SECRET) {
    status = 'fail'
    notes.push('PAYLOAD_SECRET manquant')
  }
  if (
    sqlite.relative_path &&
    sqlite.file_exists === false &&
    sqlite.parent_writable === false
  ) {
    status = 'fail'
    notes.push('Dossier parent du fichier SQLite NON inscriptible')
  }
  if (sqlite.file_exists && sqlite.writable === false) {
    status = 'fail'
    notes.push('Fichier SQLite existe mais NON inscriptible')
  }
  if (payload.can_init === false) {
    status = 'fail'
    notes.push('Payload init failed (cat: ' + (payload.error_category || 'unknown') + ')')
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
