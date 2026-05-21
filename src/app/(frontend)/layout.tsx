import type { Metadata, Viewport } from 'next'
import { Inter, Fraunces } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { tryPayload } from '@/lib/payload'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const DEFAULT_CONTACT = {
  email: 'memphiscountryclub59650@gmail.com',
  telephone: '07 69 21 08 91',
  adresse:
    'Salle Alfred Dequesnes, 37 Rue Jean Baptiste Bonte, 59650 Villeneuve-d’Ascq',
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  title: {
    default: 'Memphis Country Club',
    template: '%s — Memphis Country Club',
  },
  description: 'Association de danse country — Villeneuve-d’Ascq, Nord (59).',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Memphis Country Club',
  },
}

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
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
    } catch {
      // garde DEFAULT_CONTACT
    }
  }

  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-dvh flex flex-col bg-background text-text-primary">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer contact={contact} />
      </body>
    </html>
  )
}

export default RootLayout
