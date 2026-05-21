import Image from 'next/image'
import { tryPayload } from '@/lib/payload'
import { formatDateFr } from '@/lib/utils'
import { HeroBanniere, type BanniereData } from '@/components/HeroBanniere'

export const dynamic = 'force-dynamic'

const HomePage = async () => {
  const cms = await tryPayload()

  let banniere: BanniereData = {}
  let articles: any[] = []

  if (cms) {
    try {
      banniere = ((await cms.findGlobal({
        slug: 'banniere',
        depth: 2,
      })) as BanniereData) || {}
    } catch {}
    try {
      const r = await cms.find({
        collection: 'articles',
        where: { statut: { equals: 'publie' } },
        sort: '-date_publication',
        limit: 6,
        depth: 1,
      })
      articles = r.docs
    } catch {}
  }

  return (
    <>
      <HeroBanniere banniere={banniere} />

      <section className="mx-auto max-w-6xl px-4 py-24 lg:px-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-h2 font-display font-semibold text-text-primary">
            Dernières actualités
          </h2>
        </div>

        {!cms ? (
          <div className="mt-8 rounded-lg border border-warning/30 bg-warning/5 p-6">
            <p className="text-small text-text-secondary">
              ⚠️ Base de données non configurée — renseigner <code>DATABASE_URI</code>{' '}
              dans <code>.env.local</code> et créer la base PostgreSQL pour activer
              l’admin et le contenu.
            </p>
          </div>
        ) : articles.length === 0 ? (
          <p className="mt-8 text-text-secondary">Aucun article publié pour le moment.</p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a: any) => (
              <article
                key={a.id}
                className="overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-card"
              >
                {a.image_une?.url && (
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={a.image_une.url}
                      alt={a.image_une.alt || a.titre}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <p className="text-xs uppercase tracking-wide text-text-muted">
                    {formatDateFr(a.date_publication)}
                  </p>
                  <h3 className="mt-2 text-h3 font-display font-semibold text-text-primary">
                    {a.titre}
                  </h3>
                  {a.extrait && (
                    <p className="mt-2 text-small text-text-secondary">{a.extrait}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export default HomePage
