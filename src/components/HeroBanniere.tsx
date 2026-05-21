import Link from 'next/link'
import Image from 'next/image'

type Media = {
  url?: string
  alt?: string
  width?: number
  height?: number
}

export type BanniereData = {
  titre?: string
  sous_titre?: string
  cta_texte?: string
  cta_lien?: string
  cta_secondaire_texte?: string
  cta_secondaire_lien?: string
  image?: Media | null
  image_alt?: string
  style?: 'cote-a-cote' | 'fond-overlay' | 'texte-seul'
  galerie_membres?: { photo?: Media | null; legende?: string }[]
}

const DEFAULT: Required<Omit<BanniereData, 'image' | 'galerie_membres'>> = {
  titre: 'Memphis Country Club',
  sous_titre:
    'Association de danse country à Villeneuve-d’Ascq — Cours, démos, événements toute l’année.',
  cta_texte: 'Voir les danses',
  cta_lien: '/danses',
  cta_secondaire_texte: 'Se rendre aux cours',
  cta_secondaire_lien: '/acces',
  image_alt: 'Les membres du Memphis Country Club',
  style: 'cote-a-cote',
}

const CtaButtons = ({ b }: { b: BanniereData }) => (
  <div className="mt-8 flex flex-wrap gap-3">
    <Link
      href={b.cta_lien || DEFAULT.cta_lien}
      className="rounded-pill bg-accent px-6 py-3 text-small font-medium text-white transition-colors hover:bg-accent-hover"
    >
      {b.cta_texte || DEFAULT.cta_texte}
    </Link>
    {(b.cta_secondaire_texte || DEFAULT.cta_secondaire_texte) && (
      <Link
        href={b.cta_secondaire_lien || DEFAULT.cta_secondaire_lien}
        className="rounded-pill border border-border bg-background px-6 py-3 text-small font-medium text-text-primary transition-colors hover:border-text-secondary"
      >
        {b.cta_secondaire_texte || DEFAULT.cta_secondaire_texte}
      </Link>
    )}
  </div>
)

const GalerieMembres = ({ items }: { items: BanniereData['galerie_membres'] }) => {
  const photos = (items || []).filter((m) => m.photo?.url)
  if (photos.length === 0) return null
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${Math.min(photos.length, 6)}, minmax(0, 1fr))`,
          }}
        >
          {photos.map((m, i) => (
            <figure
              key={i}
              className="relative aspect-square overflow-hidden rounded-lg border border-border"
            >
              <Image
                src={m.photo!.url!}
                alt={m.legende || m.photo!.alt || `Membre ${i + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 16vw"
                className="object-cover"
              />
              {m.legende && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-xs text-white">
                  {m.legende}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export const HeroBanniere = ({ banniere }: { banniere: BanniereData }) => {
  const b = banniere || {}
  const titre = b.titre || DEFAULT.titre
  const sousTitre = b.sous_titre || DEFAULT.sous_titre
  const style = b.style || DEFAULT.style
  const imgUrl = b.image?.url
  const imgAlt = b.image_alt || b.image?.alt || DEFAULT.image_alt

  // === Style « fond + overlay » : image plein cadre, texte par dessus ===
  if (style === 'fond-overlay' && imgUrl) {
    return (
      <>
        <section className="relative border-b border-border">
          <div className="relative h-[min(80vh,640px)] w-full overflow-hidden">
            <Image
              src={imgUrl}
              alt={imgAlt}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
                <div className="max-w-2xl text-white">
                  <h1 className="text-h1 font-display font-semibold drop-shadow-md">
                    {titre}
                  </h1>
                  <p className="mt-4 text-body text-white/90 drop-shadow">{sousTitre}</p>
                  <CtaButtons b={b} />
                </div>
              </div>
            </div>
          </div>
        </section>
        <GalerieMembres items={b.galerie_membres} />
      </>
    )
  }

  // === Style « texte seul » ===
  if (style === 'texte-seul' || !imgUrl) {
    return (
      <>
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-24 text-center lg:px-6">
            <h1 className="text-h1 font-display font-semibold text-text-primary">
              {titre}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-body text-text-secondary">
              {sousTitre}
            </p>
            <div className="mt-8 flex justify-center">
              <CtaButtons b={b} />
            </div>
          </div>
        </section>
        <GalerieMembres items={b.galerie_membres} />
      </>
    )
  }

  // === Style par défaut « côte à côte » ===
  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 md:grid-cols-2 md:items-center lg:px-6">
          <div>
            <h1 className="text-h1 font-display font-semibold text-text-primary">
              {titre}
            </h1>
            <p className="mt-4 text-body text-text-secondary">{sousTitre}</p>
            <CtaButtons b={b} />
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border shadow-card">
            <Image
              src={imgUrl}
              alt={imgAlt}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>
      <GalerieMembres items={b.galerie_membres} />
    </>
  )
}
