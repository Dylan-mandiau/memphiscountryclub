import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'memphiscountryclub.fr' },
    ],
  },
  experimental: {
    reactCompiler: false,
  },
}

export default withPayload(nextConfig)
