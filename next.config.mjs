/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.wedding.co.tz' },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000/api/v1',
    // On Netlify, DEPLOY_PRIME_URL is the branch or preview URL and URL is the
    // production domain. Without them the localhost fallback would be baked
    // into the sitemap, robots host and OG tags at build time.
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.DEPLOY_PRIME_URL ||
      process.env.URL ||
      'http://localhost:3000',
  },
};

export default nextConfig;
