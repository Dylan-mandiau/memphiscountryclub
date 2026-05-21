'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'

type Option = { id: string; label: string }

type Props = {
  niveaux: Option[]
  saisons: Option[]
}

/**
 * Filtres instantanés (CDC §4.1) — pas de rechargement de page,
 * met simplement à jour les query params. La page serveur lit
 * searchParams pour recharger la liste avec un router.replace.
 */
export const FiltresDanses = ({ niveaux, saisons }: Props) => {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const currentNiveau = sp.get('niveau') || ''
  const currentSaison = sp.get('saison') || ''
  const currentQ = sp.get('q') || ''

  const buildHref = useCallback(
    (key: 'niveau' | 'saison' | 'q', value: string) => {
      const params = new URLSearchParams(sp.toString())
      if (value) params.set(key, value)
      else params.delete(key)
      const qs = params.toString()
      return qs ? `${pathname}?${qs}` : pathname
    },
    [sp, pathname],
  )

  const apply = useCallback(
    (key: 'niveau' | 'saison' | 'q', value: string) => {
      router.replace(buildHref(key, value), { scroll: false })
    },
    [router, buildHref],
  )

  const niveauOptions = useMemo(
    () => [{ id: '', label: 'Tous niveaux' }, ...niveaux],
    [niveaux],
  )
  const saisonOptions = useMemo(
    () => [{ id: '', label: 'Toutes saisons' }, ...saisons],
    [saisons],
  )

  return (
    <div className="space-y-4">
      <input
        type="search"
        placeholder="Rechercher une danse…"
        defaultValue={currentQ}
        onChange={(e) => apply('q', e.target.value)}
        className="w-full rounded-md border border-border bg-background px-4 py-3 text-body outline-none focus:border-accent"
      />
      <div className="flex flex-wrap gap-2">
        {niveauOptions.map((opt) => {
          const active = currentNiveau === opt.id
          return (
            <button
              key={`n-${opt.id || 'all'}`}
              type="button"
              onClick={() => apply('niveau', opt.id)}
              className={cn(
                'rounded-pill border px-4 py-2 text-small transition-colors',
                active
                  ? 'border-accent bg-accent text-white'
                  : 'border-border bg-surface text-text-secondary hover:text-text-primary',
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {saisonOptions.map((opt) => {
          const active = currentSaison === opt.id
          return (
            <button
              key={`s-${opt.id || 'all'}`}
              type="button"
              onClick={() => apply('saison', opt.id)}
              className={cn(
                'rounded-pill border px-4 py-2 text-small transition-colors',
                active
                  ? 'border-accent bg-accent text-white'
                  : 'border-border bg-surface text-text-secondary hover:text-text-primary',
              )}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
