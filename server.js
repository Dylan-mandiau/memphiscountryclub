/**
 * Entry point Passenger pour o2switch (CloudLinux NodeJS Selector).
 *
 * - Passenger lance ce fichier et le surveille (zéro-downtime restart via
 *   le bouton « Restart » du panneau NodeJS Selector).
 * - PORT et HOSTNAME sont fournis par Passenger.
 * - NODE_ENV=production est défini par l'« Application mode = Production »
 *   dans le NodeJS Selector.
 *
 * Pré-requis avant démarrage en production :
 *   1. npm install        (deps prod + dev pour le build)
 *   2. npm run build      (génère .next/ — Next.js production)
 *   3. Restart app via cPanel
 *
 * En dev local : utiliser `npm run dev` (server.js n'est PAS appelé).
 */
import { createServer } from 'node:http'
import next from 'next'

const port = Number.parseInt(process.env.PORT || '3000', 10)
const hostname = process.env.HOSTNAME || '0.0.0.0'
const dev = process.env.NODE_ENV !== 'production'

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

/**
 * Derrière Apache/Passenger (o2switch), la connexion TCP Apache→Node est en
 * clair, mais le client est en HTTPS. Apache transmet X-Forwarded-Proto=https
 * pour l'indiquer. Sans ce marqueur, Next.js considère req.socket.encrypted
 * = false et :
 *   - génère des URLs en `http://` (sitemap, og:url, etc.)
 *   - écrit des cookies sans flag Secure (rejeté par les browsers modernes
 *     sur HTTPS)
 *   - peut renvoyer des Location 30x en `http://` → boucle avec le « Force
 *     HTTPS » Apache → ERR_TOO_MANY_REDIRECTS sur les POST admin Payload.
 *
 * On propage donc le scheme avant que Next/Payload ne lisent la requête.
 */
const applyTrustProxy = (req) => {
  const xfp = req.headers['x-forwarded-proto']
  // Peut être "https,http" si plusieurs proxies — on prend le premier hop.
  const proto = typeof xfp === 'string' ? xfp.split(',')[0].trim() : ''
  if (proto === 'https' && req.socket && req.socket.encrypted !== true) {
    req.socket.encrypted = true
  }
}

app.prepare().then(() => {
  createServer((req, res) => {
    applyTrustProxy(req)
    handle(req, res).catch((err) => {
      console.error('[next] handler error', err)
      if (!res.headersSent) {
        res.statusCode = 500
        res.end('Internal Server Error')
      }
    })
  }).listen(port, hostname, () => {
    console.log(
      `[memphis] Next.js (${dev ? 'dev' : 'production'}) prêt sur http://${hostname}:${port}`,
    )
  })
}).catch((err) => {
  console.error('[memphis] Échec preparation Next.js', err)
  process.exit(1)
})
