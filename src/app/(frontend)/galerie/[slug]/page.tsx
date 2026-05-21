import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { tryPayload } from '@/lib/payload'
import { formatDateFr } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const AlbumPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}) => {
  const { slug } = await params
  const cms = await tryPayload()
  if (!cms) notFound()

  const found = await cms
    .find({
      collection: 'albums',
      where: { slug: { equals: slug } },
      depth: 2,
      limit: 1,
    })
    .catch(() => ({ docs: [] as any[] }))

  const album = found.docs[0] as any
  if (!album) notFound()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
      <Link href="/galerie" className="text-small text-text-secondary hover:text-accent">
        ← Retour à la galerie
      </Link>

      <header className="mt-6">
        <h1 className="text-h1 font-display font-semibold text-text-primary">
          {album.titre_album}
        </h1>
        <div className="mt-2 flex flex-wrap gap-3 text-small text-text-secondary">
          {album.categorie?.nom && <span>{album.categorie.nom}</span>}
          {album.date_evenement && <span>{formatDateFr(album.date_evenement)}</span>}
        </div>
        {album.description && (
          <p className="mt-4 text-body text-text-secondary">{album.description}</p>
        )}
      </header>

      {Array.isArray(album.medias) && album.medias.length > 0 ? (
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {album.medias.map((m: any, i: number) => {
            const f = m.fichier
            if (!f) return null
            const isVideo = f.mimeType?.startsWith('video/')
            return (
              <figure key={i} className="overflow-hidden rounded-lg border border-border bg-surface">
                {isVideo ? (
                  <video src={f.url} controls className="aspect-video w-full bg-black" />
                ) : (
                  <div className="relative aspect-square w-full">
                    <Image
                      src={f.url}
                      alt={m.legende || f.alt || album.titre_album}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                {m.legende && (
                  <figcaption className="p-3 text-xs text-text-secondary">{m.legende}</figcaption>
                )}
              </figure>
            )
          })}
        </div>
      ) : (
        <p className="mt-12 text-text-secondary">Cet album est vide.</p>
      )}
    </div>
  )
}

export default AlbumPage
