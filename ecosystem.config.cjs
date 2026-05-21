/**
 * PM2 — gestion du process Next.js en production sur le VPS (CDC §9.7).
 * Lancement : pm2 start ecosystem.config.cjs
 * Redémarrage : pm2 restart memphis-web
 * Logs       : pm2 logs memphis-web
 */
module.exports = {
  apps: [
    {
      name: 'memphis-web',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
