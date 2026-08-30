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
    // Same trap as NEXT_PUBLIC_SITE_URL below, hit for a second variable: the
    // localhost fallback was baked into the production bundle, so every page
    // that talks to the API tried to fetch http://localhost:4000 from an https
    // page and the browser blocked it as mixed content. The changia page
    // rendered "something went wrong" for every contributor. localhost is only
    // ever right off Netlify.
    NEXT_PUBLIC_API_BASE:
      process.env.NEXT_PUBLIC_API_BASE ??
      (process.env.NETLIFY === 'true'
        ? 'https://api-uat.wedding.co.tz/api/v1'
        : 'http://localhost:4000/api/v1'),
    // On Netlify, URL is the custom domain and DEPLOY_PRIME_URL is the per-deploy
    // address (main--site.netlify.app even on production), so production must
    // prefer URL and only previews should use DEPLOY_PRIME_URL. Without this the
    // localhost fallback gets baked into the sitemap, robots host and OG tags.
    NEXT_PUBLIC_SITE_URL:
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.CONTEXT === 'production'
        ? process.env.URL
        : process.env.DEPLOY_PRIME_URL) ||
      process.env.URL ||
      'http://localhost:3000',
  },
};

export default nextConfig;
