import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'memphiscountryclub.fr' },
      { protocol: 'https', hostname: 'new.memphiscountryclub.fr' },
    ],
  },
  experimental: {
    reactCompiler: false,
    // Évite l'erreur EAGAIN sur o2switch (CloudLinux limite le nombre
    // de processus simultanés). Réduit la parallélisation du build.
    workerThreads: false,
    cpus: 1,
  },
  // Force Webpack à utiliser un seul worker pour respecter la limite
  // de processus du shared hosting.
  webpack: (config) => {
    config.parallelism = 1
    return config
  },
}

export default withPayload(nextConfig)
