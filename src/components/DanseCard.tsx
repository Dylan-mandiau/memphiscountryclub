import Link from 'next/link'
import { Badge } from './Badge'

type DanseCardProps = {
  slug: string
  titre: string
  niveau?: string
  saison?: string
  hasDemo?: boolean
  hasApprentissage?: boolean
  hasPdf?: boolean
}

export const DanseCard = ({
  slug,
  titre,
  niveau,
  saison,
  hasDemo,
  hasApprentissage,
  hasPdf,
}: DanseCardProps) => {
  return (
    <Link
      href={`/danses/${slug}`}
      className="group block rounded-soft border border-border bg-surface p-6 transition-all duration-200 hover:shadow-card hover:-translate-y-0.5"
    >
      <div className="flex flex-wrap items-center gap-2">
        {niveau && <Badge variant="accent">{niveau}</Badge>}
        {saison && <Badge variant="neutral">{saison}</Badge>}
      </div>
      <h3 className="mt-4 text-h3 font-display font-semibold text-text-primary group-hover:text-accent">
        {titre}
      </h3>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-text-secondary">
        {hasDemo && <span>▶ Vidéo démo</span>}
        {hasApprentissage && <span>▶ Apprentissage</span>}
        {hasPdf && <span>📄 PDF</span>}
      </div>
    </Link>
  )
}
