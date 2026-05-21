/**
 * Helpers pour ramener une promesse Payload qui rejette vers un fallback,
 * en LOGGUANT toujours l'erreur côté serveur (visible dans stderr.log).
 *
 * Évite les `.catch(() => ({ docs: [] }))` muets qui masquent les vraies
 * pannes en prod (silent-failure-hunter #4).
 */
type PaginatedResult<T> = {
  docs: T[]
  totalDocs: number
}

export const withFallbackPaginated = async <T = unknown>(
  promise: Promise<{ docs: T[]; totalDocs?: number | null }>,
  label: string,
): Promise<PaginatedResult<T>> => {
  try {
    const r = await promise
    return { docs: r.docs, totalDocs: r.totalDocs ?? r.docs.length }
  } catch (err) {
    console.warn(`[${label}] paginated query failed:`, (err as Error).message)
    return { docs: [], totalDocs: 0 }
  }
}
