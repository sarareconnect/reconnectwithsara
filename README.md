# Sara

Multi-location referral landing page management platform for enterprise
businesses. A super admin onboards enterprises, imports stores via CSV, and the
platform automatically generates a landing page, QR code, and friend card for
every store. Enterprise managers manage their own stores and offers.

## Tech stack

- **Next.js 15** (App Router, Server Actions, API Routes) · React 19 · TypeScript
- **Tailwind CSS** + **shadcn/ui**
- **PostgreSQL** (Neon) via **Prisma**
- **qrcode** (QR generation) · **@napi-rs/canvas** (friend cards) · **JSZip** (bulk ZIP)
- **Zod** (validation) · **TanStack Table** (data tables)
- Deploy target: **Netlify**

## User types

| Role                 | Auth | Capabilities                                                                 |
| -------------------- | ---- | --------------------------------------------------------------------------- |
| `SUPER_ADMIN`        | Yes  | Create/edit/delete enterprises, import CSV, generate & download assets       |
| `ENTERPRISE_MANAGER` | Yes  | View/edit own stores, bulk offers, download QR/friend cards & ZIPs           |
| End customer         | No   | View a store landing page only (`/store/[slug]`)                             |

There is no public registration. Only the super admin creates enterprise
accounts and assigns credentials.

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#   → set DATABASE_URL / DIRECT_URL (Neon), AUTH_SECRET, SUPER_ADMIN_* vars

# 3. Create the database schema
npm run db:push        # or: npm run db:migrate for migration history

# 4. Seed the super admin account
npm run db:seed

# 5. Run
npm run dev            # http://localhost:3000
```

Sign in at `/login` with the `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`
values. Enterprise managers sign in with the username/password assigned when
their enterprise was created.

## Architecture

### Landing pages — dynamic, never static

Landing pages are served by a single dynamic route, `src/app/store/[slug]`,
which reads the slug, queries the database, and renders the design. No
per-store HTML is generated, so the platform scales from 10 to 100,000+ stores
without producing individual pages.

### Assets — generated on demand

QR codes and friend cards are produced by API routes and never stored as
per-store files:

- `GET /api/stores/[id]/qr` → PNG QR code pointing at `/store/[slug]`
- `GET /api/stores/[id]/friend-card` → PNG friend card (replicates the template)

Bulk downloads stream a ZIP built in-memory:

- `GET /api/enterprises/[id]/qr-zip` (optional `?ids=` to scope to a selection)
- `GET /api/enterprises/[id]/friendcards-zip`
- `GET /api/enterprises/[id]/export` → CSV export

The `qr_code_path` / `friend_card_path` columns record the logical storage
paths (`/enterprise/{id}/qrs/{slug}.png`, …) for traceability.

> **Fonts:** to match the friend-card template exactly, drop `script.ttf` and
> `sans-bold.ttf` into `public/fonts/`. The generator falls back to system
> fonts when they are absent so it never fails in a fresh environment.

### CSV import

`store_name` is the only required column. Header names are normalised
(`Store Name`, `storename`, `name` → `store_name`, etc.). Benefits and custom
buttons accept delimited cells:

- `benefits`: `VISIT THE STORE; SHOW THE CARD AT CHECKOUT`
- `custom_buttons`: `Label=https://url; Label2=https://url2`

Slugs are generated from `city` + `store_name` and made globally unique.
See `samples/stores-sample.csv`.

### Security

- bcrypt password hashing (cost 12)
- Signed JWT session in an httpOnly, SameSite cookie (`jose`)
- Route protection via `src/middleware.ts` with role-based access control
- Server-side tenant isolation on every store/enterprise action
- Fixed-window rate limiting on login

## Deployment (Netlify)

1. Push the repo to Git and create a Netlify site from it.
2. Add the environment variables from `.env.example` in the Netlify UI.
3. The included `netlify.toml` wires up `@netlify/plugin-nextjs`, the Prisma
   binary target, and the native canvas module.
4. Run `npm run db:deploy` against your production database (e.g. via a deploy
   hook or locally with the production `DATABASE_URL`).

## Project layout

```
src/
  app/
    admin/                 Super admin console (enterprise CRUD, import, assets)
    dashboard/             Enterprise manager dashboard (stores, offers, assets)
    store/[slug]/          Public landing page (replicates the reference design)
    api/                   QR, friend card, ZIP, and CSV export endpoints
    login/                 Authentication
  components/              UI, dashboard, admin, store, and landing components
  lib/
    actions/               Server actions (auth, enterprises, stores, import)
    assets/                QR + friend card generation
    auth/                  Sessions, password hashing, guards, rate limiting
    queries/               Read models (paginated store listing, metrics)
    csv.ts, slug.ts, validation.ts, ...
prisma/
  schema.prisma            Database schema
  seed.ts                  Super admin seeding
```
