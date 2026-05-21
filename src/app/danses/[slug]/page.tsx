import { notFound } from 'next/navigation'
import Link from 'next/link'
import { tryPayload } from '@/lib/payload'
import { Badge } from '@/components/Badge'
import { YouTubeEmbed } from '@/components/YouTubeEmbed'

export const dynamic = 'force-dynamic'

const DansePage = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}) => {
  const { slug } = await params
  const cms = await tryPayload()
  if (!cms) notFound()

  const found = await cms
    .find({
      collection: 'danses',
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
    })
    .catch(() => ({ docs: [] as any[] }))

  const danse = found.docs[0] as any
  if (!danse) notFound()

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 lg:px-6">
      <Link href="/danses" className="text-small text-text-secondary hover:text-accent">
        ← Retour à la bibliothèque
      </Link>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          {danse.niveau?.nom && <Badge variant="accent">{danse.niveau.nom}</Badge>}
          {danse.annee_saison?.libelle && (
            <Badge variant="neutral">{danse.annee_saison.libelle}</Badge>
          )}
        </div>
        <h1 className="mt-4 text-h1 font-display font-semibold text-text-primary">
          {danse.titre}
        </h1>
        {danse.description && (
          <p className="mt-4 text-body text-text-secondary">{danse.description}</p>
        )}
      </header>

      <div className="mt-12 space-y-12">
        {danse.video_demo_url && (
          <section>
            <h2 className="text-h2 font-display font-semibold text-text-primary">
              Vidéo de démonstration
            </h2>
            <div className="mt-4">
              <YouTubeEmbed url={danse.video_demo_url} title={danse.titre + ' — démo'} />
            </div>
          </section>
        )}
        {danse.video_apprentissage_url && (
          <section>
            <h2 className="text-h2 font-display font-semibold text-text-primary">
              Vidéo d’apprentissage
            </h2>
            <div className="mt-4">
              <YouTubeEmbed
                url={danse.video_apprentissage_url}
                title={danse.titre + ' — apprentissage'}
              />
            </div>
          </section>
        )}
        {danse.fiche_pdf?.url && (
          <section>
            <h2 className="text-h2 font-display font-semibold text-text-primary">Fiche PDF</h2>
            <iframe
              src={danse.fiche_pdf.url}
              title={danse.titre + ' — fiche PDF'}
              className="mt-4 h-[80vh] w-full rounded-lg border border-border"
            />
            <a
              href={danse.fiche_pdf.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-small text-accent hover:underline"
            >
              Ouvrir le PDF dans un nouvel onglet
            </a>
          </section>
        )}
      </div>
    </div>
  )
}

export default DansePage
