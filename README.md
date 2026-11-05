# Will It Come Back?

Scramble any picture with one simple rule and watch it come back.
Frontend only (Vite + TypeScript), hosted on Cloudflare Workers static assets:
https://will-it-come-back.ro1.workers.dev/

Born from a comment on the Computed video "I Zipped a Smiley 5 Times and Got 1,024 Smileys"
(https://www.youtube.com/watch?v=5Koi1DRwRUM): "make a website where we can do the same thing to an image".

## Features
- Rules: zip (perfect out-shuffle of rows and columns), Arnold's cat map, baker's map (knead), ring twist
- Rearrange: the same pixels fly into another picture (frown, heart, star, any text, or a second image)
- Exact "comes home at step P" for any size (cycle decomposition + LCM with BigInt), jump to any step (even 10^300)
- Nearby sizes table (1024 → 10 zips, 1022 → 340)
- Video export (square or 9:16) via MediaRecorder, PNG export, share link (state is in the URL)
- Secret picture: save a scrambled PNG, unscramble it with "Use exact pixels" + step back
- EN / JA, PWA, OGP, sitemap, AdSense / GA4 / Search Console tags from `.env.production`

## Develop
```bash
npm install
npm run dev
npm test        # permutation math
npm run build
npx wrangler deploy
```

`scripts/icons.mjs` renders the PNG icons from `public/icons/icon.svg` (needs Playwright).
