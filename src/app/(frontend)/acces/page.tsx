import { tryPayload } from '@/lib/payload'

export const dynamic = 'force-dynamic'

type Horaires = {
  cours?: { niveau: string; jour: string; horaire: string }[]
  transports?: { mode: string; detail: string }[]
}

const DEFAULT_HORAIRES: Required<Horaires> = {
  cours: [
    { niveau: 'Débutants', jour: 'Mercredi', horaire: '18h30 – 19h45' },
    { niveau: 'Intermédiaires', jour: 'Mercredi', horaire: '20h00 – 21h15' },
  ],
  transports: [
    { mode: 'Bus', detail: 'Ligne 32, arrêt Pont du Breucq' },
    {
      mode: 'Métro',
      detail: 'Ligne 2 rouge → Jean Jaurès → bus → Pont du Breucq',
    },
    {
      mode: 'Tramway',
      detail: 'Arrêt Planche d’Épinoy → 100m rue Jean Baptiste Bonte',
    },
  ],
}

const AccesPage = async () => {
  const cms = await tryPayload()
  let h: Horaires = DEFAULT_HORAIRES
  if (cms) {
    try {
      const g = (await cms.findGlobal({ slug: 'horaires' })) as Horaires
      h = {
        cours: g?.cours?.length ? g.cours : DEFAULT_HORAIRES.cours,
        transports: g?.transports?.length ? g.transports : DEFAULT_HORAIRES.transports,
      }
    } catch (err) {
      console.warn('[acces] findGlobal(horaires) failed:', (err as Error).message)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <h1 className="text-h1 font-display font-semibold text-text-primary">
        Se rendre aux cours
      </h1>
      <p className="mt-4 text-body text-text-secondary">
        Tous nos cours ont lieu à la salle Alfred Dequesnes, 37 Rue Jean Baptiste Bonte,
        59650 Villeneuve-d’Ascq.
      </p>

      <section className="mt-12">
        <h2 className="text-h2 font-display font-semibold text-text-primary">Horaires</h2>
        <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-surface">
          {(h.cours || []).map((c, i) => (
            <li key={i} className="flex items-center justify-between gap-4 px-6 py-4">
              <div>
                <p className="text-body font-medium text-text-primary">{c.niveau}</p>
                <p className="text-small text-text-secondary">{c.jour}</p>
              </div>
              <p className="text-small font-medium text-text-primary">{c.horaire}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-h2 font-display font-semibold text-text-primary">
          En transports en commun
        </h2>
        <ul className="mt-4 space-y-3 text-body">
          {(h.transports || []).map((t, i) => (
            <li key={i} className="rounded-lg border border-border bg-surface px-6 py-4">
              <p className="text-small font-medium uppercase tracking-wide text-text-muted">
                {t.mode}
              </p>
              <p className="mt-1 text-text-primary">{t.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default AccesPage
