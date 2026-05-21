import Link from 'next/link'
import Image from 'next/image'
import { formatDateFr } from '@/lib/utils'

type Props = {
  slug: string
  titre: string
  categorie?: string
  date?: string
  couvertureUrl?: string
  couvertureAlt?: string
}

export const AlbumCard = ({
  slug,
  titre,
  categorie,
  date,
  couvertureUrl,
  couvertureAlt,
}: Props) => {
  return (
    <Link
      href={`/galerie/${slug}`}
      className="group block overflow-hidden rounded-soft border border-border bg-surface transition-all duration-200 hover:shadow-card hover:-translate-y-0.5"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-border">
        {couvertureUrl ? (
          <Image
            src={couvertureUrl}
            alt={couvertureAlt || titre}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-opacity duration-200 group-hover:opacity-90"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            Aucune image
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-h3 font-display font-semibold text-text-primary group-hover:text-accent">
          {titre}
        </h3>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-text-secondary">
          {categorie && <span>{categorie}</span>}
          {date && <span>{formatDateFr(date)}</span>}
        </div>
      </div>
    </Link>
  )
}
