import Link from 'next/link'

type Props = {
  contact: { email: string; telephone: string; adresse: string }
}

export const Footer = ({ contact }: Props) => {
  const telHref = 'tel:' + contact.telephone.replace(/\s/g, '')
  const mailHref = 'mailto:' + contact.email
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3 lg:px-6">
        <div>
          <p className="text-h3 font-display font-semibold text-text-primary">
            Memphis Country Club
          </p>
          <p className="mt-2 text-small text-text-secondary">
            Association de danse country — Villeneuve-d’Ascq, Nord (59).
          </p>
        </div>
        <div>
          <p className="text-small font-medium uppercase tracking-wide text-text-muted">
            Contact
          </p>
          <p className="mt-2 text-small text-text-secondary">{contact.adresse}</p>
          <p className="mt-2 text-small text-text-secondary">
            <a href={mailHref} className="hover:text-accent">
              {contact.email}
            </a>
          </p>
          <p className="text-small text-text-secondary">
            <a href={telHref} className="hover:text-accent">
              {contact.telephone}
            </a>
          </p>
        </div>
        <div>
          <p className="text-small font-medium uppercase tracking-wide text-text-muted">
            Navigation
          </p>
          <ul className="mt-2 space-y-1 text-small">
            <li>
              <Link className="text-text-secondary hover:text-accent" href="/danses">
                Bibliothèque des danses
              </Link>
            </li>
            <li>
              <Link className="text-text-secondary hover:text-accent" href="/galerie">
                Galerie
              </Link>
            </li>
            <li>
              <Link className="text-text-secondary hover:text-accent" href="/acces">
                Se rendre aux cours
              </Link>
            </li>
            <li>
              <Link className="text-text-secondary hover:text-accent" href="/contact">
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-text-muted lg:px-6">
          © {new Date().getFullYear()} Memphis Country Club — Tous droits réservés
        </p>
      </div>
    </footer>
  )
}
