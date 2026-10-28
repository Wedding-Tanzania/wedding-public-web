/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // The card image reads its fonts from disk at request time. Name them, so
    // the serverless bundle on Netlify carries them.
    outputFileTracingIncludes: {
      '/rsvp/[token]/card.png': ['./src/app/rsvp/_card-image/fonts/**', './src/app/_invite-card/fonts/**'],
      '/rsvp/preview/[id]/card.png': ['./src/app/rsvp/_card-image/fonts/**', './src/app/_invite-card/fonts/**'],
    },
  },
  async redirects() {
    return [
      // The App Store screenshots were captured against a local demo database,
      // so the wedding page link on the "A wedding page to share" screenshot
      // names a wedding that exists nowhere. App Review may type it in: send it
      // to the store reviewer's demo wedding page on the live site instead.
      {
        source: '/amina-and-juma-b0a230',
        destination: '/neema-and-baraka-74385f',
        permanent: false,
      },
    ];
  },
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
