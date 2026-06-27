# Sanjeevani (संजीवनी)

**Health, Wellness & Care Access** — a high-end scrollytelling healthcare platform that brings care closer in **distance, cost and language**.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Framer Motion**, **three.js / WebGL**, **GSAP**, **p5.js**, HTML5 Canvas, and **Supabase** auth.

## Focus areas

1. Rural & remote healthcare
2. Maternal & child health
3. Mental health for youth
4. Medicine availability & affordability
5. Health records for mobile workers

## Features

- **Scrollytelling hero** — a scroll-scrubbed HTML5 Canvas sequence that narrates the five focus areas, with a multilingual morphing headline.
- **Immersive sections** — three.js anomaly, interactive particle "care mesh", a scroll-reveal dashboard preview, and a WebGL2 shader CTA.
- **Pricing**, **animated cinematic footer**, and a marketing landing page.
- **Care Console** (`/app`) — a real, database-backed authenticated product:
  - **Dashboard** — live stats, a 7-day consultation chart and the upcoming care queue.
  - **Records** — create / list / delete portable health records.
  - **Consults** — book, list and cancel tele-consultations (general, specialist, mental health, maternal).
  - **Medicines** — search the catalog for nearby-pharmacy stock with a cheaper **generic alternative** suggestion.
  - **Family** — add / remove members, enforcing plan limits (Individual = self, Family+ = 6, Community = unlimited).
  - **Settings** — edit profile, preferred language (8 languages) and switch plan.
- **REST API** under `/app/api/*` — every route is zod-validated and session-scoped; data isolation is enforced at the database level by Supabase **Row Level Security**.
- **Supabase authentication** — magic-link email + password signup + Google/GitHub OAuth, protected `/app/*`, with a graceful front-end mock fallback until keys are set.
- Performance-tuned: every canvas/WebGL loop pauses when off-screen.

## Getting started

```bash
npm install
cp .env.example .env.local   # then add your Supabase URL + anon key (optional)
npm run dev
```

Open <https://swathya.vercel.app/>.

### Enabling real auth + the Care Console (required for `/app`)

1. Create a project at [supabase.com](https://supabase.com).
2. Put the **Project URL** and **anon/public key** (Settings → API) into `.env.local`.
3. In Supabase → Authentication → URL Configuration, set Site URL `http://localhost:3000` and add Redirect URL `http://localhost:3000/auth/callback`.
4. **Run the schema + seed:** open Supabase → SQL Editor → New query, paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and run it. This is idempotent (safe to re-run) and creates the `profiles`, `health_profiles`, `health_records`, `consults`, `family_members` tables (all row-level-secured) plus the medicine catalog (`pharmacies`, `medicines`, `medicine_stock`) and seeds ~6 pharmacies and 15 medicines.
5. Restart the dev server, then sign up at `/signup`. (Without keys, login uses a front-end mock; the `/app` API returns `503` until the schema is run.)

> The Care Console lives under `/app`. `/dashboard` permanently redirects there.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run typecheck` — TypeScript check

## Tech stack

Next.js · React 18 · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · Framer Motion · GSAP · three.js · p5.js · canvas-confetti · @number-flow/react · Supabase (`@supabase/ssr`).
