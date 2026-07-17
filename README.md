# Homestead Puppies — Modern Frontend

A responsive React frontend for the Homestead Puppies portfolio project. It
coexists with the original EJS website and reads the same live catalog through
a versioned, read-only Express API.

## Stack

- React 19 and React Router 8
- TypeScript in strict mode
- Vite 8 and Tailwind CSS 4
- Static output served by Nginx
- Existing Express/PostgreSQL backend at `/api/v1`
- Existing S3/CloudFront photo pipeline
- Existing PayPal hosted deposit button

## Local development

```bash
pnpm install
pnpm dev
```

Vite proxies `/api` to the legacy production origin by default. Copy
`.env.example` to `.env` only when you need a different public API target.

## Checks

```bash
pnpm typecheck
pnpm build
pnpm audit --prod
```

The production build is written to `build/client`. Nginx should serve that
directory and proxy `/api/` to the existing Express process.
