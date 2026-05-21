import { tryPayload } from '@/lib/payload'

export const dynamic = 'force-dynamic'

const DEFAULT_CONTACT = {
  email: 'memphiscountryclub59650@gmail.com',
  telephone: '07 69 21 08 91',
  adresse:
    'Salle Alfred Dequesnes, 37 Rue Jean Baptiste Bonte, 59650 Villeneuve-d’Ascq',
}

const ContactPage = async () => {
  const cms = await tryPayload()
  let contact = DEFAULT_CONTACT
  if (cms) {
    try {
      const g = (await cms.findGlobal({ slug: 'contact' })) as Partial<typeof DEFAULT_CONTACT>
      contact = {
        email: g.email || DEFAULT_CONTACT.email,
        telephone: g.telephone || DEFAULT_CONTACT.telephone,
        adresse: g.adresse || DEFAULT_CONTACT.adresse,
      }
    } catch {}
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-6">
      <h1 className="text-h1 font-display font-semibold text-text-primary">Contact</h1>
      <p className="mt-4 text-body text-text-secondary">
        Vous pouvez nous joindre par email ou par téléphone. Pour assister à un cours,
        rendez-vous directement à la salle Alfred Dequesnes le mercredi.
      </p>

      <dl className="mt-12 space-y-6">
        <div>
          <dt className="text-small font-medium uppercase tracking-wide text-text-muted">Email</dt>
          <dd className="mt-1 text-body text-text-primary">
            <a className="text-accent hover:underline" href={'mailto:' + contact.email}>
              {contact.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-small font-medium uppercase tracking-wide text-text-muted">Téléphone</dt>
          <dd className="mt-1 text-body text-text-primary">{contact.telephone}</dd>
        </div>
        <div>
          <dt className="text-small font-medium uppercase tracking-wide text-text-muted">Adresse</dt>
          <dd className="mt-1 text-body text-text-primary whitespace-pre-line">{contact.adresse}</dd>
        </div>
      </dl>
    </div>
  )
}

export default ContactPage
