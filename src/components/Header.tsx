'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Accueil' },
  { href: '/danses', label: 'Bibliothèque' },
  { href: '/galerie', label: 'Galerie' },
  { href: '/acces', label: 'Accès' },
  { href: '/contact', label: 'Contact' },
]

export const Header = () => {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="Accueil — Memphis Country Club"
        >
          <Image
            src="/logo.png"
            alt="Memphis Country Club"
            width={56}
            height={56}
            priority
            className="h-12 w-12 object-contain md:h-14 md:w-14"
          />
          <span className="hidden text-h3 font-display font-semibold tracking-tight text-text-primary sm:inline">
            Memphis Country Club
          </span>
        </Link>
        <nav className="hidden gap-8 md:flex">
          {links.map((l) => {
            const active =
              pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href))
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'text-small transition-colors',
                  active
                    ? 'text-accent font-medium'
                    : 'text-text-secondary hover:text-text-primary',
                )}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>
        <button
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-md border border-border"
          onClick={() => setOpen((s) => !s)}
        >
          <span aria-hidden>{open ? '✕' : '☰'}</span>
        </button>
      </div>
      {open && (
        <div className="border-t border-border md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2">
            {links.map((l) => {
              const active =
                pathname === l.href || (l.href !== '/' && pathname.startsWith(l.href))
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'py-3 text-body',
                    active ? 'text-accent font-medium' : 'text-text-primary',
                  )}
                >
                  {l.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
