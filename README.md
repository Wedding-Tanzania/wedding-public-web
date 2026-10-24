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

## App download page

`/app` is the smart link every invitation message carries. Phones are sent straight to their store (iPhone and iPad to the App Store, Android to Google Play once it exists); desktops see the badges and an "open in browser" link. Add `?stay=1` to keep any device on the page.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_APP_STORE_URL` | App Store listing. Defaults to `https://apps.apple.com/app/id6822616728`. |
| `NEXT_PUBLIC_PLAY_STORE_URL` | Google Play listing. Leave unset until the Play listing is live; the badge then reads "coming soon" and Android stays on the page. |

Run `npm test` for the unit tests behind the redirect and link helpers.
