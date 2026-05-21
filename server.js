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

app.prepare().then(() => {
  createServer((req, res) => {
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
