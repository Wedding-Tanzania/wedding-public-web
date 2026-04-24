# wedding-public-web

Public-facing website for Wedding.co.tz. Next.js 14 (App Router), TypeScript, Tailwind CSS.

Surfaces requiring SSR/ISR for SEO and WhatsApp OG previews:

- `/` marketing home
- `/vendors`, `/vendors/[slug]`
- `/[coupleSlug]` public couple Story Page (with dynamic OG image)
- `/themes/[theme]` (Phase 1 additive)

## Run

```bash
cp .env.example .env.local
npm install
npm run dev   # http://localhost:3000
```

Point `NEXT_PUBLIC_API_BASE` at a running `wedding-api` instance (`http://localhost:4000/api/v1` by default).

## Brand tokens

Imported from `../tokens.json`. Tailwind config extends with primary `#A80754`, secondary `#1D2040`, and DM Sans.
