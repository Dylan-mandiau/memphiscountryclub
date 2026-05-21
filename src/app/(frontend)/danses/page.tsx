import type { Where } from 'payload'
import { tryPayload } from '@/lib/payload'
import { withFallbackPaginated } from '@/lib/payload-fallbacks'
import { DanseCard } from '@/components/DanseCard'
import { FiltresDanses } from '@/components/FiltresDanses'

export const dynamic = 'force-dynamic'

type SearchParams = {
  niveau?: string
  saison?: string
  q?: string
}

const BibliothequePage = async ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) => {
  const sp = await searchParams
  const cms = await tryPayload()

  if (!cms) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
        <h1 className="text-h1 font-display font-semibold text-text-primary">
          Bibliothèque des danses
        </h1>
        <p className="mt-4 rounded-lg border border-warning/30 bg-warning/5 p-6 text-small text-text-secondary">
          ⚠️ Base de données non configurée — renseigner <code>DATABASE_URI</code> dans{' '}
          <code>.env.local</code>.
        </p>
      </div>
    )
  }

  const [niveauxRes, saisonsRes] = await Promise.all([
    withFallbackPaginated(
      cms.find({ collection: 'niveaux', limit: 100, sort: 'ordre' }),
      'danses/niveaux',
    ),
    withFallbackPaginated(
      cms.find({ collection: 'saisons', limit: 100, sort: '-annee_debut' }),
      'danses/saisons',
    ),
  ])

  const where: Where = {}
  if (sp.niveau) where.niveau = { equals: sp.niveau }
  if (sp.saison) where.annee_saison = { equals: sp.saison }
  if (sp.q) {
    // Limite la longueur du terme de recherche pour éviter une query LIKE
    // pathologique (P1-8 du code-reviewer)
    where.titre = { like: sp.q.slice(0, 100) }
  }

  const danses = await withFallbackPaginated(
    cms.find({
      collection: 'danses',
      where,
      sort: 'titre',
      limit: 500,
      depth: 1,
    }),
    'danses/list',
  )

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
      <header className="mb-8">
        <h1 className="text-h1 font-display font-semibold text-text-primary">
          Bibliothèque des danses
        </h1>
        <p className="mt-2 text-body text-text-secondary">
          {danses.totalDocs} danse{danses.totalDocs > 1 ? 's' : ''} référencée
          {danses.totalDocs > 1 ? 's' : ''} — filtres instantanés.
        </p>
      </header>

      <FiltresDanses
        niveaux={niveauxRes.docs.map((n: any) => ({ id: String(n.id), label: n.nom }))}
        saisons={saisonsRes.docs.map((s: any) => ({ id: String(s.id), label: s.libelle }))}
      />

      {danses.docs.length === 0 ? (
        <p className="mt-12 text-text-secondary">Aucune danse ne correspond à ces filtres.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {danses.docs.map((d: any) => (
            <DanseCard
              key={d.id}
              slug={d.slug}
              titre={d.titre}
              niveau={d.niveau?.nom}
              saison={d.annee_saison?.libelle}
              hasDemo={Boolean(d.video_demo_url)}
              hasApprentissage={Boolean(d.video_apprentissage_url)}
              hasPdf={Boolean(d.fiche_pdf)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BibliothequePage
