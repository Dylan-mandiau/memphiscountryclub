import { tryPayload } from '@/lib/payload'
import { AlbumCard } from '@/components/AlbumCard'

export const dynamic = 'force-dynamic'

const GaleriePage = async () => {
  const cms = await tryPayload()

  if (!cms) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
        <h1 className="text-h1 font-display font-semibold text-text-primary">Galerie</h1>
        <p className="mt-4 rounded-lg border border-warning/30 bg-warning/5 p-6 text-small text-text-secondary">
          ⚠️ Base de données non configurée.
        </p>
      </div>
    )
  }

  const albums = await cms
    .find({
      collection: 'albums',
      sort: '-date_evenement',
      depth: 2,
      limit: 200,
    })
    .catch((err: unknown) => {
      console.warn('[galerie] find(albums) failed:', (err as Error).message)
      return { docs: [] as any[], totalDocs: 0 }
    })

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
      <header className="mb-8">
        <h1 className="text-h1 font-display font-semibold text-text-primary">Galerie</h1>
        <p className="mt-2 text-body text-text-secondary">
          {albums.totalDocs} album{albums.totalDocs > 1 ? 's' : ''}.
        </p>
      </header>

      {albums.docs.length === 0 ? (
        <p className="text-text-secondary">Aucun album pour le moment.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.docs.map((a: any) => (
            <AlbumCard
              key={a.id}
              slug={a.slug}
              titre={a.titre_album}
              categorie={a.categorie?.nom}
              date={a.date_evenement}
              couvertureUrl={a.couverture?.url}
              couvertureAlt={a.couverture?.alt}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default GaleriePage
