# Homestead Puppies Modern

Modern portfolio frontend for Homestead Puppies. This project deliberately
shares the existing Express/PostgreSQL backend with the legacy EJS website
while presenting the same domain through a current React architecture.

## Stack

- React 19
- React Router 8 Framework Mode
- TypeScript with strict checking
- Vite
- Tailwind CSS
- pnpm

## Development

```bash
pnpm install
pnpm dev
```

The development server runs at `http://localhost:5173`.

Copy `.env.example` to `.env` only when you need to override the API base URL.
Variables prefixed with `VITE_` are visible in the browser and must never
contain secrets.

## Checks

```bash
pnpm typecheck
pnpm build
```

## Deployment model

The app uses React Router SPA mode with the home page pre-rendered. Production
output is written to `build/client` and is intended to be served directly by
Nginx for `homesteadpuppies.org`.

Requests to `/api/v1/*` will be proxied by Nginx to the existing Express
application. Express remains the only runtime backend.
